// Elevation ideas for the two road-facing sides: the front (G.P Road, +z) and the side
// (21 ft road, −x). These are design proposals added on top of the drawings; they do not move
// any wall, door, window or room.
import * as THREE from 'three';
import { boxGeo } from './materials.js';

export const ELEVATIONS = [
  { id: 'none', name: 'As drawn', blurb: 'Plain plastered elevation (no added features).', paint: '#e8d8bd' },
  { id: 'frame', style: 'Modern', name: 'Floating frame', blurb: 'Greige walls with a deep white frame wrapping both verandahs, charcoal plaster bands above the two entrances and slim charcoal window surrounds.', paint: '#e6e1d8' },
  { id: 'slats', style: 'Modern', name: 'Oak slats', blurb: 'Warm white walls, an oak-clad verandah soffit and slab edge, and vertical oak slat screens at the road corner and beside the stair.', paint: '#f1ede6' },
  { id: 'stone', style: 'Modern', name: 'Stone & glass', blurb: 'Cool white walls, a stone-clad corner pier and plinth, a frameless glass balustrade on the roof edge, and a thin lit canopy over the front steps.', paint: '#ebeae6' },
  { id: 'pergola', style: 'Modern', name: 'Pergola & planters', blurb: 'Soft sage walls, pale grey parapet louvres, a slim black steel roof pergola over the verandah corner, and low concrete planters along the plinth (entrances kept clear).', paint: '#e2e4d9' },
  { id: 'ref1', style: 'Reference', name: 'Stone band & wood soffit', blurb: 'Like your 1st photo: white walls and square verandah pillars, a grey cut-stone parapet band in a white frame, a tall white box frame with a lit wooden soffit, a grey stone wall, teak louvred windows, up/down wall lights, a lit planter, granite steps and paving slabs with grass joints.', paint: '#f2f0eb' },
  { id: 'ref2', style: 'Reference', name: 'Brick & wood box', blurb: 'Like your 2nd photo: white box frames, an exposed-brick feature wall with wall washers, a tall box with vertical wood cladding and grooved white panels, a black louvre rail on the roof, LED-lit steps, lit planters and paving slabs with grass joints.', paint: '#f6f5f1' },
  { id: 'ref3', style: 'Reference', name: 'Feature frame & grooves', blurb: 'Like your 3rd photo and the Pinterest pin: a tall corner frame lined in teak with warm LED edges, sandstone strip cladding, grey panels with diagonal grooves, a projecting white window box, a black flat canopy, a steel roof railing and a long lit planter.', paint: '#efefec' },
  { id: 'ref4', style: 'Reference', name: 'Wood, brick & fluted box', blurb: 'Like your latest photo: white box frames, horizontal teak cladding on the left wall, an exposed-brick wall round the right window, a white fluted box at the stair end, a grey roof volume with a teak slat screen and a black terrace railing, dark granite steps, and a lawn with a wide slab walkway and round topiaries out to the gate.', paint: '#f4f3ef' },
  { id: 'ref5', style: 'Reference', name: 'Taupe band & ledgestone', fence: true, blurb: 'Like your 1st photo of this set: a deep taupe roof band with a charcoal soffit, a white L-frame on the left with a taupe panel and a projecting window box, stacked ledgestone piers, a dark wood slat panel, a glass roof balustrade, and a matching boundary with charcoal ledgestone piers, white coping, slotted taupe gates and a paved drive.', paint: '#f2f0ec' },
  { id: 'ref6', style: 'Reference', name: 'Stone, wood & jaali', blurb: 'Like your 3rd photo of this set: a warm wood-clad verandah wall with wall washers, a grey crazy-stone panel, charcoal projecting window boxes with fins, a flower motif, a tall wooden fin with LED edge, a black corner pillar with a white jaali screen, a grey parapet band with steel railing, steps with handrails, a box hedge and globe garden lights.', paint: '#f6f6f4' },
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
  const plinthClad = (g, mat) => {
    const h = -ground;
    g.add(box(W + S, h, 0.03, mat, (W - S) / 2, ground / 2, D + F + 0.015));
    g.add(box(0.03, h, D + F, mat, -S - 0.015, ground / 2, (D + F) / 2));
  };
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
  const glowPlane = (w, h, mat = M.glow) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  // one tall screen panel: along = 'x' (faces +z) or 'z' (faces −x); [a0, a1] along it, [y0, y1] high, at `fixed`
  // kinds: solid, fluted, vslats / hslats (frame + slats, so light and air still get through)
  const screenPanel = (g, kind, mat, along, a0, a1, y0, y1, fixed) => {
    const L = a1 - a0, H = y1 - y0, am = (a0 + a1) / 2, ym = (y0 + y1) / 2;
    const put = (l, h, d, ax, y, off = 0) => (along === 'x' ? box(l, h, d, mat, ax, y, fixed + off) : box(d, h, l, mat, fixed - off, y, ax));
    if (kind === 'solid') { g.add(put(L, H, 0.12, am, ym)); return; }
    if (kind === 'fluted') {
      g.add(put(L, H, 0.1, am, ym));
      for (let a = a0 + 0.06; a < a1; a += 0.12) g.add(put(0.05, H - 0.1, 0.03, a, ym, 0.065));
      return;
    }
    g.add(put(L, 0.08, 0.1, am, y1 - 0.04));
    g.add(put(L, 0.08, 0.1, am, y0 + 0.04));
    for (const a of [a0 + 0.04, a1 - 0.04]) g.add(put(0.08, H, 0.1, a, ym));
    if (kind === 'vslats') for (let a = a0 + 0.16; a < a1 - 0.1; a += 0.13) g.add(put(0.05, H - 0.16, 0.1, a, ym));
    else for (let y = y0 + 0.2; y < y1 - 0.1; y += 0.16) g.add(put(L - 0.16, 0.12, 0.05, am, y));
  };
  // Screens the open staircase from the roads: across its road face (verandah edge, up past the stair railing)
  // and its open west side up to the roof slab. The stair foot stays open below a 2.2 m header and the top
  // landing stays open onto the roof.
  const stairScreen = (g, kind, mat) => {
    const x0 = stairs[0] - 0.05, x1 = Math.min(stairs[2] + 0.05, W + 0.15), zf = D + F + 0.08, zm = (stairs[1] + stairs[3]) / 2;
    screenPanel(g, kind, mat, 'x', x0, x1, ground, ptop + 0.9, zf); // road face
    screenPanel(g, kind, mat, 'z', zm, zf + 0.05, ground, top, x0); // west side under the upper flight
    screenPanel(g, kind, mat, 'z', stairs[1], zm, 2.2, top, x0); // header over the stair foot
  };
  // 21 ft road side, the counterpart of the stair screen: a tall screened tower closing the rear end of the side
  // verandah (blank wall up to the first window; it hides the utility / wash corner and bookends the side with the
  // stair tower at the far corner), and a lit entrance portal over the side door with steps down to the side gate.
  const sideOpen = openings.filter((o) => o.vertical && o.c < W / 2).sort((p, q) => p.a - q.a);
  const towerEnd = Math.min(2.6, (sideOpen.length ? sideOpen[0].a : 2.6) - 0.3);
  const sideFeature = (g, kind, mat, frame = white) => {
    const xf = -S - 0.08, yt = ptop + 0.9;
    if (towerEnd > 0.9) {
      screenPanel(g, kind, mat, 'z', 0, towerEnd, ground, yt, xf); // road face
      screenPanel(g, kind, mat, 'x', xf - 0.05, 0, ground, yt, -0.08); // rear return
      g.add(box(S + 0.2, 0.12, towerEnd + 0.15, frame, -S / 2 - 0.08, yt + 0.06, towerEnd / 2 - 0.07)); // cap
      g.add(box(0.015, yt - ground - 0.3, 0.015, M.lamp, xf - 0.07, (yt + ground) / 2, towerEnd + 0.01)); // LED edge
    }
    // entrance portal: two posts on the verandah edge, a deep beam back to the wall, timber soffit with a light line
    const pT = ptop + 0.6, t = 0.3, half = 1.15;
    for (const z of [sideZ - half, sideZ + half]) g.add(box(t, pT - ground, t, frame, -S - t / 2, (pT + ground) / 2, z));
    g.add(box(S + t, t, 2 * half + t, frame, -(S + t) / 2, pT - t / 2, sideZ));
    g.add(box(0.03, 0.4, 2 * half - t, M.teak, -S - t + 0.015, pT - t - 0.2, sideZ));
    g.add(box(0.012, 0.012, 2 * half - t - 0.1, M.lamp, -S - t + 0.05, pT - t - 0.41, sideZ));
    screenPanel(g, kind, mat, 'z', sideZ - half + t / 2, sideZ + half - t / 2, top, pT - t - 0.4, -S - 0.08); // fascia
    for (const z of [sideZ - 0.6, sideZ + 0.6]) {
      g.add(box(0.12, 0.01, 0.12, M.lamp, -S / 2, top - slab - 0.005, z));
      const p = glowPlane(0.7, 1.2);
      p.rotation.y = -Math.PI / 2;
      p.position.set(-0.034, 2.55, z);
      g.add(p);
    }
    // two granite steps down from the side verandah towards the side gate
    const r = -ground / 3;
    for (let k = 1; k <= 2; k++) {
      const yTop = -k * r, x1 = -S - (k - 1) * 0.3;
      g.add(box(0.3, yTop - ground, 1.4 + k * 0.3, M.granite, x1 - 0.15, (yTop + ground) / 2, sideZ));
    }
  };
  // planters / screens must leave the entrance axes, the stair and the side tower clear
  const clearOf = (x, z) => Math.abs(x - mainX) > 1.1 && Math.abs(z - sideZ) > 1.1 && !(x > stairs[0] - 0.3 && z > D) && !(x < 0 && z < towerEnd + 0.4);

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
    stairScreen(g, 'vslats', white);
    sideFeature(g, 'vslats', white, charcoal);
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
    stairScreen(g, 'vslats', M.oak);
    sideFeature(g, 'vslats', M.oak, white);
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
    stairScreen(g, 'solid', M.stone);
    sideFeature(g, 'solid', M.stone, steel);
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
    stairScreen(g, 'hslats', pale);
    sideFeature(g, 'hslats', pale, charcoal);
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
    return rects;
  };
  // up/down wall washer with its beams on the wall; slides sideways (or is dropped) to stay off doors and windows
  const sconce = (g, face, along, y = 2.0) => {
    const hits = (a) => openings.filter(FACE[face].open).some((o) => a > o.a - 0.15 && a < o.b + 0.15);
    const spot = [0, 0.3, -0.3, 0.6, -0.6].map((d) => along + d).find((a) => !hits(a));
    if (spot == null) return;
    g.add(FACE[face].put(0.07, 0.2, 0.09, M.black, spot, y, 0.03)); // mounted proud of any 25 mm cladding
    for (const s of [1, -1]) {
      const p = glowPlane(0.7, 1.1, M.glowFan);
      p.rotation.z = s > 0 ? 0 : Math.PI; // beam spreads away from the fixture
      if (face === 'front') p.position.set(spot, y + s * 0.6, D + 0.032);
      else { p.rotation.y = -Math.PI / 2; p.position.set(-0.032, y + s * 0.6, spot); }
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
    planterLit(g, 'side', towerEnd + 0.3, sideZ - 1.4);
    steps(g, 2.6);
    pavers(g);
    stairScreen(g, 'solid', M.greyStone);
    sideFeature(g, 'solid', M.greyStone, white);
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
    planterLit(g, 'side', D * 0.5, sideZ - 1.4);
    planterLit(g, 'side', sideZ + 1.4, D - 0.2);
    pavers(g);
    stairScreen(g, 'vslats', M.oak);
    sideFeature(g, 'vslats', M.oak, white);
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
    planterLit(g, 'side', towerEnd + 0.3, sideZ - 1.6);
    steps(g, 2.2);
    pavers(g);
    stairScreen(g, 'solid', grey);
    sideFeature(g, 'solid', grey, M.black);
    out.ref3 = g;
  }
  // ---------- R4: wood, brick & fluted box ----------
  {
    const g = new THREE.Group();
    const t = 0.3;
    const grey = M.paintExt.clone();
    grey.color.set('#8c9092');
    const line = M.solid('#3b2a1e');
    // white porch frame (top band + corner post + side band)
    g.add(box(W + S + 2 * t, t + 0.1, t, white, (W - S) / 2, top - 0.05, D + F + t / 2));
    g.add(box(t, top + 0.15 - ground, t, white, -S - t / 2, (top + 0.15 + ground) / 2, D + F + t / 2));
    g.add(box(t, t + 0.1, D + F + t, white, -S - t / 2, top - 0.05, (D + F) / 2));
    // horizontal teak plank cladding left of the main door, and on the side wall near the road corner
    const plank = (face, from, to) => {
      for (const [a0, y0, a1, y1] of clad(g, face, from, to, 0, ceil, M.teak)) {
        for (let y = y0 + 0.15; y < y1 - 0.02; y += 0.15) g.add(FACE[face].put(a1 - a0, 0.008, 0.006, line, (a0 + a1) / 2, y, 0.026));
      }
    };
    plank('front', 0, Math.max(0.6, mainX - 0.75));
    plank('side', D - 2.4, D);
    // exposed brick round the main window to the right of the door
    clad(g, 'front', mainX + 0.9, stairs[0] - 0.25, 0, ceil, M.brick);
    // tall white fluted box at the stair end (vertical ribs), standing at the verandah edge
    const bx0 = stairs[0] - 0.1, bx1 = W + 0.15, bTop = ptop + 0.9;
    g.add(box(bx1 - bx0, bTop - top, 0.12, white, (bx0 + bx1) / 2, (top + bTop) / 2, D + F + 0.06));
    g.add(box(0.12, bTop - ground, 0.3, white, bx1 + 0.06, (bTop + ground) / 2, D + F));
    for (let x = bx0 + 0.06; x < bx1; x += 0.12) g.add(box(0.05, bTop - top - 0.1, 0.03, white, x, (top + bTop) / 2, D + F + 0.135));
    // grey raised roof volume with a teak slat screen beside it and a black terrace railing
    const vx0 = 0.3, vx1 = Math.min(stairs[0] - 1.5, vx0 + 4.2), vz0 = D - 3.2, vz1 = D - 0.25, vH = 2.3;
    g.add(box(vx1 - vx0, vH, vz1 - vz0, grey, (vx0 + vx1) / 2, top + vH / 2, (vz0 + vz1) / 2));
    g.add(box(vx1 - vx0 + 0.4, 0.15, vz1 - vz0 + 0.5, white, (vx0 + vx1) / 2, top + vH + 0.075, (vz0 + vz1) / 2 + 0.1));
    const sx0 = vx1 + 0.1, sx1 = Math.min(stairs[0] - 0.3, sx0 + 1.8);
    for (let x = sx0; x <= sx1; x += 0.16) g.add(box(0.06, vH, 0.1, M.teak, x, top + vH / 2, vz1 - 0.05));
    g.add(box(sx1 - sx0 + 0.1, 0.06, 0.12, M.teak, (sx0 + sx1) / 2, top + vH - 0.03, vz1 - 0.05));
    for (const y of [ptop + 0.35, ptop + 0.75]) g.add(box(bx0 - (-S), 0.035, 0.035, steel, (bx0 - S) / 2, y, D + F - 0.06));
    for (let x = -S + 0.06; x < bx0; x += 0.12) g.add(box(0.02, 0.78, 0.02, steel, x, ptop + 0.39, D + F - 0.06));
    sconce(g, 'front', Math.max(0.4, mainX - 1.1), 2.2);
    sconce(g, 'front', stairs[0] - 0.6, 2.2);
    // dark granite steps and low planters either side
    steps(g, 2.8);
    planterLit(g, 'front', -S + 0.2, mainX - 1.75);
    planterLit(g, 'front', mainX + 1.75, stairs[0] - 0.3);
    // lawn with a wide slab walkway from the steps to the front gate, round topiaries along it
    const zA = D + F + 0.62, zB = plot[3] - 0.3, pw = 2.6;
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(plot[2] - plot[0] - 0.5, zB - (D + F)), M.grass);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set((plot[0] + plot[2]) / 2, ground + 0.012, (D + F + zB) / 2);
    lawn.receiveShadow = true;
    g.add(lawn);
    for (let z = zA; z + 0.45 <= zB; z += 0.57) g.add(box(pw, 0.04, 0.45, M.paving, mainX, ground + 0.032, z + 0.225));
    const topiary = M.solid('#3f6a2f', { roughness: 0.85 });
    for (let z = zA + 0.3; z < zB - 0.2; z += 0.9) {
      for (const s of [-1, 1]) {
        const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 2), topiary);
        b.position.set(mainX + s * (pw / 2 + 0.45), ground + 0.26, z);
        b.castShadow = true;
        g.add(b);
      }
    }
    stairScreen(g, 'fluted', white);
    sideFeature(g, 'fluted', white, charcoal);
    out.ref4 = g;
  }
  // ---------- R5: taupe band & ledgestone (with its own boundary on the two road sides) ----------
  {
    const g = new THREE.Group();
    const taupe = M.paintExt.clone();
    taupe.color.set('#b3a99c');
    const dark = M.solid('#4a4541', { roughness: 0.8 });
    // deep taupe roof band over the verandahs with a charcoal soffit
    const bx0 = Math.max(-S, mainX - 0.3), bandH = 1.0, by = top + 0.05;
    g.add(box(W + 0.3 - bx0, bandH, 0.4, taupe, (bx0 + W + 0.3) / 2, by, D + F + 0.2));
    g.add(box(W + 0.3 - bx0, 0.04, F + 0.4, dark, (bx0 + W + 0.3) / 2, by - bandH / 2 - 0.02, D + (F + 0.4) / 2));
    g.add(box(W + 0.3 - bx0, 0.02, 0.02, dark, (bx0 + W + 0.3) / 2, by + 0.12, D + F + 0.41));
    g.add(box(0.4, bandH, D + F + 0.4, taupe, -S - 0.2, by, (D + F + 0.4) / 2));
    // white L-frame on the left: tall post at the road corner, deep top beam back to the main door
    g.add(box(0.5, ptop + 0.9 - ground, 0.5, white, -S - 0.25, (ptop + 0.9 + ground) / 2, D + F + 0.2));
    g.add(box(bx0 + S + 0.5, 0.45, 0.55, white, (bx0 - S - 0.5) / 2, ptop + 0.675, D + F + 0.18));
    clad(g, 'front', 0, Math.max(0.5, mainX - 0.75), 0, ceil, taupe);
    for (const x of [0.25, 0.42]) g.add(FACE.front.put(0.06, 0.7, 0.03, dark, x, ceil - 0.55, 0.03));
    for (const o of windows.filter((q) => !q.vertical && q.c > D / 2 && q.b < mainX)) {
      const L = o.b - o.a, mid = (o.a + o.b) / 2, h = o.hi - o.lo, d = 0.3, tt = 0.12;
      g.add(FACE.front.put(L + 2 * tt, tt, d, white, mid, o.hi + tt / 2));
      g.add(FACE.front.put(L + 2 * tt, tt, d, white, mid, o.lo - tt / 2));
      g.add(FACE.front.put(tt, h, d, white, o.a - tt / 2, (o.lo + o.hi) / 2));
      g.add(FACE.front.put(tt, h, d, white, o.b + tt / 2, (o.lo + o.hi) / 2));
    }
    // stacked ledgestone piers at the verandah edge
    for (const x of [mainX + 1.25, stairs[0] - 0.35, W - 0.25]) g.add(box(0.5, ceil, 0.5, M.ledge, x, ceil / 2, D + F - 0.25));
    g.add(box(0.5, ceil, 0.5, M.ledge, -S + 0.25, ceil / 2, Math.max(0.5, sideZ - 1.4)));
    // dark wood slat panel on the wall right of the entrance
    const wx0 = mainX + 1.7, wx1 = Math.min(wx0 + 1.1, stairs[0] - 0.6);
    for (const [a0, y0, a1, y1] of clad(g, 'front', wx0, wx1, 0, ceil, M.walnut)) {
      for (let x = a0 + 0.08; x < a1; x += 0.08) g.add(FACE.front.put(0.008, y1 - y0, 0.006, M.black, x, (y0 + y1) / 2, 0.026));
    }
    // frameless glass balustrade with a white coping on the roof edge
    g.add(box(W + S, 0.12, 0.3, white, (W - S) / 2, ptop + 0.06, D + F - 0.05));
    g.add(box(0.3, 0.12, D + F, white, -S + 0.05, ptop + 0.06, (D + F) / 2));
    g.add(box(W + S, 0.9, 0.015, M.glass, (W - S) / 2, ptop + 0.57, D + F - 0.05));
    g.add(box(0.015, 0.9, D + F, M.glass, -S + 0.05, ptop + 0.57, (D + F) / 2));
    sconce(g, 'front', wx1 + 0.35, 2.2);
    steps(g, 2.4);
    // boundary on both road sides: white low wall with a ledgestone strip, charcoal piers, slotted taupe gates
    const fence = (side) => {
      const front = side === 's';
      const fixed = front ? plot[3] - 0.12 : plot[0] + 0.12;
      const [lo, hi] = front ? [plot[0], plot[2]] : [plot[1], plot[3]];
      const at = (along, w, h, d, mat, y, off = 0) => (front ? box(w, h, d, mat, along, y, fixed + off) : box(d, h, w, mat, fixed - off, y, along));
      const gs = (dims.gates || []).filter((q) => q.side === side).map((q) => [q.from, q.to]).sort((u, v) => u[0] - v[0]);
      const wallSeg = (a, b) => {
        if (b - a < 0.1) return;
        const m = (a + b) / 2, L = b - a;
        g.add(at(m, L, 0.9, 0.24, white, ground + 0.45));
        g.add(at(m, L - 0.3, 0.32, 0.02, M.ledge, ground + 0.5, 0.13));
        g.add(at(m, L + 0.04, 0.08, 0.3, white, ground + 0.94));
        const n = Math.max(1, Math.round(L / 3.5));
        for (let k = 1; k < n; k++) pier(a + (L * k) / n);
      };
      const pier = (along) => {
        g.add(at(along, 0.45, 1.7, 0.45, dark, ground + 0.85));
        g.add(at(along, 0.26, 1.2, 0.02, M.ledge, ground + 0.85, 0.235));
        g.add(at(along, 0.55, 0.12, 0.55, white, ground + 1.76));
      };
      let cur = lo;
      for (const [ga, gb] of gs) {
        wallSeg(cur, ga);
        pier(ga); pier(gb);
        const gw = (gb - ga - 0.5) / 2;
        for (const s0 of [ga + 0.25, ga + 0.25 + gw]) {
          g.add(at(s0 + gw / 2, gw - 0.02, 1.55, 0.06, taupe, ground + 0.08 + 0.775, 0.02));
          for (let y = ground + 0.35; y < ground + 1.5; y += 0.14) {
            for (let k = 0; k < 3; k++) g.add(at(s0 + 0.12 + k * (gw - 0.24) / 2 + 0, 0.22, 0.035, 0.01, dark, y, 0.055));
          }
        }
        cur = gb;
      }
      wallSeg(cur, hi);
      pier(lo + 0.25); pier(hi - 0.25);
    };
    fence('s');
    fence('w');
    // paved drive from the front gate to the steps
    const fg = (dims.gates || []).find((q) => q.side === 's');
    if (fg) {
      const drive = new THREE.Mesh(new THREE.PlaneGeometry(fg.to - fg.from, plot[3] - (D + F + 0.6)), M.paving);
      drive.rotation.x = -Math.PI / 2;
      drive.position.set((fg.from + fg.to) / 2, ground + 0.015, (plot[3] + D + F + 0.6) / 2);
      drive.receiveShadow = true;
      g.add(drive);
    }
    stairScreen(g, 'hslats', taupe);
    sideFeature(g, 'hslats', taupe, dark);
    out.ref5 = g;
  }
  // ---------- R6: stone, wood & jaali ----------
  {
    const g = new THREE.Group();
    const greyBand = M.paintExt.clone();
    greyBand.color.set('#8e9195');
    const charcoal = M.solid('#4d5054', { roughness: 0.7 });
    // warm wood verandah wall round the door, grey crazy-stone panel beside it
    const woodTo = Math.min(mainX + 1.0, stairs[0] - 1.5);
    for (const [a0, y0, a1, y1] of clad(g, 'front', 0, woodTo, 0, ceil, M.oak)) {
      for (let y = y0 + 0.16; y < y1 - 0.02; y += 0.16) g.add(FACE.front.put(a1 - a0, 0.006, 0.006, M.black, (a0 + a1) / 2, y, 0.026));
    }
    const stoneTo = Math.min(woodTo + 1.4, stairs[0] - 0.8);
    clad(g, 'front', woodTo, stoneTo, 0, ceil, M.greyStone);
    clad(g, 'side', D - 1.6, D, 0, ceil, M.greyStone);
    sconce(g, 'front', Math.max(0.4, mainX - 1.2), 2.2);
    sconce(g, 'front', woodTo - 0.35, 2.2);
    sconce(g, 'front', (woodTo + stoneTo) / 2, 2.2);
    // charcoal projecting window boxes with three vertical fins
    for (const o of windows.filter((q) => !q.vertical && q.c > D / 2 && q.a > stoneTo - 0.05)) {
      const L = o.b - o.a, mid = (o.a + o.b) / 2, h = o.hi - o.lo, d = 0.3, tt = 0.12;
      g.add(FACE.front.put(L + 2 * tt, tt, d, charcoal, mid, o.hi + tt / 2));
      g.add(FACE.front.put(L + 2 * tt, tt, d, charcoal, mid, o.lo - tt / 2));
      g.add(FACE.front.put(tt, h, d, charcoal, o.a - tt / 2, (o.lo + o.hi) / 2));
      g.add(FACE.front.put(tt, h, d, charcoal, o.b + tt / 2, (o.lo + o.hi) / 2));
      for (let k = 0; k < 3; k++) g.add(FACE.front.put(0.05, h + 2 * tt, 0.2, charcoal, o.b + tt + 0.1 + k * 0.1, (o.lo + o.hi) / 2));
    }
    // five-petal flower motif above the window wall
    const fcx = (stoneTo + Math.min(stairs[0] - 0.6, W)) / 2, fcy = ceil - 0.55;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), charcoal);
      petal.scale.set(0.07, 0.17, 0.015);
      petal.position.set(fcx + Math.sin(a) * 0.17, fcy + Math.cos(a) * 0.17, D + 0.03);
      petal.rotation.z = -a;
      g.add(petal);
    }
    // tall wooden fin with an LED edge beside the stair
    const fx = stairs[0] - 0.4;
    g.add(box(0.3, ptop + 0.7 - ground, 0.3, M.oak, fx, (ptop + 0.7 + ground) / 2, D + F - 0.15));
    g.add(box(0.015, ptop + 0.6 - ground, 0.015, M.lamp, fx - 0.16, (ptop + 0.6 + ground) / 2, D + F));
    // black corner pillar with a white jaali screen on both road faces
    g.add(box(0.5, ceil, 0.5, M.black, -S + 0.25, ceil / 2, D + F - 0.25));
    const jf = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 1.8), M.jaali);
    jf.position.set(-S + 0.25, 1.3, D + F + 0.005);
    const js = jf.clone();
    js.rotation.y = -Math.PI / 2;
    js.position.set(-S - 0.005, 1.3, D + F - 0.25);
    g.add(jf, js);
    // grey parapet band with two white lines, steel railing above
    g.add(box(W + S, parapet, 0.03, greyBand, (W - S) / 2, top + parapet / 2, D + F + 0.015));
    g.add(box(0.03, parapet, D + F, greyBand, -S - 0.015, top + parapet / 2, (D + F) / 2));
    for (const y of [top + 0.3, top + 0.55]) {
      g.add(box(W + S, 0.03, 0.01, white, (W - S) / 2, y, D + F + 0.035));
      g.add(box(0.01, 0.03, D + F, white, -S - 0.035, y, (D + F) / 2));
    }
    for (const y of [ptop + 0.3, ptop + 0.6]) {
      g.add(box(W + S, 0.04, 0.04, charcoal, (W - S) / 2, y, D + F - 0.06));
      g.add(box(0.04, 0.04, D + F, charcoal, -S + 0.06, y, (D + F) / 2));
    }
    for (let x = -S + 0.06; x <= W; x += 1.2) g.add(box(0.06, 0.6, 0.06, charcoal, x, ptop + 0.3, D + F - 0.06));
    for (let z = 0.06; z <= D + F; z += 1.2) g.add(box(0.06, 0.6, 0.06, charcoal, -S + 0.06, ptop + 0.3, z));
    // steps with steel handrails
    steps(g, 2.0);
    for (const s of [-1, 1]) {
      const x = mainX + s * 1.15;
      for (const z of [D + F - 0.05, D + F + 0.65]) g.add(box(0.04, 0.9, 0.04, steel, x, (z > D + F ? ground : 0) + 0.45, z));
      const rail = box(0.04, 0.04, Math.hypot(0.7, -ground), steel, x, (0.9 + ground + 0.9) / 2, D + F + 0.3);
      rail.rotation.x = Math.atan2(-ground, 0.7);
      g.add(rail);
    }
    // box hedge inside the road boundaries (gates kept clear) and globe garden lights
    const hedgeMat = M.solid('#3d6a2e', { roughness: 0.95 });
    const gs = (side) => (dims.gates || []).filter((q) => q.side === side).map((q) => [q.from - 0.2, q.to + 0.2]);
    const hedge = (side) => {
      const front = side === 's';
      const [lo, hi] = front ? [plot[0] + 0.35, plot[2] - 0.35] : [plot[1] + 0.35, plot[3] - 0.9];
      let segs = [[lo, hi]];
      for (const [a, b] of gs(side)) segs = segs.flatMap(([p, q]) => (b <= p || a >= q ? [[p, q]] : [[p, a], [b, q]].filter(([u, v]) => v - u > 0.4)));
      for (const [a, b] of segs) g.add(front ? box(b - a, 0.85, 0.5, hedgeMat, (a + b) / 2, ground + 0.425, plot[3] - 0.55) : box(0.5, 0.85, b - a, hedgeMat, plot[0] + 0.55, ground + 0.425, (a + b) / 2));
    };
    hedge('s');
    hedge('w');
    const globe = M.lamp;
    for (const [x, z] of [[mainX - 1.6, D + F + 0.5], [mainX + 1.6, D + F + 0.5], [-S - 0.6, D + F + 0.6], [stairs[0] - 0.4, D + F + 0.6]]) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), globe);
      ball.position.set(x, ground + 0.2, z);
      g.add(ball);
      const halo = glowPlane(1.2, 1.2);
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(x, ground + 0.03, z);
      g.add(halo);
    }
    stairScreen(g, 'vslats', M.oak);
    sideFeature(g, 'vslats', M.oak, charcoal);
    out.ref6 = g;
  }

  for (const g of Object.values(out)) g.visible = false;
  return out;
}
