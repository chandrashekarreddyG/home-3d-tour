import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PLANS, TOUR_ORDER } from './plans.js';
import { NORTH_UV, SITE_TITLE, SITE_LOCATION } from './site.js';
import { buildModel, CEIL } from './build.js';
import { makeMaterials, FLOORS, FLOOR_DEFAULT } from './materials.js';
import { LIGHTS, LIGHT_TEMPS } from './lighting.js';
import { inRect, rectDist } from './nav.js';
import { validate, toHTML, toMarkdown, summarise } from './verify.js';
import { sunPosition, istDate } from './sun.js';
import { ELEVATIONS } from './elevation.js';
import { createMusic } from './music.js';

const EYE = 1.6; // m
const GLIDE = 2.0; // m/s
const WALK = 1.4; // m/s
const RADIUS = 0.22; // body radius for collisions
const $ = (id) => document.getElementById(id);
const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;

// ---------- renderer / scene ----------
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping; // Khronos PBR Neutral: keeps material colours faithful
renderer.toneMappingExposure = 1.0;
const labelRenderer = new CSS2DRenderer({ element: $('labels') });
const scene = new THREE.Scene();
scene.background = new THREE.Color('#cfdce6');
new RGBELoader().load('textures/sky_2k.hdr', (tex) => {
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
  scene.environment = tex;
  applySun();
});
const M = makeMaterials(renderer);
// shiny interior fittings reflect a neutral studio room, not the outdoor sky
{
  const roomEnv = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  for (const k of ['chrome', 'steel', 'porcelain', 'screen']) { M[k].envMap = roomEnv; M[k].envMapIntensity = 0.7; }
}

const hemi = new THREE.HemisphereLight('#dfe9f2', '#8a7a64', 0.25);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff3e0', 4);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.bias = -0.0002;
sun.shadow.normalBias = 0.02;
sun.shadow.radius = 3;
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 120 });
scene.add(sun, sun.target);
// a fixed pool of warm interior lights, moved to the downlights nearest the camera
const pool = Array.from({ length: 6 }, () => {
  const l = new THREE.PointLight('#ffd7a8', 0, 7, 2);
  scene.add(l);
  return l;
});

const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 2000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 3;
controls.maxDistance = 400;

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, 1, 1);
gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.5, thickness: 1, scale: 1.2, samples: 16, distanceFallOff: 1 });
gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
gtao.blendIntensity = 1;
composer.addPass(gtao);
composer.addPass(new OutputPass());

// ---------- state ----------
let MD = null; // current model
let mode = 'orbit'; // orbit | fly | walk
const walker = { x: 0, z: 0, y: EYE, yaw: 0, pitch: 0 };
let anim = null, touring = false, lastOrbit = null, walkFov = 55;
const keys = new Set();
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const dampAngle = (a, b, k, dt) => a + wrap(b - a) * (1 - Math.exp(-k * dt));
const yawOf = (dx, dz) => Math.atan2(-dx, -dz);
const quatOf = (yaw, pitch) => new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
function runAnim(a) { cancelAnim(); return new Promise((res) => { a.resolve = res; anim = a; }); }
function cancelAnim() { if (!anim) return; const r = anim.resolve; anim = null; r(false); }

// ---------- sun (true position for the site) ----------
const northWorld = new THREE.Vector2(-NORTH_UV[0], -NORTH_UV[1]).normalize(); // survey north in plan axes (x, z)
const eastWorld = new THREE.Vector2(-northWorld.y, northWorld.x);
let sunState = { el: 0.8, az: 2.5 };
function applySun() {
  const date = istDate($('sunDate').value, Number($('sunTime').value));
  const { az, el } = sunPosition(date, SITE_LOCATION.lat, SITE_LOCATION.lon);
  sunState = { az, el };
  const h = Math.cos(el);
  const dir = new THREE.Vector3(
    h * (Math.cos(az) * northWorld.x + Math.sin(az) * eastWorld.x),
    Math.sin(el),
    h * (Math.cos(az) * northWorld.y + Math.sin(az) * eastWorld.y),
  ).normalize();
  const c = MD ? [(MD.building[0] + MD.building[2]) / 2, (MD.building[1] + MD.building[3]) / 2] : [6, 7];
  sun.target.position.set(c[0], 0, c[1]);
  sun.position.set(c[0] + dir.x * 60, dir.y * 60, c[1] + dir.z * 60);
  const day = THREE.MathUtils.smoothstep(Math.sin(el), -0.02, 0.18);
  sun.intensity = 4.2 * THREE.MathUtils.smoothstep(Math.sin(el), 0.0, 0.12);
  sun.color.setHSL(0.09, 0.6 * (1 - day) + 0.25, 0.75 + 0.2 * day);
  sun.visible = el > 0;
  scene.environmentIntensity = 0.08 + 0.62 * day;
  scene.backgroundIntensity = 0.08 + 0.92 * day;
  hemi.intensity = 0.05 + 0.25 * day;
  night = day < 0.3;
  M.lamp.emissiveIntensity = night ? 6 : 2;
  M.shade.emissiveIntensity = night ? 1.6 : 0.3;
  M.glow.opacity = night ? 0.85 : 0.12; // wall-washer halos only read after dark
  M.glowFan.opacity = night ? 0.8 : 0.08;
  const mins = Number($('sunTime').value);
  const hh = String(Math.floor(mins / 60)).padStart(2, '0'), mm = String(mins % 60).padStart(2, '0');
  const deg = (r) => Math.round((r * 180) / Math.PI);
  $('sunInfo').textContent = `${hh}:${mm} IST · sun ${el > 0 ? `${deg(el)}° high, ${deg(az)}° from N` : 'below horizon (lights on)'}`;
}
let night = false;

// ---------- plan loading ----------
function loadPlan(id) {
  stopTour();
  cancelAnim();
  const plan = PLANS.find((p) => p.id === id) || PLANS[1];
  if (MD) {
    scene.remove(MD.root);
    MD.root.traverse((o) => {
      if (o.isMesh) o.geometry.dispose();
      if (o.getRenderTarget) o.dispose(); // mirrors (Reflector) own a render target
      if (o.isCSS2DObject) o.element.remove();
    });
  }
  MD = buildModel(plan, M, (room) => { stopTour(); goToRoom(room); });
  scene.add(MD.root);
  history.replaceState(null, '', '#' + plan.id);
  document.querySelectorAll('#plans button').forEach((b) => b.classList.toggle('on', b.dataset.id === plan.id));
  $('planNote').textContent = plan.note;
  renderRoomList();
  setMode('orbit');
  houseView(false);
  applySun();
  applyElevation();
  applyFloor();
  applyLighting();
  drawMinimap();
  report = null;
  const v = getReport();
  $('verifySummary').textContent = summarise(v);
}
let report = null;
function getReport() { if (!report) report = validate(MD); return report; }

function houseView(animate = true) {
  const [x0, z0, x1, z1] = MD.building;
  const c = new THREE.Vector3((x0 + x1) / 2 - 0.6, 0, (z0 + z1) / 2 + 1);
  const D = Math.max(x1 - x0, z1 - z0) * Math.max(1, 1.1 / camera.aspect);
  return orbitTo(c.clone().add(new THREE.Vector3(-0.4 * D, 1.15 * D, 1.05 * D)), c, animate);
}
function planView() {
  const [x0, z0, x1, z1] = MD.building;
  const c = new THREE.Vector3((x0 + x1) / 2 - 0.6, 0, (z0 + z1) / 2 + 1);
  const D = Math.max(x1 - x0, (z1 - z0) * camera.aspect) * 1.25;
  return orbitTo(c.clone().add(new THREE.Vector3(0, D * 1.2, 0.01)), c, true);
}
function siteView() {
  const [x0, z0, x1, z1] = MD.site.bounds;
  const c = new THREE.Vector3((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const D = Math.max(x1 - x0, z1 - z0) * Math.max(1, 0.9 / camera.aspect);
  return orbitTo(c.clone().add(new THREE.Vector3(-0.35 * D, 0.95 * D, 0.75 * D)), c, true);
}
async function orbitTo(pos, target, animate) {
  stopTour();
  if (mode !== 'orbit') { await exitWalk(pos, target); return; }
  if (!animate) { camera.position.copy(pos); controls.target.copy(target); controls.update(); return; }
  const p0 = camera.position.clone(), t0 = controls.target.clone();
  let t = 0;
  controls.enabled = false;
  await runAnim({ update(dt) {
    t = Math.min(1, t + dt / 1.4);
    const e = ease(t);
    camera.position.lerpVectors(p0, pos, e);
    controls.target.lerpVectors(t0, target, e);
    camera.lookAt(controls.target);
    return t >= 1;
  } });
  controls.enabled = true;
  controls.update();
}

// ---------- modes ----------
function setMode(m) {
  mode = m;
  document.body.dataset.mode = m;
  const inside = m !== 'orbit';
  controls.enabled = m === 'orbit';
  MD.ceilings.visible = inside;
  MD.markers.visible = m === 'walk';
  MD.labels.visible = !inside;
  MD.siteLabels.visible = !inside;
  MD.roof.visible = !inside && ($('chkRoof').checked || elev.on);
  hoverDisc.visible = false;
  MD.rooms.forEach((r) => (r.highlight.visible = false));
  $('hint').textContent = m === 'walk'
    ? 'Click the floor to glide · drag to look · W A S D / arrows to walk · Esc for overview'
    : 'Drag to orbit · scroll to zoom · right-drag to pan · click a room to step inside';
  updateWhere();
}

async function enterWalk(x, z, yaw, pitch = 0) {
  if (mode === 'orbit') lastOrbit = { pos: camera.position.clone(), target: controls.target.clone() };
  setMode('fly');
  const y = MD.floorY(x, z) + EYE;
  const p0 = camera.position.clone(), q0 = camera.quaternion.clone();
  const p1 = new THREE.Vector3(x, y, z), q1 = quatOf(yaw, pitch);
  let t = 0;
  const ok = await runAnim({ fly: true, update(dt) {
    t = Math.min(1, t + dt / 1.9);
    const e = ease(t);
    camera.position.lerpVectors(p0, p1, e);
    camera.quaternion.slerpQuaternions(q0, q1, Math.min(1, e * 1.15));
    return t >= 1;
  } });
  Object.assign(walker, { x, z, y, yaw, pitch });
  setMode('walk');
  return ok;
}
async function exitWalk(pos, target) {
  stopTour();
  const dest = pos ? { pos, target } : lastOrbit;
  setMode('fly');
  const p0 = camera.position.clone(), q0 = camera.quaternion.clone();
  const tgt = dest ? dest.target : new THREE.Vector3(walker.x, 0, walker.z);
  const p1 = dest ? dest.pos : tgt.clone().add(new THREE.Vector3(-5, 16, 14));
  const q1 = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(p1, tgt, new THREE.Vector3(0, 1, 0)));
  let t = 0;
  await runAnim({ fly: true, update(dt) {
    t = Math.min(1, t + dt / 1.7);
    const e = ease(t);
    camera.position.lerpVectors(p0, p1, e);
    camera.quaternion.slerpQuaternions(q0, q1, e);
    return t >= 1;
  } });
  camera.position.copy(p1);
  controls.target.copy(tgt);
  setMode('orbit');
  controls.update();
}

// ---------- navigation ----------
function walkPath(pts, finalYaw, finalPitch = 0) {
  let i = 0;
  return runAnim({ update(dt) {
    let step = GLIDE * dt * (keys.has('Shift') ? 2 : 1);
    while (step > 0 && i < pts.length) {
      const [tx, tz] = pts[i];
      const dx = tx - walker.x, dz = tz - walker.z, d = Math.hypot(dx, dz);
      if (d <= step) { walker.x = tx; walker.z = tz; step -= d; i++; } else { walker.x += (dx / d) * step; walker.z += (dz / d) * step; step = 0; }
    }
    if (i < pts.length) {
      const [tx, tz] = pts[i];
      const dx = tx - walker.x, dz = tz - walker.z;
      if (Math.hypot(dx, dz) > 0.12) walker.yaw = dampAngle(walker.yaw, yawOf(dx, dz), 4.5, dt);
    }
    walker.pitch = damp(walker.pitch, -0.05, 3, dt);
    return i >= pts.length;
  } }).then((ok) => (ok && finalYaw != null ? turnTo(finalYaw, 0.9, finalPitch) : ok));
}
function turnTo(yaw, dur = 0.9, pitch = 0) {
  const y0 = walker.yaw, p0 = walker.pitch, dy = wrap(yaw - y0);
  let t = 0;
  return runAnim({ update(dt) {
    t = Math.min(1, t + dt / dur);
    const e = ease(t);
    walker.yaw = y0 + dy * e;
    walker.pitch = p0 + (pitch - p0) * e;
    return t >= 1;
  } });
}
function lookAround(dur = 6) {
  const y0 = walker.yaw;
  let t = 0;
  return runAnim({ update(dt) {
    t = Math.min(dur, t + dt);
    walker.yaw = y0 + 0.8 * Math.sin((t / dur) * Math.PI * 2);
    return t >= dur;
  } });
}
async function glideTo(x, z, finalYaw = null, finalPitch = 0) {
  if (mode === 'orbit') {
    let yaw = finalYaw;
    if (yaw == null) {
      const room = MD.roomAt(x, z);
      const c = room ? room.center : [x, z];
      if (Math.hypot(c[0] - x, c[1] - z) > 0.6) yaw = yawOf(c[0] - x, c[1] - z);
      else { const f = new THREE.Vector3(); camera.getWorldDirection(f); yaw = yawOf(f.x, f.z); }
    }
    let fx = x, fz = z;
    if (!MD.nav.ok(x, z)) { const c = MD.nav.nearest(x, z); if (c >= 0) [fx, fz] = MD.nav.center(c); }
    return enterWalk(fx, fz, yaw, finalPitch);
  }
  if (mode !== 'walk') return false;
  const pts = MD.nav.path(walker.x, walker.z, x, z);
  if (!pts) return false;
  return walkPath(pts, finalYaw, finalPitch);
}
const goToRoom = (room) => glideTo(room.view.x, room.view.z, room.view.yaw, room.view.pitch ?? 0);

// Telugu voice-over (female Indian neural voice, pre-recorded clips in audio/te/): names each room as the guided tour arrives,
// over calm generated background music that ducks while the voice speaks.
// Browsers block sound until the visitor touches the page, so a chip offers to switch it on.
const voice = new Audio();
voice.preload = 'auto';
const music = createMusic();
voice.addEventListener('play', () => music.duck(true));
for (const ev of ['ended', 'pause']) voice.addEventListener(ev, () => music.duck(false));
function sayRoom(room) {
  voice.src = `./audio/te/${room.name.toLowerCase().replace(/\s+/g, '-')}.mp3`;
  voice.play().then(() => { $('voice').hidden = music.running(); }, () => { $('voice').hidden = !touring; });
}
$('voice').addEventListener('click', () => {
  $('voice').hidden = true;
  if (!touring) return;
  music.start();
  if (voice.src) voice.play().catch(() => {});
});

async function startTour() {
  if (touring) { stopTour(); return; }
  const seq = TOUR_ORDER.map((n) => MD.rooms.find((r) => r.name === n)).filter(Boolean);
  touring = true;
  $('btnTour').classList.add('on');
  $('btnTour').textContent = '■ Stop tour';
  if (!music.start()) $('voice').hidden = false;
  for (const room of seq) {
    if (!touring) break;
    if (!(await goToRoom(room)) || !touring) break;
    sayRoom(room);
    if (!(await lookAround())) break;
  }
  stopTour();
}
function stopTour() {
  if (!touring) return;
  touring = false;
  cancelAnim();
  voice.pause();
  music.stop();
  $('voice').hidden = true;
  $('btnTour').classList.remove('on');
  $('btnTour').textContent = '▶ Guided tour';
}

// ---------- picking ----------
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let pointerDirty = false;
const hoverDisc = new THREE.Group();
{
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 48), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0.9, depthWrite: false }));
  const fill = new THREE.Mesh(new THREE.CircleGeometry(0.2, 48), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0.15, depthWrite: false }));
  ring.rotation.x = fill.rotation.x = -Math.PI / 2;
  hoverDisc.add(ring, fill);
  hoverDisc.visible = false;
  scene.add(hoverDisc);
}
function pick(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const targets = [...MD.floors, ...MD.solids, ...MD.furnMeshes];
  const hits = ray.intersectObjects(targets, false);
  const hit = mode === 'orbit' ? hits.find((h) => !h.object.userData.wall) : hits[0];
  if (!hit || hit.object.userData.wall) return null;
  const { x, z } = hit.point;
  const zone = hit.object.userData.floor || MD.roomAt(x, z) || (inRect(x, z, MD.plotRect) ? { name: 'Compound', garden: true } : null);
  if (!zone) return null;
  return { x, z, y: MD.floorY(x, z), zone };
}
let down = null;
canvas.addEventListener('pointerdown', (e) => {
  down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, lx: e.clientX, ly: e.clientY };
  if (mode === 'walk') {
    canvas.setPointerCapture(e.pointerId);
    if (anim && !anim.fly) { stopTour(); cancelAnim(); }
  } else if (mode === 'orbit' && anim) cancelAnim();
});
canvas.addEventListener('pointermove', (e) => {
  pointerDirty = { x: e.clientX, y: e.clientY };
  if (!down) return;
  if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) down.moved = true;
  if (mode === 'walk' && down.moved) {
    walker.yaw += (e.clientX - down.lx) * 0.0038;
    walker.pitch = Math.max(-1.2, Math.min(1.2, walker.pitch + (e.clientY - down.ly) * 0.0038));
  }
  down.lx = e.clientX;
  down.ly = e.clientY;
});
canvas.addEventListener('pointerup', (e) => {
  const d = down;
  down = null;
  if (!d || d.moved || performance.now() - d.t > 600 || mode === 'fly') return;
  const p = pick(e.clientX, e.clientY);
  if (!p) return;
  stopTour();
  glideTo(p.x, p.z);
});
canvas.addEventListener('pointerleave', () => { hoverDisc.visible = false; pointerDirty = false; });
canvas.addEventListener('wheel', (e) => {
  if (mode !== 'walk') return;
  e.preventDefault();
  walkFov = Math.max(30, Math.min(80, walkFov + e.deltaY * 0.03));
}, { passive: false });
function updateHover() {
  if (!pointerDirty || mode === 'fly' || (down && down.moved)) return;
  const p = pick(pointerDirty.x, pointerDirty.y);
  pointerDirty = false;
  MD.rooms.forEach((r) => (r.highlight.visible = false));
  canvas.style.cursor = p ? 'pointer' : '';
  if (!p) { hoverDisc.visible = false; return; }
  if (mode === 'orbit') { if (p.zone.highlight) p.zone.highlight.visible = true; hoverDisc.visible = false; }
  else { hoverDisc.visible = true; hoverDisc.position.set(p.x, p.y + 0.012, p.z); }
}

// ---------- keyboard walking with collisions ----------
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input,textarea,select,dialog')) return;
  if (e.key === 'Escape') { if (mode === 'walk') exitWalk(); return; }
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (['w', 'a', 's', 'd', 'q', 'e', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k) && mode === 'walk') {
    e.preventDefault();
    if (anim) { stopTour(); cancelAnim(); }
  }
  keys.add(k === 'Shift' ? 'Shift' : k);
});
addEventListener('keyup', (e) => keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
addEventListener('blur', () => keys.clear());
function canStand(x, z) {
  if (!MD.walkAreas.some((r) => inRect(x, z, r)) || inRect(x, z, MD.stairs)) return false;
  return !MD.colliders.some((c) => rectDist(x, z, c.r) < (c.wall ? RADIUS : RADIUS * 0.6));
}
function keyMove(dt) {
  let f = 0, s = 0, turn = 0;
  if (keys.has('w') || keys.has('ArrowUp')) f += 1;
  if (keys.has('s') || keys.has('ArrowDown')) f -= 1;
  if (keys.has('d')) s += 1;
  if (keys.has('a')) s -= 1;
  if (keys.has('ArrowLeft') || keys.has('q')) turn += 1;
  if (keys.has('ArrowRight') || keys.has('e')) turn -= 1;
  if (!f && !s && !turn) return;
  walker.yaw += turn * 1.6 * dt;
  const sp = WALK * dt * (keys.has('Shift') ? 2 : 1);
  const fx = -Math.sin(walker.yaw), fz = -Math.cos(walker.yaw);
  const dx = (fx * f - fz * s) * sp, dz = (fz * f + fx * s) * sp;
  if (canStand(walker.x + dx, walker.z + dz)) { walker.x += dx; walker.z += dz; }
  else if (canStand(walker.x + dx, walker.z)) walker.x += dx;
  else if (canStand(walker.x, walker.z + dz)) walker.z += dz;
}

// ---------- interior light pool ----------
const finish = { floor: 'asbuilt', light: 'down', temp: '2700' };
const LIGHT_GAIN = { down: 1, profile: 1, cove: 1.15, pendant: 0.75 };
function updateLights() {
  const cur = mode === 'orbit' ? null : MD.roomAt(walker.x, walker.z);
  const px = mode === 'orbit' ? controls.target.x : walker.x, pz = mode === 'orbit' ? controls.target.z : walker.z;
  const cands = [];
  for (const r of MD.rooms) for (const [x, y, z] of r.lightPts[finish.light]) cands.push({ x, y, z, d: Math.hypot(x - px, z - pz) - (r === cur ? 100 : 0) });
  cands.sort((a, b) => a.d - b.d);
  const on = mode !== 'orbit';
  pool.forEach((l, i) => {
    const c = cands[i];
    if (!c || !on) { l.intensity = 0; return; }
    l.position.set(c.x, c.y, c.z);
    l.intensity = (night ? 6 : 2.6) * LIGHT_GAIN[finish.light];
  });
}

// ---------- interior finishes: flooring + lighting designs ----------
function applyFloor() {
  const f = FLOORS.find((q) => q.id === finish.floor);
  const key = (k) => f.map[k] || FLOOR_DEFAULT[k];
  for (const m of MD.floors) {
    const r = m.userData.floor;
    if (r && r.finish) m.material = M[key(r.finish)];
  }
  for (const s of MD.skirts) s.mesh.material = s.finish === 'wood' && key('wood') === 'wood' ? M.walnut : M[key(s.finish === 'wood' ? 'wood' : s.finish)] || M.tile;
  document.querySelectorAll('#floors button').forEach((b) => b.classList.toggle('on', b.dataset.id === finish.floor));
  $('floorNote').textContent = f.blurb;
}
function applyLighting() {
  for (const [id, g] of Object.entries(MD.lighting)) g.visible = id === finish.light;
  const col = LIGHT_TEMPS.find((t) => t.id === finish.temp).color;
  M.lamp.emissive.set(col);
  M.shade.emissive.set(col);
  M.glow.color.set(col);
  M.glowFan.color.set(col);
  pool.forEach((l) => l.color.set(col));
  document.querySelectorAll('#lights button').forEach((b) => b.classList.toggle('on', b.dataset.id === finish.light));
  document.querySelectorAll('#temps button').forEach((b) => b.classList.toggle('on', b.dataset.id === finish.temp));
  $('lightNote').textContent = LIGHTS.find((q) => q.id === finish.light).blurb;
  updateLights();
}
const optionButtons = (el, list, onPick) => {
  for (const o of list) {
    const b = document.createElement('button');
    b.dataset.id = o.id;
    b.textContent = o.name;
    b.addEventListener('click', () => onPick(o.id));
    $(el).append(b);
  }
};
// lighting reads best after sunset: switch the clock to the evening when a design is picked in daylight
const toEvening = () => { if (!night) { $('sunTime').value = String(19 * 60 + 15); applySun(); } };
optionButtons('floors', FLOORS, (id) => { finish.floor = id; applyFloor(); });
optionButtons('lights', LIGHTS, (id) => { finish.light = id; applyLighting(); toEvening(); });
optionButtons('temps', LIGHT_TEMPS, (id) => { finish.temp = id; applyLighting(); toEvening(); });

// ---------- UI ----------
function renderRoomList() {
  const ul = $('rooms');
  ul.innerHTML = '';
  const order = (r) => { const i = TOUR_ORDER.indexOf(r.name); return i < 0 ? 99 : i; };
  for (const room of [...MD.rooms].filter((r) => r.tour).sort((a, b) => order(a) - order(b))) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.innerHTML = `<span>${room.name}</span><small>${room.label}</small>`;
    b.addEventListener('click', () => { stopTour(); goToRoom(room); closePanelOnMobile(); });
    room.button = b;
    li.append(b);
    ul.append(li);
  }
}
let whereRoom = null;
function updateWhere() {
  if (!MD) return;
  const room = mode === 'orbit' ? null : MD.roomAt(walker.x, walker.z) || (inRect(walker.x, walker.z, MD.plotRect) ? { name: 'Compound', label: '' } : null);
  if (mode === 'orbit') $('where').innerHTML = `<b>${MD.plan.short}</b><span>${SITE_TITLE}</span>`;
  else if ((room && room.name) !== (whereRoom && whereRoom.name)) $('where').innerHTML = room ? `<b>${room.name}</b><span>${room.label || ''}</span>` : '';
  whereRoom = mode === 'orbit' ? null : room;
  MD.rooms.forEach((r) => r.button && r.button.classList.toggle('on', r === whereRoom));
}
for (const p of PLANS) {
  const b = document.createElement('button');
  b.dataset.id = p.id;
  b.textContent = p.short;
  b.title = p.name;
  b.addEventListener('click', () => loadPlan(p.id));
  $('plans').append(b);
}
$('btnSite').addEventListener('click', () => siteView());
$('btnHouse').addEventListener('click', () => houseView(true));
$('btnPlan').addEventListener('click', () => planView());
$('btnWalk').addEventListener('click', () => { stopTour(); goToRoom(MD.rooms.find((r) => r.name === 'Front Balcony')); });
$('btnTour').addEventListener('click', () => startTour());
$('chkRoof').addEventListener('change', () => { MD.roof.visible = mode === 'orbit' && ($('chkRoof').checked || elev.on); });

// elevation ideas (road-facing sides)
const elev = { on: true, id: 'frame' }; // landing page shows the Floating frame design
let lastStyle = null;
for (const e of ELEVATIONS.filter((q) => q.id !== 'none')) {
  if (e.style !== lastStyle) {
    const h = document.createElement('span');
    h.className = 'seg-label';
    h.textContent = { Modern: 'Modern · subtle colours', Reference: 'Inspired by your photos' }[e.style];
    $('elevs').append(h);
    lastStyle = e.style;
  }
  const b = document.createElement('button');
  b.dataset.id = e.id;
  b.textContent = e.name;
  b.addEventListener('click', () => { elev.id = e.id; elev.on = true; applyElevation(); showFacade(); });
  $('elevs').append(b);
}
$('chkElev').addEventListener('change', () => { elev.on = $('chkElev').checked; applyElevation(); if (elev.on) showFacade(); });
// the elevation is on the outside: if you're inside or looking straight down, fly out to the street to see it
function showFacade() {
  if (mode !== 'orbit' || camera.position.y > 25) $('btnStreet').click();
}
$('btnFront').addEventListener('click', () => {
  // square-on view of the G.P Road facade from across the road, slightly raised so the compound wall doesn't hide the plinth
  const x0 = MD.site ? MD.walkAreas.reduce((a, r) => Math.min(a, r[0]), 0) : 0;
  const cx = (Math.max(x0, MD.plotRect[0]) + MD.building[2]) / 2;
  const shift = document.body.classList.contains('panel-open') && innerWidth > 760 ? 1.6 : 0; // keep the house clear of the side panel
  orbitTo(new THREE.Vector3(cx - shift, 3.0, MD.plotRect[3] + 9.5), new THREE.Vector3(cx - shift, 2.2, MD.building[3]), true);
});
$('btnSide').addEventListener('click', () => {
  // square-on view of the 21 ft road facade from across that road, rear tower to front corner
  const shift = document.body.classList.contains('panel-open') && innerWidth > 760 ? 2.2 : 0; // keep the house clear of the side panel
  const cz = (MD.building[1] - 0.6 + MD.plotRect[3] - 1.5) / 2 - shift;
  orbitTo(new THREE.Vector3(MD.plotRect[0] - 15, 3.2, cz), new THREE.Vector3(MD.building[0], 2.4, cz), true);
});
$('btnStreet').addEventListener('click', () => {
  // eye-level view from the corner of G.P Road and the 21 ft road, looking at both road-facing sides
  const c = new THREE.Vector3(MD.building[2] * 0.45, 2.2, MD.building[3] * 0.6);
  orbitTo(new THREE.Vector3(MD.plotRect[0] - 7, 1.7, MD.plotRect[3] + 7), c, true);
});
function applyElevation() {
  const e = ELEVATIONS.find((q) => q.id === (elev.on ? elev.id : 'none'));
  for (const [id, g] of Object.entries(MD.elevations)) g.visible = elev.on && id === elev.id;
  // designs that bring their own boundary replace the plain wall + railing on the two road sides
  for (const side of ['s', 'w']) MD.compound[side].visible = !(elev.on && e.fence);
  M.paintExt.color.set(e.paint);
  $('chkElev').checked = elev.on;
  $('elevs').classList.toggle('off', !elev.on);
  document.querySelectorAll('#elevs button').forEach((b) => b.classList.toggle('on', b.dataset.id === elev.id));
  $('elevNote').textContent = elev.on ? ELEVATIONS.find((q) => q.id === elev.id).blurb : 'Showing the house as drawn. Pick an idea above to preview it.';
  if (mode === 'orbit') MD.roof.visible = $('chkRoof').checked || elev.on;
}
$('chkDims').addEventListener('change', () => { MD.dims.visible = $('chkDims').checked; });
$('chkHQ').addEventListener('change', () => setQuality($('chkHQ').checked));
$('panelToggle').addEventListener('click', () => document.body.classList.toggle('panel-open'));
function closePanelOnMobile() { if (innerWidth < 760) document.body.classList.remove('panel-open'); }
function setQuality(hq) {
  gtao.enabled = hq;
  renderer.setPixelRatio(Math.min(devicePixelRatio, hq ? 1.75 : 1));
  resize();
}

// sun controls
{
  const now = new Date(Date.now() + 330 * 60000); // IST
  $('sunDate').value = now.toISOString().slice(0, 10);
  $('sunTime').value = String(10 * 60 + 30);
  $('sunDate').addEventListener('input', applySun);
  $('sunTime').addEventListener('input', applySun);
}
// site location
{
  const { lat, lon, dms } = SITE_LOCATION;
  const a = $('siteLink');
  a.textContent = dms;
  a.href = `https://www.google.com/maps?q=${lat.toFixed(6)},${lon.toFixed(6)}`;
}

// drawings
const drawings = [...PLANS.map((p) => ({ id: p.id, name: p.short, src: p.image })), { id: 'site', name: 'Site map', src: 'plans/site-map.jpg' }];
for (const d of drawings) {
  const b = document.createElement('button');
  b.textContent = d.name;
  b.dataset.id = d.id;
  b.addEventListener('click', () => showDrawing(d.id));
  $('drawingTabs').append(b);
}
function showDrawing(id) {
  const d = drawings.find((q) => q.id === id);
  $('drawingImg').src = d.src;
  $('drawingImg').alt = d.name;
  document.querySelectorAll('#drawingTabs button').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
  if (!$('drawing').open) $('drawing').showModal();
}
$('btnDrawing').addEventListener('click', () => showDrawing(MD.plan.id));
$('drawingClose').addEventListener('click', () => $('drawing').close());
$('drawing').addEventListener('click', (e) => { if (e.target === $('drawing')) $('drawing').close(); });

// measurement report
function showReport() {
  $('reportTitle').textContent = `Measurement validation — ${MD.plan.name}`;
  $('reportBody').innerHTML = toHTML(getReport());
  if (!$('report').open) $('report').showModal();
}
$('btnReport').addEventListener('click', showReport);
$('verifySummary').addEventListener('click', showReport);
$('reportClose').addEventListener('click', () => $('report').close());
$('reportDownload').addEventListener('click', () => {
  const blob = new Blob([`# Measurement validation\n\n${toMarkdown(getReport())}`], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `measurement-validation-${MD.plan.id}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
});
// used to regenerate VALIDATION.md from the live model
window.measurementReport = () => toMarkdown(getReport());

// ---------- minimap ----------
const mm = $('minimap');
const mctx = mm.getContext('2d');
let mmT = null;
const finishColor = { tile: '#efe5d3', kitchen: '#e5dccd', bath: '#d4d0c6', wood: '#d6b58f', marble: '#f6f3ee', stone: '#c9c2b6' };
function drawMinimap() {
  const dpr = Math.min(devicePixelRatio, 2);
  const W = mm.clientWidth, H = mm.clientHeight;
  mm.width = W * dpr; mm.height = H * dpr;
  const [x0, z0, x1, z1] = MD.plotRect;
  const pad = 10;
  const sc = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (z1 - z0));
  const ox = (W - (x1 - x0) * sc) / 2 - x0 * sc, oz = (H - (z1 - z0) * sc) / 2 - z0 * sc;
  mmT = { sc, ox, oz };
  const g = mctx;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);
  const rr = (r, fill) => { g.fillStyle = fill; g.fillRect(r[0] * sc + ox, r[1] * sc + oz, (r[2] - r[0]) * sc, (r[3] - r[1]) * sc); };
  rr(MD.plotRect, 'rgba(200,190,170,0.5)');
  for (const room of MD.rooms) for (const r of room.rects) rr(r, room === whereRoom ? '#ffd166' : finishColor[room.finish]);
  for (const r of MD.mini.walls) rr(r, '#3b3a37');
  for (const r of MD.mini.windows) rr(r, '#6fb3d6');
  if (mode !== 'orbit') {
    const px = walker.x * sc + ox, pz = walker.z * sc + oz;
    const a = Math.atan2(-Math.cos(walker.yaw), -Math.sin(walker.yaw));
    g.fillStyle = 'rgba(255,183,3,0.35)';
    g.beginPath(); g.moveTo(px, pz); g.arc(px, pz, 26, a - 0.55, a + 0.55); g.closePath(); g.fill();
    g.fillStyle = '#ff7b00'; g.strokeStyle = '#fff'; g.lineWidth = 2;
    g.beginPath(); g.arc(px, pz, 5, 0, Math.PI * 2); g.fill(); g.stroke();
  }
  const cx = W - 20, cy = 20;
  g.save(); g.translate(cx, cy); g.rotate(Math.atan2(northWorld.x, -northWorld.y));
  g.fillStyle = '#d9362b';
  g.beginPath(); g.moveTo(0, -11); g.lineTo(6, 7); g.lineTo(0, 3); g.lineTo(-6, 7); g.closePath(); g.fill();
  g.restore();
}
mm.addEventListener('click', (e) => {
  if (!mmT || mode === 'fly') return;
  const r = mm.getBoundingClientRect();
  const x = (e.clientX - r.left - mmT.ox) / mmT.sc, z = (e.clientY - r.top - mmT.oz) / mmT.sc;
  if (!inRect(x, z, MD.plotRect)) return;
  stopTour();
  glideTo(x, z);
});
function updateCompass() {
  const f = new THREE.Vector3();
  camera.getWorldDirection(f);
  const fl = Math.hypot(f.x, f.z) || 1, fx = f.x / fl, fz = f.z / fl;
  const up = northWorld.x * fx + northWorld.y * fz, right = northWorld.x * -fz + northWorld.y * fx;
  $('compass').style.transform = `rotate(${Math.atan2(right, up)}rad)`;
}

// ---------- loop ----------
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(w, h);
  labelRenderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (MD) drawMinimap();
}
addEventListener('resize', resize);
const clock = new THREE.Clock();
let slowTimer = 0;
function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  if (anim) { const a = anim; if (a.update(dt) && anim === a) { anim = null; a.resolve(true); } }
  if (mode === 'walk') {
    if (!anim) keyMove(dt);
    walker.y = damp(walker.y, MD.floorY(walker.x, walker.z) + EYE, 8, dt);
    camera.position.set(walker.x, walker.y, walker.z);
    camera.quaternion.copy(quatOf(walker.yaw, walker.pitch));
  } else if (mode === 'orbit') {
    controls.update();
    const dist = camera.position.distanceTo(controls.target);
    MD.labels.visible = dist < 55 && camera.position.y > 5 && !$('chkDims').checked; // street level / dimension overlay: no room tags
    MD.siteLabels.visible = dist > 45;
  }
  const fov = mode === 'orbit' ? 45 : walkFov;
  if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = damp(camera.fov, fov, 3, dt); camera.updateProjectionMatrix(); }
  for (const r of MD.fans) r.rotation.y += dt * 5;
  updateHover();
  updateCompass();
  slowTimer += dt;
  if (slowTimer > 0.15) { slowTimer = 0; updateWhere(); drawMinimap(); updateLights(); }
  composer.render(dt);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(frame);
}

if (innerWidth < 760) document.body.classList.remove('panel-open');
$('chkHQ').checked = !mobile;
gtao.enabled = !mobile;
resize();
loadPlan((location.hash || '#p1').slice(1));
$('loading').remove();
frame();
// landing: the street corner with the roof and elevation, then the guided walk-in tour starts by itself
// (unless the visitor has already taken over by clicking, scrolling or using the keyboard)
{
  let acted = false;
  const took = (e) => { if (!(e.target.closest && e.target.closest('#voice'))) acted = true; };
  const evs = ['pointerdown', 'keydown', 'wheel'];
  evs.forEach((ev) => addEventListener(ev, took, true));
  $('btnStreet').click();
  setTimeout(() => {
    evs.forEach((ev) => removeEventListener(ev, took, true));
    if (!acted && !touring && mode === 'orbit') startTour();
  }, 4500);
}
