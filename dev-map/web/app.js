(function () {
  const STAGES = ['계획 수립', '정비구역 지정', '조합설립인가', '사업시행인가', '관리처분인가', '착공'];
  const NOW = 2026 + 9.5 / 12;
  const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
  const HOME = { center: [126.99, 37.552], zoom: 11.2, pitch: 40, bearing: -8 };
  const OLD_COLOR = '#c98a5a', CONCRETE = '#b9bcc1';
  const PAGE = 40;

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const fmtYear = y => { const yy = Math.floor(y + 1e-6); const m = Math.min(12, Math.floor((y - yy) * 12 + 1e-6) + 1); return `${yy}년 ${m}월`; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shortName = n => String(n).replace(/\s*(소규모|주택|가로주택)?\s*(재정비촉진|재건축|재개발|정비|도시환경|리모델링)+.*$/, '').replace(/\s*(주택재|주택|주|재)$/, '').trim() || n;
  const NONE = ['==', ['get', '__none__'], 'none'];

  const yearEl = document.getElementById('year');
  let zones = [], selected = null, baseFilters = {}, lastClearKey = '', shown = PAGE;
  const stageOn = STAGES.map(() => true);

  const map = new maplibregl.Map({ container: 'map', style: STYLE_URL, ...HOME, maxPitch: 75, attributionControl: { compact: true } });
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

  map.on('load', async () => {
    const fc = await (await fetch('data/zones.geojson')).json();
    zones = fc.features.map(f => {
      const p = f.properties;
      const z = { ...p, feature: f, on: true, stage: +p.stage, start: +p.start, end: +p.end, label: shortName(p.zone_name || p.name) };
      z.gen = { base: Massing.generate(f) };
      if (p.alt) z.gen.alt = Massing.generate(altFeature(f));
      return Object.assign(z, z.gen.base, { useAlt: false });
    });
    document.getElementById('srcFile').textContent = fc.meta?.boundary_file || '-';
    const sample = zones.some(z => z.is_sample);
    document.getElementById('dataBadge').innerHTML = sample
      ? '<b>샘플 구역</b> · 지도와 현재 건물은 실제(OSM), 구역과 계획 건물은 가상입니다'
      : `<b>실제 정비구역 ${zones.length}곳</b> · 고시·보도 층수 반영 ${zones.filter(z => !z.plan_estimated).length}곳, 나머지는 추정`;

    BUILDING_LAYERS().forEach(id => baseFilters[id] = map.getFilter(id));
    const below = map.getLayer('building') ? 'building' : undefined;

    map.addSource('zones', { type: 'geojson', data: fc, promoteId: 'id' });
    map.addSource('zone-pts', { type: 'geojson', data: { type: 'FeatureCollection', features: zones.map(z => ({ type: 'Feature', properties: { id: z.id, label: z.label, stage: z.stage }, geometry: { type: 'Point', coordinates: z.center } })) } });
    map.addSource('plan', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

    map.addLayer({ id: 'zone-fill', type: 'fill', source: 'zones', paint: { 'fill-opacity': ['case', ['boolean', ['feature-state', 'sel'], false], .5, .28] } }, below);
    map.addLayer({ id: 'zone-line', type: 'line', source: 'zones', paint: { 'line-width': ['interpolate', ['linear'], ['zoom'], 11, .8, 15, 2.5] } }, below);
    // 구역 안의 기존 건물: 철거 전까지 다른 색으로 보여준다
    map.addLayer({
      id: 'zone-old-3d', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 14, filter: NONE,
      paint: { 'fill-extrusion-color': OLD_COLOR, 'fill-extrusion-height': ['get', 'render_height'], 'fill-extrusion-base': ['get', 'render_min_height'], 'fill-extrusion-opacity': .9 },
    });
    map.addLayer({
      id: 'plan-3d', type: 'fill-extrusion', source: 'plan', minzoom: 11,
      paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'h'], 'fill-extrusion-base': ['get', 'b'], 'fill-extrusion-opacity': .96, 'fill-extrusion-vertical-gradient': true },
    });
    map.addLayer({
      id: 'zone-label', type: 'symbol', source: 'zone-pts', minzoom: 12.5,
      layout: { 'text-field': ['get', 'label'], 'text-font': ['Noto Sans Bold'], 'text-size': 12, 'text-offset': [0, -1.2], 'text-padding': 4 },
      paint: { 'text-halo-color': '#ffffff', 'text-halo-width': 1.6 },
    });
    paintZones();

    map.on('click', e => {
      const hit = map.queryRenderedFeatures(e.point, { layers: ['plan-3d', 'zone-label', 'zone-fill'] })[0];
      if (hit) select(zones.find(z => z.id === (hit.properties.zid || hit.properties.id)), true);
    });
    ['zone-fill', 'plan-3d', 'zone-label'].forEach(l => {
      map.on('mouseenter', l, () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', l, () => map.getCanvas().style.cursor = '');
    });

    buildChips(); renderList(); update();
  });

  // 결정 전 변경안: 층수·용적률은 변경안 값(없으면 고시값), 동 수·최저층은 변경안에 있을 때만 쓴다
  function altFeature(f) {
    const p = f.properties, a = p.alt;
    return { ...f, properties: { ...p, far: a.far ?? p.far, max_floors: a.max_floors ?? p.max_floors, min_floors: a.min_floors, buildings: a.buildings, units: a.units ?? p.units, plan_estimated: false } };
  }
  function setVariant(z, alt) {
    z.useAlt = alt && !!z.gen.alt;
    Object.assign(z, z.gen[z.useAlt ? 'alt' : 'base']);
    renderList(); update();
  }
  const fmtNum = v => (+v).toLocaleString();
  function variantBox(z, alt) {
    const g = z.gen[alt ? 'alt' : 'base'], a = z.alt || {};
    const units = alt ? (a.units ?? z.feature.properties.units) : z.feature.properties.units;
    const far = alt ? (a.far ?? z.feature.properties.far) : z.feature.properties.far;
    const k = alt ? '변경안 (결정 전)' : (z.alt ? '결정 고시안' : `계획 단지${g.estimated ? ' (추정 볼륨)' : ''}`);
    const body = `<span class="k">${k}</span><span class="v">${g.planCount}동 · ${g.planMin === g.planMax ? g.planMax : g.planMin + '~' + g.planMax}층</span><span class="d">${units ? fmtNum(units) + '세대 · ' : ''}${z.alt ? (alt && a.far == null ? '용적률은 고시값 적용' : `용적률 ${far}%`) : `볼륨 기준 용적률 약 ${g.gfaFar}%`}</span>${alt && a.label ? `<span class="d">${esc(a.label)}</span>` : ''}`;
    if (!z.alt) return `<div class="after">${body}</div>`;
    return `<button type="button" class="variant${z.useAlt === alt ? ' after' : ''}" data-alt="${alt ? 1 : 0}" aria-pressed="${z.useAlt === alt}">${body}</button>`;
  }

  function BUILDING_LAYERS() { return ['building-3d', 'building'].filter(id => map.getLayer(id)); }

  function stageColorExpr(alpha) {
    const e = ['match', ['get', 'stage']];
    STAGES.forEach((_, i) => e.push(i, tok('--s' + i)));
    e.push('#888888');
    return e;
  }
  function paintZones() {
    map.setPaintProperty('zone-fill', 'fill-color', stageColorExpr());
    map.setPaintProperty('zone-line', 'line-color', stageColorExpr());
    map.setPaintProperty('zone-label', 'text-color', stageColorExpr());
    const ids = ['literal', zones.filter(z => z.on).map(z => z.id)];
    ['zone-fill', 'zone-line', 'zone-label'].forEach(l => map.setFilter(l, ['in', ['get', 'id'], ids]));
  }

  // ---------- simulation ----------
  function progress(z, y) {
    if (!z.on) return { demo: 0, build: 0 };
    return { demo: clamp01((y - (z.start - .6)) / .6), build: clamp01((y - z.start) / (z.end - z.start)) };
  }
  function hexMix(a, b, k) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    return '#' + [16, 8, 0].map(s => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * k).toString(16).padStart(2, '0')).join('');
  }
  const multi = list => ({ type: 'MultiPolygon', coordinates: list.flatMap(z => z.clear) });

  function applyBuildingFilters(y) {
    const on = zones.filter(z => z.on);
    const standing = on.filter(z => z.p.demo < .5);
    const key = on.map(z => z.id).join() + '|' + standing.map(z => z.id).join();
    if (key === lastClearKey) return;
    lastClearKey = key;
    // 기본 OSM 건물: 표시 중인 구역 안의 건물은 모두 빼고, 아직 철거 전인 구역의 건물만 '철거 예정' 레이어로 다시 그린다
    BUILDING_LAYERS().forEach(id => {
      const base = baseFilters[id];
      map.setFilter(id, on.length ? ['all', ...(base ? [base] : []), ['!', ['within', multi(on)]]] : (base || null));
    });
    const oldBase = baseFilters['building-3d'];
    map.setFilter('zone-old-3d', standing.length ? ['all', ...(oldBase ? [oldBase] : []), ['within', multi(standing)]] : NONE);
  }

  function update() {
    if (!zones.length) return;
    const y = +yearEl.value;
    const plan = [];
    zones.forEach(z => {
      const p = z.p = progress(z, y);
      if (p.build <= 0) return;
      const st = tok('--s' + z.stage) || '#888888';
      const colors = {
        res: hexMix('#fdfaf3', st, .3), crown: hexMix('#d8cfc0', st, .25),
        shop: '#e2d2bb', office: hexMix('#9fb6c9', st, .1),
      };
      const maxD = Math.max(1, ...z.parts.map(q => q.dist));
      z.parts.forEach(q => {
        // 저층 상가·포디움이 먼저, 단지 안쪽에서 바깥쪽 순서로 올라간다
        const lag = q.kind === 'shop' ? 0 : .08 + q.dist / maxD * .22;
        const k = ease(clamp01((p.build - lag) / (1 - lag)));
        if (k <= 0) return;
        if (q.kind === 'crown' && k < 1) return;
        plan.push({ type: 'Feature', properties: { zid: z.id, b: q.b * k, h: q.h * k, color: p.build >= 1 ? colors[q.kind] : hexMix(CONCRETE, colors[q.kind], k * .35) }, geometry: { type: 'Polygon', coordinates: [q.ring] } });
      });
    });
    map.getSource('plan').setData({ type: 'FeatureCollection', features: plan });
    applyBuildingFilters(y);

    document.getElementById('yearOut').textContent = fmtYear(y);
    const on = zones.filter(z => z.on);
    const building = on.filter(z => z.p.demo > 0 && z.p.build < 1).length, done = on.filter(z => z.p.build >= 1).length;
    document.getElementById('yearState').textContent =
      (Math.abs(y - NOW) < .05 ? '현재 · ' : '') + `공사 중 ${building}곳 · 준공 ${done}곳`;
    renderDetail();
  }
  yearEl.addEventListener('input', () => { stopPlay(); update(); });
  document.getElementById('nowMark').style.left = `calc(${(NOW - 2026) / 14 * 100}% - 1px)`;

  let playing = 0;
  const btnPlay = document.getElementById('btnPlay');
  function stopPlay() { if (playing) { cancelAnimationFrame(playing); playing = 0; btnPlay.textContent = '▶ 변화 재생'; } }
  btnPlay.addEventListener('click', () => {
    if (playing) return stopPlay();
    if (+yearEl.value >= 2039.95) yearEl.value = NOW;
    btnPlay.textContent = '■ 정지';
    let last = performance.now();
    const step = t => {
      const v = Math.min(2040, +yearEl.value + (t - last) / 1000 * 1.2); last = t;
      yearEl.value = v; update();
      if (v >= 2040) { playing = 0; btnPlay.textContent = '▶ 변화 재생'; return; }
      playing = requestAnimationFrame(step);
    };
    playing = requestAnimationFrame(step);
  });
  document.getElementById('btnNow').addEventListener('click', () => { stopPlay(); yearEl.value = NOW; update(); });
  document.getElementById('btnAll').addEventListener('click', () => map.flyTo(HOME));

  // ---------- panel ----------
  const chipsEl = document.getElementById('chips'), listEl = document.getElementById('zlist'), detailEl = document.getElementById('detail');
  const qEl = document.getElementById('q'), moreEl = document.getElementById('more');
  function buildChips() {
    STAGES.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.style.setProperty('--c', `var(--s${i})`);
      b.setAttribute('aria-pressed', 'true');
      b.innerHTML = `<span class="dot"></span>${s}<span class="n">${zones.filter(z => z.stage === i).length}</span>`;
      b.addEventListener('click', () => {
        stageOn[i] = !stageOn[i]; b.setAttribute('aria-pressed', String(stageOn[i]));
        zones.forEach(z => z.on = stageOn[z.stage]);
        paintZones(); shown = PAGE; renderList(); update();
      });
      chipsEl.appendChild(b);
    });
  }
  function filtered() {
    const q = qEl.value.trim();
    return zones
      .filter(z => z.on && (!q || [z.name, z.zone_name, z.gu, z.jibun].some(v => String(v || '').includes(q))))
      .sort((a, b) => b.stage - a.stage || a.start - b.start);
  }
  function renderList() {
    const list = filtered();
    document.getElementById('zcount').textContent = list.length;
    listEl.innerHTML = '';
    list.slice(0, shown).forEach(z => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'zcard';
      b.style.setProperty('--c', `var(--s${z.stage})`);
      b.setAttribute('aria-pressed', String(z === selected));
      b.innerHTML = `<span><span class="t">${esc(z.label)}${z.alt ? ` <span class="tag">${z.useAlt ? '변경안 표시 중' : '변경안 있음'}</span>` : ''}</span><span class="m">${esc(z.gu)} · ${esc(z.type)} · <span class="pill">${esc(z.progress)}</span></span></span>
        <span class="f">${z.planMax}층<small>${Math.floor(z.end)}년 준공 예상</small></span>`;
      b.addEventListener('click', () => select(z, true));
      listEl.appendChild(b);
    });
    moreEl.hidden = list.length <= shown;
    if (!list.length) listEl.innerHTML = '<p class="note">조건에 맞는 구역이 없습니다. 검색어나 단계 필터를 바꿔 보세요.</p>';
  }
  qEl.addEventListener('input', () => { shown = PAGE; renderList(); });
  moreEl.addEventListener('click', () => { shown += PAGE; renderList(); });

  function renderDetail() {
    const z = selected;
    if (!z) {
      const on = zones.filter(x => x.on);
      detailEl.style.removeProperty('--c');
      detailEl.innerHTML = `<h2>요약</h2>
        <dl class="spec">${STAGES.map((s, i) => `<dt><span class="pill" style="--c:var(--s${i})">${s}</span></dt><dd class="num">${on.filter(x => x.stage === i).length}곳</dd>`).join('')}</dl>
        <p class="note">지도나 목록에서 구역을 선택하면 진행단계와 추정 계획이 표시됩니다. 3D 건물은 지도를 크게 확대하면 보입니다.</p>`;
      return;
    }
    const p = z.p || { demo: 0, build: 0 };
    const status = !z.on ? '필터에서 숨김' : p.build >= 1 ? '준공 (시뮬레이션)' : p.build > 0 ? `공사 중 · 공정 ${Math.round(p.build * 100)}%` : p.demo > 0 ? '이주·철거 중' : '착공 전';
    const est = '<span class="tag">추정</span>';
    detailEl.style.setProperty('--c', `var(--s${z.stage})`);
    detailEl.innerHTML = `
      <h2>선택 구역</h2>
      <div class="dhead"><strong>${esc(z.label)}</strong><span class="pill">${STAGES[z.stage]}</span></div>
      <p class="note">${esc(z.name)}<br>${esc(z.gu)} ${esc(z.jibun)} · 진행단계 원문: ${esc(z.progress)}</p>
      <div class="steps">${STAGES.map((_, i) => `<div class="${i <= z.stage ? 'done' : ''}"></div>`).join('')}</div>
      <div class="steps-l"><span>계획 수립</span><span>착공</span></div>
      ${z.complex_name ? `<p class="note">${esc(z.complex_name)}</p>` : ''}
      <div class="compare${z.alt ? ' two' : ''}">${variantBox(z, false)}${z.alt ? variantBox(z, true) : ''}</div>
      ${z.alt ? `<p class="note">결정 고시값과 진행 중인 변경안(결정 전)이 다릅니다. 위에서 눌러 3D 볼륨을 바꿔 볼 수 있습니다.${z.alt.url ? ` <a href="${esc(z.alt.url.split(/\s+/)[0])}" target="_blank" rel="noopener">변경안 자료</a>` : ''}</p>` : ''}
      <dl class="spec">
        <dt>사업 유형</dt><dd>${esc(z.type)}</dd>
        <dt>고시 구역명</dt><dd>${esc(z.zone_name || '-')}</dd>
        <dt>구역 면적</dt><dd class="num">${z.areaM2.toLocaleString()}㎡</dd>
        <dt>계획 용적률</dt><dd class="num">${z.useAlt && z.alt.far ? z.alt.far + '% (변경안)' : z.far + '% ' + (z.far_estimated ?? z.estimated ? est : '')}</dd>
        <dt>볼륨 기준 용적률</dt><dd class="num">약 ${z.gfaFar}%</dd>
        <dt>착공 → 준공</dt><dd class="num">${fmtYear(z.start)} → ${fmtYear(z.end)} ${z.time_estimated ? est : ''}</dd>
        <dt>${fmtYear(+yearEl.value)} 상태</dt><dd>${status}</dd>
        <dt>계획 수치 출처</dt><dd>${z.source_url ? `<a href="${esc(String(z.source_url).split(/\s+/)[0])}" target="_blank" rel="noopener">고시·보도 자료</a>` : '사업유형 기반 추정'}</dd>
        <dt>구역·단계 출처</dt><dd>${esc(z.source || '-')}</dd>
      </dl>
      ${z.note ? `<p class="note">${esc(z.note)}</p>` : ''}
      <button type="button" id="clearSel">선택 해제</button>`;
    detailEl.querySelectorAll('.variant').forEach(b => b.onclick = () => setVariant(z, b.dataset.alt === '1'));
    document.getElementById('clearSel').onclick = () => { selected = null; setSel(); renderList(); renderDetail(); };
  }

  function setSel() {
    zones.forEach(z => map.setFeatureState({ source: 'zones', id: z.id }, { sel: z === selected }));
  }
  function select(z, fly) {
    if (!z) return;
    selected = z; setSel(); renderList(); renderDetail();
    if (fly) {
      const r = Math.sqrt(z.areaM2);
      map.flyTo({ center: z.center, zoom: Math.max(14.6, Math.min(16.8, 20.2 - Math.log2(r))), pitch: 60, bearing: map.getBearing(), essential: true,
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1600 });
    }
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (zones.length) { paintZones(); update(); } });
})();
