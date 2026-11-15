"""V-World에서 정비구역 주변 기존 건물(층수·높이)을 받아 web/data/buildings.json을 만든다.

V-World는 해외 IP를 막아서 클라우드 세션에서는 안 되고, 한국 PC에서 실행해야 한다.
설치할 것 없음(파이썬 3.8+ 표준 라이브러리만 사용).

키 설정 (둘 중 하나):
  - 환경변수 VWORLD_KEY
  - .env 파일에 VWORLD_KEY=발급받은키  (dev-map/.env, 저장소 루트 .env, 현재 폴더 .env 순으로 찾음)
  키를 발급할 때 등록한 서비스 URL이 있으면 VWORLD_DOMAIN=그 URL 도 같이 적는다(예: http://localhost).

사용:
  python scripts/fetch_buildings.py --probe      # 첫 구역 한 칸만 받아 응답·속성 이름 확인 (먼저 이걸로 확인)
  python scripts/fetch_buildings.py              # 전체 (중간에 끊겨도 다시 실행하면 캐시부터 이어감)
  python scripts/fetch_buildings.py --buffer 150 --data LT_C_SPBD

결과:
  web/data/buildings.json — 구역 경계의 볼록 껍질을 buffer(m)만큼 넓힌 범위(coverage) 안에 중심이 있는 건물.
    용량을 줄이려고 GeoJSON 대신 압축 형식(format "vbld1"):
      meta.scale = 100000 (좌표 정수 단위 1e-5도 ≈ 1m), meta.coverage = 범위 다각형 목록 [[[경도, 위도], …], …]
      floors[i] = 지상층수(모르면 0), heights[i] = 높이 m(자료에 있을 때만, 없으면 0),
      rings[i] = [x0, y0, dx1, dy1, dx2, dy2, …] 외곽선(정수, 첫 점은 절대값·나머지는 앞 점과의 차, 닫는 점 생략)
    여러 조각인 건물은 가장 큰 조각, 안쪽 구멍은 버림
  scripts/.cache/vworld/  — 칸별 원본 응답 캐시(커밋하지 않음). 범위·형식만 바꿔 다시 만들 때는 다시 받지 않음

출력·오류 메시지에는 키를 찍지 않는다.
"""
import argparse
import json
import math
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # dev-map/
ZONES = ROOT / "web" / "data" / "zones.geojson"
OUT = ROOT / "web" / "data" / "buildings.json"
LEGACY = ROOT / "web" / "data" / "buildings.geojson"   # 예전 형식(68MB) — 커밋하지 않음
SCALE = 100000
CACHE = ROOT / "scripts" / ".cache" / "vworld"
API = "https://api.vworld.kr/req/data"

CELL = 0.005           # 조회 칸 크기(도). 약 450m × 550m
PAGE_SIZE = 1000       # V-World Data API 최대

FLOOR_KEYS = ["gro_flo_co", "grnd_flr", "grnd_flr_co", "flr_co", "ground_floor", "a26"]
HEIGHT_KEYS = ["bld_hgt", "buld_hg", "height", "hgt", "bldg_hgt", "a16"]
NAME_KEYS = ["buld_nm", "bld_nm", "bldg_nm", "name", "a24"]
ID_KEYS = ["bd_mgt_sn", "bul_man_no", "ufid", "pnu_bldg", "gid", "id"]

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def load_env():
    for p in (ROOT / ".env", ROOT.parent / ".env", Path.cwd() / ".env"):
        if p.is_file():
            for line in p.read_text(encoding="utf-8-sig").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    key = os.environ.get("VWORLD_KEY", "").strip()
    if not key:
        sys.exit("VWORLD_KEY가 없습니다. 환경변수나 .env 파일(dev-map/.env 등)에 VWORLD_KEY=키 를 적어 주세요.")
    return key, os.environ.get("VWORLD_DOMAIN", "").strip()


def convex_hull(pts):
    pts = sorted(set(pts))
    if len(pts) < 3:
        return pts
    cross = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, hi = [], []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0:
            lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(hi) >= 2 and cross(hi[-2], hi[-1], p) <= 0:
            hi.pop()
        hi.append(p)
    return lo[:-1] + hi[:-1]          # 반시계 방향


def zone_boxes(buffer_m):
    """구역마다 (x0, y0, x1, y1, 이름, 범위 다각형). 범위 = 경계의 볼록 껍질을 buffer m만큼 넓힌 것(팔각형 근사)."""
    fc = json.loads(ZONES.read_text(encoding="utf-8"))
    boxes = []
    for f in fc["features"]:
        g = f["geometry"]
        rings = g["coordinates"] if g["type"] == "Polygon" else [poly[0] for poly in g["coordinates"]]
        outer = [tuple(c[:2]) for r in rings[:1 if g["type"] == "Polygon" else None] for c in r]
        lat = sum(c[1] for c in outer) / len(outer)
        dy = buffer_m / 111320
        dx = buffer_m / (111320 * math.cos(math.radians(lat)))
        dirs = [(math.cos(k * math.pi / 4) / math.cos(math.pi / 8), math.sin(k * math.pi / 4) / math.cos(math.pi / 8)) for k in range(8)]
        hull = convex_hull([(round(x + dx * u, 6), round(y + dy * v, 6)) for x, y in convex_hull(outer) for u, v in dirs])
        xs, ys = [c[0] for c in hull], [c[1] for c in hull]
        boxes.append((min(xs), min(ys), max(xs), max(ys), f["properties"].get("name", ""), hull))
    return boxes


def in_convex(x, y, hull):
    n = len(hull)
    for i in range(n):
        (ax, ay), (bx, by) = hull[i], hull[(i + 1) % n]
        if (bx - ax) * (y - ay) - (by - ay) * (x - ax) < 0:
            return False
    return True


def cells_for(boxes):
    cells = []
    seen = set()
    for x0, y0, x1, y1, *_ in boxes:
        for i in range(math.floor(x0 / CELL), math.floor(x1 / CELL) + 1):
            for j in range(math.floor(y0 / CELL), math.floor(y1 / CELL) + 1):
                if (i, j) not in seen:
                    seen.add((i, j))
                    cells.append((i, j))
    return cells


class ApiError(Exception):
    pass


def request(key, domain, data, cell, page):
    i, j = cell
    box = f"BOX({i * CELL:.6f},{j * CELL:.6f},{(i + 1) * CELL:.6f},{(j + 1) * CELL:.6f})"
    q = {
        "service": "data", "request": "GetFeature", "version": "2.0", "data": data,
        "key": key, "format": "json", "crs": "EPSG:4326", "geomFilter": box,
        "size": PAGE_SIZE, "page": page, "geometry": "true", "attribute": "true",
    }
    if domain:
        q["domain"] = domain
    url = API + "?" + urllib.parse.urlencode(q)
    last = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "dev-map/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, ConnectionError, json.JSONDecodeError) as e:
            last = e
            time.sleep(2 ** attempt)
    raise ApiError(f"요청 실패({type(last).__name__}): {str(last).replace(key, '***')}")


def fetch_cell(key, domain, data, cell, use_cache=True):
    """칸 하나의 feature 목록. 캐시가 있으면 캐시."""
    cf = CACHE / data / f"{cell[0]}_{cell[1]}.json"
    if use_cache and cf.is_file():
        return json.loads(cf.read_text(encoding="utf-8"))
    feats, page = [], 1
    while True:
        res = request(key, domain, data, cell, page).get("response", {})
        st = res.get("status")
        if st == "NOT_FOUND":
            break
        if st != "OK":
            err = res.get("error", {})
            raise ApiError(f"V-World 오류: status={st} code={err.get('code')} {err.get('text', '')}".replace(key, "***"))
        feats += res.get("result", {}).get("featureCollection", {}).get("features", [])
        total = int(res.get("page", {}).get("total", 1) or 1)
        if page >= total:
            break
        page += 1
    cf.parent.mkdir(parents=True, exist_ok=True)
    cf.write_text(json.dumps(feats, ensure_ascii=False), encoding="utf-8")
    return feats


def pick(props, keys):
    low = {k.lower(): v for k, v in props.items()}
    for k in keys:
        v = low.get(k)
        if v not in (None, "", " "):
            return v
    return None


def num(v):
    try:
        x = float(v)
        return x if x > 0 else None
    except (TypeError, ValueError):
        return None


def outer_ring(geom):
    """가장 넓은 조각의 바깥 고리."""
    polys = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
    area = lambda r: abs(sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r))))
    return max((p[0] for p in polys if p and len(p[0]) >= 3), key=area, default=None)


def encode_ring(ring):
    """정수 좌표(1e-5도)로 바꾸고 겹친 점·닫는 점을 뺀 뒤 [x0, y0, dx, dy, …]."""
    pts = []
    for c in ring:
        q = (round(c[0] * SCALE), round(c[1] * SCALE))
        if not pts or q != pts[-1]:
            pts.append(q)
    if len(pts) > 1 and pts[0] == pts[-1]:
        pts.pop()
    if len(pts) < 3:
        return None
    out = [pts[0][0], pts[0][1]]
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        out += [bx - ax, by - ay]
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--probe", action="store_true", help="첫 구역 한 칸만 받아 응답과 속성 이름을 보여주고 끝냄")
    ap.add_argument("--data", default="LT_C_SPBD", help="V-World 데이터셋 ID (기본 LT_C_SPBD 도로명주소건물)")
    ap.add_argument("--buffer", type=float, default=100, help="구역 경계(볼록 껍질) 밖으로 넓힐 거리(m), 기본 100")
    ap.add_argument("--refresh", action="store_true", help="캐시 무시하고 다시 받기")
    ap.add_argument("--out", default=str(OUT))
    a = ap.parse_args()

    key, domain = load_env()
    boxes = zone_boxes(a.buffer)
    cells = cells_for(boxes)

    if a.probe:
        x0, y0, x1, y1, name, _ = boxes[0]
        cell = (math.floor((x0 + x1) / 2 / CELL), math.floor((y0 + y1) / 2 / CELL))
        print(f"구역 {len(boxes)}곳 → 조회 칸 {len(cells)}개. 시험 칸: {name} 중심")
        try:
            res = request(key, domain, a.data, cell, 1).get("response", {})
        except ApiError as e:
            sys.exit(f"{e}\n(해외 IP·방화벽이면 연결이 끊깁니다. 한국 인터넷에서 실행했는지 확인)")
        print("status:", res.get("status"), "| page:", res.get("page"), "| error:", res.get("error"))
        feats = res.get("result", {}).get("featureCollection", {}).get("features", [])
        print(f"건물 {len(feats)}개")
        for f in feats[:3]:
            print("geometry:", f.get("geometry", {}).get("type"))
            print(json.dumps(f.get("properties", {}), ensure_ascii=False, indent=1))
        if feats:
            p = feats[0].get("properties", {})
            print("→ 인식한 층수 필드:", pick(p, FLOOR_KEYS), "/ 높이 필드:", pick(p, HEIGHT_KEYS))
        return

    print(f"구역 {len(boxes)}곳(buffer {a.buffer:.0f}m) → 조회 칸 {len(cells)}개, 데이터셋 {a.data}")
    floors_out, heights_out, rings_out, seen, t0 = [], [], [], set(), time.time()
    no_floor = 0
    for n, cell in enumerate(cells, 1):
        try:
            feats = fetch_cell(key, domain, a.data, cell, not a.refresh)
        except ApiError as e:
            sys.exit(f"\n{e}\n칸 {n}/{len(cells)}에서 멈춤. 다시 실행하면 받은 칸은 캐시에서 이어갑니다.")
        for f in feats:
            g = f.get("geometry")
            if not g or g.get("type") not in ("Polygon", "MultiPolygon"):
                continue
            p = f.get("properties", {})
            fid = pick(p, ID_KEYS) or json.dumps(g["coordinates"][0][:2])
            if fid in seen:
                continue
            ring = outer_ring(g)
            if not ring:
                continue
            cx, cy = sum(c[0] for c in ring) / len(ring), sum(c[1] for c in ring) / len(ring)
            if not any(b[0] <= cx <= b[2] and b[1] <= cy <= b[3] and in_convex(cx, cy, b[5]) for b in boxes):
                continue
            enc = encode_ring(ring)
            if not enc:
                continue
            seen.add(fid)
            floors, height = num(pick(p, FLOOR_KEYS)), num(pick(p, HEIGHT_KEYS))
            if floors is None and height is None:
                no_floor += 1
            floors_out.append(int(floors) if floors else 0)
            heights_out.append(round(height, 1) if height else 0)
            rings_out.append(enc)
        if n % 20 == 0 or n == len(cells):
            print(f"  {n}/{len(cells)}칸, 건물 {len(rings_out)}개 ({time.time() - t0:.0f}초)", flush=True)

    # coverage: 이 자료가 덮는 범위. 지도는 이 안의 OSM 건물을 빼고 이 자료로 그린다
    meta = {"source": f"V-World Data API {a.data}", "fetched": time.strftime("%Y-%m-%d"), "buffer_m": a.buffer,
            "scale": SCALE, "coverage": [[list(c) for c in b[5]] for b in boxes]}
    doc = {"format": "vbld1", "meta": meta, "floors": floors_out, "rings": rings_out}
    if any(heights_out):
        doc["heights"] = heights_out
    Path(a.out).write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    size = Path(a.out).stat().st_size / 1e6
    print(f"저장: {a.out} — 건물 {len(rings_out)}개, {size:.1f}MB, 층수·높이 없는 건물 {no_floor}개")
    if LEGACY.is_file():
        print(f"참고: 예전 형식 파일 {LEGACY.name}은 이제 안 씁니다. 지워도 됩니다(커밋 대상 아님).")


if __name__ == "__main__":
    main()
