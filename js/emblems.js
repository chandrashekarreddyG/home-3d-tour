// Om medallion for the stair tower, modelled in 3D (built facing +z, centred on the origin, sizes in metres):
// the Om at the centre of a spiral of tapering arcs. A soft halo behind it uses the shared glow material,
// so it reads as backlit after dark.
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OM_PATH } from './omglyph.js';

let mats = null;
const materials = () => (mats ||= {
  gold: new THREE.MeshStandardMaterial({ color: '#d9a842', metalness: 1, roughness: 0.28 }),
  ink: new THREE.MeshStandardMaterial({ color: '#1b1b1d', roughness: 0.5 }),
  cream: new THREE.MeshStandardMaterial({ color: '#f7f6f2', roughness: 0.7 }),
  dark: new THREE.MeshStandardMaterial({ color: '#2a2023', roughness: 0.6 }),
});
const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
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
  const fg = tone === 'gold' ? k.gold : k.ink, bg = tone === 'gold' ? k.dark : k.cream;
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
  const halo = new THREE.Mesh(new THREE.PlaneGeometry((R + 0.12) * 2.9, (R + 0.12) * 2.9), glow);
  halo.position.z = -0.01;
  g.add(halo);
  return g;
}
