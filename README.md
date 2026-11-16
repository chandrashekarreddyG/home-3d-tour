# Padma Reddy Residence — 3D walkthrough

Interactive 3D virtual tour of three house designs (Ground Floor Plan, Plan-1, Plan-2) on the
G. Padma Reddy site at Yellareddypet (V), Rajanna Siricilla Dist., built from the architect's
floor-plan PDFs and the YMR survey map (MAP2).

**Live:** https://chandrashekarreddyg.github.io/home-3d-tour/

## Use

- **Whole site**: survey parcels, strips, G.P Road, 12 ft and 21 ft roads, with the house on its plot.
- **Dollhouse**: roofless view. Click any room (or its label) to glide inside.
- **Walk in / Guided tour**: first-person view. Click the floor to glide there; the route goes through doorways.
  Drag to look, `W A S D` / arrows to walk, `Shift` to go faster, `Esc` to return to the overview.
- **Minimap**: click to glide to a spot.
- **Original drawings**: the source plans and site map.

## Notes

- Dimensions come from the drawings: walls are 9″ outer and 4.5″ inner, ceilings 10′, the plinth 1′-6″.
- The survey sketch isn't drawn to scale. Parcel shapes were rebuilt from the written dimensions.
- The Ground Floor Plan was drawn for a 57′ × 65′ plot, which is bigger than the 56′-1″ × 59′-1″ site. With its front
  set on G.P Road, the rear wall crosses the plot line.

## Develop

Static site with no build step. Three.js is loaded from a CDN.

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

- `js/plans.js`: traced plan data (walls, openings, rooms, furniture)
- `js/site.js`: survey parcels and roads
- `js/build.js`: scene construction
- `js/nav.js`: walkability grid + A* routing
- `js/main.js`: camera modes, interaction, UI
