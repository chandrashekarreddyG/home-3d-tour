# Padma Reddy Residence: to-scale 3D walkthrough

Interactive 3D tour of two house designs (Plan-1 and Plan-3) on the G. Padma Reddy site
at Yellareddypet (V), Rajanna Siricilla Dist. The site is at 18°22′23.68″N, 78°38′48.17″E.

Plan-3 comes from `PADMA REDDY GANNA.pdf` (plinth 1849 sft, slab 2400 sft). It has the same 43′ × 43′ shell,
balconies and stair as Plan-1, with Kitchen, Dining, Master Bedroom + toilet across the back, a 17′ × 25′-1½″ Hall,
Bedroom 2 + toilet, and Drawing Room, Pooja, Bedroom 3 + toilet along G.P Road. Its drawing has the East road at the
top; the model turns it to sit on the survey like Plan-1. As drawn, its west compound wall runs on the 21 ft road edge,
so the 23 SqYds strip with the water sump and three bores is inside the compound (paved; no strip garden). Plan-3 has an **open kitchen** (owner request): the wall between
Kitchen and Dining is removed (the Hall wall stays), and the run on that old wall becomes a peninsula counter.

**Live:** https://chandrashekarreddyg.github.io/home-3d-tour/

## Accuracy

- **1 world unit = 1 metre.** Feet and inches are converted exactly (1″ = 25.4 mm).
- Walls are placed from the drawings' **written dimension chains**, not traced pixels. Outer walls are 9″ and inner
  walls 4½″, and room sizes are clear wall-face to wall-face.
  - Example, Plan-1 top row: 9 + 114 + 4½ + 120 + 4½ + 58½ + 4½ + 192 + 9 = 516″ = 43′-0″.
- The **measurement report** (button in the app, and [VALIDATION.md](VALIDATION.md)) ray-casts the built model's wall
  meshes and compares every room with its drawing label to within 1 mm. It also checks door and window widths,
  furniture clearances, door swings and walking routes.
- Two drawing labels contradict their own dimension chains. Both are modelled from the chain and flagged in the report:
  - **Plan-1 Great Room** is labelled 23′-4½″ but the chain gives 25′-1½″.
  - **Plan-3 Toilet 1** is labelled 8′-0″ × 4′-10″ but the chain across needs 4′-10½″.
- Anything the drawings don't dimension is listed as an assumption:
  - heights: 10′ ceiling, 7′ lintels, 3′ sills
  - door and window positions, scaled from the drawing
  - standard door widths
  - standard furniture sizes
  - the stair risers

## Features

- The landing page opens on the street corner with the roof and the Floating frame · glass parapet elevation. After about 4 s the
  guided walk-in tour starts, unless the visitor has already clicked, scrolled or pressed a key.
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
    21 ft road beside the house, clear of the side gate, in the outside views. Plan-1's slab measures
    50′-0″ × 52′-0″ in the model, including the 2′-0″ cantilever.
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
    curtain overlaps the panel. In Plan-1's 17′-0″ Great Room wall the 1387 mm gap takes a 1287 mm panel with a 50″ TV.
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
  - In every design the stair tower rises 1.4 m above the parapet and carries a 3D Om medallion (`js/emblems.js`):
    the Om sits at the centre of a spiral of tapering arcs, either black on cream or gold on dark to suit the design,
    with a soft halo that glows after dark. The Om outline comes from Noto Sans Devanagari (OFL) and is stored in
    `js/omglyph.js`.
  - The 21 ft road side tower rises to the same height and carries a flat painted Shanku · Namam · Chakra panel
    (the owner's line artwork, `textures/emblems/shanku-namam-chakra.png`) in a slim gold frame. It sits above the
    slab bands and has the same soft halo after dark.
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

To regenerate `VALIDATION.md`, run `measurementReport()` in the browser console for each plan.
