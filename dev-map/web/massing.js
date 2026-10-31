// 구역 폴리곤 + 계획 수치(용적률, 최고·최저층수, 동수)로 가상 단지를 만든다.
// 한국 공동주택 배치 관행을 따른다: 남향 배치, 인동간격(높이에 비례), 탑상형(십자·Y·ㄱ자)과
// 판상형, 저층 상가동, 중심부를 높이고 가장자리를 낮춘 스카이라인.
// 실제 설계안이 아니라 "이런 규모와 형태가 들어선다"를 보여주는 추정치다.
(function (global) {
  const M_LAT = 111320;
  const FLOOR = 2.9, GROUND = 4.5, CROWN = 6;     // 주거 층고, 1층(필로티) 높이, 옥탑

  function hashSeed(str) {
    let h = 2166136261;
    for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // 구역 중심 기준 미터 좌표계
  function projector(ring) {
    const lon0 = ring.reduce((s, p) => s + p[0], 0) / ring.length;
    const lat0 = ring.reduce((s, p) => s + p[1], 0) / ring.length;
    const mLon = M_LAT * Math.cos(lat0 * Math.PI / 180);
    return {
      toXY: ([lon, lat]) => [(lon - lon0) * mLon, (lat - lat0) * M_LAT],
      toLL: ([x, y]) => [lon0 + x / mLon, lat0 + y / M_LAT],
    };
  }
  function inPoly([x, y], poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function area(poly) {
    let s = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) s += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
    return Math.abs(s / 2);
  }
  function centroid(poly) {
    let x = 0, y = 0, a = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const f = poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
      x += (poly[j][0] + poly[i][0]) * f; y += (poly[j][1] + poly[i][1]) * f; a += f;
    }
    return a ? [x / (3 * a), y / (3 * a)] : [0, 0];
  }
  function edges(poly) {
    const out = [];
    for (let i = 0; i < poly.length - 1; i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[i + 1];
      out.push({ x1, y1, x2, y2, len: Math.hypot(x2 - x1, y2 - y1), ang: Math.atan2(y2 - y1, x2 - x1) });
    }
    return out;
  }
  const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  function rectPts(cx, cy, w, d, a) {
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => {
      const [rx, ry] = rot([sx * w / 2, sy * d / 2], a);
      return [cx + rx, cy + ry];
    });
  }
  const fits = (pts, poly) => pts.every(p => inPoly(p, poly));

  // 남향 배치: 대지 축 중 동서 방향에 가까운 쪽을 고르되 30°까지만 따라간다
  function southAngle(poly) {
    const e = edges(poly).sort((u, v) => v.len - u.len)[0];
    let a = e ? e.ang : 0;
    while (a > Math.PI / 4) a -= Math.PI / 2;
    while (a < -Math.PI / 4) a += Math.PI / 2;
    return Math.max(-Math.PI / 6, Math.min(Math.PI / 6, a));
  }

  // ---- 동 유형: 여러 직사각형 부재의 합으로 표현 (같은 높이로 겹치면 하나의 매스로 보인다)
  const TYPES = {
    // 탑상형 십자: 코어 둘레 4세대
    cross: { w: 34, d: 34, footprint: 34 * 13 * 2 - 13 * 13, parts: (a) => [[0, 0, 34, 13, a], [0, 0, 13, 34, a]] },
    // 탑상형 Y자: 120° 간격 세 날개
    y: { w: 36, d: 34, footprint: 3 * 17 * 12 + 60, parts: (a) => [0, 1, 2].map(k => {
      const t = a + Math.PI / 2 + k * 2 * Math.PI / 3; const [ox, oy] = rot([8.5, 0], t);
      return [ox, oy, 19, 12, t];
    }) },
    // 탑상형 ㄱ자 (모서리 동)
    l: { w: 36, d: 30, footprint: 36 * 13 + 17 * 13, parts: (a) => {
      const [ox1, oy1] = rot([0, -8.5], a), [ox2, oy2] = rot([-11.5, 6.5], a);
      return [[ox1, oy1, 36, 13, a], [ox2, oy2, 13, 17, a]];
    } },
    // 판상형: 4~5세대 일자형, 가운데를 2m 밀어 입면에 변화를 준다
    slab: { w: 62, d: 15, footprint: 62 * 13, parts: (a) => [[...rot([-15.5, -1], a), 31, 13, a], [...rot([15.5, 1], a), 31, 13, a]] },
    // 소규모 단지 판상형 (2~3세대)
    small: { w: 40, d: 14, footprint: 40 * 13, parts: (a) => [[0, 0, 40, 13, a]] },
    // 업무·주상복합 타워
    office: { w: 44, d: 34, footprint: 44 * 34, parts: (a) => [[0, 0, 44, 34, a]] },
  };
  const heightOf = f => GROUND + (f - 1) * FLOOR;

  // 격자 후보지: 동서 간격 dx, 남북 간격 dy(인동간격), 탑상형은 열마다 엇갈리게
  function sites(poly, a, type, dx, dy, stagger, inset, want = 0) {
    const out = gridSites(poly, a, type, dx, dy, stagger, inset, 0, 0);
    if (out.length >= want) return out;
    // 대각선으로 긴 대지 등은 격자 시작점에 따라 들어가는 동 수가 크게 달라진다: 시작점을 옮겨 가며 가장 많이 들어가는 배치를 쓴다
    let best = out;
    for (const fx of [0, 1 / 3, 2 / 3]) for (const fy of [0, 1 / 3, 2 / 3]) {
      if (!fx && !fy) continue;
      const c = gridSites(poly, a, type, dx, dy, stagger, inset, fx * dx, fy * dy);
      if (c.length > best.length) best = c;
      if (best.length >= want) return best;
    }
    return best;
  }
  function gridSites(poly, a, type, dx, dy, stagger, inset, ox, oy) {
    const local = poly.map(p => rot(p, -a));
    const xs = local.map(p => p[0]), ys = local.map(p => p[1]);
    const out = [];
    let row = 0;
    for (let y = Math.min(...ys) + type.d / 2 + inset + oy; y <= Math.max(...ys) - type.d / 2 - inset; y += dy, row++) {
      const off = (stagger && row % 2 ? dx / 2 : 0) + ox;
      for (let x = Math.min(...xs) + type.w / 2 + inset + off; x <= Math.max(...xs) - type.w / 2 - inset; x += dx) {
        const [cx, cy] = rot([x, y], a);
        if (fits(rectPts(cx, cy, type.w + inset * 2, type.d + inset * 2, a), poly)) out.push([cx, cy]);
      }
    }
    return out;
  }
  // 넓게 퍼지도록 고른다 (가장 먼 점 우선)
  function spread(cands, n, start) {
    if (cands.length <= n) return cands.slice();
    const pick = [cands.reduce((b, c) => Math.hypot(c[0] - start[0], c[1] - start[1]) < Math.hypot(b[0] - start[0], b[1] - start[1]) ? c : b)];
    while (pick.length < n) {
      let best = null, bd = -1;
      for (const c of cands) {
        if (pick.includes(c)) continue;
        const d = Math.min(...pick.map(p => Math.hypot(c[0] - p[0], c[1] - p[1])));
        if (d > bd) { bd = d; best = c; }
      }
      pick.push(best);
    }
    return pick;
  }

  function generate(feature) {
    const p = feature.properties;
    const rings = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates.map(c => c[0]) : [feature.geometry.coordinates[0]];
    const sized = rings.map(r => { const q = projector(r); return { r, a: area(r.map(q.toXY)) }; }).sort((u, v) => v.a - u.a);
    const ring = sized[0].r, pj = projector(ring), poly = ring.map(pj.toXY);
    const A = area(poly), rand = rng(hashSeed(p.id)), a = southAngle(poly), c0 = centroid(poly);
    const maxF = Math.round(+p.max_floors || 25);
    const minF = Math.round(+p.min_floors || Math.max(5, Math.min(maxF, Math.round(maxF * .45))));
    const far = +p.far || 250, wantN = +p.buildings || 0;
    const style = p.plan_style || (maxF <= 15 ? 'slabs' : 'towers');
    const parts = [];   // {ring, b(base m), h(top m), kind}
    const blds = [];    // 동 단위 요약
    const addBuilding = (cx, cy, type, floors, base = 0, kind = 'res') => {
      const top = base + heightOf(floors);
      type.parts(a).forEach(([ox, oy, w, d, ang]) => parts.push({ pts: rectPts(cx + ox, cy + oy, w, d, ang), b: base, h: top, kind }));
      if (kind !== 'shop') {
        // 옥탑(코어 상부)
        parts.push({ pts: rectPts(cx, cy, Math.min(type.w, 14), Math.min(type.d, 9), a), b: top, h: top + CROWN, kind: 'crown' });
      }
      blds.push({ cx, cy, floors, kind, footprint: type.footprint });
    };

    // 높이 배분: 중심과 북쪽이 높고, 남쪽·가장자리는 낮게 (일조, 경관)
    const R = Math.sqrt(A / Math.PI);
    const floorsAt = (x, y) => {
      const centr = 1 - Math.min(1, Math.hypot(x - c0[0], y - c0[1]) / R);
      const north = Math.max(0, Math.min(1, .5 + rot([x - c0[0], y - c0[1]], -a)[1] / (2 * R)));
      const s = Math.min(1, .6 * centr + .4 * north + (rand() - .5) * .25);
      return Math.max(minF, Math.min(maxF, Math.round(minF + (maxF - minF) * s)));
    };

    // 구역 중심에 들어가는 가장 큰 직사각형 (포디움)
    const podiumRect = () => {
      const local = poly.map(q => rot([q[0] - c0[0], q[1] - c0[1]], -a));
      let w = Math.max(...local.map(q => q[0])) - Math.min(...local.map(q => q[0]));
      let d = Math.max(...local.map(q => q[1])) - Math.min(...local.map(q => q[1]));
      while (w > 20 && d > 20 && !fits(rectPts(c0[0], c0[1], w, d, a), poly)) { w *= .94; d *= .94; }
      return { w, d, pts: rectPts(c0[0], c0[1], w, d, a) };
    };
    const target = A * far / 100;
    let extraGfa = 0;   // 포디움·상가 연면적 (동 요약에는 들어가지 않는다)
    const POD_FH = 4.5;

    if (style === 'complex') {
      // 도시정비형: 저층 포디움 + 업무·주상복합 타워. 층수는 포디움을 포함한 값이다
      const pod = podiumRect();
      const t = TYPES.office;
      const need = wantN || Math.max(1, Math.round(target / (t.footprint * maxF * .8)));
      let cands = [];
      for (let k = 0, s = 1; k < 6 && cands.length < need; k++, s *= .9)
        cands = sites(poly, a, t, (t.w + 22) * s, (t.d + 26) * s, false, k > 2 ? 2 : 4, need);
      if (!cands.length) cands = [c0];
      const towers = spread(cands, need, c0).map(([x, y], i) => ({ x, y, f: i === 0 ? maxF : Math.max(minF, Math.round(maxF * (.6 + rand() * .35))) }));
      // 포디움 층수로 계획 용적률을 맞춘다: 연면적 = 포디움 면적×층수 + 타워 바닥×(층수-포디움층수)
      const fpSum = towers.length * t.footprint, towerSum = towers.reduce((s, b) => s + t.footprint * b.f, 0);
      const podMax = Math.max(3, Math.min(10, Math.floor(Math.min(...towers.map(b => b.f)) * .5)));
      const podNet = Math.max(1, pod.w * pod.d - fpSum);
      const podF = Math.max(3, Math.min(podMax, Math.round((target - towerSum) / podNet)));
      let total = () => towers.reduce((s, b) => s + t.footprint * b.f, 0) + podNet * podF;
      // 포디움만으로 안 맞으면 최고층 외 타워 층수를 조정한다
      for (let i = 0; i < 3 && Math.abs(total() - target) > target * .1; i++) {
        const rest = towers.slice(1), rg = rest.reduce((s, b) => s + t.footprint * b.f, 0);
        if (!rg) break;
        const k = (target - total() + rg) / rg;
        rest.forEach(b => b.f = Math.max(Math.min(minF, maxF), Math.min(maxF, Math.round(b.f * k))));
      }
      // 좁은 대지에 타워 수가 정해져 있어 그래도 넘치면 타워를 날씬하게(최대 60%까지) 줄인다
      const over = towers.reduce((s, b) => s + t.footprint * (b.f - podF), 0);
      const sc = over > 0 && total() > target * 1.1 ? Math.max(.6, Math.sqrt(Math.max(0, target - podNet * podF) / over)) : 1;
      const tw = t.w * sc, td = t.d * sc, tfp = t.footprint * sc * sc;
      const podH = podF * POD_FH;
      parts.push({ pts: pod.pts, b: 0, h: podH, kind: 'shop' });
      extraGfa += podNet * podF - (t.footprint - tfp) * podF * towers.length;
      towers.forEach(({ x, y, f }) => {
        const top = podH + Math.max(1, f - podF) * 4;
        parts.push({ pts: rectPts(x, y, tw, td, a), b: podH, h: top, kind: 'office' });
        parts.push({ pts: rectPts(x, y, Math.min(16, tw * .5), Math.min(12, td * .5), a), b: top, h: top + 8, kind: 'crown' });
        blds.push({ cx: x, cy: y, floors: f, kind: 'office', footprint: tfp });
      });
    } else {
      const small = style === 'slabs';
      let pool = small ? [TYPES.small] : (A > 60000 ? [TYPES.cross, TYPES.y, TYPES.slab] : [TYPES.cross, TYPES.y]);
      let mainType = pool[0];
      // 인동간격: 앞 동 높이의 0.5배 이상 (공동주택 일조 기준을 단순화)
      const avgH = heightOf((maxF + minF) / 2);
      let dx = mainType.w + (small ? 10 : 16), dy = mainType.d + Math.max(small ? 10 : 18, avgH * .5);
      const avgFloors = (maxF + minF) / 2;
      const need = wantN || Math.max(1, Math.round(A * far / 100 / (mainType.footprint * avgFloors)));
      // 계획 동 수가 후보지보다 많으면 간격을 조금씩 좁혀 다시 배치한다 (최대 30%)
      let cands = [];
      for (let k = 0, s = 1; k < 7 && cands.length < (wantN || 1); k++, s *= .95)
        cands = sites(poly, a, mainType, dx * s, dy * s, !small, small ? 3 : k > 3 ? 3 : 6, wantN);
      // 탑상형이 필요한 동 수의 절반도 안 들어가는 좁은 대지는 판상형으로 바꿔 다시 배치한다
      const needN = wantN || need;
      if (!small && cands.length < (wantN ? wantN : needN * .5)) {
        for (const alt of [TYPES.slab, TYPES.small]) {
          const adx = alt.w + 12, ady = alt.d + Math.max(12, avgH * .5);
          let c2 = [];
          for (let k = 0, s = 1; k < 7 && c2.length < needN; k++, s *= .95) c2 = sites(poly, a, alt, adx * s, ady * s, false, 3, needN);
          if (c2.length > cands.length) { cands = c2; mainType = alt; pool = [alt]; dx = adx; dy = ady; }
          if (cands.length >= needN) break;
        }
      }
      for (let k = 0; !cands.length && k < 6; k++) cands = sites(poly, a, mainType, dx * .8, dy * .8, false, 2);
      const chosen = spread(cands, need, c0);
      if (!chosen.length) {
        // 아주 작은 구역: 들어가는 크기의 판상형 한 동
        let s = 1; while (s > .3 && !fits(rectPts(c0[0], c0[1], 40 * s, 13 * s, a), poly)) s *= .85;
        parts.push({ pts: rectPts(c0[0], c0[1], 40 * s, 13 * s, a), b: 0, h: heightOf(Math.min(maxF, 7)), kind: 'res' });
        blds.push({ cx: c0[0], cy: c0[1], floors: Math.min(maxF, 7), kind: 'res', footprint: 520 * s * s });
      }
      // 가장 중심에 가까운 동이 최고층
      const ctr = chosen.slice().sort((u, v) => Math.hypot(u[0] - c0[0], u[1] - c0[1]) - Math.hypot(v[0] - c0[0], v[1] - c0[1]))[0];
      const plan = [];
      chosen.forEach(pt => {
        const [x, y] = pt;
        let type = mainType;
        if (!small) {
          // 대지 경계 근처는 ㄱ자·판상형으로, 안쪽은 십자·Y자를 섞는다
          const nearEdge = !fits(rectPts(x, y, mainType.w + 30, mainType.d + 30, a), poly);
          type = nearEdge && fits(rectPts(x, y, TYPES.l.w + 6, TYPES.l.d + 6, a), poly) && rand() < .5 ? TYPES.l
            : pool[Math.floor(rand() * pool.length)];
          if (!fits(rectPts(x, y, type.w + 4, type.d + 4, a), poly)) type = mainType;
        }
        const f = pt === ctr ? maxF : small ? Math.max(minF, Math.round(maxF - rand() * 3)) : floorsAt(x, y);
        plan.push({ x, y, type, f, top: pt === ctr });
      });
      // 동 수가 고정된 경우 연면적이 용적률을 크게 넘으면 최고층 동을 빼고 층수를 낮춘다
      const gfa = () => plan.reduce((s, b) => s + b.type.footprint * b.f, 0);
      if (wantN && gfa() > target * 1.1) {
        const k = target / gfa();
        plan.forEach(b => { if (!b.top) b.f = Math.max(Math.min(5, maxF), Math.round(b.f * k)); });
      }
      // 반대로 동 수가 고정되거나 대지가 좁아 용적률에 못 미치면 최고층 외 동을 최고층수 안에서 올린다
      const raise = () => {
        for (let i = 0; i < 3 && gfa() < target * .9; i++) {
          const rest = plan.filter(b => !b.top && b.f < maxF), rg = rest.reduce((s, b) => s + b.type.footprint * b.f, 0);
          if (!rg) break;
          const k = (target - gfa() + rg) / rg;
          rest.forEach(b => b.f = Math.min(maxF, Math.round(b.f * k)));
        }
      };
      raise();
      // 좁거나 모양이 불규칙한 대지라 동이 모자라면 남은 땅에 소형 판상동을 간격을 좁혀(최대 30%) 채운다
      if (gfa() < target * .75 && (!wantN || plan.length < wantN)) {
        const t = TYPES.small, clear = (x, y) => plan.every(b => Math.hypot(x - b.x, y - b.y) > (b.type.w + t.w) / 2 + 6);
        let extra = [];
        for (let s = 1; s >= .7 && !extra.length; s -= .1)
          extra = sites(poly, a, t, (t.w + 8) * s, (t.d + Math.max(8, avgH * .35)) * s, false, 2).filter(([x, y]) => clear(x, y));
        const room = wantN ? wantN - plan.length : Math.ceil((target - gfa()) / (t.footprint * maxF));
        for (const [x, y] of spread(extra, Math.max(0, room), c0)) {
          if (!clear(x, y)) continue;
          plan.push({ x, y, type: t, f: floorsAt(x, y), top: false });
          if (gfa() >= target * .9) break;
        }
        raise();
      }
      // 용적률 400% 이상(상업지역 주상복합)은 비주거 연면적을 저층 포디움(상가·업무·오피스텔)으로 채운다
      if (far >= 400 && gfa() < target * .9 && plan.length) {
        const pod = podiumRect();
        const covered = plan.filter(b => fits([[b.x, b.y]], pod.pts)).reduce((s, b) => s + b.type.footprint, 0);
        const podNet = pod.w * pod.d - covered;
        if (podNet > 200) {
          const podF = Math.max(2, Math.min(8, Math.round((target - gfa()) / podNet)));
          parts.push({ pts: pod.pts, b: 0, h: podF * POD_FH, kind: 'shop' });
          extraGfa += podNet * podF;
        }
      }
      plan.forEach(b => addBuilding(b.x, b.y, b.type, b.f));
      // 단지 경계를 따라 저층 상가동 (큰 단지만)
      if (!small && A > 25000) {
        const e = edges(poly).sort((u, v) => v.len - u.len)[0];
        const n = Math.min(3, Math.floor(e.len / 70));
        for (let i = 0; i < n; i++) {
          const t = (i + 1) / (n + 1), mx = e.x1 + (e.x2 - e.x1) * t, my = e.y1 + (e.y2 - e.y1) * t;
          const [nx, ny] = [-(e.y2 - e.y1) / e.len, (e.x2 - e.x1) / e.len];
          for (const sgn of [1, -1]) {
            const cx = mx + nx * 14 * sgn, cy = my + ny * 14 * sgn;
            const pts = rectPts(cx, cy, 40, 14, e.ang);
            if (fits(pts, poly)) { parts.push({ pts, b: 0, h: 2 * 4.2, kind: 'shop' }); extraGfa += 40 * 14 * 2; break; }
          }
        }
      }
    }

    const toRing = pts => [...pts, pts[0]].map(pj.toLL);
    const res = blds.filter(b => b.kind !== 'shop');
    return {
      parts: parts.map(q => ({ ring: toRing(q.pts), b: q.b, h: q.h, kind: q.kind, dist: Math.hypot(q.pts[0][0] - c0[0], q.pts[0][1] - c0[1]) })),
      areaM2: Math.round(sized.reduce((s, x) => s + x.a, 0)),
      planCount: res.length,
      planMax: res.length ? Math.max(...res.map(b => b.floors)) : 0,
      planMin: res.length ? Math.min(...res.map(b => b.floors)) : 0,
      gfaFar: Math.round((res.reduce((s, b) => s + b.footprint * b.floors, 0) + extraGfa) / A * 100),
      estimated: p.plan_estimated ?? (!p.far || !p.max_floors),
      center: pj.toLL(c0),
    };
  }

  global.Massing = { generate };
})(window);
