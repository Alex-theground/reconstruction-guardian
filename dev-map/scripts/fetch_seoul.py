"""서울 실제 정비구역 데이터를 받아 web/data/zones.geojson을 만든다.

데이터 출처 (인증키 불필요):
  1) 구역 경계: 서울 열린데이터광장 OA-20957 '서울시 의제처리구역 위치정보' (UPIS_C_UQ181 SHP)
     이용조건: 공공누리 제4유형 (출처표시, 상업적 이용금지, 변경금지)
  2) 진행단계: 서울시 정비사업 정보몽땅 사업장 목록 (cleanup.seoul.go.kr)

두 자료는 SHP의 조서번호(WTNNC_SN) = 정보몽땅 '지도' 버튼 코드로 먼저 연결하고,
코드가 없으면 같은 자치구 안에서 구역명이 비슷한 것끼리 연결한다.

계획 수치(용적률, 최고층수, 착공·준공 시점)는 공개 데이터에 없어서 사업유형과
진행단계로 추정하고 plan_estimated=true로 표시한다. 고시문 값이 있으면
--plans CSV(id, far, max_floors, units, start, end, …, site, alt)로 덮어쓴다.

사용:
  pip install pyshp pyproj shapely
  python3 scripts/fetch_seoul.py            # 최신 자료 내려받아 변환
  python3 scripts/fetch_seoul.py --plans scripts/plans.csv
"""
import argparse
import warnings
import collections
import csv
import datetime
import difflib
import html
import io
import json
import re
import sys
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

import shapefile
from pyproj import Transformer
from shapely.geometry import Point, mapping, shape
from shapely.ops import transform, unary_union

warnings.filterwarnings("ignore", category=DeprecationWarning)
ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / ".cache"
OUT = ROOT / "web" / "data" / "zones.geojson"
_TODAY = datetime.date.today()
NOW = round(_TODAY.year + (_TODAY.month - 0.5) / 12, 4)  # 실행한 달의 중간 (예: 2026년 10월 = 2026 + 9.5/12)

UQ181_PAGE = "https://data.seoul.go.kr/dataList/OA-20957/F/1/datasetView.do"
UQ181_DOWN = "https://datafile.seoul.go.kr/bigfile/iot/inf/nio_download.do?&useCache=false"
CLEANUP_LIST = "https://cleanup.seoul.go.kr/cleanup/bsnssttus/lscrMainIndx.do?cpage=1&pageSize=3000"

# UPIS SHP 좌표계: Korean 1985 Modified Central Belt(Bessel). 데이텀 변환값을 넣어야 수백 m 어긋나지 않는다.
SRC_PROJ = ("+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 "
            "+ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43")

STAGES = ["계획 수립", "정비구역 지정", "조합설립인가", "사업시행인가", "관리처분인가", "착공"]
DONE = ("준공", "이전고시", "해산", "청산")
# 정보몽땅 진행단계 원문 → 단계 번호 (위에서부터 먼저 걸리는 규칙)
STAGE_RULES = [
    (("착공", "철거", "분양", "부분준공", "이주"), 5),
    (("관리처분",), 4),
    (("사업시행", "사업계획승인", "건축심의", "교통심의"), 3),
    (("조합설립", "조합원 모집", "조합창립", "조합규약", "주민대표"), 2),
    (("정비구역지정", "추진위"), 1),
    (("정비계획", "안전진단", "재정비촉진지구", "도시계획심의"), 0),
]
# 사업구분별 추정 계획: (용적률 %, 최고층수, 배치방식)
PLAN_GUESS = {
    "재건축": (300, 35, "towers"),
    "재개발(주택정비형)": (250, 25, "towers"),
    "재개발(도시정비형)": (800, 30, "complex"),
    "가로주택정비": (250, 15, "slabs"),
    "소규모재건축": (250, 15, "slabs"),
    "소규모재개발": (250, 15, "slabs"),
    "지역주택": (250, 25, "towers"),
    "리모델링": (250, 25, "towers"),
}
# 착공 시점 추정: 현재 단계에서 착공까지 남은 기간(년)
YEARS_TO_START = {5: -0.8, 4: 1.0, 3: 2.5, 2: 4.0, 1: 5.5, 0: 7.0}


def get(url, data=None, timeout=300):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode() if data else None,
                                 headers={"User-Agent": "Mozilla/5.0 (dev-map data pipeline)"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def fetch_uq181(refresh):
    """최신 의제처리구역 SHP zip을 받아 압축을 푼다."""
    shp = CACHE / "UPIS_C_UQ181.shp"
    if shp.exists() and not refresh:
        return shp.with_suffix("")
    page = get(UQ181_PAGE).decode("utf-8", "replace")
    files = re.findall(r"downloadFile\('(\d+)'\);\">([^<]+\.zip)", page)
    if not files:
        sys.exit("열린데이터광장 파일 목록을 찾지 못했습니다. 페이지 구조가 바뀌었는지 확인하세요: " + UQ181_PAGE)
    seq, name = max(files, key=lambda f: int(f[0]))
    print(f"구역 경계 내려받는 중: {name}")
    blob = get(UQ181_DOWN, {"infId": "OA-20957", "seqNo": "", "seq": seq, "infSeq": "1"})
    CACHE.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        for info in z.infolist():
            base = info.filename.rsplit("/", 1)[-1]
            if base.startswith("UPIS_C_UQ181."):
                (CACHE / base).write_bytes(z.read(info))
    (CACHE / "uq181_source.txt").write_text(name, encoding="utf-8")
    return shp.with_suffix("")


def fetch_cleanup(refresh):
    """정보몽땅 사업장 목록(진행단계 + 지도 코드)을 표에서 읽는다."""
    cache = CACHE / "cleanup_list.html"
    if not cache.exists() or refresh:
        print("정비사업 정보몽땅 사업장 목록 내려받는 중")
        CACHE.mkdir(parents=True, exist_ok=True)
        cache.write_bytes(get(CLEANUP_LIST))
    s = cache.read_text(encoding="utf-8", errors="replace")
    rows = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", s, re.S):
        tds = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)
        if len(tds) < 6:
            continue
        t = [html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", x))).strip() for x in tds]
        code = re.search(r"mapOpenPopup\('([^']+)'\)", tr)
        rows.append({"gu": t[1], "kind": t[2], "name": t[3], "jibun": t[4], "progress": t[5],
                     "code": code.group(1) if code else ""})
    if len(rows) < 100:
        sys.exit("정보몽땅 사업장 목록을 읽지 못했습니다. 페이지 구조가 바뀌었는지 확인하세요.")
    return rows


def stage_of(progress):
    for keys, n in STAGE_RULES:
        if any(k in progress for k in keys):
            return n
    return 1


CIRCLED = {c: str(i) for i, c in enumerate("①②③④⑤⑥⑦⑧⑨⑩", 1)}
SMALL_KINDS = ("가로주택정비", "소규모재건축", "소규모재개발")
# 이름은 같지만 고시 면적·위치로 다른 사업임을 확인한 옛 경계 (이름 연결에서만 제외)
NAME_LINK_SKIP = {
    "11000AGZ200810277520": "2008 미아2구역 경계 1.9만㎡ ≠ 미아2재정비촉진구역 17.96만㎡(서울시고시 2020-186호)",
    "11000AGZ198805032696": "1988 신림6구역 경계 6천㎡ ≠ 신림6구역(신림동 419) 3.78만㎡(서울시고시 2026-303호)",
}


def core_name(x):
    x = re.sub(r"\(.*?\)", "", x)
    x = "".join(CIRCLED.get(ch, ch) for ch in x)
    # 긴 단어를 먼저 지운다 ('주택정비형'에서 '주택'·'정비'만 지우면 '형'이 남는다)
    x = re.sub(r"^(서울특별시|서울시)?\s*\S{1,3}구\s+", "", x)  # '강북구 미아제3구역' = '미아제3구역'
    x = re.sub(r"제(?=\d)", "", x)  # '제3구역' = '3구역'
    x = re.sub(r"(도시정비형|주택정비형|장기전세주택|조합설립|추진위원회|도시환경|재정비촉진|주택|재건축|재개발|정비|사업|조합|"
               r"구역|지구|아파트|소규모|가로|역세권|[\s·,.\-_])", "", x)
    return x


def nums_of(x):
    """구역 번호(예: 1-1, 14단지, ③). 이름 연결 때 번호가 다르면 다른 구역으로 본다."""
    x = "".join(CIRCLED.get(ch, ch) for ch in re.sub(r"\(.*?\)", "", x))
    return tuple(re.findall(r"\d+", x))


def type_of(x):
    """사업 종류: 재건축 / 도시정비형(도시환경) 재개발 / 주택정비형 재개발 / 재개발(세부 미상)."""
    if "재건축" in x:
        return "재건축"
    if re.search(r"도시환경|도시정비형", x):
        return "재개발-도시"
    if re.search(r"주택재개발|주택정비형|주거환경", x):
        return "재개발-주택"
    if "재개발" in x:
        return "재개발"
    return None


def same_type(a, b):
    if not a or not b or a == b:
        return True
    return a.startswith("재개발") and b.startswith("재개발") and "재개발" in (a, b)


def date_of(code):
    d = code[8:16]
    return d if d.isdigit() else "0"


def name_ok(x, code, shp_name):
    """정보몽땅 사업장 ↔ SHP 경계를 이름으로 연결해도 되는지: 번호, 사업 종류가 같아야 하고 촉진지구 전체 경계는 안 된다."""
    if code in NAME_LINK_SKIP or nums_of(x["name"]) != nums_of(shp_name):
        return False
    if not same_type(type_of(x["name"]) or type_of(x["kind"]), type_of(shp_name)):
        return False
    return not re.search(r"촉진지구\s*$", shp_name)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--refresh", action="store_true", help="캐시를 무시하고 다시 내려받기")
    ap.add_argument("--plans", help="고시문 계획 수치 CSV (id, far, max_floors, units, start, end)")
    ap.add_argument("--out", default=str(OUT))
    a = ap.parse_args()

    shp_base = fetch_uq181(a.refresh)
    rows = fetch_cleanup(a.refresh)

    to_wgs = Transformer.from_proj(SRC_PROJ, "EPSG:4326", always_xy=True).transform
    from_wgs = Transformer.from_proj("EPSG:4326", SRC_PROJ, always_xy=True)
    r = shapefile.Reader(str(shp_base), encoding="cp949")
    polys = collections.defaultdict(list)  # 조서번호 → [shapely geom(원 좌표, m)]
    names = {}
    for sr in r.iterShapeRecords():
        rec = sr.record.as_dict()
        if not str(rec["LCLAS_CL"]).startswith(("UQ12", "UQ51", "UQ64")):  # 정비구역, 재정비촉진, 시장정비
            continue
        try:
            g = shape(sr.shape.__geo_interface__)
        except Exception:
            continue
        if g.is_empty:
            continue
        # 'AGZ00000000…'은 옛 구역 수십 개가 함께 쓰는 자리표시 번호라 연결에 쓰지 않는다
        if re.fullmatch(r"\d{5}AGZ0{8}\d*", rec["WTNNC_SN"]):
            continue
        polys[rec["WTNNC_SN"]].append(g if g.is_valid else g.buffer(0))
        names[rec["WTNNC_SN"]] = (rec["DGM_NM"], rec["SIGNGU_SE"])

    # 이름 색인 (자치구 무관; SHP 상당수가 시 단위 코드 11000이라서)
    by_core = collections.defaultdict(list)
    for code, (nm, _) in names.items():
        by_core[core_name(nm)].append(code)
    cores = list(by_core)

    def pick(x, keys):
        # 같은 이름의 경계가 여럿이면(옛 재개발 경계와 새 정비구역 등) 번호·종류가 맞는 것 중 가장 최근 지정된 경계
        ok = [c for k in keys for c in by_core[k] if name_ok(x, c, names[c][0])]
        return max(ok, key=date_of) if ok else None

    active = [x for x in rows if x["progress"] and not any(d in x["progress"] for d in DONE)]
    matched, how = {}, collections.Counter()
    RANK = {"코드": 3, "이름 일치": 2, "이름 유사": 1}
    for x in active:
        code, via = (x["code"], "코드") if x["code"] in polys else (None, None)
        # 가로주택·소규모 사업은 SHP에 경계가 없다. 이름이 같은 옛 재개발 구역에 붙이지 않는다
        if not code and x["kind"] not in SMALL_KINDS:
            c = core_name(x["name"])
            if len(c) >= 2 and c in by_core:
                code, via = pick(x, [c]), "이름 일치"
            if not code and len(c) >= 3:
                code, via = pick(x, difflib.get_close_matches(c, cores, n=5, cutoff=0.86)), "이름 유사"
        if not code:
            how["경계 없음"] += 1
            continue
        how[via] += 1
        st = stage_of(x["progress"])
        prev = matched.get(code)
        # 한 경계에 사업장이 여럿 붙으면 코드 > 이름 일치 > 이름 유사, 그다음 단계가 높은 쪽
        if prev is None or (RANK[via], st) > (RANK[prev["via"]], prev["stage"]):
            if prev:
                how["중복 경계"] += 1
            matched[code] = {**x, "stage": st, "via": via}

    plans = {}
    if a.plans:
        with open(a.plans, encoding="utf-8-sig") as f:
            plans = {row["id"].strip(): row for row in csv.DictReader(f)}

    features, completed = [], []
    for code, x in matched.items():
        geom_m = unary_union(polys[code])
        p = plans.get(code)
        # 경계가 실제 사업 범위보다 넓을 때(촉진구역 전체 경계 등): site = "경도 위도 면적㎡"
        # 그 점을 중심으로 경계와 겹치는 면적이 계획 면적이 되는 원으로 잘라 쓴다
        if p and (p.get("site") or "").strip():
            lon, lat, m2 = map(float, p["site"].replace(",", " ").split())
            cx, cy = from_wgs.transform(lon, lat)
            lo, hi = 1.0, 2000.0
            for _ in range(40):
                r = (lo + hi) / 2
                lo, hi = (r, hi) if geom_m.intersection(Point(cx, cy).buffer(r, 32)).area < m2 else (lo, r)
            geom_m = geom_m.intersection(Point(cx, cy).buffer(hi, 32))
        area = geom_m.area
        if area < 800:  # 너무 작은 조각은 제외
            continue
        far, maxf, style = PLAN_GUESS.get(x["kind"], (250, 25, "towers"))
        # 사업장 구분이 주택정비형으로 적혀 있어도 이름이 도시정비형·도시환경이면 주상복합·업무 배치로 그린다
        if style == "towers" and re.search(r"도시정비형|도시환경", x["name"]):
            style = "complex"
        if area > 150_000 and x["kind"] == "재건축":
            maxf = 49
        start = round(NOW + YEARS_TO_START[x["stage"]], 2)
        end = round(start + 3 + min(1.5, area / 100_000), 2)
        props = {
            "id": code, "name": x["name"], "zone_name": names[code][0], "gu": x["gu"],
            "type": x["kind"], "stage": x["stage"], "stage_name": STAGES[x["stage"]], "progress": x["progress"],
            "jibun": x["jibun"], "far": far, "max_floors": maxf, "plan_style": style,
            "start": start, "end": end, "plan_estimated": True, "time_estimated": True,
            "source": "서울 열린데이터광장·정비사업 정보몽땅", "is_sample": False,
        }
        if p:
            for k in ("far", "max_floors", "min_floors", "buildings", "units", "start", "end"):
                if (p.get(k) or "").strip():
                    props[k] = float(p[k])
            for k in ("complex_name", "source_url", "note"):
                if (p.get(k) or "").strip():
                    props[k] = p[k].strip()
            # 결정 전 변경안(통합심의안 등): alt = "far=673;max_floors=49;units=1010;label=2026.4 통합심의안;url=..."
            # 지도는 결정 고시값으로 그리고, 상세 패널에서 변경안으로 바꿔 볼 수 있게 따로 넘긴다
            if (p.get("alt") or "").strip():
                alt = {}
                for kv in p["alt"].split(";"):
                    k, _, v = kv.partition("=")
                    k, v = k.strip(), v.strip()
                    if k in ("far", "max_floors", "min_floors", "buildings", "units") and v:
                        alt[k] = float(v)
                    elif k in ("label", "url") and v:
                        alt[k] = v
                props["alt"] = alt
            # 용적률이 없고 세대수만 있으면 세대당 연면적 약 115㎡로 역산한다
            # (도시정비형은 업무·상업 연면적이 커서 세대수로 역산하면 크게 낮아지므로 유형 기본값을 둔다)
            if not (p.get("far") or "").strip() and props.get("units") and style != "complex":
                props["far"] = round(max(150, min(350, props["units"] * 115 / area * 100)))
            props["far_estimated"] = not (p.get("far") or "").strip()
            props["plan_estimated"] = not (p.get("max_floors") or "").strip()
            has_s, has_e = bool((p.get("start") or "").strip()), bool((p.get("end") or "").strip())
            props["time_estimated"] = not (has_s and has_e)
            # 한쪽만 알려진 경우 공사기간 약 3.5년으로 나머지를 맞춘다
            if has_e and not has_s:
                props["start"] = round(props["end"] - 3.5, 2)
            elif has_s and not has_e:
                props["end"] = round(props["start"] + 3.5, 2)
            if props["start"] >= props["end"]:
                props["end"] = props["start"] + 3
            # 자료로 이미 준공이 확인된 단지는 지도에 실제 새 건물이 있으므로 뺀다
            if has_e and props["end"] <= NOW:
                completed.append(x["name"])
                continue
        geom = transform(to_wgs, geom_m.simplify(0.5))
        # 기존 건물 숨김용: 경계를 6m 넓혀 경계에 걸친 건물도 지운다
        clear = transform(to_wgs, geom_m.buffer(6).simplify(1.5))
        props["clear"] = mapping(clear)["coordinates"] if clear.geom_type == "MultiPolygon" else [mapping(clear)["coordinates"]]
        features.append({"type": "Feature", "properties": props, "geometry": json.loads(json.dumps(mapping(geom)))})

    def rnd(c):
        return [rnd(v) for v in c] if isinstance(c[0], (list, tuple)) else [round(c[0], 6), round(c[1], 6)]
    for f in features:
        f["geometry"]["coordinates"] = rnd(f["geometry"]["coordinates"])
        f["properties"]["clear"] = rnd(f["properties"]["clear"])

    src = (CACHE / "uq181_source.txt").read_text(encoding="utf-8") if (CACHE / "uq181_source.txt").exists() else ""
    out = {"type": "FeatureCollection", "meta": {"boundary_file": src, "built_at_year": NOW}, "features": features}
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"진행 중 사업장 {len(active)}곳 → 경계 연결 {sum(v for k, v in how.items() if k in RANK)}곳 "
          f"({dict(how)}), 저장 {len(features)}개 구역 → {a.out}")
    if completed:
        print("준공 확인으로 제외:", ", ".join(completed))
    print("단계별:", dict(collections.Counter(STAGES[f['properties']['stage']] for f in features)))


if __name__ == "__main__":
    main()
