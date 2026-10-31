"""공공데이터로 받은 정비구역 경계 파일을 웹 지도용 zones.geojson으로 변환한다.

사용 예:
  python3 scripts/build_zones.py raw/정비구역.geojson \
      --config scripts/mapping.example.json \
      --plans scripts/plans.example.csv \
      --out web/data/zones.geojson

- 입력: GeoJSON. SHP라면 먼저 GDAL로 변환한다(좌표계도 WGS84로).
    ogr2ogr -f GeoJSON -t_srs EPSG:4326 raw/정비구역.geojson raw/정비구역.shp
  ogr2ogr를 쓸 수 없으면 --src-crs EPSG:5186 처럼 지정해 pyproj로 변환한다.
- --config: 원본 컬럼명 → 표준 필드 매핑, 진행단계 문자열 → 단계 번호 규칙.
- --plans: 고시문에서 뽑은 계획 수치(용적률, 최고층수, 세대수, 착공/준공 예상).
  구역 id로 합친다. 값이 없으면 웹에서 '추정'으로 표시된다.
"""
import argparse
import csv
import json
import sys
from pathlib import Path

STAGES = ["계획 수립", "정비구역 지정", "조합설립인가", "사업시행인가", "관리처분인가", "착공"]
PLAN_FIELDS = ["far", "max_floors", "units", "start", "end", "plan_style", "zoning"]


def load_reprojector(src_crs):
    if not src_crs:
        return None
    try:
        from pyproj import Transformer
    except ImportError:
        sys.exit("--src-crs를 쓰려면 pyproj가 필요합니다: pip install pyproj")
    t = Transformer.from_crs(src_crs, "EPSG:4326", always_xy=True)

    def walk(c):
        if isinstance(c[0], (int, float)):
            x, y = t.transform(c[0], c[1])
            return [round(x, 7), round(y, 7)]
        return [walk(v) for v in c]
    return walk


def stage_of(text, rules):
    """'관리처분인가 완료', '조합설립' 같은 원문을 단계 번호로 바꾼다. 뒤쪽 단계부터 매칭."""
    text = str(text or "")
    for keyword, num in sorted(rules.items(), key=lambda kv: -kv[1]):
        if keyword in text:
            return num
    return 0


def num(v):
    try:
        return float(str(v).replace(",", "").replace("%", "").strip())
    except (TypeError, ValueError):
        return None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src")
    ap.add_argument("--config", required=True)
    ap.add_argument("--plans")
    ap.add_argument("--src-crs", help="입력 좌표계가 WGS84가 아닐 때, 예: EPSG:5186")
    ap.add_argument("--out", default="web/data/zones.geojson")
    ap.add_argument("--source-label", default="공공데이터")
    a = ap.parse_args()

    cfg = json.loads(Path(a.config).read_text(encoding="utf-8"))
    cols, rules = cfg["columns"], cfg["stage_rules"]
    fc = json.loads(Path(a.src).read_text(encoding="utf-8"))
    reproject = load_reprojector(a.src_crs)

    plans = {}
    if a.plans:
        with open(a.plans, encoding="utf-8-sig") as f:
            plans = {row["id"].strip(): row for row in csv.DictReader(f)}

    out, skipped = [], 0
    for f in fc["features"]:
        g, p = f.get("geometry"), f.get("properties", {})
        if not g or g["type"] not in ("Polygon", "MultiPolygon"):
            skipped += 1
            continue
        if reproject:
            g = {"type": g["type"], "coordinates": reproject(g["coordinates"])}
        zid = str(p.get(cols["id"], "")).strip()
        stage = stage_of(p.get(cols["stage"]), rules)
        props = {
            "id": zid,
            "name": p.get(cols["name"]) or zid,
            "type": p.get(cols.get("type", ""), "") or "정비사업",
            "stage": stage,
            "stage_name": STAGES[stage],
            "zoning": p.get(cols.get("zoning", ""), ""),
            "source": a.source_label,
            "is_sample": False,
        }
        plan = plans.get(zid, {})
        for k in PLAN_FIELDS:
            v = plan.get(k) or p.get(cols.get(k, ""), None)
            if v in (None, ""):
                continue
            props[k] = v if k in ("plan_style", "zoning") else num(v)
        # 일정이 없으면 단계로 대략 추정한다 (화면에는 '예상'으로만 표시됨)
        if "start" not in props:
            props["start"] = 2027 + (5 - stage) * 1.2
        if "end" not in props:
            props["end"] = props["start"] + 3.5
        out.append({"type": "Feature", "properties": props, "geometry": g})

    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps({"type": "FeatureCollection", "features": out}, ensure_ascii=False), encoding="utf-8")
    no_plan = sum(1 for f in out if "far" not in f["properties"] or "max_floors" not in f["properties"])
    print(f"{len(out)}개 구역 저장 -> {a.out} (건너뜀 {skipped}, 계획 수치 없음 {no_plan})")


if __name__ == "__main__":
    main()
