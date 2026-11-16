// Survey map MAP2.pdf — "Map showing the enjoyment survey situated at Yellareddypet (V),
// Yellareddypet (M), Rajanna Siricilla Dist." (YMR Digital Land Survey, 09-11-2026).
//
// The survey sketch is not drawn to scale, so vertices were rebuilt from the written
// dimensions, using the sketch only for edge directions.
// Frame (feet): u runs along G.P Road from the NW corner of the Padma Reddy plot to the SE;
// v runs away from G.P Road (NNE -> SSW). Padma Reddy core plot = (0,0)-(56.08,59.08).

export const SITE_TITLE = 'Yellareddypet (V), Yellareddypet (M), Rajanna Siricilla Dist.';

// Map north expressed as a unit vector in (u, v).
export const NORTH_UV = [-0.47, -0.88];

// Site location supplied by the owner: 18°22′23.68″N 78°38′48.17″E
export const SITE_LOCATION = { lat: 18 + 22 / 60 + 23.68 / 3600, lon: 78 + 38 / 60 + 48.17 / 3600, dms: '18°22′23.68″N 78°38′48.17″E' };

const P = {
  A: [0, 0], Bin: [56.08, 0], B: [63.25, 0], C: [56.08, 59.08], D1: [0, 59.08], D: [0, 61.25],
  A1: [-1.5, 0], AD44: [0, 44.25], S20b: [-6.75, 44.25], S40tl: [-14.58, 44.25], S40bl: [-19.42, 61.25],
  T1: [-18.5, 73.25], T2: [45.8, 71.0], T2o: [54.2, 70.6], T3: [47.8, 123.5], T4: [-13.3, 129.55],
  M1: [31.2, 125.14], M2: [38.3, 198.0], M3: [-5.2, 202.85],
  Rend: [59.7, 195.7], R21top: [85.8, 0],
};
const poly = (...k) => k.map((n) => P[n]);

export const PARCELS = [
  { id: 'padma', label: 'G. Padma Reddy', sub: '03 Gts 06 SqYds · 56′-1″ × 59′-1″', poly: poly('A', 'Bin', 'C', 'D1'), kind: 'home' },
  { id: 'thirupathi', label: 'G. Thirupathi Reddy', sub: '03 Gts 19 SqYds', poly: poly('T1', 'T2', 'T3', 'T4'), kind: 'plot' },
  { id: 'thirumal', label: 'G. Thirumal Reddy', sub: '03 Gts 01 SqYds', poly: poly('T4', 'M1', 'M2', 'M3'), kind: 'plot' },
  { id: 'thirumal68', label: 'G. Thirumal Reddy', sub: '68 SqYds', poly: poly('M1', 'T3', 'M2'), kind: 'strip' },
  { id: 's23', label: '23 SqYds', poly: poly('Bin', 'B', 'C'), kind: 'strip' },
  { id: 's20', label: '20 SqYds', poly: poly('A1', 'A', 'AD44', 'S20b'), kind: 'strip' },
  { id: 's07', label: '07 SqYds', poly: poly('D1', 'C', 'D'), kind: 'strip' },
  { id: 's40', label: '40 SqYds', poly: poly('S40tl', 'AD44', 'D', 'S40bl'), kind: 'strip' },
  { id: 's16', label: '16 SqYds', poly: poly('T2', 'T2o', 'T3'), kind: 'strip' },
];

export const ROADS = [
  { id: 'gp', label: 'G.P Road', poly: [[-70, -20], [140, -20], [140, 0], [-70, 0]], kind: 'asphalt', at: [28, -10] },
  { id: 'r12', label: '12 ft Road', poly: [P.S40bl, P.C, P.T2o, P.T1], kind: 'earth' },
  { id: 'r21', label: '21 ft Road · 04 Gts 81 SqYds', poly: [P.B, P.R21top, P.Rend, P.M2, P.T3, P.T2o, P.C], kind: 'earth', at: [56, 150] },
];

// Written dimensions shown along the Padma Reddy boundary.
export const DIMENSIONS = [
  { a: P.A, b: P.Bin, text: '56′-1″' },
  { a: P.Bin, b: P.C, text: '59′-1″' },
  { a: P.T1, b: P.T2, text: '64′-4″' },
  { a: P.T1, b: P.T4, text: '56′-10″' },
  { a: P.T4, b: P.M3, text: '74′-1″' },
  { a: P.M3, b: P.M2, text: '43′-11″' },
  { a: P.Rend, b: P.R21top, text: '198′-8″', at: 0.75 },
];
