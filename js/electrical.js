// Electrical layout: every switchboard and power point in the house, placed by rule from the door, window and
// furniture plan of the model (never by eye). Heights are to the centre of the box above finished floor level.
// The rules are common Indian practice, consistent with NBC 2016 Part 8 §2 and IS 732 (wiring), IS 3854 / IS 1293
// (switches, sockets) and the 2021 Harmonised Accessibility Guidelines; see RULES for each figure and its source.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// heights to the centre of the box, metres above finished floor
export const H = {
  door: 1.1, bedside: 0.8, socket: 0.375, counter: 1.1, fridge: 1.25, chimney: 2.2, ac: 2.3,
  geyser: 1.95, exhaust: 1.95, db: 1.65, vdp: 1.45, bell: 1.35, outdoor: 0.6,
};
const FROM_FRAME = 0.175; // door board edge from the door opening (rule: 150–200 mm from the frame)

const SRC = 'common Indian practice (Aaditya Interior, “Electrical switch and socket heights in India”, 2026), in line with NBC 2016 Pt 8 §2 / IS 732';
export const RULES = [
  ['Room switchboard at the door', '1.10 m to centre', 'Latch (opening) side, 175 mm from the door opening, never behind the door leaf; one height in every room (1.10–1.20 m; 1.10 m also suits children and seated users). ' + SRC],
  ['Bedside boards (both sides of the bed)', '0.80 m', 'Above the side tables (0.50 m), beside — not behind — the headboard; 2-way main light, fan regulator, USB and 6 A socket (700–900 mm rule).'],
  ['General sockets (sofa side)', '0.375 m', 'Above the skirting (300–450 mm rule), at the end of the sofa where a lamp or charger is used.'],
  ['TV wall', 'screen centre (≈ 1.14–1.17 m) + 170 mm above the console', 'On the TV feature panel: power and TV/data hidden behind the screen; a second board 170 mm above the floating console for set-top box / sound bar.'],
  ['Kitchen counter boards', '1.10 m', '200 mm above the 910 mm counter, ≥ 300 mm clear of the sink edge, none above the hob, none inside a window; 16 A + 6 A.'],
  ['Refrigerator', '1.25 m beside the fridge', 'Beside, not behind, the appliance so it can be unplugged without moving it.'],
  ['Chimney', '2.20 m', 'Just above the wall cabinets beside the chimney duct (2100–2200 mm rule).'],
  ['Bathroom switches', '1.10 m, outside the door', 'Light, mirror light, exhaust and a 20 A geyser switch with indicator outside the wet room (keep water and switches apart; 30 mA RCCB).'],
  ['Geyser point', '1.95 m', 'Inside, beside the shower wall but out of the spray (1800–2000 mm rule).'],
  ['Exhaust fan point', '1.95 m', 'Beside the ventilator that takes the exhaust fan.'],
  ['Split AC point', '2.25 m', 'On the room’s outer wall where possible (short pipe run), not on the bed-head wall, clear of wardrobes (2100–2300 mm rule).'],
  ['Main distribution board (DB)', '1.65 m to centre', 'Inside the main entrance beside the living-room board, reachable without a stool; MCBs per circuit + 30 mA RCCB.'],
  ['Video door phone', '1.45 m', 'Outdoor unit with bell push at the main door, monitor inside beside the entrance board (1400–1500 mm rule).'],
  ['Outdoor sockets / bell', '0.60 m / 1.35 m', 'Weatherproof box with cover, above mopping splash; bell push at the side entrance.'],
  ['Staircase', '1.10 m', 'Two-way switch at the stair foot; the top switch needs the roof-level stair cabin (not on the drawings).'],
];

// devices: code → [modules, label]
const DEV = {
  S: [1, 'light'], S2: [1, '2-way light'], F: [1, 'fan'], R: [1, 'fan regulator'], U: [1, 'USB charger'], D: [1, 'data outlet'],
  T: [1, 'TV outlet'], I: [1, 'indicator'], B: [1, 'bell push'], C: [1, 'exhaust connection'], S16: [1, '16 A switch'], S20: [1, '20 A geyser switch'],
  P6: [2, '6 A socket'], P16: [2, '16 A socket'], X: [1, 'blank'],
};
const d = (code, label) => [code, label || DEV[code][1]];
const TPL = {
  living: [d('S', 'main light'), d('S', 'cove light'), d('S', 'accent lights'), d('F'), d('R'), d('P6')],
  bedroom: [d('S2', 'main light (2-way)'), d('S', 'cove light'), d('S', 'wardrobe / dresser light'), d('F'), d('R'), d('P6')],
  kitchen: [d('S', 'main light'), d('S', 'under-cabinet strip'), d('S', 'exhaust fan'), d('F'), d('R')],
  dining: [d('S', 'main light'), d('S', 'pendant over table'), d('F'), d('R'), d('P6')],
  generic: [d('S', 'main light'), d('S', 'second light'), d('F'), d('R'), d('P6')],
  passage: [d('S2', 'passage light (2-way)'), d('S', 'night light')],
  entry: [d('S', 'verandah light'), d('S', 'gate & compound lights')],
  bath: [d('S', 'bathroom light'), d('S', 'mirror light'), d('S', 'exhaust fan'), d('S20'), d('I', 'geyser indicator')],
  pooja: [d('S', 'pooja light'), d('S', 'deity spot light'), d('P6', 'socket for electric diya')],
  bedside: [d('S2', 'main light (2-way)'), d('S', 'reading light'), d('R'), d('U'), d('P6')],
  counter: [d('S16'), d('P16', '16 A socket (mixer, microwave, kettle)'), d('P6')],
  fridge: [d('S16'), d('P16', '16 A socket (refrigerator)')],
  chimney: [d('P6', 'chimney socket')],
  geyser: [d('P16', 'geyser outlet (switched outside)')],
  exhaust: [d('C', 'exhaust fan connection (switched outside)')],
  ac: [d('S16'), d('I'), d('P16', '16 A socket (split AC)')],
  tvBack: [d('P6', 'TV'), d('P6', 'spare'), d('T'), d('D')],
  console: [d('P6', 'set-top box'), d('P6', 'sound bar / router'), d('U')],
  sofa: [d('P6', 'lamp / charger'), d('U')],
  stair: [d('S2', 'stair light (2-way)')],
  bellSide: [d('B')],
  outdoor: [d('P6', 'weatherproof socket')],
};
const MODS = [1, 2, 3, 4, 6, 8, 10, 12];
const U = 0.0225; // one module, 22.5 mm
function plateOf(items) {
  const n = items.reduce((s, [c]) => s + DEV[c][0], 0);
  const mods = MODS.find((m) => m >= n) || n;
  return { mods, used: n, w: Math.max(0.087, mods * U + 0.04), h: 0.087 };
}
const SPECIAL = {
  db: { w: 0.33, h: 0.45, mods: 0, label: 'Main DB: 2-pole isolator, 30 mA RCCB, MCB per circuit (lights, sockets, kitchen, geysers, each AC)' },
  vdpIn: { w: 0.22, h: 0.15, mods: 0, label: 'Video door phone monitor' },
  vdpOut: { w: 0.1, h: 0.18, mods: 0, label: 'Video door phone outdoor unit with bell push' },
  wp: { w: 0.11, h: 0.11, mods: 2, label: 'Weatherproof 6 A socket with cover (IP55)' },
};

const NORMAL = { n: [0, 1], s: [0, -1], w: [1, 0], e: [-1, 0] };
const overlap = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
const heightOf = (name) => [
  [/Wardrobe/i, 2.13], [/Crockery/i, 2.1], [/Refrigerator/i, 1.82], [/counter/i, 0.93], [/TV feature wall/i, 2.4], [/bed/i, 1.23],
  [/Sofa/i, 0.9], [/Vanity/i, 2.05], [/EWC/i, 0.85], [/Dining/i, 0.95], [/planter/i, 1.6], [/Coffee/i, 0.5], [/Diwan/i, 0.75], [/Mandir/i, 2.2],
].find(([re]) => re.test(name))?.[1] ?? 1.0;

export function buildElectrical({ rooms, openings, fixtures, furniture, roomAt, IN, stairs }) {
  const byName = (n) => rooms.find((r) => r.name === n);
  const isWet = (r) => !!r && (r.finish === 'bath' || /Toilet|Bath/i.test(r.name));
  const isPooja = (r) => !!r && r.name === 'Pooja';
  const isCirc = (r) => !!r && /Passage|Lobby/.test(r.name);
  const rank = (r) => (!r || r.outdoor ? 0 : /Living|Great/.test(r.name) ? 1 : /Dining/.test(r.name) ? 2 : isCirc(r) ? 3 : /Cooking|Kitchen/.test(r.name) ? 4 : isPooja(r) ? 6 : isWet(r) ? 7 : 5);
  const tplFor = (r) => (/Bed/.test(r.name) ? TPL.bedroom : /Cooking|Kitchen/.test(r.name) ? TPL.kitchen : /Dining/.test(r.name) ? TPL.dining : /Living|Great/.test(r.name) ? TPL.living : isCirc(r) ? TPL.passage : TPL.generic);

  const ops = openings.map((o) => ({ ...o, A: o.a * IN, B: o.b * IN, C: o.c * IN, T: o.t * IN }));
  const doors = ops.filter((o) => ['d', 'dt', 'dd', 'a'].includes(o.kind));
  const sidesOf = (o) => [byName(o.sides[0]), byName(o.sides[1])]; // index 0 ↔ the −1 side, 1 ↔ +1

  // wall faces
  const openFace = (o, sgn) => ({ vertical: o.vertical, fc: o.C + (sgn * o.T) / 2, n: o.vertical ? [sgn, 0] : [0, sgn] });
  const sideFace = (room, side, along) => {
    const ns = side === 'n' || side === 's';
    const r = room.rects.find((q) => (ns ? along >= q[0] && along <= q[2] : along >= q[1] && along <= q[3])) || room.main;
    return { vertical: !ns, fc: { n: r[1], s: r[3], w: r[0], e: r[2] }[side], n: NORMAL[side] };
  };
  const at = (f, A, off = 0) => (f.vertical ? [f.fc + f.n[0] * off, A] : [A, f.fc + f.n[1] * off]);

  // obstacles in front of walls: furniture (by height; the TV feature wall is tagged so its own boards may sit on
  // it) and open door leaves
  const obstacles = [];
  for (const f of furniture) if (f.rect) obstacles.push({ rect: f.rect, y0: 0, y1: heightOf(f.name), name: f.name, room: f.room, tv: /TV feature wall/.test(f.name) });
  for (const o of ops) for (const lf of o.leaves || []) obstacles.push({ rect: lf.rect, y0: 0, y1: 2.15, name: 'open door leaf' });

  const placed = [];
  const misses = [];
  // why a plate can't go at A on face f (null = free). q.soft: a plate below the sill may sit behind the curtain;
  // q.solo: keep it clear of every other plate along the wall (DB, door phone), not just at the same height
  function blocked(f, room, A, y, w, h, q = {}) {
    const ignore = q.ignore || (() => false), soft = !!q.soft;
    for (const a of [A - w / 2 - 0.1, A, A + w / 2 + 0.1]) {
      const [x, z] = at(f, a, 0.15);
      const r = roomAt(x, z);
      if (!r || r.name !== room.name) return 'wall end or corner';
    }
    for (const o of ops) {
      if (o.vertical !== f.vertical || Math.abs(o.C - f.fc) > o.T / 2 + 0.02) continue;
      const curtain = o.kind === 'w' && !soft && !room.outdoor && !['bath', 'kitchen'].includes(room.finish) && room.name !== 'Pooja';
      const m = curtain ? 0.3 : 0.12;
      const y0 = curtain ? 0 : o.lo - 0.02, y1 = curtain ? 2.25 : o.hi + 0.05; // curtain stack to the rod top
      const yw = y + (room.floorY || 0); // heights are above the room's own floor (a verandah may sit below the house floor)
      if (A + w / 2 > o.A - m && A - w / 2 < o.B + m && yw + h / 2 > y0 && yw - h / 2 < y1) return o.kind === 'w' || o.kind === 'v' ? 'window' : 'door frame';
    }
    const [ax, az] = at(f, A - w / 2, 0), [bx, bz] = at(f, A + w / 2, 0.15);
    const zone = [Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz)];
    for (const ob of obstacles) {
      if (ignore(ob) || !overlap(zone, ob.rect)) continue;
      if (y + h / 2 > ob.y0 && y - h / 2 < ob.y1) return ob.name;
    }
    for (const p of placed) {
      if (p.face.vertical !== f.vertical || Math.abs(p.face.fc - f.fc) > 0.03) continue;
      if (Math.abs(A - p.A) < (w + p.w) / 2 + 0.04 && (q.solo || Math.abs(y - p.y) < (h + p.h) / 2 + 0.03)) return 'another board';
    }
    return null;
  }
  // first free position from A0 stepping along dir (or both ways) in 50 mm steps
  function findSpot(f, room, A0, dir, y, w, h, opts = {}) {
    const { max = 0.8, both = false } = opts;
    for (let k = 0; k * 0.05 <= max + 1e-6; k++) {
      for (const s of both && k ? [1, -1] : [1]) {
        const A = A0 + s * dir * k * 0.05;
        if (!blocked(f, room, A, y, w, h, opts)) return A;
      }
    }
    return null;
  }
  function add(room, board, f, A, y, items, special, why, q = {}) {
    const size = special ? SPECIAL[special] : plateOf(items);
    const [x, z] = at(f, A, q.proud || 0); // proud: mounted on a panel in front of the wall (TV feature wall)
    const rec = { id: `E${placed.length + 1}`, room: room.name, serves: room.name, board, face: f, A, y, w: size.w, h: size.h, items, special, why, pos: [x, y + (room.floorY || 0), z], mods: size.mods, q };
    placed.push(rec);
    return rec;
  }
  function place(room, board, f, A0, dir, y, items, why, opts = {}) {
    const size = opts.special ? SPECIAL[opts.special] : plateOf(items);
    const A = findSpot(f, room, A0, dir, y, size.w, size.h, opts);
    if (A == null) { if (!opts.quiet) misses.push(`${room.name}: ${board} — no clear wall near the planned spot (blocked: ${blocked(f, room, A0, y, size.w, size.h, opts)}); confirm on site.`); return null; }
    return add(room, board, f, A, y, items, opts.special, why, opts);
  }
  const swingOf = (o) => (o.kind === 'a' ? 0 : o.kind === 'dd' ? (o.swing === '-' ? -1 : 1) : o.swing[1] === '-' ? -1 : 1);
  // board beside a door, on the face of `room` (side sgn of the opening). Order of preference:
  //  1 latch side on the door wall, 175 mm from the opening      2 the other side, where the door opens away from this face
  //  3 the return wall at the latch-side corner                   4 the other corner (door opening away)
  //  5 the hinge-side return wall just past the open leaf         6 the latch side further along the door wall (≤ 1.6 m)
  //  7 (open arches, opts.other) the neighbouring room's side of the arch
  function doorBoard(o, sgn, room, board, items, why, y = H.door, opts = {}) {
    const f = openFace(o, sgn);
    const size = opts.special ? SPECIAL[opts.special] : plateOf(items);
    const q = { ignore: opts.ignore, solo: opts.solo };
    const latch = o.hinge ? (o.hinge === 'a' ? 'b' : 'a') : 'b';
    const freeBoth = !o.hinge || swingOf(o) !== sgn; // nothing swings against this face's hinge side
    const ends = freeBoth ? [latch, latch === 'a' ? 'b' : 'a'] : [latch];
    const tried = [];
    const onWall = (end, max) => {
      const edge = end === 'b' ? o.B : o.A, dir = end === 'b' ? 1 : -1;
      for (const gap of [FROM_FRAME, 0.15]) { // 175 mm, else the 150 mm end of the 150–200 mm rule
        const A0 = edge + dir * (gap + size.w / 2);
        const A = findSpot(f, room, A0, dir, y, size.w, size.h, { ...q, max });
        if (A == null) { tried.push(blocked(f, room, A0, y, size.w, size.h, q)); continue; }
        const moved = Math.abs(A - A0) > 0.06 ? ` (moved ${Math.round(Math.abs(A - A0) * 1000)} mm along to clear: ${blocked(f, room, A0, y, size.w, size.h, q)})` : gap !== FROM_FRAME ? ' (150 mm from the opening: narrow pier)' : '';
        return { f, A, note: (end === latch ? '' : o.kind === 'a' ? ' — on the other side of the arch' : ' — on the hinge side, which is free because the door opens away from this face') + moved };
      }
      return null;
    };
    // perpendicular wall of this room at the corner beyond `end`; pastLeaf starts beyond the open door leaf
    const onReturn = (end, pastLeaf = 0) => {
      const edge = end === 'b' ? o.B : o.A, dir = end === 'b' ? 1 : -1;
      const [px, pz] = at(f, edge + dir * 0.05, 0.3);
      const r = room.rects.find((qq) => px >= qq[0] && px <= qq[2] && pz >= qq[1] && pz <= qq[3]);
      if (!r) return null;
      const e = f.vertical ? (dir > 0 ? r[3] : r[1]) : (dir > 0 ? r[2] : r[0]);
      if (Math.abs(e - edge) > 2.5) return null;
      const rf = f.vertical ? { vertical: false, fc: e, n: [0, -dir] } : { vertical: true, fc: e, n: [-dir, 0] };
      const into = f.vertical ? f.n[0] : f.n[1];
      const A0 = f.fc + into * (Math.max(0.15, pastLeaf + 0.15) + size.w / 2);
      const A = findSpot(rf, room, A0, into, y, size.w, size.h, { ...q, max: 1.0 });
      if (A == null) return null;
      const off = Math.round((Math.abs(A - f.fc) - size.w / 2) * 1000);
      return { f: rf, A, note: pastLeaf ? ` — on the side wall ${off} mm from the door wall, just past the open leaf (latch side blocked: ${tried[0]})` : ` — on the return wall ${off} mm from the door wall (door-wall side blocked: ${tried[0] || 'no room'})` };
    };
    const leafLen = o.leaves?.[0]?.sweep || 0;
    let hit = onWall(ends[0], 0.8) || (ends[1] && onWall(ends[1], 0.8)) || onReturn(ends[0]) || (ends[1] && onReturn(ends[1]))
      || (o.hinge && !freeBoth && onReturn(o.hinge, leafLen)) || onWall(ends[0], 1.6);
    let host = room;
    if (!hit && opts.other && o.kind === 'a') {
      const nb = sidesOf(o)[sgn < 0 ? 1 : 0];
      if (nb && !nb.outdoor) {
        const f2 = openFace(o, -sgn);
        for (const end of ['b', 'a']) {
          const edge = end === 'b' ? o.B : o.A, dir = end === 'b' ? 1 : -1, A0 = edge + dir * (FROM_FRAME + size.w / 2);
          const A = findSpot(f2, nb, A0, dir, y, size.w, size.h, { ...q, max: 0.8 });
          if (A != null) { hit = { f: f2, A, note: ` — on the ${nb.name} side of the open arch (no wall beside it in ${room.name})` }; host = nb; break; }
        }
      }
    }
    if (hit) { const rec = add(host, board, hit.f, hit.A, y, items, opts.special, why + hit.note, q); rec.serves = opts.serves || room.name; return rec; }
    if (!opts.quiet) misses.push(`${room.name}: ${board} — no clear wall beside the ${o.sides.join(' / ')} door (${[...new Set(tried)].join(', ')}); confirm on site.`);
    return null;
  }

  const doorsOf = (room) => doors.filter((o) => o.sides.includes(room.name));
  const otherSide = (o, room) => { const [a, b] = sidesOf(o); return o.sides[0] === room.name ? { sgnIn: -1, other: b, otherName: o.sides[1] } : { sgnIn: 1, other: a, otherName: o.sides[0] }; };
  const isOuterDoor = (o) => o.outer;
  const mainDoor = doors.find((o) => o.outer && o.kind === 'dd' && !o.vertical) || doors.find((o) => o.outer);
  const latchWhy = (o) => (o.kind === 'a' ? `beside the arch to ${o.sides.join(' / ')}, ${Math.round(FROM_FRAME * 1000)} mm from the opening` : `latch side of the door to ${o.sides.join(' / ')}, ${Math.round(FROM_FRAME * 1000)} mm from the opening, clear of the open leaf`);

  // ---------- 1. wet rooms and pooja: board outside the door ----------
  for (const room of rooms.filter((r) => isWet(r) || isPooja(r))) {
    const o = doorsOf(room).sort((p, q) => rank(otherSide(p, room).other) - rank(otherSide(q, room).other))[0];
    if (!o) continue;
    const { other } = otherSide(o, room);
    const sgnOut = o.sides[0] === room.name ? 1 : -1;
    const host = other || room;
    doorBoard(o, other ? sgnOut : -sgnOut, host, `${room.name} switches (outside the door)`, isWet(room) ? TPL.bath : TPL.pooja,
      `${isWet(room) ? 'Wet room: switches kept outside, ' : 'Pooja: '}${latchWhy(o)}`, H.door, { serves: room.name });
  }

  // ---------- 2. habitable rooms and passages: board at the most public door ----------
  for (const room of rooms.filter((r) => !r.outdoor && !isWet(r) && !isPooja(r))) {
    const cands = doorsOf(room).filter((o) => { const { other } = otherSide(o, room); return !isWet(other) && !isPooja(other); })
      .sort((p, q) => rank(otherSide(p, room).other) - rank(otherSide(q, room).other) || (q.B - q.A) - (p.B - p.A));
    if (!cands.length) continue;
    // the most public door first; if no wall there takes the board, the next door in line
    let prim = null;
    for (const o of cands) {
      const entry = isOuterDoor(o);
      const items = entry ? [...TPL.entry, ...tplFor(room)] : tplFor(room);
      const why = latchWhy(o) + (o !== cands[0] ? ` (the ${cands[0].sides.join(' / ')} door has no clear wall beside it)` : '');
      if (doorBoard(o, otherSide(o, room).sgnIn, room, entry || isOuterDoor(cands[0]) ? `${room.name} entrance board` : `${room.name} door board`, isOuterDoor(cands[0]) ? [...TPL.entry, ...tplFor(room)] : items, why, H.door, { other: true, quiet: true })) { prim = o; break; }
    }
    if (!prim) { misses.push(`${room.name}: door board — no clear wall beside any of its doors; confirm on site.`); continue; }
    if (prim !== cands[0] && isOuterDoor(cands[0])) {
      doorBoard(cands[0], otherSide(cands[0], room).sgnIn, room, `${room.name} side-entrance 2-way board`, [d('S2', 'main light (2-way)'), d('S', 'verandah light')],
        `${latchWhy(cands[0])}; a compact 2-way board because the full board would not fit beside this door`, H.door, { quiet: true });
    }
    // big rooms entered from two sides get a 2-way board at the second public door (≥ 2 m from the first);
    // passages get one at their far end
    const mid = (o) => (o.vertical ? [o.C, (o.A + o.B) / 2] : [(o.A + o.B) / 2, o.C]);
    const dist = (o) => Math.hypot(mid(o)[0] - mid(prim)[0], mid(o)[1] - mid(prim)[1]);
    const second = cands.slice(1).filter((o) => rank(otherSide(o, room).other) <= 5 && dist(o) >= 2).sort((p, q) => dist(q) - dist(p))[0];
    const area = (room.main[2] - room.main[0]) * (room.main[3] - room.main[1]);
    if (second && (area > 14 || isCirc(room))) doorBoard(second, otherSide(second, room).sgnIn, room, `${room.name} 2-way board`, TPL.passage, `2-way control from the second entrance; ${latchWhy(second)}`, H.door, { other: true });
  }

  // ---------- 3. main entrance extras: DB, video door phone, outdoor socket; side entrance bell ----------
  for (const o of doors.filter(isOuterDoor)) {
    const [a, b] = sidesOf(o);
    const insideSgn = a && !a.outdoor ? -1 : 1, inside = insideSgn < 0 ? a : b, outside = insideSgn < 0 ? b : a;
    if (!inside) continue;
    const main = o === mainDoor;
    const latchEnd = o.hinge === 'a' ? 'b' : 'a', dir = latchEnd === 'b' ? 1 : -1, edge = latchEnd === 'b' ? o.B : o.A;
    if (main) {
      // beside the entrance board, each clear of every other plate on the wall
      doorBoard(o, insideSgn, inside, 'Video door phone monitor', [], 'Beside the entrance board, 1.45 m (1400–1500 mm rule)', H.vdp, { special: 'vdpIn', solo: true });
      doorBoard(o, insideSgn, inside, 'Main distribution board (DB)', [], 'Inside the main entrance near the entrance board: reachable, dry, not in a bedroom, kitchen or bathroom', H.db, { special: 'db', solo: true });
    }
    if (outside) {
      const fOut = openFace(o, -insideSgn);
      if (main) place(outside, 'Video door phone outdoor unit + bell', fOut, edge + dir * (FROM_FRAME + 0.05), dir, H.vdp, [], 'Outside the main door on the latch side, camera at face height', { special: 'vdpOut', max: 1 });
      else place(outside, 'Bell push', fOut, edge + dir * (FROM_FRAME + 0.05), dir, H.bell, TPL.bellSide, 'Outside the side entrance on the latch side');
      place(outside, 'Outdoor socket (weatherproof)', fOut, edge + dir * (FROM_FRAME + 0.06), dir, H.outdoor, TPL.outdoor, 'Verandah socket for festival lights / cleaning, weatherproof, above mopping splash', { special: 'wp', max: 1.2 });
    }
  }

  // ---------- 4. furniture-driven boards ----------
  for (const fx of fixtures) {
    const room = byName(fx.room);
    if (!room) continue;
    if (fx.type === 'bed') {
      const f = sideFace(room, fx.side, fx.along);
      for (const s of [-1, 1]) place(room, `Bedside board (${s < 0 ? 'left' : 'right'})`, f, fx.along + s * fx.ns, s, H.bedside, TPL.bedside, 'Above the side table, beside the headboard (700–900 mm rule): 2-way light, fan regulator, USB, socket', { max: 0.3, soft: true, ignore: (ob) => /bed/i.test(ob.name) && ob.room === room.name });
    } else if (fx.type === 'tv') {
      const f = sideFace(room, fx.side, fx.along), [, , ch, c0] = fx.tv.console, onPanel = { ignore: (ob) => ob.tv, proud: 0.025 };
      place(room, 'TV wall board (behind the TV)', f, fx.along, 1, fx.tv.y, TPL.tvBack, `Hidden behind the ${fx.tv.inch}″ screen on the feature panel with TV/data outlets; 25 mm conduit down to the console`, { ...onPanel, max: 0.2, both: true });
      place(room, 'TV console board', f, fx.along + 0.3, 1, c0 + ch + 0.17, TPL.console, `170 mm above the floating console top (${Math.round((c0 + ch) * 1000)} mm), below the screen`, { ...onPanel, max: 0.3, both: true });
    } else if (fx.type === 'sofa') {
      const backSide = { n: 's', s: 'n', w: 'e', e: 'w' }[fx.facing];
      const along = (fx.a + fx.b) / 2;
      const f = sideFace(room, backSide, along);
      if (Math.abs(f.fc - fx.back) > 0.2) continue; // sofa not against a wall
      const items = TPL.sofa, w = plateOf(items).w;
      const end = [fx.b + 0.12 + w / 2, fx.a - 0.12 - w / 2].find((A) => !blocked(f, room, A, H.socket, w, 0.087));
      if (end != null) add(room, 'Sofa-side socket', f, end, H.socket, items, null, 'Beside the sofa arm for a lamp / phone charger (300–450 mm rule)');
    } else if (fx.type === 'fridge') {
      const f = sideFace(room, fx.side, fx.along), w = plateOf(TPL.fridge).w;
      const A = [fx.along + 0.35 + 0.08 + w / 2, fx.along - 0.35 - 0.08 - w / 2].find((a) => !blocked(f, room, a, H.fridge, w, 0.087));
      if (A != null) add(room, 'Refrigerator point', f, A, H.fridge, TPL.fridge, null, 'Beside the fridge, not behind it, on its own 16 A point');
      else place(room, 'Refrigerator point', f, fx.along, 1, 1.95, TPL.fridge, 'Above the fridge (sides blocked), reachable on its own 16 A point', { max: 0.2 });
    }
  }
  // kitchen counters: boards between the sink and hob zones
  for (const room of rooms.filter((r) => /Cooking|Kitchen/.test(r.name))) {
    const fxs = fixtures.filter((q) => q.room === room.name);
    const hob = fxs.find((q) => q.type === 'hob'), sink = fxs.find((q) => q.type === 'sink');
    const runs = fxs.filter((q) => q.type === 'counter').sort((p, q) => (q.b - q.a) - (p.b - p.a));
    let made = 0;
    for (const run of runs) {
      const f = sideFace(room, run.side, (run.a + run.b) / 2);
      const keep = [];
      if (hob && hob.side === run.side) keep.push([hob.along - 0.55, hob.along + 0.55]);
      if (sink && sink.side === run.side) keep.push([sink.along - 0.7, sink.along + 0.7]);
      let segs = [[run.a + 0.15, run.b - 0.15]];
      for (const [p, q] of keep) segs = segs.flatMap(([u, v]) => (q <= u || p >= v ? [[u, v]] : [[u, p], [q, v]].filter(([s, t]) => t - s > 0.15)));
      for (const [u, v] of segs.sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]))) {
        if (made >= 3) break;
        const rec = place(room, `Kitchen counter board ${made + 1}`, f, (u + v) / 2, 1, H.counter, TPL.counter, '200 mm above the counter, ≥ 300 mm from the sink edge, not above the hob', { max: Math.max(0, (v - u) / 2 - 0.06), both: true });
        if (rec) made++;
      }
    }
    if (hob) {
      const f = sideFace(room, hob.side, hob.along);
      place(room, 'Chimney point', f, hob.along + 0.32, 1, H.chimney, TPL.chimney, 'Above the wall cabinets beside the chimney duct', { max: 0.3, both: true });
    }
  }
  // bathrooms: exhaust beside the ventilator first (it can't move), then the geyser beside the shower wall
  for (const room of rooms.filter(isWet)) {
    const vent = ops.find((o) => o.kind === 'v' && o.sides.includes(room.name));
    if (vent) {
      const sgn = vent.sides[0] === room.name ? -1 : 1;
      place(room, 'Exhaust fan point', openFace(vent, sgn), vent.B + 0.12, 1, H.exhaust, TPL.exhaust, 'Beside the ventilator that houses the exhaust fan', { max: 0.4, both: true });
    }
    const sh = fixtures.find((q) => q.room === room.name && q.type === 'shower');
    if (sh) {
      const f = sideFace(room, sh.side, sh.along);
      const mid = sh.side === 'n' || sh.side === 's' ? (room.main[0] + room.main[2]) / 2 : (room.main[1] + room.main[3]) / 2;
      place(room, 'Geyser point', f, sh.along + Math.sign(mid - sh.along || 1) * 0.55, Math.sign(mid - sh.along || 1), H.geyser, TPL.geyser, 'Beside the shower, above the spray (1800–2000 mm rule); switched outside with indicator', { max: 0.6, both: true });
    } else {
      const wc = fixtures.find((q) => q.room === room.name && q.type === 'wc');
      const why = 'No shower drawn: geyser high on the wall, out of reach of splashes (1800–2000 mm rule); switched outside with indicator';
      let rec = wc && place(room, 'Geyser point', sideFace(room, wc.side, wc.along), wc.along + 0.45, 1, H.geyser, TPL.geyser, why, { max: 0.8, both: true, quiet: true });
      for (const s of ['n', 's', 'e', 'w']) {
        if (rec) break;
        const r = room.main, ns = s === 'n' || s === 's', lo = ns ? r[0] : r[1], hi = ns ? r[2] : r[3];
        rec = place(room, 'Geyser point', sideFace(room, s, (lo + hi) / 2), (lo + hi) / 2, 1, H.geyser, TPL.geyser, why, { max: (hi - lo) / 2 - 0.15, both: true, quiet: true });
      }
      if (!rec) misses.push(`${room.name}: Geyser point — no wall free at 1.95 m; confirm on site.`);
    }
  }
  // dining: a general socket (hot plate, lamp, charger) on a free wall above the skirting
  for (const room of rooms.filter((r) => /Dining/.test(r.name))) {
    if (placed.some((p) => p.room === room.name && p.items?.some(([c]) => c[0] === 'P'))) continue;
    const r = room.main;
    for (const s of ['e', 'w', 'n', 's']) {
      const ns = s === 'n' || s === 's', lo = ns ? r[0] : r[1], hi = ns ? r[2] : r[3];
      const rec = place(room, 'Dining socket', sideFace(room, s, (lo + hi) / 2), (lo + hi) / 2, 1, H.socket, [d('P6', '6 A socket (hot plate / lamp)'), d('U')], 'General socket above the skirting (300–450 mm rule) on a free wall', { max: (hi - lo) / 2 - 0.2, both: true, quiet: true });
      if (rec) break;
    }
  }
  // split AC points: bedrooms, living and great room
  const building = rooms.reduce((b, r) => (r.outdoor ? b : [Math.min(b[0], r.main[0]), Math.min(b[1], r.main[1]), Math.max(b[2], r.main[2]), Math.max(b[3], r.main[3])]), [Infinity, Infinity, -Infinity, -Infinity]);
  for (const room of rooms.filter((r) => !r.outdoor && (/Bed|Living|Great/.test(r.name)))) {
    const r = room.main, bedRoom = fixtures.some((q) => q.type === 'bed' && q.room === room.name);
    const sides = ['e', 'w', 's', 'n'].filter((s) => !(bedRoom && s === 'n'));
    const outer = (s) => Math.abs({ n: r[1] - building[1], s: building[3] - r[3], w: r[0] - building[0], e: building[2] - r[2] }[s]) < 0.05;
    sides.sort((p, q) => outer(q) - outer(p));
    let done = false;
    for (const s of sides) {
      const ns = s === 'n' || s === 's', lo = ns ? r[0] : r[1], hi = ns ? r[2] : r[3];
      const f = sideFace(room, s, (lo + hi) / 2);
      const rec = place(room, 'Split AC point', f, (lo + hi) / 2 + 0.55, 1, H.ac, TPL.ac, `${outer(s) ? 'Outer wall (short pipe run to the outdoor unit)' : 'Inner wall'}, right end of a 1.0 m indoor unit, clear of wardrobes${bedRoom ? ', not on the bed-head wall' : ''}`, { max: (hi - lo) / 2 - 0.3, both: true });
      if (rec) { done = true; break; }
    }
    if (!done) misses.push(`${room.name}: no wall free for a split AC point.`);
  }
  // staircase foot (front balcony)
  if (stairs) {
    const fb = rooms.find((q) => q.name === 'Front Balcony');
    if (fb) {
      const f = { vertical: false, fc: stairs[1], n: [0, 1] };
      place(fb, 'Staircase 2-way switch (foot)', f, stairs[0] - 0.25, -1, H.door, TPL.stair, 'Weatherproof, at the stair foot on the house wall; the matching top switch needs a roof-level stair cabin', { max: 1.5 });
    }
  }

  // ---------- verification: every board re-checked against walls, openings, furniture, leaves and the other
  // boards, and its height against the rule band for its type ----------
  const BANDS = [
    [/Bedside/, 0.7, 0.9], [/Sofa|Dining socket/, 0.3, 0.45], [/TV wall/, 1.1, 1.3], [/console/, 0.6, 0.8], [/counter/, 1.05, 1.15],
    [/Refrigerator/, 1.2, 2.0], [/Chimney/, 2.1, 2.2], [/Geyser/, 1.8, 2.0], [/Exhaust/, 1.8, 2.1], [/AC/, 2.1, 2.3],
    [/distribution/, 1.5, 1.8], [/door phone/, 1.4, 1.5], [/Bell/, 1.2, 1.5], [/Outdoor/, 0.45, 0.75], [/./, 1.0, 1.2],
  ];
  const all = placed.slice();
  for (const p of all) {
    placed.length = 0;
    placed.push(...all.filter((x) => x !== p));
    const room = byName(p.room);
    const clash = blocked(p.face, room, p.A, p.y, p.w, p.h, { ignore: p.q.ignore, soft: p.q.soft });
    const [, lo, hi] = BANDS.find(([re]) => re.test(p.board));
    p.check = { clear: !clash, clash, height: p.y >= lo - 1e-6 && p.y <= hi + 1e-6, band: [lo, hi] };
  }
  placed.length = 0;
  placed.push(...all);

  // ---------- 3D: plates, devices, DB, door phone ----------
  const mats = {
    plate: new THREE.MeshStandardMaterial({ color: '#f5f5f2', roughness: 0.35 }),
    rock: new THREE.MeshStandardMaterial({ color: '#e6e6e2', roughness: 0.4 }),
    dark: new THREE.MeshStandardMaterial({ color: '#2a2b2e', roughness: 0.6 }),
    red: new THREE.MeshStandardMaterial({ color: '#d1261b', emissive: '#8a0d06', roughness: 0.4 }),
    metal: new THREE.MeshStandardMaterial({ color: '#c9cbc7', metalness: 0.5, roughness: 0.45 }),
    screen: new THREE.MeshStandardMaterial({ color: '#0e1724', roughness: 0.15, metalness: 0.2 }),
    grey: new THREE.MeshStandardMaterial({ color: '#8f969d', roughness: 0.55 }),
  };
  const buckets = Object.fromEntries(Object.keys(mats).map((k) => [k, []]));
  const group = new THREE.Group();
  const labels = new THREE.Group();
  const marks = new THREE.Group();
  const markMat = new THREE.MeshBasicMaterial({ color: '#ffb703', transparent: true, opacity: 0.9, depthWrite: false });
  labels.visible = marks.visible = false;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
  for (const p of placed) {
    const n = p.face.n;
    q.setFromAxisAngle(Y, Math.atan2(n[0], n[1]));
    m4.compose(new THREE.Vector3(p.pos[0], p.y, p.pos[2]), q, one);
    const put = (key, geo, x, y, z) => { geo.translate(x, y, z); geo.applyMatrix4(m4); buckets[key].push(geo); };
    const bx = (key, w, h, dd, x, y, z) => put(key, new THREE.BoxGeometry(w, h, dd), x, y, z + dd / 2);
    const disc = (key, r, dd, x, y, z) => { const g = new THREE.CylinderGeometry(r, r, dd, 16); g.rotateX(Math.PI / 2); put(key, g, x, y, z + dd / 2); };
    if (p.special === 'db') {
      bx('metal', p.w, p.h, 0.1, 0, 0, 0);
      bx('dark', p.w - 0.02, 0.004, 0.002, 0, p.h * 0.18, 0.1);
      bx('screen', p.w * 0.7, 0.05, 0.002, 0, p.h * 0.28, 0.1);
      bx('dark', 0.012, 0.05, 0.012, p.w / 2 - 0.03, 0, 0.1);
    } else if (p.special === 'vdpIn') {
      bx('dark', p.w, p.h, 0.022, 0, 0, 0);
      bx('screen', p.w - 0.06, p.h - 0.03, 0.002, -0.015, 0, 0.022);
      for (let i = 0; i < 3; i++) disc('rock', 0.006, 0.003, p.w / 2 - 0.018, -0.035 + i * 0.035, 0.022);
    } else if (p.special === 'vdpOut') {
      bx('metal', p.w, p.h, 0.03, 0, 0, 0);
      disc('screen', 0.012, 0.004, 0, 0.05, 0.03);
      disc('rock', 0.014, 0.006, 0, -0.045, 0.03);
      bx('dark', 0.05, 0.03, 0.002, 0, 0.0, 0.03);
    } else {
      const outdoor = p.special === 'wp' || rooms.find((r) => r.name === p.room)?.outdoor;
      bx(outdoor ? 'grey' : 'plate', p.w, p.h, outdoor ? 0.04 : 0.009, 0, 0, 0);
      const z0 = outdoor ? 0.04 : 0.009;
      let x = -(p.mods * U) / 2;
      for (const [code] of p.items) {
        const mw = DEV[code][0] * U, cx = x + mw / 2;
        x += mw;
        if (code === 'X') continue;
        if (code[0] === 'P') {
          bx('rock', mw - 0.004, 0.042, 0.005, cx, 0, z0);
          const hw = code === 'P16' ? 0.006 : 0.0045, hh = code === 'P16' ? 0.011 : 0.008;
          for (const [hx, hy] of [[0, 0.01], [-0.011, -0.008], [0.011, -0.008]]) bx('dark', hw, hh, 0.001, cx + hx, hy, z0 + 0.005);
        } else {
          bx('rock', mw - 0.003, 0.042, 0.006, cx, 0, z0);
          if (code === 'R') disc('dark', 0.0075, 0.008, cx, 0, z0 + 0.006);
          else if (code === 'I' || code === 'S20' || code === 'S16') disc('red', 0.0025, 0.002, cx, 0.014, z0 + 0.006);
          else if (code === 'U') { bx('dark', 0.009, 0.003, 0.001, cx, 0.006, z0 + 0.006); bx('dark', 0.009, 0.003, 0.001, cx, -0.006, z0 + 0.006); }
          else if (code === 'D' || code === 'T' || code === 'C') bx('dark', 0.01, 0.01, 0.001, cx, 0, z0 + 0.006);
          else if (code === 'B') disc('plate', 0.008, 0.004, cx, 0, z0 + 0.006);
          else bx('dark', mw - 0.012, 0.0015, 0.001, cx, code === 'S2' ? 0.012 : 0.0, z0 + 0.006);
        }
      }
    }
    // overlay: amber frame behind the plate + numbered tag
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(p.w + 0.05, p.h + 0.05), markMat);
    mark.position.set(p.pos[0] + n[0] * 0.002, p.y, p.pos[2] + n[1] * 0.002);
    mark.rotation.y = Math.atan2(n[0], n[1]);
    marks.add(mark);
    const el = document.createElement('div');
    el.className = 'elabel';
    el.innerHTML = `<b>${p.id}</b><span>${p.y.toFixed(2)} m</span>`;
    el.title = `${p.id} · ${p.room} · ${p.board}\n${p.special ? SPECIAL[p.special].label : p.items.map((i) => i[1]).join(', ')}\n${p.why}`;
    const lab = new CSS2DObject(el);
    lab.position.set(p.pos[0] + n[0] * 0.06, p.y + p.h / 2 + 0.09, p.pos[2] + n[1] * 0.06);
    lab.userData.room = p.room; // walking: only the current room's tags are shown (CSS labels are not occluded)
    labels.add(lab);
  }
  for (const [k, geos] of Object.entries(buckets)) {
    if (!geos.length) continue;
    const mesh = new THREE.Mesh(mergeGeometries(geos), mats[k]);
    mesh.receiveShadow = true;
    group.add(mesh);
    geos.forEach((g) => g.dispose());
  }
  group.add(marks);
  return { group, labels, marks, points: placed, misses };
}

// ---------- schedule (table for the report dialog) ----------
const wallName = (n) => (n[1] === 1 ? 'top' : n[1] === -1 ? 'bottom' : n[0] === 1 ? 'left' : 'right');
export function electricalTables(E, rooms) {
  const rows = E.points.map((p) => {
    const room = rooms.find((r) => r.name === p.room);
    const r = room.rects.find((q) => (p.face.vertical ? p.A >= q[1] - 0.01 && p.A <= q[3] + 0.01 : p.A >= q[0] - 0.01 && p.A <= q[2] + 0.01)) || room.main;
    const fromEnd = p.face.vertical ? p.A - r[1] : p.A - r[0];
    const contents = p.special ? SPECIAL[p.special].label : p.items.map(([c, l]) => l).join(', ');
    const plate = p.special ? (p.special === 'db' ? '330×450×100 mm enclosure' : p.special === 'wp' ? 'IP55 box' : `${Math.round(p.w * 1000)}×${Math.round(p.h * 1000)} mm`) : `${p.mods}M plate (${p.items.reduce((s, [c]) => s + DEV[c][0], 0)}M used)`;
    const ok = p.check.clear && p.check.height;
    const check = ok ? '✅' : `⚠️ ${p.check.clear ? '' : `clash: ${p.check.clash}`}${p.check.height ? '' : ` height outside ${p.check.band.join('–')} m`}`;
    return [p.id, p.room, p.board, `${wallName(p.face.n)} wall (as drawn), ${fromEnd.toFixed(2)} m from its ${p.face.vertical ? 'top' : 'left'} end`, `${p.y.toFixed(2)} m`, plate, contents, p.why, check];
  });
  const counts = {};
  for (const p of E.points) { const k = p.board.replace(/ \d+$| \((left|right)\)$/, ''); counts[k] = (counts[k] || 0) + 1; }
  const sockets = (ps) => ps.reduce((s, p) => s + (p.special === 'wp' ? 1 : (p.items || []).filter(([c]) => c[0] === 'P').length), 0);
  const cover = rooms.map((r) => {
    const sw = E.points.filter((p) => p.serves === r.name && /board|switch/i.test(p.board) && !/distribution/.test(p.board)).map((p) => `${p.id}${p.room !== r.name ? ` (in ${p.room})` : ''}`);
    const here = E.points.filter((p) => p.room === r.name);
    const ded = here.filter((p) => /AC|Geyser|Refrigerator|Chimney|Exhaust|distribution|door phone/.test(p.board)).map((p) => `${p.board.replace(/ \(.*\)$/, '')} ${p.id}`);
    return [r.name, sw.join(', ') || (r.outdoor ? 'switched from the adjoining room' : '—'), String(sockets(here)), ded.join('; ') || '—'];
  });
  return [
    { title: 'Switchboards and power points (positions measured in the 3D model)', head: ['#', 'Room', 'Board / point', 'Where', 'Height (centre, above FFL)', 'Plate', 'Contents', 'Why here', 'Check'], rows },
    { title: 'Coverage by room', head: ['Room', 'Light / fan switches at', 'Sockets in the room', 'Dedicated points'], rows: cover },
    { title: 'Count by type', head: ['Board / point', 'Number'], rows: Object.entries(counts).sort((a, b) => b[1] - a[1]) },
    { title: 'Rules and heights used', head: ['Item', 'Height', 'Rule / source'], rows: RULES },
  ];
}
export function electricalSummary(E) {
  const ok = E.points.filter((p) => p.check.clear && p.check.height).length;
  return `${E.points.length} switchboards and points placed by rule; ${ok}/${E.points.length} re-checked clear of doors, door leaves, windows, curtains, furniture and each other, at a height inside their rule band.` +
    (E.misses.length ? ` ${E.misses.length} need a site decision (listed below).` : ' Every planned point found a clear wall.');
}
export function electricalHTML(E, rooms) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const t = electricalTables(E, rooms).map((tb) => `<h3>${esc(tb.title)}</h3><table><thead><tr>${tb.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${tb.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`).join('');
  const sum = `${electricalSummary(E)} All circuits: concealed PVC conduit, ISI-marked modular devices, 30 mA RCCB on socket and wet-area circuits; a licensed electrician should confirm on site.`;
  return `<p class="sum">${esc(sum)}</p>${t}${E.misses.length ? `<h3>Needs a site decision</h3><ul>${E.misses.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}`;
}
export function electricalMarkdown(E, rooms, planName) {
  const md = (s) => String(s).replace(/\|/g, '\\|');
  let out = `# Electrical layout — ${planName}\n\n${electricalSummary(E)}\n\n`;
  for (const t of electricalTables(E, rooms)) {
    out += `## ${t.title}\n\n| ${t.head.map(md).join(' | ')} |\n| ${t.head.map(() => '---').join(' | ')} |\n`;
    for (const r of t.rows) out += `| ${r.map(md).join(' | ')} |\n`;
    out += '\n';
  }
  if (E.misses.length) out += `## Needs a site decision\n\n${E.misses.map((m) => `- ${m}`).join('\n')}\n`;
  return out;
}
