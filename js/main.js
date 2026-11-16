import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PLANS, TOUR_ORDER } from './plans.js';
import { NORTH_UV, SITE_TITLE } from './site.js';
import { buildModel, WALL_H } from './build.js';
import { inRect, rectDist } from './nav.js';

const EYE = 5.25;
const SPEED = 7.5; // ft/s glide speed
const $ = (id) => document.getElementById(id);

// ---------- renderer / scene ----------
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const labelRenderer = new CSS2DRenderer({ element: $('labels') });

const scene = new THREE.Scene();
scene.background = new THREE.Color('#dce7ef');
scene.fog = new THREE.Fog('#dce7ef', 400, 1100);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.45;

const hemi = new THREE.HemisphereLight('#ffffff', '#b9a98e', 1.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff6e8', 2.4);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.04;
Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 300 });
scene.add(sun, sun.target);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 3000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 12;
controls.maxDistance = 700;

// ---------- state ----------
let M = null; // current model
let mode = 'orbit'; // orbit | fly | walk
const walker = { x: 0, z: 0, y: EYE, yaw: 0, pitch: 0 };
let anim = null;
let touring = false;
let lastOrbit = null;
const keys = new Set();

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const dampAngle = (a, b, k, dt) => a + wrap(b - a) * (1 - Math.exp(-k * dt));
const yawOf = (dx, dz) => Math.atan2(-dx, -dz);
const quatOf = (yaw, pitch) => new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));

function runAnim(a) {
  cancelAnim();
  return new Promise((res) => { a.resolve = res; anim = a; });
}
function cancelAnim() {
  if (!anim) return;
  const r = anim.resolve;
  anim = null;
  r(false);
}

// ---------- plan loading ----------
function loadPlan(id) {
  stopTour();
  cancelAnim();
  const plan = PLANS.find((p) => p.id === id) || PLANS[1];
  if (M) {
    scene.remove(M.root);
    M.root.traverse((o) => {
      if (o.isMesh) o.geometry.dispose();
      if (o.isCSS2DObject) o.element.remove();
    });
  }
  M = buildModel(plan, renderer, (room) => { stopTour(); goToRoom(room); });
  scene.add(M.root);
  const [x0, z0, x1, z1] = M.building;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  sun.position.set(cx - 60, 110, cz + 45);
  sun.target.position.set(cx, 0, cz);
  history.replaceState(null, '', '#' + plan.id);
  document.querySelectorAll('#plans button').forEach((b) => b.classList.toggle('on', b.dataset.id === plan.id));
  $('planNote').textContent = plan.note;
  renderRoomList();
  setMode('orbit');
  houseView(false);
  drawMinimap();
}

function houseView(animate = true) {
  const [x0, z0, x1, z1] = M.building;
  const c = new THREE.Vector3((x0 + x1) / 2, 0, (z0 + z1) / 2 + 3);
  const D = Math.max(x1 - x0, z1 - z0) * Math.max(1, 1.15 / camera.aspect);
  const pos = c.clone().add(new THREE.Vector3(-0.35 * D, 1.15 * D, 1.05 * D));
  return orbitTo(pos, c, animate);
}
function siteView() {
  const [x0, z0, x1, z1] = M.site.bounds;
  const c = new THREE.Vector3((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const D = Math.max(x1 - x0, z1 - z0) * Math.max(1, 0.9 / camera.aspect);
  const pos = c.clone().add(new THREE.Vector3(-0.35 * D, 0.95 * D, 0.75 * D));
  return orbitTo(pos, c, true);
}
async function orbitTo(pos, target, animate) {
  stopTour();
  if (mode === 'walk' || mode === 'fly') { await exitWalk(pos, target); return; }
  if (!animate) {
    camera.position.copy(pos);
    controls.target.copy(target);
    controls.update();
    return;
  }
  const p0 = camera.position.clone(), t0 = controls.target.clone();
  let t = 0;
  const dur = 1.4;
  controls.enabled = false;
  await runAnim({ update(dt) {
    t = Math.min(1, t + dt / dur);
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
  const walkish = m !== 'orbit';
  controls.enabled = m === 'orbit';
  M.ceilings.visible = walkish;
  camera.near = walkish ? 0.1 : 1;
  camera.updateProjectionMatrix();
  M.markers.visible = m === 'walk';
  M.labels.visible = !walkish;
  M.siteLabels.visible = !walkish;
  M.roof.visible = !walkish && $('chkRoof').checked;
  hoverDisc.visible = false;
  M.rooms.forEach((r) => (r.highlight.visible = false));
  $('hint').textContent = m === 'walk'
    ? 'Click the floor to glide there · drag to look around · W A S D / arrows to walk · Esc for overview'
    : 'Drag to orbit · scroll to zoom · right-drag to pan · click any room to glide inside';
  updateWhere();
}

async function enterWalk(x, z, yaw, pitch = 0) {
  if (mode === 'orbit') {
    lastOrbit = { pos: camera.position.clone(), target: controls.target.clone() };
  }
  setMode('fly');
  const y = M.floorY(x, z) + EYE;
  const p0 = camera.position.clone(), q0 = camera.quaternion.clone();
  const p1 = new THREE.Vector3(x, y, z), q1 = quatOf(yaw, pitch);
  const dur = 1.9;
  let t = 0;
  const ok = await runAnim({ fly: true, update(dt) {
    t = Math.min(1, t + dt / dur);
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
  const dest = pos ? { pos, target } : lastOrbit || null;
  setMode('fly');
  const p0 = camera.position.clone(), q0 = camera.quaternion.clone();
  const tgt = dest ? dest.target : new THREE.Vector3(walker.x, 0, walker.z);
  const p1 = dest ? dest.pos : tgt.clone().add(new THREE.Vector3(-20, 60, 55));
  const m = new THREE.Matrix4().lookAt(p1, tgt, new THREE.Vector3(0, 1, 0));
  const q1 = new THREE.Quaternion().setFromRotationMatrix(m);
  let t = 0;
  const dur = 1.7;
  await runAnim({ fly: true, update(dt) {
    t = Math.min(1, t + dt / dur);
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
    let step = SPEED * dt * (keys.has('Shift') ? 1.8 : 1);
    while (step > 0 && i < pts.length) {
      const [tx, tz] = pts[i];
      const dx = tx - walker.x, dz = tz - walker.z, d = Math.hypot(dx, dz);
      if (d <= step) { walker.x = tx; walker.z = tz; step -= d; i++; } else { walker.x += (dx / d) * step; walker.z += (dz / d) * step; step = 0; }
    }
    if (i < pts.length) {
      const [tx, tz] = pts[i];
      const dx = tx - walker.x, dz = tz - walker.z;
      if (Math.hypot(dx, dz) > 0.3) walker.yaw = dampAngle(walker.yaw, yawOf(dx, dz), 4.5, dt);
    }
    walker.pitch = damp(walker.pitch, -0.04, 3, dt);
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
    walker.yaw = y0 + 0.85 * Math.sin((t / dur) * Math.PI * 2);
    return t >= dur;
  } });
}

async function glideTo(x, z, finalYaw = null, finalPitch = 0) {
  if (mode === 'orbit') {
    const room = M.roomAt(x, z);
    let yaw = finalYaw;
    if (yaw == null) {
      const c = room ? room.center : [x, z];
      const dx = c[0] - x, dz = c[1] - z;
      if (Math.hypot(dx, dz) > 2) yaw = yawOf(dx, dz);
      else {
        const f = new THREE.Vector3();
        camera.getWorldDirection(f);
        yaw = yawOf(f.x, f.z);
      }
    }
    const c = M.nav.nearest(x, z);
    const [nx, nz] = c >= 0 ? M.nav.center(c) : [x, z];
    const fx = M.nav.ok(x, z) ? x : nx, fz = M.nav.ok(x, z) ? z : nz;
    return enterWalk(fx, fz, yaw, finalPitch);
  }
  if (mode !== 'walk') return false;
  const pts = M.nav.path(walker.x, walker.z, x, z);
  if (!pts) return false;
  return walkPath(pts, finalYaw, finalPitch);
}

function goToRoom(room) {
  return glideTo(room.view.x, room.view.z, room.view.yaw, room.view.pitch ?? 0);
}

async function startTour() {
  if (touring) { stopTour(); return; }
  const seq = TOUR_ORDER.map((n) => M.rooms.find((r) => r.name === n)).filter(Boolean);
  touring = true;
  $('btnTour').classList.add('on');
  $('btnTour').textContent = '■ Stop tour';
  for (const room of seq) {
    if (!touring) break;
    const ok = await goToRoom(room);
    if (!ok || !touring) break;
    if (!(await lookAround())) break;
  }
  stopTour();
}
function stopTour() {
  if (!touring) return;
  touring = false;
  cancelAnim();
  $('btnTour').classList.remove('on');
  $('btnTour').textContent = '▶ Guided tour';
}

// ---------- picking ----------
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let pointerDirty = false;
const hoverDisc = new THREE.Group();
{
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.72, 48), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0.9, depthWrite: false }));
  const fill = new THREE.Mesh(new THREE.CircleGeometry(0.55, 48), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0.18, depthWrite: false }));
  ring.rotation.x = fill.rotation.x = -Math.PI / 2;
  hoverDisc.add(ring, fill);
  hoverDisc.renderOrder = 5;
  hoverDisc.visible = false;
  scene.add(hoverDisc);
}

function pick(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const targets = [...M.floors, ...M.solids, ...M.furnMeshes];
  if (M.roof.visible) targets.push(...M.roof.children);
  const hits = ray.intersectObjects(targets, false);
  // From above, wall caps are thin slivers: look past them to the room floor.
  const hit = mode === 'orbit' ? hits.find((h) => !h.object.userData.wall) : hits[0];
  if (!hit || hit.object.userData.wall || M.roof.children.includes(hit.object)) return null;
  const { x, z } = hit.point;
  const zone = hit.object.userData.floor || M.roomAt(x, z) || null;
  if (!zone) return null;
  return { x, z, y: M.floorY(x, z), zone, onFloor: !!hit.object.userData.floor };
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
    walker.yaw += (e.clientX - down.lx) * 0.0042;
    walker.pitch = Math.max(-1.2, Math.min(1.2, walker.pitch + (e.clientY - down.ly) * 0.0042));
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
  walkFov = Math.max(35, Math.min(85, walkFov + e.deltaY * 0.03));
}, { passive: false });

function updateHover() {
  if (!pointerDirty || mode === 'fly' || (down && down.moved)) return;
  const p = pick(pointerDirty.x, pointerDirty.y);
  pointerDirty = false;
  M.rooms.forEach((r) => (r.highlight.visible = false));
  canvas.style.cursor = p ? 'pointer' : '';
  if (!p) { hoverDisc.visible = false; return; }
  if (mode === 'orbit') {
    if (p.zone.highlight) p.zone.highlight.visible = true;
    hoverDisc.visible = false;
  } else {
    hoverDisc.visible = true;
    hoverDisc.position.set(p.x, p.y + 0.04, p.z);
  }
}

// ---------- keyboard walking ----------
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input,textarea,select,dialog')) return;
  if (e.key === 'Escape') { if (mode === 'walk') exitWalk(); return; }
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'q', 'e'].includes(k) && mode === 'walk') {
    e.preventDefault();
    if (anim) { stopTour(); cancelAnim(); }
  }
  keys.add(k === 'Shift' ? 'Shift' : k);
});
addEventListener('keyup', (e) => {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  keys.delete(k);
});
addEventListener('blur', () => keys.clear());

function canStand(x, z) {
  if (!M.walkAreas.some((r) => inRect(x, z, r))) return false;
  if (inRect(x, z, M.stairs)) return false;
  return !M.colliders.some((c) => rectDist(x, z, c.r) < (c.wall ? 0.45 : 0.05));
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
  walker.yaw += turn * 1.8 * dt;
  const sp = 6 * dt * (keys.has('Shift') ? 1.8 : 1);
  const fx = -Math.sin(walker.yaw), fz = -Math.cos(walker.yaw);
  const dx = (fx * f - fz * s) * sp, dz = (fz * f + fx * s) * sp;
  if (canStand(walker.x + dx, walker.z + dz)) { walker.x += dx; walker.z += dz; }
  else if (canStand(walker.x + dx, walker.z)) walker.x += dx;
  else if (canStand(walker.x, walker.z + dz)) walker.z += dz;
}

// ---------- UI ----------
function renderRoomList() {
  const ul = $('rooms');
  ul.innerHTML = '';
  const order = (r) => { const i = TOUR_ORDER.indexOf(r.name); return i < 0 ? 99 : i; };
  for (const room of [...M.rooms].filter((r) => r.tour).sort((a, b) => order(a) - order(b))) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.innerHTML = `<span>${room.name}</span><small>${room.dims}</small>`;
    b.addEventListener('click', () => { stopTour(); goToRoom(room); closePanelOnMobile(); });
    room.button = b;
    li.append(b);
    ul.append(li);
  }
}

let whereRoom = null;
function updateWhere() {
  if (!M) return;
  const room = mode === 'orbit' ? null : M.roomAt(walker.x, walker.z) || (inRect(walker.x, walker.z, M.plotRect) ? { name: 'Compound', dims: '' } : null);
  const name = room ? room.name : null;
  if (mode === 'orbit') $('where').innerHTML = `<b>${M.plan.short}</b><span>${SITE_TITLE}</span>`;
  else if (name !== (whereRoom && whereRoom.name)) $('where').innerHTML = room ? `<b>${room.name}</b><span>${room.dims || ''}</span>` : '';
  whereRoom = mode === 'orbit' ? null : room;
  M.rooms.forEach((r) => r.button && r.button.classList.toggle('on', r === whereRoom));
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
$('btnWalk').addEventListener('click', () => {
  stopTour();
  const start = M.rooms.find((r) => r.name === 'Front Balcony') || M.rooms[0];
  goToRoom(start);
});
$('btnTour').addEventListener('click', () => startTour());
$('chkRoof').addEventListener('change', () => { M.roof.visible = mode === 'orbit' && $('chkRoof').checked; });
$('panelToggle').addEventListener('click', () => document.body.classList.toggle('panel-open'));
function closePanelOnMobile() { if (innerWidth < 760) document.body.classList.remove('panel-open'); }

// original drawings
const drawings = [
  ...PLANS.map((p) => ({ id: p.id, name: p.short, src: p.image })),
  { id: 'site', name: 'Site map', src: 'plans/site-map.jpg' },
];
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
$('btnDrawing').addEventListener('click', () => showDrawing(M.plan.id));
$('drawingClose').addEventListener('click', () => $('drawing').close());
$('drawing').addEventListener('click', (e) => { if (e.target === $('drawing')) $('drawing').close(); });

// ---------- minimap ----------
const mm = $('minimap');
const mctx = mm.getContext('2d');
let mmT = null;
const finishColor = { tile: '#efe7d6', ktile: '#e2dbcf', bath: '#cfe2e8', wood: '#d9b48d', marble: '#f6f3ee', stone: '#cdc5b8' };
function drawMinimap() {
  const dpr = Math.min(devicePixelRatio, 2);
  const W = mm.clientWidth, H = mm.clientHeight;
  mm.width = W * dpr; mm.height = H * dpr;
  const [x0, z0, x1, z1] = M.plotRect;
  const pad = 10;
  const sc = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (z1 - z0));
  const ox = (W - (x1 - x0) * sc) / 2 - x0 * sc, oz = (H - (z1 - z0) * sc) / 2 - z0 * sc;
  mmT = { sc, ox, oz, dpr };
  const g = mctx;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);
  const rr = (r, fill) => { g.fillStyle = fill; g.fillRect(r[0] * sc + ox, r[1] * sc + oz, (r[2] - r[0]) * sc, (r[3] - r[1]) * sc); };
  rr(M.plotRect, 'rgba(200,190,170,0.55)');
  for (const room of M.rooms) for (const r of room.rects) rr(r, room === whereRoom ? '#ffd166' : finishColor[room.finish]);
  for (const r of M.mini.walls) rr(r, '#3b3a37');
  for (const r of M.mini.windows) rr(r, '#6fb3d6');
  // player
  if (mode !== 'orbit') {
    const px = walker.x * sc + ox, pz = walker.z * sc + oz;
    const fx = -Math.sin(walker.yaw), fz = -Math.cos(walker.yaw);
    const a = Math.atan2(fz, fx), spread = 0.6;
    g.fillStyle = 'rgba(255,183,3,0.35)';
    g.beginPath(); g.moveTo(px, pz); g.arc(px, pz, 26, a - spread, a + spread); g.closePath(); g.fill();
    g.fillStyle = '#ff7b00'; g.strokeStyle = '#fff'; g.lineWidth = 2;
    g.beginPath(); g.arc(px, pz, 5, 0, Math.PI * 2); g.fill(); g.stroke();
  }
  // north arrow (world north = -u/-v of the survey frame, mapped into plan axes)
  const nx = -NORTH_UV[0], nz = -NORTH_UV[1];
  const L = Math.hypot(nx, nz);
  const cx = W - 22, cy = 22;
  g.save();
  g.translate(cx, cy);
  g.rotate(Math.atan2(nx / L, -nz / L));
  g.fillStyle = '#d9362b';
  g.beginPath(); g.moveTo(0, -12); g.lineTo(6, 8); g.lineTo(0, 4); g.lineTo(-6, 8); g.closePath(); g.fill();
  g.restore();
  g.fillStyle = '#222'; g.font = 'bold 10px system-ui'; g.textAlign = 'center';
  const nl = 22;
  g.fillText('N', cx + (nx / L) * nl * 0.9 + 0, cy + (nz / L) * nl * 0.9 + 4);
}
mm.addEventListener('click', (e) => {
  if (!mmT || mode === 'fly') return;
  const r = mm.getBoundingClientRect();
  const x = (e.clientX - r.left - mmT.ox) / mmT.sc, z = (e.clientY - r.top - mmT.oz) / mmT.sc;
  if (!inRect(x, z, M.plotRect)) return;
  stopTour();
  glideTo(x, z);
});

// compass HUD (rotates with the camera)
const northWorld = new THREE.Vector2(-NORTH_UV[0], -NORTH_UV[1]).normalize(); // (x, z)
function updateCompass() {
  const f = new THREE.Vector3();
  camera.getWorldDirection(f);
  const fl = Math.hypot(f.x, f.z) || 1;
  const fx = f.x / fl, fz = f.z / fl;
  const up = northWorld.x * fx + northWorld.y * fz;
  const right = northWorld.x * -fz + northWorld.y * fx;
  $('compass').style.transform = `rotate(${Math.atan2(right, up)}rad)`;
}

// ---------- loop ----------
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  labelRenderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (M) drawMinimap();
}
addEventListener('resize', resize);

const clock = new THREE.Clock();
let mmTimer = 0;
function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  if (anim) {
    const a = anim;
    if (a.update(dt) && anim === a) { anim = null; a.resolve(true); }
  }
  if (mode === 'walk') {
    if (!anim) keyMove(dt);
    walker.y = damp(walker.y, M.floorY(walker.x, walker.z) + EYE, 8, dt);
    camera.position.set(walker.x, walker.y, walker.z);
    camera.quaternion.copy(quatOf(walker.yaw, walker.pitch));
  } else if (mode === 'orbit') {
    controls.update();
    const dist = camera.position.distanceTo(controls.target);
    M.labels.visible = dist < 190;
    M.siteLabels.visible = dist > 105;
  }
  const fov = mode === 'orbit' ? 55 : walkFov;
  if (Math.abs(camera.fov - fov) > 0.01) {
    camera.fov = damp(camera.fov, fov, 3, dt);
    camera.updateProjectionMatrix();
  }
  updateHover();
  updateCompass();
  mmTimer += dt;
  if (mmTimer > 0.1) { mmTimer = 0; updateWhere(); drawMinimap(); }
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(frame);
}

let walkFov = 68;
if (innerWidth < 760) document.body.classList.remove('panel-open');
resize();
loadPlan((location.hash || '#p1').slice(1));
$('loading').remove();
frame();
