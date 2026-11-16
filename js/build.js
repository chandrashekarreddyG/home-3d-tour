// Builds the 3D house (walls, openings, floors, furniture) and the surrounding survey site.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { NavGrid, inRect } from './nav.js';
import { PARCELS, ROADS, DIMENSIONS } from './site.js';

export const WALL_H = 10;
export const GROUND = -1.5;
const T_OUT = 0.75;
const T_IN = 0.375;
const OPEN = { d: [0, 7], d2: [0, 7], a: [0, 7.6], w: [3, 7], v: [5.6, 7] };
const SITE_W = 56.08; // Padma Reddy frontage along G.P Road

// ---------- deterministic noise ----------
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- textures ----------
const texCache = {};
function canvasTex(name, world, draw, renderer) {
  if (texCache[name]) return texCache[name];
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  draw(g, 512, rng(name.length * 97 + 13));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  t.userData.world = world;
  texCache[name] = t;
  return t;
}

const shade = (hex, k) => {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, k);
  return '#' + c.getHexString();
};

function tiles(g, S, R, n, base, grout, vary, gw = 3) {
  const s = S / n;
  g.fillStyle = grout; g.fillRect(0, 0, S, S);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    g.fillStyle = shade(base, (R() - 0.5) * vary);
    g.fillRect(i * s + gw / 2, j * s + gw / 2, s - gw, s - gw);
  }
}
function speckle(g, S, R, base, amp, count, size = 2) {
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  for (let k = 0; k < count; k++) {
    g.fillStyle = shade(base, (R() - 0.5) * amp);
    g.fillRect(R() * S, R() * S, size + R() * size, size + R() * size);
  }
}

function makeTextures(renderer) {
  const T = (n, w, d) => canvasTex(n, w, d, renderer);
  return {
    tile: T('tile', 4, (g, S, R) => tiles(g, S, R, 2, '#ece5d8', '#cfc5b3', 0.04, 4)),
    ktile: T('ktile', 3, (g, S, R) => tiles(g, S, R, 2, '#d8d2c8', '#b9b0a2', 0.06, 4)),
    bath: T('bath', 2, (g, S, R) => tiles(g, S, R, 6, '#c9dde3', '#f4f7f8', 0.05, 4)),
    stone: T('stone', 6, (g, S, R) => { tiles(g, S, R, 3, '#bdb3a4', '#8e8578', 0.08, 5); }),
    paver: T('paver', 8, (g, S, R) => tiles(g, S, R, 8, '#c6bba9', '#9e9483', 0.08, 3)),
    wood: T('wood', 6, (g, S, R) => {
      const n = 8, h = S / n;
      for (let i = 0; i < n; i++) {
        const base = shade('#a8744a', (R() - 0.5) * 0.1);
        let x = -R() * S;
        while (x < S) {
          const len = S * (0.45 + R() * 0.4);
          g.fillStyle = shade(base, (R() - 0.5) * 0.05);
          g.fillRect(x, i * h, len, h);
          g.strokeStyle = 'rgba(60,35,20,0.18)';
          for (let k = 0; k < 6; k++) {
            g.beginPath();
            const yy = i * h + R() * h;
            g.moveTo(x, yy); g.bezierCurveTo(x + len / 3, yy + (R() - 0.5) * 6, x + (2 * len) / 3, yy + (R() - 0.5) * 6, x + len, yy);
            g.stroke();
          }
          g.fillStyle = 'rgba(40,22,10,0.55)'; g.fillRect(x, i * h, 2, h);
          x += len;
        }
        g.fillStyle = 'rgba(40,22,10,0.5)'; g.fillRect(0, i * h, S, 2);
      }
    }),
    marble: T('marble', 6, (g, S, R) => {
      g.fillStyle = '#f3f0ea'; g.fillRect(0, 0, S, S);
      for (let k = 0; k < 14; k++) {
        g.strokeStyle = `rgba(120,120,130,${0.08 + R() * 0.2})`;
        g.lineWidth = 0.5 + R() * 2;
        g.beginPath();
        let x = R() * S, y = 0;
        g.moveTo(x, y);
        while (y < S) { x += (R() - 0.5) * 60; y += 20 + R() * 40; g.lineTo(x, y); }
        g.stroke();
      }
      g.strokeStyle = 'rgba(170,160,145,0.6)'; g.lineWidth = 3; g.strokeRect(0, 0, S, S);
    }),
    grass: T('grass', 24, (g, S, R) => speckle(g, S, R, '#7c9a55', 0.12, 9000, 2)),
    soil: T('soil', 24, (g, S, R) => speckle(g, S, R, '#c7ad84', 0.1, 8000, 2)),
    earth: T('earth', 20, (g, S, R) => speckle(g, S, R, '#b39a7c', 0.1, 8000, 2)),
    asphalt: T('asphalt', 16, (g, S, R) => speckle(g, S, R, '#55585c', 0.12, 12000, 1.5)),
  };
}

// ---------- materials ----------
const matCache = new Map();
function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o }));
  return matCache.get(key);
}

// ---------- geometry helpers ----------
function flatRect(x0, z0, x1, z1, y, world = 1) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z1], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([x0 / world, -z0 / world, x1 / world, -z0 / world, x1 / world, -z1 / world, x0 / world, -z1 / world], 2));
  g.setIndex([0, 2, 1, 0, 3, 2]);
  g.computeVertexNormals();
  return g;
}
function flatPoly(pts, y, world = 1) {
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / world, -p.getZ(i) / world);
  return g;
}
function box(w, h, d, material, x, y, z, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}
function cyl(rt, rb, h, material, x, y, z, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
const normRect = (r) => [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];
const rectCenter = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

function label(html, cls, onClick) {
  const el = document.createElement(onClick ? 'button' : 'div');
  el.className = cls;
  el.innerHTML = html;
  if (onClick) el.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
  return new CSS2DObject(el);
}

// =====================================================================
export function buildModel(plan, renderer, onLabelClick) {
  const TX = makeTextures(renderer);
  const floorMat = {
    tile: new THREE.MeshStandardMaterial({ map: TX.tile, roughness: 0.35 }),
    ktile: new THREE.MeshStandardMaterial({ map: TX.ktile, roughness: 0.45 }),
    bath: new THREE.MeshStandardMaterial({ map: TX.bath, roughness: 0.3 }),
    wood: new THREE.MeshStandardMaterial({ map: TX.wood, roughness: 0.55 }),
    marble: new THREE.MeshStandardMaterial({ map: TX.marble, roughness: 0.2 }),
    stone: new THREE.MeshStandardMaterial({ map: TX.stone, roughness: 0.85 }),
  };
  const s = plan.px;
  const [ox, oy] = plan.origin;
  const X = (p) => (p - ox) / s;
  const Z = (p) => (p - oy) / s;
  const R = (r) => normRect([X(r[0]), Z(r[1]), X(r[2]), Z(r[3])]);

  const root = new THREE.Group();
  const ceilings = new THREE.Group();
  const roof = new THREE.Group();
  const labels = new THREE.Group();
  const siteLabels = new THREE.Group();
  const markers = new THREE.Group();
  root.add(ceilings, roof, labels, siteLabels, markers);
  ceilings.visible = false;
  roof.visible = false;

  const floors = []; // pickable floor meshes
  const solids = []; // walls (block picking)
  const furnMeshes = []; // furniture (pick through to room)
  const colliders = []; // {r, clear} walls & big furniture footprint
  const mini = { walls: [], windows: [], doors: [] };

  // ----- outer building rect -----
  const outerWalls = plan.walls.filter((w) => w[4] === 'o');
  const bx0 = Math.min(...outerWalls.map((w) => X(Math.min(w[0], w[2])))) - T_OUT / 2;
  const bx1 = Math.max(...outerWalls.map((w) => X(Math.max(w[0], w[2])))) + T_OUT / 2;
  const bz0 = Math.min(...outerWalls.map((w) => Z(Math.min(w[1], w[3])))) - T_OUT / 2;
  const bz1 = Math.max(...outerWalls.map((w) => Z(Math.max(w[1], w[3])))) + T_OUT / 2;
  const building = [bx0, bz0, bx1, bz1];
  const bcx = (bx0 + bx1) / 2, bcz = (bz0 + bz1) / 2;

  // ----- rooms -----
  const rooms = [];
  const addZone = (z, outdoor) => {
    const rects = (z.rs || [z.r]).map(R);
    const big = rects.reduce((a, b) => ((a[2] - a[0]) * (a[3] - a[1]) >= (b[2] - b[0]) * (b[3] - b[1]) ? a : b));
    rooms.push({ name: z.n, dims: z.d || '', rects, outdoor, tour: z.tour !== false, finish: z.f, center: rectCenter(big) });
  };
  plan.rooms.forEach((z) => addZone(z, false));
  plan.outdoor.forEach((z) => addZone(z, true));
  const roomAt = (x, z) => rooms.find((r) => r.rects.some((q) => inRect(x, z, q)));

  // ----- walls -----
  const wallIn = mat('#f3efe7', { roughness: 0.92 });
  const wallOut = mat('#e6d3b3', { roughness: 0.95 });
  const wallCap = mat('#8a8176', { roughness: 0.9 });
  const frameMat = mat('#6b4a2f', { roughness: 0.6 });
  const alu = mat('#4c5258', { roughness: 0.4, metalness: 0.6 });
  const glass = new THREE.MeshStandardMaterial({ color: '#a9cbe0', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.28, depthWrite: false });
  const doorways = [];

  for (const [x1, y1, x2, y2, k, ops] of plan.walls) {
    const t = k === 'o' ? T_OUT : T_IN;
    const vertical = x1 === x2;
    const conv = vertical ? Z : X;
    const c = vertical ? X(x1) : Z(y1);
    const a0 = conv(Math.min(vertical ? y1 : x1, vertical ? y2 : x2));
    const a1 = conv(Math.max(vertical ? y1 : x1, vertical ? y2 : x2));
    let mats = wallIn;
    if (k === 'o') {
      mats = [wallIn, wallIn, wallCap, wallIn, wallIn, wallIn];
      if (vertical) mats[c < bcx ? 1 : 0] = wallOut;
      else mats[c < bcz ? 5 : 4] = wallOut;
    } else {
      mats = [wallIn, wallIn, wallCap, wallIn, wallIn, wallIn];
    }
    const footprint = (a, b) => (vertical ? [c - t / 2, a, c + t / 2, b] : [a, c - t / 2, b, c + t / 2]);
    const piece = (a, b, y0, y1, tag) => {
      if (b - a < 0.01) return;
      const m = vertical
        ? box(t, y1 - y0, b - a, mats, c, (y0 + y1) / 2, (a + b) / 2)
        : box(b - a, y1 - y0, t, mats, (a + b) / 2, (y0 + y1) / 2, c);
      m.userData.wall = true;
      root.add(m);
      solids.push(m);
      if (y0 < 2) {
        colliders.push({ r: footprint(a, b), clear: 0.6, wall: true });
        (tag === 'sill' ? mini.windows : mini.walls).push(footprint(a, b));
      }
    };
    const openings = ops
      .map(([kind, f, to]) => ({ kind, a: conv(Math.min(f, to)), b: conv(Math.max(f, to)) }))
      .sort((p, q) => p.a - q.a);
    let cur = a0 - t / 2;
    for (const o of openings) {
      if (o.a > cur) piece(cur, o.a, 0, WALL_H);
      const [lo, hi] = OPEN[o.kind];
      if (lo > 0) piece(o.a, o.b, 0, lo, 'sill');
      piece(o.a, o.b, hi, WALL_H);
      addOpening(o, lo, hi);
      cur = Math.max(cur, o.b);
    }
    if (a1 + t / 2 > cur) piece(cur, a1 + t / 2, 0, WALL_H);

    function addOpening(o, lo, hi) {
      const L = o.b - o.a, mid = (o.a + o.b) / 2;
      const place = (w, h, d, m, along, y, across = 0) =>
        vertical ? box(d, h, w, m, c + across, y, along) : box(w, h, d, m, along, y, c + across);
      if (o.kind === 'w' || o.kind === 'v') {
        const fw = 0.12;
        root.add(place(L, hi - lo, 0.04, glass, mid, (lo + hi) / 2));
        root.add(place(L, fw, t * 0.6, alu, mid, lo + fw / 2));
        root.add(place(L, fw, t * 0.6, alu, mid, hi - fw / 2));
        root.add(place(fw, hi - lo, t * 0.6, alu, o.a + fw / 2, (lo + hi) / 2));
        root.add(place(fw, hi - lo, t * 0.6, alu, o.b - fw / 2, (lo + hi) / 2));
        if (o.kind === 'w' && L > 2.5) root.add(place(fw * 0.8, hi - lo, t * 0.6, alu, mid, (lo + hi) / 2));
        if (o.kind === 'w') root.add(place(L + 0.4, 0.12, t + 0.3, mat('#d9d2c4'), mid, lo - 0.06));
        mini.windows.push(footprint(o.a, o.b));
      } else {
        const j = 0.22;
        if (o.kind !== 'a') {
          root.add(place(j, hi, t + 0.1, frameMat, o.a + j / 2, hi / 2));
          root.add(place(j, hi, t + 0.1, frameMat, o.b - j / 2, hi / 2));
          root.add(place(L, j, t + 0.1, frameMat, mid, hi - j / 2));
        }
        const n = vertical ? [1, 0] : [0, 1];
        const p = vertical ? [c, mid] : [mid, c];
        doorways.push({ p, n, kind: o.kind, outer: k === 'o', width: L });
        mini.doors.push(footprint(o.a, o.b));
      }
    }
  }

  // ----- plinth, floors, ceilings, roof -----
  const plinthMat = mat('#9b8e7d', { roughness: 0.95 });
  const slabRects = [building, ...rooms.filter((r) => r.outdoor).flatMap((r) => r.rects)];
  for (const r of slabRects) {
    const m = box(r[2] - r[0], -GROUND, r[3] - r[1], plinthMat, (r[0] + r[2]) / 2, GROUND / 2 - 0.01, (r[1] + r[3]) / 2, false);
    root.add(m);
  }
  const ceilMat = mat('#fbfaf7', { roughness: 1 });
  const lampMat = new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff3d6', emissiveIntensity: 1.2 });
  const hiMat = new THREE.MeshBasicMaterial({ color: '#ffb703', transparent: true, opacity: 0.3, depthWrite: false });
  for (const room of rooms) {
    room.floors = [];
    room.highlight = new THREE.Group();
    room.highlight.visible = false;
    for (const r of room.rects) {
      const fm = new THREE.Mesh(flatRect(r[0], r[1], r[2], r[3], 0, floorMat[room.finish].map.userData.world), floorMat[room.finish]);
      fm.receiveShadow = true;
      fm.userData.floor = room;
      root.add(fm);
      floors.push(fm);
      room.floors.push(fm);
      room.highlight.add(new THREE.Mesh(flatRect(r[0], r[1], r[2], r[3], 0.05), hiMat));
      const cm = new THREE.Mesh(flatRect(r[0], r[1], r[2], r[3], WALL_H - 0.01), ceilMat);
      cm.geometry.setIndex([0, 1, 2, 0, 2, 3]);
      cm.geometry.computeVertexNormals();
      ceilings.add(cm);
    }
    root.add(room.highlight);
    if (!room.outdoor && room.tour) {
      const [cx, cz] = room.center;
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 24), lampMat);
      lamp.position.set(cx, WALL_H - 0.05, cz);
      ceilings.add(lamp);
    }
    const el = label(`<b>${room.name}</b>${room.dims ? `<span>${room.dims}</span>` : ''}`, 'rlabel' + (room.tour ? '' : ' minor'), () => onLabelClick(room));
    el.position.set(room.center[0], room.outdoor ? 1.5 : 3.6, room.center[1]);
    labels.add(el);
  }
  const roofMat = mat('#c9c1b4', { roughness: 0.95 });
  for (const r of slabRects) roof.add(box(r[2] - r[0] + 0.2, 0.5, r[3] - r[1] + 0.2, roofMat, (r[0] + r[2]) / 2, WALL_H + 0.25, (r[1] + r[3]) / 2));
  const par = 3, pt = 0.5;
  roof.add(box(bx1 - bx0, par, pt, wallOut, bcx, WALL_H + 0.5 + par / 2, bz0 + pt / 2));
  roof.add(box(bx1 - bx0, par, pt, wallOut, bcx, WALL_H + 0.5 + par / 2, bz1 - pt / 2));
  roof.add(box(pt, par, bz1 - bz0, wallOut, bx0 + pt / 2, WALL_H + 0.5 + par / 2, bcz));
  roof.add(box(pt, par, bz1 - bz0, wallOut, bx1 - pt / 2, WALL_H + 0.5 + par / 2, bcz));

  // balcony columns
  const colMat = mat('#e9dcc4', { roughness: 0.9 });
  for (const [px, py] of plan.columns) {
    const x = X(px) + (X(px) < bcx ? 0.5 : -0.5);
    const z = Z(py) + (Z(py) < bcz ? 0.5 : -0.5);
    const m = box(1, WALL_H, 1, colMat, x, WALL_H / 2, z);
    m.userData.wall = true;
    root.add(m);
    solids.push(m);
    colliders.push({ r: [x - 0.5, z - 0.5, x + 0.5, z + 0.5], clear: 0.5, wall: true });
    mini.walls.push([x - 0.5, z - 0.5, x + 0.5, z + 0.5]);
  }

  // ----- stairs (dog-leg, rising toward +x then back) -----
  const st = R(plan.stairs);
  {
    const stairMat = mat('#cfc7b8', { roughness: 0.85 });
    const [x0, z0, x1, z1] = st;
    const zm = (z0 + z1) / 2, land = 3, n = 9, rise = WALL_H / 2 / n, run = (x1 - land - x0) / n;
    for (let i = 0; i < n; i++) {
      const h1 = (i + 1) * rise;
      root.add(box(run, h1, zm - z0, stairMat, x0 + (i + 0.5) * run, h1 / 2, (z0 + zm) / 2));
      const h2 = WALL_H / 2 + (i + 1) * rise;
      root.add(box(run, h2, z1 - zm, stairMat, x1 - land - (i + 0.5) * run, h2 / 2, (zm + z1) / 2));
    }
    root.add(box(land, WALL_H / 2, z1 - z0, stairMat, x1 - land / 2, WALL_H / 4, (z0 + z1) / 2));
    root.add(box(x1 - land - x0, 3, 0.3, wallIn, (x0 + x1 - land) / 2, WALL_H / 2 + 1.5, zm));
    mini.walls.push([x0, z0, x1, z1]);
  }

  // ----- furniture -----
  buildFurniture(plan, { X, Z, R, roomAt, root, furnMeshes, colliders });

  // ----- plot: compound wall, garden, gates -----
  const plot = plan.plot;
  const plotRect = [plot.x0, plot.z0, plot.x1, plot.z1];
  {
    const garden = new THREE.Mesh(flatRect(plot.x0, plot.z0, plot.x1, plot.z1, GROUND + 0.02, TX.paver.userData.world), new THREE.MeshStandardMaterial({ map: TX.paver, roughness: 0.9 }));
    garden.receiveShadow = true;
    garden.userData.floor = { name: 'Compound', dims: '', outdoor: true, garden: true, rects: [plotRect], tour: false };
    root.add(garden);
    floors.push(garden);
    const cw = mat('#d8c9ae', { roughness: 0.95 }), gateMat = mat('#2f3337', { roughness: 0.5, metalness: 0.7 });
    const H = 4.5, tt = 0.6;
    const sides = {
      n: { a: plot.x0, b: plot.x1, fixed: plot.z0, vertical: false },
      s: { a: plot.x0, b: plot.x1, fixed: plot.z1, vertical: false },
      w: { a: plot.z0, b: plot.z1, fixed: plot.x0, vertical: true },
      e: { a: plot.z0, b: plot.z1, fixed: plot.x1, vertical: true },
    };
    for (const [side, d] of Object.entries(sides)) {
      const gates = plot.gates.filter((g) => g.side === side).sort((p, q) => p.from - q.from);
      let cur = d.a;
      const seg = (a, b) => {
        if (b - a < 0.05) return;
        const m = d.vertical ? box(tt, H, b - a, cw, d.fixed, GROUND + H / 2, (a + b) / 2) : box(b - a, H, tt, cw, (a + b) / 2, GROUND + H / 2, d.fixed);
        m.userData.wall = true;
        root.add(m);
        solids.push(m);
        const fp = d.vertical ? [d.fixed - tt / 2, a, d.fixed + tt / 2, b] : [a, d.fixed - tt / 2, b, d.fixed + tt / 2];
        colliders.push({ r: fp, clear: 0.5, wall: true });
        mini.walls.push(fp);
      };
      for (const g of gates) {
        seg(cur, g.from);
        for (const pos of [g.from, g.to]) {
          root.add(d.vertical ? box(1.2, H + 1, 1.2, cw, d.fixed, GROUND + (H + 1) / 2, pos) : box(1.2, H + 1, 1.2, cw, pos, GROUND + (H + 1) / 2, d.fixed));
        }
        const gl = (g.to - g.from) * 0.45;
        const leaf = d.vertical ? box(0.15, 4, gl, gateMat, d.fixed + (side === 'w' ? -0.6 : 0.6), GROUND + 2.2, g.from + 0.6 + gl / 2) : box(gl, 4, 0.15, gateMat, g.from + 0.6 + gl / 2, GROUND + 2.2, d.fixed + (side === 's' ? 0.6 : -0.6));
        root.add(leaf);
        cur = g.to;
      }
      seg(cur, d.b);
    }
  }

  // ----- site from the survey map -----
  const site = buildSite(plan, TX, root, siteLabels);

  // ----- navigation -----
  const walkAreas = [...rooms.flatMap((r) => r.rects), plotRect];
  const blockers = colliders.map((c) => ({ r: c.r, clear: c.clear }));
  const nav = new NavGrid([plot.x0 - 1, plot.z0 - 1, plot.x1 + 1, plot.z1 + 1], walkAreas, [st], blockers);

  // ----- room viewpoints -----
  for (const room of rooms) room.view = viewpoint(room, doorways, roomAt, nav);
  // floor-markers at room viewpoints (visible in walk mode)
  const mk = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false });
  for (const room of rooms) {
    if (!room.tour) continue;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 32), mk);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(room.center[0], 0.04, room.center[1]);
    markers.add(ring);
  }
  markers.visible = false;

  const insideSlab = (x, z) => slabRects.some((r) => inRect(x, z, r));
  return {
    plan, root, ceilings, roof, labels, siteLabels, markers, rooms, floors, solids, furnMeshes,
    colliders, nav, building, plotRect, stairs: st, mini, site, roomAt,
    floorY: (x, z) => (insideSlab(x, z) ? 0 : GROUND),
    walkAreas,
  };
}

// Balconies: stand outside the main door looking at the house.
// Rooms: stand in the walkable spot farthest from the centre (a corner) and look across the room.
function viewpoint(room, doorways, roomAt, nav) {
  const yawOf = (dx, dz) => Math.atan2(-dx, -dz);
  const [cx, cz] = room.center;
  const mine = (x, z) => roomAt(x, z) === room && nav.ok(x, z);
  if (room.outdoor) {
    for (const d of doorways) {
      if (d.kind !== 'd2') continue;
      for (const sgn of [1, -1]) {
        for (const depth of [4.6, 4, 3.2, 2.6]) {
          const x = d.p[0] + d.n[0] * sgn * depth, z = d.p[1] + d.n[1] * sgn * depth;
          if (mine(x, z) && mine(x + d.n[0] * sgn * 0.8, z + d.n[1] * sgn * 0.8)) return { x, z, yaw: yawOf(-d.n[0] * sgn, -d.n[1] * sgn) };
        }
      }
    }
    return { x: cx, z: cz, yaw: 0 };
  }
  const r = room.rects.reduce((a, b) => ((a[2] - a[0]) * (a[3] - a[1]) >= (b[2] - b[0]) * (b[3] - b[1]) ? a : b));
  const inset = Math.min(1.1, (r[2] - r[0]) / 3, (r[3] - r[1]) / 3);
  let best = null, bestD = -1;
  for (let x = r[0] + inset; x <= r[2] - inset; x += 0.25) {
    for (let z = r[1] + inset; z <= r[3] - inset; z += 0.25) {
      if (!mine(x, z)) continue;
      const d = Math.hypot(x - cx, z - cz);
      if (d > bestD) { bestD = d; best = [x, z]; }
    }
  }
  if (!best) return { x: cx, z: cz, yaw: 0 };
  const yaw = bestD > 1 ? yawOf(cx - best[0], cz - best[1]) : 0;
  return { x: best[0], z: best[1], yaw };
}

// =====================================================================
function buildFurniture(plan, ctx) {
  const { X, Z, R, roomAt, root, furnMeshes, colliders } = ctx;
  const add = (obj, blockRect, clear = 0.3) => {
    obj.traverse((o) => { if (o.isMesh) { o.userData.furn = true; furnMeshes.push(o); } });
    root.add(obj);
    if (blockRect) colliders.push({ r: blockRect, clear });
  };
  const intoRoom = (r) => {
    const [cx, cz] = rectCenter(r);
    const room = roomAt(cx, cz);
    const [rx, rz] = room ? room.center : [cx, cz];
    const alongX = r[2] - r[0] >= r[3] - r[1];
    return alongX ? { alongX, n: [0, Math.sign(rz - cz) || 1] } : { alongX, n: [Math.sign(rx - cx) || 1, 0] };
  };
  const rotFor = { n: 0, s: Math.PI, w: Math.PI / 2, e: -Math.PI / 2 };

  const wood = mat('#7b5638', { roughness: 0.6 });
  const darkWood = mat('#5a3a26', { roughness: 0.6 });
  const white = mat('#f3f1ec', { roughness: 0.7 });
  const porcelain = mat('#f7f7f4', { roughness: 0.15 });
  const fabric = mat('#6f8291', { roughness: 0.95 });
  const fabricLight = mat('#8a9cab', { roughness: 0.95 });
  const steel = mat('#b8bcc0', { roughness: 0.3, metalness: 0.8 });
  const black = mat('#1c1d20', { roughness: 0.4, metalness: 0.3 });

  for (const it of plan.furn) {
    const type = it[0];
    if (type === 'bed') {
      const [x0, z0, x1, z1] = R(it[1]);
      const w = x1 - x0, L = z1 - z0, cx = (x0 + x1) / 2;
      const g = new THREE.Group();
      g.add(box(w, 1.1, L, darkWood, cx, 0.55, (z0 + z1) / 2));
      g.add(box(w - 0.2, 0.7, L - 0.35, white, cx, 1.45, (z0 + z1) / 2 + 0.12));
      g.add(box(w + 0.04, 0.14, L * 0.6, mat('#86aec2', { roughness: 0.95 }), cx, 1.86, z1 - L * 0.3 - 0.05));
      for (const sx of [-1, 1]) g.add(box(w * 0.38, 0.38, 1.1, white, cx + sx * w * 0.22, 1.98, z0 + 0.95));
      g.add(box(w + 0.3, 3.8, 0.3, darkWood, cx, 1.9, z0 + 0.15));
      for (const sx of [-1, 1]) {
        const nx = sx < 0 ? x0 - 1.0 : x1 + 1.0;
        g.add(box(1.5, 1.9, 1.5, wood, nx, 0.95, z0 + 0.9));
        g.add(cyl(0.12, 0.18, 0.8, steel, nx, 2.3, z0 + 0.9));
        const shadeM = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.6, 20, 1, true), new THREE.MeshStandardMaterial({ color: '#fff4dc', emissive: '#ffdca0', emissiveIntensity: 0.5, side: THREE.DoubleSide }));
        shadeM.position.set(nx, 2.95, z0 + 0.9);
        g.add(shadeM);
      }
      const room = roomAt(cx, (z0 + z1) / 2);
      let rug = [x0 - 1.3, z0 + L * 0.35, x1 + 1.3, z1 + 1.6];
      if (room) { const rr = room.rects[0]; rug = [Math.max(rug[0], rr[0] + 0.4), rug[1], Math.min(rug[2], rr[2] - 0.4), Math.min(rug[3], rr[3] - 0.4)]; }
      const rugM = new THREE.Mesh(flatRect(rug[0], rug[1], rug[2], rug[3], 0.015), mat('#cdbba5', { roughness: 1 }));
      rugM.receiveShadow = true;
      g.add(rugM);
      add(g, [x0 - 1.75, z0, x1 + 1.75, z1], 0.3);
    } else if (type === 'ward') {
      const r = R(it[1]);
      const [cx, cz] = rectCenter(r);
      const { alongX, n } = intoRoom(r);
      const g = new THREE.Group();
      g.add(box(r[2] - r[0], 7, r[3] - r[1], mat('#8d6446', { roughness: 0.55 }), cx, 3.5, cz));
      const len = alongX ? r[2] - r[0] : r[3] - r[1];
      const doors = Math.max(1, Math.round(len / 1.8));
      const face = alongX ? (n[1] > 0 ? r[3] : r[1]) : n[0] > 0 ? r[2] : r[0];
      for (let i = 1; i < doors; i++) {
        const a = (alongX ? r[0] : r[1]) + (len * i) / doors;
        g.add(alongX ? box(0.04, 6.8, 0.04, darkWood, a, 3.5, face + n[1] * 0.01) : box(0.04, 6.8, 0.04, darkWood, face + n[0] * 0.01, 3.5, a));
      }
      for (let i = 0; i < doors; i++) {
        const a = (alongX ? r[0] : r[1]) + (len * (i + 0.5)) / doors;
        g.add(alongX ? box(0.08, 0.9, 0.1, steel, a, 3.6, face + n[1] * 0.05) : box(0.1, 0.9, 0.08, steel, face + n[0] * 0.05, 3.6, a));
      }
      add(g, r, 0.3);
    } else if (type === 'sofa') {
      const r = R(it[1]);
      const back = it[2];
      const [cx, cz] = rectCenter(r);
      const w = r[2] - r[0], d = r[3] - r[1];
      const g = new THREE.Group();
      g.add(box(w, 1.2, d, fabric, cx, 0.6, cz));
      const bt = 0.75;
      if (back === 'n') g.add(box(w, 2.8, bt, fabric, cx, 1.4, r[1] + bt / 2));
      if (back === 's') g.add(box(w, 2.8, bt, fabric, cx, 1.4, r[3] - bt / 2));
      if (back === 'e') g.add(box(bt, 2.8, d, fabric, r[2] - bt / 2, 1.4, cz));
      if (back === 'w') g.add(box(bt, 2.8, d, fabric, r[0] + bt / 2, 1.4, cz));
      const at = 0.45;
      if (back === 'n' || back === 's') {
        g.add(box(at, 2.0, d, fabric, r[0] + at / 2, 1.0, cz));
        g.add(box(at, 2.0, d, fabric, r[2] - at / 2, 1.0, cz));
        g.add(box(w - 2 * at, 0.3, d - bt, fabricLight, cx, 1.35, back === 'n' ? cz + bt / 2 : cz - bt / 2));
      } else {
        g.add(box(w, 2.0, at, fabric, cx, 1.0, r[1] + at / 2));
        g.add(box(w, 2.0, at, fabric, cx, 1.0, r[3] - at / 2));
        g.add(box(w - bt, 0.3, d - 2 * at, fabricLight, back === 'e' ? cx - bt / 2 : cx + bt / 2, 1.35, cz));
      }
      add(g, r, 0.3);
    } else if (type === 'ctable') {
      const r = R(it[1]);
      const [cx, cz] = rectCenter(r);
      const g = new THREE.Group();
      g.add(box(r[2] - r[0], 0.12, r[3] - r[1], mat('#4a3b30', { roughness: 0.35 }), cx, 1.35, cz));
      g.add(box(r[2] - r[0] - 0.3, 1.2, r[3] - r[1] - 0.3, darkWood, cx, 0.65, cz));
      add(g, r, 0.15);
    } else if (type === 'tv') {
      const r = R(it[1]);
      const { alongX, n } = intoRoom(r);
      const [cx, cz] = rectCenter(r);
      const len = Math.max(4.5, alongX ? r[2] - r[0] : r[3] - r[1]);
      const g = new THREE.Group();
      const wallPos = alongX ? cz : cx;
      const dep = 1.3;
      const off = wallPos + (alongX ? n[1] : n[0]) * (dep / 2);
      g.add(alongX ? box(len, 1.6, dep, wood, cx, 0.8, off) : box(dep, 1.6, len, wood, off, 0.8, cz));
      const tvM = new THREE.MeshStandardMaterial({ color: '#0b0c10', roughness: 0.15, metalness: 0.4, emissive: '#0c1a2e', emissiveIntensity: 0.6 });
      const tvOff = wallPos + (alongX ? n[1] : n[0]) * 0.12;
      g.add(alongX ? box(4.2, 2.4, 0.12, tvM, cx, 4.4, tvOff) : box(0.12, 2.4, 4.2, tvM, tvOff, 4.4, cz));
      const fr = alongX ? [cx - len / 2, Math.min(wallPos, off + n[1] * dep / 2), cx + len / 2, Math.max(wallPos, off + n[1] * dep / 2)] : [Math.min(wallPos, off + n[0] * dep / 2), cz - len / 2, Math.max(wallPos, off + n[0] * dep / 2), cz + len / 2];
      add(g, fr, 0.2);
    } else if (type === 'plant') {
      const x = X(it[1]), z = Z(it[2]);
      const g = new THREE.Group();
      g.add(cyl(0.65, 0.5, 1.3, mat('#a0522d', { roughness: 0.9 }), x, 0.65, z));
      const leaf = mat('#4f8a3c', { roughness: 0.9, flatShading: true });
      const f1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 1), leaf);
      f1.position.set(x, 2.3, z); f1.castShadow = true;
      const f2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), leaf);
      f2.position.set(x + 0.2, 3.1, z - 0.1); f2.castShadow = true;
      g.add(f1, f2);
      add(g, [x - 0.6, z - 0.6, x + 0.6, z + 0.6], 0.2);
    } else if (type === 'rdining' || type === 'dining') {
      const g = new THREE.Group();
      const top = mat('#7a5235', { roughness: 0.4 });
      const chairs = [];
      let fr;
      if (type === 'rdining') {
        const cx = X(it[1]), cz = Z(it[2]), r = it[3] / plan.px;
        g.add(cyl(r, r, 0.12, top, cx, 2.5, cz, 40));
        g.add(cyl(0.25, 0.5, 2.4, darkWood, cx, 1.2, cz));
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          chairs.push([cx + Math.cos(a) * (r + 0.9), cz + Math.sin(a) * (r + 0.9), cx, cz]);
        }
        fr = [cx - r - 1.5, cz - r - 1.5, cx + r + 1.5, cz + r + 1.5];
      } else {
        const r = R(it[1]);
        const [cx, cz] = rectCenter(r);
        g.add(box(r[2] - r[0], 0.12, r[3] - r[1], top, cx, 2.5, cz));
        for (const [lx, lz] of [[r[0] + 0.2, r[1] + 0.2], [r[2] - 0.2, r[1] + 0.2], [r[0] + 0.2, r[3] - 0.2], [r[2] - 0.2, r[3] - 0.2]]) g.add(box(0.16, 2.44, 0.16, darkWood, lx, 1.22, lz));
        const L = r[3] - r[1];
        for (const f of [0.25, 0.75]) {
          chairs.push([r[0] - 0.8, r[1] + L * f, cx, r[1] + L * f]);
          chairs.push([r[2] + 0.8, r[1] + L * f, cx, r[1] + L * f]);
        }
        chairs.push([cx, r[1] - 0.8, cx, cz], [cx, r[3] + 0.8, cx, cz]);
        fr = [r[0] - 1.4, r[1] - 1.4, r[2] + 1.4, r[3] + 1.4];
      }
      for (const [x, z, tx, tz] of chairs) {
        const ch = new THREE.Group();
        ch.add(box(1.4, 0.15, 1.4, top, 0, 1.55, 0));
        ch.add(box(1.4, 1.8, 0.14, top, 0, 2.5, 0.63));
        for (const [lx, lz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) ch.add(box(0.12, 1.5, 0.12, darkWood, lx, 0.75, lz));
        ch.position.set(x, 0, z);
        ch.rotation.y = Math.atan2(-(tx - x), -(tz - z));
        g.add(ch);
      }
      add(g, fr, 0.1);
    } else if (type === 'counter') {
      const r = R(it[1]);
      const [cx, cz] = rectCenter(r);
      const g = new THREE.Group();
      g.add(box(r[2] - r[0], 2.75, r[3] - r[1], mat('#e6ddd0', { roughness: 0.6 }), cx, 1.375, cz));
      g.add(box(r[2] - r[0] + 0.05, 0.12, r[3] - r[1] + 0.05, mat('#2b2b2e', { roughness: 0.25, metalness: 0.1 }), cx, 2.81, cz));
      add(g, r, 0.25);
    } else if (type === 'stove') {
      const x = X(it[1]), z = Z(it[2]);
      const g = new THREE.Group();
      g.add(box(1.3, 0.12, 2.2, black, x, 2.93, z));
      for (const dz of [-0.5, 0.5]) g.add(cyl(0.28, 0.28, 0.06, mat('#3a3a3c', { metalness: 0.6, roughness: 0.4 }), x, 3.02, z + dz));
      add(g);
    } else if (type === 'ksink') {
      const x = X(it[1]), z = Z(it[2]);
      const g = new THREE.Group();
      g.add(box(1.3, 0.06, 1.7, steel, x, 2.9, z));
      g.add(cyl(0.05, 0.05, 1.0, steel, x - 0.5, 3.4, z));
      g.add(box(0.6, 0.06, 0.06, steel, x - 0.2, 3.88, z));
      add(g);
    } else if (type === 'fridge') {
      const r = R(it[1]);
      const [cx, cz] = rectCenter(r);
      const g = new THREE.Group();
      g.add(box(r[2] - r[0], 6, r[3] - r[1], mat('#d3d7db', { roughness: 0.3, metalness: 0.5 }), cx, 3, cz));
      add(g, r, 0.2);
    } else if (type === 'wc' || type === 'basin') {
      const x = X(it[1]), z = Z(it[2]);
      const g = new THREE.Group();
      if (type === 'wc') {
        g.add(box(1.4, 1.3, 0.55, porcelain, 0, 2.0, -0.95));
        const bowl = cyl(0.62, 0.45, 1.3, porcelain, 0, 0.65, -0.05, 28);
        bowl.scale.z = 1.3;
        g.add(bowl);
        const seat = cyl(0.64, 0.64, 0.1, porcelain, 0, 1.36, -0.05, 28);
        seat.scale.z = 1.3;
        g.add(seat);
      } else {
        g.add(box(1.9, 2.5, 1.3, mat('#e9e4da', { roughness: 0.5 }), 0, 1.25, -0.25));
        const sink = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), porcelain);
        sink.rotation.x = Math.PI;
        sink.position.set(0, 2.75, -0.2);
        g.add(sink);
        g.add(box(1.8, 2.2, 0.05, mat('#dfe8ec', { roughness: 0.02, metalness: 1 }), 0, 5.1, -0.88));
      }
      g.position.set(x, 0, z);
      g.rotation.y = rotFor[it[3]] ?? 0;
      add(g);
    } else if (type === 'pooja') {
      const r = R(it[1]);
      const { alongX, n } = intoRoom(r);
      const [cx, cz] = rectCenter(r);
      const g = new THREE.Group();
      g.add(box(r[2] - r[0], 4.2, r[3] - r[1], mat('#c49655', { roughness: 0.5 }), cx, 2.1, cz));
      g.add(box(r[2] - r[0] + 0.1, 0.2, r[3] - r[1] + 0.1, mat('#d4af37', { roughness: 0.3, metalness: 0.8 }), cx, 4.3, cz));
      const glow = new THREE.MeshStandardMaterial({ color: '#f2b544', emissive: '#f29b18', emissiveIntensity: 0.9 });
      const wallX = alongX ? cx : (n[0] > 0 ? r[0] : r[2]);
      const wallZ = alongX ? (n[1] > 0 ? r[1] : r[3]) : cz;
      g.add(alongX ? box(1.4, 1.8, 0.06, glow, wallX, 6, wallZ + n[1] * 0.05) : box(0.06, 1.8, 1.4, glow, wallX + n[0] * 0.05, 6, wallZ));
      g.add(cyl(0.12, 0.18, 0.2, glow, cx + n[0] * 0.3, 4.5, cz + n[1] * 0.3));
      add(g, r, 0.2);
    } else if (type === 'diwan') {
      const r = R(it[1]);
      const [cx, cz] = rectCenter(r);
      const g = new THREE.Group();
      g.add(box(r[2] - r[0], 1.4, r[3] - r[1], mat('#3fa7bd', { roughness: 0.9 }), cx, 0.7, cz));
      for (const sx of [r[0] + 0.4, r[2] - 0.4]) {
        const b = cyl(0.35, 0.35, r[3] - r[1] - 0.2, mat('#2c8aa0', { roughness: 0.9 }), sx, 1.75, cz);
        b.rotation.x = Math.PI / 2;
        g.add(b);
      }
      add(g, r, 0.25);
    }
  }
}

// =====================================================================
function buildSite(plan, TX, root, siteLabels) {
  const p = plan.plot;
  const W = ([u, v]) => [p.x0 + SITE_W - u, p.z1 - v];
  const group = new THREE.Group();
  root.add(group);

  const grass = new THREE.Mesh(flatRect(-600, -600, 600, 600, GROUND - 0.4, TX.grass.userData.world), new THREE.MeshStandardMaterial({ map: TX.grass, roughness: 1 }));
  grass.receiveShadow = true;
  group.add(grass);

  const roadMat = {
    asphalt: new THREE.MeshStandardMaterial({ map: TX.asphalt, roughness: 0.95 }),
    earth: new THREE.MeshStandardMaterial({ map: TX.earth, roughness: 1 }),
  };
  const centroid = (pts) => [pts.reduce((a, q) => a + q[0], 0) / pts.length, pts.reduce((a, q) => a + q[1], 0) / pts.length];
  for (const r of ROADS) {
    const pts = r.poly.map(W);
    const m = new THREE.Mesh(flatPoly(pts, GROUND - 0.2, TX[r.kind].userData.world), roadMat[r.kind]);
    m.receiveShadow = true;
    group.add(m);
    const [lx, lz] = r.at ? W(r.at) : centroid(pts);
    const el = label(r.label, 'slabel road');
    el.position.set(lx, GROUND + 0.5, lz);
    siteLabels.add(el);
  }
  // G.P road centre line
  {
    const a = W([-70, -10]), b = W([140, -10]);
    const dash = mat('#f2f2f2', { roughness: 0.6 });
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let s = 0; s < len; s += 10) {
      const t = s / len;
      const m = box(5, 0.02, 0.4, dash, a[0] + (b[0] - a[0]) * t, GROUND - 0.17, a[1] + (b[1] - a[1]) * t, false);
      group.add(m);
    }
  }

  const fills = {
    plot: new THREE.MeshStandardMaterial({ map: TX.soil, roughness: 1 }),
    strip: new THREE.MeshStandardMaterial({ color: '#e7c66b', roughness: 1, transparent: true, opacity: 0.55, depthWrite: false }),
  };
  const edgeMat = { home: mat('#d9362b', { roughness: 0.6 }), other: mat('#2d2d2d', { roughness: 0.8 }) };
  const edge = (a, b, m, w = 0.3) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    const e = box(L, 0.25, w, m, (a[0] + b[0]) / 2, GROUND + 0.12, (a[1] + b[1]) / 2, false);
    e.rotation.y = Math.atan2(-dz, dx);
    group.add(e);
  };
  const stone = mat('#f4f1ea', { roughness: 0.8 });
  for (const parcel of PARCELS) {
    const pts = parcel.poly.map(W);
    if (parcel.kind !== 'home') {
      const m = new THREE.Mesh(flatPoly(pts, GROUND + (parcel.kind === 'strip' ? -0.05 : -0.1), TX.soil.userData.world), fills[parcel.kind]);
      m.receiveShadow = true;
      group.add(m);
    }
    for (let i = 0; i < pts.length; i++) {
      edge(pts[i], pts[(i + 1) % pts.length], parcel.kind === 'home' ? edgeMat.home : edgeMat.other, parcel.kind === 'home' ? 0.45 : 0.25);
      group.add(box(0.8, 1.6, 0.8, stone, pts[i][0], GROUND + 0.8, pts[i][1]));
    }
    const [lx, lz] = centroid(pts);
    const el = label(`<b>${parcel.label}</b>${parcel.sub ? `<span>${parcel.sub}</span>` : ''}`, `slabel ${parcel.kind}`);
    el.position.set(lx, parcel.kind === 'home' ? WALL_H + 6 : GROUND + 2, lz);
    siteLabels.add(el);
  }
  for (const d of DIMENSIONS) {
    const a = W(d.a), b = W(d.b);
    const el = label(d.text, 'dlabel');
    const t = d.at ?? 0.5;
    el.position.set(a[0] + (b[0] - a[0]) * t, GROUND + 0.6, a[1] + (b[1] - a[1]) * t);
    siteLabels.add(el);
  }

  // a few trees on the open plots and across the road
  const R = rng(4242);
  const trunk = mat('#6b4a32', { roughness: 0.9 });
  const leaves = [mat('#5b8c3a', { roughness: 0.9, flatShading: true }), mat('#6f9b45', { roughness: 0.9, flatShading: true }), mat('#4b7a33', { roughness: 0.9, flatShading: true })];
  const inPoly = (x, z, pts) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  const spots = [];
  for (const id of ['thirupathi', 'thirumal']) {
    const poly = PARCELS.find((q) => q.id === id).poly.map(W);
    for (let k = 0; k < 7; k++) {
      const pt = [0, 0];
      const xs = poly.map((q) => q[0]), zs = poly.map((q) => q[1]);
      for (let tries = 0; tries < 40; tries++) {
        pt[0] = Math.min(...xs) + R() * (Math.max(...xs) - Math.min(...xs));
        pt[1] = Math.min(...zs) + R() * (Math.max(...zs) - Math.min(...zs));
        if (inPoly(pt[0], pt[1], poly)) { spots.push([...pt]); break; }
      }
    }
  }
  for (let k = 0; k < 14; k++) spots.push(W([-60 + k * 14 + R() * 6, -30 - R() * 14]));
  for (const [x, z] of spots) {
    const s = 0.8 + R() * 0.7;
    const t = new THREE.Group();
    t.add(cyl(0.35 * s, 0.5 * s, 7 * s, trunk, 0, 3.5 * s, 0, 8));
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(5 * s, 1), leaves[k3(x, z) % 3]);
    crown.position.y = 9 * s;
    crown.castShadow = true;
    t.add(crown);
    t.position.set(x, GROUND, z);
    group.add(t);
  }

  const all = [...PARCELS.flatMap((q) => q.poly), ...ROADS.filter((r) => r.id !== 'gp').flatMap((r) => r.poly)].map(W);
  const xs = all.map((q) => q[0]), zs = all.map((q) => q[1]);
  return {
    group,
    bounds: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)],
    toWorld: W,
  };
}
const k3 = (x, z) => Math.abs(Math.floor(x * 7 + z * 13));
