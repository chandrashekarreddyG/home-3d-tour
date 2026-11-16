// PBR material library. Textures are CC0 scans from Poly Haven (textures/<id>/{diff,nor,rough}.jpg).
// Geometry UVs are in metres, so each texture repeats once per its real-world size (meta.json).
import * as THREE from 'three';

const SIZE = {
  marble_01: 1.5, laminate_floor_02: 1.7, anti_skid_tiles: 1.8, long_white_tiles: 1.27, painted_plaster_wall: 2,
  plastered_wall_04: 3.2, oak_veneer_01: 1.83, walnut_veneer: 1.8, teak_veneer: 1.0, rough_linen: 0.271,
  granite_tile: 2.3, granite_tile_04: 2.0, sparse_grass: 2.0, large_grey_tiles: 3.0, asphalt_02: 3.0,
  dry_ground_01: 4.0, red_laterite_soil_stones: 2.0, velour_velvet: 0.28, clay_roof_tiles_02: 2.5, red_sandstone_wall: 2.0,
  terrazzo_tiles: 2.0, terracotta_floor_tiles: 2.08,
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
    marblePolished: pbr('marble_01', { roughness: 0.18, envMapIntensity: 1.4 }),
    granitePolished: pbr('granite_tile', { roughness: 0.12, envMapIntensity: 1.5 }),
    terrazzo: pbr('terrazzo_tiles', { color: '#efe9df', roughness: 0.5 }),
    terracotta: pbr('terracotta_floor_tiles', { roughness: 0.8 }),
    roofTile: pbr('clay_roof_tiles_02', { roughness: 0.85 }),
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
  { id: 'marble', name: 'Indian marble', blurb: 'Polished beige Indian marble everywhere except the toilets.', map: { tile: 'marblePolished', kitchen: 'marblePolished', wood: 'marblePolished', marble: 'marblePolished' } },
  { id: 'granite', name: 'Black granite', blurb: 'Polished black granite in the living areas and kitchen. Oak laminate in the bedrooms, flamed grey granite on the verandahs.', map: { tile: 'granitePolished', kitchen: 'granitePolished' } },
  { id: 'terrazzo', name: 'Terrazzo', blurb: 'Warm grey terrazzo right through the house (toilets keep anti-skid tiles).', map: { tile: 'terrazzo', kitchen: 'terrazzo', wood: 'terrazzo' } },
  { id: 'oxide', name: 'Red oxide tiles', blurb: 'Hand-made red oxide tiles (Athangudi / Kerala style) indoors and on the verandahs.', map: { tile: 'terracotta', kitchen: 'terracotta', wood: 'terracotta', stone: 'terracotta' } },
  { id: 'wood', name: 'Oak throughout', blurb: 'Oak laminate in the living areas and bedrooms, and 600 × 600 vitrified tiles in the kitchen.', map: { tile: 'wood', kitchen: 'vitBeige' } },
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
