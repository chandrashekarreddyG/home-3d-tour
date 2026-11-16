// Walkability grid + A* so the camera glides through doorways instead of through walls.

export const CELL = 0.5;

export function rectDist(x, z, r) {
  const dx = Math.max(r[0] - x, 0, x - r[2]);
  const dz = Math.max(r[1] - z, 0, z - r[3]);
  return Math.hypot(dx, dz);
}

export const inRect = (x, z, r) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];

export class NavGrid {
  // areas: rects the camera may stand in; blockers: [{r, clear}] footprints to keep away from
  constructor(bounds, areas, holes, blockers) {
    this.x0 = bounds[0];
    this.z0 = bounds[1];
    this.nx = Math.ceil((bounds[2] - bounds[0]) / CELL);
    this.nz = Math.ceil((bounds[3] - bounds[1]) / CELL);
    this.walk = new Uint8Array(this.nx * this.nz);
    for (let j = 0; j < this.nz; j++) {
      const z = this.z0 + (j + 0.5) * CELL;
      for (let i = 0; i < this.nx; i++) {
        const x = this.x0 + (i + 0.5) * CELL;
        if (!areas.some((r) => inRect(x, z, r))) continue;
        if (holes.some((r) => inRect(x, z, r))) continue;
        if (blockers.some((b) => rectDist(x, z, b.r) < b.clear)) continue;
        this.walk[j * this.nx + i] = 1;
      }
    }
  }

  cellOf(x, z) {
    const i = Math.floor((x - this.x0) / CELL);
    const j = Math.floor((z - this.z0) / CELL);
    if (i < 0 || j < 0 || i >= this.nx || j >= this.nz) return -1;
    return j * this.nx + i;
  }

  center(c) {
    return [this.x0 + ((c % this.nx) + 0.5) * CELL, this.z0 + (Math.floor(c / this.nx) + 0.5) * CELL];
  }

  ok(x, z) {
    const c = this.cellOf(x, z);
    return c >= 0 && this.walk[c] === 1;
  }

  nearest(x, z) {
    const i0 = Math.min(this.nx - 1, Math.max(0, Math.floor((x - this.x0) / CELL)));
    const j0 = Math.min(this.nz - 1, Math.max(0, Math.floor((z - this.z0) / CELL)));
    for (let rad = 0; rad < 24; rad++) {
      let best = -1;
      let bestD = Infinity;
      for (let j = j0 - rad; j <= j0 + rad; j++) {
        for (let i = i0 - rad; i <= i0 + rad; i++) {
          if (Math.max(Math.abs(i - i0), Math.abs(j - j0)) !== rad) continue;
          if (i < 0 || j < 0 || i >= this.nx || j >= this.nz) continue;
          const c = j * this.nx + i;
          if (!this.walk[c]) continue;
          const [cx, cz] = this.center(c);
          const d = Math.hypot(cx - x, cz - z);
          if (d < bestD) { bestD = d; best = c; }
        }
      }
      if (best >= 0) return best;
    }
    return -1;
  }

  lineOfSight(a, b) {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.ceil(d / (CELL * 0.4)));
    for (let k = 1; k < n; k++) {
      const t = k / n;
      if (!this.ok(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) return false;
    }
    return true;
  }

  // Returns world-space waypoints from (sx,sz) to (tx,tz), or null when unreachable.
  path(sx, sz, tx, tz) {
    const s = this.nearest(sx, sz);
    const t = this.nearest(tx, tz);
    if (s < 0 || t < 0) return null;
    const N = this.nx * this.nz;
    const g = new Float32Array(N).fill(Infinity);
    const came = new Int32Array(N).fill(-1);
    const closed = new Uint8Array(N);
    const [txc, tzc] = this.center(t);
    const h = (c) => {
      const [x, z] = this.center(c);
      const dx = Math.abs(x - txc), dz = Math.abs(z - tzc);
      return Math.max(dx, dz) + 0.4142 * Math.min(dx, dz);
    };
    const heap = new MinHeap();
    g[s] = 0;
    heap.push(s, h(s));
    const nb = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];
    let found = false;
    while (heap.size) {
      const c = heap.pop();
      if (c === t) { found = true; break; }
      if (closed[c]) continue;
      closed[c] = 1;
      const i = c % this.nx, j = (c - i) / this.nx;
      for (const [di, dj, w] of nb) {
        const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= this.nx || nj >= this.nz) continue;
        const n = nj * this.nx + ni;
        if (!this.walk[n] || closed[n]) continue;
        if (di && dj && (!this.walk[j * this.nx + ni] || !this.walk[nj * this.nx + i])) continue;
        const ng = g[c] + w * CELL;
        if (ng < g[n]) { g[n] = ng; came[n] = c; heap.push(n, ng + h(n)); }
      }
    }
    if (!found) return null;
    const cells = [];
    for (let c = t; c !== -1; c = came[c]) cells.push(this.center(c));
    cells.reverse();
    const start = [sx, sz];
    const pts = [start, ...cells];
    if (this.ok(tx, tz)) pts.push([tx, tz]);
    // string-pull: keep only the corners we can't see past
    const out = [];
    let i = 0;
    while (i < pts.length - 1) {
      let j = pts.length - 1;
      while (j > i + 1 && !this.lineOfSight(pts[i], pts[j])) j--;
      out.push(pts[j]);
      i = j;
    }
    return out;
  }
}

class MinHeap {
  constructor() { this.k = []; this.p = []; }
  get size() { return this.k.length; }
  push(key, pri) {
    const k = this.k, p = this.p;
    k.push(key); p.push(pri);
    let i = k.length - 1;
    while (i > 0) {
      const par = (i - 1) >> 1;
      if (p[par] <= p[i]) break;
      [k[par], k[i]] = [k[i], k[par]];
      [p[par], p[i]] = [p[i], p[par]];
      i = par;
    }
  }
  pop() {
    const k = this.k, p = this.p;
    const top = k[0];
    const lk = k.pop(), lp = p.pop();
    if (k.length) {
      k[0] = lk; p[0] = lp;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < k.length && p[l] < p[m]) m = l;
        if (r < k.length && p[r] < p[m]) m = r;
        if (m === i) break;
        [k[m], k[i]] = [k[i], k[m]];
        [p[m], p[i]] = [p[i], p[m]];
        i = m;
      }
    }
    return top;
  }
}
