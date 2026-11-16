// Minimal Kerala-style elevation ideas for the two road-facing sides: the front (G.P Road, +z)
// and the side (21 ft road, −x). These are design proposals added on top of the drawings; they do
// not move any wall, door, window or room.
import * as THREE from 'three';
import { boxGeo } from './materials.js';

export const ELEVATIONS = [
  { id: 'none', name: 'As drawn', blurb: 'Plain plastered elevation (no added features).', paint: '#e8d8bd' },
  { id: 'verandah', style: 'Kerala', name: 'Tiled verandah', blurb: 'Lean-to Mangalore-tile roofs over both verandahs, teak posts on granite bases, teak fascia and a laterite plinth.', paint: '#f4efe6' },
  { id: 'laterite', style: 'Kerala', name: 'Laterite & teak', blurb: 'Flat roof kept. Laterite-clad corner piers, a teak slab fascia, a teak louvre screen on the parapet and a small tiled gable porch at the main entrance.', paint: '#efe9df' },
  { id: 'gables', style: 'Kerala', name: 'Twin gables', blurb: 'Two tiled gables (nalukettu-inspired), one over each road-facing entrance, with teak jaali gable ends and teak posts.', paint: '#f7f4ee' },
  { id: 'eave', style: 'Kerala', name: 'Continuous eave', blurb: 'A slim, continuous tiled eave (1.1 m) wrapping both road sides at parapet level, a teak soffit and a dark granite plinth band.', paint: '#ece3d3' },
  { id: 'frame', style: 'Modern', name: 'Floating frame', blurb: 'Greige walls with a deep white frame wrapping both verandahs, charcoal plaster bands above the two entrances and slim charcoal window surrounds.', paint: '#e6e1d8' },
  { id: 'slats', style: 'Modern', name: 'Oak slats', blurb: 'Warm white walls, an oak-clad verandah soffit and slab edge, and vertical oak slat screens at the road corner and beside the stair.', paint: '#f1ede6' },
  { id: 'stone', style: 'Modern', name: 'Stone & glass', blurb: 'Cool white walls, a stone-clad corner pier and plinth, a frameless glass balustrade on the roof edge, and a thin lit canopy over the front steps.', paint: '#ebeae6' },
  { id: 'pergola', style: 'Modern', name: 'Pergola & planters', blurb: 'Soft sage walls, pale grey parapet louvres, a slim black steel roof pergola over the verandah corner, and low concrete planters along the plinth (entrances kept clear).', paint: '#e2e4d9' },
  { id: 'ref1', style: 'Reference', name: 'Stone band & wood soffit', blurb: 'Like your 1st photo: white walls and square verandah pillars, a grey cut-stone parapet band in a white frame, a tall white box frame with a lit wooden soffit, a grey stone wall, teak louvred windows, up/down wall lights, a lit planter, granite steps and paving slabs with grass joints.', paint: '#f2f0eb' },
  { id: 'ref2', style: 'Reference', name: 'Brick & wood box', blurb: 'Like your 2nd photo: white box frames, an exposed-brick feature wall with wall washers, a tall box with vertical wood cladding and grooved white panels, a black louvre rail on the roof, LED-lit steps, lit planters and paving slabs with grass joints.', paint: '#f6f5f1' },
  { id: 'ref3', style: 'Reference', name: 'Feature frame & grooves', blurb: 'Like your 3rd photo and the Pinterest pin: a tall corner frame lined in teak with warm LED edges, sandstone strip cladding, grey panels with diagonal grooves, a projecting white window box, a black flat canopy, a steel roof railing and a long lit planter.', paint: '#efefec' },
];

export function buildElevations(M, dims) {
  const { W, D, S, F, ceil, slab, parapet, ground, mainX, sideZ, stairs } = dims;
  const plot = dims.plot || [-S - 2, -1, W + 1, D + F + 2];
  const openings = dims.openings || [];
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
  // ======================= modern =======================
  const windows = dims.windows || []; // road-facing windows: { vertical, c, a, b, lo, hi } in metres
  const charcoal = M.paintExt.clone();
  charcoal.color.set('#5f605e');
  const white = M.solid('#f7f6f2', { roughness: 0.85 });
  const steel = M.solid('#1e2022', { metalness: 0.6, roughness: 0.4 });
  const pale = M.solid('#c9cac6', { roughness: 0.6 });
  const concrete = M.solid('#b7b4ad', { roughness: 0.95 });
  const roadSide = (o) => (o.vertical ? o.c < W / 2 : o.c > D / 2);
  const surround = (g, mat, proj = 0.09, t = 0.07) => {
    for (const o of windows.filter(roadSide)) {
      const L = o.b - o.a, mid = (o.a + o.b) / 2, h = o.hi - o.lo, ym = (o.lo + o.hi) / 2;
      const face = o.vertical ? 0 : D;
      const put = (w, hh, along, y) => g.add(o.vertical ? box(proj, hh, w, mat, face - proj / 2, y, along) : box(w, hh, proj, mat, along, y, face + proj / 2));
      put(L + 2 * t, t, mid, o.hi + t / 2);
      put(L + 2 * t, t, mid, o.lo - t / 2);
      put(t, h, o.a - t / 2, ym);
      put(t, h, o.b + t / 2, ym);
    }
  };
  // planters / screens must leave the entrance axes and the stair clear
  const clearOf = (x, z) => Math.abs(x - mainX) > 1.1 && Math.abs(z - sideZ) > 1.1 && !(x > stairs[0] - 0.3 && z > D);

  // ---------- E: floating frame ----------
  {
    const g = new THREE.Group();
    const t = 0.3, bandH = 0.55, yb = top - bandH / 2 + 0.15;
    g.add(box(W + S + 2 * t, bandH, t, white, (W - S) / 2, yb, D + F + t / 2)); // front band
    g.add(box(t, bandH, D + F, white, -S - t / 2, yb, (D + F) / 2)); // side band
    g.add(box(t, yb + bandH / 2 - ground, F + t, white, W + t / 2, (yb + bandH / 2 + ground) / 2, D + (F + t) / 2)); // right fin
    g.add(box(S + t, yb + bandH / 2 - ground, t, white, -(S + t) / 2, (yb + bandH / 2 + ground) / 2, -t / 2)); // rear fin of side frame
    g.add(box(t, yb + bandH / 2 - ground, t, white, -S - t / 2, (yb + bandH / 2 + ground) / 2, D + F + t / 2)); // corner post
    // charcoal plaster band above each road-facing entrance
    g.add(box(2.4, ceil - 2.2, 0.02, charcoal, mainX, (ceil + 2.2) / 2, D + 0.011));
    g.add(box(0.02, ceil - 2.2, 2.4, charcoal, -0.011, (ceil + 2.2) / 2, sideZ));
    surround(g, charcoal);
    out.frame = g;
  }
  // ---------- F: oak slats ----------
  {
    const g = new THREE.Group();
    g.add(box(W + S, 0.012, F, M.oak, (W - S) / 2, ceil - 0.007, D + F / 2)); // verandah soffits
    g.add(box(S, 0.012, D, M.oak, -S / 2, ceil - 0.007, D / 2));
    g.add(box(W + S + 0.04, 0.32, 0.03, M.oak, (W - S) / 2, ceil + 0.08, D + F + 0.015)); // slab edge
    g.add(box(0.03, 0.32, D + F + 0.04, M.oak, -S - 0.015, ceil + 0.08, (D + F) / 2));
    const slat = (x, z, alongX) => g.add(box(alongX ? 0.045 : 0.09, ceil - 0.02, alongX ? 0.09 : 0.045, M.oak, x, (ceil - 0.02) / 2, z));
    for (let x = -S + 0.08; x < -S + 1.7; x += 0.13) slat(x, D + F - 0.06, true); // corner screen, front
    for (let z = D + F - 0.08; z > D + F - 1.7; z -= 0.13) slat(-S + 0.06, z, false); // corner screen, side
    for (let x = stairs[0] - 0.12; x > stairs[0] - 1.2; x -= 0.13) slat(x, D + F - 0.06, true); // beside the stair
    g.add(box(1.75, 0.05, 0.12, M.oak, -S + 0.85, ceil - 0.045, D + F - 0.06));
    g.add(box(0.12, 0.05, 1.75, M.oak, -S + 0.06, ceil - 0.045, D + F - 0.85));
    surround(g, white, 0.06, 0.05);
    out.slats = g;
  }
  // ---------- G: stone & glass ----------
  {
    const g = new THREE.Group();
    g.add(box(0.5, ptop - ground, 0.5, M.stone, -S - 0.25, (ptop + ground) / 2, D + F + 0.25)); // stone corner pier
    plinthClad(g, M.stone);
    // frameless glass balustrade over the parapet line + steel shoe
    g.add(box(W + S, 0.5, 0.015, M.glass, (W - S) / 2, ptop + 0.25, D + F + 0.03));
    g.add(box(0.015, 0.5, D + F, M.glass, -S - 0.03, ptop + 0.25, (D + F) / 2));
    g.add(box(W + S, 0.05, 0.05, steel, (W - S) / 2, ptop + 0.025, D + F + 0.03));
    g.add(box(0.05, 0.05, D + F, steel, -S - 0.03, ptop + 0.025, (D + F) / 2));
    // thin cantilever canopy over the front steps, LED strip underneath
    g.add(box(3.0, 0.1, 1.2, white, mainX, ceil + 0.05, D + F + 0.6));
    g.add(box(2.8, 0.012, 0.03, M.lamp, mainX, ceil - 0.006, D + F + 1.1));
    surround(g, pale, 0.05, 0.04);
    out.stone = g;
  }
  // ---------- H: pergola & planters ----------
  {
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const y = top + 0.15 + k * 0.2;
      g.add(box(W + S + 0.1, 0.05, 0.06, pale, (W - S) / 2, y, D + F + 0.06));
      g.add(box(0.06, 0.05, D + F + 0.1, pale, -S - 0.06, y, (D + F) / 2));
    }
    // black steel pergola on the roof over the verandah corner
    const px0 = -S + 0.1, px1 = Math.min(stairs[0] - 0.3, px0 + 5), pz0 = D - 1.5, pz1 = D + F - 0.1, ph = 2.4;
    for (const [x, z] of [[px0, pz0], [px1, pz0], [px0, pz1], [px1, pz1]]) g.add(box(0.08, ph, 0.08, steel, x, top + ph / 2, z));
    g.add(box(px1 - px0 + 0.2, 0.12, 0.06, steel, (px0 + px1) / 2, top + ph, pz0));
    g.add(box(px1 - px0 + 0.2, 0.12, 0.06, steel, (px0 + px1) / 2, top + ph, pz1));
    for (let x = px0; x <= px1 + 1e-6; x += 0.35) g.add(box(0.04, 0.14, pz1 - pz0 + 0.3, steel, x, top + ph + 0.12, (pz0 + pz1) / 2));
    // low concrete planters along the plinth, gaps at both entrances and the stair
    const leaf = M.solid('#56773f', { roughness: 0.85 });
    const planter = (x, z, alongX) => {
      g.add(box(alongX ? 1.0 : 0.4, 0.45, alongX ? 0.4 : 1.0, concrete, x, ground + 0.225, z));
      for (let k = -1; k <= 1; k++) {
        const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), leaf);
        s.position.set(x + (alongX ? k * 0.3 : 0), ground + 0.55, z + (alongX ? 0 : k * 0.3));
        s.castShadow = true;
        g.add(s);
      }
    };
    for (let x = -S + 0.6; x < W - 0.5; x += 1.25) if (clearOf(x, D + F + 0.3)) planter(x, D + F + 0.3, true);
    for (let z = 0.6; z < D + F - 0.5; z += 1.25) if (clearOf(-S - 0.3, z)) planter(-S - 0.3, z, false);
    out.pergola = g;
  }
  // ======================= reference-inspired (owner's photos) =======================
  // facade helpers: 'front' = wall face z = D (normal +z), 'side' = wall face x = 0 (normal −x)
  const FACE = {
    front: { open: (o) => !o.vertical && o.c > D / 2, put: (w, h, t, mat, a, y, off = 0) => box(w, h, t, mat, a, y, D + off + t / 2), n: [0, 1] },
    side: { open: (o) => o.vertical && o.c < W / 2, put: (w, h, t, mat, a, y, off = 0) => box(t, h, w, mat, -off - t / 2, y, a), n: [-1, 0] },
  };
  // wall cladding on a facade between `from`–`to`, y0–y1, cut around doors and windows
  const clad = (g, face, from, to, y0, y1, mat, t = 0.025) => {
    let rects = [[from, y0, to, y1]];
    for (const o of openings.filter(FACE[face].open)) {
      const h = [o.a - 0.01, o.lo - 0.01, o.b + 0.01, o.hi + 0.01];
      rects = rects.flatMap((r) => {
        if (h[2] <= r[0] || h[0] >= r[2] || h[3] <= r[1] || h[1] >= r[3]) return [r];
        const out2 = [];
        if (h[1] > r[1]) out2.push([r[0], r[1], r[2], h[1]]);
        if (h[3] < r[3]) out2.push([r[0], h[3], r[2], r[3]]);
        const ya = Math.max(r[1], h[1]), yb = Math.min(r[3], h[3]);
        if (h[0] > r[0]) out2.push([r[0], ya, h[0], yb]);
        if (h[2] < r[2]) out2.push([h[2], ya, r[2], yb]);
        return out2.filter((q) => q[2] - q[0] > 0.02 && q[3] - q[1] > 0.02);
      });
    }
    for (const [a0, b0, a1, b1] of rects) g.add(FACE[face].put(a1 - a0, b1 - b0, t, mat, (a0 + a1) / 2, (b0 + b1) / 2));
  };
  const glowPlane = (w, h, mat = M.glow) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  // up/down wall washer with its beams on the wall; slides sideways (or is dropped) to stay off doors and windows
  const sconce = (g, face, along, y = 2.0) => {
    const hits = (a) => openings.filter(FACE[face].open).some((o) => a > o.a - 0.15 && a < o.b + 0.15);
    const spot = [0, 0.3, -0.3, 0.6, -0.6].map((d) => along + d).find((a) => !hits(a));
    if (spot == null) return;
    g.add(FACE[face].put(0.07, 0.2, 0.09, M.black, spot, y));
    for (const s of [1, -1]) {
      const p = glowPlane(0.7, 1.1, M.glowFan);
      p.rotation.z = s > 0 ? 0 : Math.PI; // beam spreads away from the fixture
      if (face === 'front') p.position.set(spot, y + s * 0.6, D + 0.004);
      else { p.rotation.y = -Math.PI / 2; p.position.set(-0.004, y + s * 0.6, spot); }
      g.add(p);
    }
  };
  const leafMat = M.solid('#4f7a3a', { roughness: 0.85 });
  // planter at ground level in front of the plinth, with uplights washing the plinth/wall
  const planterLit = (g, face, from, to) => {
    const L = to - from, mid = (from + to) / 2, dep = 0.5, h = 0.4;
    const edge = face === 'front' ? D + F : -S;
    const px = face === 'front' ? mid : edge - dep / 2, pz = face === 'front' ? edge + dep / 2 : mid;
    g.add(face === 'front' ? box(L, h, dep, concrete, px, ground + h / 2, pz) : box(dep, h, L, concrete, px, ground + h / 2, pz));
    const n = Math.max(2, Math.round(L / 0.35));
    for (let i = 0; i < n; i++) {
      const a = from + ((i + 0.5) / n) * L;
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + (i % 3) * 0.03, 1), leafMat);
      s.scale.y = 1.3;
      s.position.set(face === 'front' ? a : px, ground + h + 0.18, face === 'front' ? pz : a);
      s.castShadow = true;
      g.add(s);
      if (i % 2 === 0) {
        // uplight beam through the foliage
        const p = glowPlane(0.4, 0.7, M.glowFan);
        if (face === 'front') p.position.set(a, ground + h + 0.3, pz + dep / 2 + 0.01);
        else { p.rotation.y = -Math.PI / 2; p.position.set(px - dep / 2 - 0.01, ground + h + 0.3, a); }
        g.add(p);
      }
    }
  };
  // granite steps from the garden up to the verandah at the main door (3 risers of 152 mm)
  const steps = (g, width, ledLit = false) => {
    const r = -ground / 3;
    for (let k = 1; k <= 2; k++) {
      const top = -k * r, z0 = D + F + (k - 1) * 0.3;
      g.add(box(width + k * 0.3, top - ground, 0.3, M.granite, mainX, (top + ground) / 2, z0 + 0.15));
      if (ledLit) g.add(box(width + k * 0.3 - 0.1, 0.012, 0.012, M.lamp, mainX, top - 0.03, z0 + 0.305));
    }
  };
  // paving slabs (900 × 600) with grass joints in the front and side yards
  const pavers = (g) => {
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), M.grass);
    const rects = [[plot[0] + 0.25, D + F + 0.02, plot[2] - 0.25, plot[3] - 0.3], [plot[0] + 0.3, 0.3, -S - 0.02, D + F + 0.02]];
    const slabs = [];
    for (const [x0, z0, x1, z1] of rects) {
      if (x1 - x0 < 0.6 || z1 - z0 < 0.4) continue;
      const gm = grass.clone();
      gm.rotation.x = -Math.PI / 2;
      gm.scale.set(x1 - x0, z1 - z0, 1);
      gm.position.set((x0 + x1) / 2, ground + 0.012, (z0 + z1) / 2);
      gm.receiveShadow = true;
      g.add(gm);
      for (let x = x0 + 0.05; x + 0.9 <= x1; x += 0.98) for (let z = z0 + 0.05; z + 0.6 <= z1; z += 0.68) slabs.push([x + 0.45, z + 0.3]);
    }
    const inst = new THREE.InstancedMesh(boxGeo(0.9, 0.03, 0.6), M.paving, slabs.length);
    const mtx = new THREE.Matrix4();
    slabs.forEach(([x, z], i) => inst.setMatrixAt(i, mtx.makeTranslation(x, ground + 0.027, z)));
    inst.receiveShadow = true;
    g.add(inst);
  };
  const louvreShutters = (g, face) => {
    for (const o of windows.filter((q) => (face === 'front' ? !q.vertical && q.c > D / 2 : q.vertical && q.c < W / 2))) {
      const L = o.b - o.a, mid = (o.a + o.b) / 2;
      for (const [w, h, a, y] of [[L + 0.16, 0.08, mid, o.hi + 0.04], [L + 0.16, 0.08, mid, o.lo - 0.04], [0.08, o.hi - o.lo, o.a - 0.04, (o.lo + o.hi) / 2], [0.08, o.hi - o.lo, o.b + 0.04, (o.lo + o.hi) / 2]]) g.add(FACE[face].put(w, h, 0.06, M.teak, a, y));
      for (let y = o.lo + 0.1; y < o.hi - 0.05; y += 0.11) g.add(FACE[face].put(L, 0.025, 0.03, M.teak, mid, y, 0.02));
      for (const t of [1 / 3, 2 / 3]) g.add(FACE[face].put(0.04, o.hi - o.lo, 0.04, M.teak, o.a + L * t, (o.lo + o.hi) / 2, 0.01));
    }
  };
  const squarePillars = (g) => {
    const zf = D + F - 0.15, xs = -S + 0.15, xEnd = stairs[0] - 0.3;
    const put = (x, z) => g.add(box(0.3, ceil, 0.3, white, x, ceil / 2, z));
    const nF = Math.max(1, Math.round((xEnd - xs) / 3.2));
    for (let i = 0; i <= nF; i++) { const x = xs + ((xEnd - xs) * i) / nF; if (i === 0 || Math.abs(x - mainX) > 1.3) put(x, zf); }
    const nS = Math.max(1, Math.round((zf - 0.3) / 3.2));
    for (let i = 0; i < nS; i++) { const z = 0.3 + ((zf - 0.3) * i) / nS; if (Math.abs(z - sideZ) > 1.0) put(xs, z); }
  };
  // tall white box frame over the stair end of the front, with a lit timber soffit (headroom kept over the stair)
  const tallBox = (g, x0, x1, topY, soffitMat, plankDir = 'x') => {
    const t = 0.3, zf = D + F + t / 2;
    g.add(box(t, topY - ground, t, white, x0 - t / 2, (topY + ground) / 2, zf));
    g.add(box(t, topY - ground, t, white, x1 + t / 2, (topY + ground) / 2, zf));
    g.add(box(x1 - x0 + 2 * t, t, F + t, white, (x0 + x1) / 2, topY - t / 2, D + (F + t) / 2));
    const sY = topY - t - 0.35;
    g.add(box(x1 - x0, 0.35, 0.03, soffitMat, (x0 + x1) / 2, sY + 0.175, D + F + 0.02));
    const n = plankDir === 'x' ? 4 : Math.round((x1 - x0) / 0.14);
    for (let i = 1; i < n; i++) {
      if (plankDir === 'x') g.add(box(x1 - x0, 0.006, 0.006, M.black, (x0 + x1) / 2, sY + (0.35 * i) / n, D + F + 0.037));
      else g.add(box(0.006, 0.35, 0.006, M.black, x0 + ((x1 - x0) * i) / n, sY + 0.175, D + F + 0.037));
    }
    for (const x of [x0 + (x1 - x0) * 0.25, x0 + (x1 - x0) * 0.75]) {
      g.add(box(0.12, 0.01, 0.12, M.lamp, x, topY - t - 0.005, D + F - 0.1));
      const p = glowPlane(0.7, 1.4);
      p.position.set(x, sY - 0.5, D + F + 0.045);
      g.add(p);
    }
  };

  // ---------- R1: stone band & wood soffit ----------
  {
    const g = new THREE.Group();
    const fH = 0.42, fy = top - fH / 2 + 0.1;
    g.add(box(W + S + 0.3, fH, 0.25, white, (W - S) / 2, fy, D + F + 0.125));
    g.add(box(0.25, fH, D + F + 0.25, white, -S - 0.125, fy, (D + F) / 2));
    const bx1 = stairs[0] - 0.4;
    g.add(box(bx1 + S, parapet, 0.05, M.greyStone, (bx1 - S) / 2, top + parapet / 2 + 0.1, D + F + 0.2));
    g.add(box(0.05, parapet, D + F, M.greyStone, -S - 0.2, top + parapet / 2 + 0.1, (D + F) / 2));
    g.add(box(bx1 + S + 0.3, 0.1, 0.35, white, (bx1 - S) / 2, ptop + 0.15, D + F + 0.1));
    g.add(box(0.35, 0.1, D + F + 0.3, white, -S - 0.1, ptop + 0.15, (D + F) / 2));
    tallBox(g, stairs[0] - 0.1, W, ptop + 1.6, M.oak, 'x');
    clad(g, 'front', stairs[0] - 0.1, W, 0, ceil, M.greyStone);
    squarePillars(g);
    louvreShutters(g, 'front');
    louvreShutters(g, 'side');
    for (const x of [mainX - 0.85, mainX + 0.85]) sconce(g, 'front', x);
    sconce(g, 'front', stairs[0] + 0.4);
    sconce(g, 'front', W - 0.4);
    for (const z of [sideZ - 0.85, sideZ + 0.85]) sconce(g, 'side', z);
    planterLit(g, 'front', stairs[0] - 0.1, W - 0.1);
    planterLit(g, 'side', 0.6, sideZ - 1.2);
    steps(g, 2.6);
    pavers(g);
    out.ref1 = g;
  }
  // ---------- R2: brick & wood box ----------
  {
    const g = new THREE.Group();
    const t = 0.3;
    // white porch frame around the verandah (top band + corner post)
    g.add(box(W + S + 2 * t, t + 0.1, t, white, (W - S) / 2, top - 0.05, D + F + t / 2));
    g.add(box(t, top + 0.15 - ground, t, white, -S - t / 2, (top + 0.15 + ground) / 2, D + F + t / 2));
    g.add(box(t, t + 0.1, D + F + t, white, -S - t / 2, top - 0.05, (D + F) / 2));
    // exposed brick feature wall right of the main door, and on the side wall near the front
    const brickTo = stairs[0] - 0.2;
    clad(g, 'front', mainX + 0.75, brickTo, 0, ceil, M.brick);
    clad(g, 'side', D * 0.5, D, 0, ceil, M.brick);
    for (const x of [mainX + 1.1, brickTo - 0.35]) sconce(g, 'front', x, 2.3);
    sconce(g, 'side', D * 0.5 + 0.4, 2.3);
    sconce(g, 'side', D - 0.4, 2.3);
    // tall box: vertical wood cladding at the top, grooved white panels on the wall below
    tallBox(g, stairs[0] - 0.1, W, ptop + 1.6, M.oak, 'z');
    clad(g, 'front', stairs[0] - 0.1, W, 0, ceil, white);
    for (let y = 0.3; y < ceil; y += 0.3) g.add(FACE.front.put(W - stairs[0] + 0.1, 0.008, 0.008, M.solid('#d8d6d0'), (stairs[0] - 0.1 + W) / 2, y, 0.026));
    // black horizontal louvre rail on the roof over the side verandah corner
    for (let k = 0; k < 4; k++) {
      const y = ptop + 0.12 + k * 0.14;
      g.add(box(Math.max(1, mainX - 1.2 + S), 0.05, 0.05, steel, (-S + mainX - 1.2) / 2, y, D + F + 0.05));
      g.add(box(0.05, 0.05, D * 0.5, steel, -S - 0.05, y, D + F - D * 0.25));
    }
    steps(g, 2.4, true);
    planterLit(g, 'front', mainX + 1.4, stairs[0] - 0.3);
    planterLit(g, 'front', stairs[0] - 0.1, W - 0.1);
    planterLit(g, 'side', D * 0.5, D - 0.2);
    pavers(g);
    out.ref2 = g;
  }
  // ---------- R3: feature frame & diagonal grooves ----------
  {
    const g = new THREE.Group();
    const grey = M.paintExt.clone();
    grey.color.set('#8d8f8e');
    const sand = M.laterite.clone();
    sand.color.set('#e9d3b4');
    // the feature frame wraps the widest stretch of front wall: from just right of the main door to the stair
    const fx0 = mainX + 0.9, fx1 = stairs[0] - 0.25, fTop = ptop + 1.3, t = 0.25, zf = D + F - 0.25;
    // tall portal frame at the verandah edge, lined with teak and warm LED edges
    for (const x of [fx0 - t / 2, fx1 + t / 2]) g.add(box(t, fTop - ground, 0.9, white, x, (fTop + ground) / 2, zf));
    g.add(box(fx1 - fx0 + 2 * t, t, 0.9, white, (fx0 + fx1) / 2, fTop - t / 2, zf));
    for (const [x, s] of [[fx0 + 0.015, 1], [fx1 - 0.015, -1]]) {
      g.add(box(0.03, fTop - t - ground, 0.86, M.teak, x, (fTop - t + ground) / 2, zf));
      g.add(box(0.015, fTop - t - ground - 0.2, 0.015, M.lamp, x + s * 0.03, (fTop - t + ground) / 2, zf + 0.43));
    }
    g.add(box(fx1 - fx0, 0.03, 0.86, M.teak, (fx0 + fx1) / 2, fTop - t - 0.015, zf));
    g.add(box(fx1 - fx0 - 0.1, 0.015, 0.015, M.lamp, (fx0 + fx1) / 2, fTop - t - 0.04, zf + 0.43));
    // black flat canopy on top
    g.add(box(fx1 - fx0 + 1.0, 0.16, 1.5, steel, (fx0 + fx1) / 2, fTop + 0.08, zf + 0.15));
    // sandstone strip at the left of the frame, grey grooved panel across the rest, a white box round the window
    const sx = Math.min(fx0 + 0.9, fx1);
    clad(g, 'front', fx0, sx, 0, ceil, sand);
    clad(g, 'front', sx, fx1, 0, ceil, grey);
    const groove = M.solid('#5d5f5e');
    for (const [ax, ay, bx, by] of [[sx, 0.2, fx1, ceil - 0.3], [sx, ceil - 0.3, fx1, 0.2]]) {
      const L = Math.hypot(bx - ax, by - ay), m = box(L, 0.012, 0.012, groove, (ax + bx) / 2, (ay + by) / 2, D + 0.032);
      m.rotation.z = Math.atan2(by - ay, bx - ax);
      g.add(m);
    }
    for (const o of windows.filter((q) => !q.vertical && q.c > D / 2 && q.a > fx0 && q.b < fx1)) {
      const L = o.b - o.a, mid = (o.a + o.b) / 2, h = o.hi - o.lo, d = 0.35, tt = 0.14;
      g.add(FACE.front.put(L + 2 * tt, tt, d, white, mid, o.hi + tt / 2));
      g.add(FACE.front.put(L + 2 * tt, tt, d, white, mid, o.lo - tt / 2));
      g.add(FACE.front.put(tt, h, d, white, o.a - tt / 2, (o.lo + o.hi) / 2));
      g.add(FACE.front.put(tt, h, d, white, o.b + tt / 2, (o.lo + o.hi) / 2));
    }
    // side facade: grooved grey panel around the side door, sandstone strip at the front corner
    clad(g, 'side', sideZ - 1.4, sideZ + 1.4, 0, ceil, grey);
    clad(g, 'side', D - 0.9, D, 0, ceil, sand);
    // steel roof railing on both road sides
    for (const y of [ptop + 0.35, ptop + 0.7]) {
      g.add(box(W + S, 0.03, 0.03, steel, (W - S) / 2, y, D + F - 0.06));
      g.add(box(0.03, 0.03, D + F, steel, -S + 0.06, y, (D + F) / 2));
    }
    for (let x = -S + 0.06; x <= W; x += 1.5) g.add(box(0.03, 0.72, 0.03, steel, x, ptop + 0.36, D + F - 0.06));
    for (let z = 0.06; z <= D + F; z += 1.5) g.add(box(0.03, 0.72, 0.03, steel, -S + 0.06, ptop + 0.36, z));
    sconce(g, 'front', (fx0 + sx) / 2, 2.2);
    sconce(g, 'front', fx1 - 0.5, 2.2);
    sconce(g, 'side', sideZ + 1.15, 2.2);
    planterLit(g, 'front', fx0 + 0.1, fx1 - 0.1);
    planterLit(g, 'side', 0.5, sideZ - 1.6);
    steps(g, 2.2);
    pavers(g);
    out.ref3 = g;
  }

  for (const g of Object.values(out)) g.visible = false;
  return out;
}
