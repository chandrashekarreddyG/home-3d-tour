// Builds the house from plans.js in METRES (1 world unit = 1 m) plus the survey site.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { IN, FT, ftIn } from './units.js';
import { STD } from './plans.js';
import { boxGeo } from './materials.js';
import { kit, SIZES } from './furniture.js';
import { buildMandir, rangoli } from './mandir.js';
import { buildElevations } from './elevation.js';
import { buildLighting } from './lighting.js';
import { buildElectrical } from './electrical.js';
import { buildScaleRefs } from './scale.js';
import { NavGrid, inRect } from './nav.js';
import { PARCELS, ROADS, DIMENSIONS } from './site.js';

export const CEIL = STD.ceiling * IN; // 3.048 m
export const DOOR_H = STD.doorHead * IN; // 2.134 m
export const GROUND = -STD.plinth * IN; // −0.457 m
const SLAB = STD.slab * IN;
const SITE_W_FT = 56 + 1 / 12; // Padma Reddy frontage 56′-1″

const OPEN = {
  d: [0, DOOR_H], dt: [0, DOOR_H], dd: [0, DOOR_H], a: [0, DOOR_H],
  w: [STD.sill * IN, DOOR_H], v: [STD.ventSill * IN, DOOR_H],
};
const FRAME = 0.06; // door frame face width (m)

const rectM = (r) => r.map((v) => v * IN);
const centerOf = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const area = (r) => (r[2] - r[0]) * (r[3] - r[1]);

function label(html, cls, onClick) {
  const el = document.createElement(onClick ? 'button' : 'div');
  el.className = cls;
  el.innerHTML = html;
  if (onClick) el.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
  return new CSS2DObject(el);
}

// UVs in world metres (continuous across neighbouring wall pieces).
function worldUV(mesh) {
  const g = mesh.geometry, p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  const o = mesh.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + o.x, y = p.getY(i) + o.y, z = p.getZ(i) + o.z;
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    if (ax > 0.5) uv.setXY(i, z, y);
    else if (ay > 0.5) uv.setXY(i, x, z);
    else uv.setXY(i, x, y);
  }
  uv.needsUpdate = true;
}
function flatRect(r, y, down = false) {
  const [x0, z0, x1, z1] = r;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z1], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([x0, z0, x1, z0, x1, z1, x0, z1], 2));
  g.setIndex(down ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]);
  g.computeVertexNormals();
  return g;
}
function flatPoly(pts, y) {
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i), p.getZ(i));
  return g;
}
function subtractRect(r, h) {
  if (h[2] <= r[0] || h[0] >= r[2] || h[3] <= r[1] || h[1] >= r[3]) return [r];
  const out = [];
  if (h[1] > r[1]) out.push([r[0], r[1], r[2], h[1]]);
  if (h[3] < r[3]) out.push([r[0], h[3], r[2], r[3]]);
  const z0 = Math.max(r[1], h[1]), z1 = Math.min(r[3], h[3]);
  if (h[0] > r[0]) out.push([r[0], z0, h[0], z1]);
  if (h[2] < r[2]) out.push([h[2], z0, r[2], z1]);
  return out.filter((q) => q[2] - q[0] > 1e-4 && q[3] - q[1] > 1e-4);
}

// =====================================================================
export function buildModel(plan, M, onLabelClick) {
  const K = kit(M);
  const { ox, oy, kx, kz } = plan.map;
  const pxX = (p) => (p - ox) * kx; // drawing px → inches
  const pxZ = (p) => (p - oy) * kz;

  const root = new THREE.Group();
  const ceilings = new THREE.Group();
  const roof = new THREE.Group();
  const labels = new THREE.Group();
  const siteLabels = new THREE.Group();
  const dims = new THREE.Group();
  const markers = new THREE.Group();
  root.add(ceilings, roof, labels, siteLabels, dims, markers);
  ceilings.visible = roof.visible = dims.visible = markers.visible = false;

  const floors = [], solids = [], furnMeshes = [], colliders = [], fans = [], skirts = [];
  const fixtures = []; // wall-mounted fixture positions (bed heads, TV, kitchen runs, …) for the electrical layout
  const compound = {}; // boundary wall groups by side: n, s (G.P Road), w (21 ft road), e
  const parapet = {}; // road-facing roof parapets: s (G.P Road), w (21 ft road); an elevation may swap them for glass
  const mini = { walls: [], windows: [] };
  const report = { openings: [], furniture: [], adjustments: [] };

  const [W, D] = plan.outer; // inches
  const building = [0, 0, W * IN, D * IN];
  const bal = plan.balconies;

  // ---------------- zones ----------------
  const rooms = [];
  for (const z of plan.rooms) {
    const rects = (z.rs || [z.r]).map(rectM);
    const main = rects.reduce((a, b) => (area(a) >= area(b) ? a : b));
    rooms.push({ name: z.n, drawLabel: z.d || '', lab: z.lab, issue: z.issue, rects, main, finish: z.f, tour: z.tour !== false, outdoor: false, center: centerOf(main), lights: [] });
  }
  const st = [pxX(plan.stairs[0]) * IN, pxZ(plan.stairs[1]) * IN, pxX(plan.stairs[2]) * IN, pxZ(plan.stairs[3]) * IN];
  st[1] = D * IN; // stairs start at the building's front face (drawn on the balcony)
  const sideBal = [-bal.side * IN, 0, 0, D * IN];
  const frontBal = [-bal.side * IN, D * IN, W * IN, (D + bal.front) * IN];
  st[3] = Math.min(st[3], frontBal[3]);
  rooms.push({ name: 'Side Balcony', drawLabel: '5′-0″ wide', lab: [bal.side, null], rects: [sideBal], main: sideBal, finish: 'stone', tour: true, outdoor: true, center: centerOf(sideBal), lights: [] });
  rooms.push({ name: 'Front Balcony', drawLabel: '7′-0″ wide', lab: [null, bal.front], rects: [frontBal], main: frontBal, finish: 'stone', tour: true, outdoor: true, center: centerOf(frontBal), lights: [] });
  const roomAt = (x, z) => rooms.find((r) => r.rects.some((q) => inRect(x, z, q)));
  const roomAtIn = (x, z) => roomAt(x * IN, z * IN);
  const byName = (n) => rooms.find((r) => r.name === n);

  // ---------------- walls & openings ----------------
  const doorways = [];
  const openingsAll = [];
  plan.walls.forEach(([x1, z1, x2, z2, t, ops], wi) => {
    const vertical = x1 === x2;
    const outer = t === 9;
    const conv = vertical ? pxZ : pxX;
    const c = vertical ? x1 : z1; // inches
    const a0 = Math.min(vertical ? z1 : x1, vertical ? z2 : x2);
    const a1 = Math.max(vertical ? z1 : x1, vertical ? z2 : x2);
    // outer walls: horizontal ones run to the outer corners, vertical ones stop at their inner faces
    const start = outer ? (vertical ? a0 + t / 2 : a0 - t / 2) : a0;
    const end = outer ? (vertical ? a1 - t / 2 : a1 + t / 2) : a1;

    // resolve openings: centre from the drawing, width from the standard / drawing
    const res = ops.map(([kind, f, to, swing]) => {
      const p0 = conv(Math.min(f, to)), p1 = conv(Math.max(f, to));
      const dc = (p0 + p1) / 2, dw = p1 - p0;
      let w;
      if (kind === 'd') w = STD.door;
      else if (kind === 'dt') w = STD.doorToilet;
      else if (kind === 'dd') w = STD.doubleSizes.reduce((a, b) => (Math.abs(b - dw) < Math.abs(a - dw) ? b : a));
      else if (kind === 'v') w = STD.ventW;
      else if (kind === 'w') w = Math.round(dw / STD.windowRound) * STD.windowRound;
      else w = Math.round(dw);
      return { kind, swing, drawCenter: dc, drawWidth: dw, a: dc - w / 2, b: dc + w / 2 };
    }).sort((p, q) => p.a - q.a);
    // keep a 3″ pier between neighbours; doors keep their size, windows give way
    for (let i = 1; i < res.length; i++) {
      const p = res[i - 1], q = res[i];
      if (q.a < p.b + 3) {
        const win = q.kind === 'w' || q.kind === 'v' ? q : p.kind === 'w' || p.kind === 'v' ? p : q;
        const cut = p.b + 3 - q.a;
        if (win === q) q.a += cut; else p.b -= cut;
        report.adjustments.push(`${plan.short}: window next to a ${win === q ? p.kind : q.kind} on wall #${wi + 1} trimmed by ${cut.toFixed(1)}″ to keep a 3″ pier.`);
      }
    }
    // keep openings clear of the wall's end returns
    const lim0 = a0 + (outer ? 4.5 : 2.25), lim1 = a1 - (outer ? 4.5 : 2.25);
    for (const o of res) {
      if (o.a < lim0 + 2) { const s = lim0 + 2 - o.a; o.a += s; o.b += s; }
      if (o.b > lim1 - 2) { const s = o.b - (lim1 - 2); o.a -= s; o.b -= s; }
    }

    // probe which space lies on each side of the wall
    const sideRoom = (along, sgn) => {
      const off = t / 2 + 3;
      return vertical ? roomAtIn(c + sgn * off, along) : roomAtIn(along, c + sgn * off);
    };
    const faceMat = (along, sgn, y0) => {
      const r = sideRoom(along, sgn);
      if (!r || r.outdoor) return outer ? M.paintExt : M.paint;
      if (r.finish === 'bath' && y0 < DOOR_H - 0.001) return M.bathTile;
      return M.paint;
    };
    const tM = t * IN, cM = c * IN;
    // split pieces where perpendicular walls meet this one, so each face segment belongs to one room
    const junctions = plan.walls
      .filter((w2) => (w2[0] === w2[2]) !== vertical)
      .filter((w2) => {
        const s0 = Math.min(vertical ? w2[0] : w2[1], vertical ? w2[2] : w2[3]) - w2[4] / 2;
        const s1 = Math.max(vertical ? w2[0] : w2[1], vertical ? w2[2] : w2[3]) + w2[4] / 2;
        return c >= s0 - 0.01 && c <= s1 + 0.01;
      })
      .map((w2) => (vertical ? w2[1] : w2[0]));
    const piece = (a, b, y0, y1, tag) => {
      const cuts = [a, ...junctions.filter((j) => j > a + 0.5 && j < b - 0.5).sort((p, q) => p - q), b];
      for (let i = 0; i < cuts.length - 1; i++) pieceRaw(cuts[i], cuts[i + 1], y0, y1, tag);
    };
    const pieceRaw = (a, b, y0, y1, tag) => {
      if (b - a < 0.01) return;
      const splits = y0 < DOOR_H - 0.001 && y1 > DOOR_H + 0.001 ? [[y0, DOOR_H], [DOOR_H, y1]] : [[y0, y1]];
      for (const [ya, yb] of splits) {
        const mid = (a + b) / 2;
        const neg = faceMat(mid, -1, ya), pos = faceMat(mid, 1, ya);
        const ends = outer ? M.paintExt : M.paint;
        const mats = vertical ? [pos, neg, M.cap, M.cap, ends, ends] : [ends, ends, M.cap, M.cap, pos, neg];
        const aM = a * IN, bM = b * IN;
        const m = new THREE.Mesh(vertical ? boxGeo(tM, yb - ya, bM - aM) : boxGeo(bM - aM, yb - ya, tM), mats);
        m.position.set(vertical ? cM : (aM + bM) / 2, (ya + yb) / 2, vertical ? (aM + bM) / 2 : cM);
        m.castShadow = m.receiveShadow = true;
        worldUV(m);
        m.userData.wall = true;
        m.userData.houseWall = true;
        m.userData.t = vertical ? m.geometry.parameters.width : m.geometry.parameters.depth;
        root.add(m);
        solids.push(m);
      }
      const fp = vertical ? [cM - tM / 2, a * IN, cM + tM / 2, b * IN] : [a * IN, cM - tM / 2, b * IN, cM + tM / 2];
      if (y0 < 0.5) {
        colliders.push({ r: fp, clear: 0.22, wall: true });
        (tag === 'sill' ? mini.windows : mini.walls).push(fp);
        // skirting on painted interior faces
        for (const sgn of [-1, 1]) {
          const r = sideRoom((a + b) / 2, sgn);
          if (!r || r.outdoor || r.finish === 'bath') continue;
          const skMat = r.finish === 'wood' ? M.walnut : M.tile;
          const off = cM + sgn * (tM / 2 + 0.006);
          const sk = vertical ? new THREE.Mesh(boxGeo(0.012, 0.1, (b - a) * IN), skMat) : new THREE.Mesh(boxGeo((b - a) * IN, 0.1, 0.012), skMat);
          sk.position.set(vertical ? off : ((a + b) / 2) * IN, 0.05, vertical ? ((a + b) / 2) * IN : off);
          sk.receiveShadow = true;
          worldUV(sk);
          root.add(sk);
          skirts.push({ mesh: sk, finish: r.finish });
        }
      }
    };

    let cur = start;
    for (const o of res) {
      if (o.a > cur) piece(cur, o.a, 0, CEIL);
      const [lo, hi] = OPEN[o.kind];
      if (lo > 0) piece(o.a, o.b, 0, lo, 'sill');
      piece(o.a, o.b, hi, CEIL);
      cur = Math.max(cur, o.b);
      const rec = {
        plan: plan.short, wall: wi + 1, kind: o.kind, vertical, outer, c, t, a: o.a, b: o.b, lo, hi,
        drawCenter: o.drawCenter, drawWidth: o.drawWidth, swing: o.swing,
        sides: [sideRoom((o.a + o.b) / 2, -1)?.name || 'outside', sideRoom((o.a + o.b) / 2, 1)?.name || 'outside'],
      };
      openingsAll.push(rec);
      report.openings.push(rec);
      addOpening(rec);
    }
    if (end > cur) piece(cur, end, 0, CEIL);

    function addOpening(o) {
      const aM = o.a * IN, bM = o.b * IN, L = bM - aM, mid = (aM + bM) / 2;
      const place = (w, h, d, mat, along, y, across = 0, shadow = true) => {
        const m = vertical ? K.box(d, h, w, mat, cM + across, y, along, shadow) : K.box(w, h, d, mat, along, y, cM + across, shadow);
        root.add(m);
        return m;
      };
      if (o.kind === 'w' || o.kind === 'v') {
        const f = 0.05, lo = o.lo, hi = o.hi;
        place(L, f, 0.08, M.alu, mid, lo + f / 2);
        place(L, f, 0.08, M.alu, mid, hi - f / 2);
        place(f, hi - lo, 0.08, M.alu, aM + f / 2, (lo + hi) / 2);
        place(f, hi - lo, 0.08, M.alu, bM - f / 2, (lo + hi) / 2);
        if (o.kind === 'w') {
          const n = L > 1.5 ? 3 : 2, pw = (L - 2 * f) / n + 0.03;
          for (let i = 0; i < n; i++) {
            const along = aM + f + (L - 2 * f) * ((i + 0.5) / n);
            const off = (i % 2 ? 1 : -1) * 0.018;
            place(pw, hi - lo - 2 * f, 0.008, M.glass, along, (lo + hi) / 2, off, false);
            place(0.035, hi - lo - 2 * f, 0.03, M.alu, along - pw / 2, (lo + hi) / 2, off);
            place(0.035, hi - lo - 2 * f, 0.03, M.alu, along + pw / 2, (lo + hi) / 2, off);
          }
          place(L + 0.04, 0.02, tM + 0.05, M.granite, mid, lo + 0.01); // granite sill
        } else {
          for (let k = 0; k < 3; k++) {
            const m = place(L - 2 * f, (hi - lo - 2 * f) / 3, 0.006, M.frosted, mid, lo + f + ((hi - lo - 2 * f) * (k + 0.5)) / 3, 0, false);
            if (vertical) m.rotation.z = 0.35; else m.rotation.x = 0.35;
          }
        }
        mini.windows.push(vertical ? [cM - tM / 2, aM, cM + tM / 2, bM] : [aM, cM - tM / 2, bM, cM + tM / 2]);
        // chajja (sunshade) over exterior windows not covered by a balcony slab
        const extSgn = outer ? (vertical ? (c < W / 2 ? -1 : 1) : c < D / 2 ? -1 : 1) : 0;
        if (outer) {
          const exPt = vertical ? [cM + extSgn * (tM / 2 + 0.3), mid] : [mid, cM + extSgn * (tM / 2 + 0.3)];
          if (!roomAt(exPt[0], exPt[1])) place(L + 0.3, 0.075, 0.45, M.paintExt, mid, DOOR_H + 0.19, extSgn * (tM / 2 + 0.225));
        }
        // curtains in habitable rooms
        if (o.kind === 'w') {
          for (const sgn of [-1, 1]) {
            const r = sideRoom((o.a + o.b) / 2, sgn);
            if (!r || r.outdoor || ['bath', 'kitchen'].includes(r.finish) || r.name === 'Pooja') continue;
            const off = sgn * (tM / 2 + 0.12);
            const rodY = DOOR_H + 0.09;
            const rod = place(L + 0.5, 0.02, 0.02, M.chrome, mid, rodY, off, false);
            rod.castShadow = false;
            const pw = Math.min(0.55, L * 0.35 + 0.15), ph = rodY - 0.03;
            for (const end of [-1, 1]) {
              const panel = K.curtainPanel(pw, ph);
              const along = mid + end * (L / 2 + 0.25 - pw / 2);
              if (vertical) { panel.rotation.y = Math.PI / 2; panel.position.set(cM + off, ph / 2 + 0.02, along); }
              else panel.position.set(along, ph / 2 + 0.02, cM + off);
              root.add(panel);
            }
          }
        }
        return;
      }
      // doors and arches
      const n = vertical ? [1, 0] : [0, 1];
      const p = vertical ? [cM, mid] : [mid, cM];
      doorways.push({ p, n, kind: o.kind, outer, width: L });
      // granite threshold
      const th = vertical ? K.box(tM, 0.012, L, M.granite, cM, 0.006, mid, false) : K.box(L, 0.012, tM, M.granite, mid, 0.006, cM, false);
      root.add(th);
      if (o.kind === 'a') return;
      const sw = o.kind === 'dd' ? (o.swing === '-' ? -1 : 1) : o.swing[1] === '-' ? -1 : 1;
      const faceOff = sw * (tM / 2 - 0.05); // frame flush with the swing-side face
      const fMat = outer || o.kind === 'dd' ? M.teak : M.walnut;
      place(FRAME, o.hi, 0.1, fMat, aM + FRAME / 2, o.hi / 2, faceOff);
      place(FRAME, o.hi, 0.1, fMat, bM - FRAME / 2, o.hi / 2, faceOff);
      place(L, FRAME, 0.1, fMat, mid, o.hi - FRAME / 2, faceOff);
      for (const ja of [aM + FRAME / 2, bM - FRAME / 2]) {
        colliders.push({ r: vertical ? [cM + faceOff - 0.05, ja - FRAME / 2, cM + faceOff + 0.05, ja + FRAME / 2] : [ja - FRAME / 2, cM + faceOff - 0.05, ja + FRAME / 2, cM + faceOff + 0.05], clear: 0.22, wall: true });
      }
      const leafMat = o.kind === 'dt' ? M.white : outer || o.kind === 'dd' ? M.teak : M.oak;
      const clear = L - 2 * FRAME;
      // main (outer) entrances: one wide designer leaf in the same opening. It hinges on the end with the shorter
      // free pier (to the next cross wall or opening), so the latch side keeps the wider pier for the entrance
      // switchboard and DB; interior double doors (e.g. pooja) stay a pair
      const mainDoor = outer && o.kind === 'dd';
      const stops = [...junctions, ...res.filter((q) => q.a !== o.a).flatMap((q) => [q.a, q.b])];
      const near = (v) => Math.min(...stops.map((j) => Math.abs(j - v)), Infinity);
      const leaves = mainDoor ? [[near(o.a) <= near(o.b) ? 'a' : 'b', clear]] : o.kind === 'dd' ? [['a', clear / 2], ['b', clear / 2]] : [[o.swing[0], clear]];
      o.single = mainDoor;
      o.hinge = mainDoor ? leaves[0][0] : o.kind === 'd' || o.kind === 'dt' ? o.swing[0] : null; // hinge end, a or b
      const lh = o.hi - FRAME - 0.012, lt = mainDoor ? 0.045 : 0.035;
      for (const [hinge, lw] of leaves) {
        const pivot = hinge === 'a' ? aM + FRAME : bM - FRAME;
        const inward = hinge === 'a' ? 1 : -1; // along-wall direction from hinge into the opening
        const across = cM + sw * (tM / 2); // swing-side wall face
        const g = new THREE.Group();
        const leaf = new THREE.Mesh(boxGeo(lt, lh, lw), leafMat);
        leaf.position.set(0, 0.012 + lh / 2, sw * (lw / 2));
        leaf.castShadow = leaf.receiveShadow = true;
        g.add(leaf);
        if (mainDoor) {
          // teak leaf: horizontal V-grooves over the hinge-side two-thirds, a full-height brass inlay, a plain latch
          // panel with a 1.2 m brass pull bar and a matte-black smart lock, and a brass kick line (both faces)
          const zAt = (f) => sw * (lw * f);
          const fieldW = lw * 0.66, y0 = 0.32, y1 = lh - 0.28;
          for (const s of [-1, 1]) {
            const fx = s * (lt / 2 + 0.0015);
            for (let y = y0; y <= y1 + 1e-6; y += 0.12) g.add(K.box(0.004, 0.008, fieldW - 0.1, M.walnut, fx, y, zAt(0.05) + sw * (fieldW - 0.1) / 2, false));
            g.add(K.box(0.005, lh - 0.3, 0.014, M.brass, fx, 0.012 + lh / 2, zAt(0.7), false));
            g.add(K.box(0.005, 0.012, lw - 0.08, M.brass, fx, 0.16, sw * (lw / 2), false));
            const hz = zAt(1) - sw * 0.13, bar = 1.2;
            g.add(K.cyl(0.013, 0.013, bar, M.brass, s * (lt / 2 + 0.055), 1.05, hz, 16));
            for (const dy of [-bar / 2 + 0.08, bar / 2 - 0.08]) g.add(K.box(0.055, 0.02, 0.02, M.brass, s * (lt / 2 + 0.028), 1.05 + dy, hz));
            g.add(K.box(0.012, 0.3, 0.07, M.black, s * (lt / 2 + 0.006), 1.15, zAt(1) - sw * 0.05));
          }
        } else {
          for (const s of [-1, 1]) {
            const h = K.box(0.02, 0.02, 0.13, M.chrome, s * (lt / 2 + 0.03), 1.0, sw * (lw - 0.08));
            g.add(h, K.box(0.03, 0.06, 0.006, M.chrome, s * (lt / 2 + 0.005), 1.0, sw * (lw - 0.08)));
          }
        }
        // leaf stands open at 90°, its back against the hinge jamb; local +z points along the swing
        const ax = pivot + inward * (lt / 2);
        if (vertical) {
          g.rotation.y = Math.PI / 2; // local +z → world +x
          g.position.set(across, 0, ax);
        } else g.position.set(ax, 0, across);
        root.add(g);
        g.traverse((m) => m.isMesh && furnMeshes.push(m));
        const lr = vertical
          ? [Math.min(across, across + sw * lw), ax - lt / 2, Math.max(across, across + sw * lw), ax + lt / 2]
          : [ax - lt / 2, Math.min(across, across + sw * lw), ax + lt / 2, Math.max(across, across + sw * lw)];
        colliders.push({ r: lr, clear: 0.05 }); // a 35 mm leaf: you can brush past it
        o.leaves = (o.leaves || []).concat([{ rect: lr, sweep: lw, pivot: vertical ? [across, pivot] : [pivot, across], sw }]);
      }
    }
  });

  // ---------------- floors, ceilings, slab, plinth ----------------
  const floorMat = { tile: M.tile, kitchen: M.kitchen, bath: M.bath, wood: M.wood, marble: M.marble, stone: M.stone };
  const hiMat = new THREE.MeshBasicMaterial({ color: '#ffb703', transparent: true, opacity: 0.25, depthWrite: false });
  for (const room of rooms) {
    room.highlight = new THREE.Group();
    room.highlight.visible = false;
    for (const r of room.rects) {
      const fm = new THREE.Mesh(flatRect(r, 0), floorMat[room.finish]);
      fm.receiveShadow = true;
      fm.userData.floor = room;
      root.add(fm);
      floors.push(fm);
      room.highlight.add(new THREE.Mesh(flatRect(r, 0.02), hiMat));
      const cr = room.name === 'Front Balcony' ? subtractRect(r, st) : [r];
      for (const q of cr) {
        const cm = new THREE.Mesh(flatRect(q, CEIL, true), M.ceiling);
        cm.castShadow = true;
        cm.receiveShadow = true;
        ceilings.add(cm);
      }
    }
    root.add(room.highlight);
  }
  // plinth and the RCC slab over the house + balconies (the slab is the roof; stair well left open)
  for (const r of [building, sideBal, frontBal]) {
    const m = K.box(r[2] - r[0], -GROUND, r[3] - r[1], M.plinth, (r[0] + r[2]) / 2, GROUND / 2 - 0.001, (r[1] + r[3]) / 2);
    worldUV(m);
    root.add(m);
  }
  for (const r of [building, sideBal, ...subtractRect(frontBal, st)]) {
    const m = K.box(r[2] - r[0], SLAB, r[3] - r[1], M.slab, (r[0] + r[2]) / 2, CEIL + SLAB / 2, (r[1] + r[3]) / 2);
    roof.add(m);
  }
  // 2′-0″ cantilevered roof slab (sunshade) on the two back sides: the rear (−z) and the east side (+x), at slab
  // level; the parapet stays on the wall line. Clear of the plot line on every plan (≥ 40 mm at the rear of Plan-1/2).
  {
    const c = 24 * IN, [x0, z0, x1, z1] = [-bal.side * IN, 0, W * IN, (D + bal.front) * IN];
    roof.add(K.box(x1 + c - x0, SLAB, c, M.slab, (x0 + x1 + c) / 2, CEIL + SLAB / 2, z0 - c / 2)); // rear, round the corner
    roof.add(K.box(c, SLAB, z1 - z0, M.slab, x1 + c / 2, CEIL + SLAB / 2, (z0 + z1) / 2)); // east
  }
  {
    const pt = 0.115, ph = STD.parapet * IN, y = CEIL + SLAB + ph / 2;
    const [x0, z0, x1, z1] = [-bal.side * IN, 0, W * IN, (D + bal.front) * IN];
    roof.add(K.box(x1 - x0, ph, pt, M.paintExt, (x0 + x1) / 2, y, z0 + pt / 2));
    parapet.s = K.box(x1 - x0, ph, pt, M.paintExt, (x0 + x1) / 2, y, z1 - pt / 2);
    parapet.w = K.box(pt, ph, z1 - z0, M.paintExt, x0 + pt / 2, y, (z0 + z1) / 2);
    roof.add(parapet.s, parapet.w);
    roof.add(K.box(pt, ph, z1 - z0, M.paintExt, x1 - pt / 2, y, (z0 + z1) / 2));
  }

  // ---------------- staircase (dog-leg on the front balcony; geometry assumed) ----------------
  const stairInfo = {};
  {
    const [x0, z0, x1, z1] = st;
    const risers = 18, rise = (CEIL + SLAB) / risers, tread = 0.25, perFlight = risers / 2;
    const zm = (z0 + z1) / 2, runLen = (perFlight - 1) * tread, landing = x1 - x0 - runLen;
    for (let i = 0; i < perFlight - 1; i++) {
      const h1 = (i + 1) * rise;
      root.add(K.box(tread, h1, zm - z0, M.granite, x0 + (i + 0.5) * tread, h1 / 2, (z0 + zm) / 2));
      const h2 = (perFlight + i + 1) * rise;
      root.add(K.box(tread, h2, z1 - zm, M.granite, x0 + runLen - (i + 0.5) * tread, h2 / 2, (zm + z1) / 2));
    }
    root.add(K.box(landing, perFlight * rise, z1 - z0, M.granite, x1 - landing / 2, (perFlight * rise) / 2, (z0 + z1) / 2));
    root.add(K.box(runLen, 1.0 + perFlight * rise, 0.115, M.paintExt, x0 + runLen / 2, (1.0 + perFlight * rise) / 2, zm));
    // railing on the open (south) side of the upper flight and the landing
    const rail = M.solid('#1f2124', { metalness: 0.6, roughness: 0.4 });
    for (let i = 0; i <= perFlight - 1; i++) {
      const x = x0 + runLen - i * tread, yb = (perFlight + i) * rise;
      root.add(K.box(0.02, 0.9, 0.02, rail, x, yb + 0.45, z1 - 0.04));
    }
    const hy0 = perFlight * rise + 0.9, hy1 = (risers - 1) * rise + 0.9;
    const hr = K.box(Math.hypot(runLen, hy1 - hy0), 0.05, 0.06, M.teak, x0 + runLen / 2, (hy0 + hy1) / 2, z1 - 0.04);
    hr.rotation.z = Math.atan2(hy1 - hy0, -runLen);
    root.add(hr);
    mini.walls.push([x0, z0, x1, z1]);
    Object.assign(stairInfo, { risers, rise, tread, width: zm - z0, landing, rect: st });
  }

  // ---------------- furniture ----------------
  const poojaSpots = [];
  const faceOf = (room, side, alongM) => {
    const r = alongM == null ? room.main : room.rects.find((q) => (side === 'n' || side === 's' ? alongM >= q[0] && alongM <= q[2] : alongM >= q[1] && alongM <= q[3])) || room.main;
    return { n: r[1], s: r[3], w: r[0], e: r[2] }[side];
  };
  const NORMAL = { n: [0, 1], s: [0, -1], w: [1, 0], e: [-1, 0] }; // wall side → into-room normal
  const FACING = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }; // facing direction → normal
  const placeLocal = (obj, nrm, x, z) => {
    obj.rotation.y = Math.atan2(nrm[0], nrm[1]);
    obj.position.set(x, obj.position.y, z);
  };
  const footWorld = (foot, nrm, x, z) => {
    const th = Math.atan2(nrm[0], nrm[1]), c = Math.cos(th), s = Math.sin(th);
    const pts = [[foot[0], foot[1]], [foot[2], foot[1]], [foot[2], foot[3]], [foot[0], foot[3]]].map(([u, v]) => [x + u * c + v * s, z - u * s + v * c]);
    const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
    return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
  };
  const addItem = (room, name, built, nrm, x, z, block = 0.2, front = true) => {
    placeLocal(built.g, nrm, x, z);
    root.add(built.g);
    built.g.traverse((m) => m.isMesh && furnMeshes.push(m));
    if (built.foot) {
      const rect = footWorld(built.foot, nrm, x, z);
      if (block != null) colliders.push({ r: rect, clear: block });
      report.furniture.push({ room: room.name, name, rect, normal: front ? nrm : null, size: built.size });
      return rect;
    }
  };
  const alongAt = (side, px) => (side === 'n' || side === 's' ? pxX(px) : pxZ(px)) * IN;
  const wallsideAt = (room, side, alongM, nrm) => {
    const f = faceOf(room, side, alongM);
    return side === 'n' || side === 's' ? [alongM, f] : [f, alongM];
  };
  const clampAlong = (room, side, a, b) => {
    const r = room.main;
    const lo = side === 'n' || side === 's' ? r[0] : r[1], hi = side === 'n' || side === 's' ? r[2] : r[3];
    return [Math.max(lo, a), Math.min(hi, b)];
  };

  const wcSpots = {};
  const wardRects = {};
  const furnList = [...plan.furn].sort((a, b) => ['ward', 'crock'].includes(b[0]) - ['ward', 'crock'].includes(a[0]));
  for (const it of furnList) {
    const [type, rn] = it;
    const room = byName(rn);
    if (!room) continue;
    if (type === 'bed') {
      const nrm = NORMAL.n;
      const b = K.bed(it[3]);
      const half = b.foot[2];
      const x0 = pxX(it[2]) * IN;
      let [lo, hi] = [room.main[0] + half, room.main[2] - half];
      // keep 600 mm in front of any wardrobe beside the bed
      const bz0 = room.main[1], bz1 = room.main[1] + b.foot[3];
      for (const wr of wardRects[rn] || []) {
        if (wr[3] <= bz0 || wr[1] >= bz1) continue;
        if (wr[0] > x0) hi = Math.min(hi, wr[0] - 0.6 - half);
        else lo = Math.max(lo, wr[2] + 0.6 + half);
      }
      const x = Math.min(hi, Math.max(lo, x0));
      if (Math.abs(x - x0) > 0.005) report.adjustments.push(`${rn}: bed moved ${Math.round(Math.abs(x - x0) * 1000)} mm ${x < x0 ? 'west' : 'east'} of its drawn position to keep 600 mm clear in front of the wardrobe / walls (standard-size bed).`);
      addItem(room, `${it[3] === 'king' ? 'King' : 'Queen'} bed ${it[3] === 'king' ? '1830×1980' : '1520×1980'} mm + side tables`, b, nrm, x, faceOf(room, 'n', x), 0.2);
      fixtures.push({ type: 'bed', room: rn, side: 'n', along: x, ns: half - SIZES.nightstand.w / 2 });
    } else if (type === 'ward' || type === 'crock') {
      const side = it[2], nrm = NORMAL[side];
      const [a, b] = clampAlong(room, side, alongAt(side, it[3]), alongAt(side, it[4]));
      const built = type === 'ward' ? K.wardrobe(b - a) : K.crockery(b - a);
      const [x, z] = wallsideAt(room, side, (a + b) / 2);
      const rect = addItem(room, type === 'ward' ? `Wardrobe ${Math.round((b - a) * 1000)}×600 mm` : `Crockery unit ${Math.round((b - a) * 1000)}×380 mm`, built, nrm, x, z, 0.15);
      (wardRects[rn] = wardRects[rn] || []).push(rect);
    } else if (type === 'sofa') {
      const [, , axis, backPx, f, t, facing] = it;
      const nrm = FACING[facing];
      const back = (axis === 'z' ? pxZ(backPx) : pxX(backPx)) * IN;
      const a = (axis === 'z' ? pxX(f) : pxZ(f)) * IN, b = (axis === 'z' ? pxX(t) : pxZ(t)) * IN;
      const built = K.sofa(b - a);
      const [x, z] = axis === 'z' ? [(a + b) / 2, back] : [back, (a + b) / 2];
      addItem(room, `Sofa ${Math.round((b - a) * 1000)}×880 mm`, built, nrm, x, z, 0.2);
      fixtures.push({ type: 'sofa', room: rn, axis, back, a, b, facing });
    } else if (type === 'ctable') {
      const built = K.coffeeTable(it[4], it[5]);
      addItem(room, `Coffee table ${Math.round(it[4] * 1000)}×${Math.round(it[5] * 1000)} mm`, built, [0, 1], pxX(it[2]) * IN, pxZ(it[3]) * IN, 0.15, false);
    } else if (type === 'tv') {
      const side = it[2], nrm = NORMAL[side], along = alongAt(side, it[3]);
      const [x, z] = wallsideAt(room, side, along);
      addItem(room, 'TV console 1200 mm + 55″ TV', K.tvUnit(), nrm, x, z, 0.15);
      fixtures.push({ type: 'tv', room: rn, side, along });
    } else if (type === 'dining') {
      const built = K.dining(it[4]);
      addItem(room, it[4] === 'round4' ? 'Round dining table Ø1000 mm, 4 chairs' : 'Dining table 900×1500 mm, 6 chairs', built, [0, 1], pxX(it[2]) * IN, pxZ(it[3]) * IN, 0.1, false);
    } else if (type === 'plant') {
      addItem(room, 'Floor planter', K.plant(), [0, 1], pxX(it[2]) * IN, pxZ(it[3]) * IN, 0.1, false);
    } else if (type === 'fridge') {
      const nrm = FACING[it[4]];
      const cx = pxX(it[2]) * IN, cz = pxZ(it[3]) * IN;
      // back against the wall behind it
      const side = { w: 'e', e: 'w', n: 's', s: 'n' }[it[4]];
      const [x, z] = side === 'e' || side === 'w' ? [faceOf(room, side), cz] : [cx, faceOf(room, side)];
      addItem(room, 'Refrigerator 700×720×1800 mm', K.fridge(), nrm, x, z, 0.15);
      fixtures.push({ type: 'fridge', room: rn, side, along: side === 'e' || side === 'w' ? cz : cx });
    } else if (type === 'kitchen') {
      const spec = it[2];
      const taken = [];
      for (const [side, f, t] of spec.runs) {
        const nrm = NORMAL[side];
        let [a, b] = clampAlong(room, side, alongAt(side, f), alongAt(side, t));
        // don't overlap a perpendicular run already placed
        for (const q of taken) {
          const lo = side === 'n' || side === 's' ? q[0] : q[1], hi = side === 'n' || side === 's' ? q[2] : q[3];
          if (a < hi && b > lo) { if (lo <= a + 0.01) a = hi; else b = lo; }
        }
        if (b - a < 0.3) continue;
        const built = K.counter(b - a, { backsplash: true });
        const [x, z] = wallsideAt(room, side, (a + b) / 2);
        const rect = addItem(room, `Kitchen counter ${Math.round((b - a) * 1000)}×600×850 mm`, built, nrm, x, z, 0.15);
        taken.push(rect);
        fixtures.push({ type: 'counter', room: rn, side, a, b });
      }
      for (const [key, fn, nm] of [['hob', K.hob, 'Hob 750 mm + chimney 900 mm'], ['sink', K.sink, 'Sink 800×500 mm']]) {
        if (!spec[key]) continue;
        const [side, p] = spec[key];
        const along = alongAt(side, p);
        const [x, z] = wallsideAt(room, side, along);
        const built = fn();
        placeLocal(built.g, NORMAL[side], x, z);
        root.add(built.g);
        report.furniture.push({ room: room.name, name: nm, rect: null });
        fixtures.push({ type: key, room: rn, side, along });
      }
      for (const [side, f, t] of spec.upper || []) {
        let [a, b] = clampAlong(room, side, alongAt(side, f), alongAt(side, t));
        // skip the wall's windows
        const face = faceOf(room, side);
        const wins = openingsAll.filter((o) => (o.kind === 'w' || o.kind === 'v') && o.vertical === (side === 'w' || side === 'e') && Math.abs(o.c * IN - face) < (o.t * IN) / 2 + 0.01);
        let segs = [[a, b]];
        for (const o of wins) {
          const wa = o.a * IN - 0.05, wb = o.b * IN + 0.05;
          segs = segs.flatMap(([p, q]) => (wb <= p || wa >= q ? [[p, q]] : [[p, wa], [wb, q]].filter(([u, v]) => v - u > 0.3)));
        }
        for (const [p, q] of segs) {
          const built = K.upper(q - p);
          const [x, z] = wallsideAt(room, side, (p + q) / 2);
          placeLocal(built.g, NORMAL[side], x, z);
          root.add(built.g);
          built.g.traverse((m) => m.isMesh && furnMeshes.push(m));
        }
      }
    } else if (type === 'wc' || type === 'vanity') {
      const side = it[2], nrm = NORMAL[side], along = alongAt(side, it[3]);
      const [x, z] = wallsideAt(room, side, along);
      const built = type === 'wc' ? K.wc() : K.vanity();
      addItem(room, type === 'wc' ? 'EWC 380×700 mm' : 'Vanity 600×450 mm + mirror', built, nrm, x, z, 0.12);
      if (type === 'wc') { wcSpots[rn] = [x, z]; fixtures.push({ type: 'wc', room: rn, side, along }); }
    } else if (type === 'glass') {
      const [, , axis, pos, f, t] = it;
      const p = (axis === 'x' ? pxX(pos) : pxZ(pos)) * IN;
      const a = Math.max(axis === 'x' ? room.main[1] : room.main[0], (axis === 'x' ? pxZ(f) : pxX(f)) * IN);
      const b = Math.min(axis === 'x' ? room.main[3] : room.main[2], (axis === 'x' ? pxZ(t) : pxX(t)) * IN);
      // shower zone = side of the partition away from the WC
      const wcp = wcSpots[rn] || room.center;
      const wcSide = axis === 'x' ? Math.sign(wcp[0] - p) : Math.sign(wcp[1] - p);
      const len = (b - a) * 0.6; // fixed glass panel, rest is the walk-in gap
      const g = K.showerGlass(len);
      const start = a + (wcSide > 0 ? 0 : (b - a) - len);
      if (axis === 'x') { g.g.rotation.y = Math.PI / 2; g.g.position.set(p, 0, start + len / 2); }
      else g.g.position.set(start + len / 2, 0, p);
      root.add(g.g);
      colliders.push({ r: axis === 'x' ? [p - 0.005, start, p + 0.005, start + len] : [start, p - 0.005, start + len, p + 0.005], clear: 0.15 });
      const r = room.main;
      const zone = axis === 'x' ? (wcSide > 0 ? [r[0], r[1], p, r[3]] : [p, r[1], r[2], r[3]]) : wcSide > 0 ? [r[0], r[1], r[2], p] : [r[0], p, r[2], r[3]];
      const side = axis === 'x' ? (wcSide > 0 ? 'w' : 'e') : wcSide > 0 ? 'n' : 's';
      const zc = centerOf(zone);
      const along = side === 'n' || side === 's' ? zc[0] : zc[1];
      const sh = K.showerHead();
      const [sx, sz] = side === 'n' || side === 's' ? [along, faceOf(room, side)] : [faceOf(room, side), along];
      placeLocal(sh.g, NORMAL[side], sx, sz);
      root.add(sh.g);
      report.furniture.push({ room: room.name, name: `Shower glass ${Math.round(len * 1000)} mm (10 mm toughened, 2.0 m high)`, rect: null });
      fixtures.push({ type: 'shower', room: rn, side, along });
    } else if (type === 'mandir') {
      const side = it[2], nrm = NORMAL[side];
      const r = room.main;
      const wallLen = side === 'n' || side === 's' ? r[2] - r[0] : r[3] - r[1];
      const L = Math.min(1.2, wallLen - 0.2), Dm = 0.45;
      const along = side === 'n' || side === 's' ? (r[0] + r[2]) / 2 : (r[1] + r[3]) / 2;
      const [fx, fz] = wallsideAt(room, side, along);
      const g = buildMandir(L / FT, Dm / FT);
      g.scale.setScalar(FT);
      const holder = new THREE.Group();
      g.position.set(0, 0, Dm / 2);
      holder.add(g);
      addItem(room, `Mandir ${Math.round(L * 1000)}×450 mm (idols: Ganesha, Venkateswara, Lakshmi, Shiva lingam)`, { g: holder, foot: [-L / 2, 0, L / 2, Dm] }, nrm, fx, fz, 0.15);
      const front = [fx + nrm[0] * Dm, fz + nrm[1] * Dm];
      poojaSpots.push({ x: front[0], z: front[1], n: nrm, room });
      const depthLeft = side === 'n' || side === 's' ? r[3] - r[1] - Dm : r[2] - r[0] - Dm;
      const rad = Math.min(0.42, depthLeft / 2 - 0.25, (wallLen - 0.3) / 2);
      if (rad > 0.2) {
        const rg = rangoli(rad);
        rg.position.set(front[0] + nrm[0] * (rad + 0.2), 0.004, front[1] + nrm[1] * (rad + 0.2));
        root.add(rg);
      }
    } else if (type === 'diwan') {
      const a = pxX(it[2]) * IN, b = pxX(it[3]) * IN, x = (a + b) / 2;
      addItem(room, `Diwan ${Math.round((b - a) * 1000)}×800 mm`, K.diwan(b - a), NORMAL.n, x, faceOf(room, 'n', x), 0.2);
    }
  }

  // ---------------- ceiling fans + lighting designs ----------------
  for (const room of rooms) {
    if (room.outdoor) continue;
    const habitable = ['wood', 'tile'].includes(room.finish) && room.tour;
    if (habitable && area(room.main) > 6) {
      const f = K.fan();
      f.g.position.set(room.center[0], CEIL, room.center[1]);
      ceilings.add(f.g);
      fans.push(f.rotor);
    }
  }
  const lighting = buildLighting({
    rooms, furniture: report.furniture, M, K, parent: ceilings, stairs: st, ceil: CEIL,
    openings: openingsAll.map((o) => ({ vertical: o.vertical, c: o.c * IN, a: o.a * IN, b: o.b * IN })),
  });
  // ---------------- electrical layout: switchboards and points by rule ----------------
  const electrical = buildElectrical({ rooms, openings: openingsAll, fixtures, furniture: report.furniture, roomAt, IN, stairs: st });
  root.add(electrical.group, electrical.labels);

  // ---------------- compound wall, gates, garden ----------------
  const p = plan.plot;
  const plotRect = [p.x0 * IN, p.z0 * IN, p.x1 * IN, p.z1 * IN];
  {
    const garden = new THREE.Mesh(flatRect(plotRect, GROUND + 0.002), M.paving);
    garden.receiveShadow = true;
    garden.userData.floor = { name: 'Compound', label: '', outdoor: true, garden: true, rects: [plotRect], tour: false };
    root.add(garden);
    floors.push(garden);
    // assumed boundary: 3′-0″ solid wall + steel bar railing to 5′-0″ (not shown on the drawings).
    // Each side is its own group so an elevation design can swap in its own boundary on the road sides.
    const Hc = STD.compound * IN, Hs = 0.914, tt = 0.23;
    const sides = {
      n: { a: plotRect[0], b: plotRect[2], fixed: plotRect[1], vertical: false, sgn: 1 },
      s: { a: plotRect[0], b: plotRect[2], fixed: plotRect[3], vertical: false, sgn: -1 },
      w: { a: plotRect[1], b: plotRect[3], fixed: plotRect[0], vertical: true, sgn: 1 },
      e: { a: plotRect[1], b: plotRect[3], fixed: plotRect[2], vertical: true, sgn: -1 },
    };
    const gateMat = M.solid('#24272b', { metalness: 0.7, roughness: 0.45 });
    for (const [side, d] of Object.entries(sides)) {
      const cg = (compound[side] = new THREE.Group());
      root.add(cg);
      const bars = [];
      const gates = p.gates.filter((g) => g.side === side).map((g) => [g.from * IN, g.to * IN]).sort((u, v) => u[0] - v[0]);
      const fixed = d.fixed + d.sgn * (tt / 2); // wall sits inside the plot line
      let cur = d.a;
      const seg = (a, b) => {
        if (b - a < 0.05) return;
        const m = d.vertical ? K.box(tt, Hs, b - a, M.paintExt, fixed, GROUND + Hs / 2, (a + b) / 2) : K.box(b - a, Hs, tt, M.paintExt, (a + b) / 2, GROUND + Hs / 2, fixed);
        worldUV(m);
        m.userData.wall = true;
        cg.add(m);
        solids.push(m);
        cg.add(d.vertical ? K.box(0.04, 0.04, b - a, gateMat, fixed, GROUND + Hc - 0.02, (a + b) / 2) : K.box(b - a, 0.04, 0.04, gateMat, (a + b) / 2, GROUND + Hc - 0.02, fixed));
        for (let s = a + 0.06; s < b; s += 0.12) bars.push(d.vertical ? [fixed, GROUND + Hs + (Hc - Hs) / 2, s, Hc - Hs] : [s, GROUND + Hs + (Hc - Hs) / 2, fixed, Hc - Hs]);
        const fp = d.vertical ? [fixed - tt / 2, a, fixed + tt / 2, b] : [a, fixed - tt / 2, b, fixed + tt / 2];
        colliders.push({ r: fp, clear: 0.22, wall: true });
        mini.walls.push(fp);
      };
      for (const [ga, gb] of gates) {
        seg(cur, ga);
        for (const pos of [ga, gb]) cg.add(d.vertical ? K.box(0.3, Hc + 0.15, 0.3, M.paintExt, fixed, GROUND + (Hc + 0.15) / 2, pos) : K.box(0.3, Hc + 0.15, 0.3, M.paintExt, pos, GROUND + (Hc + 0.15) / 2, fixed));
        const gl = (gb - ga) / 2 - 0.2, gy0 = GROUND + 0.08, gh = 1.35;
        for (const [s0, s1] of [[ga + 0.15, ga + 0.15 + gl], [gb - 0.15 - gl, gb - 0.15]]) {
          for (const y of [gy0 + 0.02, gy0 + gh - 0.02]) cg.add(d.vertical ? K.box(0.04, 0.04, gl, gateMat, fixed, y, (s0 + s1) / 2) : K.box(gl, 0.04, 0.04, gateMat, (s0 + s1) / 2, y, fixed));
          for (let s = s0 + 0.05; s < s1; s += 0.11) bars.push(d.vertical ? [fixed, gy0 + gh / 2, s, gh] : [s, gy0 + gh / 2, fixed, gh]);
        }
        cur = gb;
      }
      seg(cur, d.b);
      // railing / gate bars for this side as one instanced mesh (one draw call)
      const barMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.022, 1, 0.022), gateMat, bars.length);
      const mtx = new THREE.Matrix4();
      bars.forEach(([x, y, z, h], i) => barMesh.setMatrixAt(i, mtx.makeScale(1, h, 1).setPosition(x, y, z)));
      barMesh.castShadow = true;
      cg.add(barMesh);
    }
  }

  // ---------------- site from the survey map ----------------
  const site = buildSite(plan, M, K, root, siteLabels, plotRect);

  // ---------------- navigation ----------------
  const walkAreas = [...rooms.flatMap((r) => r.rects), plotRect];
  const nav = new NavGrid([plotRect[0] - 0.5, plotRect[1] - 0.5, plotRect[2] + 0.5, plotRect[3] + 0.5], walkAreas, [st], colliders);
  const start = viewpoint(byName('Front Balcony'), doorways, roomAt, nav, poojaSpots)[0];
  for (const room of rooms) {
    const cands = viewpoint(room, doorways, roomAt, nav, poojaSpots);
    room.view = cands.find((c, i) => i > 30 || nav.path(start.x, start.z, c.x, c.z)) || cands[0];
    // clear span through the main rect's centre (covers L-shaped rooms the same way the validator measures them)
    const [mx, mz] = room.center;
    const across = room.rects.filter((q) => mz >= q[1] && mz <= q[3]), down = room.rects.filter((q) => mx >= q[0] && mx <= q[2]);
    const sw = Math.max(...across.map((q) => q[2])) - Math.min(...across.map((q) => q[0]));
    const sd = Math.max(...down.map((q) => q[3])) - Math.min(...down.map((q) => q[1]));
    room.spanRect = [Math.min(...across.map((q) => q[0])), Math.min(...down.map((q) => q[1])), Math.max(...across.map((q) => q[2])), Math.max(...down.map((q) => q[3]))];
    room.label = room.outdoor ? room.drawLabel : `${ftIn(sw)} × ${ftIn(sd)}`;
  }

  // ---------------- labels, dimension overlay, markers ----------------
  const mk = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false });
  for (const room of rooms) {
    const [cx, cz] = room.center;
    const el = label(`<b>${room.name}</b><span>${room.label}</span>`, 'rlabel' + (room.tour ? '' : ' minor'), () => onLabelClick(room));
    el.position.set(cx, room.outdoor ? 0.6 : 1.4, cz);
    labels.add(el);
    if (room.tour) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.17, 32), mk);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(room.view.x, 0.01, room.view.z);
      markers.add(ring);
    }
    if (!room.outdoor) addDims(dims, room.spanRect);
  }

  // ---------------- elevation ideas for the road-facing sides ----------------
  const door = (vertical) => openingsAll.find((o) => o.kind === 'dd' && o.outer && o.vertical === vertical && (vertical ? o.c < W / 2 : o.c > D / 2));
  const md = door(false), sd = door(true);
  const elevations = buildElevations(M, {
    W: W * IN, D: D * IN, S: bal.side * IN, F: bal.front * IN, ceil: CEIL, slab: SLAB, parapet: STD.parapet * IN, ground: GROUND,
    mainX: md ? ((md.a + md.b) / 2) * IN : (W * IN) / 3, sideZ: sd ? ((sd.a + sd.b) / 2) * IN : (D * IN) / 2, stairs: st,
    windows: openingsAll.filter((o) => o.outer && o.kind === 'w').map((o) => ({ vertical: o.vertical, c: o.c * IN, a: o.a * IN, b: o.b * IN, lo: o.lo, hi: o.hi })),
    openings: openingsAll.filter((o) => o.outer).map((o) => ({ vertical: o.vertical, c: o.c * IN, a: o.a * IN, b: o.b * IN, lo: o.lo, hi: o.hi })),
    plot: [plan.plot.x0 * IN, plan.plot.z0 * IN, plan.plot.x1 * IN, plan.plot.z1 * IN],
    gates: plan.plot.gates.map((g) => ({ side: g.side, from: g.from * IN, to: g.to * IN })),
  });
  for (const g of Object.values(elevations)) root.add(g);
  // scale references (people on the verandah, a car on G.P Road): shown in the outside views only
  const scaleRefs = buildScaleRefs(M, {
    verandah: frontBal, doorX: md ? ((md.a + md.b) / 2) * IN : (W * IN) / 3, stairs: st,
    roadZ: plotRect[3] + 0.3, roadY: GROUND - 0.06, plotX: plotRect[2] + 2.3, // car parked just past the plot's east corner
  });
  root.add(scaleRefs);

  const insideSlab = (x, z) => [building, sideBal, frontBal].some((r) => inRect(x, z, r));
  return {
    plan, root, ceilings, roof, labels, siteLabels, dims, markers, rooms, floors, solids, furnMeshes, fans, elevations, lighting, skirts, compound, parapet, electrical, scaleRefs,
    colliders, nav, building, plotRect, stairs: st, stairInfo, mini, site, roomAt, report, openings: openingsAll,
    floorY: (x, z) => (insideSlab(x, z) ? 0 : GROUND),
    walkAreas,
  };
}

// Dimension lines across a room (shown with the "Dimensions" toggle).
function addDims(group, r) {
  const [x0, z0, x1, z1] = r;
  const y = 0.03;
  const mat = new THREE.LineBasicMaterial({ color: '#d9362b', depthTest: false, transparent: true });
  const line = (pts) => {
    const g = new THREE.BufferGeometry().setFromPoints(pts.map(([x, z]) => new THREE.Vector3(x, y, z)));
    const l = new THREE.LineSegments(g, mat);
    l.renderOrder = 10;
    group.add(l);
  };
  const zx = z0 + (z1 - z0) * 0.35, xz = x0 + (x1 - x0) * 0.65, tk = 0.12;
  line([[x0, zx], [x1, zx], [x0, zx - tk], [x0, zx + tk], [x1, zx - tk], [x1, zx + tk]]);
  line([[xz, z0], [xz, z1], [xz - tk, z0], [xz + tk, z0], [xz - tk, z1], [xz + tk, z1]]);
  const w = x1 - x0, d = z1 - z0;
  for (const [txt, x, z] of [[`${w.toFixed(3)} m · ${ftIn(w)}`, (x0 + x1) / 2, zx], [`${d.toFixed(3)} m · ${ftIn(d)}`, xz, (z0 + z1) / 2]]) {
    const el = label(txt, 'dimlabel');
    el.position.set(x, y, z);
    group.add(el);
  }
}

// Candidate standpoints, best first. Balconies: outside the main/side door facing the house.
// Pooja: facing the mandir. Rooms: walkable spots farthest from the centre (corners) looking across.
function viewpoint(room, doorways, roomAt, nav, poojaSpots) {
  const yawOf = (dx, dz) => Math.atan2(-dx, -dz);
  const [cx, cz] = room.center;
  const mine = (x, z) => roomAt(x, z) === room && nav.ok(x, z);
  const out = [];
  for (const s of poojaSpots) {
    if (s.room !== room) continue;
    for (const d of [1.5, 1.25, 1.0, 0.8, 0.6]) {
      const x = s.x + s.n[0] * d, z = s.z + s.n[1] * d;
      if (mine(x, z)) out.push({ x, z, yaw: yawOf(-s.n[0], -s.n[1]), pitch: -0.28 });
    }
  }
  if (room.outdoor) {
    for (const d of doorways) {
      if (d.kind !== 'dd' || !d.outer) continue;
      for (const sgn of [1, -1]) {
        for (const depth of [1.4, 1.2, 1.0, 0.8]) {
          const x = d.p[0] + d.n[0] * sgn * depth, z = d.p[1] + d.n[1] * sgn * depth;
          if (mine(x, z)) out.push({ x, z, yaw: yawOf(-d.n[0] * sgn, -d.n[1] * sgn) });
        }
      }
    }
    return out.length ? out : [{ x: cx, z: cz, yaw: 0 }];
  }
  if (out.length) return out;
  if (room.finish === 'bath') {
    // toilets: stand just inside the door, looking into the room
    for (const d of doorways) {
      for (const sgn of [1, -1]) {
        for (const depth of [0.75, 0.6, 0.9, 0.45]) {
          const x = d.p[0] + d.n[0] * sgn * depth, z = d.p[1] + d.n[1] * sgn * depth;
          if (!mine(x, z)) continue;
          // look along the toilet's long axis toward its farther end
          const r = room.main, alongX = r[2] - r[0] >= r[3] - r[1];
          const [lx, lz] = alongX ? [Math.abs(r[0] - x) > Math.abs(r[2] - x) ? r[0] : r[2], cz] : [cx, Math.abs(r[1] - z) > Math.abs(r[3] - z) ? r[1] : r[3]];
          out.push({ x, z, yaw: yawOf(lx - x, lz - z), pitch: -0.38 });
        }
      }
    }
    if (out.length) return out;
  }
  const r = room.main;
  const inset = Math.min(0.35, (r[2] - r[0]) / 3, (r[3] - r[1]) / 3);
  const cands = [];
  for (let x = r[0] + inset; x <= r[2] - inset; x += 0.08) {
    for (let z = r[1] + inset; z <= r[3] - inset; z += 0.08) {
      if (!mine(x, z)) continue;
      const d = Math.hypot(x - cx, z - cz);
      cands.push({ x, z, d, yaw: d > 0.3 ? yawOf(cx - x, cz - z) : 0 });
    }
  }
  if (!cands.length) return [{ x: cx, z: cz, yaw: 0 }];
  return cands.sort((a, b) => b.d - a.d);
}

// =====================================================================
function buildSite(plan, M, K, root, siteLabels, plotRect) {
  // survey frame (feet): u along G.P Road NW→SE, v away from the road; Padma core = (0,0)-(56′-1″,59′-1″)
  const Wp = ([u, v]) => [plotRect[0] + (SITE_W_FT - u) * FT, plotRect[3] - v * FT];
  const group = new THREE.Group();
  root.add(group);
  const grass = new THREE.Mesh(flatRect([-250, -250, 250, 250], GROUND - 0.12), M.grass);
  grass.receiveShadow = true;
  group.add(grass);
  const centroid = (pts) => [pts.reduce((a, q) => a + q[0], 0) / pts.length, pts.reduce((a, q) => a + q[1], 0) / pts.length];
  for (const r of ROADS) {
    const pts = r.poly.map(Wp);
    const m = new THREE.Mesh(flatPoly(pts, GROUND - 0.06), r.kind === 'asphalt' ? M.asphalt : M.earth);
    m.receiveShadow = true;
    group.add(m);
    const [lx, lz] = r.at ? Wp(r.at) : centroid(pts);
    const el = label(r.label, 'slabel road');
    el.position.set(lx, GROUND + 0.2, lz);
    siteLabels.add(el);
  }
  {
    const a = Wp([-70, -10]), b = Wp([140, -10]);
    const dash = M.solid('#f2f2f2', { roughness: 0.6 });
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let s = 0; s < len; s += 3) {
      const t = s / len;
      const m = K.box(1.5, 0.01, 0.12, dash, a[0] + (b[0] - a[0]) * t, GROUND - 0.05, a[1] + (b[1] - a[1]) * t, false);
      m.rotation.y = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
      group.add(m);
    }
  }
  const stripMat = new THREE.MeshStandardMaterial({ color: '#e7c66b', roughness: 1, transparent: true, opacity: 0.5, depthWrite: false });
  const edgeMat = { home: M.solid('#d9362b'), other: M.solid('#2d2d2d', { roughness: 0.8 }) };
  const edge = (a, b, m, w) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    const e = K.box(L, 0.06, w, m, (a[0] + b[0]) / 2, GROUND + 0.03, (a[1] + b[1]) / 2, false);
    e.rotation.y = Math.atan2(-dz, dx);
    group.add(e);
  };
  const stone = M.solid('#f1eee7', { roughness: 0.8 });
  for (const parcel of PARCELS) {
    const pts = parcel.poly.map(Wp);
    if (parcel.kind !== 'home') {
      const m = new THREE.Mesh(flatPoly(pts, GROUND + (parcel.kind === 'strip' ? -0.02 : -0.04)), parcel.kind === 'strip' ? stripMat : M.soil);
      m.receiveShadow = true;
      group.add(m);
    }
    for (let i = 0; i < pts.length; i++) {
      edge(pts[i], pts[(i + 1) % pts.length], parcel.kind === 'home' ? edgeMat.home : edgeMat.other, parcel.kind === 'home' ? 0.14 : 0.08);
      group.add(K.box(0.2, 0.45, 0.2, stone, pts[i][0], GROUND + 0.22, pts[i][1]));
    }
    const [lx, lz] = centroid(pts);
    const el = label(`<b>${parcel.label}</b>${parcel.sub ? `<span>${parcel.sub}</span>` : ''}`, `slabel ${parcel.kind}`);
    el.position.set(lx, parcel.kind === 'home' ? CEIL + 2 : GROUND + 0.6, lz);
    siteLabels.add(el);
  }
  for (const d of DIMENSIONS) {
    const a = Wp(d.a), b = Wp(d.b), t = d.at ?? 0.5;
    const el = label(d.text, 'dlabel');
    el.position.set(a[0] + (b[0] - a[0]) * t, GROUND + 0.2, a[1] + (b[1] - a[1]) * t);
    siteLabels.add(el);
  }
  // trees (neem-sized: ~6–9 m) on the open Thirumal plot only (none on G. Thirupathi Reddy's plot or across G.P Road)
  let seed = 4242;
  const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const inPoly = (x, z, pts) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  const spots = [];
  for (const id of ['thirumal']) {
    const poly = PARCELS.find((q) => q.id === id).poly.map(Wp);
    const xs = poly.map((q) => q[0]), zs = poly.map((q) => q[1]);
    for (let k = 0; k < 6; k++) for (let tries = 0; tries < 40; tries++) {
      const pt = [Math.min(...xs) + R() * (Math.max(...xs) - Math.min(...xs)), Math.min(...zs) + R() * (Math.max(...zs) - Math.min(...zs))];
      if (inPoly(pt[0], pt[1], poly)) { spots.push(pt); break; }
    }
  }
  const trunk = M.walnut, leafMats = [M.solid('#56803c', { roughness: 0.85 }), M.solid('#668f45', { roughness: 0.85 }), M.solid('#4a7234', { roughness: 0.85 })];
  spots.forEach(([x, z], k) => {
    const s = 0.8 + R() * 0.5;
    const t = new THREE.Group();
    t.add(K.cyl(0.15 * s, 0.22 * s, 3 * s, trunk, 0, 1.5 * s, 0, 10));
    for (let i = 0; i < 4; i++) {
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry((1.6 + R()) * s, 2), leafMats[(k + i) % 3]);
      crown.position.set((R() - 0.5) * 1.6 * s, (3.6 + R() * 1.4) * s, (R() - 0.5) * 1.6 * s);
      crown.castShadow = true;
      t.add(crown);
    }
    t.position.set(x, GROUND, z);
    group.add(t);
  });
  stripGarden(plan, M, K, group, Wp, siteLabels);

  const all = [...PARCELS.flatMap((q) => q.poly), ...ROADS.filter((r) => r.id !== 'gp').flatMap((r) => r.poly)].map(Wp);
  const xs = all.map((q) => q[0]), zs = all.map((q) => q[1]);
  return { group, bounds: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], toWorld: Wp };
}

// Small garden on the triangular 23 SqYds strip along the 21 ft road (owner request).
// It runs from G.P Road up to 3′-6″ short of the side gate so the gate stays clear; the narrow
// tail of the triangle beyond the gate is left as is.
function stripGarden(plan, M, K, group, Wp, siteLabels) {
  const U0 = SITE_W_FT; // plot line (the strip starts here, outside the compound)
  const uOut = (v) => 63.25 - (7 + 2 / 12) * (v / 59.08); // outer edge of the 23 SqYds strip (7′-2″ at the road → 0)
  const wg = plan.plot.gates.filter((g) => g.side === 'w');
  const vGate = wg.length ? Math.min(...wg.map((g) => (plan.plot.z1 - g.to) / 12)) : 40;
  const v0 = 1.5, v1 = vGate - 3.5, inset = 0.3; // feet
  if (v1 - v0 < 4) return;
  const at = (v, t) => Wp([U0 + inset + (uOut(v) - inset - (U0 + inset)) * t, v]); // t: 0 at compound wall → 1 at road edge
  const poly = [at(v0, 0), at(v0, 1), at(v1, 1), at(v1, 0)];
  const y0 = GROUND;
  // raised bed: granite kerb, soil, lawn
  const kerb = M.granite;
  for (let i = 0; i < 4; i++) {
    const a = poly[i], b = poly[(i + 1) % 4];
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    const e = K.box(L + 0.1, 0.18, 0.1, kerb, (a[0] + b[0]) / 2, y0 + 0.09, (a[1] + b[1]) / 2);
    e.rotation.y = Math.atan2(-dz, dx);
    group.add(e);
  }
  const lawn = new THREE.Mesh(flatPoly(poly, y0 + 0.14), M.grass);
  lawn.receiveShadow = true;
  group.add(lawn);

  const flowerGeo = new THREE.IcosahedronGeometry(1, 0);
  const inst = (pts, mat) => {
    const m = new THREE.InstancedMesh(flowerGeo, mat, pts.length);
    const t = new THREE.Matrix4();
    pts.forEach(([x, y, z, s], i) => m.setMatrixAt(i, t.makeScale(s, s, s).setPosition(x, y, z)));
    m.castShadow = true;
    group.add(m);
  };
  let seed = 77;
  const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const shrubGreen = M.solid('#3f6b2f', { roughness: 0.8 });
  const colours = { hibiscus: M.solid('#c8102e', { roughness: 0.6 }), bougainvillea: M.solid('#c2187a', { roughness: 0.6 }), marigold: M.solid('#f59f00', { roughness: 0.7 }), marigoldDeep: M.solid('#e8590c', { roughness: 0.7 }), plumeria: M.solid('#fff6dc', { roughness: 0.5 }) };
  const blooms = { hibiscus: [], bougainvillea: [], marigold: [], marigoldDeep: [], plumeria: [] };

  // road-side hedge of hibiscus / bougainvillea shrubs (~0.8 m tall)
  const lenFt = v1 - v0;
  const nShrub = Math.max(3, Math.floor((lenFt * FT) / 0.9));
  for (let i = 0; i < nShrub; i++) {
    const v = v0 + 1 + (i / (nShrub - 1)) * (lenFt - 2);
    const [x, z] = at(v, 0.86);
    const kind = i % 2 ? 'bougainvillea' : 'hibiscus';
    const r = 0.3 + R() * 0.08;
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), shrubGreen);
    s.position.set(x, y0 + 0.14 + r * 0.9, z);
    s.scale.y = 1.15;
    s.castShadow = true;
    group.add(s);
    for (let k = 0; k < 9; k++) {
      const a = R() * Math.PI * 2, b = R() * Math.PI * 0.45;
      blooms[kind].push([x + Math.cos(a) * Math.cos(b) * r, y0 + 0.14 + r * 0.9 + Math.sin(b) * r * 1.1, z + Math.sin(a) * Math.cos(b) * r, 0.04]);
    }
  }
  // marigold border along the compound wall side
  for (let v = v0 + 0.6; v < v1 - 0.4; v += 0.75) {
    for (const t of [0.08, 0.2]) {
      const [x, z] = at(v + (t > 0.1 ? 0.37 : 0), t);
      const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), shrubGreen);
      p.position.set(x, y0 + 0.22, z);
      group.add(p);
      blooms[R() > 0.5 ? 'marigold' : 'marigoldDeep'].push([x, y0 + 0.31, z, 0.05], [x + 0.06, y0 + 0.29, z - 0.05, 0.04]);
    }
  }
  // stepping-stone path down the middle
  for (let v = v0 + 0.8; v < v1 - 0.5; v += 2.0) {
    const [x, z] = at(v, 0.5);
    const st = K.cyl(0.2, 0.2, 0.04, M.stone, x, y0 + 0.16, z, 20);
    st.scale.z = 0.7;
    group.add(st);
  }
  // two frangipani (plumeria) trees at the wide end, and solar bollard lights
  for (const [v, t] of [[v0 + 2.5, 0.45], [v0 + Math.min(10, lenFt * 0.45), 0.5]]) {
    const [x, z] = at(v, t);
    const tree = new THREE.Group();
    tree.add(K.cyl(0.05, 0.07, 1.3, M.walnut, 0, 0.65, 0, 8));
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3 + R();
      const br = K.cyl(0.03, 0.04, 0.8, M.walnut, Math.cos(a) * 0.2, 1.55, Math.sin(a) * 0.2, 6);
      br.rotation.z = Math.cos(a) * 0.5;
      br.rotation.x = -Math.sin(a) * 0.5;
      tree.add(br);
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), shrubGreen);
      leaf.position.set(Math.cos(a) * 0.42, 2.0, Math.sin(a) * 0.42);
      leaf.scale.y = 0.6;
      leaf.castShadow = true;
      tree.add(leaf);
      for (let f = 0; f < 7; f++) blooms.plumeria.push([x + Math.cos(a) * 0.42 + (R() - 0.5) * 0.6, y0 + 0.14 + 2.18 + R() * 0.1, z + Math.sin(a) * 0.42 + (R() - 0.5) * 0.6, 0.035]);
    }
    tree.position.set(x, y0 + 0.14, z);
    group.add(tree);
  }
  for (const v of [v0 + 0.4, (v0 + v1) / 2, v1 - 0.4]) {
    const [x, z] = at(v, 0.32);
    group.add(K.cyl(0.04, 0.05, 0.55, M.alu, x, y0 + 0.14 + 0.275, z, 12));
    group.add(K.cyl(0.06, 0.06, 0.06, M.lamp, x, y0 + 0.14 + 0.58, z, 12));
  }
  for (const [k, pts] of Object.entries(blooms)) if (pts.length) inst(pts, colours[k]);

  const [lx, lz] = at((v0 + v1) / 2, 0.5);
  const el = label('<b>Garden</b><span>23 SqYds strip · gate kept clear</span>', 'slabel strip');
  el.position.set(lx, GROUND + 1.2, lz);
  siteLabels.add(el);
}
