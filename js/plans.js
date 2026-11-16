// House plans rebuilt from the WRITTEN dimensions on the architect's drawings.
//
// Coordinates are INCHES from the outer top-left corner of the building (x → right, z → down
// on the drawing). Wall positions come from the dimension chains:
//   outer wall 9″ (228.6 mm), inner wall 4½″ (114.3 mm), room sizes = clear (wall-face to wall-face)
// e.g. Plan-1 top row: 9 + 114 (9′-6″) + 4½ + 120 (10′) + 4½ + 58½ (4′-10½″) + 4½ + 192 (16′) + 9 = 516 = 43′-0″ ✓
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
    id: 'gf',
    name: 'Ground Floor Plan',
    short: 'GF Plan',
    image: 'plans/ground-floor-plan.jpg',
    outer: [495, 555], // 41′-3″ × 46′-3″
    map: { ox: 185, oy: 57, kx: 495 / 1148, kz: 555 / 1286 },
    note: 'Drawn for a 57′ × 65′ plot; on the 56′-1″ × 59′-1″ Padma Reddy site the rear wall crosses the plot line.',
    plot: { x0: -153, z0: -36, x1: 531, z1: 744, label: [684, 780], gates: [{ side: 'w', from: 324, to: 402 }, { side: 's', from: 10, to: 172 }], gatesFromDrawing: true },
    balconies: { side: 60, front: 84 },
    stairs: [958, 1343, 1240, 1537],
    walls: [
      [4.5, 4.5, 490.5, 4.5, 9, [['w', 297, 380], ['w', 497, 665], ['v', 758, 815], ['w', 880, 1007]]],
      // pooja window (px 383-440) omitted on owner's instruction
      [4.5, 4.5, 4.5, 550.5, 9, [['w', 225, 305], ['w', 510, 590], ['w', 735, 820], ['dd', 875, 950, '+'], ['w', 1000, 1055], ['w', 1210, 1265]]],
      [490.5, 4.5, 490.5, 550.5, 9, [['w', 375, 455], ['w', 735, 820], ['v', 880, 935], ['v', 1140, 1195]]],
      [4.5, 550.5, 490.5, 550.5, 9, [['w', 288, 345], ['dd', 345, 455, '-'], ['w', 455, 512], ['w', 730, 857]]],
      [119.25, 4.5, 119.25, 126.75, 4.5, [['a', 250, 340]]],
      [4.5, 126.75, 119.25, 126.75, 4.5, []],
      [83.25, 126.75, 83.25, 179.25, 4.5, [['dd', 372, 452, '-']]],
      [227.25, 4.5, 227.25, 179.25, 4.5, []],
      [291.75, 4.5, 291.75, 179.25, 4.5, [['dt', 175, 240, 'b-'], ['a', 355, 465]]],
      [227.25, 125.25, 291.75, 125.25, 4.5, []],
      [4.5, 179.25, 490.5, 179.25, 4.5, [['a', 460, 670], ['d', 735, 810, 'a-']]],
      [291.75, 179.25, 291.75, 399.75, 4.5, [['d', 870, 950, 'b+']]],
      [291.75, 335.25, 490.5, 335.25, 4.5, [['a', 885, 1005], ['dt', 1130, 1190, 'a+']]],
      [363.75, 335.25, 363.75, 399.75, 4.5, []],
      [4.5, 399.75, 490.5, 399.75, 4.5, [['a', 275, 450], ['d', 735, 810, 'a+']]],
      [227.25, 399.75, 227.25, 550.5, 4.5, []],
      [423.75, 399.75, 423.75, 550.5, 4.5, [['dt', 1135, 1200, 'b+']]],
    ],
    rooms: [
      { n: 'Cooking', r: [9, 9, 117, 124.5], lab: [108, 115.5], d: '9′ × 9′-7½″', f: 'kitchen' },
      { n: 'Pooja', r: [9, 129, 81, 177], lab: [72, 48], d: '6′ × 4′', f: 'marble' },
      { n: 'Dining', rs: [[121.5, 9, 225, 177], [85.5, 129, 121.5, 177]], lab: [108, 168], d: '9′ × 14′', f: 'tile',
        issue: 'Top-row labels (9′ + 9′ + 5′ + 16′ + walls) add up to 41′-7½″ against the 41′-3″ overall. Cooking, Toilet and Master Bedroom are kept as labelled; Dining takes the remainder (8′-7½″). This also lines its east wall up with the Living/Bedroom-3 wall.' },
      { n: 'Toilet 1', r: [229.5, 9, 289.5, 123], lab: [60, 114], d: '5′ × 9′-6″', f: 'bath' },
      { n: 'Passage', r: [229.5, 127.5, 289.5, 177], lab: null, f: 'tile', tour: false },
      { n: 'Master Bedroom', r: [294, 9, 486, 177], lab: [192, 168], d: '16′ × 14′', f: 'wood' },
      { n: 'Great Room', r: [9, 181.5, 289.5, 397.5], lab: [280.5, 216], d: '23′-4½″ × 18′', f: 'tile' },
      { n: 'Bedroom 2', r: [294, 181.5, 486, 333], lab: [192, 151.5], d: '16′ × 12′-7½″', f: 'wood' },
      { n: 'Lobby', r: [294, 337.5, 361.5, 397.5], lab: null, f: 'tile', tour: false },
      { n: 'Toilet 2', r: [366, 337.5, 486, 397.5], lab: [120, 60], d: '10′ × 5′', f: 'bath' },
      { n: 'Living', r: [9, 402, 225, 546], lab: [216, 144], d: '18′ × 12′', f: 'tile' },
      { n: 'Bedroom 3', r: [229.5, 402, 421.5, 546], lab: [192, 144], d: '16′ × 12′', f: 'wood' },
      { n: 'Toilet 3', r: [426, 402, 486, 546], lab: [60, 144], d: '5′ × 12′', f: 'bath' },
    ],
    furn: [
      ['kitchen', 'Cooking', { runs: [['n', 205, 456], ['w', 125, 330], ['e', 125, 245]], hob: ['w', 190], sink: ['w', 298], upper: [['n', 205, 456], ['e', 125, 245]] }],
      ['fridge', 'Dining', 679, 292, 'w'],
      ['dining', 'Dining', 575, 190, 'round4'],
      ['mandir', 'Pooja', 'w'],
      ['wc', 'Toilet 1', 'n', 785], ['vanity', 'Toilet 1', 'w', 195], ['glass', 'Toilet 1', 'z', 250, 718, 857],
      ['bed', 'Master Bedroom', 1085, 'king'], ['ward', 'Master Bedroom', 'e', 78, 360],
      ['bed', 'Bedroom 2', 1085, 'queen'], ['ward', 'Bedroom 2', 'e', 478, 722],
      ['wc', 'Toilet 2', 'n', 1262], ['vanity', 'Toilet 2', 's', 1172], ['glass', 'Toilet 2', 'x', 1102, 838, 978],
      ['bed', 'Bedroom 3', 949, 'queen'], ['ward', 'Bedroom 3', 'e', 989, 1120], ['ward', 'Bedroom 3', 'e', 1210, 1322],
      ['wc', 'Toilet 3', 'n', 1242], ['vanity', 'Toilet 3', 'e', 1165], ['glass', 'Toilet 3', 'z', 1252, 1172, 1310],
      ['sofa', 'Great Room', 'z', 570, 520, 617, 's'], ['sofa', 'Great Room', 'x', 698, 625, 845, 'w'],
      ['ctable', 'Great Room', 556, 738, 0.55, 1.1], ['tv', 'Great Room', 'w', 667], ['plant', 'Great Room', 670, 598],
      ['sofa', 'Living', 'z', 995, 520, 617, 's'], ['sofa', 'Living', 'x', 698, 1050, 1265, 'w'], ['sofa', 'Living', 'z', 1315, 520, 617, 'n'],
      ['ctable', 'Living', 556, 1155, 0.55, 0.9], ['tv', 'Living', 'w', 1117], ['plant', 'Living', 670, 1020], ['plant', 'Living', 670, 1292],
    ],
  },
  {
    id: 'p1',
    name: 'Plan-1 · 2394 sft slab',
    short: 'Plan-1',
    image: 'plans/plan-1.jpg',
    outer: [516, 516], // 43′-0″ × 43′-0″
    map: { ox: 280, oy: 148, kx: 516 / 1112, kz: 516 / 1112 },
    note: 'Designed for the 56′-1″ × 59′-1″ Padma Reddy site.',
    plot: { x0: -127, z0: -25.5, x1: 546, z1: 683.5, label: [673, 709], gates: [{ side: 'w', from: 313, to: 361 }, { side: 's', from: 19, to: 139 }] },
    balconies: { side: 60, front: 84 },
    stairs: [1028, 1260, 1290, 1440],
    walls: [
      [4.5, 4.5, 511.5, 4.5, 9, [['w', 377, 467], ['w', 565, 780], ['v', 860, 912], ['w', 973, 1090]]],
      [4.5, 4.5, 4.5, 511.5, 9, [['w', 372, 450], ['w', 517, 595], ['w', 710, 790], ['dd', 838, 910, '+'], ['w', 1035, 1150]]],
      [511.5, 4.5, 511.5, 511.5, 9, [['w', 400, 475], ['w', 720, 800], ['v', 850, 900], ['v', 1060, 1110]]],
      // pooja window (px 722-775) omitted on owner's instruction
      [4.5, 511.5, 511.5, 511.5, 9, [['w', 345, 398], ['dd', 400, 500, '-'], ['w', 500, 553], ['w', 836, 952]]],
      [125.25, 4.5, 125.25, 158.25, 4.5, [['a', 360, 460]]],
      [4.5, 158.25, 511.5, 158.25, 4.5, [['a', 575, 775], ['a', 845, 930]]],
      [249.75, 4.5, 249.75, 158.25, 4.5, []],
      [249.75, 107.25, 312.75, 107.25, 4.5, [['dt', 840, 900, 'a-']]],
      [312.75, 4.5, 312.75, 366.75, 4.5, [['d', 400, 470, 'b+'], ['d', 850, 920, 'b+']]],
      [312.75, 308.25, 511.5, 308.25, 4.5, [['a', 980, 1060], ['dt', 1190, 1250, 'a+']]],
      [372.75, 308.25, 372.75, 366.75, 4.5, []],
      [4.5, 366.75, 511.5, 366.75, 4.5, [['a', 360, 520], ['a', 705, 790], ['d', 835, 905, 'a+']]],
      [185.25, 366.75, 185.25, 511.5, 4.5, []],
      [249.75, 366.75, 249.75, 511.5, 4.5, []],
      [185.25, 408.75, 249.75, 408.75, 4.5, [['dd', 710, 785, '+']]],
      [444.75, 366.75, 444.75, 511.5, 4.5, [['dt', 1060, 1120, 'b+']]],
    ],
    rooms: [
      { n: 'Cooking', r: [9, 9, 123, 156], lab: [114, 147], d: '9′-6″ × 12′-3″', f: 'kitchen' },
      { n: 'Dining', r: [127.5, 9, 247.5, 156], lab: [120, 147], d: '10′ × 12′-3″', f: 'tile' },
      { n: 'Toilet 1', r: [252, 9, 310.5, 105], lab: [58.5, 96], d: '8′ × 4′-10½″', f: 'bath' },
      { n: 'Passage', r: [252, 109.5, 310.5, 156], lab: null, f: 'tile', tour: false },
      { n: 'Master Bedroom', r: [315, 9, 507, 156], lab: [192, 147], d: '16′ × 12′-3″', f: 'wood' },
      { n: 'Great Room', r: [9, 160.5, 310.5, 364.5], lab: [280.5, 204], d: '23′-4½″ × 17′', f: 'tile',
        issue: 'Labelled 23′-4½″ wide (looks copied from the GF plan), but the dimension chain gives 9 + G + 4½ + 192 (Bedroom-2, 16′) + 9 = 516″ (43′), so G = 25′-1½″. The drawing is also drawn at 25′-1½″, so it is modelled at 25′-1½″.' },
      { n: 'Bedroom 2', r: [315, 160.5, 507, 306], lab: [192, 145.5], d: '16′ × 12′-1½″', f: 'wood' },
      { n: 'Lobby', r: [315, 310.5, 370.5, 364.5], lab: null, f: 'tile', tour: false },
      { n: 'Toilet 2', r: [375, 310.5, 507, 364.5], lab: [132, 54], d: '11′ × 4′-6″', f: 'bath' },
      { n: 'Living', r: [9, 369, 183, 507], lab: [174, 138], d: '14′-6″ × 11′-6″', f: 'tile' },
      { n: 'Pooja Lobby', r: [187.5, 369, 247.5, 406.5], lab: null, f: 'tile', tour: false },
      { n: 'Pooja', r: [187.5, 411, 247.5, 507], lab: [60, 96], d: '5′ × 8′', f: 'marble' },
      { n: 'Bedroom 3', r: [252, 369, 442.5, 507], lab: [190.5, 138], d: '15′-10½″ × 11′-6″', f: 'wood' },
      { n: 'Toilet 3', r: [447, 369, 507, 507], lab: [60, 138], d: '5′ × 11′-6″', f: 'bath' },
    ],
    furn: [
      ['kitchen', 'Cooking', { runs: [['n', 300, 555], ['w', 212, 470], ['e', 212, 360]], hob: ['w', 295], sink: ['w', 440], upper: [['n', 300, 555], ['e', 212, 360]] }],
      ['dining', 'Dining', 668, 284, 'rect6'], ['crock', 'Dining', 'e', 168, 485],
      // mandir moved to the south wall so it faces the pooja doors (owner's instruction)
      ['mandir', 'Pooja', 's'],
      ['wc', 'Toilet 1', 'n', 885], ['vanity', 'Toilet 1', 'w', 278],
      ['bed', 'Master Bedroom', 1156.5, 'king'], ['ward', 'Master Bedroom', 'e', 168, 385],
      ['bed', 'Bedroom 2', 1156.5, 'queen'], ['ward', 'Bedroom 2', 'e', 495, 710],
      ['wc', 'Toilet 2', 'n', 1325], ['vanity', 'Toilet 2', 's', 1230], ['glass', 'Toilet 2', 'x', 1165, 818, 935],
      ['bed', 'Bedroom 3', 1036.5, 'queen'], ['ward', 'Bedroom 3', 'e', 945, 1055], ['ward', 'Bedroom 3', 'e', 1130, 1240],
      ['wc', 'Toilet 3', 'n', 1308], ['vanity', 'Toilet 3', 'e', 1085], ['glass', 'Toilet 3', 'z', 1162, 1245, 1372],
      ['sofa', 'Great Room', 'z', 578, 535, 625, 's'], ['sofa', 'Great Room', 'x', 700, 628, 832, 'w'],
      ['ctable', 'Great Room', 568, 736, 0.55, 1.1], ['tv', 'Great Room', 'w', 650], ['plant', 'Great Room', 662, 603],
      ['sofa', 'Living', 'x', 674, 980, 1080, 'w'], ['sofa', 'Living', 'x', 674, 1108, 1210, 'w'],
      ['ctable', 'Living', 542, 1099, 0.5, 1.0],
    ],
  },
  {
    id: 'p2',
    name: 'Plan-2 · 1944 sft slab',
    short: 'Plan-2',
    image: 'plans/plan-2.jpg',
    outer: [408, 516], // 34′-0″ × 43′-0″
    map: { ox: 190, oy: 76, kx: 408 / 997, kz: 516 / 1260 },
    note: 'Designed for the 56′-1″ × 59′-1″ Padma Reddy site.',
    plot: { x0: -235, z0: -25.5, x1: 438, z1: 683.5, label: [673, 709], gates: [{ side: 'w', from: 312, to: 360 }, { side: 's', from: 6, to: 126 }] },
    balconies: { side: 60, front: 84 },
    stairs: [773, 1336, 1070, 1540],
    walls: [
      [4.5, 4.5, 403.5, 4.5, 9, [['w', 298, 400], ['v', 585, 642], ['w', 712, 843]]],
      // pooja window (px 495-560) omitted on owner's instruction
      [4.5, 4.5, 4.5, 511.5, 9, [['w', 330, 418], ['w', 608, 695], ['dd', 855, 940, '+'], ['w', 1078, 1212]]],
      [403.5, 4.5, 403.5, 511.5, 9, [['w', 360, 447], ['w', 725, 810], ['v', 870, 930], ['v', 1108, 1168]]],
      [4.5, 511.5, 403.5, 511.5, 9, [['w', 232, 293], ['dd', 295, 410, '-'], ['w', 410, 484], ['w', 556, 688]]],
      [141.75, 4.5, 141.75, 158.25, 4.5, []],
      [4.5, 158.25, 403.5, 158.25, 4.5, [['a', 420, 490], ['a', 565, 660]]],
      [204.75, 4.5, 204.75, 158.25, 4.5, [['d', 365, 445, 'b+']]],
      [141.75, 107.25, 204.75, 107.25, 4.5, [['dt', 560, 630, 'a-']]],
      [83.25, 158.25, 83.25, 210.75, 4.5, [['dd', 485, 580, '-']]],
      [4.5, 210.75, 83.25, 210.75, 4.5, []],
      [228.75, 158.25, 228.75, 366.75, 4.5, [['d', 870, 955, 'b+']]],
      [228.75, 308.25, 403.5, 308.25, 4.5, [['a', 775, 880], ['dt', 985, 1055, 'a+']]],
      [288.75, 308.25, 288.75, 366.75, 4.5, []],
      [4.5, 366.75, 403.5, 366.75, 4.5, [['a', 270, 415], ['d', 555, 635, 'a+']]],
      [141.75, 366.75, 141.75, 511.5, 4.5, []],
      [336.75, 366.75, 336.75, 511.5, 4.5, [['dt', 1110, 1180, 'b+']]],
    ],
    rooms: [
      { n: 'Cooking', r: [9, 9, 139.5, 156], lab: [130.5, 147], d: '10′-10½″ × 12′-3″', f: 'kitchen' },
      { n: 'Toilet 1', r: [144, 9, 202.5, 105], lab: [58.5, 96], d: '8′ × 4′-10½″', f: 'bath' },
      { n: 'Passage', r: [144, 109.5, 202.5, 156], lab: null, f: 'tile', tour: false },
      { n: 'Master Bedroom', r: [207, 9, 399, 156], lab: [192, 147], d: '16′ × 12′-3″', f: 'wood' },
      { n: 'Pooja', r: [9, 160.5, 81, 208.5], lab: [72, 48], d: '6′ × 4′', f: 'marble' },
      { n: 'Great Room', rs: [[9, 213, 226.5, 364.5], [85.5, 160.5, 226.5, 213]], lab: [217.5, 204], d: '18′-1½″ × 17′', f: 'tile' },
      { n: 'Bedroom 2', r: [231, 160.5, 399, 306], lab: [168, 145.5], d: '14′ × 12′-1½″', f: 'wood' },
      { n: 'Lobby', r: [231, 310.5, 286.5, 364.5], lab: null, f: 'tile', tour: false },
      { n: 'Toilet 2', r: [291, 310.5, 399, 364.5], lab: [108, 54], d: '9′ × 4′-6″', f: 'bath' },
      { n: 'Living', r: [9, 369, 139.5, 507], lab: [130.5, 138], d: '10′-10½″ × 11′-6″', f: 'tile' },
      { n: 'Bedroom 3', r: [144, 369, 334.5, 507], lab: [190.5, 138], d: '15′-10½″ × 11′-6″', f: 'wood' },
      { n: 'Toilet 3', r: [339, 369, 399, 507], lab: [60, 138], d: '5′ × 11′-6″', f: 'bath' },
    ],
    furn: [
      ['kitchen', 'Cooking', { runs: [['n', 210, 530], ['w', 150, 440]], hob: ['w', 240], sink: ['w', 408], upper: [['n', 210, 530]] }],
      ['crock', 'Cooking', 'e', 150, 458],
      ['wc', 'Toilet 1', 'n', 612], ['vanity', 'Toilet 1', 'w', 222],
      ['bed', 'Master Bedroom', 918, 'king'], ['ward', 'Master Bedroom', 'e', 98, 345],
      ['bed', 'Bedroom 2', 935, 'queen'], ['ward', 'Bedroom 2', 'e', 468, 715],
      ['wc', 'Toilet 2', 'n', 1115], ['vanity', 'Toilet 2', 's', 1030], ['glass', 'Toilet 2', 'x', 973, 835, 966],
      ['bed', 'Bedroom 3', 782, 'queen'], ['ward', 'Bedroom 3', 'e', 978, 1100], ['ward', 'Bedroom 3', 'e', 1190, 1314],
      ['wc', 'Toilet 3', 'n', 1092], ['vanity', 'Toilet 3', 'e', 1138], ['glass', 'Toilet 3', 'z', 1227, 1018, 1165],
      ['mandir', 'Pooja', 'w'],
      ['diwan', 'Great Room', 218, 395],
      ['sofa', 'Great Room', 'x', 700, 635, 868, 'w'], ['ctable', 'Great Room', 550, 761, 0.55, 1.1], ['tv', 'Great Room', 'w', 772],
      ['sofa', 'Living', 'x', 531, 995, 1110, 'w'], ['sofa', 'Living', 'x', 531, 1140, 1258, 'w'],
      ['ctable', 'Living', 381, 1132, 0.5, 1.0],
    ],
  },
];

// Standard sizes and heights used where the drawings give no dimension (inches unless noted).
// Openings use typical Indian sizes, set in millimetres (mm / 25.4 = inches): doors 2100 mm high; room doors 900,
// toilet doors 750, main / double doors 900–1500; windows 600–2100 wide × 1200 high on a 900 mm sill;
// ventilators 600 × 450 under the 2100 mm lintel.
const MM = (mm) => mm / 25.4;
export const STD = {
  ceiling: 120, // floor to ceiling 10′-0″ (3.048 m)
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

export const TOUR_ORDER = [
  'Front Balcony', 'Living', 'Great Room', 'Pooja', 'Dining', 'Cooking', 'Toilet 1',
  'Master Bedroom', 'Bedroom 2', 'Toilet 2', 'Bedroom 3', 'Toilet 3', 'Side Balcony',
];
