// House plans rebuilt from the WRITTEN dimensions on the architect's drawings.
//
// Coordinates are INCHES from the outer top-left corner of the building (x → right, z → down
// on the drawing). Wall positions come from the dimension chains:
//   outer wall 9″ (228.6 mm), inner wall 4½″ (114.3 mm), room sizes = clear (wall-face to wall-face)
// e.g. Plan-2 across: 9 + 132 (Kitchen 11′) + 4½ + 102 (Dining 8′-6″) + 4½ + 58½ (Toilet) + 4½ + 192 (M-Bed 16′) + 9 = 516 = 43′-0″ ✓
//
// Items the drawings do NOT dimension (door/window positions, furniture positions) are scaled
// from the drawing with `map` (drawing px → inches, fitted to the dimensioned outer faces).
//
// walls:  [x1, z1, x2, z2, thickness″, openings]  — centre-lines, axis aligned
// openings: [kind, pxFrom, pxTo, swing?]  positions along the wall in drawing px
//   kind: d = door 3′-0″, dt = toilet door 2′-6″, dd = double door, a = open arch,
//         w = window, v = ventilator 2′-0″ × 1′-6″
//   swing (doors): 'a+' = hinge at the low-coordinate end, opens toward +x/+z; 'b-' etc.
//   swing (double doors): '+' or '-'
// rooms:  r = clear rect [x0, z0, x1, z1] (inches); lab = drawing label [x″, z″] (null = not labelled)
// furn:   furniture anchored to rooms/walls; positions in drawing px, sizes are standard (metres)

export const PLANS = [
  {
    // From PADMA REDDY GANNA.pdf ("Ground Floor Plan", plinth 1849 sft, slab 2400 sft). The drawing has the East
    // road (5′ balcony, main door) at the top; all px below are on that drawing turned 90° anticlockwise, so it
    // sits on the survey with the 5′ balcony on the 21 ft road (west) and the 7′ balcony + stair on G.P Road (south).
    // Chains: across 9 + 132 (Kitchen 11′) + 4½ + 102 (Dining 8′-6″) + 4½ + 58½ (Toilet) + 4½ + 192 (M-Bed 16′) + 9 = 516;
    // down 9 + 147 (12′-3″) + 4½ + 204 (Hall 17′) + 4½ + 138 (11′-6″) + 9 = 516.
    id: 'p2',
    name: 'Plan-2 · 2400 sft slab',
    short: 'Plan-2',
    image: 'plans/plan-2.jpg',
    outer: [516, 516], // 43′-0″ × 43′-0″
    map: { ox: 1573, oy: 552, kx: 516 / 2160.5, kz: 516 / 2160.5 },
    note: 'From PADMA REDDY GANNA.pdf, for the 56′-1″ × 59′-1″ Padma Reddy site. Plinth 1849 sft, slab 2400 sft.',
    mandirNote: 'Pooja mandir is on the south wall, facing the pooja door, so you face the deities as you enter (owner instruction). The drawing showed it on the west wall.',
    deviations: ['Open kitchen (owner instruction): the 4½″ wall between Kitchen and Dining is removed (the Hall wall stays). The kitchen run along that old wall stays as a peninsula counter.'],
    tour: ['Front Balcony', 'Drawing Room', 'Hall', 'Pooja', 'Dining', 'Kitchen', 'Master Bedroom', 'Toilet 1', 'Bedroom 2', 'Toilet 2', 'Bedroom 3', 'Toilet 3', 'Side Balcony'],
    plot: {
      x0: -127, z0: -25.5, x1: 546, z1: 683.5, label: [673, 709], gatesFromDrawing: true,
      gates: [{ side: 'w', from: 377, to: 434 }, { side: 's', from: -104, to: -5 }],
      // water sump and three bores, as drawn, on the 23 SqYds strip; the west compound wall runs on the 21 ft road
      // edge (as drawn) so the strip, sump and bores are inside the compound
      sump: [-184, 520.5, -129.5, 611.5], bores: [[-155, 504.5], [-184, 630.5], [-147.5, 655]], westOnStrip: true,
    },
    balconies: { side: 60, front: 84 },
    stairs: [3042, 2712, 3545, 3062],
    walls: [
      [4.5, 4.5, 511.5, 4.5, 9, [['w', 2295, 2500], ['v', 2700, 2800], ['w', 2920, 3120]]],
      [4.5, 4.5, 4.5, 511.5, 9, [['w', 975, 1180], ['w', 1360, 1560], ['dd', 1700, 1850, '+']]],
      [511.5, 4.5, 511.5, 511.5, 9, [['w', 975, 1175], ['w', 1610, 1815], ['v', 1915, 2015], ['v', 2435, 2535]]],
      // pooja window (px 2320-2470) omitted on owner's instruction
      [4.5, 511.5, 511.5, 511.5, 9, [['d', 1715, 1860, 'a-'], ['w', 1900, 2105], ['w', 2940, 3145]]],
      // open kitchen: no wall between Kitchen and Dining (was [143.25, 4.5, 143.25, 158.25] with an arch)
      [249.75, 4.5, 249.75, 158.25, 4.5, []],
      [249.75, 107.25, 312.75, 107.25, 4.5, []],
      [312.75, 4.5, 312.75, 107.25, 4.5, [['dt', 733, 850, 'b-']]],
      [4.5, 158.25, 511.5, 158.25, 4.5, [['a', 2210, 2570], ['d', 2660, 2810, 'a-']]],
      [312.75, 158.25, 312.75, 308.25, 4.5, []],
      [312.75, 308.25, 511.5, 308.25, 4.5, [['d', 2910, 3060, 'a-']]],
      [378.75, 308.25, 378.75, 366.75, 4.5, [['dt', 1925, 2050, 'b+']]],
      [4.5, 366.75, 511.5, 366.75, 4.5, [['a', 1715, 1865], ['d', 2335, 2455, 'a+'], ['d', 2660, 2810, 'a+']]],
      [143.25, 366.75, 143.25, 511.5, 4.5, []],
      [249.75, 366.75, 249.75, 511.5, 4.5, []],
      [446.25, 414.75, 446.25, 511.5, 4.5, []],
      [446.25, 414.75, 511.5, 414.75, 4.5, [['dt', 3460, 3580, 'a+']]],
    ],
    rooms: [
      // open kitchen: the Kitchen also takes the floor strip of the removed Kitchen–Dining wall
      { n: 'Kitchen', rs: [[9, 9, 141, 156], [141, 9, 145.5, 156]], lab: [132, 147], d: '12′-3″ × 11′-0″', f: 'kitchen' },
      { n: 'Dining', r: [145.5, 9, 247.5, 156], lab: [102, 147], d: '12′-3″ × 8′-6″', f: 'tile' },
      { n: 'Toilet 1', r: [252, 9, 310.5, 105], lab: [58, 96], d: '8′-0″ × 4′-10″', f: 'bath',
        issue: 'Labelled 4′-10″, but the dimension chain across needs 9 + 132 + 4½ + 102 + 4½ + T + 4½ + 192 + 9 = 516″ (43′), so T = 4′-10½″. Modelled at 4′-10½″.' },
      // M-Bed includes the lobby in front of its toilet (entered from the Hall)
      { n: 'Master Bedroom', rs: [[315, 9, 507, 156], [252, 109.5, 315, 156]], lab: [192, 147], d: '12′-3″ × 16′-0″', f: 'wood' },
      // Hall includes the passage to Bedroom 2 and Toilet 2
      { n: 'Hall', rs: [[9, 160.5, 310.5, 364.5], [310.5, 310.5, 376.5, 364.5]], lab: [301.5, 204], d: '17′-0″ × 25′-1½″', f: 'tile' },
      { n: 'Bedroom 2', r: [315, 160.5, 507, 306], lab: [192, 145.5], d: '12′-1½″ × 16′-0″', f: 'wood' },
      { n: 'Toilet 2', r: [381, 310.5, 507, 364.5], lab: [126, 54], d: '4′-6″ × 10′-6″', f: 'bath' },
      { n: 'Drawing Room', r: [9, 369, 141, 507], lab: [132, 138], d: '11′-6″ × 11′-0″', f: 'tile' },
      { n: 'Pooja', r: [145.5, 369, 247.5, 507], lab: [102, 138], d: '11′-6″ × 8′-6″', f: 'marble' },
      // Bedroom 3 includes the dressing bay in front of its toilet
      { n: 'Bedroom 3', rs: [[252, 369, 444, 507], [444, 369, 507, 412.5]], lab: [192, 138], d: '11′-6″ × 16′-0″', f: 'wood' },
      { n: 'Toilet 3', r: [448.5, 417, 507, 507], lab: [58.5, 90], d: '7′-6″ × 4′-10½″', f: 'bath' },
    ],
    furn: [
      ['kitchen', 'Kitchen', { runs: [['n', 1610, 2170], ['w', 590, 1190], ['e', 590, 1020, { island: true }]], hob: ['w', 760], sink: ['w', 1120], upper: [['n', 1610, 2170]] }],
      ['dining', 'Dining', 2396, 859, 'rect6'],
      ['wc', 'Toilet 1', 'n', 2750], ['vanity', 'Toilet 1', 'w', 780], ['glass', 'Toilet 1', 'z', 865, 2630, 2875],
      ['bed', 'Master Bedroom', 3330, 'king'], ['ward', 'Master Bedroom', 'e', 740, 970],
      ['bed', 'Bedroom 2', 3290, 'queen'], ['ward', 'Bedroom 2', 'e', 1225, 1610],
      ['wc', 'Toilet 2', 'n', 3450], ['vanity', 'Toilet 2', 'n', 3228], ['glass', 'Toilet 2', 'x', 3555, 1852, 2075],
      ['bed', 'Bedroom 3', 3065, 'queen'], ['ward', 'Bedroom 3', 'e', 2280, 2670],
      ['wc', 'Toilet 3', 'n', 3630], ['vanity', 'Toilet 3', 'w', 2468], ['glass', 'Toilet 3', 'z', 2532, 3450, 3695],
      // mandir on the south wall so it faces the pooja door (owner's instruction)
      ['mandir', 'Pooja', 's'],
      ['sofa', 'Hall', 'z', 1224, 1780, 2135, 's'], ['sofa', 'Hall', 'x', 1675, 1360, 1545, 'e'], ['sofa', 'Hall', 'x', 2240, 1360, 1545, 'w'],
      ['ctable', 'Hall', 1960, 1480, 0.76, 0.48], ['tv', 'Hall', 's', 2073],
      ['sofa', 'Hall', 'x', 2873, 1460, 1735, 'w'], ['ctable', 'Hall', 2612, 1598, 0.5, 1.1],
      ['sofa', 'Drawing Room', 'x', 2163, 2245, 2525, 'w'], ['ctable', 'Drawing Room', 1905, 2385, 0.5, 0.9],
    ],
  },
];

// Standard sizes and heights used where the drawings give no dimension (inches unless noted).
// Openings use typical Indian sizes, set in millimetres (mm / 25.4 = inches): doors 2100 mm high; room doors 900,
// toilet doors 750, main / double doors 900–1500; windows 600–2100 wide × 1200 high on a 900 mm sill;
// ventilators 600 × 450 under the 2100 mm lintel.
const MM = (mm) => mm / 25.4;
export const STD = {
  ceiling: 108, // floor to ceiling 9′-0″ (2.743 m), as dollhouse.html; not on the drawing
  slab: 5, // RCC roof slab 5″
  plinth: 18, // finished floor 1′-6″ above ground
  doorHead: MM(2100), // doors, arches and window heads (lintel) 2100 mm
  sill: MM(900), // window sill 900 mm → 1200 mm high windows
  ventSill: MM(1650), // ventilator 600 × 450 mm, top at the 2100 mm lintel
  ventW: MM(600),
  door: MM(900), // room doors 900 × 2100 mm
  doorToilet: MM(750), // toilet doors 750 × 2100 mm
  doubleSizes: [900, 1000, 1050, 1200, 1500].map(MM), // main / double doors: nearest standard to the drawing
  windowSizes: [600, 900, 1200, 1500, 1800, 2100].map(MM), // window widths: nearest standard to the drawing
  parapet: 36,
  compound: 60,
  column: 9,
};
