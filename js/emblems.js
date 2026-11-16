// Devotional facade emblems, modelled in 3D (all built facing +z, centred on the origin, sizes in metres):
//  - omMedallion: Om at the centre of a spiral of tapering arcs (stair screen, G.P Road side)
//  - vaishnavaPlaque: Shanku (conch), Tirunamam and Sudarshana Chakra in gold and pearl (side entrance, 21 ft road)
// A soft halo behind each piece uses the shared glow material, so they read as backlit after dark.
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OM_PATH } from './omglyph.js';

let mats = null;
const materials = () => (mats ||= {
  gold: new THREE.MeshStandardMaterial({ color: '#d9a842', metalness: 1, roughness: 0.28 }),
  pearl: new THREE.MeshStandardMaterial({ color: '#f5f2ea', metalness: 0.05, roughness: 0.22 }),
  ruby: new THREE.MeshStandardMaterial({ color: '#b3102b', metalness: 0.2, roughness: 0.15, emissive: '#400008' }),
  emerald: new THREE.MeshStandardMaterial({ color: '#0f7a3c', metalness: 0.2, roughness: 0.15, emissive: '#002a10' }),
  red: new THREE.MeshStandardMaterial({ color: '#c8102e', roughness: 0.4 }),
  ink: new THREE.MeshStandardMaterial({ color: '#1b1b1d', roughness: 0.5 }),
  cream: new THREE.MeshStandardMaterial({ color: '#f7f6f2', roughness: 0.7 }),
  plaque: new THREE.MeshStandardMaterial({ color: '#2a2023', roughness: 0.6 }),
});
const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
};
const halo = (glow, size, z = -0.01) => {
  const p = new THREE.Mesh(new THREE.PlaneGeometry(size, size), glow);
  p.position.z = z;
  return p;
};

// Om glyph extruded from the font outline, scaled to height h and centred
let omShapes = null;
function omGeometry(h, depth) {
  omShapes ||= new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${OM_PATH}"/></svg>`).paths.flatMap((p) => SVGLoader.createShapes(p));
  const geo = new THREE.ExtrudeGeometry(omShapes, { depth: 1, bevelEnabled: false, curveSegments: 6 });
  geo.computeBoundingBox();
  const bb = geo.boundingBox, s = h / (bb.max.y - bb.min.y);
  geo.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, 0);
  geo.scale(s, s, depth);
  return geo;
}
// arc of radius r from angle a0 down to a1 (clockwise), width tapering from w0 to w1, extruded `depth`
function taperArc(r, a0, a1, w0, w1, depth) {
  const n = 64, outer = [], inner = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = a0 + (a1 - a0) * t, w = w0 + (w1 - w0) * t;
    outer.push(new THREE.Vector2(Math.cos(a) * (r + w / 2), Math.sin(a) * (r + w / 2)));
    inner.push(new THREE.Vector2(Math.cos(a) * (r - w / 2), Math.sin(a) * (r - w / 2)));
  }
  const shape = new THREE.Shape([...outer, ...inner.reverse()]);
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 });
}

// tone 'ink' = black on a cream disc (like the sketch), 'gold' = gold on a dark disc
export function omMedallion(R, tone, glow) {
  const k = materials(), g = new THREE.Group();
  const fg = tone === 'gold' ? k.gold : k.ink, bg = tone === 'gold' ? k.plaque : k.cream;
  const disc = mesh(new THREE.CylinderGeometry(R + 0.12, R + 0.12, 0.04, 72), bg, 0, 0, 0.02);
  disc.rotation.x = Math.PI / 2;
  g.add(disc, mesh(new THREE.TorusGeometry(R + 0.12, 0.02, 8, 96), k.gold, 0, 0, 0.04));
  // spiral: inner arcs wrap furthest round and are finest; outer arcs start at the top and are boldest
  const n = 13;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), r = R * (0.22 + 0.76 * t);
    const a0 = Math.PI * (0.5 + 0.8 * (1 - t)), a1 = -Math.PI * (0.25 + 0.28 * t);
    const w0 = R * (0.012 + 0.05 * t), w1 = w0 * 0.15;
    g.add(mesh(taperArc(r, a0, a1, w0, w1, 0.025), fg, 0, 0, 0.04));
  }
  g.add(mesh(omGeometry(R * 0.42, 0.04), fg, 0, 0, 0.04));
  g.add(halo(glow, (R + 0.12) * 2.9));
  return g;
}

function conch(u, k) {
  const g = new THREE.Group();
  const prof = [[0, 0.3], [0.08, 0.27], [0.18, 0.21], [0.27, 0.1], [0.3, -0.02], [0.27, -0.14], [0.2, -0.26], [0.12, -0.36], [0.04, -0.44], [0, -0.46]];
  const body = mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r * u, y * u)), 40), k.pearl);
  body.scale.z = 0.7;
  g.add(body);
  // stepped gold crown with a jewel band
  for (const [r, y, h] of [[0.2, 0.3, 0.05], [0.15, 0.35, 0.05], [0.1, 0.4, 0.05]]) g.add(mesh(new THREE.CylinderGeometry(r * u * 0.85, r * u, h * u, 32), k.gold, 0, y * u, 0));
  g.add(mesh(new THREE.ConeGeometry(0.05 * u, 0.1 * u, 24), k.gold, 0, 0.47 * u, 0));
  for (let i = 0; i < 7; i++) {
    const a = -0.9 + (i * 1.8) / 6;
    g.add(mesh(new THREE.SphereGeometry(0.018 * u, 10, 8), k.pearl, Math.sin(a) * 0.2 * u, 0.33 * u, Math.cos(a) * 0.14 * u));
  }
  // gold spiral on the face of the shell
  const pts = [];
  for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 4, r = 0.02 + (0.13 * i) / 60; pts.push(new THREE.Vector3(Math.cos(a) * r * u, (0.02 + Math.sin(a) * r) * u, 0.22 * u)); }
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.014 * u, 6), k.gold));
  // scroll handles either side and a gold band down the lip
  for (const s of [-1, 1]) {
    const h = mesh(new THREE.TorusGeometry(0.07 * u, 0.016 * u, 8, 24, Math.PI * 1.5), k.gold, s * 0.33 * u, 0.16 * u, 0);
    h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI;
    g.add(h);
  }
  const lip = mesh(new THREE.TorusGeometry(0.3 * u, 0.014 * u, 6, 32, Math.PI * 0.55), k.gold, 0, -0.05 * u, 0.05 * u);
  lip.rotation.z = -Math.PI * 0.62;
  g.add(lip);
  g.rotation.z = -0.22; // tip leans down-right, as drawn
  return g;
}

function namam(u, k) {
  const g = new THREE.Group();
  const U = (s) => {
    const sh = new THREE.Shape();
    sh.moveTo(-0.3 * s, 0.45);
    sh.lineTo(-0.3 * s, 0.0);
    sh.quadraticCurveTo(-0.3 * s, -0.32 * s, 0, -0.32 * s);
    sh.quadraticCurveTo(0.3 * s, -0.32 * s, 0.3 * s, 0.0);
    sh.lineTo(0.3 * s, 0.45);
    sh.lineTo(0.15 / s, 0.45);
    sh.lineTo(0.15 / s, 0.03);
    sh.quadraticCurveTo(0.15 / s, -0.14 / s, 0, -0.14 / s);
    sh.quadraticCurveTo(-0.15 / s, -0.14 / s, -0.15 / s, 0.03);
    sh.lineTo(-0.15 / s, 0.45);
    sh.closePath();
    return sh;
  };
  const ext = (sh, d) => new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 16 });
  const gold = mesh(ext(U(1.1), 0.03), k.gold);
  const white = mesh(ext(U(1), 0.06), k.pearl);
  for (const m of [gold, white]) { m.scale.set(u, u, u); g.add(m); }
  const sc = new THREE.Shape();
  sc.moveTo(0, 0.52);
  sc.quadraticCurveTo(0.06, 0.1, 0.05, -0.04);
  sc.quadraticCurveTo(0, -0.12, -0.05, -0.04);
  sc.quadraticCurveTo(-0.06, 0.1, 0, 0.52);
  const red = mesh(ext(sc, 0.07), k.red);
  red.scale.set(u, u, u);
  g.add(red);
  // jewels: ruby on the bowl, emeralds on the arms, a gold pendant with an emerald below
  g.add(mesh(new THREE.SphereGeometry(0.035 * u, 12, 10), k.ruby, 0, -0.23 * u, 0.07 * u));
  for (const s of [-1, 1]) g.add(mesh(new THREE.SphereGeometry(0.025 * u, 12, 10), k.emerald, s * 0.22 * u, -0.05 * u, 0.07 * u));
  const pend = mesh(new THREE.OctahedronGeometry(0.08 * u), k.gold, 0, -0.43 * u, 0.03 * u);
  pend.scale.set(1.2, 0.8, 0.4);
  g.add(pend, mesh(new THREE.SphereGeometry(0.03 * u, 12, 10), k.emerald, 0, -0.43 * u, 0.07 * u));
  return g;
}

function chakra(u, k) {
  const g = new THREE.Group();
  const R = 0.36 * u;
  g.add(mesh(new THREE.TorusGeometry(R, 0.04 * u, 10, 64), k.gold));
  g.add(mesh(new THREE.TorusGeometry(R * 0.72, 0.018 * u, 8, 64), k.gold));
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    g.add(mesh(new THREE.SphereGeometry(0.016 * u, 8, 6), k.pearl, Math.cos(a) * R, Math.sin(a) * R, 0.035 * u));
  }
  // 16 flame-shaped spokes
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const sp = mesh(new THREE.ConeGeometry(0.03 * u, R * 0.62, 4), k.gold, Math.cos(a) * R * 0.42, Math.sin(a) * R * 0.42, 0.01 * u);
    sp.rotation.z = a - Math.PI / 2 + Math.PI; // narrow end towards the hub
    g.add(sp);
  }
  g.add(mesh(new THREE.SphereGeometry(0.07 * u, 16, 12), k.pearl, 0, 0, 0.02 * u));
  g.add(mesh(new THREE.TorusGeometry(0.08 * u, 0.012 * u, 6, 32), k.gold, 0, 0, 0.03 * u));
  // four flame finials with rubies
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 2;
    const f = mesh(new THREE.ConeGeometry(0.06 * u, 0.16 * u, 6), k.gold, Math.cos(a) * (R + 0.1 * u), Math.sin(a) * (R + 0.1 * u), 0);
    f.rotation.z = a - Math.PI / 2;
    g.add(f, mesh(new THREE.SphereGeometry(0.028 * u, 12, 10), k.ruby, Math.cos(a) * (R + 0.05 * u), Math.sin(a) * (R + 0.05 * u), 0.04 * u));
  }
  return g;
}

// dark plaque with a gold border carrying Shanku · Namam · Chakra, w × h
export function vaishnavaPlaque(w, h, glow) {
  const k = materials(), g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(w, h, 0.04), k.plaque, 0, 0, 0.02));
  for (const [bw, bh, x, y] of [[w, 0.03, 0, h / 2 - 0.015], [w, 0.03, 0, -h / 2 + 0.015], [0.03, h, -w / 2 + 0.015, 0], [0.03, h, w / 2 - 0.015, 0]]) g.add(mesh(new THREE.BoxGeometry(bw, bh, 0.02), k.gold, x, y, 0.05));
  const u = Math.min(h * 0.85, w / 3.4), gap = u * 1.12;
  // each piece sits on the plaque face (z of its own back): conch body is 0.21u deep, chakra ring 0.04u
  for (const [p, x, z] of [[conch(u, k), -gap, 0.04 + 0.21 * u], [namam(u, k), 0, 0.045], [chakra(u, k), gap, 0.04 + 0.045 * u]]) {
    p.position.set(x, 0, z);
    const hl = halo(glow, u * 1.4, 0.045);
    hl.position.x = x;
    g.add(p, hl);
  }
  return g;
}
