// Photo render: path-traces the current view (three-gpu-pathtracer) so light bounces between walls, ceilings and
// furniture like a V-Ray interior render: soft shadows, colour bleeding, glowing lamps that really light the room.
// The rasterised walkthrough stays as it is; this runs only on request and stops on the first camera move.
//
// The path tracer gets its own proxy scene: every visible mesh near the camera is baked to world space and merged
// into one mesh per material (a few hundred draw items instead of thousands, which the tracer's material indexing
// handles reliably), plus real lights at the lamps and the sun.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { WebGLPathTracer, DenoiseMaterial, PhysicalSpotLight, BlurredEnvMapGenerator } from 'three-gpu-pathtracer';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

export function createPhoto({ renderer, scene, ceil = 3.048 }) {
  let pt = null, job = null, proxy = null, blurred = null, blurredFrom = null;
  const emis = [];
  const denoise = new FullScreenQuad(new DenoiseMaterial({ sigma: 3, kSigma: 1.5, threshold: 0.2 }));

  const shown = (o) => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
  // world-space copy with only position / normal / uv as plain float arrays (so every copy merges with the others),
  // non-indexed, winding fixed for mirrored transforms
  const bake = (mesh) => {
    const src = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
    const n = src.attributes.position.count;
    const copy = (a, size) => {
      const out = new Float32Array(n * size);
      if (a) for (let i = 0; i < n; i++) for (let c = 0; c < size; c++) out[i * size + c] = c < a.itemSize ? a.getComponent(i, c) : 0;
      return new THREE.BufferAttribute(out, size);
    };
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', copy(src.attributes.position, 3));
    if (src.attributes.normal) g.setAttribute('normal', copy(src.attributes.normal, 3)); else g.computeVertexNormals();
    g.setAttribute('uv', copy(src.attributes.uv, 2));
    if (src !== mesh.geometry) src.dispose();
    g.applyMatrix4(mesh.matrixWorld);
    if (mesh.matrixWorld.determinant() < 0) {
      for (const k of ['position', 'normal', 'uv']) {
        const a = g.attributes[k], s = a.itemSize;
        for (let i = 0; i + 2 < a.count; i += 3) for (let c = 0; c < s; c++) { const t = a.array[(i + 1) * s + c]; a.array[(i + 1) * s + c] = a.array[(i + 2) * s + c]; a.array[(i + 2) * s + c] = t; }
      }
    }
    return g;
  };

  const build = (camera, lamps, color, lightGain, areas, fill) => {
    scene.updateMatrixWorld(true);
    const cam = camera.position, byMat = new Map(), sphere = new THREE.Sphere();
    const usable = (m) => m && !m.isMeshBasicMaterial && !(m.isShaderMaterial && !m.isMeshStandardMaterial); // not halos, mirrors
    const add = (m, g) => { if (!byMat.has(m)) byMat.set(m, []); byMat.get(m).push(g); };
    scene.traverseVisible((o) => {
      if (!o.isMesh || o.isInstancedMesh) return; // instances aren't supported by the tracer
      if (!o.geometry.attributes.position) return;
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      sphere.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld);
      if (sphere.distanceToPoint(cam) > 40) return; // far site detail never reaches an interior view
      if (!Array.isArray(o.material)) { if (usable(o.material)) add(o.material, bake(o)); return; }
      // multi-material (walls: paint on each face, cap on top): one piece per group, in the baked vertex order
      const g = bake(o), total = g.attributes.position.count;
      const groups = o.geometry.groups.length ? o.geometry.groups : [{ start: 0, count: total, materialIndex: 0 }];
      for (const gr of groups) {
        const m = o.material[gr.materialIndex];
        if (!usable(m)) continue;
        const part = new THREE.BufferGeometry();
        for (const k of ['position', 'normal', 'uv']) {
          const a = g.attributes[k], s = a.itemSize, end = Math.min(total, gr.start + gr.count);
          part.setAttribute(k, new THREE.BufferAttribute(a.array.slice(gr.start * s, end * s), s));
        }
        add(m, part);
      }
    });
    const root = new THREE.Scene();
    // light from a softened copy of the sky (the sun itself comes from the directional light): the HDR sun disk
    // would otherwise sparkle on every wall it bounces off
    if (scene.environment && scene.environment !== blurredFrom) { blurred = new BlurredEnvMapGenerator(renderer).generate(scene.environment, 0.3); blurredFrom = scene.environment; }
    root.environment = blurred || scene.environment;
    root.background = scene.background;
    root.environmentIntensity = scene.environmentIntensity;
    root.backgroundIntensity = scene.backgroundIntensity;
    for (const [m, gs] of byMat) {
      const g = gs.length === 1 ? gs[0] : mergeGeometries(gs, false);
      if (g) root.add(new THREE.Mesh(g, m));
    }
    // the scene's own direct lights (sun) keep working
    scene.traverseVisible((o) => {
      if (o.isDirectionalLight && o.intensity > 0) {
        const l = o.clone();
        l.position.setFromMatrixPosition(o.matrixWorld);
        root.add(l);
        const t = new THREE.Object3D();
        t.position.setFromMatrixPosition(o.target.matrixWorld);
        root.add(t);
        l.target = t;
      }
    });
    // soft fill: a ceiling-sized area light in each nearby room (what a cove and the bounce off a white ceiling
    // do in a real room), low-noise because the tracer can aim at it directly
    for (const r of areas) {
      const w = r[2] - r[0] - 0.5, d = r[3] - r[1] - 0.5;
      if (w < 0.5 || d < 0.5) continue;
      const l = new THREE.RectAreaLight(color, fill, w, d);
      l.position.set((r[0] + r[2]) / 2, ceil - 0.03, (r[1] + r[3]) / 2);
      l.lookAt(l.position.x, 0, l.position.z);
      root.add(l);
    }
    // real lights where the lamps are, the dozen nearest the camera (the tracer picks one light at random per
    // bounce, so far, hidden lamps only add noise): downlights as soft spots, pendants and chandeliers as points
    const box = new THREE.Box3(), c = new THREE.Vector3(), size = new THREE.Vector3();
    const spots = [];
    for (const { mesh, shade } of lamps) {
      if (!shown(mesh)) continue;
      box.setFromObject(mesh).getCenter(c);
      box.getSize(size);
      const L = Math.max(size.x, size.y, size.z), pts = [];
      if (L > 0.4) {
        const n = Math.max(1, Math.round(L / 0.8)), ax = size.x === L ? 'x' : size.y === L ? 'y' : 'z';
        for (let i = 0; i < n; i++) { const p = c.clone(); p[ax] = box.min[ax] + ((i + 0.5) / n) * L; pts.push(p); }
      } else pts.push(c.clone());
      for (const p of pts) spots.push({ p, strip: L > 0.4, down: L <= 0.25 && p.y > ceil - 0.15, shade, d: p.distanceTo(cam) });
    }
    spots.sort((a, b) => a.d - b.d);
    const taken = [];
    for (const s of spots) {
      if (s.d > 7 || taken.length >= 12) break;
      if (taken.some((q) => q.distanceTo(s.p) < 0.45)) continue;
      taken.push(s.p);
      if (s.down) {
        // recessed downlight: a soft-edged 100° cone straight down from a small source just under the ceiling
        const l = new PhysicalSpotLight(color, 45 * lightGain, 0, 0.9, 0.8, 2);
        l.radius = 0.02;
        l.position.copy(s.p).add(new THREE.Vector3(0, -0.08, 0));
        l.target.position.copy(s.p).setY(0);
        root.add(l, l.target);
        continue;
      }
      // LED strips sit right against walls and joinery: a point light there scorches the surface next to it and
      // throws fireflies across the room, so strips light the room only through their own glowing surface
      if (s.strip) continue;
      const l = new THREE.PointLight(color, (s.shade ? 10 : 8) * lightGain, 0, 2);
      const away = cam.clone().sub(s.p).normalize().multiplyScalar(0.07);
      l.position.copy(s.p).add(away);
      root.add(l);
    }
    return root;
  };
  const dispose = () => {
    if (!proxy) return;
    proxy.traverse((o) => o.isMesh && o.geometry.dispose());
    proxy = null;
  };

  return {
    get active() { return Boolean(job); },
    get done() { return Boolean(job && job.done); },
    // start path tracing the view; resolves true when `samples` samples are in (false if cancelled)
    start({ camera, lamps, color, lampMats = [], offMats = [], areas = [], fill = 1, samples = 500, bounces = 6, lampGain = 0.25, lightGain = 1 }) {
      this.stop();
      if (!pt) {
        pt = new WebGLPathTracer(renderer);
        pt.tiles.set(2, 2);
        pt.renderDelay = 0;
        pt.fadeDuration = 0;
        pt.minSamples = 0;
        pt.filterGlossyFactor = 1;
      }
      pt.bounces = bounces;
      return new Promise((resolve) => {
        job = { resolve, samples, ready: false };
        // build after the "Preparing…" label has painted (merging and the BVH build block for a few seconds)
        setTimeout(() => {
          if (!job || job.resolve !== resolve) return;
          try {
            // lamp surfaces glow as real emitters here: scale them so a fitting reads bright without flooding the room
            for (const m of lampMats) { emis.push([m, m.emissiveIntensity]); m.emissiveIntensity *= lampGain; }
            for (const m of offMats) { emis.push([m, m.emissiveIntensity]); m.emissiveIntensity = 0; }
            proxy = build(camera, lamps, color, lightGain, areas, fill);
            pt.setScene(proxy, camera);
            job.ready = true;
          } catch (e) {
            console.error(e);
            this.stop();
          }
        }, 50);
      });
    },
    // one frame: true while the photo owns the canvas
    frame(onProgress) {
      if (!job) return false;
      if (!job.ready) return true;
      if (pt.samples < job.samples) {
        pt.renderSample();
        onProgress && onProgress(pt.samples, job.samples);
        if (pt.samples >= job.samples) {
          // finished: one edge-preserving denoise pass over the accumulated image (tone mapped like the live view)
          denoise.material.map = pt.target.texture;
          renderer.setRenderTarget(null);
          denoise.render(renderer);
          job.done = true;
          job.resolve(true);
        }
      }
      return true;
    },
    stop() {
      if (!job) return;
      const { resolve, done } = job;
      job = null;
      for (const [m, v] of emis.splice(0)) m.emissiveIntensity = v;
      dispose();
      if (!done) resolve(false);
    },
  };
}
