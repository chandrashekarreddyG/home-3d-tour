// Minimal Kerala-style elevation ideas for the two road-facing sides: the front (G.P Road, +z)
// and the side (21 ft road, −x). These are design proposals added on top of the drawings; they do
// not move any wall, door, window or room.
import * as THREE from 'three';
import { boxGeo } from './materials.js';

export const ELEVATIONS = [
  { id: 'none', name: 'As drawn', blurb: 'Plain plastered elevation (no added features).', paint: '#e8d8bd' },
  { id: 'verandah', name: 'Tiled verandah', blurb: 'Lean-to Mangalore-tile roofs over both verandahs, teak posts on granite bases, teak fascia and a laterite plinth.', paint: '#f4efe6' },
  { id: 'laterite', name: 'Laterite & teak', blurb: 'Flat roof kept. Laterite-clad corner piers, a teak slab fascia, a teak louvre screen on the parapet and a small tiled gable porch at the main entrance.', paint: '#efe9df' },
  { id: 'gables', name: 'Twin gables', blurb: 'Two tiled gables (nalukettu-inspired), one over each road-facing entrance, with teak jaali gable ends and teak posts.', paint: '#f7f4ee' },
  { id: 'eave', name: 'Continuous eave', blurb: 'A slim, continuous tiled eave (1.1 m) wrapping both road sides at parapet level, a teak soffit and a dark granite plinth band.', paint: '#ece3d3' },
];

export function buildElevations(M, dims) {
  const { W, D, S, F, ceil, slab, parapet, ground, mainX, sideZ, stairs } = dims;
  const top = ceil + slab; // roof slab top
  const ptop = top + parapet; // parapet top
  const out = {};
  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(boxGeo(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    return m;
  };
  const cyl = (r, h, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, h, 20), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    return m;
  };
  // sloped tiled plate: high edge at local z = 0 (height rise), low edge at z = run; spans x ±len/2
  const slope = (len, run, rise, withFascia = true) => {
    const g = new THREE.Group();
    const L = Math.hypot(run, rise), th = Math.atan2(rise, run);
    const plate = box(len, 0.05, L, M.roofTile, 0, 0, 0);
    const pivot = new THREE.Group();
    pivot.add(plate);
    plate.position.set(0, 0, L / 2);
    pivot.rotation.x = th;
    pivot.position.y = rise;
    g.add(pivot);
    const soffit = box(len, 0.02, L, M.teak, 0, -0.04, L / 2);
    pivot.add(soffit);
    if (withFascia) g.add(box(len + 0.04, 0.2, 0.03, M.teak, 0, -0.07, run + 0.01));
    return g;
  };
  const post = (g, x, z) => {
    g.add(box(0.32, 0.35, 0.32, M.granite, x, 0.175, z));
    g.add(cyl(0.1, ceil - 0.5, M.teak, x, 0.35 + (ceil - 0.5) / 2, z));
    g.add(box(0.3, 0.15, 0.3, M.teak, x, ceil - 0.075, z));
  };
  const keepClear = (v, centre, half) => Math.abs(v - centre) > half;
  // posts along the verandah edges, spaced ~3 m, kept off the entrance axes and the stair
  const edgePosts = (g, inset = 0.15) => {
    const zf = D + F - inset, xs = -S + inset;
    const xEnd = stairs[0] - 0.3;
    const nF = Math.max(1, Math.round((xEnd - xs) / 3));
    for (let i = 0; i <= nF; i++) {
      const x = xs + ((xEnd - xs) * i) / nF;
      if (i === 0 || keepClear(x, mainX, 0.9)) post(g, x, zf);
    }
    const nS = Math.max(1, Math.round((zf - 0.3) / 3));
    for (let i = 0; i < nS; i++) {
      const z = 0.3 + ((zf - 0.3) * i) / nS;
      if (keepClear(z, sideZ, 0.9)) post(g, xs, z);
    }
  };
  const plinthClad = (g, mat) => {
    const h = -ground;
    g.add(box(W + S, h, 0.03, mat, (W - S) / 2, ground / 2, D + F + 0.015));
    g.add(box(0.03, h, D + F, mat, -S - 0.015, ground / 2, (D + F) / 2));
  };
  // pitched gable: ridge perpendicular to the facade. `toward` = +z (front) or −x (side)
  const gable = (g, width, depth, rise, eaveY, cx, cz, toward) => {
    const grp = new THREE.Group();
    for (const s of [-1, 1]) {
      const pl = slope(depth, width / 2, rise);
      pl.rotation.y = s * Math.PI / 2; // downslope toward ±x, length along z
      pl.position.set(0, 0, depth / 2);
      grp.add(pl);
    }
    // gable end: white triangle with teak jaali slats, at the road end (local z = depth)
    const tri = new THREE.Shape([new THREE.Vector2(-width / 2 + 0.15, 0), new THREE.Vector2(width / 2 - 0.15, 0), new THREE.Vector2(0, rise - 0.1)]);
    const tm = new THREE.Mesh(new THREE.ShapeGeometry(tri), M.paintExt);
    tm.position.set(0, 0, depth - 0.35);
    grp.add(tm);
    for (let x = -width / 2 + 0.45; x <= width / 2 - 0.45; x += 0.14) {
      const h = (rise - 0.1) * (1 - Math.abs(x) / (width / 2 - 0.15));
      if (h > 0.08) grp.add(box(0.035, h, 0.04, M.teak, x, h / 2, depth - 0.33));
    }
    grp.add(box(0.14, 0.14, depth + 0.1, M.teak, 0, rise + 0.03, depth / 2)); // ridge beam
    grp.position.set(cx, eaveY, cz);
    grp.rotation.y = toward === 'side' ? -Math.PI / 2 : 0;
    g.add(grp);
  };

  // ---------- A: tiled verandah ----------
  {
    const g = new THREE.Group();
    const over = 0.45, yHigh = ptop + 0.35, yLow = top + 0.05;
    const segs = [[-S - over, stairs[0] - 0.05]];
    if (W + over - (stairs[2] + 0.05) > 0.8) segs.push([stairs[2] + 0.05, W + over]);
    for (const [a, b] of segs) {
      const p = slope(b - a, F + over, yHigh - yLow);
      p.position.set((a + b) / 2, yLow, D);
      g.add(p);
    }
    const ps = slope(D + F + over, S + over, yHigh - yLow);
    ps.rotation.y = -Math.PI / 2;
    ps.position.set(0, yLow, (D + F + over) / 2 - 0.0);
    g.add(ps);
    g.add(box(W + S, 0.18, 0.18, M.teak, (W - S) / 2, yHigh + 0.05, D + 0.09)); // wall plate
    g.add(box(0.18, 0.18, D + F, M.teak, -0.09, yHigh + 0.05, (D + F) / 2));
    edgePosts(g);
    plinthClad(g, M.laterite);
    out.verandah = g;
  }
  // ---------- B: laterite & teak minimal ----------
  {
    const g = new THREE.Group();
    g.add(box(W + S + 0.04, 0.3, 0.04, M.teak, (W - S) / 2, ceil + 0.1, D + F + 0.02)); // slab fascia
    g.add(box(0.04, 0.3, D + F + 0.04, M.teak, -S - 0.02, ceil + 0.1, (D + F) / 2));
    for (let k = 0; k < 3; k++) {
      const y = top + 0.22 + k * 0.25;
      g.add(box(W + S, 0.06, 0.05, M.teak, (W - S) / 2, y, D + F + 0.08));
      g.add(box(0.05, 0.06, D + F, M.teak, -S - 0.08, y, (D + F) / 2));
    }
    const pier = (x, z) => g.add(box(0.38, ceil, 0.38, M.laterite, x, ceil / 2, z));
    pier(-S + 0.19, D + F - 0.19);
    pier(-S + 0.19, 0.19);
    pier(stairs[0] - 0.25, D + F - 0.19);
    for (const dx of [-1.25, 1.25]) if (mainX + dx > -S + 0.6 && mainX + dx < stairs[0] - 0.6) pier(mainX + dx, D + F - 0.19);
    plinthClad(g, M.laterite);
    gable(g, 2.9, F + 0.6, 1.15, ptop - 0.05, mainX, D, 'front');
    out.laterite = g;
  }
  // ---------- C: twin gables ----------
  {
    const g = new THREE.Group();
    const fw = Math.min(5.2, Math.max(3.2, stairs[0] - (-S) - 0.6));
    const fx = Math.min(Math.max(mainX, -S + fw / 2 + 0.1), stairs[0] - fw / 2 - 0.1);
    gable(g, fw, F + 0.8, 1.7, ptop - 0.05, fx, D - 0.2, 'front');
    const sw = 4.2, sz = Math.min(Math.max(sideZ, sw / 2 + 0.2), D + F - sw / 2);
    // side gable: local +z points to −x
    const grp = new THREE.Group();
    gable(grp, sw, S + 0.8, 1.5, 0, 0, 0, 'front');
    grp.rotation.y = -Math.PI / 2;
    grp.position.set(0.2, ptop - 0.05, sz);
    g.add(grp);
    for (const dx of [-fw / 2 + 0.2, fw / 2 - 0.2]) post(g, fx + dx, D + F - 0.15);
    for (const dz of [-sw / 2 + 0.2, sw / 2 - 0.2]) post(g, -S + 0.15, sz + dz);
    plinthClad(g, M.granite);
    out.gables = g;
  }
  // ---------- D: continuous eave ----------
  {
    const g = new THREE.Group();
    const dep = 1.1, rise = 0.42;
    const front = slope(W + S + dep + 0.3, dep, rise);
    front.position.set((W - S - dep + 0.3) / 2, ptop - rise + 0.02, D + F);
    g.add(front);
    const side = slope(D + F + 0.3, dep, rise);
    side.rotation.y = -Math.PI / 2;
    side.position.set(-S, ptop - rise + 0.02, (D + F - 0.3) / 2);
    g.add(side);
    plinthClad(g, M.granite);
    g.add(box(W + S, 0.06, 0.06, M.teak, (W - S) / 2, ceil - 0.03, D + F + 0.03));
    g.add(box(0.06, 0.06, D + F, M.teak, -S - 0.03, ceil - 0.03, (D + F) / 2));
    out.eave = g;
  }
  for (const g of Object.values(out)) g.visible = false;
  return out;
}
