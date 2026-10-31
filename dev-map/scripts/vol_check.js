// usage: node vol_check.js <web dir> [id...]  — 볼륨 용적률 / 계획 용적률 비율
const fs = require('fs'), path = require('path');
const dir = process.argv[2], ids = process.argv.slice(3);
global.window = global; eval(fs.readFileSync(path.join(dir, 'massing.js'), 'utf8'));
const fc = JSON.parse(fs.readFileSync(path.join(dir, 'data/zones.geojson'), 'utf8'));
const rs = [];
for (const f of fc.features) {
  const g = Massing.generate(f), p = f.properties;
  const far = +p.far; const r = g.gfaFar / far; g.far = far;
  rs.push(r);
  if (ids.includes(p.id) || ids.some(i => (p.zone_name || p.name || '').includes(i)))
    console.log(p.id, p.zone_name || p.name, `${g.planCount}동 ${g.planMin}~${g.planMax}층 far ${g.far} vol ${g.gfaFar} ratio ${r.toFixed(2)}`);
}
rs.sort((a, b) => a - b);
const err = rs.map(r => Math.abs(r - 1)).sort((a, b) => a - b);
console.log(`zones ${rs.length}, real floors ${fc.features.filter(f => !f.properties.plan_estimated).length}, median err ${(err[err.length >> 1] * 100).toFixed(1)}%, <0.6 ${rs.filter(r => r < .6).length}, >1.5 ${rs.filter(r => r > 1.5).length}`);
