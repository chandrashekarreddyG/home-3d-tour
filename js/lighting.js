// Interior lighting designs. Each scheme is a group of visible fixtures plus, per room, the points
// where the live light pool is placed (main.js moves a fixed set of point lights to the nearest ones).
import * as THREE from 'three';
import { boxGeo } from './materials.js';

export const LIGHTS = [
  { id: 'down', name: 'Recessed downlights', blurb: 'A grid of 150 mm recessed LED downlights, about 1.35 m apart (1.0 m in toilets).' },
  { id: 'profile', name: 'LED profile lines', blurb: 'Recessed aluminium LED profiles, 40 mm wide: a frame 450 mm in from the walls in living rooms and bedrooms, and a single line elsewhere.' },
  { id: 'cove', name: 'Cove ceiling', blurb: 'Gypsum false-ceiling border (600 mm wide, 250 mm drop, so 2.49 m clear under it) with a hidden LED strip washing the ceiling and downlights in the border.' },
  { id: 'pendant', name: 'Pendants & wall washers', blurb: 'Three pendants over the dining table, bedside pendants, and up/down wall washers in the living spaces. Downlights elsewhere.' },
];
export const LIGHT_TEMPS = [
  { id: '2700', name: 'Warm 2700K', color: '#ffc893' },
  { id: '4000', name: 'Neutral 4000K', color: '#ffe6cc' },
  { id: '6500', name: 'Cool 6500K', color: '#f2f5ff' },
];

export function buildLighting({ rooms, furniture, openings, M, K, parent, stairs, ceil }) {
  const groups = { down: new THREE.Group(), profile: new THREE.Group(), cove: new THREE.Group(), pendant: new THREE.Group() };
  for (const g of Object.values(groups)) { g.visible = false; parent.add(g); }
  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(boxGeo(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    return m;
  };
  const inRect = (x, z, r) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
  const area = (r) => (r[2] - r[0]) * (r[3] - r[1]);

  const downs = (room, group, pts, rect = room.main, y = ceil, sp = room.finish === 'bath' ? 1.0 : 1.35) => {
    const r = rect;
    const habitable = isHabitable(room);
    const [cx, cz] = room.center;
    if (room.outdoor) {
      const horiz = r[2] - r[0] > r[3] - r[1];
      const n = Math.max(1, Math.round((horiz ? r[2] - r[0] : r[3] - r[1]) / 2.5));
      for (let i = 0; i < n; i++) {
        const x = horiz ? r[0] + ((r[2] - r[0]) * (i + 0.5)) / n : (r[0] + r[2]) / 2;
        const z = horiz ? (r[1] + r[3]) / 2 : r[1] + ((r[3] - r[1]) * (i + 0.5)) / n;
        if (inRect(x, z, stairs)) continue;
        const dl = K.downlight(); dl.position.set(x, y, z); group.add(dl); pts.push([x, y - 0.12, z]);
      }
      return;
    }
    const nx = Math.max(1, Math.round((r[2] - r[0] - 0.6) / sp)), nz = Math.max(1, Math.round((r[3] - r[1] - 0.6) / sp));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const x = r[0] + ((r[2] - r[0]) * (i + 0.5)) / nx, z = r[1] + ((r[3] - r[1]) * (j + 0.5)) / nz;
      if (habitable && Math.hypot(x - cx, z - cz) < 0.75) continue; // fan
      const dl = K.downlight(); dl.position.set(x, y, z); group.add(dl); pts.push([x, y - 0.12, z]);
    }
    if (!pts.length) pts.push([cx, y - 0.12, cz]);
  };
  const strip = (group, pts, x0, z0, x1, z1, y = ceil - 0.004) => {
    const L = Math.hypot(x1 - x0, z1 - z0), alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    group.add(box(alongX ? L + 0.02 : 0.06, 0.006, alongX ? 0.06 : L + 0.02, M.alu, mx, y, mz));
    group.add(box(alongX ? L : 0.04, 0.008, alongX ? 0.04 : L, M.lamp, mx, y - 0.004, mz));
    const n = Math.max(1, Math.round(L / 1.6));
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; pts.push([x0 + (x1 - x0) * t, y - 0.15, z0 + (z1 - z0) * t]); }
  };

  for (const room of rooms) {
    const P = (room.lightPts = { down: [], profile: [], cove: [], pendant: [] });
    const r = room.main;
    const w = r[2] - r[0], d = r[3] - r[1];
    const [cx, cz] = room.center;
    const habitable = isHabitable(room);

    // --- downlights (as built) ---
    downs(room, groups.down, P.down);

    // --- profile lines ---
    if (room.outdoor) downs(room, groups.profile, P.profile);
    else if (habitable && w > 2.4 && d > 2.4) {
      const i = 0.45, [a, b, c, e] = [r[0] + i, r[1] + i, r[2] - i, r[3] - i];
      strip(groups.profile, P.profile, a, b, c, b);
      strip(groups.profile, P.profile, a, e, c, e);
      strip(groups.profile, P.profile, a, b + 0.03, a, e - 0.03);
      strip(groups.profile, P.profile, c, b + 0.03, c, e - 0.03);
    } else if (w >= d) strip(groups.profile, P.profile, r[0] + 0.3, cz, r[2] - 0.3, cz);
    else strip(groups.profile, P.profile, cx, r[1] + 0.3, cx, r[3] - 0.3);

    // --- cove false ceiling ---
    if (habitable && w > 2.6 && d > 2.6) {
      const bw = 0.6, drop = 0.25, t = 0.1, yb = ceil - drop + t / 2;
      const band = [
        [r[0], r[1], r[2], r[1] + bw], [r[0], r[3] - bw, r[2], r[3]],
        [r[0], r[1] + bw, r[0] + bw, r[3] - bw], [r[2] - bw, r[1] + bw, r[2], r[3] - bw],
      ];
      for (const q of band) groups.cove.add(box(q[2] - q[0], t, q[3] - q[1], M.ceiling, (q[0] + q[2]) / 2, yb, (q[1] + q[3]) / 2));
      // inner lip + hidden LED strip on top of the band, facing the ceiling
      const ix0 = r[0] + bw, iz0 = r[1] + bw, ix1 = r[2] - bw, iz1 = r[3] - bw;
      const lipY = ceil - drop + t + 0.04;
      for (const [x0, z0, x1, z1] of [[ix0, iz0, ix1, iz0], [ix0, iz1, ix1, iz1], [ix0, iz0, ix0, iz1], [ix1, iz0, ix1, iz1]]) {
        const alongX = z0 === z1, L = alongX ? x1 - x0 : z1 - z0;
        groups.cove.add(box(alongX ? L : 0.03, 0.08, alongX ? 0.03 : L, M.ceiling, (x0 + x1) / 2, lipY, (z0 + z1) / 2));
        const off = 0.06;
        const sx = alongX ? (x0 + x1) / 2 : x0 + (x0 === ix0 ? -off : off), sz = alongX ? z0 + (z0 === iz0 ? -off : off) : (z0 + z1) / 2;
        groups.cove.add(box(alongX ? L : 0.02, 0.01, alongX ? 0.02 : L, M.lamp, sx, ceil - drop + t + 0.006, sz));
        const n = Math.max(1, Math.round(L / 1.6));
        for (let k = 0; k < n; k++) { const tt = (k + 0.5) / n; P.cove.push([alongX ? x0 + (x1 - x0) * tt : sx, ceil - 0.1, alongX ? sz : z0 + (z1 - z0) * tt]); }
      }
      // downlights centred in the border
      for (const [x0, z0, x1, z1] of [[r[0] + bw / 2, r[1] + bw / 2, r[2] - bw / 2, r[1] + bw / 2], [r[0] + bw / 2, r[3] - bw / 2, r[2] - bw / 2, r[3] - bw / 2]]) {
        const n = Math.max(2, Math.round((x1 - x0) / 1.4));
        for (let k = 0; k < n; k++) {
          const dl = K.downlight();
          dl.position.set(x0 + ((x1 - x0) * (k + 0.5)) / n, ceil - drop, z0);
          P.cove.push([dl.position.x, ceil - drop - 0.15, z0]); // the border's downlights also light the room
          groups.cove.add(dl);
        }
      }
    } else downs(room, groups.cove, P.cove);

    // --- pendants & wall washers ---
    const items = furniture.filter((f) => f.room === room.name && f.rect);
    const table = items.find((f) => /Dining table/i.test(f.name));
    const bed = items.find((f) => /bed/i.test(f.name) && !/Diwan/i.test(f.name));
    let used = false;
    const pendant = (x, z, yBottom, big) => {
      const len = ceil - yBottom - 0.2;
      groups.pendant.add(box(0.012, len, 0.012, M.black, x, yBottom + 0.2 + len / 2, z));
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(big ? 0.09 : 0.07, big ? 0.2 : 0.14, big ? 0.24 : 0.2, 28, 1, true), M.walnut);
      shade.material = M.walnut;
      shade.position.set(x, yBottom + 0.1, z);
      shade.castShadow = true;
      groups.pendant.add(shade);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 10), M.lamp);
      bulb.position.set(x, yBottom + 0.06, z);
      groups.pendant.add(bulb);
      groups.pendant.add(box(0.1, 0.02, 0.1, M.black, x, ceil - 0.01, z));
      P.pendant.push([x, yBottom, z]);
    };
    if (table) {
      const [x0, z0, x1, z1] = table.rect, tcx = (x0 + x1) / 2, tcz = (z0 + z1) / 2, alongX = x1 - x0 > z1 - z0;
      const n = 3, L = Math.min(1.1, (alongX ? x1 - x0 : z1 - z0) * 0.5);
      for (let k = 0; k < n; k++) {
        const o = (k - 1) * (L / 2);
        pendant(alongX ? tcx + o : tcx, alongX ? tcz : tcz + o, 1.6, true);
      }
      used = true;
    }
    if (bed) {
      const [x0, z0, x1] = bed.rect;
      pendant(x0 + 0.225, z0 + 0.22, 1.15, false);
      pendant(x1 - 0.225, z0 + 0.22, 1.15, false);
      used = true;
    }
    if (habitable && ['Living', 'Great Room', 'Hall', 'Drawing Room'].includes(room.name)) {
      // up/down wall washers on the two longer walls, kept off doors and windows
      const longX = w >= d;
      const walls = longX ? [['n', r[1]], ['s', r[3]]] : [['w', r[0]], ['e', r[2]]];
      for (const [side, f] of walls) {
        for (const t of [0.25, 0.5, 0.75]) {
          const x = longX ? r[0] + w * t : f, z = longX ? f : r[1] + d * t;
          const along = longX ? x : z;
          const blocked = openings.some((o) => o.vertical === !longX && Math.abs(o.c - (longX ? z : x)) < 0.3 && along > o.a - 0.25 && along < o.b + 0.25);
          if (blocked) continue;
          const n = { n: [0, 1], s: [0, -1], w: [1, 0], e: [-1, 0] }[side];
          const px = x + n[0] * 0.06, pz = z + n[1] * 0.06;
          groups.pendant.add(box(longX ? 0.12 : 0.12, 0.3, longX ? 0.12 : 0.12, M.alu, px, 2.0, pz));
          groups.pendant.add(box(0.09, 0.012, 0.09, M.lamp, px, 2.16, pz));
          groups.pendant.add(box(0.09, 0.012, 0.09, M.lamp, px, 1.84, pz));
          P.pendant.push([px + n[0] * 0.3, 2.3, pz + n[1] * 0.3]);
        }
      }
      used = true;
    }
    if (!used || room.finish === 'kitchen' || P.pendant.length < 2) downs(room, groups.pendant, P.pendant);
  }
  return groups;
}

function isHabitable(room) {
  return !room.outdoor && ['wood', 'tile'].includes(room.finish) && room.tour;
}
