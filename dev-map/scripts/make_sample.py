"""데모용 샘플 구역 GeoJSON을 만든다 (web/data/zones.geojson).

위치는 서울 시내지만 구역명·경계·수치는 모두 가상이다.
실제 데이터로 바꿀 때는 build_zones.py를 쓴다.
"""
import json
import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "web" / "data" / "zones.geojson"

# (id, 이름, 사업유형, 단계, 용도지역, 용적률, 최고층수, 세대수, 착공, 준공, 중심 lon, lat, 가로m, 세로m, 회전°, 배치방식)
SAMPLES = [
    ("S1", "샘플 1구역", "주택재개발", 3, "제2종 일반주거", 249, 35, 2180, 2028.2, 2031.6, 127.0228, 37.4932, 300, 230, 12, "towers"),
    ("S2", "샘플 2구역", "재건축", 5, "제3종 일반주거", 300, 49, 3050, 2026.3, 2029.9, 126.9012, 37.5143, 280, 260, -8, "towers"),
    ("S3", "샘플 3구역", "도시정비형 재개발", 1, "일반상업", 800, 62, 640, 2030.4, 2034.6, 127.0702, 37.5452, 170, 140, 20, "complex"),
    ("S4", "샘플 4구역", "소규모주택정비", 2, "제2종 일반주거", 230, 15, 1020, 2029.1, 2031.9, 126.9498, 37.5797, 240, 120, 0, "slabs"),
    ("S5", "샘플 5구역", "공공주택 복합사업", 0, "준주거", 400, 29, 1460, 2031.2, 2035.2, 127.0405, 37.6048, 220, 180, -15, "towers"),
]
STAGES = ["계획 수립", "정비구역 지정", "조합설립인가", "사업시행인가", "관리처분인가", "착공"]


def rect(lon, lat, w, d, rot):
    m_lat = 111_320
    m_lon = 111_320 * math.cos(math.radians(lat))
    a = math.radians(rot)
    pts = []
    for sx, sy in [(-1, -1), (1, -1), (1, 1), (-1, 1)]:
        x, y = sx * w / 2, sy * d / 2
        # 한쪽 모서리를 살짝 깎아 실제 구역처럼 반듯하지 않게 만든다
        if sx == 1 and sy == 1:
            x, y = x * 0.82, y * 0.82
        xr, yr = x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a)
        pts.append([round(lon + xr / m_lon, 7), round(lat + yr / m_lat, 7)])
    pts.append(pts[0])
    return pts


features = []
for (zid, name, typ, stage, zoning, far, maxf, units, start, end, lon, lat, w, d, rot, style) in SAMPLES:
    features.append({
        "type": "Feature",
        "properties": {
            "id": zid, "name": name, "type": typ, "stage": stage, "stage_name": STAGES[stage],
            "zoning": zoning, "far": far, "max_floors": maxf, "units": units,
            "start": start, "end": end, "plan_style": style,
            "source": "샘플 데이터", "is_sample": True,
        },
        "geometry": {"type": "Polygon", "coordinates": [rect(lon, lat, w, d, rot)]},
    })

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"wrote {len(features)} zones -> {OUT}")
