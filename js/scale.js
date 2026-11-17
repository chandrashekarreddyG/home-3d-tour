// Scale reference: a full-size SUV (4795 × 1855 × 1835 mm, Fortuner class) parked on the 21 ft road beside the house.
// Without a familiar object nearby the eye reads a correctly sized house as a model; the car gives it its true size
// without touching any dimension.
import * as THREE from 'three';

// full-size SUV, local x = length (front at +x), y up, z = width
function suv(paint, M) {
  const g = new THREE.Group();
  const L = 4.795, Wd = 1.855, H = 1.835, wb = 2.745, wr = 0.39, clear = 0.22;
  const glass = M.solid('#1d2429', { roughness: 0.1, metalness: 0.4 });
  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const bodyTop = 1.05;
  box(L, bodyTop - clear - 0.08, Wd, paint, 0, (bodyTop + clear + 0.08) / 2, 0); // lower body
  box(L - 0.5, 0.1, Wd - 0.04, M.black, 0, clear + 0.04, 0); // sills / underbody
  box(3.05, H - 0.05 - bodyTop, Wd - 0.1, paint, -0.35, (H - 0.05 + bodyTop) / 2, 0); // cabin
  box(3.07, 0.5, Wd - 0.08, glass, -0.33, bodyTop + 0.32, 0); // glasshouse band
  for (const s of [-1, 1]) box(2.4, 0.03, 0.04, M.black, -0.35, H - 0.015, s * (Wd / 2 - 0.2)); // roof rails
  box(0.05, 0.3, Wd - 0.35, M.chrome, L / 2, 0.8, 0); // grille
  for (const s of [-1, 1]) {
    box(0.12, 0.1, 0.36, M.lamp, L / 2 - 0.05, 0.9, s * (Wd / 2 - 0.25)); // headlamps
    box(0.06, 0.12, 0.3, M.solid('#8a1010', { roughness: 0.3 }), -L / 2 + 0.02, 0.95, s * (Wd / 2 - 0.2)); // tail lamps
    for (const x of [wb / 2 + 0.2, -wb / 2 + 0.2]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr, 0.27, 28), M.black);
      w.rotation.x = Math.PI / 2;
      w.position.set(x, wr, s * (Wd / 2 - 0.1));
      w.castShadow = true;
      g.add(w);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(wr * 0.55, wr * 0.55, 0.28, 20), M.steel);
      hub.rotation.x = Math.PI / 2;
      hub.position.copy(w.position);
      g.add(hub);
    }
  }
  return g;
}

// car: { x, z, y, heading } parking spot (heading = rotation about y; the car's front is its local +x)
export function buildScaleRefs(M, { car }) {
  const g = new THREE.Group();
  const v = suv(M.solid('#e8e9ea', { metalness: 0.6, roughness: 0.35 }), M);
  v.position.set(car.x, car.y, car.z);
  v.rotation.y = car.heading;
  g.add(v);
  return g;
}
