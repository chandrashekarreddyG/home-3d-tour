// Scale reference: a full-size five-door SUV parked on the 21 ft road beside the house. Without a familiar object
// nearby the eye reads a correctly sized house as a model; the car gives it its true size without touching any
// dimension. Model: Innerscene "Sage five-door crossover SUV" (CC0, real-world scale), meshopt-compressed to
// models/suv.glb, scaled uniformly to a Fortuner-class 4795 mm length (about 1.82 m tall, 1.86 m body width).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const LENGTH = 4.795; // m, bumper to bumper
let model = null; // one download shared by every plan

function loadSuv() {
  model ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('models/suv.glb').then((gltf) => {
    const car = gltf.scene;
    car.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = o.receiveShadow = true;
      const m = o.material;
      if (m.name === 'paint') {
        // pearl white, the usual Indian SUV colour, under a clear coat
        o.material = new THREE.MeshPhysicalMaterial({ color: '#eceeef', roughness: 0.32, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08 });
      } else if (m.name.startsWith('glass')) {
        // dark tinted glass without the transmission pass (cheaper and reads correctly from outside)
        o.material = new THREE.MeshPhysicalMaterial({ color: '#1b2328', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.82, clearcoat: 1 });
      }
    });
    // ground at y 0, centred on its footprint, front of the car towards local +x (this model's nose is at -x)
    const box = new THREE.Box3().setFromObject(car), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const s = LENGTH / size.x;
    const fit = new THREE.Group();
    car.position.set(-c.x, -box.min.y, -c.z);
    fit.add(car);
    fit.scale.setScalar(s);
    fit.rotation.y = Math.PI;
    return fit;
  });
  return model;
}

// car: { x, z, y, heading } parking spot (heading = rotation about y; the car's front is its local +x)
export function buildScaleRefs({ car }) {
  const g = new THREE.Group();
  const spot = new THREE.Group();
  spot.position.set(car.x, car.y, car.z);
  spot.rotation.y = car.heading;
  g.add(spot);
  loadSuv().then((fit) => spot.add(fit.clone(true)), (e) => console.warn('scale car not loaded', e));
  return g;
}
