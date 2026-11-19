// SYNQ Trajes 3D studio: a store-style mannequin wearing the suit, with real-looking fabrics,
// all-over logo prints, and uploaded images placed anywhere on the suit (as decals).
// Units are meters; the mannequin stands at the origin facing +z.
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { DecalGeometry } from './vendor/DecalGeometry.js';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { GTAOPass } from './vendor/postprocessing/GTAOPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';

const DEG = Math.PI / 180;
const FRONT = 90 * DEG; // angle that points to the front (+z)

// ---------- smooth profiles ----------
function cr(keys, x) { // Catmull-Rom through [x, value] keys
  const n = keys.length;
  if (x <= keys[0][0]) return keys[0][1];
  if (x >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (i < n - 2 && x > keys[i + 1][0]) i++;
  const p0 = keys[Math.max(i - 1, 0)][1], p1 = keys[i][1], p2 = keys[i + 1][1], p3 = keys[Math.min(i + 2, n - 1)][1];
  const t = (x - keys[i][0]) / (keys[i + 1][0] - keys[i][0]), t2 = t * t, t3 = t2 * t;
  return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
const profile = def => y => ({ rx: cr(def.rx, y), rz: cr(def.rz, y), cz: def.cz ? cr(def.cz, y) : 0, cx: def.cx ? cr(def.cx, y) : 0 });

// body shapes
const TORSO = profile({
  rx: [[0.80, 0.03], [0.83, 0.15], [0.90, 0.172], [0.98, 0.176], [1.08, 0.148], [1.20, 0.162], [1.32, 0.178], [1.40, 0.186], [1.445, 0.15], [1.475, 0.085], [1.50, 0.056]],
  rz: [[0.80, 0.03], [0.83, 0.10], [0.90, 0.112], [0.98, 0.116], [1.08, 0.098], [1.20, 0.112], [1.32, 0.118], [1.40, 0.104], [1.445, 0.085], [1.475, 0.066], [1.50, 0.054]],
  cz: [[0.80, -0.01], [0.98, -0.012], [1.08, 0.0], [1.25, 0.016], [1.36, 0.016], [1.45, 0.0], [1.50, -0.01]],
});
const JACKET_BASE = profile({ // the jacket body: torso plus ease, continuing down over the hips
  rx: [[0.76, 0.186], [0.86, 0.186], [0.98, 0.182], [1.08, 0.168], [1.20, 0.18], [1.29, 0.196], [1.355, 0.214], [1.395, 0.222], [1.425, 0.205], [1.45, 0.168], [1.475, 0.118], [1.50, 0.072]],
  rz: [[0.76, 0.14], [0.86, 0.136], [0.98, 0.132], [1.08, 0.122], [1.20, 0.134], [1.32, 0.139], [1.40, 0.126], [1.445, 0.104], [1.475, 0.08], [1.50, 0.066]],
  cz: [[0.76, -0.004], [0.98, -0.008], [1.08, 0.004], [1.25, 0.02], [1.36, 0.02], [1.45, 0.002], [1.50, -0.01]],
});
const SEAT = profile({ rx: [[0.77, 0.03], [0.785, 0.1], [0.82, 0.13], [0.85, 0.155], [0.90, 0.18], [0.98, 0.186], [1.06, 0.166]], rz: [[0.77, 0.03], [0.785, 0.06], [0.82, 0.074], [0.85, 0.084], [0.90, 0.1], [0.98, 0.114], [1.06, 0.106]], cz: [[0.77, 0.0], [0.85, -0.008], [0.9, -0.014], [1.06, -0.008]] });
const LEG = profile({ rx: [[0.04, 0.034], [0.10, 0.036], [0.30, 0.05], [0.47, 0.056], [0.56, 0.052], [0.75, 0.072], [0.92, 0.086], [0.98, 0.09]], rz: [[0.04, 0.038], [0.10, 0.04], [0.30, 0.054], [0.47, 0.06], [0.56, 0.054], [0.75, 0.076], [0.92, 0.088], [0.98, 0.09]] });
const PANT_BASE = profile({ rx: [[0.035, 0.07], [0.12, 0.068], [0.30, 0.072], [0.48, 0.074], [0.66, 0.086], [0.8, 0.094], [0.9, 0.094], [1.0, 0.09]], rz: [[0.035, 0.076], [0.12, 0.074], [0.30, 0.078], [0.48, 0.078], [0.66, 0.09], [0.8, 0.1], [0.9, 0.104], [1.0, 0.106]] });
const ARM = profile({ rx: [[-0.62, 0.026], [-0.59, 0.03], [-0.45, 0.04], [-0.30, 0.04], [-0.27, 0.042], [-0.12, 0.05], [0.0, 0.054], [0.03, 0.04]], rz: [[-0.62, 0.022], [-0.59, 0.026], [-0.45, 0.038], [-0.30, 0.04], [-0.27, 0.042], [-0.12, 0.048], [0.0, 0.05], [0.03, 0.04]] });
const SLEEVE_BASE = profile({ rx: [[-0.61, 0.05], [-0.45, 0.054], [-0.28, 0.059], [-0.10, 0.065], [-0.02, 0.066], [0.012, 0.062], [0.03, 0.05], [0.042, 0.03]], rz: [[-0.61, 0.048], [-0.45, 0.052], [-0.28, 0.057], [-0.10, 0.063], [-0.02, 0.064], [0.012, 0.06], [0.03, 0.048], [0.042, 0.03]] });
let EASE = 0, PEASE = 0, SEASE = 0; // fit: slim (negative) to loose (positive), in meters
const clamp01 = v => Math.max(0, Math.min(1, v));
const JACKET = y => {
  const p = JACKET_BASE(y), e = EASE * clamp01((1.42 - y) / 0.08);
  let rx = p.rx + e, rz = p.rz + e * 0.75;
  // stay outside the shirt, hips and legs, fading the rule in and out so there is no ridge
  const push = (cur, need, w) => cur + Math.max(0, need - cur) * w;
  const fade = (y, a, b, c, d) => clamp01((y - a) / (b - a)) * clamp01((d - y) / (d - c));
  if (y >= 0.8 && y <= 1.38) { const t = TORSO(y), w = fade(y, 0.8, 0.84, 1.33, 1.38); rx = push(rx, t.rx + 0.016, w); rz = push(rz, t.rz + 0.014, w); }
  if (y >= 0.74 && y <= 1.12) { const st = SEAT(Math.min(1.06, Math.max(0.77, y))), w = fade(y, 0.74, 0.78, 1.04, 1.12); rx = push(rx, st.rx + 0.016, w); rz = push(rz, st.rz + 0.016, w); }
  if (y >= 0.72 && y <= 1.04) { const lg = PANT(y), w = fade(y, 0.72, 0.76, 0.97, 1.04); rx = push(rx, LEG_X(y) + lg.rx + 0.014, w); }
  return { rx, rz, cz: p.cz, cx: p.cx };
};
const PANT = y => { const p = PANT_BASE(y), e = PEASE * clamp01((0.98 - y) / 0.15); return { rx: p.rx + e, rz: p.rz + e, cz: p.cz, cx: p.cx }; };
const SLEEVE = y => { const p = SLEEVE_BASE(y), e = SEASE * clamp01((0.0 - y) / 0.1); return { rx: p.rx + e, rz: p.rz + e, cz: p.cz, cx: p.cx }; };
// every piece of the jacket on its own; old designs (style/lapel/buttons/yoke) map onto these
export function jacketCfg(d) {
  const st = d.style || 'blazer';
  const base = {
    blazer: { length: 0.78, collar: d.lapel || 'notch', closure: 'buttons', buttons: d.buttons || 1, pockets: 'flap', chestPocket: true, cuffs: 'contrast', hem: 'plain', yoke: 'none', epaulettes: false, fit: 0.3 },
    bomber: { length: 0.86, collar: 'rib', closure: 'zipper', buttons: 0, pockets: 'welt', chestPocket: false, cuffs: 'rib', hem: 'rib', yoke: 'none', epaulettes: false, fit: 0.4 },
    varsity: { length: 0.86, collar: 'rib', closure: 'snaps', buttons: 6, pockets: 'welt', chestPocket: false, cuffs: 'rib', hem: 'rib', yoke: 'none', epaulettes: false, fit: 0.45 },
    western: { length: 0.9, collar: 'stand', closure: 'snaps', buttons: 5, pockets: 'flap', chestPocket: false, cuffs: 'contrast', hem: 'plain', yoke: d.yoke === false ? 'none' : 'western', epaulettes: false, fit: 0.3 },
  }[st] || {};
  return Object.assign({}, base, d.jacket || {});
}
const LEG_X = y => 0.094 + (0.98 - y) * 0.03; // legs spread a little toward the floor
const SHOULDER = new THREE.Vector3(0.188, 1.392, 0.0);
const ARM_TILT = 10 * DEG;
const ELBOW = -0.3, BEND = 0.2; // forearm swings forward a little, like a relaxed arm
const bendAt = y => BEND * clamp01((ELBOW - y) / 0.05);
function bendPoint(v) { const a = bendAt(v.y); if (!a) return v; const y = v.y - ELBOW, z = v.z; v.y = ELBOW + y * Math.cos(a) + z * Math.sin(a); v.z = -y * Math.sin(a) + z * Math.cos(a); return v; }
// bends everything inside an arm group once (geometry, placed pieces and instanced stones)
function bendArm(arm) {
  const tmp = new THREE.Vector3(), m = new THREE.Matrix4(), pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), rq = new THREE.Quaternion(), X = new THREE.Vector3(1, 0, 0);
  arm.children.forEach(o => {
    if (o.userData.bent) return; o.userData.bent = true;
    if (o.isInstancedMesh) {
      for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); m.decompose(pos, q, sc); const a = bendAt(pos.y); bendPoint(pos); rq.setFromAxisAngle(X, -a); q.premultiply(rq); m.compose(pos, q, sc); o.setMatrixAt(i, m); }
      o.instanceMatrix.needsUpdate = true; return;
    }
    const identity = o.position.lengthSq() === 0 && o.rotation.x === 0 && o.rotation.y === 0 && o.rotation.z === 0 && o.scale.x === 1 && o.scale.y === 1 && o.scale.z === 1;
    if (identity && o.geometry) {
      const p = o.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) { tmp.fromBufferAttribute(p, i); bendPoint(tmp); p.setXYZ(i, tmp.x, tmp.y, tmp.z); }
      p.needsUpdate = true; o.geometry.computeVertexNormals(); o.geometry.computeBoundingSphere(); o.geometry.computeBoundingBox && o.geometry.computeBoundingBox();
    } else { const a = bendAt(o.position.y); bendPoint(o.position); o.rotation.x -= a; }
  });
}

// ---------- surface builders ----------
// Rings stacked along y; each ring spans the angles th(y) = [from, to] (radians, 0 = +x, 90° = front).
function rings(prof, y0, y1, th, off, segU = 96, segV = 60, xAt = null, fold = null) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= segV; j++) {
    const y = y0 + (y1 - y0) * j / segV, p = prof(y), [a0, a1] = th(y), cx = (xAt ? xAt(y) : 0) + p.cx;
    const R = (p.rx + p.rz) / 2 + off;
    for (let i = 0; i <= segU; i++) {
      const a = a0 + (a1 - a0) * i / segU, o = off + (fold ? fold(y, a) : 0);
      pos.push(cx + (p.rx + o) * Math.cos(a), y, p.cz + (p.rz + o) * Math.sin(a));
      uv.push(a * R, y);
    }
  }
  for (let j = 0; j < segV; j++) for (let i = 0; i < segU; i++) {
    const a = j * (segU + 1) + i, b = a + 1, c = a + segU + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  return geo(pos, uv, idx);
}
// A patch: columns of angles, each with its own y range yr(a) = [low, high].
function patch(prof, a0, a1, yr, off, segU = 80, segV = 30, xAt = null, fold = null) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= segU; i++) {
    const a = a0 + (a1 - a0) * i / segU, [lo, hi] = yr(a);
    for (let j = 0; j <= segV; j++) {
      const y = lo + (hi - lo) * j / segV, p = prof(y), cx = (xAt ? xAt(y) : 0) + p.cx, R = (p.rx + p.rz) / 2 + off;
      const o = off + (fold ? fold(y, a) : 0);
      pos.push(cx + (p.rx + o) * Math.cos(a), y, p.cz + (p.rz + o) * Math.sin(a));
      uv.push(a * R, y);
    }
  }
  for (let i = 0; i < segU; i++) for (let j = 0; j < segV; j++) {
    const a = i * (segV + 1) + j, b = a + 1, c = a + segV + 1, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  return geo(pos, uv, idx);
}
// A strip between two edges given as functions of t in [0,1] (used for lapels).
function strip(inner, outer, seg = 40) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg, p = inner(t), q = outer(t);
    pos.push(p.x, p.y, p.z, q.x, q.y, q.z);
    uv.push(0, p.y, p.distanceTo(q), q.y);
  }
  for (let i = 0; i < seg; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  return geo(pos, uv, idx);
}
function geo(pos, uv, idx) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
const full = () => [FRONT - Math.PI, FRONT + Math.PI];

// ---------- fabric folds (radial offsets in meters) ----------
const g1 = (x, c, w) => Math.exp(-((x - c) / w) * ((x - c) / w));
export const FOLD = {
  // elbow creases, wrist bunching, a little pull under the shoulder
  sleeve: (y, a) => 0.0034 * g1(y, -0.3, 0.07) * Math.sin(y * 95 + Math.sin(a * 2 + 1) * 1.6) * (0.6 + 0.4 * Math.sin(a + 2))
    + 0.003 * g1(y, -0.52, 0.05) * Math.sin(y * 140 + a * 1.3)
    + 0.0015 * g1(y, -0.06, 0.05) * Math.sin(a * 3 + y * 40),
  // break at the shoe, soft knee lines, gentle vertical drape
  pant: (y, a) => 0.0042 * Math.exp(-(Math.max(0, y - 0.05)) / 0.07) * Math.sin(y * 115 + Math.sin(a * 3) * 1.4)
    + 0.0016 * g1(y, 0.5, 0.05) * Math.sin(y * 85 + a)
    + 0.0009 * Math.sin(a * 7 + y * 6),
  // drag lines at the waist and a soft back drape
  jacket: (y, a) => 0.0018 * g1(y, 1.07, 0.07) * Math.sin(y * 70 + a * 3)
    + 0.0008 * Math.sin(a * 9 + y * 10) * g1(y, 1.2, 0.25),
};

// ---------- generated fabric textures ----------
const TEX = {};
function canvas(n) { const c = document.createElement('canvas'); c.width = c.height = n; return c; }
function noise2(n, cells, seed) { // smooth value noise, n x n, tiling
  let s = seed || 1; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const g = []; for (let i = 0; i < cells * cells; i++) g.push(rnd());
  const out = new Float32Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const fx = x / n * cells, fy = y / n * cells, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const v = (a, b) => g[((b % cells) * cells) + (a % cells)];
    out[y * n + x] = (v(x0, y0) * (1 - sx) + v(x0 + 1, y0) * sx) * (1 - sy) + (v(x0, y0 + 1) * (1 - sx) + v(x0 + 1, y0 + 1) * sx) * sy;
  }
  return out;
}
function heightToNormal(h, n, strength) {
  const c = canvas(n), x = c.getContext('2d'), img = x.createImageData(n, n);
  for (let y = 0; y < n; y++) for (let i = 0; i < n; i++) {
    const l = h[y * n + (i - 1 + n) % n], r = h[y * n + (i + 1) % n], u = h[((y - 1 + n) % n) * n + i], d = h[((y + 1) % n) * n + i];
    let nx = (l - r) * strength, ny = (u - d) * strength, nz = 1; const len = Math.hypot(nx, ny, nz); nx /= len; ny /= len; nz /= len;
    const o = (y * n + i) * 4; img.data[o] = (nx * 0.5 + 0.5) * 255; img.data[o + 1] = (ny * 0.5 + 0.5) * 255; img.data[o + 2] = (nz * 0.5 + 0.5) * 255; img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0); return c;
}
function texture(c, tile, srgb) {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tile, 1 / tile);
  t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
function toneCanvas(v, n, lo, hi) { // grayscale "lightness" map: lo..hi (multiplies the fabric color)
  const c = canvas(n), x = c.getContext('2d'), img = x.createImageData(n, n);
  for (let k = 0; k < n * n; k++) { const g = Math.round(255 * (lo + (hi - lo) * Math.max(0, Math.min(1, v[k])))); img.data[k * 4] = img.data[k * 4 + 1] = img.data[k * 4 + 2] = g; img.data[k * 4 + 3] = 255; }
  x.putImageData(img, 0, 0); return c;
}
function warpNoise(n, cells, seed, warp, stretchX) { // domain-warped noise: crushed, streaky shapes
  const base = noise2(n, cells, seed), wx = noise2(n, 4, seed + 7), wy = noise2(n, 4, seed + 13), out = new Float32Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const k = y * n + x, sx = ((x + (wx[k] - 0.5) * warp * n) * stretchX % n + n) % n | 0, sy = ((y + (wy[k] - 0.5) * warp * n) % n + n) % n | 0;
    out[k] = base[sy * n + sx];
  }
  return out;
}
function norm01(a) { let lo = 1e9, hi = -1e9; for (const v of a) { lo = Math.min(lo, v); hi = Math.max(hi, v); } return a.map(v => (v - lo) / (hi - lo || 1)); }
function fabricMaps(kind) {
  if (TEX[kind]) return TEX[kind];
  const n = 512; let normal, tile, tone = null;
  const mix = (a, b, wa) => a.map((v, i) => v * wa + b[i] * (1 - wa));
  if (kind === 'velvet') { const h = mix(noise2(n, 10, 3), noise2(n, 40, 9), 0.7); normal = heightToNormal(h, n, 5); tone = toneCanvas(norm01(h), n, 0.82, 1); tile = 0.28; }
  else if (kind === 'crushed') {
    // crushed velvet: the pile is pressed in random directions, so patches catch the light differently
    const h = norm01(mix(warpNoise(n, 7, 31, 0.35, 1), warpNoise(n, 19, 5, 0.25, 1), 0.65));
    const sharp = h.map(v => Math.pow(Math.abs(Math.sin(v * 7.5)), 0.6));
    normal = heightToNormal(mix(h, noise2(n, 90, 77), 0.85), n, 3); tone = toneCanvas(sharp.map((v, k) => 0.3 + 0.7 * v * (0.7 + 0.3 * h[k])), n, 0.38, 1); tile = 0.2;
  }
  else if (kind === 'suede') { const h = mix(noise2(n, 128, 5), noise2(n, 14, 2), 0.6); normal = heightToNormal(h, n, 2.4); tone = toneCanvas(norm01(noise2(n, 10, 4)), n, 0.84, 1); tile = 0.16; }
  else if (kind === 'satin') { const h = mix(noise2(n, 3, 7), noise2(n, 8, 2), 0.7); normal = heightToNormal(h, n, 5); tile = 0.7; }
  else if (kind === 'leather') { const h = mix(noise2(n, 64, 11), noise2(n, 160, 4), 0.6); normal = heightToNormal(h, n, 3); tone = toneCanvas(norm01(noise2(n, 12, 8)), n, 0.86, 1); tile = 0.12; }
  else if (kind === 'wool') {
    const h = new Float32Array(n * n), nz = noise2(n, 256, 21);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) h[y * n + x] = 0.5 + 0.35 * Math.sin((x + y) / n * Math.PI * 2 * 48) + 0.25 * nz[y * n + x];
    normal = heightToNormal(h, n, 1.6); tone = toneCanvas(norm01(noise2(n, 8, 6)), n, 0.9, 1); tile = 0.06;
  } else if (kind === 'foil') {
    // crinkled mirror foil: sharp ridges in every direction
    const r1 = noise2(n, 14, 41), r2 = noise2(n, 33, 43), h = r1.map((v, k) => 1 - Math.abs(v - 0.5) * 2 + 0.5 * (1 - Math.abs(r2[k] - 0.5) * 2));
    normal = heightToNormal(h, n, 9); tone = toneCanvas(norm01(h), n, 0.85, 1); tile = 0.36;
  } else if (kind === 'snake') {
    // snakeskin: offset rows of rounded scales with darker edges
    const h = new Float32Array(n * n), t = new Float32Array(n * n), S = 32, nz = noise2(n, 8, 51);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const row = Math.floor(y / (S * 0.6)), ox = (row % 2) * S / 2, cx = ((x + ox) % S) / S - 0.5, cy = (y % (S * 0.6)) / (S * 0.6) - 0.5;
      const d = Math.sqrt(cx * cx * 1.1 + cy * cy * 1.6), k = y * n + x, sc = 1 + 0.6 * (nz[k] - 0.5);
      h[k] = Math.max(0, 1 - d * 1.6 * sc); t[k] = 0.55 + 0.45 * Math.min(1, h[k] * 2.2) * (0.75 + 0.5 * nz[k]);
    }
    normal = heightToNormal(h, n, 6); tone = toneCanvas(t, n, 0, 1); tile = 0.42;
  } else if (kind === 'quilted') {
    const h = new Float32Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const u = (x + y) / n * 4 % 1, v = (x - y + n) / n * 4 % 1; h[y * n + x] = Math.sin(u * Math.PI) * Math.sin(v * Math.PI); }
    normal = heightToNormal(h.map(v => Math.sqrt(v)), n, 18); tone = toneCanvas(h.map(v => Math.pow(v, 0.35)), n, 0.55, 1); tile = 0.2;
  } else if (kind === 'sequin' || kind === 'glitter') {
    // every scale tilts a little differently, so it sparkles as you turn the mannequin
    const N = 512, c = canvas(N), x = c.getContext('2d'), tc = canvas(N), tx = tc.getContext('2d'); let sd = kind === 'sequin' ? 5 : 17; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    x.fillStyle = 'rgb(128,128,255)'; x.fillRect(0, 0, N, N); tx.fillStyle = kind === 'sequin' ? '#2a2a2a' : '#888'; tx.fillRect(0, 0, N, N);
    const step = kind === 'sequin' ? 16 : 4;
    for (let yy = 0; yy < N + step; yy += step * (kind === 'sequin' ? 0.86 : 1)) for (let xx = 0; xx < N + step; xx += step) {
      const ox = kind === 'sequin' && Math.round(yy / (step * 0.86)) % 2 ? step / 2 : 0;
      const tilt = kind === 'sequin' ? 0.55 : 0.8, a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * tilt;
      const nx = Math.cos(a) * r, ny = Math.sin(a) * r, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      x.fillStyle = `rgb(${(nx * 0.5 + 0.5) * 255 | 0},${(ny * 0.5 + 0.5) * 255 | 0},${(nz * 0.5 + 0.5) * 255 | 0})`;
      const g = 150 + rnd() * 105 | 0; tx.fillStyle = `rgb(${g},${g},${g})`;
      if (kind === 'sequin') { x.beginPath(); x.arc(xx + ox, yy, step * 0.55, 0, Math.PI * 2); x.fill(); tx.beginPath(); tx.arc(xx + ox, yy, step * 0.5, 0, Math.PI * 2); tx.fill(); }
      else { x.fillRect(xx, yy, step, step); tx.fillRect(xx, yy, step, step); }
    }
    normal = c; tone = tc; tile = kind === 'sequin' ? 0.09 : 0.05;
  }
  TEX[kind] = { normal: texture(normal, tile), tone: tone ? texture(tone, tile, true) : null, tile };
  return TEX[kind];
}
const FABRICS = {
  satin: { roughness: 0.46, metalness: 0.02, anisotropy: 0.4, normalScale: 0.5, env: 0.55 },
  velvet: { roughness: 0.86, metalness: 0, sheen: 0.38, sheenRoughness: 0.45, normalScale: 0.32, sheenLift: 0.06, darken: 0.12, env: 0.45 },
  suede: { roughness: 0.95, metalness: 0, sheen: 0.35, sheenRoughness: 0.75, normalScale: 0.5, sheenLift: 0.1, env: 0.6 },
  sequin: { roughness: 0.26, metalness: 0.7, normalScale: 1, env: 0.75 },
  glitter: { roughness: 0.38, metalness: 0.6, normalScale: 1, env: 0.7 },
  leather: { roughness: 0.55, metalness: 0, normalScale: 0.5, env: 0.45 },
  wool: { roughness: 0.82, metalness: 0, sheen: 0.2, sheenRoughness: 0.8, normalScale: 0.5, sheenLift: 0.08, env: 0.7 },
  metal: { roughness: 0.22, metalness: 1 },
  holo: { roughness: 0.28, metalness: 0.8, iridescence: 1, normalScale: 0.9, maps: 'glitter', env: 0.75 },
  crushed: { roughness: 0.6, metalness: 0, sheen: 1, sheenRoughness: 0.3, normalScale: 0.35, sheenLift: 0.35, lift: 1.25, env: 0.6 },
  foil: { roughness: 0.24, metalness: 0.92, normalScale: 0.55, iridescence: 0.35, env: 0.85 },
  snake: { roughness: 0.45, metalness: 0.25, iridescence: 0.8, normalScale: 0.9, lift: 1.1, env: 0.6 },
  metallic: { roughness: 0.42, metalness: 0.8, normalScale: 0.6, maps: 'leather', lift: 1.05, env: 0.7 },
  quilted: { roughness: 0.62, metalness: 0, normalScale: 1, env: 0.5 },
  skin: { roughness: 0.78, metalness: 0, env: 0.5 },
};
function fabric(kind, hex, printTex) {
  const f = FABRICS[kind] || FABRICS.wool;
  const col = new THREE.Color(hex);
  if (f.darken) col.multiplyScalar(1 - f.darken); // pile fabrics read darker than the dye color
  if (f.lift) { col.multiplyScalar(f.lift); col.r = Math.min(1, col.r); col.g = Math.min(1, col.g); col.b = Math.min(1, col.b); } // tone maps darken, so start a bit brighter
  const m = new THREE.MeshPhysicalMaterial({ color: printTex ? 0xffffff : col, roughness: f.roughness, metalness: f.metalness, side: THREE.DoubleSide });
  if (printTex) m.map = printTex;
  m.envMapIntensity = f.env != null ? f.env : 0.6; // softer room reflections overall
  if (f.clearcoat) { m.clearcoat = f.clearcoat; m.clearcoatRoughness = f.clearcoatRoughness; }
  if (f.anisotropy) m.anisotropy = f.anisotropy;
  if (f.iridescence) { m.iridescence = f.iridescence; m.iridescenceIOR = 1.75; m.iridescenceThicknessRange = [150, 900]; }
  if (f.sheen) { m.sheen = f.sheen; m.sheenRoughness = f.sheenRoughness; m.sheenColor = col.clone().lerp(new THREE.Color(0xffffff), f.sheenLift || 0.3); }
  if (kind !== 'metal' && kind !== 'skin') { const t = fabricMaps(f.maps || kind); m.normalMap = t.normal; m.normalScale = new THREE.Vector2(f.normalScale, f.normalScale); if (t.tone && !printTex) m.map = t.tone; }
  return m;
}

// ---------- ready-made patterns (tile seamlessly) ----------
const PAT_MOTIF = {
  llamas: 'M-30 40 C-44 18 -38 -6 -28 -22 C-26 -6 -18 2 -14 6 C-16 -14 -10 -32 2 -46 C2 -26 12 -14 16 0 C20 -10 26 -16 32 -22 C40 -2 38 22 26 40 Z',
  estrella: 'M0 -46 L11 -14 L45 -14 L18 6 L28 40 L0 20 L-28 40 L-18 6 L-45 -14 L-11 -14 Z',
  arabesco: 'M-46 18 C-36 -26 -6 -30 0 0 C 6 30 36 26 46 -18 M-46 18 C-52 34 -32 40 -28 28 C-25 20 -34 16 -37 22 M46 -18 C52 -34 32 -40 28 -28 C25 -20 34 -16 37 -22 M-18 -14 C-10 -30 8 -34 14 -22 M18 14 C10 30 -8 34 -14 22',
};
export function patternCanvas(name, baseHex, inkHex, N = 512) {
  const c = canvas(N), x = c.getContext('2d');
  x.fillStyle = baseHex; x.fillRect(0, 0, N, N); x.fillStyle = x.strokeStyle = inkHex;
  let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const wrap = fn => { for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) { x.save(); x.translate(dx, dy); fn(); x.restore(); } };
  if (name === 'tribal') {
    // long flowing blades that taper to a point, like tribal flame art
    for (let k = 0; k < 16; k++) {
      let px = rnd() * N, py = rnd() * N, ang = rnd() * 6.28;
      const len = 180 + rnd() * 260, w0 = 14 + rnd() * 20, bend = (rnd() - 0.5) * 0.06, wob = rnd() * 6.28;
      const pts = [];
      for (let i = 0; i < len; i += 2) { const t = i / len; ang += bend + Math.sin(t * 6 + wob) * 0.018; px += Math.cos(ang) * 2; py += Math.sin(ang) * 2; pts.push([px, py, w0 * Math.pow(1 - t, 0.8) * (0.55 + 0.45 * Math.sin(Math.min(1, t * 6) * 1.57)) + 1]); }
      wrap(() => pts.forEach(([a, b2, w]) => { x.beginPath(); x.arc(a, b2, w / 2, 0, 6.28); x.fill(); }));
    }
  } else if (name === 'salpicado') {
    // paint splatter: big drops, small specks and a few drips
    for (let k = 0; k < 140; k++) {
      const cx = rnd() * N, cy = rnd() * N, r = Math.pow(rnd(), 3) * 14 + 1.2;
      wrap(() => { x.beginPath(); x.arc(cx, cy, r, 0, 6.28); x.fill();
        if (r > 6) for (let j = 0; j < 6; j++) { const a = rnd() * 6.28, d = r * (1.3 + rnd() * 1.6); x.beginPath(); x.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * 0.18 * rnd() + 0.8, 0, 6.28); x.fill(); }
        if (r > 8 && rnd() < 0.5) { x.lineWidth = r * 0.35; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + (rnd() - 0.5) * 6, cy - r * (2 + rnd() * 3)); x.stroke(); } });
    }
  } else if (name === 'zebra') {
    const nz = noise2(N, 6, 3), img = x.getImageData(0, 0, N, N), ink = parseInt(inkHex.slice(1), 16);
    for (let y = 0; y < N; y++) for (let i = 0; i < N; i++) { const v = Math.sin((i / N) * 6.28 * 7 + nz[y * N + i] * 9); if (v > 0.25) { const o = (y * N + i) * 4; img.data[o] = ink >> 16 & 255; img.data[o + 1] = ink >> 8 & 255; img.data[o + 2] = ink & 255; } }
    x.putImageData(img, 0, 0);
  } else {
    const path = new Path2D(PAT_MOTIF[{ damasco: 'arabesco', llamas: 'llamas', estrellas: 'estrella' }[name] || 'arabesco']);
    const cells = name === 'estrellas' ? 4 : 3, st = N / cells;
    for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) {
      const cx = (i + (j % 2) * 0.5) * st + st / 2, cy = j * st + st / 2;
      wrap(() => { x.save(); x.translate(cx, cy); x.scale(st / 130, -st / 130); if (name === 'damasco') { x.lineWidth = 7; x.stroke(path); x.scale(-1, 1); x.stroke(path); } else x.fill(path); x.restore(); });
    }
  }
  return c;
}

// ---------- all-over logo print ----------
function printTexture(img, baseHex, sizeM, gapM, rotate) {
  const N = 512, c = canvas(N), x = c.getContext('2d');
  x.fillStyle = baseHex; x.fillRect(0, 0, N, N);
  if (img) {
    const tile = sizeM + gapM, s = N * (sizeM / tile), ar = img.width / img.height;
    const w = ar >= 1 ? s : s * ar, h = ar >= 1 ? s / ar : s;
    // staggered: one logo in the middle and one split over the corners
    [[N / 2, N / 2], [0, 0], [N, 0], [0, N], [N, N]].forEach(([cx, cy]) => {
      x.save(); x.translate(cx, cy); x.rotate((rotate || 0) * DEG); x.scale(1, -1); x.drawImage(img, -w / 2, -h / 2, w, h); x.restore();
    });
    const t = texture(c, sizeM + gapM, true); return t;
  }
  return null;
}

// ---------- decals: what uploaded images look like on the suit ----------
function decalCanvas(img, tech, opts) {
  const N = 512, ar = img.width / img.height, w = ar >= 1 ? N : N * ar, h = ar >= 1 ? N / ar : N;
  const c = canvas(N), x = c.getContext('2d');
  const ox = (N - w) / 2, oy = (N - h) / 2;
  if (tech === 'patch') {
    const pad = Math.min(w, h) * 0.16, r = Math.min(w, h) * 0.22;
    x.fillStyle = opts.patchColor || '#111'; roundRect(x, ox + 4, oy + 4, w - 8, h - 8, r); x.fill();
    x.drawImage(img, ox + pad, oy + pad, w - pad * 2, h - pad * 2);
    const inset = Math.min(w, h) * 0.06;
    x.strokeStyle = opts.threadColor || '#d4a63c'; x.lineWidth = 6; x.setLineDash([14, 8]); roundRect(x, ox + inset, oy + inset, w - inset * 2, h - inset * 2, r * 0.8); x.stroke();
    return { map: c };
  }
  x.drawImage(img, ox, oy, w, h);
  if (tech === 'stones') {
    // rebuild the picture out of rhinestones
    const src = x.getImageData(0, 0, N, N).data, out = canvas(N), o = out.getContext('2d'), step = Math.max(8, Math.round(N / (opts.density || 46)));
    for (let yy = step / 2; yy < N; yy += step * 0.87) for (let xx = step / 2 + ((Math.round(yy / (step * 0.87)) % 2) ? step / 2 : 0); xx < N; xx += step) {
      const i = ((yy | 0) * N + (xx | 0)) * 4; if (src[i + 3] < 120) continue;
      const col = `rgb(${src[i]},${src[i + 1]},${src[i + 2]})`, rr = step * 0.44;
      const g = o.createRadialGradient(xx - rr * 0.35, yy - rr * 0.35, rr * 0.05, xx, yy, rr);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, col); g.addColorStop(1, shade(col, -0.45));
      o.fillStyle = g; o.beginPath(); o.arc(xx, yy, rr, 0, Math.PI * 2); o.fill();
    }
    return { map: out, stones: true };
  }
  if (tech === 'embroidery') {
    // thread texture over the picture + a raised edge
    const d = x.getImageData(0, 0, N, N), p = d.data;
    for (let yy = 0; yy < N; yy++) for (let xx = 0; xx < N; xx++) {
      const i = (yy * N + xx) * 4; if (!p[i + 3]) continue;
      const thread = 0.82 + 0.18 * Math.sin((xx * 0.9 + yy * 0.45) * 0.9);
      p[i] *= thread; p[i + 1] *= thread; p[i + 2] *= thread;
    }
    x.putImageData(d, 0, 0);
    // normal map from the thread lines and the outline
    const hgt = new Float32Array(N * N);
    for (let k = 0; k < N * N; k++) { const a = p[k * 4 + 3] / 255; const xx = k % N, yy = (k / N) | 0; hgt[k] = a * (0.6 + 0.4 * Math.sin((xx * 0.9 + yy * 0.45) * 0.9)); }
    return { map: c, normal: heightToNormal(hgt, N, 3) };
  }
  return { map: c };
}
function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function shade(rgb, amt) { const m = rgb.match(/\d+/g).map(Number); return `rgb(${m.map(v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)))).join(',')})`; }

// ---------- the studio ----------
export function createStudio(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
  camera.position.set(0.9, 1.25, 3.6);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.95, 0); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false;
  controls.minDistance = 0.9; controls.maxDistance = 5.5; controls.minPolarAngle = 0.15; controls.maxPolarAngle = Math.PI - 0.2;
  controls.rotateSpeed = 0.8;

  const key = new THREE.DirectionalLight(0xfff3e6, 2.2); key.position.set(1.6, 3.2, 2.4); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -1; key.shadow.camera.right = 1; key.shadow.camera.top = 2.2; key.shadow.camera.bottom = -0.2; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd2c4, 1.3); rim.position.set(-2, 2.5, -2.5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xe8eeff, 0.7); fill.position.set(-2.4, 1.4, 2.2); scene.add(fill);
  const back = new THREE.DirectionalLight(0xffffff, 0.6); back.position.set(1.8, 1.8, -2.6); scene.add(back);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a403a, 0.45));

  // display base + soft contact shadow
  // seamless photo-studio sweep all the way around (floor curves up into the wall)
  const sweepPts = [[0, 0], [3.2, 0], [4.2, 0.12], [4.9, 0.6], [5.2, 1.4], [5.25, 9]].map(([x, y]) => new THREE.Vector2(x, y));
  const sweep = new THREE.Mesh(new THREE.LatheGeometry(sweepPts, 96), new THREE.MeshStandardMaterial({ color: 0x8c8580, roughness: 1, side: THREE.BackSide, envMapIntensity: 0.3 }));
  sweep.receiveShadow = true; scene.add(sweep);
  const floorShadow = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.ShadowMaterial({ opacity: 0.32 }));
  floorShadow.rotation.x = -Math.PI / 2; floorShadow.position.y = 0.001; floorShadow.receiveShadow = true; scene.add(floorShadow);
  const sc = canvas(256), sx = sc.getContext('2d'), gr = sx.createRadialGradient(128, 128, 10, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 256, 256);
  const shadowDisc = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadowDisc.rotation.x = -Math.PI / 2; shadowDisc.position.y = 0.002; scene.add(shadowDisc);
  scene.fog = new THREE.Fog(0x6f6964, 7, 16);

  // soft shadows where pieces meet (ambient occlusion); lighter setup on phones
  const PHONE = matchMedia('(pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const ao = new GTAOPass(scene, camera, 4, 4);
  ao.updateGtaoMaterial({ radius: 0.12, distanceExponent: 1.4, thickness: 1, scale: 1.4, samples: PHONE ? 12 : 16 });
  ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: PHONE ? 12 : 16 });
  ao.blendIntensity = 0.9;
  composer.addPass(ao);
  composer.addPass(new OutputPass());

  // the mannequin (stays the same)
  // ---------- mannequin choices ----------
  // carved: gray store mannequin with a face · faceless-white / faceless-black: smooth high-end display head
  // headless: store form cut at the neck · ghost: no body, the suit holds its own shape · human: skin, face and hair
  const mannequin = new THREE.Group(); scene.add(mannequin);
  const G = (x, y, cx, cy, sx, sy) => Math.exp(-(((x - cx) / sx) ** 2) - (((y - cy) / sy) ** 2));
  function headGeo(features) {
    const hg = new THREE.SphereGeometry(1, 96, 64), hp = hg.attributes.position;
    for (let i = 0; i < hp.count; i++) {
      let x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i);
      if (y < -0.1) { const k = 1 - 0.22 * Math.min(1, (-0.1 - y) / 0.8); x *= k; if (z < 0) z *= 1 - 0.25 * Math.min(1, (-0.1 - y) / 0.8); }
      if (z < 0 && y > -0.1) z *= 1.08;
      if (features && z > 0) {
        z += 0.16 * G(x, y, 0, -0.08, 0.1, 0.22) * z;
        z += 0.07 * G(x, y, 0, 0.22, 0.55, 0.08) * z;
        z -= 0.07 * (G(x, y, -0.33, 0.1, 0.17, 0.11) + G(x, y, 0.33, 0.1, 0.17, 0.11)) * z;
        z += 0.08 * G(x, y, 0, -0.72, 0.3, 0.14) * z;
        z -= 0.03 * G(x, y, 0, -0.42, 0.25, 0.06) * z;
        z += 0.025 * G(x, y, 0, -0.5, 0.18, 0.05) * z; // lips
      }
      if (features) x *= 1 + 0.06 * (G(x, y, -0.95, 0.05, 0.15, 0.2) + G(x, y, 0.95, 0.05, 0.15, 0.2));
      hp.setXYZ(i, x, y, z);
    }
    hg.computeVertexNormals(); return hg;
  }
  const MANNEQUINS = {
    carved: { color: '#cfc8bd', rough: 0.78, head: 'features' },
    'faceless-white': { color: '#ecebe8', rough: 0.55, head: 'smooth' },
    'faceless-black': { color: '#161616', rough: 0.45, head: 'smooth' },
    headless: { color: '#e9e6e0', rough: 0.7, head: 'none' },
    ghost: { color: '#1b1716', rough: 1, head: 'ghost' },
    human: { color: '#a8714d', rough: 0.62, head: 'human' },
  };
  let mannequinKind = null;
  function buildMannequin(kind) {
    if (kind === mannequinKind) return; mannequinKind = kind;
    while (mannequin.children.length) { const c = mannequin.children.pop(); c.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    const M = MANNEQUINS[kind] || MANNEQUINS.carved;
    const skin = new THREE.MeshPhysicalMaterial({ color: M.color, roughness: M.rough, metalness: 0, envMapIntensity: 0.5 });
    if (kind === 'human') { skin.sheen = 0.3; skin.sheenColor = new THREE.Color('#ffd6c0'); skin.sheenRoughness = 0.5; }
    const add = (g, m, parent) => { const mesh = new THREE.Mesh(g, m); mesh.castShadow = mesh.receiveShadow = true; (parent || mannequin).add(mesh); return mesh; };
    if (M.head === 'ghost') {
      // hollow look: dark inside at the neck and the sleeve openings
      const inside = new THREE.MeshBasicMaterial({ color: 0x0d0b0a, side: THREE.DoubleSide });
      const nk = add(new THREE.CircleGeometry(1, 40), inside); nk.scale.set(0.066, 0.06, 1); nk.rotation.x = -Math.PI / 2; nk.position.set(0, 1.497, -0.006);
      [-1, 1].forEach(s => { const arm = new THREE.Group(); arm.position.copy(SHOULDER).multiply(new THREE.Vector3(s, 1, 1)); arm.rotation.z = s * ARM_TILT; mannequin.add(arm);
        const c = add(new THREE.CircleGeometry(1, 32), inside, arm); c.scale.set(0.046, 0.044, 1); c.rotation.x = Math.PI / 2; c.position.set(0, -0.598, 0); bendArm(arm); });
      return;
    }
    add(rings(TORSO, 1.36, 1.5, full, -0.004, 64, 12), skin);
    if (M.head === 'none') {
      add(new THREE.CylinderGeometry(0.046, 0.054, 0.1, 40), skin).position.set(0, 1.54, -0.01);
      const cap = add(new THREE.CylinderGeometry(0.047, 0.047, 0.008, 40), fabric('metal', '#b9bcc2')); cap.position.set(0, 1.594, -0.01);
    } else {
      add(new THREE.CylinderGeometry(0.046, 0.054, 0.15, 40), skin).position.set(0, 1.56, -0.01);
      const head = add(headGeo(M.head === 'features' || M.head === 'human'), skin);
      if (M.head === 'smooth') { head.scale.set(0.074, 0.1, 0.088); head.position.set(0, 1.69, 0.0); }
      else { head.scale.set(0.078, 0.105, 0.095); head.position.set(0, 1.69, 0.004); }
      if (M.head === 'human') {
        // short dark hair, eyebrows and eyes
        const hairM = new THREE.MeshStandardMaterial({ color: 0x17110d, roughness: 0.9 });
        const hair = add(new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5), hairM); hair.scale.set(0.082, 0.07, 0.1); hair.position.set(0, 1.715, -0.006); hair.rotation.x = -0.25;
        [-1, 1].forEach(sd => {
          const eye = add(new THREE.SphereGeometry(0.0085, 16, 12), new THREE.MeshStandardMaterial({ color: 0x1a120e, roughness: 0.3 })); eye.position.set(sd * 0.026, 1.7, 0.083);
          const brow = add(new THREE.BoxGeometry(0.026, 0.005, 0.006), hairM); brow.position.set(sd * 0.027, 1.718, 0.088); brow.rotation.z = -sd * 0.12;
        });
      }
    }
    [-1, 1].forEach(s => {
      const arm = new THREE.Group(); arm.position.copy(SHOULDER).multiply(new THREE.Vector3(s, 1, 1)); arm.rotation.z = s * ARM_TILT; mannequin.add(arm);
      add(rings(ARM, -0.62, -0.52, full, 0, 40, 10), skin, arm);
      // hand: palm, softly curled fingers and a thumb, turned toward the leg
      const palm = add(new THREE.SphereGeometry(1, 32, 20), skin, arm); palm.scale.set(0.018, 0.048, 0.036); palm.position.set(0, -0.655, 0.004);
      const fing = add(new THREE.CapsuleGeometry(1, 1.2, 8, 16), skin, arm); fing.scale.set(0.014, 0.024, 0.031); fing.position.set(-0.002, -0.71, 0.012); fing.rotation.x = -0.28;
      const thumb = add(new THREE.CapsuleGeometry(1, 2.2, 6, 12), skin, arm); thumb.scale.set(0.0075, 0.0095, 0.0075); thumb.position.set(-0.012, -0.665, 0.03); thumb.rotation.set(-0.55, 0, 0.35);
      arm.scale.x = s; bendArm(arm);
    });
  }
  buildMannequin('carved');

  const suit = new THREE.Group(); scene.add(suit);
  const decals = new THREE.Group(); scene.add(decals);
  const pickables = []; // meshes images can be placed on, with a part name

  function clear(g) { while (g.children.length) { const c = g.children.pop(); c.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } }

  // ---------- build the suit from a design ----------
  let D = null, images = {}, built = false, lastGeo = null;
  const mats = {};
  function mat(part) { return mats[part]; }
  function makeMats(d) {
    const parts = ['body', 'sleeves', 'collar', 'cuffs', 'pants', 'stripes', 'shirt', 'shoes', 'hat', 'trim', 'panel', 'piping'];
    parts.forEach(p => {
      const spec = d.parts[p]; if (!spec) return;
      const onPart = d.print && d.print.parts && d.print.parts.includes(p);
      let pr = null;
      if (onPart && d.print.pattern) { pr = texture(patternCanvas(d.print.pattern, spec.color, d.print.color || '#d4a63c'), d.print.size || 0.25, true); pr.rotation = (d.print.rotate || 0) * DEG; }
      else if (onPart && d.print.imageId) pr = printTexture(images[d.print.imageId], spec.color, d.print.size || 0.12, d.print.gap || 0.06, d.print.rotate || 0);
      const old = mats[p];
      mats[p] = fabric(spec.fabric, spec.color, pr);
      if (old) setTimeout(() => old.dispose(), 0);
    });
    if (mats.metal) mats.metal.dispose();
    mats.metal = fabric('metal', d.hardware === 'silver' ? '#d9dde3' : d.hardware === 'black' ? '#1a1a1a' : '#d6ae4f');
    if (mats.rib) mats.rib.dispose();
    mats.rib = fabric('wool', d.parts.cuffs.color);
  }

  function build(d) {
    clear(suit); pickables.length = 0;
    buildMannequin(d.mannequin || 'faceless-white');
    makeMats(d);
    const put = (g, m, part, parent) => { const mesh = new THREE.Mesh(g, m); mesh.castShadow = mesh.receiveShadow = true; mesh.userData.part = part; mesh.userData.matKey = Object.keys(mats).find(k => mats[k] === m); (parent || suit).add(mesh); if (part) pickables.push(mesh); return mesh; };
    const J = jacketCfg(d), PN = Object.assign({ fit: 0.3, belt: true, turnups: false }, d.pantsCfg || {});
    EASE = (J.fit - 0.3) * 0.035; PEASE = (PN.fit - 0.3) * 0.035; SEASE = (J.fit - 0.3) * 0.022;
    const lapelEdges = [];
    const hem = J.length;
    const rib = J.hem === 'rib';
    const open = ['notch', 'peak', 'shawl'].includes(J.collar);
    const loose = !open && J.closure === 'open';
    const brk = J.collar === 'shawl' ? 1.1 : 1.14;
    // front opening (V for lapels + rounded cutaway at the hem; straight gap if worn open)
    const half = y => !open ? (loose ? 0.075 : 0.004) :
      y > brk ? 0.62 * Math.pow((y - brk) / (1.5 - brk), 0.85) : y < hem + 0.1 && J.closure !== 'zipper' ? 0.22 * Math.pow((hem + 0.1 - y) / 0.1, 1.6) : 0.003;
    const th = y => [FRONT + half(y), FRONT + 2 * Math.PI - half(y)];

    const on = (prof, y, a, off, xAt, fold) => { const p = prof(y), o = off + (fold ? fold(y, a) : 0), cx = (xAt ? xAt(y) : 0) + p.cx; return new THREE.Vector3(cx + (p.rx + o) * Math.cos(a), y, p.cz + (p.rz + o) * Math.sin(a)); };
    const cord = (fn, steps, m, r, parent, closed) => { const pts = []; for (let i = 0; i <= steps; i++) pts.push(fn(i / steps)); put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, !!closed), steps * 2, r, 8, !!closed), m, null, parent); };
    // seam lines: a thin darker groove, so the suit reads as sewn panels
    const seamMat = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.42, roughness: 1, depthWrite: false });

    // shirt + pants underneath
    const shirt = d.shirt || 'dress';
    put(rings(TORSO, 1.0, shirt === 'tee' ? 1.49 : 1.5, full, 0.006, 64, 30), mat('shirt'), null);
    if (shirt === 'turtle') { const TN = profile({ rx: [[1.47, 0.07], [1.6, 0.056]], rz: [[1.47, 0.066], [1.6, 0.054]], cz: [[1.47, -0.008], [1.6, -0.01]] }); put(rings(TN, 1.47, 1.6, full, 0.004, 48, 10), mat('shirt'), null); }
    if (shirt === 'dress' && (open || loose)) [-1, 1].forEach(sd => { // shirt collar points (only where the shirt shows)
      put(strip(t => new THREE.Vector3(sd * (0.012 + 0.045 * t), 1.5 - 0.02 * t, 0.07 + 0.012 * t), t => new THREE.Vector3(sd * (0.03 + 0.05 * t), 1.47 - 0.055 * t, 0.068 + 0.03 * t), 12), mat('shirt'), null);
    });
    put(rings(SEAT, 0.77, 1.06, full, 0.006, 64, 26), mat('pants'), 'pants');
    [-1, 1].forEach(s => {
      put(rings(PANT, 0.035, 1.0, full, 0, 96, 160, y => s * LEG_X(y), FOLD.pant), mat('pants'), 'pants');
      cord(t => on(PANT, 0.04 + 0.86 * t, FRONT, 0.0012, y => s * LEG_X(y), FOLD.pant), 80, seamMat, 0.0008); // front crease
      cord(t => on(PANT, 0.036, t * Math.PI * 2, 0.002, y => s * LEG_X(y)), 64, mat('pants'), 0.003, null, true); // hem
      if (PN.turnups) { put(rings(PANT, 0.036, 0.078, full, 0.0045, 72, 6, y => s * LEG_X(y)), mat('pants'), 'pants'); cord(t => on(PANT, 0.078, t * Math.PI * 2, 0.0045, y => s * LEG_X(y)), 64, mat('pants'), 0.0025, null, true); }
      const outer = s > 0 ? 0 : Math.PI;
      if (d.stripes !== 'none') {
        const w = d.stripes === 'two' ? 0.006 : 0.012, offs = d.stripes === 'two' ? [-0.012, 0.012] : [0];
        offs.forEach(o => { const a = outer + o / 0.08; put(patch(PANT, a - w / 0.08, a + w / 0.08, () => [0.04, 0.99], 0.0025, 6, 160, y => s * LEG_X(y), FOLD.pant), mat('stripes'), 'pants'); });
      }
      // shoes: boots, sneakers or dress shoes
      const kind = d.shoes || 'boots';
      const shoe = new THREE.Group(); shoe.position.set(s * LEG_X(0.04), 0, 0.012); suit.add(shoe);
      const sole = new THREE.Shape(); const toeP = kind === 'boots' ? 0.19 : 0.17, toeW = kind === 'boots' ? 0.022 : 0.03;
      sole.moveTo(-0.034, -0.085);
      sole.bezierCurveTo(-0.044, -0.02, -0.046, 0.06, -toeW, 0.14); sole.quadraticCurveTo(0, toeP, toeW, 0.14);
      sole.bezierCurveTo(0.046, 0.06, 0.044, -0.02, 0.034, -0.085); sole.quadraticCurveTo(0, -0.105, -0.034, -0.085);
      const sd = kind === 'sneakers' ? 0.022 : kind === 'dress' ? 0.008 : 0.012;
      const sg = new THREE.ExtrudeGeometry(sole, { depth: sd, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 2, curveSegments: 24 });
      sg.rotateX(Math.PI / 2); put(sg, kind === 'sneakers' ? fabric('wool', '#f2f0ea') : fabric('leather', '#1a120d'), null, shoe).position.y = sd + 0.004;
      const up = new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2);
      const upm = put(up, mat('shoes'), null, shoe), upY = sd + 0.006;
      if (kind === 'sneakers') { upm.scale.set(0.046, 0.062, 0.122); upm.position.set(0, upY, 0.035); }
      else if (kind === 'dress') { upm.scale.set(0.041, 0.055, 0.12); upm.position.set(0, upY, 0.03); }
      else { upm.scale.set(0.043, 0.07, 0.125); upm.position.set(0, upY, 0.03); }
      const toe = put(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat('shoes'), null, shoe);
      toe.scale.set(kind === 'boots' ? 0.03 : 0.036, kind === 'sneakers' ? 0.042 : 0.038, 0.06); toe.position.set(0, upY, kind === 'boots' ? 0.115 : 0.105);
      if (kind !== 'sneakers') { const heel = put(new THREE.CylinderGeometry(0.026, 0.022, kind === 'boots' ? 0.035 : 0.02, 24), fabric('leather', '#1a120d'), null, shoe); heel.scale.z = 1.2; heel.position.set(0, kind === 'boots' ? 0.012 : 0.006, -0.06); }
      else cord(t => { const a = t * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * 0.047, upY + 0.012, 0.035 + Math.sin(a) * 0.123); }, 48, fabric('wool', '#f2f0ea'), 0.004, shoe, true);
    });
    // belt shows under short jackets
    if (PN.belt && (hem > 0.88 || loose)) {
      put(rings(SEAT, 1.0, 1.035, full, 0.011, 64, 3), fabric('leather', '#1a120d'), null);
      const bk = new THREE.Shape(); bk.absarc(0, 0, 1, 0, Math.PI * 2);
      const bkg = new THREE.ExtrudeGeometry(bk, { depth: 0.2, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 4, curveSegments: 32 });
      const buckle = put(bkg, mat('metal'), null); buckle.scale.set(0.034, 0.024, 0.02); buckle.position.set(0, 1.017, 0.112);
    }

    // jacket body
    const body = put(rings(JACKET, hem, 1.5, th, 0, 160, 140, null, FOLD.jacket), mat('body'), 'body');
    if (rib) put(rings(JACKET, hem - 0.002, hem + 0.055, full, 0.004, 96, 4), mats.rib, 'body');
    // western yoke (front points + back curve)
    if (J.yoke === 'straight') put(patch(JACKET, FRONT + half(1.37) + 0.01, FRONT + 2 * Math.PI - half(1.37) - 0.01, () => [1.37, 1.5], 0.003, 160, 16, null, FOLD.jacket), mat('collar'), 'body');
    if (J.yoke === 'western') {
      const yb = a => { const da = Math.abs(((a - FRONT + Math.PI * 3) % (Math.PI * 2)) - Math.PI); const front = Math.max(0, 1 - Math.abs(da - 0.62) / 0.5); return 1.33 - front * 0.06 + (da > 1.6 ? -0.02 : 0); };
      put(patch(JACKET, FRONT + 0.01, FRONT + 2 * Math.PI - 0.01, a => [yb(a), 1.5], 0.003, 160, 20), mat('collar'), 'body');
    }
    // rolled edges: the jacket has thickness where it ends
    const edgeR = 0.0032, bodyM = mat('body');
    if (!rib) cord(t => on(JACKET, hem + 0.002, FRONT + (half(hem) + 0.006) + t * (2 * Math.PI - 2 * (half(hem) + 0.006)), 0.001, null, FOLD.jacket), 140, bodyM, edgeR);
    if (open) [-1, 1].forEach(s => cord(t => { const y = hem + 0.002 + (brk - hem - 0.002) * t; return on(JACKET, y, FRONT + s * (half(y) + 0.004), 0.001, null, FOLD.jacket); }, 60, bodyM, edgeR));
    else [-1, 1].forEach(s => cord(t => { const y = hem + 0.004 + (1.46 - hem) * t; return on(JACKET, y, FRONT + s * (half(y) + 0.008), 0.002, null, FOLD.jacket); }, 60, bodyM, edgeR));
    // seams
    [0, Math.PI].forEach(a => cord(t => on(JACKET, hem + 0.01 + (1.36 - hem - 0.01) * t, a, 0.0012, null, FOLD.jacket), 60, seamMat, 0.0011));
    [0, Math.PI].forEach(a => cord(t => on(JACKET, 1.42 + (1.49 - 1.42) * t, a + (a === 0 ? 0.08 : -0.08), 0.0012, null, FOLD.jacket), 20, seamMat, 0.0011));
    if (!rib) cord(t => on(JACKET, hem + 0.01 + (1.46 - hem) * t, FRONT + Math.PI, 0.0012, null, FOLD.jacket), 60, seamMat, 0.0011);
    [-1, 1].forEach(s => { const ox = s * 0.105; cord(t => on(JACKET, hem + 0.02 + (1.33 - hem) * t, FRONT + Math.PI + s * 0.62, 0.0012, null, FOLD.jacket), 60, seamMat, 0.0009); });

    // closure: zipper / snaps / buttons
    const dots = (ys, r) => ys.forEach(y => { const p = JACKET(y); const b = put(new THREE.SphereGeometry(r, 16, 10), mat('metal'), null); b.position.set(0, y, p.cz + p.rz + 0.004 + (FOLD.jacket(y, FRONT) || 0)); b.scale.z = 0.5; });
    const even = (n, lo, hi) => Array.from({ length: n }, (_, i) => n === 1 ? (lo + hi) / 2 : lo + (hi - lo) * i / (n - 1));
    if (J.closure === 'zipper') {
      put(patch(JACKET, FRONT - 0.012, FRONT + 0.012, () => [hem + (rib ? 0.01 : 0.004), 1.49], 0.004, 2, 40, null, FOLD.jacket), mat('metal'), null);
      const pull = put(new THREE.BoxGeometry(0.012, 0.026, 0.004), mat('metal'), null); const pz = JACKET(1.45); pull.position.set(0, 1.44, pz.cz + pz.rz + 0.008);
    } else if (J.closure === 'snaps' && !open) dots(even(Math.max(1, J.buttons || 5), hem + 0.07, 1.43), 0.008);
    else if (J.closure === 'buttons' && !open) dots(even(Math.max(1, J.buttons || 5), hem + 0.07, 1.42), 0.0095);
    else if (J.closure === 'buttons' && open) dots(Array.from({ length: Math.min(3, J.buttons || 1) }, (_, i) => brk - 0.02 - i * 0.07), 0.011);
    // pockets
    const pY = hem + (hem < 0.82 ? 0.13 : 0.1);
    [-1, 1].forEach(s => {
      const a = FRONT + s * 0.75;
      if (J.pockets === 'flap') { put(patch(JACKET, a - 0.32, a + 0.32, () => [pY, pY + 0.038], 0.004, 16, 2, null, FOLD.jacket), mat(J.pocketContrast ? 'collar' : 'body'), 'body'); cord(t => on(JACKET, pY, a - 0.32 + 0.64 * t, 0.005, null, FOLD.jacket), 16, mat(J.pocketContrast ? 'collar' : 'body'), 0.0018); }
      if (J.pockets === 'welt') { put(patch(JACKET, a - 0.3, a + 0.3, () => [pY + 0.012, pY + 0.024], 0.0028, 12, 2, null, FOLD.jacket), mat(J.pocketContrast ? 'collar' : 'body'), 'body'); [pY + 0.012, pY + 0.024].forEach(y => cord(t => on(JACKET, y, a - 0.3 + 0.6 * t, 0.003, null, FOLD.jacket), 12, seamMat, 0.0009)); }
      if (J.pockets === 'zip') cord(t => on(JACKET, pY - 0.01 + 0.08 * t, a + s * (0.18 - 0.36 * t) * 0.5, 0.004, null, FOLD.jacket), 16, mat('metal'), 0.0024);
      if (J.pockets === 'patch') { put(patch(JACKET, a - 0.3, a + 0.3, () => [pY - 0.05, pY + 0.04], 0.0032, 16, 8, null, FOLD.jacket), mat(J.pocketContrast ? 'collar' : 'body'), 'body'); const ed = [[0, 0, 0, 1], [0, 1, 1, 1], [1, 1, 1, 0]]; ed.forEach(([u0, v0, u1, v1]) => cord(t => on(JACKET, pY - 0.05 + 0.09 * (v0 + (v1 - v0) * t), a - 0.3 + 0.6 * (u0 + (u1 - u0) * t), 0.0042, null, FOLD.jacket), 10, seamMat, 0.0008)); }
    });
    if (J.chestPocket) { const a = FRONT - 0.55; put(patch(JACKET, a - 0.2, a + 0.2, () => [1.3, 1.312], 0.003, 10, 2, null, FOLD.jacket), mat(J.pocketContrast ? 'collar' : 'body'), 'body'); [1.3, 1.312].forEach(y => cord(t => on(JACKET, y, a - 0.2 + 0.4 * t, 0.0033, null, FOLD.jacket), 10, seamMat, 0.0008)); }
    if (J.epaulettes) [0, Math.PI].forEach(c => { put(patch(JACKET, c - 0.3, c + 0.3, () => [1.432, 1.452], 0.005, 12, 3), mat('collar'), 'body'); const p = JACKET(1.445), b = put(new THREE.SphereGeometry(0.006, 12, 8), mat('metal'), null); b.position.set(Math.cos(c) * (p.rx * 0.8), 1.452, p.cz); });

    // lapels / collar
    if (open) {
      const W = { notch: [[brk, 0], [brk + 0.08, 0.05], [1.34, 0.074], [1.385, 0.08], [1.4, 0.03], [1.47, 0.042]],
        peak: [[brk, 0], [brk + 0.08, 0.05], [1.34, 0.08], [1.4, 0.112], [1.41, 0.03], [1.47, 0.042]],
        shawl: [[brk, 0], [brk + 0.08, 0.052], [1.36, 0.072], [1.47, 0.05]] }[J.collar] || [];
      [-1, 1].forEach(s => {
        const yAt = t => brk + (1.475 - brk) * t;
        const pt = (y, a, off) => { const p = JACKET(y); return new THREE.Vector3((p.rx + off) * Math.cos(a), y, p.cz + (p.rz + off) * Math.sin(a)); };
        const edge = y => FRONT + s * half(y);
        const inner = t => { const y = yAt(t); return pt(y, edge(y), 0.006); };
        const outer = t => { const y = yAt(t), p = JACKET(y), R = (p.rx + p.rz) / 2; return pt(y - cr(W, y) * 0.25, edge(y) + s * cr(W, y) / R, 0.008); };
        put(strip(inner, outer, 60), mat('collar'), 'body');
        lapelEdges.push(outer, inner);
      });
      // back collar hugs the neck and meets the lapels at the front
      const COLLAR = profile({ rx: [[1.44, 0.15], [1.47, 0.105], [1.53, 0.078]], rz: [[1.44, 0.1], [1.47, 0.084], [1.53, 0.07]], cz: [[1.44, -0.004], [1.53, -0.014]] });
      put(rings(COLLAR, 1.445, 1.528, () => [FRONT + half(1.47) + 0.28, FRONT + 2 * Math.PI - half(1.47) - 0.28], 0.004, 64, 8), mat('collar'), 'body');
    } else {
      // stand-up collar (rib on bombers, fabric on western)
      const NECK = profile({ rx: [[1.46, 0.09], [1.54, 0.072]], rz: [[1.46, 0.08], [1.54, 0.068]], cz: [[1.46, -0.006], [1.54, -0.012]] });
      if (J.collar === 'stand' || J.collar === 'rib') put(rings(NECK, 1.465, 1.535, () => [FRONT + 0.12 + (loose ? 0.6 : 0), FRONT + 2 * Math.PI - 0.12 - (loose ? 0.6 : 0)], 0, 64, 6), J.collar === 'rib' ? mats.rib : mat('collar'), 'body');
      if (J.collar === 'shirt') { // fold-down point collar
        put(rings(NECK, 1.465, 1.51, () => [FRONT + 0.3, FRONT + 2 * Math.PI - 0.3], 0, 64, 4), mat('collar'), 'body');
        [-1, 1].forEach(sd => put(strip(t => { const a = FRONT + sd * (0.32 + 2.2 * t); return on(NECK, 1.51, a, 0.002); }, t => { const a = FRONT + sd * (0.32 + 2.2 * t); const q = on(JACKET, 1.445 - 0.03 * (1 - t), a, 0.012); return q; }, 24), mat('collar'), 'body'));
      }
    }
    // neckwear peeking out
    const neckShow = (open || loose) && (d.shirt || 'dress') === 'dress';
    if (neckShow && d.neckwear === 'bow') {
      const bow = new THREE.Group(); bow.position.set(0, 1.468, 0.068); suit.add(bow);
      [-1, 1].forEach(s => { const w = put(new THREE.SphereGeometry(1, 20, 12), mat('trim'), null, bow); w.scale.set(0.032, 0.018, 0.012); w.position.x = s * 0.028; });
      const k = put(new THREE.SphereGeometry(0.011, 12, 8), mat('trim'), null, bow);
    } else if (neckShow && d.neckwear === 'tie') {
      const tie = put(patch(TORSO, FRONT - 0.13, FRONT + 0.13, a => [1.2 + Math.abs(a - FRONT) * 0.25, 1.47], 0.011, 8, 20), mat('trim'), null);
    }

    if (d.chain) { // gold chain over the shirt
      const cm = fabric('metal', '#d6ae4f');
      cord(t => { const a = FRONT - Math.PI + t * 2 * Math.PI, dz = Math.max(0, Math.sin(a)); const p = on(TORSO, 1.49 - 0.17 * Math.pow(dz, 3), a, 0.018); return p; }, 120, cm, 0.0028, null, true);
      const pd = put(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 24), cm, null); const pt = on(TORSO, 1.305, FRONT, 0.022); pd.position.copy(pt); pd.rotation.x = Math.PI / 2;
    }

    // sleeves
    [-1, 1].forEach(s => {
      const arm = new THREE.Group(); arm.position.copy(SHOULDER).multiply(new THREE.Vector3(s, 1, 1)); arm.rotation.z = s * ARM_TILT; arm.scale.x = s; arm.userData.arm = true; suit.add(arm);
      put(rings(SLEEVE, -0.6, 0.026, full, 0, 72, 130, null, FOLD.sleeve), mat('sleeves'), 'sleeves', arm);
      cord(t => on(SLEEVE, 0.012, t * Math.PI * 2, 0.0012), 64, seamMat, 0.0012, arm, true); // armhole seam
      cord(t => on(SLEEVE, -0.6 + 0.6 * t, Math.PI * 1.15, 0.0012, null, FOLD.sleeve), 50, seamMat, 0.0009, arm); // under-sleeve seam
      cord(t => on(SLEEVE, -0.6, t * Math.PI * 2, 0.0025), 64, mat('sleeves'), 0.0028, arm, true); // sleeve hem edge
      if (J.cuffs === 'rib') put(rings(SLEEVE, -0.615, -0.55, full, 0.003, 48, 4), mats.rib, 'sleeves', arm);
      else if (J.cuffs === 'contrast') put(rings(SLEEVE, -0.605, -0.53, full, 0.003, 48, 6), mat('cuffs'), 'sleeves', arm);
      else if (J.cuffs === 'buttons') [-0.57, -0.55, -0.53].forEach(y => { const b = put(new THREE.SphereGeometry(0.005, 12, 8), mat('metal'), null, arm); const q = on(SLEEVE, y, Math.PI * 1.55, 0.002); b.position.copy(q); });
      if (d.sleeveStripes) [-0.012, 0.012].forEach(o => put(patch(SLEEVE, -0.04 + o / 0.06, 0.04 + o / 0.06 - 0.05, () => [-0.5, 0.0], 0.004, 3, 40), mat('stripes'), 'sleeves', arm));
    });

    // tejana
    if (d.hat) {
      const hat = new THREE.Group(); hat.position.set(0, 1.775, -0.005); suit.add(hat);
      const crown = new THREE.LatheGeometry([[0, 0.135], [0.03, 0.137], [0.06, 0.13], [0.078, 0.11], [0.086, 0.06], [0.09, 0.0]].map(([x, y]) => new THREE.Vector2(x, y)), 48);
      const p = crown.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const top = y / 0.137; p.setY(i, y - 0.03 * top * top * Math.exp(-(x * x) / 0.0015)); if (z > 0) p.setX(i, x * (1 - 0.18 * top * top)); }
      crown.computeVertexNormals(); put(crown, mat('hat'), null, hat).scale.set(1.12, 1, 1);
      const brim = new THREE.RingGeometry(0.085, 0.215, 64, 4); brim.rotateX(-Math.PI / 2);
      const bp = brim.attributes.position;
      for (let i = 0; i < bp.count; i++) { const x = bp.getX(i), z = bp.getZ(i), r = Math.hypot(x, z); bp.setY(i, 0.055 * Math.pow(Math.abs(x) / 0.215, 2.4) * (r / 0.215) - 0.012 * Math.max(0, z / 0.215)); }
      brim.computeVertexNormals(); put(brim, mat('hat'), null, hat).scale.set(1.08, 1, 0.94);
      const band = put(new THREE.CylinderGeometry(0.093, 0.095, 0.018, 48, 1, true), mat('trim'), null, hat); band.scale.set(1.12, 1, 1); band.position.y = 0.012;
    }
    // ---- contrast panels (racing / moto style)
    const pan = d.panels || {};
    if (pan.shoulders && mat('panel')) {
      [0, Math.PI].forEach(c => put(patch(JACKET, c - 0.95, c + 0.95, () => [1.355, 1.5], 0.0016, 60, 16, null, FOLD.jacket), mat('panel'), 'body'));
      suit.children.filter(o => o.userData.arm).forEach(arm => put(rings(SLEEVE, -0.2, 0.032, full, 0.0016, 72, 40, null, FOLD.sleeve), mat('panel'), 'sleeves', arm));
    }
    if (pan.sides && mat('panel')) [0, Math.PI].forEach(c => put(patch(JACKET, c - (pan.sideWidth || 0.38), c + (pan.sideWidth || 0.38), () => [hem + (rib ? 0.055 : 0.002), 1.34], 0.0016, 30, 80, null, FOLD.jacket), mat('panel'), 'body'));
    if (pan.legs && mat('panel')) [-1, 1].forEach(s => { const outer = s > 0 ? 0 : Math.PI; put(patch(PANT, outer - (pan.legWidth || 0.5), outer + (pan.legWidth || 0.5), () => [0.04, 0.99], 0.0018, 30, 160, y => s * LEG_X(y), FOLD.pant), mat('panel'), 'pants'); });

    // ---- piping: a thin raised cord along the seams
    const pp = d.piping;
    if (pp && pp.on && mat('piping')) {
      const tube = (fn, steps, parent) => {
        const pts = []; for (let i = 0; i <= steps; i++) pts.push(fn(i / steps));
        put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps * 2, pp.size || 0.0022, 8, false), mat('piping'), null, parent);
      };
      const top = 1.495, bot = hem + (rib ? 0.055 : 0.004);
      if (pp.sides) [0, Math.PI].forEach(a => tube(t => on(JACKET, bot + (top - bot) * t, a, 0.0035, null, FOLD.jacket), 60));
      if (pp.racing) [-1, 1].forEach(side => [1, -1].forEach(face => {
        // curved line from the shoulder down toward the center, front and back
        const c = face > 0 ? FRONT : FRONT + Math.PI;
        tube(t => { const y = 1.44 - (1.44 - bot) * t, a = c + side * (0.95 - 0.62 * Math.pow(t, 0.8)); return on(JACKET, y, a, 0.0035, null, FOLD.jacket); }, 60);
      }));
      if (pp.lapels && open) lapelEdges.forEach((fn, k) => { if (k % 2 === 0) tube(t => { const v = fn(t).clone(), r = Math.hypot(v.x, v.z) || 1; v.x *= (r + 0.003) / r; v.z *= (r + 0.003) / r; return v; }, 50); });
      if (pp.front && !open) [-1, 1].forEach(s2 => tube(t => on(JACKET, bot + (1.46 - bot) * t, FRONT + s2 * 0.022, 0.0035, null, FOLD.jacket), 50));
      if (pp.pants) [-1, 1].forEach(s2 => { const outer = s2 > 0 ? 0 : Math.PI; const offs = d.stripes === 'none' ? [0] : [-1, 1].map(e => e * (d.stripes === 'two' ? 0.32 : 0.17)); offs.forEach(o => tube(t => on(PANT, 0.04 + 0.95 * t, outer + o, 0.004, y => s2 * LEG_X(y), FOLD.pant), 80)); });
      suit.children.filter(o => o.userData.arm).forEach(arm => {
        if (pp.sleeves) tube(t => on(SLEEVE, -0.6 + 0.63 * t, 0, 0.0035, null, FOLD.sleeve), 60, arm);
        if (pp.cuffs) tube(t => on(SLEEVE, J.cuffs === 'rib' ? -0.55 : J.cuffs === 'contrast' ? -0.53 : -0.595, t * Math.PI * 2, 0.0055), 48, arm);
      });
    }

    lastGeo = { hem, half, brk, open, lapelEdges };
    buildStones(d, lastGeo);
    suit.children.filter(o => o.userData.arm).forEach(bendArm);
    built = true;
    rebuildDecals();
  }

  // ---------- rhinestones (edges and sprinkled) ----------
  const GEMS = { crystal: ['#f4f8ff', 0.05, 0], ab: ['#f4f8ff', 0.05, 1], gold: ['#e8c050', 0.9, 0], silver: ['#e6e9ee', 0.95, 0], jet: ['#0c0c0e', 0.2, 0], red: ['#e0283a', 0.15, 0], blue: ['#2f7de0', 0.15, 0], pink: ['#f06aa8', 0.15, 0], green: ['#22b05e', 0.15, 0] };
  const gemGeo = new THREE.SphereGeometry(1, 10, 6);
  function surf(prof, y, a, off, xAt) {
    const p = prof(y), cx = (xAt ? xAt(y) : 0) + p.cx;
    const pos = new THREE.Vector3(cx + (p.rx + off) * Math.cos(a), y, p.cz + (p.rz + off) * Math.sin(a));
    const n = new THREE.Vector3(Math.cos(a) / (p.rx + off), 0, Math.sin(a) / (p.rz + off)).normalize();
    return { pos, n };
  }
  function buildStones(d, g) {
    const st = d.stones; if (!st) return;
    const gem = GEMS[st.color] || GEMS.crystal;
    const m = new THREE.MeshPhysicalMaterial({ color: gem[0], metalness: gem[1], roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 3.2, iridescence: gem[2], iridescenceIOR: 1.9, specularIntensity: 1 });
    const R = st.size || 0.0032;
    const sets = new Map(); // parent group -> list of {pos, n}
    const add = (parent, list) => { if (!sets.has(parent)) sets.set(parent, []); sets.get(parent).push(...list); };
    const along = (fn, gap) => { // even spacing along a curve fn(t) -> Vector3 (or {pos,n})
      const pts = [], steps = 400; let prev = null, acc = gap;
      for (let i = 0; i <= steps; i++) { const r = fn(i / steps), p = r.pos || r; if (prev) acc += p.distanceTo(prev); if (acc >= gap) { pts.push(r.pos ? r : { pos: p, n: null }); acc = 0; } prev = p; }
      return pts;
    };
    const E = st.edges || {}, gap = R * 2.6;
    if (E.lapels && g.open) g.lapelEdges.forEach((fn, i) => { if (i % 2 === 0) add(suit, along(fn, gap)); });
    if (E.front) [-1, 1].forEach(s => {
      if (g.open) add(suit, along(t => { const y = g.hem + 0.004 + (1.47 - g.hem) * t; return surf(JACKET, y, FRONT + s * (g.half(y) + 0.012), 0.008); }, gap));
      else add(suit, along(t => { const y = g.hem + 0.06 + (1.46 - g.hem - 0.06) * t; return surf(JACKET, y, FRONT + s * 0.03, 0.006); }, gap));
    });
    if (E.hem) add(suit, along(t => surf(JACKET, g.hem + 0.01, FRONT + (g.half(g.hem) + 0.02) + t * (2 * Math.PI - 2 * (g.half(g.hem) + 0.02)), 0.006), gap));
    if (E.pockets && g.open) [-1, 1].forEach(s => { const a = FRONT + s * 0.75; add(suit, along(t => surf(JACKET, g.hem + 0.168, a - 0.32 + 0.64 * t, 0.008), gap)); });
    if (E.stripes && d.stripes !== 'none') [-1, 1].forEach(s => { const outer = s > 0 ? 0 : Math.PI; [-1, 1].forEach(e => add(suit, along(t => surf(PANT, 0.06 + 0.9 * t, outer + e * (d.stripes === 'two' ? 0.32 : 0.17), 0.006, y => s * LEG_X(y)), gap * 1.2))); });
    // sprinkled stones, spread evenly with a fixed pattern (so they don't jump around)
    let sd = 99; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const S = st.scatter || {};
    if (S.body > 0) { const n = Math.round(S.body * 4); for (let i = 0; i < n; i++) { const y = g.hem + 0.03 + rnd() * (1.43 - g.hem - 0.03), a = FRONT + (g.half(y) + 0.05) + rnd() * (2 * Math.PI - 2 * (g.half(y) + 0.05)); add(suit, [surf(JACKET, y, a, 0.006)]); } }
    if (S.pants > 0) [-1, 1].forEach(s => { const n = Math.round(S.pants * 2.5); for (let i = 0; i < n; i++) add(suit, [surf(PANT, 0.06 + rnd() * 0.9, rnd() * 6.283, 0.0075, y => s * LEG_X(y))]); });
    suit.children.filter(o => o.userData.arm).forEach(arm => {
      if (E.cuffs) add(arm, along(t => surf(SLEEVE, -0.53, t * 6.283, 0.008), gap));
      if (S.sleeves > 0) { const n = Math.round(S.sleeves * 1.6); for (let i = 0; i < n; i++) add(arm, [surf(SLEEVE, -0.5 + rnd() * 0.48, rnd() * 6.283, 0.006)]); }
    });
    const q = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1), mtx = new THREE.Matrix4(), sc = new THREE.Vector3(R, R, R * 0.55);
    sets.forEach((list, parent) => {
      const inst = new THREE.InstancedMesh(gemGeo, m, list.length);
      list.forEach((it, i) => { const n = it.n || new THREE.Vector3(0, 0, 1); q.setFromUnitVectors(Z, n); mtx.compose(it.pos.clone().addScaledVector(n, R * 0.3), q, sc); inst.setMatrixAt(i, mtx); });
      inst.userData.stones = true; parent.add(inst);
    });
  }

  // ---------- decals ----------
  const decalMeshes = new Map();
  const texCache = new Map();
  function decalMaterial(dc) {
    const key = [dc.imageId, dc.tech, dc.patchColor, dc.threadColor, dc.density].join('|');
    let entry = texCache.get(key);
    if (!entry) {
      const img = images[dc.imageId]; if (!img) return null;
      const out = decalCanvas(img, dc.tech, dc);
      entry = { map: new THREE.CanvasTexture(out.map), normal: out.normal ? new THREE.CanvasTexture(out.normal) : null, stones: out.stones };
      entry.map.colorSpace = THREE.SRGBColorSpace; entry.map.anisotropy = 8;
      texCache.set(key, entry);
    }
    const m = new THREE.MeshPhysicalMaterial({ map: entry.map, transparent: true, alphaTest: 0.08, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4,
      roughness: entry.stones ? 0.12 : dc.tech === 'embroidery' ? 0.5 : 0.55, metalness: entry.stones ? 0.55 : 0, side: THREE.DoubleSide });
    if (entry.stones) { m.clearcoat = 1; m.clearcoatRoughness = 0.05; m.iridescence = dc.iridescent ? 1 : 0; }
    if (dc.tech === 'embroidery') { m.sheen = 0.8; m.sheenRoughness = 0.4; m.sheenColor = new THREE.Color(0xffffff); }
    if (entry.normal) { m.normalMap = entry.normal; m.normalScale = new THREE.Vector2(1.2, 1.2); }
    return m;
  }
  const _ray = new THREE.Raycaster();
  function surfaceAt(point, normal) { // find the suit surface near a saved spot (after the style changes)
    const o = new THREE.Vector3().fromArray(point).addScaledVector(new THREE.Vector3().fromArray(normal), 0.25);
    _ray.set(o, new THREE.Vector3().fromArray(normal).negate());
    const hit = _ray.intersectObjects(pickables, false)[0];
    return hit || null;
  }
  function makeDecal(dc) {
    const hit = surfaceAt(dc.point, dc.normal); if (!hit) return null;
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
    const helper = new THREE.Object3D(); helper.position.copy(hit.point); helper.lookAt(hit.point.clone().add(n)); helper.rotateZ((dc.rot || 0) * DEG);
    const img = images[dc.imageId]; const ar = img ? img.width / img.height : 1;
    // the decal picture is a square canvas with the logo centered, so project a square box
    const size = new THREE.Vector3(dc.size, dc.size, Math.max(0.12, dc.size * 0.8));
    const m = decalMaterial(dc); if (!m) return null;
    const g = new DecalGeometry(hit.object, hit.point, helper.rotation, size);
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 2; mesh.userData.decalId = dc.id; mesh.castShadow = false;
    return mesh;
  }
  function rebuildDecals() {
    if (!built) return;
    clear(decals); decalMeshes.clear();
    scene.updateMatrixWorld(true);
    (D.decals || []).forEach(dc => { const m = makeDecal(dc); if (m) { decals.add(m); decalMeshes.set(dc.id, m); } });
  }
  function updateDecal(dc) {
    const old = decalMeshes.get(dc.id); if (old) { decals.remove(old); old.geometry.dispose(); }
    const m = makeDecal(dc); if (m) { decals.add(m); decalMeshes.set(dc.id, m); }
  }

  // ---------- picking spots on the suit ----------
  const ndc = new THREE.Vector2();
  function pick(clientX, clientY) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    _ray.setFromCamera(ndc, camera);
    const hit = _ray.intersectObjects(pickables, false)[0];
    if (!hit) return null;
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
    if (n.dot(_ray.ray.direction) > 0) n.negate();
    return { point: hit.point.toArray().map(v => +v.toFixed(4)), normal: n.toArray().map(v => +v.toFixed(4)), part: hit.object.userData.part };
  }
  function pickDecal(clientX, clientY) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    _ray.setFromCamera(ndc, camera);
    const hit = _ray.intersectObjects([...decalMeshes.values()], false)[0];
    return hit ? hit.object.userData.decalId : null;
  }

  // ---------- views ----------
  // far enough back to see hat to boots; pulled further back on narrow (phone) screens
  const VIEWS = { front: [0, 1.1, 4.3], back: [0, 1.1, -4.3], left: [4.3, 1.1, 0], right: [-4.3, 1.1, 0], three: [1.9, 1.25, 3.9] };
  const fit = () => { const t = Math.tan(camera.fov * DEG / 2), dv = 1.0 / t, dh = 0.46 / (t * camera.aspect); return Math.max(dv, dh) * 1.06 / 4.3; };
  let anim = null;
  function view(name, instant) {
    const to = new THREE.Vector3(...(VIEWS[name] || VIEWS.three)).multiplyScalar(fit()), from = camera.position.clone();
    controls.target.set(0, 0.95, 0);
    if (instant) { camera.position.copy(to); controls.update(); return; }
    const t0 = performance.now();
    anim = () => {
      const k = Math.min(1, (performance.now() - t0) / 650), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      // swing around the mannequin instead of cutting through it
      const a0 = Math.atan2(from.x, from.z), a1 = Math.atan2(to.x, to.z); let da = a1 - a0; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI;
      const r0 = Math.hypot(from.x, from.z), r1 = Math.hypot(to.x, to.z), a = a0 + da * e, r = r0 + (r1 - r0) * e;
      camera.position.set(Math.sin(a) * r, from.y + (to.y - from.y) * e, Math.cos(a) * r);
      if (k >= 1) anim = null;
    };
  }
  function zoomTo(point) { controls.target.set(0, point[1], 0); }
  let spin = false;

  function resize() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false); composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host); resize();
  let raf = 0;
  function loop() {
    raf = requestAnimationFrame(loop);
    if (anim) anim();
    if (spin) { const a = Math.atan2(camera.position.x, camera.position.z) + 0.006, r = Math.hypot(camera.position.x, camera.position.z); camera.position.x = Math.sin(a) * r; camera.position.z = Math.cos(a) * r; }
    controls.update();
    composer.render();
  }
  loop();

  // pictures from set angles (for the image download and the tailor sheet)
  function snapshot(name, w = 900, h = 1200) {
    const keep = { pos: camera.position.clone(), tgt: controls.target.clone(), aspect: camera.aspect, size: renderer.getSize(new THREE.Vector2()), pr: renderer.getPixelRatio() };
    renderer.setPixelRatio(1); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.position.set(...VIEWS[name]); camera.position.multiplyScalar(w / h < 0.8 ? 1.0 : 0.98); controls.target.set(0, 0.93, 0); camera.lookAt(controls.target); camera.updateProjectionMatrix();
    composer.setPixelRatio(1); composer.setSize(w, h); composer.render();
    const url = renderer.domElement.toDataURL('image/png');
    renderer.setPixelRatio(keep.pr); renderer.setSize(keep.size.x, keep.size.y, false); composer.setPixelRatio(keep.pr); composer.setSize(keep.size.x, keep.size.y);
    camera.aspect = keep.aspect; camera.position.copy(keep.pos); controls.target.copy(keep.tgt); camera.updateProjectionMatrix(); controls.update();
    return url;
  }

  return {
    setDesign(d, imgs) { D = d; images = imgs || {}; texCache.clear(); build(d); },
    // colors, fabrics and the all-over print only: swap materials, keep the shapes
    setLook(d, imgs) {
      D = d; images = imgs || images; makeMats(d);
      suit.traverse(o => { if (o.isMesh && o.userData.matKey && mats[o.userData.matKey]) o.material = mats[o.userData.matKey]; });
    },
    setImages(imgs) { images = imgs; },
    setStones(d) {
      D = d; const old = []; suit.traverse(o => { if (o.userData.stones) old.push(o); }); old.forEach(o => { o.parent.remove(o); o.dispose && o.dispose(); });
      buildStones(d, lastGeo);
      suit.children.filter(o => o.userData.arm).forEach(bendArm);
    },
    refreshDecals() { rebuildDecals(); },
    updateDecal(dc) { updateDecal(dc); },
    clearDecalCache() { texCache.clear(); },
    pick, pickDecal, view, zoomTo, snapshot,
    setSpin(v) { spin = v; }, get spinning() { return spin; },
    controls, renderer, camera,
    dispose() { cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
