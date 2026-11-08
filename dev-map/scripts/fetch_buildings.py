"""V-World에서 정비구역 주변 기존 건물(층수·높이)을 받아 web/data/buildings.geojson을 만든다.

V-World는 해외 IP를 막아서 클라우드 세션에서는 안 되고, 한국 PC에서 실행해야 한다.
설치할 것 없음(파이썬 3.8+ 표준 라이브러리만 사용).

키 설정 (둘 중 하나):
  - 환경변수 VWORLD_KEY
  - .env 파일에 VWORLD_KEY=발급받은키  (dev-map/.env, 저장소 루트 .env, 현재 폴더 .env 순으로 찾음)
  키를 발급할 때 등록한 서비스 URL이 있으면 VWORLD_DOMAIN=그 URL 도 같이 적는다(예: http://localhost).

사용:
  python scripts/fetch_buildings.py --probe      # 첫 구역 한 칸만 받아 응답·속성 이름 확인 (먼저 이걸로 확인)
  python scripts/fetch_buildings.py              # 전체 (중간에 끊겨도 다시 실행하면 캐시부터 이어감)
  python scripts/fetch_buildings.py --buffer 300 --data LT_C_SPBD

결과:
  web/data/buildings.geojson  — 구역 경계 상자 + buffer(m) 안에 중심이 있는 건물
    properties: floors(지상층수), height(m, 자료에 있으면), name, src(데이터셋)
  scripts/.cache/vworld/      — 칸별 원본 응답 캐시(커밋하지 않음)

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
OUT = ROOT / "web" / "data" / "buildings.geojson"
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


def zone_boxes(buffer_m):
    fc = json.loads(ZONES.read_text(encoding="utf-8"))
    boxes = []
    for f in fc["features"]:
        g = f["geometry"]
        rings = g["coordinates"] if g["type"] == "Polygon" else [r for poly in g["coordinates"] for r in poly]
        xs = [c[0] for r in rings for c in r]
        ys = [c[1] for r in rings for c in r]
        lat = (min(ys) + max(ys)) / 2
        dy = buffer_m / 111320
        dx = buffer_m / (111320 * math.cos(math.radians(lat)))
        boxes.append((min(xs) - dx, min(ys) - dy, max(xs) + dx, max(ys) + dy, f["properties"].get("name", "")))
    return boxes


def cells_for(boxes):
    cells = []
    seen = set()
    for x0, y0, x1, y1, _ in boxes:
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


def rnd(coords):
    if isinstance(coords[0], (int, float)):
        return [round(coords[0], 6), round(coords[1], 6)]
    return [rnd(c) for c in coords]


def centroid(geom):
    ring = geom["coordinates"][0] if geom["type"] == "Polygon" else geom["coordinates"][0][0]
    return sum(c[0] for c in ring) / len(ring), sum(c[1] for c in ring) / len(ring)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--probe", action="store_true", help="첫 구역 한 칸만 받아 응답과 속성 이름을 보여주고 끝냄")
    ap.add_argument("--data", default="LT_C_SPBD", help="V-World 데이터셋 ID (기본 LT_C_SPBD 도로명주소건물)")
    ap.add_argument("--buffer", type=float, default=200, help="구역 경계 상자 밖으로 넓힐 거리(m), 기본 200")
    ap.add_argument("--refresh", action="store_true", help="캐시 무시하고 다시 받기")
    ap.add_argument("--out", default=str(OUT))
    a = ap.parse_args()

    key, domain = load_env()
    boxes = zone_boxes(a.buffer)
    cells = cells_for(boxes)

    if a.probe:
        x0, y0, x1, y1, name = boxes[0]
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
    out, seen, t0 = [], set(), time.time()
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
            cx, cy = centroid(g)
            if not any(b[0] <= cx <= b[2] and b[1] <= cy <= b[3] for b in boxes):
                continue
            seen.add(fid)
            floors, height = num(pick(p, FLOOR_KEYS)), num(pick(p, HEIGHT_KEYS))
            if floors is None and height is None:
                no_floor += 1
            props = {"floors": int(floors) if floors else None,
                     "height": round(height, 1) if height else None,
                     "name": pick(p, NAME_KEYS), "src": a.data}
            out.append({"type": "Feature", "geometry": {"type": g["type"], "coordinates": rnd(g["coordinates"])},
                        "properties": {k: v for k, v in props.items() if v not in (None, "")}})
        if n % 20 == 0 or n == len(cells):
            print(f"  {n}/{len(cells)}칸, 건물 {len(out)}개 ({time.time() - t0:.0f}초)", flush=True)

    meta = {"source": f"V-World Data API {a.data}", "fetched": time.strftime("%Y-%m-%d"), "buffer_m": a.buffer}
    Path(a.out).write_text(json.dumps({"type": "FeatureCollection", "meta": meta, "features": out},
                                      ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    size = Path(a.out).stat().st_size / 1e6
    print(f"저장: {a.out} — 건물 {len(out)}개, {size:.1f}MB, 층수·높이 없는 건물 {no_floor}개")


if __name__ == "__main__":
    main()
