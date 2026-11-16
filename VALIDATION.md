# Measurement validation report

Generated from the live 3D model (1 unit = 1 m).

Room sizes are **measured in the built model**: rays are cast at 2.6 m height from each room's centre to the actual wall meshes, so they are wall-face to wall-face. These are compared with the written dimensions on the architect's drawings. Opening widths are measured the same way, along the wall line. Clearances are 2D distances from each furniture front edge to the nearest wall or furniture. Walking routes use the same A* grid as the walkthrough.

Tolerance: 1 mm.


## Ground Floor Plan

10/11 labelled rooms match their drawing size to within 1 mm; Dining differs because the drawing contradicts its own dimension chain (see deviations). Openings: 30/30 measured widths equal the modelled widths. Furniture clearances: 35/35 OK. Door swings: 10/10 clear. Rooms reachable on foot: 15/15.

### Rooms: clear wall-to-wall size measured in the 3D model (Ground Floor Plan)

| Room | Drawing label | Drawing W × D | Model W (ray-cast) | Model D (ray-cast) | ΔW | ΔD | Area | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cooking | 9′ × 9′-7½″ | 9′-0″ × 9′-7½″ | 2.743 m (9′-0″) | 2.934 m (9′-7½″) | +0.0 mm | +0.0 mm | 8.05 m² / 86.6 sft | ✅ match |
| Pooja | 6′ × 4′ | 6′-0″ × 4′-0″ | 1.829 m (6′-0″) | 1.219 m (4′-0″) | +0.0 mm | +0.0 mm | 2.23 m² / 24.0 sft | ✅ match |
| Dining | 9′ × 14′ | 9′-0″ × 14′-0″ | 2.629 m (8′-7½″) | 4.267 m (14′-0″) | −114.3 mm | +0.0 mm | 11.22 m² / 120.8 sft | ⚠️ drawing conflict |
| Toilet 1 | 5′ × 9′-6″ | 5′-0″ × 9′-6″ | 1.524 m (5′-0″) | 2.896 m (9′-6″) | +0.0 mm | +0.0 mm | 4.41 m² / 47.5 sft | ✅ match |
| Passage | — | — | 1.524 m (5′-0″) | 1.257 m (4′-1½″) | — | — | 1.92 m² / 20.6 sft | ➖ not labelled |
| Master Bedroom | 16′ × 14′ | 16′-0″ × 14′-0″ | 4.877 m (16′-0″) | 4.267 m (14′-0″) | +0.0 mm | +0.0 mm | 20.81 m² / 224.0 sft | ✅ match |
| Great Room | 23′-4½″ × 18′ | 23′-4½″ × 18′-0″ | 7.125 m (23′-4½″) | 5.486 m (18′-0″) | +0.0 mm | +0.0 mm | 39.09 m² / 420.8 sft | ✅ match |
| Bedroom 2 | 16′ × 12′-7½″ | 16′-0″ × 12′-7½″ | 4.877 m (16′-0″) | 3.848 m (12′-7½″) | +0.0 mm | +0.0 mm | 18.77 m² / 202.0 sft | ✅ match |
| Lobby | — | — | 1.715 m (5′-7½″) | 1.524 m (5′-0″) | — | — | 2.61 m² / 28.1 sft | ➖ not labelled |
| Toilet 2 | 10′ × 5′ | 10′-0″ × 5′-0″ | 3.048 m (10′-0″) | 1.524 m (5′-0″) | +0.0 mm | +0.0 mm | 4.65 m² / 50.0 sft | ✅ match |
| Living | 18′ × 12′ | 18′-0″ × 12′-0″ | 5.486 m (18′-0″) | 3.658 m (12′-0″) | +0.0 mm | +0.0 mm | 20.07 m² / 216.0 sft | ✅ match |
| Bedroom 3 | 16′ × 12′ | 16′-0″ × 12′-0″ | 4.877 m (16′-0″) | 3.658 m (12′-0″) | +0.0 mm | +0.0 mm | 17.84 m² / 192.0 sft | ✅ match |
| Toilet 3 | 5′ × 12′ | 5′-0″ × 12′-0″ | 1.524 m (5′-0″) | 3.658 m (12′-0″) | +0.0 mm | +0.0 mm | 5.57 m² / 60.0 sft | ✅ match |

### Overall dimensions & walls

| Item | Drawing | Model | Δ | Status |
| --- | --- | --- | --- | --- |
| Building outer width | 41′-3″ (12.573 m) | 12.573 m (41′-3″) | −0.0 mm | ✅ match |
| Building outer depth | 46′-3″ (14.097 m) | 14.097 m (46′-3″) | −0.0 mm | ✅ match |
| Outer wall thickness | 9″ (0.229 m) | 0.229 m (9″) | +0.0 mm | ✅ match |
| Inner wall thickness | 4½″ (0.114 m) | 0.114 m (4½″) | +0.0 mm | ✅ match |
| Side balcony width | 5′-0″ | 1.524 m (5′-0″) | +0.0 mm | ✅ match |
| Front balcony width | 7′-0″ | 2.134 m (7′-0″) | +0.0 mm | ✅ match |
| Plot width | 57′-0″ | 17.374 m (57′-0″) | +0.0 mm | ✅ match |
| Plot depth | 65′-0″ | 19.812 m (65′-0″) | +0.0 mm | ✅ match |
| Every wall mesh at 9″ or 4½″ only | — | yes | — | ✅ |

### Doors, windows and openings: clear width measured in the model

| Opening | Between | Drawing (scaled) | Model | Measured | Centre shift | Sill → head | OK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Window | outside ↔ Cooking | 2′-11¾″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | outside ↔ Dining | 6′-0½″ | 5′-10⅞″ (1.800 m) | 1.800 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Ventilator | outside ↔ Toilet 1 | 2′-0⅝″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 1.650 → 2.100 m | ✅ |
| Window | outside ↔ Master Bedroom | 4′-6¾″ | 4′-11″ (1.500 m) | 1.500 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Cooking | 2′-10½″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Great Room | 2′-10½″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Great Room | 3′-0⅝″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Double door (+) | Side Balcony ↔ Great Room | 2′-8⅜″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Living | 1′-11¾″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Living | 1′-11¾″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Master Bedroom ↔ outside | 2′-10½″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Bedroom 2 ↔ outside | 3′-0⅝″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Ventilator | Toilet 2 ↔ outside | 1′-11¾″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 1.650 → 2.100 m | ✅ |
| Ventilator | Toilet 3 ↔ outside | 1′-11¾″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 1.650 → 2.100 m | ✅ |
| Window | Living ↔ Front Balcony | 2′-0⅝″ | 1′-11⅝″ (0.600 m) | 0.600 m | −61.7 mm | 0.900 → 2.100 m | ✅ |
| Double door (-) | Living ↔ Front Balcony | 3′-11⅜″ | 3′-11¼″ (1.200 m) | 1.200 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Window | Living ↔ Front Balcony | 2′-0⅝″ | 1′-11⅝″ (0.600 m) | 0.600 m | +61.7 mm | 0.900 → 2.100 m | ✅ |
| Window | Bedroom 3 ↔ Front Balcony | 4′-6¾″ | 4′-11″ (1.500 m) | 1.500 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Open arch | Cooking ↔ Dining | 3′-2⅞″ | 3′-3″ (0.991 m) | 0.991 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Double door (-) | Pooja ↔ Dining | 2′-10½″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Toilet door (b-) | Toilet 1 ↔ Master Bedroom | 2′-4″ | 2′-5½″ (0.750 m) | 0.750 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Passage ↔ Master Bedroom | 3′-11½″ | 3′-11″ (1.194 m) | 1.194 m | −21.4 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Dining ↔ Great Room | 7′-6½″ | 7′-7″ (2.311 m) | 2.311 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Door (a-) | Passage ↔ Great Room | 2′-8⅜″ | 2′-11⅜″ (0.900 m) | 0.900 m | −0.0 mm | 0.000 → 2.100 m | ✅ |
| Door (b+) | Great Room ↔ Lobby | 2′-10½″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Bedroom 2 ↔ Lobby | 4′-3¾″ | 4′-4″ (1.321 m) | 1.321 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Toilet door (a+) | Bedroom 2 ↔ Toilet 2 | 2′-1⅞″ | 2′-5½″ (0.750 m) | 0.750 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Great Room ↔ Living | 6′-3½″ | 6′-3″ (1.905 m) | 1.905 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Door (a+) | Great Room ↔ Bedroom 3 | 2′-8⅜″ | 2′-11⅜″ (0.900 m) | 0.900 m | −0.0 mm | 0.000 → 2.100 m | ✅ |
| Toilet door (b+) | Bedroom 3 ↔ Toilet 3 | 2′-4″ | 2′-5½″ (0.750 m) | 0.750 m | +0.0 mm | 0.000 → 2.100 m | ✅ |

### Furniture: real sizes and front clearance (to nearest wall/furniture)

| Room | Item | Front clearance | Limited by | Needed | OK |
| --- | --- | --- | --- | --- | --- |
| Master Bedroom | Wardrobe 3091×600 mm | 0.600 m (1′-11⅝″) | King bed 1830×1980 mm + side tables | 0.60 m | ✅ |
| Bedroom 2 | Wardrobe 2675×600 mm | 0.600 m (1′-11⅝″) | Queen bed 1520×1980 mm + side tables | 0.60 m | ✅ |
| Bedroom 3 | Wardrobe 1436×600 mm | 0.600 m (1′-11⅝″) | Queen bed 1520×1980 mm + side tables | 0.60 m | ✅ |
| Bedroom 3 | Wardrobe 1228×600 mm | 4.277 m (14′-0⅜″) | wall | 0.60 m | ✅ |
| Cooking | Kitchen counter 2739×600×850 mm | 2.334 m (7′-7⅞″) | wall | 0.90 m | ✅ |
| Cooking | Kitchen counter 2164×600×850 mm | 2.143 m (7′-0⅜″) | wall | 0.90 m | ✅ |
| Cooking | Hob 750 mm + chimney 900 mm | — | — | — | ✅ |
| Cooking | Sink 800×500 mm | — | — | — | ✅ |
| Dining | Refrigerator 700×720×1800 mm | 4.166 m (13′-8″) | Kitchen counter 2164×600×850 mm | 0.60 m | ✅ |
| Dining | Round dining table Ø1000 mm, 4 chairs | — | — | — | ✅ |
| Pooja | Mandir 1019×450 mm (idols: Ganesha, Venkateswara, Lakshmi, Shiva lingam) | 0.989 m (3′-2⅞″) | door leaf / glass | 0.75 m | ✅ |
| Toilet 1 | EWC 380×700 mm | 1.182 m (3′-10½″) | door leaf / glass | 0.50 m | ✅ |
| Toilet 1 | Vanity 600×450 mm + mirror | 1.074 m (3′-6¼″) | wall | 0.50 m | ✅ |
| Toilet 1 | Shower glass 910 mm (10 mm toughened, 2.0 m high) | — | — | — | ✅ |
| Master Bedroom | King bed 1830×1980 mm + side tables | 2.107 m (6′-11″) | wall | 0.60 m | ✅ |
| Bedroom 2 | Queen bed 1520×1980 mm + side tables | 1.688 m (5′-6½″) | wall | 0.60 m | ✅ |
| Toilet 2 | EWC 380×700 mm | 0.824 m (2′-8⅜″) | wall | 0.50 m | ✅ |
| Toilet 2 | Vanity 600×450 mm + mirror | 1.074 m (3′-6¼″) | wall | 0.50 m | ✅ |
| Toilet 2 | Shower glass 914 mm (10 mm toughened, 2.0 m high) | — | — | — | ✅ |
| Bedroom 3 | Queen bed 1520×1980 mm + side tables | 1.498 m (4′-11″) | wall | 0.60 m | ✅ |
| Toilet 3 | EWC 380×700 mm | 1.542 m (5′-0¾″) | door leaf / glass | 0.50 m | ✅ |
| Toilet 3 | Vanity 600×450 mm + mirror | 2.388 m (7′-10″) | Queen bed 1520×1980 mm + side tables | 0.50 m | ✅ |
| Toilet 3 | Shower glass 900 mm (10 mm toughened, 2.0 m high) | — | — | — | ✅ |
| Great Room | Sofa 1062×880 mm | 0.411 m (1′-4¼″) | Coffee table 550×1100 mm | 0.40 m | ✅ |
| Great Room | Sofa 2412×880 mm | 0.400 m (1′-3¾″) | Coffee table 550×1100 mm | 0.40 m | ✅ |
| Great Room | Coffee table 550×1100 mm | — | — | — | ✅ |
| Great Room | Floor planter | — | — | — | ✅ |
| Living | Sofa 1062×880 mm | 0.424 m (1′-4⅝″) | Coffee table 550×900 mm | 0.40 m | ✅ |
| Living | Sofa 2357×880 mm | 0.400 m (1′-3¾″) | Coffee table 550×900 mm | 0.40 m | ✅ |
| Living | Sofa 1062×880 mm | 0.424 m (1′-4⅝″) | Coffee table 550×900 mm | 0.40 m | ✅ |
| Living | Coffee table 550×900 mm | — | — | — | ✅ |
| Living | Floor planter | — | — | — | ✅ |
| Living | Floor planter | — | — | — | ✅ |
| Great Room | TV feature wall 1494 mm (clear wall 1594 mm): 55″ TV 1218×685 mm, floating console 1444×350×280 mm at 300 mm | 3.065 m (10′-0⅝″) | Sofa 1062×880 mm | 0.60 m | ✅ |
| Living | TV feature wall 1602 mm (clear wall 1702 mm): 55″ TV 1218×685 mm, floating console 1552×350×280 mm at 300 mm | 3.185 m (10′-5⅜″) | Coffee table 550×900 mm | 0.60 m | ✅ |

### Door swings (leaf opened 90°): free of furniture

| Door | Type | Leaf | Conflicts | OK |
| --- | --- | --- | --- | --- |
| Side Balcony ↔ Great Room | dd | 0.780 m | none | ✅ |
| Living ↔ Front Balcony | dd | 1.080 m | none | ✅ |
| Pooja ↔ Dining | dd | 0.390 m | none | ✅ |
| Pooja ↔ Dining | dd | 0.390 m | none | ✅ |
| Toilet 1 ↔ Master Bedroom | dt | 0.630 m | none | ✅ |
| Passage ↔ Great Room | d | 0.780 m | none | ✅ |
| Great Room ↔ Lobby | d | 0.780 m | none | ✅ |
| Bedroom 2 ↔ Toilet 2 | dt | 0.630 m | none | ✅ |
| Great Room ↔ Bedroom 3 | d | 0.780 m | none | ✅ |
| Bedroom 3 ↔ Toilet 3 | dt | 0.630 m | none | ✅ |

### Walking routes from the front balcony (A* through doorways, 0.22 m body clearance)

| Room | Reachable | Route length |
| --- | --- | --- |
| Cooking | ✅ | 13.367 m |
| Pooja | ✅ | 12.497 m |
| Dining | ✅ | 11.425 m |
| Toilet 1 | ✅ | 17.842 m |
| Passage | ✅ | 14.316 m |
| Master Bedroom | ✅ | 17.975 m |
| Great Room | ✅ | 10.581 m |
| Bedroom 2 | ✅ | 14.941 m |
| Lobby | ✅ | 10.940 m |
| Toilet 2 | ✅ | 14.900 m |
| Living | ✅ | 5.363 m |
| Bedroom 3 | ✅ | 9.942 m |
| Toilet 3 | ✅ | 16.921 m |
| Side Balcony | ✅ | 7.862 m |
| Front Balcony | ✅ | 0.000 m |

### Heights used (not dimensioned on the drawings)

| Item | Value | Source |
| --- | --- | --- |
| Floor to ceiling | 3.048 m (10′-0″) | 10′-0″ — not on drawing; standard 10′-0″ |
| Door / arch / window head (lintel) | 2.100 m (6′-10⅝″) | 6′-10⅝″ — not on drawing; standard 2100 mm |
| Window sill | 0.900 m (2′-11⅜″) | 2′-11⅜″ — not on drawing; standard 900 mm (1200 mm high windows) |
| Ventilator sill | 1.650 m (5′-5″) | 5′-5″ — 600 × 450 mm ventilator under the lintel |
| RCC slab | 0.127 m (5″) | 5″ — assumed |
| Plinth above ground | 0.457 m (1′-6″) | 1′-6″ — assumed |
| Stair riser / tread | 0.176 m (7″) | 176 mm × 250 mm, 18 risers, flights 1.063 m wide — flights drawn, risers assumed |
| Eye height (walk mode) | 1.600 m (5′-3″) | 1.600 m |

### Assumptions

- Door and window POSITIONS are not dimensioned on the drawings; their centres are scaled from the drawing (fitted to the dimensioned outer faces, so expect ±1–2″).
- Door and window widths are typical Indian sizes: room doors 900 mm, toilet doors 750 mm, main / double doors the nearest of 900, 1000, 1050, 1200, 1500 mm to the drawing, all 2100 mm high. Windows are the nearest of 600, 900, 1200, 1500, 1800, 2100 mm to the scaled drawing width, 1200 mm high on a 900 mm sill. Ventilators are 600 × 450 mm.
- Furniture positions follow the drawing symbols, but every piece uses a standard real size (e.g. queen bed 1.52 × 1.98 m, sofa depth 0.88 m, counters 0.6 × 0.85 m, wardrobes 0.6 m deep). The drawing symbols are not drawn to furniture scale.
- There are no columns or beams on the drawings, so none are modelled. Beams sit inside the 9″ / 4½″ walls above the 2100 mm lintel line, and the balconies are a cantilevered slab.
- Gate positions are scaled from the drawing.

### Deviations from the drawing

- Pooja window omitted (owner instruction: "no window required in the pooja room").
- Dining: Top-row labels (9′ + 9′ + 5′ + 16′ + walls) add up to 41′-7½″ against the 41′-3″ overall. Cooking, Toilet and Master Bedroom are kept as labelled; Dining takes the remainder (8′-7½″). This also lines its east wall up with the Living/Bedroom-3 wall.
- GF Plan: window next to a dd on wall #4 moved 2.4″ along the wall to keep a 3″ pier (standard width kept).
- GF Plan: window next to a dd on wall #4 moved 2.4″ along the wall to keep a 3″ pier (standard width kept).
- Master Bedroom: bed moved 187 mm west of its drawn position to keep 600 mm clear in front of the wardrobe / walls (standard-size bed).
- Bedroom 2: bed moved 32 mm west of its drawn position to keep 600 mm clear in front of the wardrobe / walls (standard-size bed).
- Bedroom 3: bed moved 181 mm west of its drawn position to keep 600 mm clear in front of the wardrobe / walls (standard-size bed).

## Plan-1 · 2394 sft slab

10/11 labelled rooms match their drawing size to within 1 mm; Great Room differs because the drawing contradicts its own dimension chain (see deviations). Openings: 30/30 measured widths equal the modelled widths. Furniture clearances: 29/30 OK. Door swings: 10/10 clear. Rooms reachable on foot: 16/16.

### Rooms: clear wall-to-wall size measured in the 3D model (Plan-1 · 2394 sft slab)

| Room | Drawing label | Drawing W × D | Model W (ray-cast) | Model D (ray-cast) | ΔW | ΔD | Area | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cooking | 9′-6″ × 12′-3″ | 9′-6″ × 12′-3″ | 2.896 m (9′-6″) | 3.734 m (12′-3″) | +0.0 mm | +0.0 mm | 10.81 m² / 116.4 sft | ✅ match |
| Dining | 10′ × 12′-3″ | 10′-0″ × 12′-3″ | 3.048 m (10′-0″) | 3.734 m (12′-3″) | +0.0 mm | +0.0 mm | 11.38 m² / 122.5 sft | ✅ match |
| Toilet 1 | 8′ × 4′-10½″ | 4′-10½″ × 8′-0″ | 1.486 m (4′-10½″) | 2.438 m (8′-0″) | +0.0 mm | +0.0 mm | 3.62 m² / 39.0 sft | ✅ match |
| Passage | — | — | 1.486 m (4′-10½″) | 1.181 m (3′-10½″) | — | — | 1.75 m² / 18.9 sft | ➖ not labelled |
| Master Bedroom | 16′ × 12′-3″ | 16′-0″ × 12′-3″ | 4.877 m (16′-0″) | 3.734 m (12′-3″) | +0.0 mm | +0.0 mm | 18.21 m² / 196.0 sft | ✅ match |
| Great Room | 23′-4½″ × 17′ | 23′-4½″ × 17′-0″ | 7.658 m (25′-1½″) | 5.182 m (17′-0″) | +533.4 mm | +0.0 mm | 39.68 m² / 427.1 sft | ⚠️ drawing conflict |
| Bedroom 2 | 16′ × 12′-1½″ | 16′-0″ × 12′-1½″ | 4.877 m (16′-0″) | 3.696 m (12′-1½″) | +0.0 mm | +0.0 mm | 18.02 m² / 194.0 sft | ✅ match |
| Lobby | — | — | 1.410 m (4′-7½″) | 1.372 m (4′-6″) | — | — | 1.93 m² / 20.8 sft | ➖ not labelled |
| Toilet 2 | 11′ × 4′-6″ | 11′-0″ × 4′-6″ | 3.353 m (11′-0″) | 1.372 m (4′-6″) | +0.0 mm | +0.0 mm | 4.60 m² / 49.5 sft | ✅ match |
| Living | 14′-6″ × 11′-6″ | 14′-6″ × 11′-6″ | 4.420 m (14′-6″) | 3.505 m (11′-6″) | +0.0 mm | +0.0 mm | 15.49 m² / 166.8 sft | ✅ match |
| Pooja Lobby | — | — | 1.524 m (5′-0″) | 0.953 m (3′-1½″) | — | — | 1.45 m² / 15.6 sft | ➖ not labelled |
| Pooja | 5′ × 8′ | 5′-0″ × 8′-0″ | 1.524 m (5′-0″) | 2.438 m (8′-0″) | +0.0 mm | +0.0 mm | 3.72 m² / 40.0 sft | ✅ match |
| Bedroom 3 | 15′-10½″ × 11′-6″ | 15′-10½″ × 11′-6″ | 4.839 m (15′-10½″) | 3.505 m (11′-6″) | +0.0 mm | +0.0 mm | 16.96 m² / 182.6 sft | ✅ match |
| Toilet 3 | 5′ × 11′-6″ | 5′-0″ × 11′-6″ | 1.524 m (5′-0″) | 3.505 m (11′-6″) | +0.0 mm | +0.0 mm | 5.34 m² / 57.5 sft | ✅ match |

### Overall dimensions & walls

| Item | Drawing | Model | Δ | Status |
| --- | --- | --- | --- | --- |
| Building outer width | 43′-0″ (13.106 m) | 13.106 m (43′-0″) | −0.0 mm | ✅ match |
| Building outer depth | 43′-0″ (13.106 m) | 13.106 m (43′-0″) | −0.0 mm | ✅ match |
| Outer wall thickness | 9″ (0.229 m) | 0.229 m (9″) | +0.0 mm | ✅ match |
| Inner wall thickness | 4½″ (0.114 m) | 0.114 m (4½″) | +0.0 mm | ✅ match |
| Side balcony width | 5′-0″ | 1.524 m (5′-0″) | +0.0 mm | ✅ match |
| Front balcony width | 7′-0″ | 2.134 m (7′-0″) | +0.0 mm | ✅ match |
| Plot width | 56′-1″ | 17.094 m (56′-1″) | +0.0 mm | ✅ match |
| Plot depth | 59′-1″ | 18.009 m (59′-1″) | +0.0 mm | ✅ match |
| Every wall mesh at 9″ or 4½″ only | — | yes | — | ✅ |

### Doors, windows and openings: clear width measured in the model

| Opening | Between | Drawing (scaled) | Model | Measured | Centre shift | Sill → head | OK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Window | outside ↔ Cooking | 3′-5¾″ | 3′-11¼″ (1.200 m) | 1.200 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | outside ↔ Dining | 8′-3¾″ | 6′-10⅝″ (2.100 m) | 2.100 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Ventilator | outside ↔ Toilet 1 | 2′-0⅛″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 1.650 → 2.100 m | ✅ |
| Window | outside ↔ Master Bedroom | 4′-6¼″ | 4′-11″ (1.500 m) | 1.500 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Cooking | 3′-0¼″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Great Room | 3′-0¼″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Great Room | 3′-1⅛″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Double door (+) | Side Balcony ↔ Great Room | 2′-9⅜″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Living | 4′-5⅜″ | 4′-11″ (1.500 m) | 1.500 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Master Bedroom ↔ outside | 2′-10¾″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Bedroom 2 ↔ outside | 3′-1⅛″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Ventilator | Toilet 2 ↔ outside | 1′-11¼″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 1.650 → 2.100 m | ✅ |
| Ventilator | Toilet 3 ↔ outside | 1′-11¼″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 1.650 → 2.100 m | ✅ |
| Window | Living ↔ Front Balcony | 2′-0⅝″ | 1′-11⅝″ (0.600 m) | 0.600 m | −51.0 mm | 0.900 → 2.100 m | ✅ |
| Double door (-) | Living ↔ Front Balcony | 3′-10⅜″ | 3′-11¼″ (1.200 m) | 1.200 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Window | Living ↔ Front Balcony | 2′-0⅝″ | 1′-11⅝″ (0.600 m) | 0.600 m | +74.5 mm | 0.900 → 2.100 m | ✅ |
| Window | Bedroom 3 ↔ Front Balcony | 4′-5⅞″ | 4′-11″ (1.500 m) | 1.500 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Open arch | Cooking ↔ Dining | 3′-10⅜″ | 3′-10″ (1.168 m) | 1.168 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Dining ↔ Great Room | 7′-8¾″ | 7′-9″ (2.362 m) | 2.362 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Passage ↔ Great Room | 3′-3½″ | 3′-3″ (0.991 m) | 0.991 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Toilet door (a-) | Toilet 1 ↔ Passage | 2′-3⅞″ | 2′-5½″ (0.750 m) | 0.750 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Door (b+) | Passage ↔ Master Bedroom | 2′-8½″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Door (b+) | Great Room ↔ Lobby | 2′-8½″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Bedroom 2 ↔ Lobby | 3′-1⅛″ | 3′-1″ (0.940 m) | 0.940 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Toilet door (a+) | Bedroom 2 ↔ Toilet 2 | 2′-3⅞″ | 2′-5½″ (0.750 m) | 0.750 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Great Room ↔ Living | 6′-2¼″ | 6′-2″ (1.880 m) | 1.880 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Great Room ↔ Pooja Lobby | 3′-3½″ | 3′-3″ (0.991 m) | 0.991 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Door (a+) | Great Room ↔ Bedroom 3 | 2′-8½″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Double door (+) | Pooja Lobby ↔ Pooja | 2′-10¾″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Toilet door (b+) | Bedroom 3 ↔ Toilet 3 | 2′-3⅞″ | 2′-5½″ (0.750 m) | 0.750 m | +0.0 mm | 0.000 → 2.100 m | ✅ |

### Furniture: real sizes and front clearance (to nearest wall/furniture)

| Room | Item | Front clearance | Limited by | Needed | OK |
| --- | --- | --- | --- | --- | --- |
| Dining | Crockery unit 3727×380 mm | 0.483 m (1′-7″) | Dining table 900×1500 mm, 6 chairs | 0.60 m | ⚠️ |
| Master Bedroom | Wardrobe 2558×600 mm | 0.600 m (1′-11⅝″) | King bed 1830×1980 mm + side tables | 0.60 m | ✅ |
| Bedroom 2 | Wardrobe 2534×600 mm | 0.627 m (2′-0⅝″) | Queen bed 1520×1980 mm + side tables | 0.60 m | ✅ |
| Bedroom 3 | Wardrobe 1296×600 mm | 0.600 m (1′-11⅝″) | Queen bed 1520×1980 mm + side tables | 0.60 m | ✅ |
| Bedroom 3 | Wardrobe 1296×600 mm | 4.239 m (13′-10⅞″) | wall | 0.60 m | ✅ |
| Cooking | Kitchen counter 2888×600×850 mm | 3.134 m (10′-3⅜″) | wall | 0.90 m | ✅ |
| Cooking | Kitchen counter 2967×600×850 mm | 2.295 m (7′-6⅜″) | wall | 0.90 m | ✅ |
| Cooking | Hob 750 mm + chimney 900 mm | — | — | — | ✅ |
| Cooking | Sink 800×500 mm | — | — | — | ✅ |
| Dining | Dining table 900×1500 mm, 6 chairs | — | — | — | ✅ |
| Pooja | Mandir 1200×450 mm (idols: Ganesha, Venkateswara, Lakshmi, Shiva lingam) | 1.988 m (6′-6¼″) | wall | 0.75 m | ✅ |
| Toilet 1 | EWC 380×700 mm | 11.949 m (39′-2⅜″) | wall | 0.50 m | ✅ |
| Toilet 1 | Vanity 600×450 mm + mirror | 1.036 m (3′-4¾″) | wall | 0.50 m | ✅ |
| Master Bedroom | King bed 1830×1980 mm + side tables | 1.574 m (5′-2″) | wall | 0.60 m | ✅ |
| Bedroom 2 | Queen bed 1520×1980 mm + side tables | 1.536 m (5′-0½″) | wall | 0.60 m | ✅ |
| Toilet 2 | EWC 380×700 mm | 0.672 m (2′-2⅜″) | wall | 0.50 m | ✅ |
| Toilet 2 | Vanity 600×450 mm + mirror | 0.922 m (3′-0¼″) | wall | 0.50 m | ✅ |
| Toilet 2 | Shower glass 817 mm (10 mm toughened, 2.0 m high) | — | — | — | ✅ |
| Bedroom 3 | Queen bed 1520×1980 mm + side tables | 1.345 m (4′-5″) | wall | 0.60 m | ✅ |
| Toilet 3 | EWC 380×700 mm | 1.310 m (4′-3⅝″) | door leaf / glass | 0.50 m | ✅ |
| Toilet 3 | Vanity 600×450 mm + mirror | 2.388 m (7′-10″) | Queen bed 1520×1980 mm + side tables | 0.50 m | ✅ |
| Toilet 3 | Shower glass 898 mm (10 mm toughened, 2.0 m high) | — | — | — | ✅ |
| Great Room | Sofa 1061×880 mm | 0.432 m (1′-5″) | Coffee table 550×1100 mm | 0.40 m | ✅ |
| Great Room | Sofa 2404×880 mm | 0.401 m (1′-3¾″) | Coffee table 550×1100 mm | 0.40 m | ✅ |
| Great Room | Coffee table 550×1100 mm | — | — | — | ✅ |
| Great Room | Floor planter | — | — | — | ✅ |
| Living | Sofa 1179×880 mm | 0.426 m (1′-4¾″) | Coffee table 500×1000 mm | 0.40 m | ✅ |
| Living | Sofa 1202×880 mm | 0.426 m (1′-4¾″) | Coffee table 500×1000 mm | 0.40 m | ✅ |
| Living | Coffee table 500×1000 mm | — | — | — | ✅ |
| Great Room | TV feature wall 1287 mm (clear wall 1387 mm): 50″ TV 1107×623 mm, floating console 1237×350×280 mm at 300 mm | 2.402 m (7′-10½″) | Sofa 1061×880 mm | 0.60 m | ✅ |

### Door swings (leaf opened 90°): free of furniture

| Door | Type | Leaf | Conflicts | OK |
| --- | --- | --- | --- | --- |
| Side Balcony ↔ Great Room | dd | 0.780 m | none | ✅ |
| Living ↔ Front Balcony | dd | 1.080 m | none | ✅ |
| Toilet 1 ↔ Passage | dt | 0.630 m | none | ✅ |
| Passage ↔ Master Bedroom | d | 0.780 m | none | ✅ |
| Great Room ↔ Lobby | d | 0.780 m | none | ✅ |
| Bedroom 2 ↔ Toilet 2 | dt | 0.630 m | none | ✅ |
| Great Room ↔ Bedroom 3 | d | 0.780 m | none | ✅ |
| Pooja Lobby ↔ Pooja | dd | 0.390 m | none | ✅ |
| Pooja Lobby ↔ Pooja | dd | 0.390 m | none | ✅ |
| Bedroom 3 ↔ Toilet 3 | dt | 0.630 m | none | ✅ |

### Walking routes from the front balcony (A* through doorways, 0.22 m body clearance)

| Room | Reachable | Route length |
| --- | --- | --- |
| Cooking | ✅ | 12.414 m |
| Dining | ✅ | 14.461 m |
| Toilet 1 | ✅ | 14.736 m |
| Passage | ✅ | 13.615 m |
| Master Bedroom | ✅ | 16.741 m |
| Great Room | ✅ | 10.101 m |
| Bedroom 2 | ✅ | 15.248 m |
| Lobby | ✅ | 11.377 m |
| Toilet 2 | ✅ | 15.336 m |
| Living | ✅ | 5.029 m |
| Pooja Lobby | ✅ | 8.833 m |
| Pooja | ✅ | 9.986 m |
| Bedroom 3 | ✅ | 10.274 m |
| Toilet 3 | ✅ | 17.507 m |
| Side Balcony | ✅ | 7.378 m |
| Front Balcony | ✅ | 0.000 m |

### Heights used (not dimensioned on the drawings)

| Item | Value | Source |
| --- | --- | --- |
| Floor to ceiling | 3.048 m (10′-0″) | 10′-0″ — not on drawing; standard 10′-0″ |
| Door / arch / window head (lintel) | 2.100 m (6′-10⅝″) | 6′-10⅝″ — not on drawing; standard 2100 mm |
| Window sill | 0.900 m (2′-11⅜″) | 2′-11⅜″ — not on drawing; standard 900 mm (1200 mm high windows) |
| Ventilator sill | 1.650 m (5′-5″) | 5′-5″ — 600 × 450 mm ventilator under the lintel |
| RCC slab | 0.127 m (5″) | 5″ — assumed |
| Plinth above ground | 0.457 m (1′-6″) | 1′-6″ — assumed |
| Stair riser / tread | 0.176 m (7″) | 176 mm × 250 mm, 18 risers, flights 1.061 m wide — flights drawn, risers assumed |
| Eye height (walk mode) | 1.600 m (5′-3″) | 1.600 m |

### Assumptions

- Door and window POSITIONS are not dimensioned on the drawings; their centres are scaled from the drawing (fitted to the dimensioned outer faces, so expect ±1–2″).
- Door and window widths are typical Indian sizes: room doors 900 mm, toilet doors 750 mm, main / double doors the nearest of 900, 1000, 1050, 1200, 1500 mm to the drawing, all 2100 mm high. Windows are the nearest of 600, 900, 1200, 1500, 1800, 2100 mm to the scaled drawing width, 1200 mm high on a 900 mm sill. Ventilators are 600 × 450 mm.
- Furniture positions follow the drawing symbols, but every piece uses a standard real size (e.g. queen bed 1.52 × 1.98 m, sofa depth 0.88 m, counters 0.6 × 0.85 m, wardrobes 0.6 m deep). The drawing symbols are not drawn to furniture scale.
- There are no columns or beams on the drawings, so none are modelled. Beams sit inside the 9″ / 4½″ walls above the 2100 mm lintel line, and the balconies are a cantilevered slab.
- Plan-1 and Plan-2 show no compound gates, so the gates are assumed in front of the main door and the side door.

### Deviations from the drawing

- Pooja window omitted (owner instruction: "no window required in the pooja room").
- Pooja mandir is on the south wall, facing the pooja doors, so you face the deities as you enter (owner instruction). The drawing showed it on the east wall.
- Great Room: Labelled 23′-4½″ wide (looks copied from the GF plan), but the dimension chain gives 9 + G + 4½ + 192 (Bedroom-2, 16′) + 9 = 516″ (43′), so G = 25′-1½″. The drawing is also drawn at 25′-1½″, so it is modelled at 25′-1½″.
- Plan-1: window next to a dd on wall #4 moved 2.0″ along the wall to keep a 3″ pier (standard width kept).
- Plan-1: window next to a dd on wall #4 moved 2.9″ along the wall to keep a 3″ pier (standard width kept).
- Master Bedroom: bed moved 128 mm west of its drawn position to keep 600 mm clear in front of the wardrobe / walls (standard-size bed).
- Bedroom 3: bed moved 197 mm west of its drawn position to keep 600 mm clear in front of the wardrobe / walls (standard-size bed).

## Plan-2 · 1944 sft slab

10/10 labelled rooms match their drawing size to within 1 mm. Openings: 26/26 measured widths equal the modelled widths. Furniture clearances: 28/28 OK. Door swings: 10/10 clear. Rooms reachable on foot: 14/14.

### Rooms: clear wall-to-wall size measured in the 3D model (Plan-2 · 1944 sft slab)

| Room | Drawing label | Drawing W × D | Model W (ray-cast) | Model D (ray-cast) | ΔW | ΔD | Area | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cooking | 10′-10½″ × 12′-3″ | 10′-10½″ × 12′-3″ | 3.315 m (10′-10½″) | 3.734 m (12′-3″) | +0.0 mm | +0.0 mm | 12.38 m² / 133.2 sft | ✅ match |
| Toilet 1 | 8′ × 4′-10½″ | 4′-10½″ × 8′-0″ | 1.486 m (4′-10½″) | 2.438 m (8′-0″) | +0.0 mm | +0.0 mm | 3.62 m² / 39.0 sft | ✅ match |
| Passage | — | — | 1.486 m (4′-10½″) | 1.181 m (3′-10½″) | — | — | 1.75 m² / 18.9 sft | ➖ not labelled |
| Master Bedroom | 16′ × 12′-3″ | 16′-0″ × 12′-3″ | 4.877 m (16′-0″) | 3.734 m (12′-3″) | +0.0 mm | +0.0 mm | 18.21 m² / 196.0 sft | ✅ match |
| Pooja | 6′ × 4′ | 6′-0″ × 4′-0″ | 1.829 m (6′-0″) | 1.219 m (4′-0″) | +0.0 mm | +0.0 mm | 2.23 m² / 24.0 sft | ✅ match |
| Great Room | 18′-1½″ × 17′ | 18′-1½″ × 17′-0″ | 5.525 m (18′-1½″) | 5.182 m (17′-0″) | +0.0 mm | +0.0 mm | 28.63 m² / 308.1 sft | ✅ match |
| Bedroom 2 | 14′ × 12′-1½″ | 14′-0″ × 12′-1½″ | 4.267 m (14′-0″) | 3.696 m (12′-1½″) | +0.0 mm | +0.0 mm | 15.77 m² / 169.8 sft | ✅ match |
| Lobby | — | — | 1.410 m (4′-7½″) | 1.372 m (4′-6″) | — | — | 1.93 m² / 20.8 sft | ➖ not labelled |
| Toilet 2 | 9′ × 4′-6″ | 9′-0″ × 4′-6″ | 2.743 m (9′-0″) | 1.372 m (4′-6″) | +0.0 mm | +0.0 mm | 3.76 m² / 40.5 sft | ✅ match |
| Living | 10′-10½″ × 11′-6″ | 10′-10½″ × 11′-6″ | 3.315 m (10′-10½″) | 3.505 m (11′-6″) | +0.0 mm | +0.0 mm | 11.62 m² / 125.1 sft | ✅ match |
| Bedroom 3 | 15′-10½″ × 11′-6″ | 15′-10½″ × 11′-6″ | 4.839 m (15′-10½″) | 3.505 m (11′-6″) | +0.0 mm | +0.0 mm | 16.96 m² / 182.6 sft | ✅ match |
| Toilet 3 | 5′ × 11′-6″ | 5′-0″ × 11′-6″ | 1.524 m (5′-0″) | 3.505 m (11′-6″) | +0.0 mm | +0.0 mm | 5.34 m² / 57.5 sft | ✅ match |

### Overall dimensions & walls

| Item | Drawing | Model | Δ | Status |
| --- | --- | --- | --- | --- |
| Building outer width | 34′-0″ (10.363 m) | 10.363 m (34′-0″) | −0.0 mm | ✅ match |
| Building outer depth | 43′-0″ (13.106 m) | 13.106 m (43′-0″) | −0.0 mm | ✅ match |
| Outer wall thickness | 9″ (0.229 m) | 0.229 m (9″) | +0.0 mm | ✅ match |
| Inner wall thickness | 4½″ (0.114 m) | 0.114 m (4½″) | +0.0 mm | ✅ match |
| Side balcony width | 5′-0″ | 1.524 m (5′-0″) | +0.0 mm | ✅ match |
| Front balcony width | 7′-0″ | 2.134 m (7′-0″) | +0.0 mm | ✅ match |
| Plot width | 56′-1″ | 17.094 m (56′-1″) | +0.0 mm | ✅ match |
| Plot depth | 59′-1″ | 18.009 m (59′-1″) | +0.0 mm | ✅ match |
| Every wall mesh at 9″ or 4½″ only | — | yes | — | ✅ |

### Doors, windows and openings: clear width measured in the model

| Opening | Between | Drawing (scaled) | Model | Measured | Centre shift | Sill → head | OK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Window | outside ↔ Cooking | 3′-5¾″ | 3′-11¼″ (1.200 m) | 1.200 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Ventilator | outside ↔ Toilet 1 | 1′-11⅜″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 1.650 → 2.100 m | ✅ |
| Window | outside ↔ Master Bedroom | 4′-5⅝″ | 4′-11″ (1.500 m) | 1.500 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Cooking | 3′-0″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Great Room | 2′-11⅝″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Double door (+) | Side Balcony ↔ Great Room | 2′-10¾″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Window | Side Balcony ↔ Living | 4′-6⅞″ | 4′-11″ (1.500 m) | 1.500 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Master Bedroom ↔ outside | 2′-11⅝″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Bedroom 2 ↔ outside | 2′-10¾″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Ventilator | Toilet 2 ↔ outside | 2′-0⅝″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 1.650 → 2.100 m | ✅ |
| Ventilator | Toilet 3 ↔ outside | 2′-0⅝″ | 1′-11⅝″ (0.600 m) | 0.600 m | +0.0 mm | 1.650 → 2.100 m | ✅ |
| Window | Living ↔ Front Balcony | 2′-1″ | 1′-11⅝″ (0.600 m) | 0.600 m | −40.7 mm | 0.900 → 2.100 m | ✅ |
| Double door (-) | Living ↔ Front Balcony | 3′-11″ | 3′-11¼″ (1.200 m) | 1.200 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Window | Living ↔ Front Balcony | 2′-6¼″ | 1′-11⅝″ (0.600 m) | 0.600 m | +150.0 mm | 0.900 → 2.100 m | ✅ |
| Window | Bedroom 3 ↔ Front Balcony | 4′-6″ | 4′-11″ (1.500 m) | 1.500 m | +0.0 mm | 0.900 → 2.100 m | ✅ |
| Open arch | Cooking ↔ Great Room | 2′-4⅝″ | 2′-5″ (0.737 m) | 0.737 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Passage ↔ Great Room | 3′-2⅞″ | 3′-3″ (0.991 m) | 0.991 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Door (b+) | Passage ↔ Master Bedroom | 2′-8¾″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Toilet door (a-) | Toilet 1 ↔ Passage | 2′-4⅝″ | 2′-5½″ (0.750 m) | 0.750 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Double door (-) | Pooja ↔ Great Room | 3′-2⅞″ | 3′-3⅜″ (1.000 m) | 1.000 m | −3.4 mm | 0.000 → 2.100 m | ✅ |
| Door (b+) | Great Room ↔ Lobby | 2′-10¾″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Bedroom 2 ↔ Lobby | 3′-7″ | 3′-7″ (1.092 m) | 1.092 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Toilet door (a+) | Bedroom 2 ↔ Toilet 2 | 2′-4⅝″ | 2′-5½″ (0.750 m) | 0.750 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Open arch | Great Room ↔ Living | 4′-11⅜″ | 4′-11″ (1.499 m) | 1.499 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Door (a+) | Great Room ↔ Bedroom 3 | 2′-8¾″ | 2′-11⅜″ (0.900 m) | 0.900 m | +0.0 mm | 0.000 → 2.100 m | ✅ |
| Toilet door (b+) | Bedroom 3 ↔ Toilet 3 | 2′-4⅝″ | 2′-5½″ (0.750 m) | 0.750 m | +0.0 mm | 0.000 → 2.100 m | ✅ |

### Furniture: real sizes and front clearance (to nearest wall/furniture)

| Room | Item | Front clearance | Limited by | Needed | OK |
| --- | --- | --- | --- | --- | --- |
| Cooking | Crockery unit 3193×380 mm | 2.335 m (7′-7⅞″) | Kitchen counter 2958×600×850 mm | 0.60 m | ✅ |
| Master Bedroom | Wardrobe 2569×600 mm | 0.600 m (1′-11⅝″) | King bed 1830×1980 mm + side tables | 0.60 m | ✅ |
| Bedroom 2 | Wardrobe 2569×600 mm | 0.600 m (1′-11⅝″) | Queen bed 1520×1980 mm + side tables | 0.60 m | ✅ |
| Bedroom 3 | Wardrobe 1269×600 mm | 0.600 m (1′-11⅝″) | Queen bed 1520×1980 mm + side tables | 0.60 m | ✅ |
| Bedroom 3 | Wardrobe 1290×600 mm | 4.239 m (13′-10⅞″) | wall | 0.60 m | ✅ |
| Cooking | Kitchen counter 3305×600×850 mm | 3.134 m (10′-3⅜″) | wall | 0.90 m | ✅ |
| Cooking | Kitchen counter 2958×600×850 mm | 2.335 m (7′-7⅞″) | Crockery unit 3193×380 mm | 0.90 m | ✅ |
| Cooking | Hob 750 mm + chimney 900 mm | — | — | — | ✅ |
| Cooking | Sink 800×500 mm | — | — | — | ✅ |
| Toilet 1 | EWC 380×700 mm | 4.886 m (16′-0⅜″) | Sofa 2424×880 mm | 0.50 m | ✅ |
| Toilet 1 | Vanity 600×450 mm + mirror | 1.036 m (3′-4¾″) | wall | 0.50 m | ✅ |
| Master Bedroom | King bed 1830×1980 mm + side tables | 1.574 m (5′-2″) | wall | 0.60 m | ✅ |
| Bedroom 2 | Queen bed 1520×1980 mm + side tables | 1.536 m (5′-0½″) | wall | 0.60 m | ✅ |
| Toilet 2 | EWC 380×700 mm | 0.672 m (2′-2⅜″) | wall | 0.50 m | ✅ |
| Toilet 2 | Vanity 600×450 mm + mirror | 2.572 m (8′-5¼″) | Queen bed 1520×1980 mm + side tables | 0.50 m | ✅ |
| Toilet 2 | Shower glass 818 mm (10 mm toughened, 2.0 m high) | — | — | — | ✅ |
| Bedroom 3 | Queen bed 1520×1980 mm + side tables | 1.345 m (4′-5″) | wall | 0.60 m | ✅ |
| Toilet 3 | EWC 380×700 mm | 1.895 m (6′-2⅝″) | door leaf / glass | 0.50 m | ✅ |
| Toilet 3 | Vanity 600×450 mm + mirror | 2.388 m (7′-10″) | Queen bed 1520×1980 mm + side tables | 0.50 m | ✅ |
| Toilet 3 | Shower glass 914 mm (10 mm toughened, 2.0 m high) | — | — | — | ✅ |
| Pooja | Mandir 1019×450 mm (idols: Ganesha, Venkateswara, Lakshmi, Shiva lingam) | 0.939 m (3′-1″) | door leaf / glass | 0.75 m | ✅ |
| Great Room | Diwan 1840×800 mm | 0.450 m (1′-5¾″) | TV feature wall 1385 mm (clear wall 1485 mm): 55″ TV 1218×685 mm, floating console 1335×350×280 mm at 300 mm | 0.40 m | ✅ |
| Great Room | Sofa 2424×880 mm | 0.404 m (1′-3⅞″) | Coffee table 550×1100 mm | 0.40 m | ✅ |
| Great Room | Coffee table 550×1100 mm | — | — | — | ✅ |
| Living | Sofa 1196×880 mm | 0.429 m (1′-4⅞″) | Coffee table 500×1000 mm | 0.40 m | ✅ |
| Living | Sofa 1227×880 mm | 0.429 m (1′-4⅞″) | Coffee table 500×1000 mm | 0.40 m | ✅ |
| Living | Coffee table 500×1000 mm | — | — | — | ✅ |
| Great Room | TV feature wall 1385 mm (clear wall 1485 mm): 55″ TV 1218×685 mm, floating console 1335×350×280 mm at 300 mm | 2.863 m (9′-4¾″) | Coffee table 550×1100 mm | 0.60 m | ✅ |

### Door swings (leaf opened 90°): free of furniture

| Door | Type | Leaf | Conflicts | OK |
| --- | --- | --- | --- | --- |
| Side Balcony ↔ Great Room | dd | 0.780 m | none | ✅ |
| Living ↔ Front Balcony | dd | 1.080 m | none | ✅ |
| Passage ↔ Master Bedroom | d | 0.780 m | none | ✅ |
| Toilet 1 ↔ Passage | dt | 0.630 m | none | ✅ |
| Pooja ↔ Great Room | dd | 0.440 m | none | ✅ |
| Pooja ↔ Great Room | dd | 0.440 m | none | ✅ |
| Great Room ↔ Lobby | d | 0.780 m | none | ✅ |
| Bedroom 2 ↔ Toilet 2 | dt | 0.630 m | none | ✅ |
| Great Room ↔ Bedroom 3 | d | 0.780 m | none | ✅ |
| Bedroom 3 ↔ Toilet 3 | dt | 0.630 m | none | ✅ |

### Walking routes from the front balcony (A* through doorways, 0.22 m body clearance)

| Room | Reachable | Route length |
| --- | --- | --- |
| Cooking | ✅ | 11.022 m |
| Toilet 1 | ✅ | 13.033 m |
| Passage | ✅ | 11.891 m |
| Master Bedroom | ✅ | 15.113 m |
| Pooja | ✅ | 10.096 m |
| Great Room | ✅ | 8.784 m |
| Bedroom 2 | ✅ | 10.781 m |
| Lobby | ✅ | 9.840 m |
| Toilet 2 | ✅ | 13.455 m |
| Living | ✅ | 4.901 m |
| Bedroom 3 | ✅ | 8.127 m |
| Toilet 3 | ✅ | 15.334 m |
| Side Balcony | ✅ | 7.091 m |
| Front Balcony | ✅ | 0.000 m |

### Heights used (not dimensioned on the drawings)

| Item | Value | Source |
| --- | --- | --- |
| Floor to ceiling | 3.048 m (10′-0″) | 10′-0″ — not on drawing; standard 10′-0″ |
| Door / arch / window head (lintel) | 2.100 m (6′-10⅝″) | 6′-10⅝″ — not on drawing; standard 2100 mm |
| Window sill | 0.900 m (2′-11⅜″) | 2′-11⅜″ — not on drawing; standard 900 mm (1200 mm high windows) |
| Ventilator sill | 1.650 m (5′-5″) | 5′-5″ — 600 × 450 mm ventilator under the lintel |
| RCC slab | 0.127 m (5″) | 5″ — assumed |
| Plinth above ground | 0.457 m (1′-6″) | 1′-6″ — assumed |
| Stair riser / tread | 0.176 m (7″) | 176 mm × 250 mm, 18 risers, flights 1.061 m wide — flights drawn, risers assumed |
| Eye height (walk mode) | 1.600 m (5′-3″) | 1.600 m |

### Assumptions

- Door and window POSITIONS are not dimensioned on the drawings; their centres are scaled from the drawing (fitted to the dimensioned outer faces, so expect ±1–2″).
- Door and window widths are typical Indian sizes: room doors 900 mm, toilet doors 750 mm, main / double doors the nearest of 900, 1000, 1050, 1200, 1500 mm to the drawing, all 2100 mm high. Windows are the nearest of 600, 900, 1200, 1500, 1800, 2100 mm to the scaled drawing width, 1200 mm high on a 900 mm sill. Ventilators are 600 × 450 mm.
- Furniture positions follow the drawing symbols, but every piece uses a standard real size (e.g. queen bed 1.52 × 1.98 m, sofa depth 0.88 m, counters 0.6 × 0.85 m, wardrobes 0.6 m deep). The drawing symbols are not drawn to furniture scale.
- There are no columns or beams on the drawings, so none are modelled. Beams sit inside the 9″ / 4½″ walls above the 2100 mm lintel line, and the balconies are a cantilevered slab.
- Plan-1 and Plan-2 show no compound gates, so the gates are assumed in front of the main door and the side door.

### Deviations from the drawing

- Pooja window omitted (owner instruction: "no window required in the pooja room").
- Plan-2: window next to a dd on wall #4 moved 1.6″ along the wall to keep a 3″ pier (standard width kept).
- Plan-2: window next to a dd on wall #4 reduced to 600 mm (next standard size) to keep a 3″ pier.
- Master Bedroom: bed moved 108 mm west of its drawn position to keep 600 mm clear in front of the wardrobe / walls (standard-size bed).
- Bedroom 2: bed moved 129 mm west of its drawn position to keep 600 mm clear in front of the wardrobe / walls (standard-size bed).
- Bedroom 3: bed moved 177 mm west of its drawn position to keep 600 mm clear in front of the wardrobe / walls (standard-size bed).
