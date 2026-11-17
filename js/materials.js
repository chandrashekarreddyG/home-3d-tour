// PBR material library. Textures are CC0 scans from Poly Haven (textures/<id>/{diff,nor,rough}.jpg).
// Geometry UVs are in metres, so each texture repeats once per its real-world size (meta.json).
import * as THREE from 'three';

const SIZE = {
  marble_01: 1.5, laminate_floor_02: 1.7, anti_skid_tiles: 1.8, long_white_tiles: 1.27, painted_plaster_wall: 2,
  plastered_wall_04: 3.2, oak_veneer_01: 1.83, walnut_veneer: 1.8, teak_veneer: 1.0, rough_linen: 0.271,
  granite_tile: 2.3, granite_tile_04: 2.0, sparse_grass: 2.0, large_grey_tiles: 3.0, asphalt_02: 3.0,
  dry_ground_01: 4.0, red_laterite_soil_stones: 2.0, velour_velvet: 0.28, red_sandstone_wall: 2.0,
  terrazzo_tiles: 2.0, terracotta_floor_tiles: 2.08, japanese_stone_wall: 1.9, brick_wall_02: 2.0,
};

export function makeMaterials(renderer) {
  const loader = new THREE.TextureLoader();
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const cache = {};
  const tex = (id, map, srgb) => {
    const key = id + map;
    if (cache[key]) return cache[key];
    const t = loader.load(`textures/${id}/${map}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / SIZE[id], 1 / SIZE[id]);
    t.anisotropy = aniso;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    cache[key] = t;
    return t;
  };
  // full PBR set from one scan; `useDiff:false` keeps only relief/roughness and uses `color`
  const pbr = (id, o = {}) => {
    const { useDiff = true, normalScale = 1, ...rest } = o;
    return new THREE.MeshStandardMaterial({
      map: useDiff ? tex(id, 'diff', true) : null,
      normalMap: tex(id, 'nor'),
      normalScale: new THREE.Vector2(normalScale, normalScale),
      roughnessMap: tex(id, 'rough'),
      roughness: 1,
      ...rest,
    });
  };
  const solid = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
  // Vitrified tiles drawn procedurally: a 2 × 2 tile repeat with 2 mm grout, subtle cloudy veining,
  // and a grout bump/roughness so the joints read at eye level.
  const vitrified = (sizeM, base, vein, gloss) => {
    const N = 1024, px = N / 2, g = 3;
    const mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; };
    const cd = mk(), cr = mk();
    const d = cd.getContext('2d'), r = cr.getContext('2d');
    let seed = Math.round(sizeM * 1000) + base.length;
    const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    d.fillStyle = '#b9b3a8'; d.fillRect(0, 0, N, N);
    r.fillStyle = '#ffffff'; r.fillRect(0, 0, N, N);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const x = i * px + g / 2, y = j * px + g / 2, s = px - g;
      d.fillStyle = base; d.fillRect(x, y, s, s);
      for (let k = 0; k < 40; k++) {
        const cx = x + R() * s, cy = y + R() * s, rad = 20 + R() * 90;
        const grad = d.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grad.addColorStop(0, vein); grad.addColorStop(1, 'rgba(0,0,0,0)');
        d.save(); d.beginPath(); d.rect(x, y, s, s); d.clip(); d.fillStyle = grad; d.fillRect(cx - rad, cy - rad, 2 * rad, 2 * rad); d.restore();
      }
      r.fillStyle = `rgb(${gloss},${gloss},${gloss})`; r.fillRect(x, y, s, s);
    }
    const tx = (c, srgb) => {
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1 / (2 * sizeM), 1 / (2 * sizeM));
      t.anisotropy = aniso;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const rough = tx(cr, false);
    return new THREE.MeshStandardMaterial({ map: tx(cd, true), roughnessMap: rough, roughness: 1, bumpMap: rough, bumpScale: -1.5, envMapIntensity: 1.3 });
  };

  return {
    // floors
    tile: pbr('marble_01', { roughness: 0.55, envMapIntensity: 1.2 }),
    kitchen: pbr('marble_01', { roughness: 0.7 }),
    marble: pbr('marble_01', { color: '#fffaf2', roughness: 0.45, envMapIntensity: 1.3 }),
    vitBeige: vitrified(0.6, '#e9dfcf', 'rgba(205,190,168,0.35)', 60),
    vitWhite: vitrified(0.8, '#f4f2ee', 'rgba(215,212,205,0.35)', 30),
    // white marble-look 600 × 1200 mm matt vitrified (Kajaria "Statuario White" type): near-white body, soft grey
    // diagonal veins with a hazy halo, 2 mm light-grey joints; the 1.2 m repeat holds two differently veined tiles
    whiteStatuario: (() => {
      const N = 1024, g = 3, th = N / 2;
      const mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; };
      const cd = mk(), cr = mk();
      const d = cd.getContext('2d'), r = cr.getContext('2d');
      let seed = 1207;
      const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      d.fillStyle = '#cfd0cf'; d.fillRect(0, 0, N, N);
      r.fillStyle = '#ffffff'; r.fillRect(0, 0, N, N);
      for (let j = 0; j < 2; j++) {
        const x = g / 2, y = j * th + g / 2, w = N - g, h = th - g;
        d.save(); d.beginPath(); d.rect(x, y, w, h); d.clip();
        d.fillStyle = '#f7f7f5'; d.fillRect(x, y, w, h);
        // veins: a few jagged, branching cracks (midpoint displacement) of uneven width, each with a hazy halo
        const crack = (ax, ay, bx, by, rough, depth) => {
          let pts = [[ax, ay], [bx, by]];
          for (let it = 0; it < depth; it++) {
            const nx = [];
            for (let i = 0; i < pts.length - 1; i++) {
              const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], L = Math.hypot(x2 - x1, y2 - y1), o = (R() - 0.5) * L * rough;
              nx.push(pts[i], [(x1 + x2) / 2 - ((y2 - y1) / L) * o, (y1 + y2) / 2 + ((x2 - x1) / L) * o]);
            }
            nx.push(pts[pts.length - 1]);
            pts = nx;
          }
          return pts;
        };
        const stroke = (pts, width, alpha, blur) => {
          d.filter = `blur(${blur}px)`;
          d.lineCap = 'round';
          for (let i = 0; i < pts.length - 1; i++) {
            const f = 0.35 + 0.65 * Math.abs(Math.sin((i / pts.length) * Math.PI * (1.5 + R())));
            d.strokeStyle = `rgba(150,156,164,${(alpha * (0.5 + 0.5 * f)).toFixed(3)})`;
            d.lineWidth = width * f;
            d.beginPath(); d.moveTo(...pts[i]); d.lineTo(...pts[i + 1]); d.stroke();
          }
        };
        for (let k = 0; k < 2 + Math.floor(R() * 2); k++) {
          const y0 = y + h * (0.3 + R() * 0.9), drop = h * (0.6 + R() * 0.7);
          const main = crack(x - 40, y0, x + w + 40, y0 - drop, 0.25, 7);
          d.filter = 'blur(18px)'; d.strokeStyle = 'rgba(170,176,186,0.22)'; d.lineWidth = 40 + R() * 50;
          d.beginPath(); main.forEach((p, i) => (i ? d.lineTo(...p) : d.moveTo(...p))); d.stroke();
          stroke(main, 2.5 + R() * 3, 0.5, 1.6);
          for (let b = 0; b < 3; b++) {
            const [sx, sy] = main[Math.floor(R() * main.length)], ang = -0.5 + (R() - 0.5) * 1.4, len = 80 + R() * 260;
            stroke(crack(sx, sy, sx + Math.cos(ang) * len, sy + Math.sin(ang) * len, 0.3, 5), 1.2 + R() * 1.4, 0.32, 1.1);
          }
        }
        d.filter = 'none';
        d.restore();
        r.fillStyle = 'rgb(125,125,125)'; r.fillRect(x, y, w, h); // matt: roughness ≈ 0.5
      }
      const tx = (c, srgb) => {
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1 / 1.2, 1 / 1.2);
        t.anisotropy = aniso;
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        return t;
      };
      const rough = tx(cr, false);
      return new THREE.MeshStandardMaterial({ map: tx(cd, true), roughnessMap: rough, roughness: 1, bumpMap: rough, bumpScale: -1.5, envMapIntensity: 1.2 });
    })(),
    marblePolished: pbr('marble_01', { roughness: 0.18, envMapIntensity: 1.4 }),
    granitePolished: pbr('granite_tile', { roughness: 0.12, envMapIntensity: 1.5 }),
    terrazzo: pbr('terrazzo_tiles', { color: '#efe9df', roughness: 0.5 }),
    terracotta: pbr('terracotta_floor_tiles', { roughness: 0.8 }),
    greyStone: pbr('japanese_stone_wall', { color: '#d9d6d0', roughness: 1 }),
    brick: pbr('brick_wall_02', { color: '#f2a578', roughness: 1 }),
    // stacked ledgestone: thin horizontal stones in grey-beige, drawn procedurally (600 mm repeat)
    ledge: (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 512;
      const g = c.getContext('2d');
      let seed = 9;
      const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const tones = ['#cfc4b4', '#b4a895', '#ddd5c8', '#9c907e', '#c2b6a3', '#e6dfd3'];
      g.fillStyle = '#5e564c'; g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512;) {
        const h = 10 + Math.floor(R() * 14);
        for (let x = -Math.floor(R() * 100); x < 512;) {
          const w = 40 + Math.floor(R() * 130);
          g.fillStyle = tones[Math.floor(R() * tones.length)];
          g.fillRect(x + 1, y + 1, w - 2, h - 2);
          g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x + 1, y + 1, w - 2, 2);
          x += w;
        }
        y += h;
      }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1 / 0.6, 1 / 0.6);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      const b = new THREE.CanvasTexture(c);
      b.wrapS = b.wrapT = THREE.RepeatWrapping;
      b.repeat.copy(t.repeat);
      return new THREE.MeshStandardMaterial({ map: t, bumpMap: b, bumpScale: 2.5, roughness: 0.95 });
    })(),
    // laser-cut jaali screen: white panel with a repeating petal lattice (alpha-tested holes)
    jaali: (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 256);
      g.fillStyle = '#000';
      for (const [cx, cy] of [[64, 64], [192, 64], [64, 192], [192, 192], [128, 128], [0, 0], [256, 0], [0, 256], [256, 256]]) {
        for (let k = 0; k < 4; k++) {
          g.save(); g.translate(cx, cy); g.rotate((k * Math.PI) / 2 + Math.PI / 4);
          g.beginPath(); g.ellipse(0, -26, 9, 22, 0, 0, Math.PI * 2); g.fill(); g.restore();
        }
      }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return new THREE.MeshStandardMaterial({ color: '#f6f5f2', alphaMap: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 });
    })(),
    // soft additive halo used for wall washers / uplights (opacity follows day / night in main.js)
    glow: (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.45)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshBasicMaterial({ map: t, color: '#ffd9a8', transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    })(),
    // wall-washer beam: bright at the fixture (bottom edge of the texture), spreading and fading upward
    glowFan: (() => {
      const c = document.createElement('canvas');
      c.width = 128; c.height = 256;
      const g = c.getContext('2d');
      const img = g.createImageData(128, 256);
      for (let y = 0; y < 256; y++) for (let x = 0; x < 128; x++) {
        const t = 1 - y / 255; // 0 at the bottom (fixture) → 1 at the top
        const half = 0.08 + 0.42 * Math.pow(t, 0.7); // beam half-width (fraction of the texture)
        const dx = Math.abs(x / 127 - 0.5) / half;
        const a = Math.max(0, 1 - dx * dx) * Math.pow(1 - t, 1.6);
        const i = (y * 128 + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = Math.round(255 * a);
      }
      g.putImageData(img, 0, 0);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshBasicMaterial({ map: t, color: '#ffd9a8', transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    })(),
    laterite: pbr('red_sandstone_wall', { color: '#d9906c', roughness: 1 }),
    wood: pbr('laminate_floor_02', { roughness: 0.9 }),
    bath: pbr('anti_skid_tiles', { roughness: 1 }),
    stone: pbr('granite_tile_04'),
    paving: pbr('large_grey_tiles'),
    // walls
    paint: pbr('painted_plaster_wall', { useDiff: false, color: '#f3ece1', normalScale: 0.35, roughness: 1 }),
    paintExt: pbr('plastered_wall_04', { useDiff: false, color: '#e8d8bd', normalScale: 0.6 }),
    bathTile: pbr('long_white_tiles', { roughness: 0.6, envMapIntensity: 1.2 }),
    cap: solid('#cfc7ba', { roughness: 0.95 }),
    slab: solid('#d9d4cb', { roughness: 0.95 }),
    plinth: pbr('plastered_wall_04', { useDiff: false, color: '#a59a8b', normalScale: 0.6 }),
    // woods & fabrics
    oak: pbr('oak_veneer_01', { roughness: 0.75 }),
    walnut: pbr('walnut_veneer', { roughness: 0.7 }),
    teak: pbr('teak_veneer', { roughness: 0.6 }),
    laminateBeige: pbr('oak_veneer_01', { useDiff: false, color: '#e6dccb', normalScale: 0.2, roughness: 0.7 }),
    linen: pbr('rough_linen', { useDiff: false, color: '#d6cab6', normalScale: 0.8 }),
    linenDark: pbr('rough_linen', { useDiff: false, color: '#a89884', normalScale: 0.8 }),
    sheet: pbr('rough_linen', { useDiff: false, color: '#f4f1ea', normalScale: 0.5 }),
    duvet: pbr('rough_linen', { useDiff: false, color: '#cbbda5', normalScale: 0.6 }),
    velvet: pbr('velour_velvet', { useDiff: false, color: '#8f7c66', normalScale: 0.6 }),
    curtain: pbr('rough_linen', { useDiff: false, color: '#e7dccb', normalScale: 0.6, side: THREE.DoubleSide }),
    rug: pbr('rough_linen', { useDiff: false, color: '#cfc3b0', normalScale: 1.2 }),
    // stone, metal, ceramics, glass
    granite: pbr('granite_tile', { roughness: 0.35, envMapIntensity: 1.2 }),
    porcelain: new THREE.MeshPhysicalMaterial({ color: '#fbfbf8', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
    chrome: solid('#d6d7d8', { metalness: 1, roughness: 0.12, envMapIntensity: 0.35 }), // indoor chrome: don't mirror the outdoor sky
    steel: solid('#c4c7ca', { metalness: 1, roughness: 0.32 }),
    brass: solid('#b8913f', { metalness: 1, roughness: 0.3 }), // main-door hardware and inlays
    alu: solid('#3d4247', { metalness: 0.8, roughness: 0.35 }),
    black: solid('#16171a', { roughness: 0.35 }),
    screen: new THREE.MeshPhysicalMaterial({ color: '#050608', roughness: 0.05, clearcoat: 1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#dfeef3', roughness: 0.02, metalness: 0, transparent: true, opacity: 0.18, depthWrite: false, envMapIntensity: 1.5, side: THREE.DoubleSide }),
    showerGlass: new THREE.MeshPhysicalMaterial({ color: '#e9f3f5', roughness: 0.03, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }),
    frosted: new THREE.MeshPhysicalMaterial({ color: '#eef3f4', roughness: 0.6, transparent: true, opacity: 0.6, depthWrite: false }),
    white: solid('#f5f3ee', { roughness: 0.5 }),
    ceiling: solid('#fbf9f5', { roughness: 0.95 }),
    lamp: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff1d6', emissiveIntensity: 3 }),
    shade: new THREE.MeshStandardMaterial({ color: '#f3e7d2', emissive: '#ffdcae', emissiveIntensity: 0.6, side: THREE.DoubleSide }),
    leaf: solid('#4d7a3a', { roughness: 0.7, flatShading: true }),
    pot: solid('#c9b8a2', { roughness: 0.8 }),
    // site
    grass: pbr('sparse_grass', { color: '#c4d89a' }),
    asphalt: pbr('asphalt_02'),
    earth: pbr('dry_ground_01'),
    soil: pbr('red_laterite_soil_stones'),
    solid,
  };
}

// Flooring designs: which material each room finish uses. Toilets always keep anti-skid tiles
// and the pooja room keeps marble unless a design says otherwise.
export const FLOOR_DEFAULT = { tile: 'tile', kitchen: 'kitchen', wood: 'wood', marble: 'marble', stone: 'stone', bath: 'bath' };
export const FLOORS = [
  { id: 'asbuilt', name: 'Beige marble + oak', blurb: 'Beige marble in the living areas and kitchen, oak laminate in the bedrooms.', map: {} },
  { id: 'vit600', name: 'Vitrified 600×600', blurb: 'Warm beige vitrified tiles, 600 × 600 mm with 2 mm joints, in the living areas and kitchen. Oak laminate in the bedrooms.', map: { tile: 'vitBeige', kitchen: 'vitBeige' } },
  { id: 'vit800', name: 'Glossy white 800×800', blurb: 'High-gloss white vitrified tiles, 800 × 800 mm, right through the house including the bedrooms.', map: { tile: 'vitWhite', kitchen: 'vitWhite', wood: 'vitWhite' } },
  { id: 'white', name: 'White marble-look 600×1200', blurb: 'Matt white marble-look vitrified tiles, 600 × 1200 mm with soft grey veins and 2 mm joints (like Kajaria Statuario White, 60 × 120 cm), right through the house including the bedrooms. Toilets keep anti-skid tiles.', map: { tile: 'whiteStatuario', kitchen: 'whiteStatuario', wood: 'whiteStatuario' } },
  { id: 'marble', name: 'Indian marble', blurb: 'Polished beige Indian marble everywhere except the toilets.', map: { tile: 'marblePolished', kitchen: 'marblePolished', wood: 'marblePolished', marble: 'marblePolished' } },
  { id: 'granite', name: 'Black granite', blurb: 'Polished black granite in the living areas and kitchen. Oak laminate in the bedrooms, flamed grey granite on the verandahs.', map: { tile: 'granitePolished', kitchen: 'granitePolished' } },
  { id: 'terrazzo', name: 'Terrazzo', blurb: 'Warm grey terrazzo right through the house (toilets keep anti-skid tiles).', map: { tile: 'terrazzo', kitchen: 'terrazzo', wood: 'terrazzo' } },
  { id: 'oxide', name: 'Red oxide tiles', blurb: 'Hand-made red oxide tiles (Athangudi / Kerala style) indoors and on the verandahs.', map: { tile: 'terracotta', kitchen: 'terracotta', wood: 'terracotta', stone: 'terracotta' } },
  { id: 'wood', name: 'Oak throughout', blurb: 'Oak laminate in the living areas and bedrooms, and 600 × 600 vitrified tiles in the kitchen.', map: { tile: 'wood', kitchen: 'vitBeige' } },
];

// Wall paint colours: subtle, rich emulsion shades (approximate sRGB of the paint card, matt finish).
// Interior: every room wall except toilet tiling. Exterior: plastered walls, parapet, compound wall; 'design' keeps
// the colour that comes with the chosen elevation idea.
export const PAINTS_IN = [
  { id: 'ivory', name: 'Warm ivory', hex: '#f3ece1', blurb: 'Soft creamy white with a warm undertone; brightens every room without glare.' },
  { id: 'pearl', name: 'Pearl white', hex: '#f5f3ee', blurb: 'Clean neutral white with a hint of grey; crisp with white tiles.' },
  { id: 'greige', name: 'Soft greige', hex: '#e4ddd2', blurb: 'Grey-beige; calm and modern, pairs with oak and walnut.' },
  { id: 'sand', name: 'Desert sand', hex: '#e8d9c4', blurb: 'Light warm sand; cosy in living rooms and bedrooms.' },
  { id: 'sage', name: 'Sage mist', hex: '#dfe3d4', blurb: 'Pale grey-green; restful in bedrooms and the pooja room.' },
  { id: 'blush', name: 'Blush clay', hex: '#ecdbd0', blurb: 'Muted pink-clay; warm and rich in the evening light.' },
  { id: 'mist', name: 'Morning mist', hex: '#dee3e5', blurb: 'Pale blue-grey; airy and cool in west-facing rooms.' },
];
export const PAINTS_EXT = [
  { id: 'design', name: 'Design colour', hex: null, blurb: 'The colour that comes with the chosen elevation idea.' },
  { id: 'white', name: 'Classic white', hex: '#f1efe9', blurb: 'Off-white exterior; crisp against the charcoal and wood accents.' },
  { id: 'sandstone', name: 'Sandstone', hex: '#e3d2b6', blurb: 'Warm sandstone beige; hides dust and weathers gracefully.' },
  { id: 'greige', name: 'Greige', hex: '#d9d2c6', blurb: 'Grey-beige; modern and understated.' },
  { id: 'clay', name: 'Terracotta blush', hex: '#dcbba5', blurb: 'Soft terracotta; a rich, earthy Indian tone.' },
  { id: 'olive', name: 'Olive stone', hex: '#cfcdb5', blurb: 'Muted olive-grey; blends with the garden.' },
  { id: 'grey', name: 'Dove grey', hex: '#cdd0cf', blurb: 'Light cool grey; contemporary with white bands.' },
];

// Box geometry whose UVs are in metres on every face (so textures keep their real scale).
export function boxGeo(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv;
  // face order: +x, -x, +y, -y, +z, -z ; 4 vertices each
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]);
    }
  }
  return g;
}
