// Pooja mandir with stylised idols, built from primitives.
// Local frame: x along the wall (length L), +z faces into the room, back panel at z = -D/2.
import * as THREE from 'three';

const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
const gold = M('#d6a63a', { roughness: 0.28, metalness: 0.95 });
const brass = M('#b9892f', { roughness: 0.35, metalness: 0.9 });
const teak = M('#6e3f1d', { roughness: 0.5 });
const maroon = M('#7b1c1c', { roughness: 0.7 });
const blackStone = M('#26262b', { roughness: 0.35, metalness: 0.2 });
const sindoor = M('#e0601c', { roughness: 0.5 });
const saree = M('#c2185b', { roughness: 0.6 });
const skin = M('#d99a62', { roughness: 0.55 });
const silk = M('#e8b40c', { roughness: 0.45 });
const white = M('#f7f4ee', { roughness: 0.4 });
const red = M('#c62828', { roughness: 0.5 });
const lotusPink = M('#f48fb1', { roughness: 0.6 });
const leafGreen = M('#2e7d32', { roughness: 0.7 });
const marigold = M('#f59f00', { roughness: 0.8 });
const marigoldDeep = M('#e8590c', { roughness: 0.8 });
const flame = new THREE.MeshBasicMaterial({ color: '#ffc94d' });

function mesh(geo, mat, x = 0, y = 0, z = 0, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}
const sphere = (r, mat, x, y, z, sx = 1, sy = 1, sz = 1) => {
  const m = mesh(new THREE.SphereGeometry(r, 20, 14), mat, x, y, z);
  m.scale.set(sx, sy, sz);
  return m;
};
const cyl = (rt, rb, h, mat, x, y, z, seg = 20) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z);
const box = (w, h, d, mat, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
const cone = (r, h, mat, x, y, z, seg = 20) => mesh(new THREE.ConeGeometry(r, h, seg), mat, x, y, z);
function arch(r, tube, mat, x, y, z) {
  return mesh(new THREE.TorusGeometry(r, tube, 8, 40, Math.PI), mat, x, y, z);
}
function limb(a, b, r, mat) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const m = mesh(new THREE.CylinderGeometry(r, r * 0.85, A.distanceTo(B), 10), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return m;
}

// ---------------- idols (base at y = 0, facing +z, ~1–1.5 ft tall) ----------------
function ganesha() {
  const g = new THREE.Group();
  g.add(cyl(0.3, 0.34, 0.1, gold, 0, 0.05, 0, 28));
  g.add(sphere(0.3, sindoor, 0, 0.2, 0.04, 1.25, 0.42, 1.0)); // crossed legs
  g.add(sphere(0.26, sindoor, 0, 0.42, 0.02, 1, 1.02, 0.9)); // belly
  g.add(box(0.3, 0.05, 0.05, silk, 0, 0.5, 0.25)); // sash
  g.add(sphere(0.18, sindoor, 0, 0.74, 0.03)); // head
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 20), sindoor, s * 0.2, 0.74, -0.03);
    ear.rotation.x = Math.PI / 2;
    ear.scale.set(0.8, 1, 1.1);
    g.add(ear);
    g.add(cone(0.02, 0.1, white, s * 0.07, 0.65, 0.19)); // tusks
    g.add(limb([s * 0.22, 0.58, 0.02], [s * 0.36, 0.72, 0.04], 0.045, sindoor)); // upper arms
    g.add(limb([s * 0.22, 0.5, 0.06], [s * 0.26, 0.38, 0.2], 0.045, sindoor)); // lower arms
  }
  g.add(sphere(0.05, gold, 0.36, 0.76, 0.04)); // axe-hand ornament
  g.add(mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 16), gold, -0.36, 0.76, 0.04)); // noose
  g.add(sphere(0.05, M('#f8e1a0'), 0.26, 0.38, 0.24)); // modak
  const trunk = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.7, 0.17), new THREE.Vector3(0.0, 0.58, 0.22), new THREE.Vector3(0.05, 0.47, 0.24), new THREE.Vector3(0.12, 0.47, 0.25),
  ]);
  g.add(mesh(new THREE.TubeGeometry(trunk, 16, 0.04, 8, false), sindoor));
  g.add(cone(0.11, 0.24, gold, 0, 0.98, 0.02)); // crown
  g.add(sphere(0.12, gold, 0, 0.86, 0.02, 1, 0.35, 1));
  g.add(box(0.06, 0.012, 0.01, red, 0, 0.82, 0.18)); // tilak
  return g;
}

function venkateswara() {
  const g = new THREE.Group();
  g.add(box(0.5, 0.1, 0.34, gold, 0, 0.05, 0));
  g.add(sphere(0.16, lotusPink, 0, 0.12, 0.02, 1.3, 0.35, 1));
  g.add(cyl(0.13, 0.19, 0.66, silk, 0, 0.46, 0)); // pitambaram (yellow silk)
  g.add(cyl(0.16, 0.13, 0.36, blackStone, 0, 0.96, 0)); // torso
  g.add(cyl(0.07, 0.07, 0.08, blackStone, 0, 1.17, 0)); // neck
  g.add(sphere(0.11, blackStone, 0, 1.28, 0.0)); // head
  // namam: white U with red centre line
  g.add(box(0.018, 0.08, 0.01, white, -0.03, 1.31, 0.105));
  g.add(box(0.018, 0.08, 0.01, white, 0.03, 1.31, 0.105));
  g.add(box(0.075, 0.016, 0.01, white, 0, 1.27, 0.105));
  g.add(box(0.014, 0.08, 0.012, red, 0, 1.31, 0.107));
  // kireetam (tall crown)
  g.add(cyl(0.065, 0.12, 0.38, gold, 0, 1.55, 0, 16));
  g.add(sphere(0.05, gold, 0, 1.77, 0));
  for (let k = 0; k < 3; k++) {
    const band = mesh(new THREE.TorusGeometry(0.1 - k * 0.015, 0.012, 6, 20), gold, 0, 1.42 + k * 0.1, 0);
    band.rotation.x = Math.PI / 2;
    g.add(band);
  }
  // four arms: shankha & chakra above, varada/kati below
  for (const s of [-1, 1]) {
    g.add(limb([s * 0.17, 1.08, 0], [s * 0.25, 1.24, 0.02], 0.035, blackStone));
    g.add(limb([s * 0.17, 1.06, 0.02], [s * 0.2, 0.82, 0.1], 0.035, blackStone));
  }
  const chakra = mesh(new THREE.TorusGeometry(0.07, 0.018, 8, 24), gold, 0.27, 1.3, 0.03);
  g.add(chakra, sphere(0.025, gold, 0.27, 1.3, 0.03));
  g.add(cone(0.04, 0.13, white, -0.27, 1.3, 0.03, 12));
  // garland and halo arch
  const garland = mesh(new THREE.TorusGeometry(0.16, 0.028, 8, 28), marigold, 0, 1.0, 0.04);
  garland.rotation.x = Math.PI / 2.4;
  g.add(garland);
  g.add(arch(0.42, 0.03, gold, 0, 0.95, -0.14));
  g.add(cyl(0.03, 0.03, 0.95, gold, -0.42, 0.47, -0.14, 10), cyl(0.03, 0.03, 0.95, gold, 0.42, 0.47, -0.14, 10));
  return g;
}

function lakshmi() {
  const g = new THREE.Group();
  // lotus seat
  g.add(cyl(0.26, 0.18, 0.1, leafGreen, 0, 0.05, 0, 24));
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const p = sphere(0.1, lotusPink, Math.cos(a) * 0.24, 0.13, Math.sin(a) * 0.24, 1, 0.45, 0.55);
    p.rotation.y = -a;
    g.add(p);
  }
  g.add(sphere(0.27, saree, 0, 0.27, 0.04, 1.15, 0.42, 1)); // seated legs in saree
  g.add(cyl(0.11, 0.16, 0.34, saree, 0, 0.5, 0)); // torso
  g.add(box(0.05, 0.36, 0.02, silk, 0.06, 0.5, 0.13)); // pallu border
  g.add(sphere(0.09, skin, 0, 0.77, 0.01)); // head
  g.add(sphere(0.094, M('#1b1b1b'), 0, 0.79, -0.015)); // hair
  g.add(sphere(0.012, red, 0, 0.8, 0.09)); // bindi
  g.add(cone(0.07, 0.18, gold, 0, 0.94, 0)); // crown
  const halo = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.015, 32), gold, 0, 0.8, -0.1);
  halo.rotation.x = Math.PI / 2;
  g.add(halo);
  for (const s of [-1, 1]) {
    g.add(limb([s * 0.13, 0.62, 0], [s * 0.23, 0.68, 0.06], 0.03, skin));
    g.add(sphere(0.05, lotusPink, s * 0.24, 0.73, 0.07, 1, 0.8, 1)); // lotuses in upper hands
    g.add(limb([s * 0.13, 0.6, 0.03], [s * 0.16, 0.45, 0.16], 0.03, skin));
  }
  // gold coins falling from the right hand
  for (let k = 0; k < 4; k++) {
    const c = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.008, 12), gold, 0.17, 0.42 - k * 0.07, 0.2);
    c.rotation.x = Math.PI / 2;
    g.add(c);
  }
  return g;
}

function shivaLingam() {
  const g = new THREE.Group();
  g.add(cyl(0.22, 0.25, 0.12, blackStone, 0, 0.06, 0, 28)); // peetham
  g.add(cyl(0.27, 0.27, 0.06, blackStone, 0, 0.15, 0, 28));
  g.add(box(0.22, 0.05, 0.1, blackStone, 0.33, 0.15, 0)); // spout
  g.add(cyl(0.1, 0.11, 0.32, blackStone, 0, 0.34, 0, 24));
  g.add(sphere(0.1, blackStone, 0, 0.5, 0, 1, 0.9, 1));
  for (let k = 0; k < 3; k++) g.add(box(0.15, 0.012, 0.01, white, 0, 0.36 + k * 0.035, 0.105)); // tripundra
  g.add(sphere(0.014, red, 0, 0.395, 0.11));
  // bilva leaves and flowers at the base
  for (let k = 0; k < 3; k++) {
    const l = sphere(0.06, leafGreen, -0.06 + k * 0.06, 0.2, 0.15, 0.5, 0.12, 1);
    l.rotation.y = (k - 1) * 0.6;
    g.add(l);
  }
  for (const [x, z, m] of [[-0.16, 0.12, marigold], [0.15, 0.13, marigoldDeep], [0.0, -0.18, marigold]]) g.add(sphere(0.035, m, x, 0.21, z));
  // nagabharanam: coiled snake hood behind the lingam
  const coil = mesh(new THREE.TorusGeometry(0.13, 0.025, 8, 24, Math.PI * 1.6), M('#3b5d3b', { roughness: 0.4 }), 0, 0.3, 0);
  coil.rotation.x = Math.PI / 2;
  g.add(coil);
  g.add(sphere(0.06, M('#3b5d3b', { roughness: 0.4 }), 0, 0.62, -0.07, 1.3, 0.6, 0.5));
  return g;
}

function diya(x, z) {
  const g = new THREE.Group();
  const bowl = mesh(new THREE.SphereGeometry(0.07, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), brass, x, 0.07, z);
  g.add(bowl, cyl(0.03, 0.05, 0.05, brass, x, 0.025, z, 12));
  g.add(mesh(new THREE.ConeGeometry(0.02, 0.08, 10), flame, x, 0.13, z, false));
  return g;
}

function samai(x, z) {
  // tall brass standing lamp
  const g = new THREE.Group();
  g.add(cyl(0.08, 0.13, 0.05, brass, x, 0.025, z), cyl(0.02, 0.025, 0.55, brass, x, 0.3, z, 10));
  g.add(cyl(0.1, 0.04, 0.05, brass, x, 0.6, z), sphere(0.03, brass, x, 0.66, z));
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    g.add(mesh(new THREE.ConeGeometry(0.015, 0.05, 8), flame, x + Math.cos(a) * 0.085, 0.65, z + Math.sin(a) * 0.085, false));
  }
  return g;
}

function kalash(x, z) {
  const g = new THREE.Group();
  g.add(sphere(0.09, brass, x, 0.09, z, 1, 0.9, 1), cyl(0.04, 0.06, 0.05, brass, x, 0.19, z, 12));
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const l = sphere(0.05, leafGreen, x + Math.cos(a) * 0.05, 0.24, z + Math.sin(a) * 0.05, 0.4, 0.15, 1);
    l.rotation.y = -a;
    l.rotation.z = 0.5;
    g.add(l);
  }
  g.add(sphere(0.055, M('#8d5a2b', { roughness: 0.9 }), x, 0.29, z, 1, 1.15, 1)); // coconut
  return g;
}

function marigoldString(pts, r = 0.045) {
  const n = pts.length;
  const geo = new THREE.IcosahedronGeometry(r, 0);
  const inst = new THREE.InstancedMesh(geo, marigold, n);
  const alt = new THREE.Color('#e8590c'), base = new THREE.Color('#f59f00');
  const m = new THREE.Matrix4();
  pts.forEach((p, i) => {
    inst.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z));
    inst.setColorAt(i, i % 3 === 0 ? alt : base);
  });
  inst.castShadow = true;
  return inst;
}

// ---------------- mandir ----------------
export function buildMandir(L, D) {
  const g = new THREE.Group();
  const H = 2.6; // platform height
  const back = -D / 2;
  g.add(box(L, H, D, teak, 0, H / 2, 0));
  g.add(box(L + 0.04, 0.08, D + 0.04, gold, 0, H - 0.04, 0));
  g.add(box(L + 0.04, 0.08, D + 0.04, gold, 0, 0.3, 0));
  // carved drawer fronts
  const fronts = Math.max(2, Math.round(L / 1.2));
  for (let i = 0; i < fronts; i++) {
    const w = L / fronts;
    g.add(box(w - 0.15, 0.9, 0.03, M('#7d4a22', { roughness: 0.45 }), -L / 2 + w * (i + 0.5), 1.5, D / 2 + 0.015));
    g.add(sphere(0.04, gold, -L / 2 + w * (i + 0.5), 1.5, D / 2 + 0.05));
  }
  // raised back step for the main deity
  g.add(box(L * 0.4, 0.3, D * 0.45, teak, 0, H + 0.15, back + D * 0.225));
  g.add(box(L * 0.4 + 0.02, 0.04, D * 0.45 + 0.02, gold, 0, H + 0.3, back + D * 0.225));
  // back panel with arch, pillars, canopy and shikhara
  g.add(box(L, 3.7, 0.08, maroon, 0, H + 1.85, back + 0.04));
  const archR = Math.min(L * 0.42, 1.2);
  g.add(arch(archR, 0.05, gold, 0, H + 3.7 - archR - 0.25, back + 0.1));
  g.add(cyl(0.05, 0.05, 3.7 - archR - 0.25, gold, -archR, H + (3.7 - archR - 0.25) / 2, back + 0.1, 10));
  g.add(cyl(0.05, 0.05, 3.7 - archR - 0.25, gold, archR, H + (3.7 - archR - 0.25) / 2, back + 0.1, 10));
  g.add(sphere(0.12, gold, 0, H + 3.7 - 0.12, back + 0.12, 1, 1, 0.4)); // Om disc at the apex
  for (const s of [-1, 1]) {
    g.add(cyl(0.07, 0.08, 3.7, teak, s * (L / 2 - 0.09), H + 1.85, D / 2 - 0.09, 12));
    g.add(cyl(0.1, 0.1, 0.1, gold, s * (L / 2 - 0.09), H + 0.05, D / 2 - 0.09, 12));
    g.add(cyl(0.1, 0.1, 0.1, gold, s * (L / 2 - 0.09), H + 3.65, D / 2 - 0.09, 12));
  }
  g.add(box(L + 0.15, 0.25, D + 0.15, teak, 0, H + 3.82, 0));
  g.add(box(L + 0.19, 0.06, D + 0.19, gold, 0, H + 3.72, 0));
  const shikhara = mesh(new THREE.ConeGeometry(Math.min(L, D) * 0.55, 1.1, 4), gold, 0, H + 4.5, 0);
  shikhara.rotation.y = Math.PI / 4;
  g.add(shikhara);
  g.add(sphere(0.09, gold, 0, H + 5.1, 0), cone(0.04, 0.2, gold, 0, H + 5.25, 0, 8));
  // marigold toran across the front, plus two hanging strands
  const pts = [];
  const span = L - 0.2;
  for (let i = 0; i <= 44; i++) {
    const t = i / 44;
    pts.push(new THREE.Vector3(-span / 2 + span * t, H + 3.55 - 0.45 * (1 - (2 * t - 1) ** 2), D / 2 - 0.05));
  }
  for (const s of [-1, 1]) for (let k = 0; k < 14; k++) pts.push(new THREE.Vector3(s * (L / 2 - 0.09), H + 3.5 - k * 0.09, D / 2 - 0.02));
  g.add(marigoldString(pts));
  // bell hanging from the canopy
  g.add(cyl(0.006, 0.006, 0.5, brass, L * 0.3, H + 3.45, 0, 6));
  g.add(mesh(new THREE.CylinderGeometry(0.03, 0.08, 0.12, 16, 1, true), brass, L * 0.3, H + 3.15, 0));

  // idols: Ganesha first (left), Venkateswara centre on the raised step, Lakshmi, Shiva lingam
  const k = Math.min(1, L / 3.4);
  const slots = [
    [ganesha(), -L * 0.36, H, back + D * 0.45],
    [venkateswara(), 0, H + 0.3, back + D * 0.22],
    [lakshmi(), L * 0.2, H, back + D * 0.45],
    [shivaLingam(), L * 0.38, H, back + D * 0.45],
  ];
  for (const [idol, x, y, z] of slots) {
    idol.scale.setScalar(k);
    idol.position.set(x, y, z);
    g.add(idol);
  }
  // lamps, kalash, offerings at the front edge
  const fz = D / 2 - 0.13;
  for (const [x, d] of [[-L * 0.42, diya], [L * 0.42, diya], [-L * 0.17, samai], [L * 0.04, samai]]) {
    const lamp = d(x, fz);
    lamp.position.y = H;
    g.add(lamp);
  }
  const kal = kalash(-L * 0.06, fz - 0.05);
  kal.position.y = H;
  g.add(kal);
  // warm lamp light
  const light = new THREE.PointLight('#ffb347', 5, 10, 2);
  light.position.set(0, H + 1.0, D / 2 + 0.6);
  g.add(light);
  return g;
}

// Floor rangoli: concentric petal rings on a canvas texture.
export function rangoli(radius) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d');
  x.translate(256, 256);
  const ring = (n, r0, r1, color, wide = 0.5) => {
    x.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      x.save();
      x.rotate(a);
      x.beginPath();
      x.moveTo(0, -r0);
      x.quadraticCurveTo(r1 * wide * 0.6, -(r0 + r1) / 2, 0, -r1);
      x.quadraticCurveTo(-r1 * wide * 0.6, -(r0 + r1) / 2, 0, -r0);
      x.fill();
      x.restore();
    }
  };
  const disc = (r, color) => { x.fillStyle = color; x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.fill(); };
  disc(250, '#ffffff');
  disc(240, '#d62828');
  ring(24, 170, 238, '#ffd60a', 0.55);
  disc(170, '#2a9d8f');
  ring(16, 100, 168, '#f77f00', 0.7);
  disc(100, '#ffffff');
  ring(12, 40, 98, '#9b2226', 0.8);
  disc(40, '#ffd60a');
  disc(18, '#d62828');
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    x.fillStyle = '#ffffff';
    x.beginPath(); x.arc(Math.cos(a) * 245, Math.sin(a) * 245, 4, 0, Math.PI * 2); x.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 48), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}
