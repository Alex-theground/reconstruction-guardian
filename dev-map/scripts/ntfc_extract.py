"""서울도시계획포털 결정고시에서 구역별 새 고시를 찾고, 첨부 고시문 PDF에서 계획 수치를 뽑는다.

흐름:
  1) 결정고시 목록 (POST urban.seoul.go.kr/ntfc/getNtfcList.json): 처음엔 2010년부터 전부,
     다음부터는 캐시의 마지막 고시일 30일 전부터만 받아 합친다 (scripts/.cache/ntfc/index.json).
  2) 구역 연결: zones.geojson의 구역명·사업장명, plans.csv의 단지명에서 지명+번호를 뽑아
     고시 제목과 맞춘다. 번호 뒤에 숫자가 이어지면(장위1 ↔ 장위14) 다른 구역으로 본다.
     구청 고시는 같은 자치구일 때만 쓴다.
  3) 새 고시 판단: plans.csv 행의 note·source_url에 적힌 고시번호보다 늦은 고시만 '새 고시'로 본다.
     적힌 고시번호가 없으면 --since 이후 고시를 모두 새 고시로 본다.
  4) 수치 추출: 새 고시의 첨부 PDF를 받아 pdftotext -layout으로 읽고, 구역명이 처음 나오는 곳부터
     용적률(상한·법적상한 우선), 최고층수, 높이(m), 세대수, 동수를 찾는다. 글자가 거의 없는
     스캔본은 '스캔본'으로 표시만 한다(이미지로 렌더링해 사람이 읽어야 함).

결과: scripts/ntfc_report.md (사람이 읽는 보고서), scripts/ntfc_candidates.csv (구역별 후보 값).
plans.csv는 바꾸지 않는다. 보고서를 확인한 뒤 --apply ID[,ID…]로 그 구역의 추출 값을 넣을 수 있다
(이때 변경안 alt는 지우고 note 앞에 [자동 추출 고시번호]를 붙인다).

사용:
  python3 scripts/ntfc_extract.py                     # 목록 갱신 + 새 고시 찾기 + PDF 추출
  python3 scripts/ntfc_extract.py --since 2026-01-01  # 고시번호가 없는 행은 이 날짜 이후만
  python3 scripts/ntfc_extract.py --only-alt          # 변경안(alt)이 있는 구역만 (변경 결정 고시 추적)
  python3 scripts/ntfc_extract.py --apply 11410AGZ202411040001
"""
import argparse
import csv
import datetime as dt
import json
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_seoul import CIRCLED  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / ".cache" / "ntfc"
INDEX = CACHE / "index.json"
ZONES = ROOT / "web" / "data" / "zones.geojson"
PLANS = ROOT / "scripts" / "plans.csv"
REPORT = ROOT / "scripts" / "ntfc_report.md"
CANDS = ROOT / "scripts" / "ntfc_candidates.csv"
API = "https://urban.seoul.go.kr/ntfc/getNtfcList.json"
FILE_BASE = "https://urban.seoul.go.kr/"
UA = {"User-Agent": "Mozilla/5.0 (dev-map data pipeline)"}

# 정비사업과 관련 있는 고시만 본다 (목동·압구정·존치관리구역은 지구단위계획 고시로 나온다)
RELEVANT = re.compile(r"정비|재건축|재개발|재정비촉진|도시환경|주거환경|지구단위|특별계획구역")
# 리모델링·모아타운, 구역 안 공원·도로 같은 도시계획시설 고시는 계획 수치가 없다 ('효창공원앞역세권'은 남겨야 해서 '공원'만으로는 빼지 않는다)
IRRELEVANT = re.compile(r"리모델링|모아타운|소규모주택정비 관리계획|조성계획|실시계획|도시계획시설|행위제한")
# 고시 코드 앞 5자리는 고시한 기관(11000 서울시). 구청 고시는 같은 자치구 구역에만 붙인다.
# 서울시 고시도 구청이 올린 것은 구청 코드로 시작한다
GU_CODE = dict(zip(
    "종로구 중구 용산구 성동구 광진구 동대문구 중랑구 성북구 강북구 도봉구 노원구 은평구 서대문구 마포구 "
    "양천구 강서구 구로구 금천구 영등포구 동작구 관악구 서초구 강남구 송파구 강동구".split(),
    "11110 11140 11170 11200 11215 11230 11260 11290 11305 11320 11350 11380 11410 11440 "
    "11470 11500 11530 11545 11560 11590 11620 11650 11680 11710 11740".split()))
GU_PREFIX = r"(?:" + "|".join(GU_CODE) + r")\s+(?=\S)"
KEEP = ("noticeCode", "noticeNo", "noticeDate", "title", "content")


def post(body, tries=4):
    data = json.dumps(body).encode()
    for i in range(tries):
        try:
            req = urllib.request.Request(API, data=data, headers={**UA, "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read())
        except Exception as e:  # 포털이 가끔 연결을 끊는다
            if i == tries - 1:
                raise
            print(f"  다시 시도 ({e})")
            time.sleep(2 ** (i + 1))


def slim(c):
    x = {k: c.get(k) for k in KEEP}
    x["org"] = (c.get("siteCd") or {}).get("siteName") or ""
    img = c.get("tnNtfcImage") or {}
    x["pdf"] = f"{img['aImagePath']}/{img['aImageName']}" if img.get("aImagePath") and img.get("aImageName") else ""
    x["content"] = (x["content"] or "")[:600]
    return x


def update_index(refresh):
    CACHE.mkdir(parents=True, exist_ok=True)
    idx = {} if refresh or not INDEX.exists() else json.loads(INDEX.read_text(encoding="utf-8"))
    if idx:
        last = max(v["noticeDate"][:10] for v in idx.values())
        bgn = (dt.date.fromisoformat(last) - dt.timedelta(days=30)).isoformat()
    else:
        bgn = "2010-01-01"
    end = dt.date.today().isoformat()
    print(f"결정고시 목록 받는 중: {bgn} ~ {end}")
    page, pages = 1, 1
    while page <= pages:
        d = post({"keywordList": [], "srchType": "title", "bgnDate": bgn, "endDate": end, "pageNo": page, "pageSize": 500})
        pages = d["totalPages"]
        for c in d["content"]:
            idx[c["noticeCode"]] = slim(c)
        print(f"  {page}/{pages}쪽 (누적 {len(idx)}건)")
        page += 1
        INDEX.write_text(json.dumps(idx, ensure_ascii=False), encoding="utf-8")
    return list(idx.values())


# ---------- 구역 ↔ 고시 연결 ----------

def norm(x, keep_je=False):
    """지명+번호만 남긴다: '서울특별시 강북구 미아제3구역 주택재개발' → '미아3'.
    지운 말 자리에 숫자가 양쪽에 있으면 '|'를 남긴다('1구역 제5지구' → '1|5', '창신1,2,3' → '창신1|2|3').
    '홍제3'의 '제'도 지워지지만 구역명과 제목을 같은 규칙으로 바꾸므로 '홍3'끼리 맞는다."""
    x = "".join(CIRCLED.get(ch, ch) for ch in str(x or ""))
    x = re.sub(r"\((?:가칭|신속통합기획|구\s*[^)]*)\)", "", x)
    x = re.sub(r"(서울특별시|서울시)", "", x)
    x = re.sub(GU_PREFIX, "", x)  # '강북구 미아제3구역' (자치구 이름만; '아파트지구 '를 지우면 안 된다)
    if not keep_je:
        x = re.sub(r"제\s*(?=\d)", "", x)
    x = re.sub(r"(\d)\s*[-~]\s*(?=\d)", r"\1-", x)
    x = re.sub(r"(도시정비형|주택정비형|장기전세주택|조합설립|추진위원회|도시환경|재정비촉진|재건축|재개발|정비|사업|조합|"
               r"주택|구역|지구|아파트|소규모|가로|번지|일대|일원|외\s*\d+\s*필지|[\s·,._()\[\]「」『』])+", "|", x)
    return re.sub(r"(?<!\d)\||\|(?!\d)", "", x)


def aliases(z, plan):
    out = set()
    names = [z.get("zone_name"), z.get("name"), plan.get("complex_name")]
    # '효창공원앞역세권(효창동 5-307일원) …'은 괄호 앞뒤를 따로 쓴다
    names += [p for v in names if v and "(" in v for p in re.split(r"[()]", v) if p.strip() not in ("신속통합기획", "가칭")]
    for v in names:
        a = norm(v)
        # '도시환경정비사업구역'처럼 지명이 없으면 쓸 수 없다. 두 글자 이하 지명도 너무 흔하다('홍제3'은 '홍3'이 되므로 '제'를 남긴 길이로 본다)
        k = norm(v, True)
        # 두 글자 단지명('은마아파트', '영천구역')은 원래 이름에서 바로 뒤에 아파트·구역이 올 때만 쓴다
        short = len(k) == 2 and re.fullmatch(r"[가-힣]{2}", k) and re.search(k + r"\s*(아파트|구역)", str(v))
        if a and (short or len(k) >= 3 and (re.search(r"[가-힣]{2,}", k) or re.search(r"[가-힣]\d*동\d", k))):
            out.add(a)
        # 지명 + 첫 번호: '압구정아파트지구 특별계획구역2' → '압구정2', '신길10재정비촉진구역 …(한국토지신탁)' → '신길10'
        stem = re.match(r"[가-힣]+", a)
        # 번호가 둘 이상이면('마포로1구역 제10지구') 첫 번호만으로는 다른 지구와 섞이므로 쓰지 않는다
        ns = re.findall(r"\d+(?:-\d+)*", re.sub(r"\(.*?\)", "", "".join(CIRCLED.get(ch, ch) for ch in str(v or ""))))
        # 단, '창신1 … 재개발구역 1-6'처럼 둘째 번호가 첫 번호의 획지면 첫 번호로 찾는다('창신1,2,3,4구역' 고시)
        sub = len(ns) == 2 and ns[1].startswith(ns[0] + "-")
        n = re.match(r".*", ns[0]) if len(ns) == 1 or sub else None
        if stem and n and len(norm(stem.group(0) + n.group(0), True)) >= 3:
            out.add(stem.group(0).rstrip("동") + n.group(0) if stem.group(0).endswith("아파트") else stem.group(0) + n.group(0))
    # '압구정아파트지구 특별계획구역2' → '압구정2' (고시 제목은 '압구정 2구역')
    sp = re.match(r"([가-힣]+?)(?:아파트지구|지구)\s*특별계획구역\s*(\d+)", str(z.get("zone_name") or ""))
    if sp:
        out.add(sp.group(1) + sp.group(2))
    # 지번형 구역('미아동 130번지 일대')은 '미아동130'으로도 찾는다. 번호 있는 별칭이 없을 때도 쓴다('서계 통합구역' → '서계동33')
    j = re.match(r"(\S+[동가로])\s*(\d+(?:-\d+)?)", str(z.get("jibun") or ""))
    if j and (re.search(r"\d", z.get("zone_name") or "") or not any(re.search(r"\d", x) for x in out)):
        out.add(j.group(1) + j.group(2))
    return out


def fallback_aliases(als):
    """고시를 하나도 못 찾은 구역만: 앞의 '○○동'을 뗀 단지명('고척동산업인' → '산업인'),
    부번을 뗀 지번('서계동33-5' → '서계동33', 고시 제목은 '서계동 33번지 일대').
    '방배동신동아' → '신동아'처럼 다른 동 단지와 섞일 수 있어 다른 별칭이 모두 빗나갔을 때만 쓴다."""
    out = set()
    for a in als:
        m = re.match(r"[가-힣]+?동(?=[가-힣]{3,})", a)
        if m:
            out.add(a[m.end():])
        m = re.fullmatch(r"([가-힣]+[동가])(\d+)-\d+", a)
        if m:
            out.add(m.group(1) + m.group(2))
    return out - set(als)


def title_norm(title):
    """정규화한 제목. '영등포 대선제분 일대 … 1,2 정비구역 … - 제1구역 1지구 …'처럼 지명과 지구 번호가
    떨어져 있으면 '영등포대선제분1|1'을 덧붙인다."""
    t = norm(title)
    m = re.match(r"(.+?)\s*일대.*?제\s*(\d+)\s*구역\s*제?\s*(\d+)\s*지구", title or "")
    if m:
        t += " " + norm(f"{m.group(1)}{m.group(2)}구역 제{m.group(3)}지구")
    return t


def other_site(title, jibun):
    """제목 괄호 속 지번이 같은 동의 다른 본번이면 다른 부지다: '신길역세권(신길동 96-24번지 일대)' ↔ 구역 지번 '신길동 39-3'."""
    z = re.match(r"([가-힣]+동\d*가?)\s*(\d+)", jibun or "")
    if not z:
        return False
    for m in re.finditer(r"\(\s*([가-힣]+동\d*가?)\s*(\d+)(?:-\d+)?\s*(?:번지)?", title or ""):
        if m.group(1) == z.group(1) and m.group(2) != z.group(2):
            return True
    return False


def hit(alias, text, raw=None):
    """alias가 정규화한 text 안에 있고, 바로 뒤에 숫자가 이어지지 않는다(장위1 ↔ 장위14).
    raw(원문 제목)를 주면 지명 앞에 다른 글자가 붙어 있지 않은지도 본다('가락삼익맨숀' ↔ '삼익맨숀')."""
    ok = False
    for m in re.finditer(re.escape(alias), text):
        nxt = text[m.end():m.end() + 1]
        if alias[-1].isdigit() and (nxt.isdigit() or nxt == "-"):
            continue
        if not alias[-1].isdigit() and nxt.isdigit():
            continue  # '영천' ↔ '영천1 주거환경개선'
        prev = text[m.start() - 1:m.start()]
        if alias[0].isdigit() and prev.isdigit():
            continue
        ok = True
        break
    if not ok or raw is None:
        return ok
    stem = re.match(r"[가-힣]+", alias)
    if not stem:
        return True
    stem = stem.group(0)
    return any(not re.match(r"[가-힣]", raw[m.start() - 1:m.start()]) or raw[m.start() - 1] in "동"
               for m in re.finditer(stem, raw)) or stem not in raw


def cuzin_key(z):
    """'노량진3 재정비촉진구역' → ('노량진', '3'). 촉진구역 고시는 '노량진재정비촉진지구 재정비촉진계획 변경'처럼
    지구 이름으로 나오는 일이 많아 지구 이름과 구역 번호를 따로 쓴다. '신정1재정비촉진구역3지구'처럼
    구역 안 지구는 지구 전체 표 값이 맞지 않으므로 쓰지 않는다."""
    s = "".join(CIRCLED.get(ch, ch) for ch in f"{z.get('zone_name')} {z.get('name')}")
    m = re.search(r"([가-힣]+)\s*(\d+(?:-\d+)?)\s*(?:구역\s*)?(?:재정비)?촉진\s*구역(?!\s*\(?\s*제?\s*\d+\s*지구)", s)
    if not m:
        return None
    stem = m.group(1)
    if len(stem) >= 3 and stem.endswith("제"):  # '미아제3' → '미아' ('홍제2'는 그대로)
        stem = stem[:-1]
    return stem, m.group(2)


def jigu_hit(key, title):
    """지구 이름으로 나온 촉진계획 고시가 이 구역 것인지: 제목에 '노량진재정비촉진지구'가 있고,
    괄호에 다른 구역('(상계5구역)', '(긴등마을)')이 적혀 있지 않아야 한다."""
    stem, no = key
    t = re.sub(r"\s", "", title or "")
    if not re.search(re.escape(stem) + r"(?:재정비)?촉진지구", t):
        return False
    t = "".join(CIRCLED.get(ch, ch) for ch in t)
    for p in re.findall(r"\(([^)]*)\)", t):
        if not re.search(r"구역|마을|지구", p) or re.search(r"경미", p) and not re.search(r"구역|마을", p):
            continue
        nos = re.findall(r"(?<![\d-])(\d+(?:-\d+)*)(?:재정비)?(?:촉진)?구역", p)
        if no not in nos:
            return False
    # 괄호 밖에 구역 번호가 적힌 제목('노량진7재정비촉진구역 …')도 다른 구역이면 뺀다
    nos = re.findall(re.escape(stem) + r"(\d+(?:-\d+)*)(?:재정비)?(?:촉진)?구역", re.sub(r"\([^)]*\)", "", t))
    return not nos or no in nos


def cuzin_row(text, key):
    """촉진지구 고시의 구역별 표('재정비촉진사업별 용적률·건폐율 및 높이계획', 주택 평형 배분표)에서
    이 구역 줄만 읽는다. 줄이 여러 줄로 나뉜 표('-/' 다음 줄에 '49층(150m)이하')는 앞뒤 한 줄까지 본다."""
    stem, no = key
    lines = text.splitlines()
    row = re.compile(r"^\s*" + re.escape(stem) + r"\s*제?\s*" + re.escape(no) + r"(?![\d-])\s*(?:구역)?\s*(?:재정비)?촉진\s*구역")
    other = re.compile(r"^\s*" + re.escape(stem) + r"\s*제?\s*\d")
    out = {"far": None, "max_floors": None, "height_m": None, "units": None, "buildings": None}
    for i, ln in enumerate(lines):
        if not row.match(ln):
            continue
        rest = ln[row.match(ln).end():]
        win = [rest]
        for j in (i - 1, i + 1):
            if 0 <= j < len(lines) and not other.match(lines[j]) and lines[j].strip():
                win.append(lines[j])
        w = " ".join(win)
        # 건축계획 표: 면적 다음 '50이하 … 300이하 …' 중 100% 이상이 상한용적률, '33층(110m)이하'가 최고층
        caps = [num(x) for x in re.findall(r"(\d{2,4}(?:\.\d+)?)\s*(?:%\s*)?이하", rest)]
        fl = re.search(r"(\d{1,2})\s*층\s*\(\s*(\d{2,3}(?:\.\d+)?)\s*m\s*\)", w)
        if out["far"] is None and any(100 <= c <= 2000 for c in caps) and re.search(r"\d{1,3},\d{3}\.\d", rest):
            out["far"] = max(c for c in caps if 100 <= c <= 2000)
            if fl:
                out["max_floors"], out["height_m"] = int(fl.group(1)), num(fl.group(2))
            continue
        # 주택 배분표: 구역명 바로 뒤 첫 수가 합계 세대수. 부분임대가 있으면 합계·소계가 윗줄에 따로 찍혀
        # 이 줄의 첫 수는 60㎡ 이하 열이다 → 윗줄 첫 수가 이 줄 첫 수보다 왼쪽(앞 열)에 있으면 윗줄 값을 쓴다
        if out["units"] is None and "이하" not in rest:
            pat = r"(\d{1,2},\d{3}|\d{2,5})(?![\d.,])"
            m = re.match(r"\s*(?:\(\d+\)\s*)*" + pat, rest)
            up = lines[i - 1] if i > 0 and not other.match(lines[i - 1]) else ""
            mu = re.match(r"\s*" + pat, up) if re.fullmatch(r"[\s\d,()\[\]]+", up or "x") else None
            col = len(ln) - len(rest) + m.start(1) if m else len(ln)
            if mu and mu.start(1) < col - 3:
                m = mu
            elif m and re.match(r"\s*\(", rest):
                m = None  # 부분임대 '(32)' 다음 수는 합계가 아니다
            if m and 20 <= num(m.group(1)) <= 15000:
                out["units"] = num(m.group(1))
    return out


def notice_key(no):
    """'2025-352' → (2025, 352)"""
    m = re.match(r"(\d{4})-(\d+)", no or "")
    return (int(m.group(1)), int(m.group(2))) if m else None


CITED = re.compile(r"(?:제\s*)?((?:19|20)\d{2})\s*-\s*(\d{1,4})\s*호")


def cited_notices(row):
    s = " ".join(urllib.parse.unquote(row.get(k) or "") for k in ("note", "source_url"))
    return {(int(a), int(b)) for a, b in CITED.findall(s)}


# ---------- 고시문 PDF에서 수치 뽑기 ----------

def pdf_text(n):
    """첨부 PDF를 받아 텍스트로 바꾼다. 실패하면 None, 스캔본이면 ''."""
    if not n["pdf"]:
        return None
    pdf = CACHE / "pdf" / f"{n['noticeCode']}.pdf"
    txt = pdf.with_suffix(".txt")
    if txt.exists():
        return txt.read_text(encoding="utf-8")
    pdf.parent.mkdir(parents=True, exist_ok=True)
    if not pdf.exists():
        url = FILE_BASE + urllib.parse.quote(n["pdf"])
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300) as r:
                pdf.write_bytes(r.read())
        except Exception as e:
            print(f"  PDF 받기 실패 {n['noticeNo']}: {e}")
            return None
    r = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True)
    t = r.stdout if r.returncode == 0 else ""
    if len(re.sub(r"\s", "", t)) < 300:
        t = ""
    txt.write_text(t, encoding="utf-8")
    return t


def num(s):
    return float(s.replace(",", ""))


def section(text, als):
    """여러 구역을 한꺼번에 고시한 문서에서 이 구역 부분만: 본문(제목 다음)에서 구역명이 처음 나오는 줄부터 끝까지."""
    lines = text.splitlines()
    for i, ln in enumerate(lines[5:], 5):
        n = norm(ln)
        if any(hit(a, n) for a in als):
            return "\n".join(lines[i:])
    return text


def extract(text):
    t = re.sub(r"[ \t]+", " ", text)
    far, far_all = None, []
    for m in re.finditer(r"용적률[^\n%]{0,60}?(\d{2,4}(?:\.\d+)?)\s*%", t):
        v = num(m.group(1))
        if 50 <= v <= 2000:
            far_all.append(v)
    # 기준·허용·상한·법적상한 중 가장 큰 값(법적상한)을 쓴다. 변경 전후가 함께 있으면 둘 다 far_all에 남는다
    far = max(far_all) if far_all else None
    # 최고층수: '최고 35층', '35층 이하'. '지상 4층'은 경로당·어린이집 같은 부대시설에도 쓰여 10층 이상만 본다
    floors = []
    # '5층이하'는 용도 배치 조건(비주거 5층 이하 설치)에도 쓰여, 앞에 높이·층수가 있을 때만 본다
    for m in re.finditer(r"최고\s*(?:층수)?\s*:?\s*(?:지상)?\s*(\d{1,2})\s*층|(?:높이|층수)[^\n]{0,25}?(\d{1,2})\s*층\s*이하"
                         r"|(?<!\d)([1-8]\d)\s*층\s*이하", t):
        if "평균" in t[max(0, m.start() - 6):m.end()]:
            continue  # '평균층수 18층 이하'는 최고층수가 아니다
        floors.append(int(m.group(1) or m.group(2) or m.group(3)))
    if not floors:
        floors = [int(m.group(1)) for m in re.finditer(r"지상\s*(\d{1,2})\s*층", t) if int(m.group(1)) >= 10]
    floors = [f for f in floors if 3 <= f <= 80]
    heights = [num(m.group(1)) for m in re.finditer(r"(\d{2,3}(?:\.\d+)?)\s*m\s*이하", t)]
    # 세대수: '주택공급계획 : 1,324세대', '총 1,121세대'의 마지막 값(변경 후)을 먼저 쓴다.
    # 부대시설 기준표의 '1,000~1,500세대 미만' 같은 범위는 뺀다
    total = re.findall(r"(?:주택\s*공급\s*계획|건립\s*세대수|전체\s*세대수|총\s*세대수)\s*[:：]?\s*(?:총\s*)?(\d{1,2},\d{3}|\d{2,5})\s*세대", t)
    total = [num(total[-1])] if total else [
        num(m.group(1)) for m in re.finditer(r"(?<!증\) )(?<!감\) )(?:총|합\s*계|계)\s*[:：]?\s*(\d{1,2},\d{3}|\d{2,5})\s*세대", t)]
    units = [num(m.group(1)) for m in re.finditer(r"(?<![\d.,~])(\d{1,2},\d{3}|\d{2,5})\s*세대(?!\s*(?:미만|이상|당))", t)
             if not re.search(r"[~∼]\s*$", t[max(0, m.start() - 2):m.start()])]
    units = [u for u in units if 20 <= u <= 15000]
    if total:
        units = [max(total)]
    bldg = [int(m.group(1)) for m in re.finditer(r"(\d{1,3})\s*개\s*동", t)]
    return {
        "far": far, "far_all": sorted(set(far_all)),
        "max_floors": max(floors) if floors else None, "floors_all": sorted(set(floors)),
        "height_m": max(heights) if heights else None,
        "units": max(units) if units else None,
        "buildings": max(bldg) if bldg else None,
    }


# ---------- main ----------

def fmt(v):
    if v is None or v == "":
        return "-"
    v = float(v)
    return f"{v:g}" if v != int(v) else f"{int(v):,}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--refresh", action="store_true", help="고시 목록을 처음부터 다시 받기")
    ap.add_argument("--offline", action="store_true", help="고시 목록을 새로 받지 않고 캐시만 쓰기")
    ap.add_argument("--since", default="2024-01-01", help="고시번호가 적혀 있지 않은 행은 이 날짜 이후 고시만 새 고시로 본다")
    ap.add_argument("--only-alt", action="store_true", help="변경안(alt)이 있는 구역만")
    ap.add_argument("--no-pdf", action="store_true", help="PDF를 받지 않고 고시 목록만 맞춘다")
    ap.add_argument("--apply", help="쉼표로 구분한 구역 id: ntfc_candidates.csv의 추출 값을 plans.csv에 넣는다")
    a = ap.parse_args()

    if a.apply:
        return apply(a.apply.split(","))

    notices = json.loads(INDEX.read_text(encoding="utf-8")).values() if a.offline else update_index(a.refresh)
    notices = [n for n in notices if RELEVANT.search(n["title"] or "") and not IRRELEVANT.search(n["title"] or "")]
    for n in notices:
        n["ntitle"] = title_norm(n["title"])
    print(f"정비 관련 고시 {len(notices)}건")

    zones = [f["properties"] for f in json.loads(ZONES.read_text(encoding="utf-8"))["features"]]
    with open(PLANS, encoding="utf-8-sig") as f:
        plans = {r["id"]: r for r in csv.DictReader(f)}

    results = []
    for z in zones:
        plan = plans.get(z["id"], {})
        if a.only_alt and not plan.get("alt"):
            continue
        als = aliases(z, plan)
        zcode = GU_CODE.get(z.get("gu"))
        cuzin = "촉진" in f"{z.get('zone_name')} {z.get('name')}"
        def match(als):
            return [n for n in notices
                    if any(hit(al, n["ntitle"], n["title"]) for al in als)
                    and n["noticeCode"][:5] in ("11000", zcode or n["noticeCode"][:5])
                    and not other_site(n["title"], z.get("jibun"))
                    # '미아3재정비촉진구역'과 '미아제3주택재개발'은 다른 구역이다
                    and not (cuzin and "촉진" not in n["title"])]
        found = match(als)
        if not found and fallback_aliases(als):
            als |= fallback_aliases(als)
            found = match(als)
        # 지구 이름으로 나온 촉진계획 고시('노량진재정비촉진지구 재정비촉진계획 변경')는 구역별 표에서 읽는다
        ckey = cuzin_key(z) if cuzin else None
        jigu = set()
        if ckey:
            seen = {n["noticeCode"] for n in found}
            for n in notices:
                if (n["noticeCode"] not in seen and n["noticeCode"][:5] in ("11000", zcode or n["noticeCode"][:5])
                        and jigu_hit(ckey, n["title"])):
                    found.append(n)
                    jigu.add(n["noticeCode"])
        cited = cited_notices(plan)
        # 적힌 고시의 고시일을 찾고, 그보다 늦은 고시만 새 고시로 본다. 목록에서 못 찾으면 고시 연도로 비교
        cited_dates = [n["noticeDate"][:10] for n in found if notice_key(n["noticeNo"]) in cited]
        last = max(cited_dates) if cited_dates else (f"{max(cited)[0]}-01-01" if cited else a.since)
        new = [n for n in sorted(found, key=lambda n: n["noticeDate"], reverse=True)
               if notice_key(n["noticeNo"]) not in cited and n["noticeDate"][:10] > last]
        results.append({"z": z, "plan": plan, "als": sorted(als), "found": found, "new": new, "cited": sorted(cited),
                        "ckey": ckey, "jigu": jigu})

    rows = []
    for r in results:
        for n in r["new"]:
            ex = {}
            if not a.no_pdf:
                t = pdf_text(n)
                if t is None:
                    ex = {"status": "PDF 없음"}
                elif t == "":
                    ex = {"status": "스캔본"}
                elif n["noticeCode"] in r["jigu"]:
                    ex = cuzin_row(t, r["ckey"])
                    ex["status"] = "추출" if any(ex.get(k) for k in ("far", "max_floors", "units")) else "수치 없음"
                else:
                    ex = extract(section(t, r["als"]))
                    ex["status"] = "추출" if any(ex.get(k) for k in ("far", "max_floors", "units")) else "수치 없음"
            n["ex"] = ex
            p = r["plan"]
            rows.append({
                "id": r["z"]["id"], "zone": label(r["z"]), "gu": r["z"].get("gu"),
                "notice_no": n["noticeNo"], "notice_date": n["noticeDate"][:10], "org": n["org"],
                "title": n["title"], "pdf_url": FILE_BASE + urllib.parse.quote(n["pdf"]) if n["pdf"] else "",
                "status": ex.get("status", ""),
                "far": ex.get("far"), "max_floors": ex.get("max_floors"), "units": ex.get("units"),
                "buildings": ex.get("buildings"), "height_m": ex.get("height_m"),
                "far_all": " ".join(fmt(v) for v in ex.get("far_all", [])),
                "floors_all": " ".join(str(v) for v in ex.get("floors_all", [])),
                "cur_far": p.get("far", ""), "cur_max_floors": p.get("max_floors", ""), "cur_units": p.get("units", ""),
                "has_alt": "Y" if p.get("alt") else "",
                "stage": r["z"].get("stage_name", ""),
                "source": "지구 표" if n["noticeCode"] in r["jigu"] else "",
            })

    with open(CANDS, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else ["id"])
        w.writeheader()
        w.writerows(rows)
    write_report(results, rows, a)
    hits = {r["id"] for r in rows}
    print(f"새 고시가 있는 구역 {len(hits)}곳, 고시 {len(rows)}건 → {REPORT.relative_to(ROOT)}, {CANDS.relative_to(ROOT)}")


def label(z):
    """'주택재건축사업'처럼 지명 없는 고시 구역명이면 사업장명을 쓴다."""
    zn = z.get("zone_name") or ""
    return zn if re.search(r"[가-힣]{2,}", norm(zn)) else (z.get("name") or zn)


def changed(r):
    """추출 값이 plans.csv 값과 다른 항목."""
    out = []
    for k, label in (("far", "용적률"), ("max_floors", "최고층"), ("units", "세대수")):
        v, cur = r[k], r["cur_" + k]
        if v in (None, ""):
            continue
        if cur in ("", None) or abs(float(cur) - float(v)) > 0.05:
            out.append(f"{label} {fmt(cur)}→{fmt(v)}")
    # 관리처분 이후(분양·착공)는 설계가 정해져 있어 고시의 'N층 이하'·법적상한은 실제보다 높을 수 있다
    if out and r.get("stage") in ("관리처분인가", "착공"):
        out.append("⚠ 관리처분 이후: 고시값은 상한일 수 있어 분양 공고 층수 우선")
    return out


def write_report(results, rows, a):
    by_id = {}
    for r in rows:
        by_id.setdefault(r["id"], []).append(r)
    today = dt.date.today().isoformat()
    lines = [f"# 결정고시 자동 추출 보고서 ({today})", "",
             "plans.csv에 적힌 고시번호보다 늦은 고시(적힌 번호가 없으면 "
             f"{a.since} 이후)를 구역별로 모았습니다. 수치는 고시문 PDF에서 정규식으로 뽑은 후보값이라, "
             "원문을 확인한 뒤 `--apply ID`로 넣으세요.", ""]
    alt_rows = [r for r in results if r["plan"].get("alt")]
    lines += ["## 변경안(alt) 구역의 변경 결정 고시", ""]
    for r in alt_rows:
        z, new = r["z"], by_id.get(r["z"]["id"], [])
        lines.append(f"- **{label(z)}** ({z['gu']}): " +
                     ("; ".join(f"{x['org']} 제{x['notice_no']}호 {x['notice_date']} — {x['title'][:60]}" for x in new)
                      if new else "새 고시 없음"))
    lines += ["", "## 새 고시가 있는 구역", "",
              "| 구역 | 고시 | 고시일 | 상태 | 추출 값 | plans.csv와 다른 값 |", "|---|---|---|---|---|---|"]
    for zid, xs in sorted(by_id.items(), key=lambda kv: max(x["notice_date"] for x in kv[1]), reverse=True):
        for x in xs:
            val = " · ".join(s for s in (
                x["far"] and f"용적률 {fmt(x['far'])}%", x["max_floors"] and f"{x['max_floors']}층",
                x["height_m"] and f"{fmt(x['height_m'])}m", x["units"] and f"{fmt(x['units'])}세대",
                x["buildings"] and f"{x['buildings']}개동") if s) or "-"
            link = f"[{x['org']} 제{x['notice_no']}호]({x['pdf_url']})" if x["pdf_url"] else f"{x['org']} 제{x['notice_no']}호"
            lines.append(f"| {x['zone']}{' (변경안 있음)' if x['has_alt'] else ''} | {link} | {x['notice_date']} | "
                         f"{x['status'] or '-'} | {val} | {', '.join(changed(x)) or '-'} |")
    no_alias = [r["z"] for r in results if not r["als"]]
    lines += ["", f"## 검색어를 만들지 못한 구역 ({len(no_alias)}곳)", "",
              "구역명에 지명이 없어(예: '도시환경정비사업구역') 고시 제목과 맞출 수 없습니다.", ""]
    lines += [f"- {z.get('zone_name')} / {z.get('name')} ({z['gu']} {z.get('jibun', '')})" for z in no_alias]
    nf = [r for r in results if r["als"] and not r["found"]]
    lines += ["", f"## 포털에서 고시를 하나도 찾지 못한 구역 ({len(nf)}곳)", ""]
    lines += [f"- {label(r['z'])} ({r['z']['gu']}, 검색어: {', '.join(r['als'])})" for r in nf]
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def apply(ids):
    with open(CANDS, encoding="utf-8-sig") as f:
        cands = [r for r in csv.DictReader(f) if r["id"] in ids and r["status"] == "추출"]
    with open(PLANS, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        fields, plans = reader.fieldnames, list(reader)
    done = []
    for zid in ids:
        cs = sorted((c for c in cands if c["id"] == zid), key=lambda c: c["notice_date"], reverse=True)
        if not cs:
            print(f"{zid}: 추출된 후보가 없습니다")
            continue
        c = cs[0]
        row = next((p for p in plans if p["id"] == zid), None)
        if row is None:
            row = {k: "" for k in fields}
            row["id"] = zid
            plans.append(row)
        for k in ("far", "max_floors", "units", "buildings"):
            if c[k]:
                row[k] = fmt(c[k]).replace(",", "")
        row["source_url"] = " ".join(x for x in (c["pdf_url"], row.get("source_url")) if x)
        tag = f"[자동 추출 {c['org']} 제{c['notice_no']}호 {c['notice_date']}]"
        row["note"] = f"{tag} {row.get('note', '')}".strip()
        if row.get("alt"):
            row["note"] += f" (변경 결정 전 변경안: {row['alt']})"
            row["alt"] = ""
        done.append(zid)
    with open(PLANS, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(plans)
    print(f"plans.csv에 {len(done)}곳 반영: {', '.join(done)}. fetch_seoul.py --plans로 다시 만드세요.")


if __name__ == "__main__":
    main()
