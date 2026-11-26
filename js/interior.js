// "Warm luxe" interior: the owner's sample designs (Downloads/HOME) applied to the to-scale model. Everything here is
// placed by rule from the plan's own rooms, walls, openings and furniture, so it fits any plan without moving a wall,
// door or window:
//  - TV-facing sofa: a quilted white panel wall behind it with oak slat strips and LED lines
//  - other sofas: a framed artwork above (lotus / Radha-inspired relief where the room has no TV, line art otherwise)
//    and round brass wall sconces
//  - sitting areas: a branch-crystal chandelier over the coffee table (it replaces the ceiling fan if they would clash)
//  - a room entered by a main double door with sofas in it: a brass medallion screen beside the door, shielding the seats
//  - a sitting room without a TV: an arched display unit on the wall the sofa faces
//  - dining: three backlit arched niches with a palm mural on the longest plain wall, and a double-ring LED chandelier
//  - kitchen peninsula: a hanging walnut shelf with plants and LED over it, walnut slats with a toe glow on its back
//  - beds: a full-height feature wall behind the bed (grey channels / oak grid / white flutes in turn) and globe pendants
// The furniture itself changes style in furniture.js (kit(M, 'luxe')).
import * as THREE from 'three';
import { boxGeo } from './materials.js';
import { COVE } from './furniture.js';

const TEX = new Map();
const texMat = (url, emissive = 0) => {
  if (!TEX.has(url + emissive)) {
    const t = new THREE.TextureLoader().load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    TEX.set(url + emissive, new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, ...(emissive ? { emissiveMap: t, emissive: '#ffffff', emissiveIntensity: emissive } : {}) }));
  }
  return TEX.get(url + emissive);
};

export function buildInterior({ M, rooms, fixtures, furniture, openings, walls, ceil }) {
  const group = new THREE.Group(); // wall-mounted and floor-standing pieces
  const hanging = new THREE.Group(); // chandeliers and pendants (shown with the ceilings, inside views only)
  const items = []; // floor-standing pieces: { room, name, rect, block }
  const noFan = new Set(); // rooms whose fan gives way to a chandelier
  const notes = [];
  const box = (w, h, d, mat, x, y, z, parent = group) => {
    const m = new THREE.Mesh(boxGeo(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const sphere = (r, mat, x, y, z, parent = hanging) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const byName = (n) => rooms.find((r) => r.name === n);
  const H = COVE; // feature walls stop under the cove border
  const groove = M.solid('#d3ccc0', { roughness: 0.6 });

  // ---------- wall faces ----------
  // side n: face z = r[1] (into +z); s: z = r[3] (into −z); w: x = r[0] (into +x); e: x = r[2] (into −x)
  const rectAt = (room, side, along) => room.rects.find((q) => (side === 'n' || side === 's' ? along >= q[0] - 0.01 && along <= q[2] + 0.01 : along >= q[1] - 0.01 && along <= q[3] + 0.01)) || room.main;
  const faceOf = (room, side, along) => { const r = rectAt(room, side, along); return { n: r[1], s: r[3], w: r[0], e: r[2] }[side]; };
  const spanOf = (room, side, along) => { const r = rectAt(room, side, along); return side === 'n' || side === 's' ? [r[0], r[2]] : [r[1], r[3]]; };
  const sgn = { n: 1, s: -1, w: 1, e: -1 };
  const vertical = (side) => side === 'w' || side === 'e';
  // a box standing on a wall face: w along the wall, h high, t thick, `off` proud of the face
  const put = (side, f, w, h, t, mat, along, y, off = 0, parent = group) => {
    const d = f + sgn[side] * (off + t / 2);
    return vertical(side) ? box(t, h, w, mat, d, y, along, parent) : box(w, h, t, mat, along, y, d, parent);
  };
  const onFace = (side, f) => (o) => o.vertical === vertical(side) && Math.abs(o.c - f) < o.t / 2 + 0.03;
  // parts of the wall line that are solid wall (a removed wall leaves an open side)
  const covered = (side, f, a0, a1) => {
    let segs = [];
    for (const w of walls) {
      const vert = Math.abs(w.x0 - w.x1) < 1e-6;
      if (vert !== vertical(side)) continue;
      const c = vert ? w.x0 : w.z0;
      if (Math.abs(Math.abs(c - f) - w.t / 2) > 0.03) continue;
      const [p, q] = vert ? [Math.min(w.z0, w.z1), Math.max(w.z0, w.z1)] : [Math.min(w.x0, w.x1), Math.max(w.x0, w.x1)];
      const u = Math.max(a0, p), v = Math.min(a1, q);
      if (v - u > 0.05) segs.push([u, v]);
    }
    segs.sort((p, q) => p[0] - q[0]);
    return segs.reduce((acc, s) => (acc.length && s[0] <= acc[acc.length - 1][1] + 0.01 ? (acc[acc.length - 1][1] = Math.max(acc[acc.length - 1][1], s[1]), acc) : [...acc, s]), []);
  };
  // wall rectangles [a0, y0, a1, y1] between a0–a1 and y0–y1, cut around openings, on solid wall only
  const clearRects = (side, f, a0, a1, y0, y1) => {
    let rects = covered(side, f, a0, a1).map(([u, v]) => [u, y0, v, y1]);
    for (const o of openings.filter(onFace(side, f))) {
      const h = [o.a - 0.06, o.lo - 0.06, o.b + 0.06, o.hi + 0.08];
      rects = rects.flatMap((r) => {
        if (h[2] <= r[0] || h[0] >= r[2] || h[3] <= r[1] || h[1] >= r[3]) return [r];
        const out = [];
        if (h[1] > r[1]) out.push([r[0], r[1], r[2], h[1]]);
        if (h[3] < r[3]) out.push([r[0], h[3], r[2], r[3]]);
        const ya = Math.max(r[1], h[1]), yb = Math.min(r[3], h[3]);
        if (h[0] > r[0]) out.push([r[0], ya, h[0], yb]);
        if (h[2] < r[2]) out.push([h[2], ya, r[2], yb]);
        return out.filter((q) => q[2] - q[0] > 0.05 && q[3] - q[1] > 0.05);
      });
    }
    return rects;
  };
  // full-height stretches of solid wall free of any opening
  const freeRuns = (side, f, a0, a1) => {
    let segs = covered(side, f, a0, a1);
    for (const o of openings.filter(onFace(side, f))) segs = segs.flatMap(([p, q]) => (o.b + 0.08 <= p || o.a - 0.08 >= q ? [[p, q]] : [[p, o.a - 0.08], [o.b + 0.08, q]].filter(([u, v]) => v - u > 0.2)));
    return segs;
  };
  const overlaps = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

  // ---------- pieces ----------
  const quilted = (side, f, a0, a1) => {
    // white quilted squares (450 mm) with grooves; oak slat strips and an LED line at both ends
    const strip = 0.3;
    for (const [u, y0, v, y1] of clearRects(side, f, a0, a1, 0.1, H)) {
      put(side, f, v - u, y1 - y0, 0.025, M.lacquer, (u + v) / 2, (y0 + y1) / 2);
      for (let a = u + strip + 0.45; a < v - strip - 0.1; a += 0.45) put(side, f, 0.008, y1 - y0, 0.006, groove, a, (y0 + y1) / 2, 0.025);
      for (let y = y0 + 0.45; y < y1 - 0.1; y += 0.45) put(side, f, v - u - 2 * strip, 0.008, 0.006, groove, (u + v) / 2, y, 0.025);
      for (const e of [u + strip / 2, v - strip / 2]) {
        put(side, f, strip, y1 - y0, 0.03, M.walnut, e, (y0 + y1) / 2);
        for (let k = 0; k < 5; k++) put(side, f, 0.03, y1 - y0, 0.03, M.oak, e - strip / 2 + 0.03 + k * 0.06, (y0 + y1) / 2, 0.03);
      }
      for (const e of [u + strip + 0.01, v - strip - 0.01]) put(side, f, 0.012, y1 - y0, 0.012, M.lamp, e, (y0 + y1) / 2, 0.02);
    }
  };
  const artwork = (side, f, along, url, w, h, yc) => {
    const rects = clearRects(side, f, along - w / 2 - 0.08, along + w / 2 + 0.08, yc - h / 2 - 0.08, yc + h / 2 + 0.08);
    if (rects.length !== 1 || rects[0][2] - rects[0][0] < w + 0.15) return false; // an opening is in the way
    put(side, f, w + 0.06, h + 0.06, 0.03, M.brass, along, yc);
    plane(side, f, w, h, texMat(url), along, yc, 0.032);
    return true;
  };
  // an image plane facing into the room (full texture on it)
  const plane = (side, f, w, h, mat, along, y, off) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.rotation.y = { n: 0, s: Math.PI, w: Math.PI / 2, e: -Math.PI / 2 }[side];
    const d = f + sgn[side] * off;
    if (vertical(side)) m.position.set(d, y, along); else m.position.set(along, y, d);
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  const sconces = (side, f, along, half, y) => {
    for (const s of [-1, 1]) {
      const a = along + s * half;
      if (clearRects(side, f, a - 0.12, a + 0.12, y - 0.12, y + 0.12).length !== 1) continue;
      put(side, f, 0.18, 0.18, 0.03, M.brass, a, y);
      put(side, f, 0.14, 0.14, 0.012, M.lamp, a, y, 0.03);
      const p = put(side, f, 0.7, 1.1, 0.001, M.glowFan, a, y + 0.5, 0.002);
      p.castShadow = false;
    }
  };
  const branchChandelier = (x, z, y) => {
    const R = (k) => Math.sin(k * 91.7) * 0.5 + 0.5;
    box(0.25, 0.02, 0.25, M.brass, x, ceil - 0.01, z, hanging);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      box(0.006, ceil - y, 0.006, M.brass, x + Math.cos(a) * 0.4, (ceil + y) / 2, z + Math.sin(a) * 0.4, hanging);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.008, 6, 64), M.brass);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, y, z);
    hanging.add(ring);
    for (let k = 0; k < 70; k++) {
      const a = R(k) * Math.PI * 2, r = 0.25 + R(k + 50) * 0.42;
      sphere(0.018 + R(k + 9) * 0.018, M.lamp, x + Math.cos(a) * r, y - 0.05 + (R(k + 21) - 0.5) * 0.22, z + Math.sin(a) * r);
    }
    for (let k = 0; k < 14; k++) { // brass twigs
      const a = R(k + 200) * Math.PI * 2, r = 0.3 + R(k + 300) * 0.35;
      const t = box(0.006, 0.006, 0.35, M.brass, x + Math.cos(a) * r, y + (R(k + 400) - 0.5) * 0.15, z + Math.sin(a) * r, hanging);
      t.rotation.y = -a + Math.PI / 2 + (R(k) - 0.5);
    }
  };
  const ringChandelier = (x, z, y) => {
    for (const [r, dy] of [[0.42, 0], [0.3, 0.12]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.016, 8, 72), M.lamp);
      ring.rotation.x = Math.PI / 2 - 0.12;
      ring.position.set(x, y + dy, z);
      hanging.add(ring);
    }
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      box(0.004, ceil - y, 0.004, M.black, x + Math.cos(a) * 0.3, (ceil + y) / 2, z + Math.sin(a) * 0.3, hanging);
    }
  };
  // white lacquer front with arched openings over a walnut-lined (or mural) recess: the arched display unit and the
  // dining niches share it. bays: list of { a, w, arch: true|false }
  const archedFront = (side, f, a0, a1, y0, y1, bays, depth, recess) => {
    const L = a1 - a0, sh = new THREE.Shape();
    sh.moveTo(0, 0); sh.lineTo(L, 0); sh.lineTo(L, y1 - y0); sh.lineTo(0, y1 - y0); sh.lineTo(0, 0);
    for (const b of bays) {
      const u = b.a - a0, r = b.w / 2, top = y1 - y0 - 0.15 - r, bot = b.bottom - y0;
      const hole = new THREE.Path();
      hole.moveTo(u, bot); hole.lineTo(u + b.w, bot); hole.lineTo(u + b.w, top);
      hole.absarc(u + r, top, r, 0, Math.PI, false);
      hole.lineTo(u, bot);
      sh.holes.push(hole);
      recess(b, top + y0 + r);
    }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false, curveSegments: 24 });
    const m = new THREE.Mesh(geo, M.lacquer);
    m.castShadow = m.receiveShadow = true;
    // shape x → along the wall, y → up; the extrusion is flipped (scale.z = −1) so it grows from `depth` back towards
    // the wall, leaving the shape's face towards the room
    const o = f + sgn[side] * depth;
    if (side === 'n') { m.position.set(a0, y0, o); }
    else if (side === 's') { m.rotation.y = Math.PI; m.position.set(a1, y0, o); }
    else if (side === 'w') { m.rotation.y = Math.PI / 2; m.position.set(o, y0, a1); }
    else { m.rotation.y = -Math.PI / 2; m.position.set(o, y0, a0); }
    m.scale.z = -1;
    group.add(m);
  };

  const tvs = fixtures.filter((q) => q.type === 'tv');
  const sofas = fixtures.filter((q) => q.type === 'sofa');
  const tables = furniture.filter((q) => q.rect && /^Coffee table/.test(q.name));

  // ---------- sofas: quilted wall, artwork, sconces, chandelier ----------
  const lit = new Set();
  for (const s of sofas) {
    const room = byName(s.room);
    if (!room) continue;
    const side = { s: 'n', n: 's', e: 'w', w: 'e' }[s.facing]; // the wall behind the sofa
    const along = (s.a + s.b) / 2, f = faceOf(room, side, along);
    const tv = tvs.find((t) => t.room === s.room);
    if (Math.abs(s.back - f) < 0.08) {
      if (tv && tv.side === s.facing) quilted(side, f, s.a - 0.5, s.b + 0.5);
      else {
        const url = tv ? 'textures/interior/line-art.jpg' : 'textures/interior/lotus-relief.jpg';
        const [w, h] = tv ? [0.75, 1.0] : [1.0, 1.25];
        if (artwork(side, f, along, url, w, h, 1.1 + 0.5 + h / 2 - 0.25)) sconces(side, f, along, w / 2 + 0.35, 1.55);
      }
    }
    // chandelier over the coffee table in front of the sofa (one per sitting area)
    const fx = s.axis === 'z' ? along : s.back + sgn[side] * 1.2, fz = s.axis === 'z' ? s.back + sgn[side] * 1.2 : along;
    const t = tables.filter((q) => q.room === s.room).map((q) => ({ q, c: [(q.rect[0] + q.rect[2]) / 2, (q.rect[1] + q.rect[3]) / 2] })).sort((p, q) => Math.hypot(p.c[0] - fx, p.c[1] - fz) - Math.hypot(q.c[0] - fx, q.c[1] - fz))[0];
    if (t && !lit.has(t.q) && Math.hypot(t.c[0] - fx, t.c[1] - fz) < 1.6) {
      lit.add(t.q);
      branchChandelier(t.c[0], t.c[1], ceil - 0.6);
      if (Math.hypot(t.c[0] - room.center[0], t.c[1] - room.center[1]) < 1.3) { noFan.add(room.name); notes.push(`${room.name}: branch chandelier over the coffee table in place of the ceiling fan (warm luxe interior).`); }
    }
  }

  // ---------- brass medallion screen beside a main double door that opens into a sitting room ----------
  for (const o of openings.filter((q) => q.kind === 'dd' && q.outer)) {
    const room = rooms.find((r) => !r.outdoor && o.sides.includes(r.name));
    const seats = room && sofas.filter((q) => q.room === room.name);
    if (!seats || !seats.length) continue;
    const side = o.vertical ? (Math.abs(o.c - room.main[0]) < Math.abs(o.c - room.main[2]) ? 'w' : 'e') : Math.abs(o.c - room.main[1]) < Math.abs(o.c - room.main[3]) ? 'n' : 's';
    const f = faceOf(room, side, (o.a + o.b) / 2);
    const mid = seats.reduce((acc, q) => acc + (vertical(side) === (q.axis === 'x') ? (q.a + q.b) / 2 : q.back), 0) / seats.length;
    const at = mid < (o.a + o.b) / 2 ? o.a - 0.12 : o.b + 0.12; // the door edge nearer the seats
    let L = 1.2;
    const rectFor = (len) => (vertical(side) ? [Math.min(f, f + sgn[side] * len), at - 0.03, Math.max(f, f + sgn[side] * len), at + 0.03] : [at - 0.03, Math.min(f, f + sgn[side] * len), at + 0.03, Math.max(f, f + sgn[side] * len)]);
    while (L > 0.6 && furniture.some((q) => q.rect && q.room === room.name && overlaps(q.rect, rectFor(L + 0.3)))) L -= 0.1;
    if (L < 0.6) continue;
    const g = new THREE.Group();
    const pw = L / 2;
    for (let k = 0; k < 2; k++) {
      const c = -L / 2 + pw * (k + 0.5);
      for (const [w, h, x, y] of [[pw, 0.03, c, 2.385], [pw, 0.03, c, 0.015], [0.03, 2.4, c - pw / 2 + 0.015, 1.2], [0.03, 2.4, c + pw / 2 - 0.015, 1.2]]) box(w, h, 0.03, M.brass, x, y, 0, g);
      for (const y of [0.55, 1.2, 1.85]) {
        const disc = new THREE.Mesh(new THREE.PlaneGeometry(pw - 0.08, pw - 0.08), M.medallion);
        disc.position.set(c, y, 0);
        g.add(disc);
      }
    }
    // stand perpendicular to the wall, starting at its face
    const r = rectFor(L);
    // the panels are built along local x: a screen off a w/e wall runs along x already, off an n/s wall along z
    if (vertical(side)) g.position.set((r[0] + r[2]) / 2, 0, at);
    else { g.rotation.y = Math.PI / 2; g.position.set(at, 0, (r[1] + r[3]) / 2); }
    group.add(g);
    items.push({ room: room.name, name: `Brass medallion screen ${Math.round(L * 1000)}×30×2400 mm beside the main door`, rect: r, block: 0.1 });
  }

  // ---------- arched display unit in a sitting room without a TV, on the wall the sofa faces ----------
  for (const s of sofas) {
    if (tvs.some((t) => t.room === s.room)) continue;
    const room = byName(s.room), side = s.facing, along = (s.a + s.b) / 2, f = faceOf(room, side, along);
    const run = freeRuns(side, f, ...spanOf(room, side, along)).find(([p, q]) => along >= p - 0.5 && along <= q + 0.5 && q - p >= 1.6);
    if (!run) continue;
    const L = Math.min(2.4, run[1] - run[0] - 0.3), a0 = Math.min(Math.max(along - L / 2, run[0] + 0.15), run[1] - 0.15 - L), a1 = a0 + L, D = 0.4;
    const rect = vertical(side) ? [Math.min(f, f + sgn[side] * D), a0, Math.max(f, f + sgn[side] * D), a1] : [a0, Math.min(f, f + sgn[side] * D), a1, Math.max(f, f + sgn[side] * D)];
    if (furniture.some((q) => q.rect && q.room === room.name && overlaps(q.rect, rect))) continue;
    put(side, f, L, 0.85, D, M.lacquer, (a0 + a1) / 2, 0.425); // base cabinets
    put(side, f, L + 0.02, 0.03, D + 0.02, M.quartz, (a0 + a1) / 2, 0.865);
    for (let k = 1; k < Math.round(L / 0.6); k++) put(side, f, 0.004, 0.8, 0.004, M.black, a0 + (k * L) / Math.round(L / 0.6), 0.425, D);
    const n = Math.max(3, Math.round(L / 0.6)), bw = L / n;
    const bays = [];
    for (let k = 1; k < n - 1; k++) bays.push({ a: a0 + k * bw + 0.05, w: bw - 0.1, bottom: 0.95 }); // closed bays at the ends
    put(side, f, L, 2.4 - 0.88, 0.02, M.walnut, (a0 + a1) / 2, 0.88 + (2.4 - 0.88) / 2); // back
    archedFront(side, f, a0, a1, 0.88, 2.4, bays, D, (b) => {
      for (let y = 1.35; y < 2.0; y += 0.4) put(side, f, b.w, 0.012, D - 0.06, M.glass, b.a + b.w / 2, y, 0.02);
      put(side, f, 0.01, 1.2, 0.01, M.lamp, b.a + 0.02, 1.6, 0.03);
      for (let y = 0.98; y < 2.0; y += 0.4) put(side, f, 0.08, 0.16, 0.08, M.lacquer, b.a + b.w / 2 + 0.06, y + 0.1, 0.12); // vases
    });
    for (const s2 of [-1, 1]) put(side, f, 0.02, 2.4 - 0.88, D - 0.02, M.lacquer, s2 < 0 ? a0 + 0.01 : a1 - 0.01, 0.88 + (2.4 - 0.88) / 2);
    items.push({ room: room.name, name: `Arched display unit ${Math.round(L * 1000)}×400×2400 mm`, rect, block: 0.15 });
  }

  // ---------- dining: backlit palm-mural arches on the longest plain wall, ring chandelier over the table ----------
  for (const d of furniture.filter((q) => q.rect && /^(Dining table|Round dining table)/.test(q.name))) {
    const room = byName(d.room);
    if (!room) continue;
    let best = null;
    for (const side of ['n', 's', 'w', 'e']) {
      const f = { n: room.main[1], s: room.main[3], w: room.main[0], e: room.main[2] }[side];
      for (const [p, q] of freeRuns(side, f, ...(vertical(side) ? [room.main[1], room.main[3]] : [room.main[0], room.main[2]]))) if (!best || q - p > best.len) best = { side, f, p, q, len: q - p };
    }
    if (best && best.len >= 1.8) {
      const { side, f } = best, L = Math.min(best.len - 0.2, 2.6), a0 = (best.p + best.q) / 2 - L / 2, a1 = a0 + L;
      const n = 3, gap = 0.12, w = Math.min(0.7, (L - (n + 1) * gap) / n), start = (a0 + a1) / 2 - (n * w + (n - 1) * gap) / 2;
      const bays = Array.from({ length: n }, (_, k) => ({ a: start + k * (w + gap), w, bottom: 0.35 }));
      const mural = texMat('textures/interior/palm-mural.jpg', 0.35);
      put(side, f, L, H, 0.01, M.lacquer, (a0 + a1) / 2, H / 2); // back plate
      archedFront(side, f, a0, a1, 0, H, bays, 0.08, (b, apex) => {
        plane(side, f, b.w, apex - b.bottom, mural, b.a + b.w / 2, (apex + b.bottom) / 2, 0.012);
        put(side, f, b.w, 0.01, 0.02, M.lamp, b.a + b.w / 2, b.bottom + 0.01, 0.03); // uplight at the sill
      });
      for (const e of [a0 + 0.01, a1 - 0.01]) put(side, f, 0.02, H, 0.08, M.lacquer, e, H / 2); // end caps
      put(side, f, L, 0.02, 0.08, M.lacquer, (a0 + a1) / 2, H - 0.01); // top cap
    }
    const [tx, tz] = [(d.rect[0] + d.rect[2]) / 2, (d.rect[1] + d.rect[3]) / 2];
    ringChandelier(tx, tz, ceil - 0.95);
    if (Math.hypot(tx - room.center[0], tz - room.center[1]) < 1.3) { noFan.add(room.name); notes.push(`${room.name}: ring chandelier over the table in place of the ceiling fan (warm luxe interior).`); }
  }

  // ---------- kitchen peninsula: hanging shelf with plants + LED, walnut slats with a toe glow on the back ----------
  for (const k of furniture.filter((q) => q.rect && /^Kitchen peninsula/.test(q.name))) {
    const [x0, z0, x1, z1] = k.rect, nrm = k.normal || [0, 1];
    const alongX = Math.abs(nrm[1]) > 0.5, L = alongX ? x1 - x0 : z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const sx = alongX ? L : 0.45, sz = alongX ? 0.45 : L;
    box(sx, 0.035, sz, M.walnut, cx, 2.25, cz, hanging);
    box(alongX ? L : 0.03, 0.03, alongX ? 0.03 : L, M.lamp, cx, 2.225, cz, hanging);
    for (const [u, v] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.008, ceil - 2.25, 0.008, M.brass, cx + u * (sx / 2 - 0.04), (ceil + 2.25) / 2, cz + v * (sz / 2 - 0.04), hanging);
    for (let t = -L / 2 + 0.25; t < L / 2 - 0.1; t += 0.4) {
      const px = alongX ? cx + t : cx, pz = alongX ? cz : cz + t;
      box(0.14, 0.12, 0.14, M.lacquer, px, 2.33, pz, hanging);
      for (let j = 0; j < 5; j++) sphere(0.06 + (j % 2) * 0.02, j % 2 ? M.leaf : M.solid('#5f8a46', { roughness: 0.8 }), px + Math.cos(j * 1.3) * 0.06, 2.42 + (j % 3) * 0.04, pz + Math.sin(j * 1.3) * 0.06);
    }
    // back of the peninsula (away from the cook): vertical walnut slats and a glow at the toe
    const bf = alongX ? (nrm[1] > 0 ? z0 : z1) : nrm[0] > 0 ? x0 : x1, out = alongX ? -Math.sign(nrm[1]) : -Math.sign(nrm[0]);
    for (let t = -L / 2 + 0.03; t < L / 2 - 0.02; t += 0.07) {
      if (alongX) box(0.04, 0.78, 0.02, M.walnut, cx + t, 0.47, bf + out * 0.01);
      else box(0.02, 0.78, 0.04, M.walnut, bf + out * 0.01, 0.47, cz + t);
    }
    if (alongX) box(L, 0.01, 0.01, M.lamp, cx, 0.06, bf + out * 0.03); else box(0.01, 0.01, L, M.lamp, bf + out * 0.03, 0.06, cz);
  }

  // ---------- beds: feature wall behind the bed and globe pendants over the side tables ----------
  fixtures.filter((q) => q.type === 'bed').forEach((b, i) => {
    const room = byName(b.room), side = b.side, f = faceOf(room, side, b.along);
    const half = b.ns + 0.225 + 0.3, [lo, hi] = spanOf(room, side, b.along);
    const a0 = Math.max(lo, b.along - half), a1 = Math.min(hi, b.along + half);
    const style = i % 3;
    for (const [u, y0, v, y1] of clearRects(side, f, a0, a1, 0.1, H)) {
      const w = v - u, ym = (y0 + y1) / 2, am = (u + v) / 2;
      if (style === 0) { // grey fabric channels with walnut strips at the ends
        put(side, f, w, y1 - y0, 0.02, M.fabricGrey, am, ym);
        for (let a = u + 0.15; a < v - 0.05; a += 0.15) put(side, f, 0.01, y1 - y0, 0.006, M.chairGrey, a, ym, 0.02);
        for (const e of [u + 0.05, v - 0.05]) put(side, f, 0.1, y1 - y0, 0.03, M.walnut, e, ym);
      } else if (style === 1) { // oak panels in a grid with walnut joints
        put(side, f, w, y1 - y0, 0.02, M.oak, am, ym);
        for (let a = u + 0.6; a < v - 0.1; a += 0.6) put(side, f, 0.03, y1 - y0, 0.01, M.walnut, a, ym, 0.02);
        for (let y = y0 + 0.6; y < y1 - 0.1; y += 0.6) put(side, f, w, 0.03, 0.01, M.walnut, am, y, 0.02);
      } else { // white flutes with brass lines
        put(side, f, w, y1 - y0, 0.02, M.lacquer, am, ym);
        for (let a = u + 0.05; a < v - 0.03; a += 0.1) put(side, f, 0.05, y1 - y0, 0.02, M.lacquer, a, ym, 0.02);
        for (const e of [u + 0.02, v - 0.02]) put(side, f, 0.015, y1 - y0, 0.045, M.brass, e, ym);
      }
      if (y1 > H - 0.05) put(side, f, w, 0.012, 0.012, M.lamp, am, y1 - 0.01, 0.04); // LED wash from the top edge
    }
    for (const s of [-1, 1]) {
      const a = b.along + s * b.ns, d = f + sgn[side] * 0.2;
      const [x, z] = vertical(side) ? [d, a] : [a, d];
      sphere(0.11, M.shade, x, 1.3, z);
      box(0.004, ceil - 1.41, 0.004, M.black, x, (ceil + 1.41) / 2, z, hanging);
    }
  });

  return { group, hanging, items, noFan, notes };
}
