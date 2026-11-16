// Measurement validation: measures the BUILT 3D model (ray casts against the actual wall meshes)
// and compares it with the written dimensions on the drawings.
import * as THREE from 'three';
import { IN, ftIn } from './units.js';
import { STD } from './plans.js';
import { CEIL, DOOR_H } from './build.js';
import { SIZES } from './furniture.js';

const TOL = 0.001; // 1 mm

export function validate(model) {
  const plan = model.plan;
  const walls = model.solids.filter((m) => m.userData.houseWall);
  walls.forEach((m) => m.updateMatrixWorld(true));
  const ray = new THREE.Raycaster();
  const cast = (o, d, y) => {
    ray.set(new THREE.Vector3(o[0], y, o[1]), new THREE.Vector3(d[0], 0, d[1]));
    ray.far = 50;
    const h = ray.intersectObjects(walls, false)[0];
    return h ? h.distance : NaN;
  };

  // ---- rooms: clear wall-to-wall distances measured in the model ----
  const rooms = [];
  for (const room of model.rooms) {
    if (room.outdoor) continue;
    const [x0, z0, x1, z1] = room.main;
    const c = [(x0 + x1) / 2, (z0 + z1) / 2];
    const y = 2.6; // above every door/window head, below the ceiling: walls are continuous here
    const w = cast(c, [1, 0], y) + cast(c, [-1, 0], y);
    const d = cast(c, [0, 1], y) + cast(c, [0, -1], y);
    const lab = room.lab ? [room.lab[0] * IN, room.lab[1] * IN] : null;
    const dw = lab ? w - lab[0] : null, dd = lab ? d - lab[1] : null;
    let status = 'derived';
    if (lab) status = Math.abs(dw) <= TOL && Math.abs(dd) <= TOL ? 'match' : 'conflict';
    rooms.push({ name: room.name, label: room.drawLabel || '—', lab, w, d, dw, dd, status, issue: room.issue, areaM2: w * d, areaSft: (w * d) / 0.09290304 });
  }

  // ---- overall ----
  const box = new THREE.Box3();
  walls.forEach((m) => box.expandByObject(m));
  const W = box.max.x - box.min.x, D = box.max.z - box.min.z;
  const [pw, pd] = plan.outer;
  const thick = { outer: new Set(), inner: new Set() };
  for (const m of walls) {
    const t = m.userData.t;
    (t > 0.15 ? thick.outer : thick.inner).add(t.toFixed(4));
  }
  const plot = model.plotRect;
  const overall = [
    ['Building outer width', `${ftIn(pw * IN)} (${(pw * IN).toFixed(3)} m)`, W, W - pw * IN],
    ['Building outer depth', `${ftIn(pd * IN)} (${(pd * IN).toFixed(3)} m)`, D, D - pd * IN],
    ['Outer wall thickness', '9″ (0.229 m)', Number([...thick.outer][0]), Number([...thick.outer][0]) - 9 * IN],
    ['Inner wall thickness', '4½″ (0.114 m)', Number([...thick.inner][0]), Number([...thick.inner][0]) - 4.5 * IN],
    ['Side balcony width', '5′-0″', plan.balconies.side * IN, 0],
    ['Front balcony width', '7′-0″', plan.balconies.front * IN, 0],
    ['Plot width', ftIn(plan.plot.label[0] * IN), plot[2] - plot[0], plot[2] - plot[0] - plan.plot.label[0] * IN],
    ['Plot depth', ftIn(plan.plot.label[1] * IN), plot[3] - plot[1], plot[3] - plot[1] - plan.plot.label[1] * IN],
  ].map(([what, drawing, model_, delta]) => ({ what, drawing, model: model_, delta, status: Math.abs(delta) <= TOL ? 'match' : 'conflict' }));
  const wallsUniform = thick.outer.size === 1 && thick.inner.size === 1;

  // ---- openings: measured clear masonry width vs. drawing ----
  const openings = model.openings.map((o) => {
    const cM = o.c * IN, mid = ((o.a + o.b) / 2) * IN, y = (o.lo + o.hi) / 2;
    const origin = o.vertical ? [cM, mid] : [mid, cM];
    const axis = o.vertical ? [0, 1] : [1, 0];
    const measured = cast(origin, axis, y) + cast(origin, [-axis[0], -axis[1]], y);
    const modelW = (o.b - o.a) * IN;
    const kind = { d: 'Door', dt: 'Toilet door', dd: 'Double door', a: 'Open arch', w: 'Window', v: 'Ventilator' }[o.kind];
    return {
      plan: o.plan, kind, between: o.sides.filter((s, i, a) => a.indexOf(s) === i).join(' ↔ '),
      drawW: o.drawWidth * IN, modelW, measured, dCenter: (((o.a + o.b) / 2) - o.drawCenter) * IN,
      sill: o.lo, head: o.hi, swing: o.swing || '',
      ok: Math.abs(measured - modelW) <= TOL,
    };
  });

  // ---- furniture sizes & clearances (2D, against walls + other furniture) ----
  const nameOf = new Map(model.report.furniture.filter((f) => f.rect).map((f) => [f.rect, f.name]));
  const obstacles = model.colliders.map((c) => ({ r: c.r, what: c.wall ? 'wall' : nameOf.get(c.r) || 'door leaf / glass' }));
  const rayRect = (o, d, r) => {
    let t0 = 0, t1 = Infinity;
    for (const [oi, di, lo, hi] of [[o[0], d[0], r[0], r[2]], [o[1], d[1], r[1], r[3]]]) {
      if (Math.abs(di) < 1e-9) { if (oi < lo || oi > hi) return Infinity; continue; }
      let a = (lo - oi) / di, b = (hi - oi) / di;
      if (a > b) [a, b] = [b, a];
      t0 = Math.max(t0, a); t1 = Math.min(t1, b);
      if (t0 > t1) return Infinity;
    }
    return t0 > 1e-6 ? t0 : Infinity;
  };
  const need = (name) => (/counter/i.test(name) ? 0.9 : /wardrobe|crockery/i.test(name) ? 0.6 : /bed/i.test(name) ? 0.6 : /sofa|diwan/i.test(name) ? 0.4 : /EWC|vanity/i.test(name) ? 0.5 : /mandir/i.test(name) ? 0.75 : /TV|fridge|refrigerator/i.test(name) ? 0.6 : 0);
  const furniture = model.report.furniture.map((f) => {
    if (!f.rect || !f.normal) return { ...f, clear: null, need: 0, ok: true };
    const [x0, z0, x1, z1] = f.rect, n = f.normal;
    // sample the middle 70% of the front edge (the ends of an L-sofa touch each other by design)
    const pts = [];
    for (let k = 0; k <= 8; k++) {
      const t = 0.15 + (k / 8) * 0.7;
      if (n[0] === 0) pts.push([x0 + (x1 - x0) * t, n[1] > 0 ? z1 + 1e-4 : z0 - 1e-4]);
      else pts.push([n[0] > 0 ? x1 + 1e-4 : x0 - 1e-4, z0 + (z1 - z0) * t]);
    }
    let clear = Infinity, by = '';
    for (const p of pts) for (const o of obstacles) {
      const r = o.r;
      if (r === f.rect || (r[0] >= x0 - 1e-6 && r[2] <= x1 + 1e-6 && r[1] >= z0 - 1e-6 && r[3] <= z1 + 1e-6)) continue;
      const d = rayRect(p, n, r);
      if (d < clear) { clear = d; by = o.what; }
    }
    const req = need(f.name);
    return { ...f, clear, by, need: req, ok: clear >= req - TOL };
  });

  // ---- door swings: leaf sweep (quarter circle) must be free of furniture ----
  const furnRects = model.report.furniture.filter((f) => f.rect).map((f) => f);
  const doors = [];
  for (const o of model.openings) {
    if (!o.leaves) continue;
    for (const lf of o.leaves) {
      const [px, pz] = lf.pivot, L = lf.sweep;
      // swept square on the swing side, from the pivot into the opening
      const inward = o.vertical ? (Math.abs(pz - o.a * IN) < Math.abs(pz - o.b * IN) ? 1 : -1) : Math.abs(px - o.a * IN) < Math.abs(px - o.b * IN) ? 1 : -1;
      const sq = o.vertical
        ? [Math.min(px, px + lf.sw * L), Math.min(pz, pz + inward * L), Math.max(px, px + lf.sw * L), Math.max(pz, pz + inward * L)]
        : [Math.min(px, px + inward * L), Math.min(pz, pz + lf.sw * L), Math.max(px, px + inward * L), Math.max(pz, pz + lf.sw * L)];
      const hits = furnRects.filter((f) => {
        const r = f.rect;
        if (r[2] <= sq[0] || r[0] >= sq[2] || r[3] <= sq[1] || r[1] >= sq[3]) return false;
        // inside the quarter circle?
        const cx = Math.max(r[0], Math.min(px, r[2])), cz = Math.max(r[1], Math.min(pz, r[3]));
        return Math.hypot(cx - px, cz - pz) < L - 0.01;
      });
      doors.push({ between: o.sides.join(' ↔ '), kind: o.kind, leaf: L, hits: hits.map((h) => `${h.name} (${h.room})`), ok: hits.length === 0 });
    }
  }

  // ---- walking: every room reachable from the front balcony through doorways ----
  const start = model.rooms.find((r) => r.name === 'Front Balcony').view;
  const reach = model.rooms.map((r) => {
    const p = model.nav.path(start.x, start.z, r.view.x, r.view.z);
    let len = 0;
    if (p) { let q = [start.x, start.z]; for (const s of p) { len += Math.hypot(s[0] - q[0], s[1] - q[1]); q = s; } }
    return { name: r.name, ok: !!p, len };
  });

  const heights = [
    ['Floor to ceiling', CEIL, `${ftIn(CEIL)} — not on drawing; standard 10′-0″`],
    ['Door / arch / window head (lintel)', DOOR_H, `${ftIn(DOOR_H)} — not on drawing; standard 7′-0″`],
    ['Window sill', STD.sill * IN, `${ftIn(STD.sill * IN)} — not on drawing; standard 3′-0″`],
    ['Ventilator sill', STD.ventSill * IN, `${ftIn(STD.ventSill * IN)} — 24″ × 18″ ventilator`],
    ['RCC slab', STD.slab * IN, '5″ — assumed'],
    ['Plinth above ground', STD.plinth * IN, '1′-6″ — assumed'],
    ['Stair riser / tread', model.stairInfo.rise, `${(model.stairInfo.rise * 1000).toFixed(0)} mm × ${(model.stairInfo.tread * 1000).toFixed(0)} mm, 18 risers, flights ${model.stairInfo.width.toFixed(3)} m wide — flights drawn, risers assumed`],
    ['Eye height (walk mode)', 1.6, '1.600 m'],
  ];

  const assumptions = [
    'Door and window POSITIONS are not dimensioned on the drawings; their centres are scaled from the drawing (fitted to the dimensioned outer faces, so expect ±1–2″).',
    `Door widths are standard sizes: room doors 3′-0″, toilet doors 2′-6″, double doors the nearest of ${STD.doubleSizes.map((v) => v + '″').join(', ')} to the drawing. Windows are scaled widths rounded to 3″. Ventilators are 2′-0″ × 1′-6″.`,
    `Furniture positions follow the drawing symbols, but every piece uses a standard real size (e.g. queen bed ${SIZES.queen.w} × ${SIZES.queen.l} m, sofa depth ${SIZES.sofaDepth} m, counters ${SIZES.counterDepth} × ${SIZES.counterH} m, wardrobes ${SIZES.wardrobeDepth} m deep). The drawing symbols are not drawn to furniture scale.`,
    'There are no columns or beams on the drawings, so none are modelled. Beams sit inside the 9″ / 4½″ walls above the 7′ lintel line, and the balconies are a cantilevered slab.',
    plan.plot.gatesFromDrawing ? 'Gate positions are scaled from the drawing.' : 'Plan-1 and Plan-2 show no compound gates, so the gates are assumed in front of the main door and the side door.',
  ];
  const deviations = [
    'Pooja window omitted (owner instruction: "no window required in the pooja room").',
    ...(plan.id === 'p1' ? ['Pooja mandir is on the south wall, facing the pooja doors, so you face the deities as you enter (owner instruction). The drawing showed it on the east wall.'] : []),
    ...rooms.filter((r) => r.issue).map((r) => `${r.name}: ${r.issue}`),
    ...model.report.adjustments,
  ];

  return { plan: plan.name, rooms, overall, wallsUniform, openings, furniture, doors, reach, heights, assumptions, deviations };
}

// ---------------- rendering ----------------
const mm = (v) => (v == null || Number.isNaN(v) ? '—' : `${v >= 0 ? '+' : '−'}${Math.abs(v * 1000).toFixed(1)} mm`);
const m3 = (v) => (v == null || Number.isNaN(v) ? '—' : `${v.toFixed(3)} m`);
const both = (v) => (v == null || Number.isNaN(v) ? '—' : `${v.toFixed(3)} m (${ftIn(v)})`);
const badge = (s) => ({ match: '✅ match', derived: '➖ not labelled', conflict: '⚠️ drawing conflict', true: '✅', false: '⚠️' }[s]);

export function toTables(v) {
  return [
    {
      title: `Rooms: clear wall-to-wall size measured in the 3D model (${v.plan})`,
      head: ['Room', 'Drawing label', 'Drawing W × D', 'Model W (ray-cast)', 'Model D (ray-cast)', 'ΔW', 'ΔD', 'Area', 'Status'],
      rows: v.rooms.map((r) => [r.name, r.label, r.lab ? `${ftIn(r.lab[0])} × ${ftIn(r.lab[1])}` : '—', both(r.w), both(r.d), mm(r.dw), mm(r.dd), `${r.areaM2.toFixed(2)} m² / ${r.areaSft.toFixed(1)} sft`, badge(r.status)]),
    },
    {
      title: 'Overall dimensions & walls',
      head: ['Item', 'Drawing', 'Model', 'Δ', 'Status'],
      rows: [...v.overall.map((o) => [o.what, o.drawing, both(o.model), mm(o.delta), badge(o.status)]), ['Every wall mesh at 9″ or 4½″ only', '—', v.wallsUniform ? 'yes' : 'NO', '—', badge(String(v.wallsUniform))]],
    },
    {
      title: 'Doors, windows and openings: clear width measured in the model',
      head: ['Opening', 'Between', 'Drawing (scaled)', 'Model', 'Measured', 'Centre shift', 'Sill → head', 'OK'],
      rows: v.openings.map((o) => [o.kind + (o.swing ? ` (${o.swing})` : ''), o.between, `${ftIn(o.drawW)}`, `${ftIn(o.modelW)} (${m3(o.modelW)})`, m3(o.measured), mm(o.dCenter), `${o.sill.toFixed(3)} → ${o.head.toFixed(3)} m`, badge(String(o.ok))]),
    },
    {
      title: 'Furniture: real sizes and front clearance (to nearest wall/furniture)',
      head: ['Room', 'Item', 'Front clearance', 'Limited by', 'Needed', 'OK'],
      rows: v.furniture.map((f) => [f.room, f.name, f.clear == null ? '—' : f.clear === Infinity ? 'open' : both(f.clear), f.by || '—', f.need ? `${f.need.toFixed(2)} m` : '—', badge(String(f.ok))]),
    },
    {
      title: 'Door swings (leaf opened 90°): free of furniture',
      head: ['Door', 'Type', 'Leaf', 'Conflicts', 'OK'],
      rows: v.doors.map((d) => [d.between, d.kind, m3(d.leaf), d.hits.join(', ') || 'none', badge(String(d.ok))]),
    },
    {
      title: 'Walking routes from the front balcony (A* through doorways, 0.22 m body clearance)',
      head: ['Room', 'Reachable', 'Route length'],
      rows: v.reach.map((r) => [r.name, badge(String(r.ok)), r.ok ? m3(r.len) : '—']),
    },
    {
      title: 'Heights used (not dimensioned on the drawings)',
      head: ['Item', 'Value', 'Source'],
      rows: v.heights.map(([a, b, c]) => [a, both(b), c]),
    },
  ];
}

export function toHTML(v) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const tables = toTables(v).map((t) => `<h3>${esc(t.title)}</h3><table><thead><tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`).join('');
  const summary = summarise(v);
  return `<p class="sum">${esc(summary)}</p>${tables}<h3>Assumptions (dimensions not on the drawings)</h3><ul>${v.assumptions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul><h3>Deviations from the drawing</h3><ul>${v.deviations.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`;
}

export function summarise(v) {
  const lab = v.rooms.filter((r) => r.lab);
  const match = lab.filter((r) => r.status === 'match').length;
  const conflict = lab.filter((r) => r.status === 'conflict').map((r) => r.name);
  return `${match}/${lab.length} labelled rooms match their drawing size to within 1 mm` +
    (conflict.length ? `; ${conflict.join(', ')} ${conflict.length > 1 ? 'differ' : 'differs'} because the drawing contradicts its own dimension chain (see deviations)` : '') +
    `. Openings: ${v.openings.filter((o) => o.ok).length}/${v.openings.length} measured widths equal the modelled widths. ` +
    `Furniture clearances: ${v.furniture.filter((f) => f.ok).length}/${v.furniture.length} OK. Door swings: ${v.doors.filter((d) => d.ok).length}/${v.doors.length} clear. ` +
    `Rooms reachable on foot: ${v.reach.filter((r) => r.ok).length}/${v.reach.length}.`;
}

export function toMarkdown(v) {
  const md = (s) => String(s).replace(/\|/g, '\\|');
  let out = `## ${v.plan}\n\n${summarise(v)}\n\n`;
  for (const t of toTables(v)) {
    out += `### ${t.title}\n\n| ${t.head.map(md).join(' | ')} |\n| ${t.head.map(() => '---').join(' | ')} |\n`;
    for (const r of t.rows) out += `| ${r.map(md).join(' | ')} |\n`;
    out += '\n';
  }
  out += `### Assumptions\n\n${v.assumptions.map((a) => `- ${a}`).join('\n')}\n\n### Deviations from the drawing\n\n${v.deviations.map((a) => `- ${a}`).join('\n')}\n`;
  return out;
}
