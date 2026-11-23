// Furniture and fixtures at real-world sizes (metres).
// Every builder works in a local frame: x = along the wall it backs onto, +z = into the room,
// y = up from finished floor. The caller rotates/positions the group.
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { boxGeo } from './materials.js';

export const SIZES = {
  king: { w: 1.83, l: 1.98 }, // mattress 72″ × 78″
  queen: { w: 1.52, l: 1.98 }, // mattress 60″ × 78″
  nightstand: { w: 0.45, d: 0.4, h: 0.5 },
  wardrobeDepth: 0.6,
  wardrobeHeight: 2.4,
  crockDepth: 0.38,
  sofaDepth: 0.88,
  seatH: 0.42,
  counterDepth: 0.6,
  counterH: 0.85,
  upperFrom: 1.45,
  upperTo: 2.13,
  upperDepth: 0.35,
  fridge: { w: 0.7, d: 0.72, h: 1.8 },
  wc: { w: 0.38, d: 0.7 },
  vanity: { w: 0.6, d: 0.45, h: 0.8 },
  dining6: { w: 0.9, l: 1.5 },
  round4: 1.0,
  chair: { w: 0.45, d: 0.5, seat: 0.46, back: 0.9 },
  fanSweep: 1.2,
};

// style 'luxe' = the "Warm luxe" interior from the owner's samples: boucle sofas, channel-stitched grey beds, carved
// wardrobe shutters, a backlit-onyx TV wall, a marble dining top with grey chairs and greige gloss kitchen shutters
export function kit(M, style = 'standard') {
  const luxe = style === 'luxe';
  const box = (w, h, d, mat, x, y, z, shadow = true) => {
    const m = new THREE.Mesh(boxGeo(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    return m;
  };
  const cyl = (rt, rb, h, mat, x, y, z, seg = 24) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };
  // Rounded (bevelled) box whose OUTER size is exactly w × h × d.
  const rounded = (w, h, d, r, mat, x, y, z) => {
    const bt = Math.min(r, d / 3), bs = Math.min(r, w / 4, h / 4) * 0.6;
    const sw = w - 2 * bs, sh = h - 2 * bs, cr = Math.min(r, sw / 2, sh / 2) * 0.5;
    const s = new THREE.Shape();
    const hw = sw / 2 - cr, hh = sh / 2 - cr;
    s.moveTo(-hw, -sh / 2); s.lineTo(hw, -sh / 2); s.quadraticCurveTo(sw / 2, -sh / 2, sw / 2, -hh);
    s.lineTo(sw / 2, hh); s.quadraticCurveTo(sw / 2, sh / 2, hw, sh / 2); s.lineTo(-hw, sh / 2);
    s.quadraticCurveTo(-sw / 2, sh / 2, -sw / 2, hh); s.lineTo(-sw / 2, -hh); s.quadraticCurveTo(-sw / 2, -sh / 2, -hw, -sh / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * bt, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelSegments: 3, curveSegments: 6 });
    g.translate(0, 0, -(d - 2 * bt) / 2);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  // ---------------- bedroom ----------------
  function bed(size) {
    const { w, l } = SIZES[size];
    const g = new THREE.Group();
    const fw = w + 0.1, fl = l + 0.1;
    const head = 0.08;
    g.add(box(fw - 0.1, 0.08, fl - 0.15, M.black, 0, 0.04, head + fl / 2)); // recessed plinth
    if (luxe) g.add(rounded(fw, 0.3, fl, 0.05, M.fabricGrey, 0, 0.23, head + fl / 2)); // upholstered frame
    else g.add(box(fw, 0.27, fl, M.walnut, 0, 0.215, head + fl / 2));
    g.add(rounded(w, 0.22, l, 0.04, M.sheet, 0, 0.46, head + 0.05 + l / 2));
    g.add(rounded(w + 0.04, 0.05, l * 0.68, 0.02, M.duvet, 0, 0.585, head + 0.05 + l - l * 0.34));
    g.add(rounded(w + 0.05, 0.055, 0.45, 0.02, luxe ? M.chairGrey : M.linenDark, 0, 0.6, head + 0.05 + l - 0.35));
    const np = size === 'king' ? 3 : 2;
    for (let i = 0; i < np; i++) {
      const px = (i - (np - 1) / 2) * (w / np);
      g.add(rounded(w / np - 0.06, 0.13, 0.42, 0.05, i === 1 && np === 3 ? (luxe ? M.sage : M.velvet) : M.sheet, px, 0.64, head + 0.3));
    }
    if (luxe) {
      // channel-stitched headboard: vertical padded flutes
      const hw = w + 0.3, n = Math.round(hw / 0.16);
      for (let i = 0; i < n; i++) g.add(rounded(hw / n - 0.008, 1.15, head, 0.03, M.fabricGrey, -hw / 2 + (i + 0.5) * (hw / n), 0.68, head / 2));
    } else {
      g.add(box(w + 0.3, 1.05, head, M.linen, 0, 0.62, head / 2)); // upholstered headboard
      g.add(box(w + 0.34, 0.04, head + 0.02, M.walnut, 0, 1.16, head / 2));
    }
    const ns = SIZES.nightstand;
    for (const s of [-1, 1]) {
      const x = s * (fw / 2 + 0.06 + ns.w / 2);
      g.add(box(ns.w, ns.h - 0.05, ns.d, luxe ? M.lacquer : M.walnut, x, 0.05 + (ns.h - 0.05) / 2, ns.d / 2));
      g.add(box(ns.w - 0.03, 0.005, 0.005, M.black, x, 0.3, ns.d + 0.0025, false));
      if (luxe) { // bedside pendants hang above (interior.js); a small vase with dried stems on the table
        g.add(cyl(0.05, 0.04, 0.2, M.lacquer, x, ns.h + 0.1, ns.d / 2));
        for (let k = 0; k < 5; k++) g.add(box(0.006, 0.3, 0.006, M.walnut, x + (k - 2) * 0.02, ns.h + 0.33, ns.d / 2));
        continue;
      }
      g.add(cyl(0.06, 0.08, 0.28, M.white, x, ns.h + 0.14, ns.d / 2));
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.22, 28, 1, true), M.shade);
      shade.position.set(x, ns.h + 0.38, ns.d / 2);
      g.add(shade);
    }
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(w + (luxe ? 1.4 : 1.1), luxe ? 2.2 : 1.7), luxe ? M.rugWave : M.rug);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.006, head + fl - (luxe ? 0.75 : 0.55));
    rug.receiveShadow = true;
    g.add(rug);
    const total = fw / 2 + 0.06 + ns.w;
    return { g, foot: [-total, 0, total, head + fl], size: [fw, head + fl] };
  }

  function wardrobe(len, depth = SIZES.wardrobeDepth, height = SIZES.wardrobeHeight) {
    const g = new THREE.Group();
    g.add(box(len, 0.1, depth - 0.05, M.black, 0, 0.05, (depth - 0.05) / 2));
    if (luxe) {
      // white lacquer shutters, the middle pair in carved wave relief, and an open glass-shelf bay with LED at one end
      const bay = len >= 1.5 ? 0.45 : 0;
      const L = len - bay, x0 = -len / 2 + bay;
      g.add(box(L, height - 0.1, depth, M.lacquer, x0 + L / 2, 0.1 + (height - 0.1) / 2, depth / 2));
      const n = Math.max(2, Math.round(L / 0.5)), sw = L / n, mid = Math.floor(n / 2);
      for (let i = 0; i < n; i++) {
        const cx = x0 + (i + 0.5) * sw;
        if (i === mid - 1 || i === mid) g.add(box(sw - 0.02, 1.75, 0.012, M.carved, cx, 0.2 + 0.875, depth + 0.006, false));
        if (i) g.add(box(0.004, height - 0.12, 0.004, M.black, x0 + i * sw, 0.1 + (height - 0.1) / 2, depth + 0.002, false));
        g.add(box(0.014, 0.6, 0.02, M.brass, cx + (i % 2 ? -1 : 1) * (sw / 2 - 0.05), 1.1, depth + 0.012));
      }
      g.add(box(L, 0.004, 0.004, M.black, x0 + L / 2, 2.0, depth + 0.002, false)); // loft line
      if (bay) {
        const bx = -len / 2 + bay / 2;
        g.add(box(bay, height - 0.1, 0.02, M.walnut, bx, 0.1 + (height - 0.1) / 2, 0.01));
        for (const s of [-1, 1]) g.add(box(0.02, height - 0.1, depth, M.lacquer, bx + s * (bay / 2 - 0.01), 0.1 + (height - 0.1) / 2, depth / 2));
        for (let y = 0.5; y < height - 0.2; y += 0.42) g.add(box(bay - 0.04, 0.01, depth - 0.05, M.glass, bx, y, depth / 2, false));
        g.add(box(0.01, height - 0.3, 0.01, M.lamp, bx - bay / 2 + 0.03, height / 2, depth - 0.03, false));
        for (let y = 0.5; y < height - 0.3; y += 0.42) g.add(cyl(0.04, 0.05, 0.16, M.lacquer, bx, y + 0.09, depth / 2)); // vases
      }
      return { g, foot: [-len / 2, 0, len / 2, depth] };
    }
    g.add(box(len, height - 0.1, depth, M.laminateBeige, 0, 0.1 + (height - 0.1) / 2, depth / 2));
    const n = Math.max(2, Math.round(len / 0.5));
    const sw = len / n;
    for (let i = 1; i < n; i++) g.add(box(0.004, height - 0.12, 0.004, M.black, -len / 2 + i * sw, 0.1 + (height - 0.1) / 2, depth + 0.002, false));
    g.add(box(len, 0.004, 0.004, M.black, 0, 2.0, depth + 0.002, false)); // loft line
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + (i + 0.5) * sw + (i % 2 ? -1 : 1) * (sw / 2 - 0.05);
      g.add(box(0.018, 0.9, 0.02, M.alu, x, 1.05, depth + 0.01));
    }
    return { g, foot: [-len / 2, 0, len / 2, depth] };
  }

  function crockery(len, height = 2.1) {
    const d = SIZES.crockDepth;
    const g = new THREE.Group();
    g.add(box(len, 0.85, d, M.walnut, 0, 0.425, d / 2));
    g.add(box(len, 0.02, d + 0.01, M.granite, 0, 0.86, d / 2));
    g.add(box(len, height - 1.25, 0.02, M.walnut, 0, 1.25 + (height - 1.25) / 2, 0.01));
    for (let y = 1.25; y <= height; y += 0.42) g.add(box(len, 0.02, d - 0.05, M.walnut, 0, y, (d - 0.05) / 2));
    g.add(box(0.02, height - 1.25, d - 0.05, M.walnut, -len / 2 + 0.01, 1.25 + (height - 1.25) / 2, (d - 0.05) / 2));
    g.add(box(0.02, height - 1.25, d - 0.05, M.walnut, len / 2 - 0.01, 1.25 + (height - 1.25) / 2, (d - 0.05) / 2));
    for (let i = 0; i < Math.floor(len / 0.3); i++) g.add(cyl(0.11, 0.11, 0.015, M.white, -len / 2 + 0.2 + i * 0.3, 1.36, 0.15));
    return { g, foot: [-len / 2, 0, len / 2, d] };
  }

  // ---------------- living ----------------
  function sofa(len) {
    const d = SIZES.sofaDepth;
    const g = new THREE.Group();
    const arm = 0.16;
    const [base, body, cush] = luxe ? [M.boucle, M.boucle, [M.sage, M.chairGrey]] : [M.linenDark, M.linen, [M.velvet, M.velvet]];
    for (const x of [-len / 2 + 0.06, len / 2 - 0.06]) for (const z of [0.08, d - 0.08]) g.add(cyl(0.02, 0.015, 0.1, luxe ? M.black : M.walnut, x, 0.05, z, 10));
    g.add(box(len, 0.2, d, base, 0, 0.2, d / 2));
    g.add(rounded(len, 0.55, 0.2, 0.05, body, 0, 0.55, 0.1)); // back frame
    g.add(rounded(arm, 0.36, d, 0.04, body, -len / 2 + arm / 2, 0.48, d / 2));
    g.add(rounded(arm, 0.36, d, 0.04, body, len / 2 - arm / 2, 0.48, d / 2));
    const seats = Math.max(1, Math.round((len - 2 * arm) / 0.65));
    const sw = (len - 2 * arm) / seats;
    for (let i = 0; i < seats; i++) {
      const x = -len / 2 + arm + sw * (i + 0.5);
      g.add(rounded(sw - 0.01, 0.12, d - 0.24, 0.05, body, x, SIZES.seatH - 0.06, 0.22 + (d - 0.24) / 2));
      g.add(rounded(sw - 0.03, 0.42, 0.16, 0.06, body, x, 0.66, 0.26));
    }
    if (len > 1.2) for (const s of [-1, 1]) g.add(rounded(0.4, 0.4, 0.12, 0.06, cush[s > 0 ? 0 : 1], s * (len / 2 - arm - 0.28), 0.66, 0.38));
    return { g, foot: [-len / 2, 0, len / 2, d] };
  }

  function coffeeTable(w, d) {
    const g = new THREE.Group();
    if (luxe) {
      // organic "pebble" table: a thick oval travertine-look top on three chunky round legs
      const top = cyl(1, 1, 0.07, M.slabWhite, 0, 0.385, 0, 48);
      top.scale.set(w / 2, 1, d / 2);
      g.add(top);
      for (const [u, v] of [[-0.55, -0.3], [0.55, -0.3], [0, 0.55]]) g.add(cyl(0.07, 0.09, 0.35, M.lacquer, u * (w / 2), 0.175, v * (d / 2), 20));
      g.add(box(0.24, 0.05, 0.18, M.chairGrey, -w * 0.15, 0.445, 0));
      g.add(cyl(0.06, 0.05, 0.16, M.lacquer, w * 0.2, 0.5, 0));
      return { g, foot: [-w / 2, -d / 2, w / 2, d / 2] };
    }
    g.add(box(w, 0.035, d, M.walnut, 0, 0.4, 0));
    g.add(box(w - 0.1, 0.02, d - 0.1, M.walnut, 0, 0.12, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.04, 0.38, 0.04, M.black, sx * (w / 2 - 0.05), 0.2, sz * (d / 2 - 0.05)));
    g.add(cyl(0.07, 0.05, 0.12, M.white, w * 0.2, 0.48, 0));
    return { g, foot: [-w / 2, -d / 2, w / 2, d / 2] };
  }
  // Contemporary TV feature wall sized to the clear wall between openings (width P): a warm-beige back panel
  // (floor to 2.40 m), an oak fluted band above the screen, a floating walnut console (0.35 deep, 0.28 high,
  // 0.30 off the floor) and concealed warm LED: a wash from the top edge, a halo behind the TV and a glow under
  // the console. The TV is the largest 16:9 size that leaves ≥ 75 mm of panel each side: 55″, 50″ or 43″.
  const TVS = [[55, 1.218, 0.685], [50, 1.107, 0.623], [43, 0.952, 0.535]];
  function tvWall(P) {
    if (luxe) return tvWallLuxe(P);
    const [inch, tw, th] = TVS.find(([, w]) => w <= P - 0.15) || TVS[TVS.length - 1];
    const g = new THREE.Group();
    const H = 2.4, t = 0.025, cw = Math.min(P - 0.05, 1.8), cd = 0.35, ch = 0.28, c0 = 0.3;
    g.add(box(P, H, t, M.laminateBeige, 0, H / 2, t / 2)); // beige back panel
    for (const s of [-1, 1]) g.add(box(0.02, H, t + 0.006, M.oak, s * (P / 2 - 0.01), H / 2, (t + 0.006) / 2)); // oak edge trims
    const ty = c0 + ch + 0.25 + th / 2; // screen centre, ≈ seated eye level
    const band0 = ty + th / 2 + 0.12;
    const n = Math.floor((P - 0.04) / 0.05);
    for (let i = 0; i < n; i++) g.add(box(0.04, H - band0, 0.02, M.oak, -((n - 1) * 0.05) / 2 + i * 0.05, (band0 + H) / 2, t + 0.01)); // fluted band
    g.add(box(P, 0.012, 0.012, M.lamp, 0, H - 0.01, t + 0.03, false)); // top-edge LED wash
    g.add(box(tw * 0.9, 0.01, 0.01, M.lamp, 0, ty + th / 2 - 0.04, t + 0.02, false)); // halo strip behind the TV
    g.add(box(tw, th, 0.03, M.screen, 0, ty, t + 0.045));
    g.add(box(tw + 0.01, th + 0.01, 0.02, M.black, 0, ty, t + 0.03));
    g.add(box(cw, ch, cd, M.walnut, 0, c0 + ch / 2, t + cd / 2)); // floating console
    for (const x of [-cw / 6, cw / 6]) g.add(box(0.004, ch - 0.04, 0.004, M.black, x, c0 + ch / 2, t + cd + 0.002, false));
    g.add(box(cw - 0.06, 0.01, 0.01, M.lamp, 0, c0 - 0.006, t + cd - 0.05, false)); // under-console glow
    return { g, foot: [-P / 2, 0, P / 2, t + cd], size: [P, t + cd], tv: { inch, w: tw, h: th, y: ty, console: [cw, cd, ch, c0], panel: [P, H] } };
  }
  // Warm luxe TV wall (from the samples): a light stone slab behind the screen between two backlit onyx panels, with
  // vertical LED lines at the joints, up to the 2.75 m cove line; a floating white lacquer console with a walnut top
  // and a glow underneath. Same TV sizing rule as the standard wall.
  function tvWallLuxe(P) {
    const [inch, tw, th] = TVS.find(([, w]) => w <= P - 0.15) || TVS[TVS.length - 1];
    const g = new THREE.Group();
    const H = 2.75, t = 0.03, cw = Math.min(P - 0.3, 2.2), cd = 0.38, ch = 0.3, c0 = 0.3;
    const Cw = Math.min(P - 0.6, Math.max(tw + 0.5, 1.5)), Sw = (P - Cw) / 2;
    g.add(box(Cw, H, t, M.stoneSlab, 0, H / 2, t / 2));
    for (const s of [-1, 1]) {
      g.add(box(Sw - 0.03, H, t, M.onyx, s * (Cw / 2 + Sw / 2 + 0.015), H / 2, t / 2));
      g.add(box(0.012, H, 0.012, M.lamp, s * (Cw / 2 + 0.008), H / 2, t + 0.004, false)); // LED line at the joint
      g.add(box(0.02, H, t + 0.01, M.brass, s * (P / 2 - 0.01), H / 2, (t + 0.01) / 2)); // brass edge
    }
    const ty = c0 + ch + 0.25 + th / 2;
    g.add(box(tw, th, 0.03, M.screen, 0, ty, t + 0.045));
    g.add(box(tw + 0.01, th + 0.01, 0.02, M.black, 0, ty, t + 0.03));
    g.add(box(cw, ch, cd, M.lacquer, 0, c0 + ch / 2, t + cd / 2)); // floating console
    g.add(box(cw + 0.02, 0.03, cd + 0.02, M.walnut, 0, c0 + ch + 0.015, t + cd / 2));
    for (let k = 1; k < 4; k++) g.add(box(0.004, ch - 0.04, 0.004, M.black, -cw / 2 + (k * cw) / 4, c0 + ch / 2, t + cd + 0.002, false));
    g.add(box(cw - 0.06, 0.01, 0.01, M.lamp, 0, c0 - 0.006, t + cd - 0.05, false)); // under-console glow
    g.add(cyl(0.06, 0.045, 0.24, M.lacquer, cw / 2 - 0.2, c0 + ch + 0.15, t + cd / 2)); // vase with dried stems
    for (let k = 0; k < 6; k++) g.add(box(0.006, 0.36, 0.006, M.walnut, cw / 2 - 0.25 + k * 0.02, c0 + ch + 0.42, t + cd / 2));
    return { g, foot: [-P / 2, 0, P / 2, t + cd], size: [P, t + cd], tv: { inch, w: tw, h: th, y: ty, console: [cw, cd, ch, c0], panel: [P, H] } };
  }

  function chair() {
    const c = SIZES.chair;
    const g = new THREE.Group();
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(luxe ? 0.025 : 0.035, c.seat - 0.04, luxe ? 0.025 : 0.035, luxe ? M.black : M.walnut, sx * (c.w / 2 - 0.03), (c.seat - 0.04) / 2, sz * (c.d / 2 - 0.03)));
    if (luxe) { // upholstered grey chair with a tall rounded back
      g.add(rounded(c.w, 0.09, c.d, 0.04, M.chairGrey, 0, c.seat - 0.02, 0));
      g.add(rounded(c.w + 0.02, c.back - c.seat + 0.08, 0.07, 0.04, M.chairGrey, 0, c.seat + (c.back - c.seat) / 2 + 0.02, c.d / 2 - 0.03));
      return g;
    }
    g.add(rounded(c.w, 0.06, c.d, 0.02, M.linen, 0, c.seat - 0.02, 0));
    g.add(rounded(c.w, c.back - c.seat, 0.04, 0.015, M.linen, 0, c.seat + (c.back - c.seat) / 2, c.d / 2 - 0.02));
    return g;
  }
  function dining(kind) {
    const g = new THREE.Group();
    const c = SIZES.chair;
    const seats = [];
    let foot;
    if (kind === 'round4') {
      const r = SIZES.round4 / 2;
      g.add(cyl(r, r, 0.035, M.oak, 0, 0.74, 0, 48));
      g.add(cyl(0.06, 0.06, 0.7, M.walnut, 0, 0.37, 0));
      g.add(cyl(0.28, 0.3, 0.03, M.walnut, 0, 0.015, 0, 32));
      for (let k = 0; k < 4; k++) seats.push([Math.cos((k * Math.PI) / 2) * (r + 0.12), Math.sin((k * Math.PI) / 2) * (r + 0.12)]);
      foot = [-r - 0.4, -r - 0.4, r + 0.4, r + 0.4];
    } else {
      const { w, l } = SIZES.dining6;
      if (luxe) { // white marble top on slim black legs
        g.add(box(w + 0.1, 0.04, l + 0.2, M.slabWhite, 0, 0.74, 0));
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.04, 0.72, 0.04, M.black, sx * (w / 2 - 0.08), 0.36, sz * (l / 2 - 0.1)));
      } else {
        g.add(box(w, 0.035, l, M.oak, 0, 0.74, 0));
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.06, 0.72, 0.06, M.walnut, sx * (w / 2 - 0.06), 0.36, sz * (l / 2 - 0.08)));
      }
      for (const z of [-l / 3, 0, l / 3]) seats.push([-w / 2 - 0.1, z], [w / 2 + 0.1, z]);
      foot = [-w / 2 - 0.4, -l / 2 - 0.15, w / 2 + 0.4, l / 2 + 0.15];
    }
    for (const [x, z] of seats) {
      const ch = chair();
      ch.position.set(x, 0, z);
      ch.rotation.y = Math.atan2(x, z); // back away from table
      g.add(ch);
    }
    return { g, foot };
  }

  function plant() {
    const g = new THREE.Group();
    g.add(cyl(0.22, 0.17, 0.42, M.pot, 0, 0.21, 0, 28));
    g.add(cyl(0.2, 0.2, 0.02, M.solid('#3b2c22', { roughness: 1 }), 0, 0.41, 0));
    g.add(cyl(0.02, 0.025, 0.9, M.walnut, 0, 0.85, 0, 8));
    const R = (k) => Math.sin(k * 12.9898) * 0.5 + 0.5;
    for (let k = 0; k < 9; k++) {
      const a = k * 2.4, h = 0.85 + R(k) * 0.7, rr = 0.12 + R(k + 3) * 0.12;
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + R(k + 7) * 0.08, 1), M.leaf);
      leaf.position.set(Math.cos(a) * rr, h, Math.sin(a) * rr);
      leaf.scale.set(1, 0.7, 1);
      leaf.castShadow = true;
      g.add(leaf);
    }
    return { g, foot: [-0.22, -0.22, 0.22, 0.22] };
  }

  function diwan(len) {
    const g = new THREE.Group();
    const d = 0.8;
    g.add(box(len, 0.32, d, M.walnut, 0, 0.16, d / 2));
    g.add(rounded(len - 0.02, 0.1, d - 0.02, 0.04, M.linen, 0, 0.37, d / 2));
    for (const s of [-1, 1]) {
      const b = cyl(0.11, 0.11, d - 0.1, M.velvet, s * (len / 2 - 0.15), 0.52, d / 2, 20);
      b.rotation.x = Math.PI / 2;
      g.add(b);
    }
    g.add(rounded(len * 0.7, 0.35, 0.14, 0.06, M.velvet, 0, 0.6, 0.12));
    return { g, foot: [-len / 2, 0, len / 2, d] };
  }

  // ---------------- kitchen ----------------
  function counter(len, opts = {}) {
    const d = SIZES.counterDepth, H = SIZES.counterH;
    const g = new THREE.Group();
    g.add(box(len, 0.1, d - 0.06, M.black, 0, 0.05, (d - 0.06) / 2));
    g.add(box(len, H - 0.12, d - 0.02, luxe ? M.greige : M.laminateBeige, 0, 0.1 + (H - 0.12) / 2, (d - 0.02) / 2));
    const n = Math.max(1, Math.round(len / 0.6));
    for (let i = 1; i < n; i++) g.add(box(0.004, H - 0.14, 0.004, M.black, -len / 2 + (i * len) / n, 0.1 + (H - 0.12) / 2, d - 0.018, false));
    for (let i = 0; i < n; i++) g.add(box((len / n) * 0.6, 0.015, 0.02, luxe ? M.black : M.alu, -len / 2 + ((i + 0.5) * len) / n, H - 0.1, d - 0.01));
    g.add(box(len, 0.02, d + 0.02, luxe ? M.quartz : M.granite, 0, H - 0.01, (d + 0.02) / 2));
    if (opts.backsplash) g.add(box(len, SIZES.upperFrom - H, 0.008, luxe ? M.marble : M.bathTile, 0, H + (SIZES.upperFrom - H) / 2, 0.004, false));
    return { g, foot: [-len / 2, 0, len / 2, d] };
  }
  function upper(len) {
    const d = SIZES.upperDepth, y0 = SIZES.upperFrom, y1 = SIZES.upperTo;
    const g = new THREE.Group();
    // luxe: greige gloss shutters with a black-framed glass display bay at the right-hand end
    const bay = luxe && len > 1.4 ? 0.5 : 0;
    g.add(box(len - bay, y1 - y0, d, luxe ? M.greige : M.laminateBeige, -bay / 2, (y0 + y1) / 2, d / 2));
    if (bay) {
      const bx = len / 2 - bay / 2;
      g.add(box(bay, y1 - y0, 0.02, M.walnut, bx, (y0 + y1) / 2, 0.01));
      g.add(box(bay, y1 - y0, 0.01, M.glass, bx, (y0 + y1) / 2, d - 0.005, false));
      for (const [w, h, x, y] of [[bay, 0.025, bx, y1 - 0.0125], [bay, 0.025, bx, y0 + 0.0125], [0.025, y1 - y0, bx - bay / 2 + 0.0125, (y0 + y1) / 2], [0.025, y1 - y0, bx + bay / 2 - 0.0125, (y0 + y1) / 2]]) g.add(box(w, h, d, M.black, x, y, d / 2));
      g.add(box(bay - 0.06, 0.01, d - 0.06, M.glass, bx, (y0 + y1) / 2, d / 2, false));
      g.add(box(bay - 0.08, 0.01, 0.01, M.lamp, bx, y1 - 0.04, 0.05, false));
      for (const x of [-0.12, 0, 0.12]) g.add(cyl(0.035, 0.035, 0.1, M.lacquer, bx + x, (y0 + y1) / 2 + 0.06, d / 2));
    }
    const n = Math.max(1, Math.round(len / 0.5));
    for (let i = 1; i < n; i++) if (-len / 2 + (i * len) / n < len / 2 - bay - 0.05) g.add(box(0.004, y1 - y0 - 0.02, 0.004, M.black, -len / 2 + (i * len) / n, (y0 + y1) / 2, d + 0.002, false));
    g.add(box(len, 0.02, 0.02, M.lamp, 0, y0 - 0.01, d - 0.05, false)); // under-cabinet LED strip
    return { g };
  }
  function hob() {
    const g = new THREE.Group();
    g.add(box(0.74, 0.008, 0.5, M.screen, 0, SIZES.counterH + 0.004, 0.3));
    for (const [x, z, r] of [[-0.2, 0.18, 0.08], [0.2, 0.18, 0.07], [-0.2, 0.42, 0.06], [0.2, 0.42, 0.09]]) {
      g.add(cyl(r, r, 0.02, M.steel, x, SIZES.counterH + 0.018, z, 24));
      const grate = new THREE.Mesh(new THREE.TorusGeometry(r + 0.03, 0.006, 6, 24), M.black);
      grate.rotation.x = Math.PI / 2;
      grate.position.set(x, SIZES.counterH + 0.035, z);
      g.add(grate);
    }
    // chimney hood 0.9 m wide, 650 mm above hob
    g.add(box(0.9, 0.08, 0.5, M.steel, 0, SIZES.counterH + 0.69, 0.25));
    g.add(box(0.3, 3.05 - (SIZES.counterH + 0.73), 0.25, M.steel, 0, (3.05 + SIZES.counterH + 0.73) / 2, 0.125));
    return { g };
  }
  function sink() {
    const g = new THREE.Group();
    g.add(box(0.8, 0.012, 0.5, M.steel, 0, SIZES.counterH + 0.001, 0.3, false));
    g.add(box(0.7, 0.2, 0.4, M.solid('#8c9196', { metalness: 1, roughness: 0.4 }), 0, SIZES.counterH - 0.1, 0.3, false));
    g.add(cyl(0.018, 0.022, 0.3, M.chrome, 0, SIZES.counterH + 0.15, 0.08, 12));
    const spout = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 20, Math.PI), M.chrome);
    spout.position.set(0, SIZES.counterH + 0.3, 0.18);
    spout.rotation.y = Math.PI / 2;
    g.add(spout);
    return { g };
  }
  function fridge() {
    const f = SIZES.fridge;
    const g = new THREE.Group();
    g.add(box(f.w, f.h, f.d, M.steel, 0, f.h / 2, f.d / 2));
    g.add(box(f.w, 0.004, 0.004, M.black, 0, 1.2, f.d + 0.002, false));
    g.add(box(0.02, 0.5, 0.03, M.chrome, -f.w / 2 + 0.06, 1.5, f.d + 0.02));
    g.add(box(0.02, 0.6, 0.03, M.chrome, -f.w / 2 + 0.06, 0.85, f.d + 0.02));
    return { g, foot: [-f.w / 2, 0, f.w / 2, f.d] };
  }

  // ---------------- bath ----------------
  function wc() {
    const s = SIZES.wc;
    const g = new THREE.Group();
    g.add(rounded(0.36, 0.38, 0.17, 0.04, M.porcelain, 0, 0.62, 0.1)); // cistern
    g.add(box(0.08, 0.015, 0.03, M.chrome, 0.08, 0.82, 0.1));
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.36, 28), M.porcelain);
    base.position.set(0, 0.18, 0.4);
    base.scale.set(1, 1, 1.35);
    base.castShadow = true;
    g.add(base);
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 32), M.porcelain);
    seat.position.set(0, 0.395, 0.42);
    seat.scale.set(1, 1, 1.4);
    g.add(seat);
    g.add(box(0.36, 0.3, 0.1, M.porcelain, 0, 0.2, 0.15));
    g.add(cyl(0.015, 0.015, 0.12, M.chrome, 0.32, 0.55, 0.03, 10)); // health faucet
    return { g, foot: [-s.w / 2, 0, s.w / 2, s.d] };
  }
  function vanity() {
    const v = SIZES.vanity;
    const g = new THREE.Group();
    g.add(box(v.w, 0.45, v.d, M.oak, 0, v.h - 0.25, v.d / 2));
    g.add(box(v.w + 0.02, 0.03, v.d + 0.02, M.granite, 0, v.h + 0.015, (v.d + 0.02) / 2));
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.13, 32), M.porcelain);
    bowl.position.set(0, v.h + 0.095, v.d / 2 + 0.02);
    bowl.scale.set(1, 1, 0.8);
    bowl.castShadow = true;
    g.add(bowl);
    g.add(cyl(0.014, 0.018, 0.24, M.chrome, 0, v.h + 0.15, 0.06, 12));
    g.add(box(0.03, 0.02, 0.14, M.chrome, 0, v.h + 0.26, 0.12));
    const mirror = new Reflector(new THREE.PlaneGeometry(0.6, 0.8), { textureWidth: 512, textureHeight: 683, color: 0xe6e6e6, clipBias: 0.003 });
    mirror.position.set(0, 1.6, 0.012);
    g.add(mirror, box(0.62, 0.82, 0.01, M.alu, 0, 1.6, 0.005, false));
    g.add(box(0.5, 0.02, 0.04, M.lamp, 0, 2.04, 0.03, false));
    return { g, foot: [-v.w / 2, 0, v.w / 2, v.d] };
  }
  function showerGlass(len) {
    const g = new THREE.Group();
    g.add(box(len, 2.0, 0.01, M.showerGlass, 0, 1.0, 0, false));
    g.add(box(len, 0.02, 0.03, M.chrome, 0, 2.0, 0, false));
    g.add(box(len, 0.02, 0.03, M.chrome, 0, 0.01, 0, false));
    return { g };
  }
  function showerHead() {
    const g = new THREE.Group();
    g.add(cyl(0.012, 0.012, 0.15, M.chrome, 0, 2.2 + 0.075, 0.02, 10)); // wall flange
    const arm = cyl(0.012, 0.012, 0.35, M.chrome, 0, 2.2, 0.17, 10);
    arm.rotation.x = Math.PI / 2;
    g.add(arm, cyl(0.12, 0.12, 0.015, M.chrome, 0, 2.19, 0.34, 32));
    g.add(box(0.12, 0.12, 0.05, M.chrome, 0, 1.05, 0.025));
    g.add(cyl(0.025, 0.025, 0.04, M.chrome, 0, 1.05, 0.06, 16).rotateX(Math.PI / 2));
    return { g };
  }

  // ---------------- ceiling ----------------
  function fan() {
    const g = new THREE.Group();
    g.add(cyl(0.07, 0.07, 0.03, M.white, 0, -0.015, 0, 24));
    g.add(cyl(0.012, 0.012, 0.3, M.white, 0, -0.18, 0, 10));
    const rotor = new THREE.Group();
    rotor.position.y = -0.38;
    rotor.add(cyl(0.1, 0.11, 0.12, M.white, 0, 0, 0, 32));
    const r = SIZES.fanSweep / 2;
    for (let k = 0; k < 3; k++) {
      const blade = box(r - 0.1, 0.008, 0.11, M.white, 0, 0, 0);
      blade.geometry.translate((r - 0.1) / 2 + 0.1, 0, 0);
      blade.rotation.y = (k * Math.PI * 2) / 3;
      blade.rotation.x = 0.08;
      rotor.add(blade);
    }
    g.add(rotor);
    return { g, rotor };
  }
  function downlight() {
    const g = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.065, 24), M.lamp);
    disc.rotation.x = Math.PI / 2;
    disc.position.y = -0.002;
    const trim = new THREE.Mesh(new THREE.RingGeometry(0.065, 0.08, 24), M.white);
    trim.rotation.x = Math.PI / 2;
    trim.position.y = -0.003;
    g.add(disc, trim);
    return g;
  }
  function curtainPanel(width, height) {
    const geo = new THREE.PlaneGeometry(width, height, Math.max(8, Math.round(width * 40)), 1);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setZ(i, Math.sin((x / width) * Math.PI * 2 * Math.max(2, width / 0.09)) * 0.035);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, M.curtain);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
  // Roman blind fitted inside a window reveal (keeps the wall either side clear, e.g. on a TV wall): fabric
  // raised to 60 % with soft folds, on a slim headrail
  function romanBlind(width, top, bottom) {
    const g = new THREE.Group();
    const drop = (top - bottom) * 0.4, folds = 4;
    g.add(box(width, 0.03, 0.04, M.alu, 0, top - 0.015, 0));
    g.add(box(width, drop, 0.012, M.curtain, 0, top - 0.03 - drop / 2, 0.004));
    for (let k = 0; k < folds; k++) g.add(box(width, 0.035, 0.03, M.curtain, 0, top - 0.03 - drop + (k * drop) / folds + 0.02, 0.01));
    return g;
  }

  return { bed, wardrobe, crockery, sofa, coffeeTable, tvWall, dining, plant, diwan, counter, upper, hob, sink, fridge, wc, vanity, showerGlass, showerHead, fan, downlight, curtainPanel, romanBlind, box, cyl };
}
