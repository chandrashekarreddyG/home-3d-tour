# Padma Reddy Residence: to-scale 3D walkthrough

Interactive 3D tour of the three house designs (Ground Floor Plan, Plan-1 and Plan-2) on the G. Padma Reddy site
at Yellareddypet (V), Rajanna Siricilla Dist. The site is at 18°22′23.68″N, 78°38′48.17″E.

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
  - **GF Dining** is labelled 9′ but the top row sums to 41′-7½″ against the 41′-3″ overall.
- Anything the drawings don't dimension is listed as an assumption:
  - heights: 10′ ceiling, 7′ lintels, 3′ sills
  - door and window positions, scaled from the drawing
  - standard door widths
  - standard furniture sizes
  - the stair risers

## Features

- The landing page opens on the street corner with the roof and the Floating frame elevation. After about 4 s the
  guided walk-in tour starts, unless the visitor has already clicked, scrolled or pressed a key.
- A female Telugu voice-over names each room as the guided tour arrives. The clips are in `audio/te/`, made with
  Microsoft's te-IN Shruti neural voice, a natural Indian Telugu accent
  (`edge-tts --voice te-IN-ShrutiNeural --rate=-8% --text "ఇది పూజ గది" --write-media pooja.mp3`). Browsers hold
  back sound until the visitor taps, so a "Tap for voice & music" chip appears when needed.
- Calm background music plays during the guided tour. It is generated live with Web Audio in `js/music.js`
  (soft chord pad, pentatonic bells, reverb), so there are no files and no licence. It sits about 16 dB under
  the voice and drops about 10 dB more while a room name is spoken.
- Bird's-eye, dollhouse and whole-site views, plus a first-person walk at 1.6 m eye height.
  - Click the floor to glide; routes go through doorways.
  - W A S D to walk, with collision against walls and furniture.
  - Dimensions overlay.
- Realistic real-size furnishing:
  - beds, wardrobes, sofas, a modular kitchen with hob and chimney
  - toilets with EWC, vanity, real mirrors and shower glass
  - fans, downlights, curtains, and hinged doors that swing as drawn
- PBR materials (CC0 scans from Poly Haven), an HDRI sky, soft sun shadows and ambient occlusion.
- The sun is placed from the real location using the date and time slider (IST).
  North comes from the survey map.
- Pooja room has no window, and the mandir faces the entrance.
- Garden on the 23 SqYds strip along the 21 ft road, kept clear of the side gate.
- **Elevation ideas** for both road-facing sides, with a toggle to compare against the plain drawing:
  - Modern, subtle colours: Floating frame, Oak slats, Stone & glass, Pergola & planters
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
- **Flooring designs**, switchable live: beige marble + oak (as built), vitrified 600×600, glossy white 800×800, Indian
  marble, black granite, terrazzo, red oxide tiles and oak throughout.
- **Lighting designs**: recessed downlights, LED profile lines, cove false ceiling (600 mm × 250 mm drop) and pendants &
  wall washers. Each comes in warm 2700K, neutral 4000K or cool 6500K.

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
