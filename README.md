# Padma Reddy Residence: to-scale 3D walkthrough

Interactive 3D tour of the house design (Plan-2) on the G. Padma Reddy site
at Yellareddypet (V), Rajanna Siricilla Dist. The site is at 18°22′23.68″N, 78°38′48.17″E.

Plan-2 comes from `PADMA REDDY GANNA.pdf` (plinth 1849 sft, slab 2400 sft): a 43′ × 43′ shell with a 5′ side
balcony, a 7′ front balcony and the stair, Kitchen, Dining, Master Bedroom + toilet across the back, a 17′ × 25′-1½″ Hall,
Bedroom 2 + toilet, and Drawing Room, Pooja, Bedroom 3 + toilet along G.P Road. Its drawing has the East road at the
top; the model turns it to sit on the survey with the side balcony on the 21 ft road. The drawn water sump and three
bores stand on the 23 SqYds strip (paved; no strip garden).

Owner requests built in:
- **Compound wall on the road edge:** the west compound wall and its gate run on the 21 ft road edge (as drawn), so
  the 23 SqYds strip with the sump and bores is inside the compound.
- **Open kitchen:** the wall between the kitchen and the dining area is removed (the hall wall stays), and the kitchen
  run on that old wall becomes a peninsula counter.

**Live:** https://chandrashekarreddyg.github.io/home-3d-tour/

**Lightweight page:** https://chandrashekarreddyg.github.io/home-3d-tour/dollhouse.html is one self-contained HTML
file (about 120 KB, 40 KB gzipped) that loads only Three.js from the CDN: no textures, models, audio or modules. It
opens on the same view as the landing page, the house on its surveyed site with the Floating frame · glass parapet
elevation, compound wall and gates, both roads and the neighbouring parcels, all drawn in code. It has:
- Whole site, Dollhouse, Bird's-eye and Walk in, plus the Front, Side and Corner views, a Roof switch, room tags and a
  room list (click to step inside), a minimap, a compass and a dimensions overlay.
- Walking with collision, click-the-floor to glide, drag to look, and the staircase up to the terrace.
- A sun placed for the site from today's date and a time slider (Day and Evening presets; lamps come on after dark).
- A 30-second tour and three interior styles (Scandinavian, Modern Luxury, Family Friendly).

Its units are feet and it follows the drawing as drawn, so it keeps the Kitchen–Dining wall and the Pooja window and
has the mandir on the Drawing Room side wall; the owner requests above are in the main walkthrough only.

## Accuracy

- **1 world unit = 1 metre.** Feet and inches are converted exactly (1″ = 25.4 mm).
- Walls are placed from the drawings' **written dimension chains**, not traced pixels. Outer walls are 9″ and inner
  walls 4½″, and room sizes are clear wall-face to wall-face.
  - Example, across the back: 9 + 132 + 4½ + 102 + 4½ + 58½ + 4½ + 192 + 9 = 516″ = 43′-0″.
- The **measurement report** (button in the app, and [VALIDATION.md](VALIDATION.md)) ray-casts the built model's wall
  meshes and compares every room with its drawing label to within 1 mm. It also checks door and window widths,
  furniture clearances, door swings and walking routes.
- One drawing label contradicts its own dimension chain; it is modelled from the chain and flagged in the report:
  - **Toilet 1** is labelled 8′-0″ × 4′-10″ but the chain across needs 4′-10½″.
- Anything the drawings don't dimension is listed as an assumption:
  - heights: 9′ ceiling (as `dollhouse.html`), 7′ lintels, 3′ sills
  - door and window positions, scaled from the drawing
  - standard door widths
  - standard furniture sizes
  - the stair risers

## Features

- The landing page opens on Plan-2 with the plinth under the whole slab and the Floating frame · glass parapet
  elevation, seen from 5 m up over G.P Road beyond the 21 ft road corner, looking along the road at the front. The
  narrated video tour starts only from the **▶ Video tour** button (accent pill, top row; bottom centre on phones),
  which also stops it.
- A female Telugu voice-over names each room as the guided tour arrives. The clips are in `audio/te/`, made with
  Microsoft's te-IN Shruti neural voice, a natural Indian Telugu accent
  (`edge-tts --voice te-IN-ShrutiNeural --rate=-8% --text "ఇది పూజ గది" --write-media pooja.mp3`). Browsers hold
  back sound until the visitor taps, so a "Tap for voice & music" chip appears when needed.
- Calm background music plays during the guided tour. It is generated live with Web Audio in `js/music.js`
  (soft chord pad, pentatonic bells, reverb), so there are no files and no licence. It sits about 16 dB under
  the voice and drops about 10 dB more while a room name is spoken.
- A **📷 Realistic view** button (top right) gives a photographic render of the same model: AgX filmic grade, soft
  bloom on lamps, a lens vignette, ambient occlusion and a sharper render. It hides the labels, panel, minimap,
  compass, walk markers and dimension overlay, while walking, clicking and the tour keep working. Esc or the
  button exits.
  - In the realistic view, **✨ Photo render** (top left) path-traces the current view (`js/photo.js`,
    three-gpu-pathtracer): light bounces between walls, ceilings and furniture, with soft shadows and colour bleeding,
    like a V-Ray interior render. The visible meshes near the camera are baked to world space and merged into one
    mesh per material; the sun, a softened sky, soft spot lights at the nearest downlights, points at pendants and
    chandeliers and a ceiling-sized fill light per nearby room light it. About 4–5 minutes for 320 samples at
    1600 × 1067, then an edge-preserving denoise. Any click, key or scroll returns to the live view;
    `window.photoRender({ samples })` starts one from the console.
- Bird's-eye, dollhouse and whole-site views, plus a first-person walk at 1.6 m eye height.
  - Click the floor to glide; routes go through doorways.
  - W A S D to walk, with collision against walls and furniture.
  - Up the staircase to the **terrace** (+3.18 m): walk up with W, click a tread or the terrace floor, or use
    **Terrace** in the room list. Walking follows the treads and the landing; on the terrace you stay inside the
    parapet and clear of the open stair well. The guided tour ends on the terrace.
  - Dimensions overlay.
  - True-size cues: the walk view holds a 70° horizontal field of view at any window shape; a light aerial haze softens
    the far fields; and the **🚗 Car** button (top right, off by default) parks a pearl-white five-door SUV, 4795 mm long and
    1.84 m tall (Fortuner class; model: Innerscene "Sage five-door crossover SUV", CC0, `models/suv.glb`), on the
    21 ft road beside the house, clear of the side gate, in the outside views. The slab measures 50′-0″ × 52′-0″ in
    the model, including the 2′-0″ cantilever.
  - **⤢ Spacious view** (top right, off by default) shows the walk the way interiors are photographed for sale: a
    95° horizontal lens with the camera at 1.35 m, so each room shows more of itself and reads as open as it
    feels in person. Dimensions are unchanged; switch it off for the true 1.6 m / 70° eye view.
- Realistic real-size furnishing:
  - beds, wardrobes, sofas, a modular kitchen with hob and chimney
  - toilets with EWC, vanity, real mirrors and shower glass
  - fans, downlights, curtains, and hinged doors that swing as drawn
  - TV feature walls: centred in the clear wall between the drawn openings and 400 mm clear of furniture next to it,
    with a warm-beige panel, an oak fluted band, a floating walnut console and concealed warm LED. The TV is the
    largest 16:9 size that fits (55″ / 50″ / 43″). Windows on a TV wall get Roman blinds inside the reveal, so no
    curtain overlaps the panel.
  - doors and windows use typical Indian sizes at the drawn positions:
    - room doors 900 × 2100 mm, toilet doors 750 × 2100 mm, main / double doors 900–1500 mm (nearest to the drawing)
    - windows 600 / 900 / 1200 / 1500 / 1800 / 2100 mm wide × 1200 mm high on a 900 mm sill
    - ventilators 600 × 450 mm under the 2100 mm lintel
    - a window that would crowd a door slides up to 4″ along the wall, or drops to the next standard width
  - main entrances (G.P Road and 21 ft road): one wide designer teak door in the drawn opening, with horizontal
    V-grooves, a full-height brass inlay, a 1.2 m brass pull bar and a smart lock. It hinges on the end with the
    shorter pier, so the latch side keeps the wider pier for the entrance switchboard.
- **Electrical layout** (`js/electrical.js`, full schedule in [ELECTRICAL.md](ELECTRICAL.md)). Every switchboard and
  power point is placed by rule from the model's doors, windows and furniture, then re-checked against them. Rules:
  - room boards at 1.10 m on the latch side, 175 mm from the door
  - bathroom switches outside the door
  - bedside boards at 0.80 m on both sides of each bed
  - TV wall and console boards
  - kitchen counter boards at 1.05 m, clear of the sink and hob
  - fridge, chimney, geyser, exhaust and split AC points
  - main DB, video door phone, outdoor sockets and the stair 2-way switch

  Toggle **Electrical** in the View panel to see every board numbered with its height in 3D, or open
  **Electrical schedule** for the table: where, height, plate, contents, why here, and the check result.
- PBR materials (CC0 scans from Poly Haven), an HDRI sky, soft sun shadows and ambient occlusion.
- The sun is placed from the real location using the date and time slider (IST).
  North comes from the survey map.
- Pooja room has no window, and the mandir faces the entrance.
- Garden on the 23 SqYds strip along the 21 ft road, kept clear of the side gate.
- A 2′-0″ cantilevered roof slab (sunshade) runs along the two back sides, the rear and the east side, at slab level.
- **Elevation ideas** for both road-facing sides, with a toggle to compare against the plain drawing:
  - Modern, subtle colours: Floating frame, Floating frame · glass parapet (the same design with frameless glass
    replacing the parapet on both road-facing sides), Oak slats, Stone & glass, Pergola & planters
  - Inspired by the owner's reference photos: Stone band & wood soffit, Brick & wood box, Feature frame & grooves,
    Wood, brick & fluted box, Taupe band & ledgestone (with its own designer boundary wall and slotted gates),
    Stone, wood & jaali
    (cut-stone and brick cladding cut around the real openings, up/down wall washers, lit planters, granite entrance
    steps, paving slabs with grass joints). Every design screens the open staircase on its road face and west side
    (stone, slats, louvres or fluting to match), keeping the stair foot and roof exit open. On the 21 ft road side,
    every design also gets a matching tall screened tower closing the rear end of the side verandah (with an LED edge
    and a cap), plus soffit downlights at the side door and granite steps towards the side gate. The "Front view",
    "Side view" and "Corner view" buttons frame the road-facing sides.
  - Exterior studio, researched from current Indian practice: Terracotta jaali veil, Jaisalmer sandstone & white,
    Tropical louvres & green, Kota grey & charcoal fluted, Exposed brick & concrete, Bronze metal jaali. They add
    brick jaali and laser-cut lattice screens, procedural 600 × 300 mm Jaisalmer / Kota stone, slab-edge fascias, a
    louvred valance and a planter band. The **[Exterior studio page](exterior.html)** (`exterior.html`, renders in
    `exterior/img/`) presents them with renders, materials, indicative costs, upkeep and sources. Each card links
    to the 3D model with that design via `?design=<id>`.
  - Car porch designs for the level parking option: Teak car porch & stone wall, Kota porch & grass-paver drive, and
    Green screen & pergola drive. Each dresses the car bay under the front verandah (slat or LED-lined ceiling, a feature
    wall behind the car with wall washers or a cable-trellis green screen) and paves the drive from the 6 m car gate
    (flamed granite, grass pavers in the open yard only, or clay pavers under a steel pergola).
  - **Plinth (basement)** switch in the Elevation panel. **Whole slab area** (default) puts the plinth under the house
    and both verandahs, with the verandahs level with the rooms. **House only** puts the 1′-6″ plinth under the rooms
    only, with the verandahs on a 150 mm apron. **Level for car parking** also puts the plinth under the rooms only and
    leaves both verandahs flush with the paved yard: a full-size SUV parks under the front verandah on the longest
    stretch clear of the front doors, and a 6.0 m gate on G.P Road is added in front of it; planters keep clear of the
    drive. Whenever the verandahs are lower than the rooms, granite steps lead up at each road-side door and a podium
    sits under the stair foot. The elevation steps, piers, plinth cladding and verandah switchboards follow the verandah
    level, and `?plinth=house` / `?plinth=level` open those options. The Exterior studio page compares all three.
  - In every design the stair tower rises 1.4 m above the parapet and carries a 3D Om medallion (`js/emblems.js`):
    the Om sits at the centre of a spiral of tapering arcs, either black on cream or gold on dark to suit the design,
    with a soft halo that glows after dark. The Om outline comes from Noto Sans Devanagari (OFL) and is stored in
    `js/omglyph.js`.
  - The 21 ft road side tower rises to the same height and carries a flat painted Shanku · Namam · Chakra panel
    (the owner's line artwork, `textures/emblems/shanku-namam-chakra.png`) in a slim gold frame. It sits above the
    slab bands and has the same soft halo after dark.
- **Interior design** switch in the Finishes panel (`?interior=luxe` / `?interior=dollhouse`). **Modern luxury · as
  dollhouse** reproduces the Modern Luxury style of `dollhouse.html` on this plan (`kit(M, 'dollhouse')`): warm-stone
  walls, white marble with grey and gold veins in the living areas, dark walnut in the bedrooms and black marble in
  the toilets, deep-green velvet channel-back sofas on flat gold bases, marble tables on gold frames, taupe beds with
  1.4 m channel headboards, dark walnut wardrobes with long gold pulls, dark-green kitchen cabinets under white marble,
  dark doors and frames with gold handles, taupe curtains on gold rods and warm 2700 K light. Its props are placed by
  rule in `js/interior.js` (`style: 'dollhouse'`): a bordered rug under each coffee table, a gold globe floor lamp at a
  sofa end, a fiddle-leaf fig or snake plant in a free corner of every main room, gold-framed abstract prints on the
  longest free wall, a bookshelf / entry console where a wall run allows, and a gold pendant over the dining table
  (which replaces that room's fan). **Warm luxe** follows the owner's sample
  designs and is placed by rule from the plan's rooms, walls, openings and furniture (`js/interior.js`), so no wall,
  door or window moves: a backlit-onyx TV wall, a quilted panel wall behind the TV-facing sofa, framed art with brass
  sconces over the other sofas, branch-crystal chandeliers over the coffee tables, a brass medallion screen beside a
  main double door that opens into a sitting room, an arched display unit in a sitting room without a TV, backlit
  palm-mural arches and a ring chandelier in the dining, a hanging herb shelf and slatted back on the kitchen
  peninsula, and a feature wall with globe pendants behind every bed (grey channels, oak grid, white flutes in turn).
  The furniture restyles with it (`kit(M, 'luxe')`): boucle sofas, a pebble coffee table, a marble dining top with grey
  chairs, channel-stitched beds, carved-shutter wardrobes and greige gloss kitchen shutters. A chandelier replaces a
  ceiling fan only where they would clash (noted in the measurement report). Artwork in `textures/interior/` is drawn
  by `textures/interior/make-art.py`.
- **Flooring designs**, switchable live. The default is white marble-look 600×1200 (matt, soft grey veins, like Kajaria
  Statuario White 60×120 cm). The others are beige marble + oak, vitrified 600×600, glossy white 800×800, Indian marble,
  black granite, terrazzo, red oxide tiles and oak throughout.
- **Wall paint**, inside and outside, switchable live in subtle, rich matt shades. Inside: warm ivory (default), pearl
  white, soft greige, desert sand, sage mist, blush clay and morning mist. Outside: the elevation idea's own colour
  (default), classic white, sandstone, greige, terracotta blush, olive stone and dove grey.
- **Lighting designs**: recessed downlights, LED profile lines, cove false ceiling (600 mm × 250 mm drop) and pendants &
  wall washers. Each comes in warm 2700K, neutral 4000K or cool 6500K. **Lights off** switches off every light inside
  the house (fixtures go dark, halos and room lights off); verandah, elevation and garden lights stay on.

## Develop

Static site with no build step. Three.js r170 is loaded from a CDN.

```sh
python3 -m http.server 8000   # open http://localhost:8000
```

| File | Purpose |
| --- | --- |
| `js/plans.js` | dimension-chain geometry, openings, rooms, furniture anchors |
| `js/build.js` | scene construction in metres |
| `js/verify.js` | measurement validation (ray-cast against the built model) |
| `js/furniture.js` | real-size furniture and fixtures |
| `js/elevation.js` | elevation ideas (modern + reference-inspired) |
| `js/site.js` | survey parcels, roads and the site location |
| `js/nav.js` | walkability grid and A* routing |
| `js/sun.js` | solar position |
| `js/main.js` | camera modes, interaction, UI |
| `js/lighting.js` | lighting designs (downlights, profiles, cove, pendants) |
| `dollhouse.html` | lightweight single-file version (units in feet, everything inline) |

To regenerate `VALIDATION.md`, run `measurementReport()` in the browser console.
