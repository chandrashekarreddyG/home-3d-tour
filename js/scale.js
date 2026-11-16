// Scale references: architect-style grey figures (1.72 m man, 1.58 m woman, 1.12 m child) on the front verandah and
// a 3.85 m hatchback parked on G.P Road. Without a familiar object nearby the eye reads a correctly sized house as a
// model; these give it its true size without touching any dimension.
import * as THREE from 'three';

function figure(h, mat, female = false) {
  const g = new THREE.Group();
  const s = h / 1.72; // proportions of a 1.72 m adult (head ≈ 1/7.5 of height)
  const cap = (r, len, x, y, z, rx = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r * s, len * s, 6, 12), mat);
    m.position.set(x * s, y * s, z * s);
    m.rotation.set(rx, 0, rz);
    m.castShadow = true;
    g.add(m);
  };
  for (const sx of [-1, 1]) cap(0.065, 0.72, sx * 0.1, 0.45, 0); // legs
  if (female) {
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.17 * s, 0.25 * s, 0.55 * s, 20), mat);
    skirt.position.set(0, 0.62 * s, 0);
    skirt.castShadow = true;
    g.add(skirt);
  }
  cap(female ? 0.15 : 0.17, 0.34, 0, 1.18, 0); // torso
  for (const sx of [-1, 1]) cap(0.045, 0.55, sx * 0.23, 1.12, 0, 0, sx * 0.08); // arms
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105 * s, 20, 14), mat);
  head.position.set(0, 1.6 * s, 0);
  head.scale.set(0.9, 1.1, 1);
  head.castShadow = true;
  g.add(head);
  return g;
}

function hatchback(paint, M) {
  const g = new THREE.Group();
  const L = 3.85, Wd = 1.73, glass = M.solid('#1d2429', { roughness: 0.1, metalness: 0.4 });
  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };
  box(L, 0.62, Wd, paint, 0, 0.55, 0); // body
  box(2.3, 0.5, Wd - 0.12, paint, -0.25, 1.11, 0); // cabin
  box(2.32, 0.42, Wd - 0.1, glass, -0.25, 1.12, 0); // glass band
  box(0.04, 0.12, Wd - 0.3, M.chrome, L / 2, 0.62, 0); // grille line
  for (const s of [-1, 1]) {
    box(0.18, 0.08, 0.3, M.lamp, L / 2 - 0.05, 0.72, s * (Wd / 2 - 0.22)); // headlamps
    for (const x of [L / 2 - 0.72, -L / 2 + 0.68]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.22, 24), M.black);
      w.rotation.x = Math.PI / 2;
      w.position.set(x, 0.31, s * (Wd / 2 - 0.08));
      w.castShadow = true;
      g.add(w);
    }
  }
  return g;
}

// front: verandah rect [x0, z0, x1, z1] (floor y 0); door: main-door centre x; road: z of the near kerb, y of the road
export function buildScaleRefs(M, { verandah, doorX, stairs, roadZ, roadY, plotX }) {
  const g = new THREE.Group();
  const mat = M.solid('#a7adb3', { roughness: 0.85 });
  const [x0, z0, x1, z1] = verandah;
  // west of the main door, out of the walking line into the house and clear of the stair
  const fx = Math.max(x0 + 0.8, Math.min(doorX - 1.8, (stairs ? stairs[0] : x1) - 1.2));
  const people = [[figure(1.72, mat), fx, 0], [figure(1.58, mat, true), fx + 0.65, 0.15], [figure(1.12, mat), fx + 1.15, 0.05]];
  for (const [p, x, dz] of people) {
    p.position.set(x, 0, z0 + (z1 - z0) * 0.6 + dz);
    p.rotation.y = 0.35; // turned towards the road corner
    g.add(p);
  }
  const car = hatchback(M.solid('#e8e9ea', { metalness: 0.6, roughness: 0.35 }), M);
  car.position.set(plotX, roadY, roadZ + 1.3);
  g.add(car);
  return g;
}
