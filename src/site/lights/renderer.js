import onUrl from '../../assets/house/on.webp';
import offUrl from '../../assets/house/off.webp';
import lightUrl from '../../assets/house/light.webp';
import segments from '../../assets/roofline.json';
import { LOOKS } from './looks.js';

// The house is drawn from three plates of the same night photo (see
// tools/prepare_assets.py): `off` with the eave light removed, `light` the
// removed light in gray, and `on` the photo as shot. Every frame the gray
// light is tinted with the colours of the LEDs above it and added onto
// `off`, so the facade picks up whatever the roofline plays.

export const IMAGE_W = 1600;
export const IMAGE_H = 900;
export const HOUSE_POSTER = onUrl;

const SKY = 'rgb(0, 20, 62)';
const LED_COUNT = 240;
const FIELD_W = 160;
const FIELD_H = 90;
const TAPS = 8;
// Warm white LEDs times this gain reproduce the photo's own light.
const FIELD_GAIN = 0.69;
const FADE_MS = 650;
const SWEEP_MS = 2300;
const POWER_MS = 520;

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

let assetsPromise = null;

/** Loads and decodes the three plates once for every renderer on the page. */
export function loadHouse() {
  if (!assetsPromise) {
    const load = (src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      return img.decode().then(() => img);
    };
    assetsPromise = Promise.all([onUrl, offUrl, lightUrl].map(load)).then(([on, off, light]) => ({ on, off, light }));
    assetsPromise.catch(() => {
      assetsPromise = null;
    });
  }
  return assetsPromise;
}

let geometry = null;

/** LEDs spaced evenly along the roofline the app traces, in image pixels. */
function sampleLeds() {
  const segs = segments.map((seg) => seg.map(([x, y]) => [x * IMAGE_W, y * IMAGE_H]));
  const lengths = segs.map((seg) =>
    seg.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - seg[i][0], p[1] - seg[i][1]), 0),
  );
  const pitch = lengths.reduce((a, b) => a + b, 0) / LED_COUNT;
  const leds = [];
  segs.forEach((seg, s) => {
    const count = Math.max(2, Math.round(lengths[s] / pitch));
    const step = lengths[s] / count;
    let target = step / 2;
    let walked = 0;
    let placed = 0;
    for (let i = 1; i < seg.length && placed < count; i++) {
      const [ax, ay] = seg[i - 1];
      const [bx, by] = seg[i];
      const len = Math.hypot(bx - ax, by - ay);
      while (target <= walked + len && placed < count) {
        const t = len === 0 ? 0 : (target - walked) / len;
        leds.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t });
        target += step;
        placed += 1;
      }
      walked += len;
    }
  });
  return { leds, pitch };
}

/**
 * For every cell of a coarse grid over the photo, the LEDs whose light lands
 * there: the ones just above it, spreading wider the further the light falls.
 */
function buildField(leds) {
  const cells = FIELD_W * FIELD_H;
  const index = new Uint16Array(cells * TAPS);
  const weight = new Float32Array(cells * TAPS);
  const bestW = new Float32Array(TAPS);
  const bestI = new Uint16Array(TAPS);
  const cw = IMAGE_W / FIELD_W;
  const ch = IMAGE_H / FIELD_H;
  for (let cy = 0; cy < FIELD_H; cy++) {
    const y = (cy + 0.5) * ch;
    for (let cx = 0; cx < FIELD_W; cx++) {
      const x = (cx + 0.5) * cw;
      bestW.fill(0);
      let nearest = 0;
      let nearestD = Infinity;
      for (let i = 0; i < leds.length; i++) {
        const dx = x - leds[i].x;
        const dy = y - leds[i].y;
        const dd = dx * dx + dy * dy;
        if (dd < nearestD) {
          nearestD = dd;
          nearest = i;
        }
        if (dy < -16) continue;
        const d = dy > 0 ? dy : 0;
        const sigma = 8 + 0.5 * d;
        if (dx > 3 * sigma || dx < -3 * sigma) continue;
        const w = Math.exp(-(dx * dx) / (2 * sigma * sigma) - d / 170);
        if (w <= bestW[TAPS - 1]) continue;
        let k = TAPS - 1;
        while (k > 0 && bestW[k - 1] < w) {
          bestW[k] = bestW[k - 1];
          bestI[k] = bestI[k - 1];
          k -= 1;
        }
        bestW[k] = w;
        bestI[k] = i;
      }
      const base = (cy * FIELD_W + cx) * TAPS;
      let sum = 0;
      for (let k = 0; k < TAPS; k++) sum += bestW[k];
      if (sum < 1e-6) {
        index[base] = nearest;
        weight[base] = 1;
      } else {
        for (let k = 0; k < TAPS; k++) {
          index[base + k] = bestI[k];
          weight[base + k] = bestW[k] / sum;
        }
      }
    }
  }
  return { index, weight };
}

function getGeometry() {
  if (!geometry) {
    const { leds, pitch } = sampleLeds();
    geometry = { leds, pitch, ...buildField(leds) };
  }
  return geometry;
}

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export class HouseRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{focusX?: number, focusY?: number, ground?: number, zoom?: number}} options
   *   focusX/focusY: point of the photo kept in view when it is cropped;
   *   scale: extra zoom on top of covering the canvas (landscape only);
   *   ground/zoom: on portrait screens the photo is scaled to `zoom` times the
   *   screen width and its ground line sits at `ground` of the height.
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = { focusX: 0.55, focusY: 0.56, ground: 0.82, zoom: 1.9, ...options };
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.look = 'warm';
    this.prevLook = 'warm';
    this.lookSince = -Infinity;
    this.powerFrom = 0;
    this.powerTo = 0;
    this.powerSince = -Infinity;
    this.sweepSince = -Infinity;
    this.sweepEnd = -Infinity;
    this.width = 0;
    this.height = 0;
    this.assets = null;
    this.frames = 0;
    this.paintA = new Float32Array(4);
    this.paintB = new Float32Array(4);
  }

  setAssets(assets) {
    const geo = getGeometry();
    this.assets = assets;
    this.geo = geo;
    const n = geo.leds.length;
    this.fieldColors = new Float32Array(n * 3);
    this.ledColors = new Float32Array(n * 3);
    this.ledLevels = new Float32Array(n);
    this.screen = new Float32Array(n * 2);
    this.field = makeCanvas(FIELD_W, FIELD_H);
    this.fieldCtx = this.field.getContext('2d');
    this.fieldImage = this.fieldCtx.createImageData(FIELD_W, FIELD_H);
    this.layout();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    const small = Math.min(width, height) < 700;
    this.dpr = Math.min(window.devicePixelRatio || 1, small ? 2 : 1.75);
    this.canvas.width = Math.max(1, Math.round(width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(height * this.dpr));
    // The light plate is composited at half resolution on small screens.
    const scale = small ? 0.5 : 1;
    const cw = Math.round(IMAGE_W * scale);
    const ch = Math.round(IMAGE_H * scale);
    if (!this.comp || this.comp.width !== cw) {
      this.comp = makeCanvas(cw, ch);
      this.compCtx = this.comp.getContext('2d');
    }
    const gw = Math.max(1, Math.round(width / 5));
    const gh = Math.max(1, Math.round(height / 5));
    this.glow = makeCanvas(gw, gh);
    this.glowCtx = this.glow.getContext('2d');
    this.layout();
  }

  /** Where the photo goes on the canvas, in CSS pixels. */
  layout() {
    const { width: w, height: h } = this;
    if (!w || !h) return;
    const { focusX, focusY, ground, zoom } = this.options;
    let rect;
    if (w / h < 0.95) {
      const dw = w * zoom;
      const dh = (dw * IMAGE_H) / IMAGE_W;
      rect = {
        dx: clamp(w * 0.5 - dw * 0.565, w - dw, 0),
        dy: h * ground - dh * 0.76,
        dw,
        dh,
      };
    } else {
      const s = Math.max(w / IMAGE_W, h / IMAGE_H) * (this.options.scale ?? 1);
      const dw = IMAGE_W * s;
      const dh = IMAGE_H * s;
      rect = {
        dx: clamp(w * 0.5 - dw * focusX, w - dw, 0),
        dy: clamp(h * 0.5 - dh * focusY, h - dh, 0),
        dw,
        dh,
      };
    }
    this.rect = rect;
    if (this.geo) {
      const sx = rect.dw / IMAGE_W;
      const sy = rect.dh / IMAGE_H;
      this.geo.leds.forEach((led, i) => {
        this.screen[i * 2] = rect.dx + led.x * sx;
        this.screen[i * 2 + 1] = rect.dy + led.y * sy;
      });
      this.ledPitch = this.geo.pitch * sx;
    }
  }

  setLook(id, now) {
    if (!LOOKS[id] || id === this.look) return;
    this.prevLook = this.look;
    this.look = id;
    this.lookSince = now;
  }

  /** Lights on; with `sweep` a wave runs across the roofline, left to right. */
  turnOn(now, { sweep = false } = {}) {
    if (sweep && !this.reduced) {
      this.sweepSince = now;
      this.sweepEnd = now + SWEEP_MS;
      this.powerFrom = 1;
      this.powerTo = 1;
      this.powerSince = -Infinity;
      return;
    }
    this.powerFrom = this.powerAt(now);
    this.powerTo = 1;
    this.powerSince = now;
  }

  turnOff(now) {
    this.powerFrom = this.powerAt(now);
    this.powerTo = 0;
    this.powerSince = now;
    this.sweepEnd = -Infinity;
  }

  get on() {
    return this.powerTo > 0;
  }

  powerAt(now) {
    const f = this.reduced ? 1 : smooth((now - this.powerSince) / POWER_MS);
    return lerp(this.powerFrom, this.powerTo, f);
  }

  /** x of the sweep front in image pixels, or null once no sweep runs. */
  sweepFront(now) {
    if (now >= this.sweepEnd) return null;
    const p = (now - this.sweepSince) / SWEEP_MS;
    const eased = 1 - Math.pow(1 - clamp(p, 0, 1), 2.2);
    return lerp(-120, IMAGE_W + 260, eased);
  }

  /** True while something is moving that needs every frame. */
  busy(now) {
    return now < this.sweepEnd + 500 || now - this.lookSince < FADE_MS || now - this.powerSince < POWER_MS;
  }

  render(now) {
    const { assets, ctx, width: w, height: h } = this;
    if (!assets || !w || !h || !this.comp) return;
    const geo = this.geo;
    const n = geo.leds.length;
    // Stills and reduced motion show one fixed moment of the effect.
    const t = this.reduced || this.still ? 2600 : now;
    const fade = this.reduced ? 1 : smooth((now - this.lookSince) / FADE_MS);
    const power = this.powerAt(now);
    const front = this.sweepFront(now);
    const lookA = LOOKS[this.prevLook];
    const lookB = LOOKS[this.look];
    const a = this.paintA;
    const b = this.paintB;
    const gain = lerp(lookA.gain, lookB.gain, fade) * FIELD_GAIN;

    for (let i = 0; i < n; i++) {
      lookA.paint(i, n, t, a);
      lookB.paint(i, n, t, b);
      let level = lerp(a[3], b[3], fade) * power;
      if (front !== null) {
        const d = front - geo.leds[i].x;
        level *= smooth(d / 50) * (1 + 1.3 * Math.exp(-Math.max(d, 0) / 70));
      }
      const r = lerp(a[0], b[0], fade);
      const g = lerp(a[1], b[1], fade);
      const bl = lerp(a[2], b[2], fade);
      const k = level * gain;
      this.fieldColors[i * 3] = r * k;
      this.fieldColors[i * 3 + 1] = g * k;
      this.fieldColors[i * 3 + 2] = bl * k;
      this.ledColors[i * 3] = r;
      this.ledColors[i * 3 + 1] = g;
      this.ledColors[i * 3 + 2] = bl;
      this.ledLevels[i] = level;
    }

    this.paintField();

    // Gray light × LED colours.
    const comp = this.compCtx;
    const cw = this.comp.width;
    const ch = this.comp.height;
    comp.globalCompositeOperation = 'copy';
    comp.drawImage(assets.light, 0, 0, cw, ch);
    comp.globalCompositeOperation = 'multiply';
    comp.imageSmoothingQuality = 'high';
    comp.drawImage(this.field, 0, 0, cw, ch);

    const { dx, dy, dw, dh } = this.rect;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (dy > 0) {
      const sky = ctx.createLinearGradient(0, 0, 0, dy + 2);
      sky.addColorStop(0, '#020309');
      sky.addColorStop(1, SKY);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, dy + 2);
    }
    if (dy + dh < h) {
      ctx.fillStyle = '#060607';
      ctx.fillRect(0, dy + dh - 2, w, h - dy - dh + 2);
    }
    ctx.drawImage(assets.off, dx, dy, dw, dh);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(this.comp, dx, dy, dw, dh);

    // Warm white settles on the photo exactly as it was shot.
    const settled = front === null ? smooth((now - this.sweepEnd) / 500) : 0;
    const warm = (this.look === 'warm' ? fade : this.prevLook === 'warm' ? 1 - fade : 0) * power * settled;
    if (warm > 0.01) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = warm;
      ctx.drawImage(assets.on, dx, dy, dw, dh);
      ctx.globalAlpha = 1;
    }

    this.paintLeds();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    this.frames += 1;
  }

  paintField() {
    const { index, weight } = this.geo;
    const colors = this.fieldColors;
    const data = this.fieldImage.data;
    const cells = FIELD_W * FIELD_H;
    for (let c = 0, p = 0, q = 0; c < cells; c++, p += 4) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let k = 0; k < TAPS; k++, q++) {
        const w = weight[q];
        if (w === 0) continue;
        const j = index[q] * 3;
        r += colors[j] * w;
        g += colors[j + 1] * w;
        b += colors[j + 2] * w;
      }
      data[p] = r;
      data[p + 1] = g;
      data[p + 2] = b;
      data[p + 3] = 255;
    }
    this.fieldCtx.putImageData(this.fieldImage, 0, 0);
  }

  /** A soft glow around every LED, then its bright core. */
  paintLeds() {
    const { ctx, glow, glowCtx, screen, ledColors: colors, ledLevels: levels } = this;
    const n = levels.length;
    const gx = glow.width / this.width;
    const gy = glow.height / this.height;
    glowCtx.setTransform(1, 0, 0, 1, 0, 0);
    glowCtx.globalCompositeOperation = 'source-over';
    glowCtx.clearRect(0, 0, glow.width, glow.height);
    glowCtx.globalCompositeOperation = 'lighter';
    const glowR = Math.max(0.9, this.ledPitch * gx * 0.75);
    for (let i = 0; i < n; i++) {
      const level = levels[i];
      if (level < 0.02) continue;
      glowCtx.globalAlpha = Math.min(1, level * 0.55);
      glowCtx.fillStyle = `rgb(${colors[i * 3] | 0},${colors[i * 3 + 1] | 0},${colors[i * 3 + 2] | 0})`;
      glowCtx.beginPath();
      glowCtx.arc(screen[i * 2] * gx, screen[i * 2 + 1] * gy, glowR, 0, Math.PI * 2);
      glowCtx.fill();
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(glow, 0, 0, this.width, this.height);

    const coreR = Math.max(0.7, this.ledPitch * 0.14);
    for (let i = 0; i < n; i++) {
      const level = levels[i];
      if (level < 0.02) continue;
      const r = colors[i * 3] * 0.55 + 115;
      const g = colors[i * 3 + 1] * 0.55 + 115;
      const b = colors[i * 3 + 2] * 0.55 + 115;
      ctx.globalAlpha = Math.min(1, level);
      ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
      ctx.beginPath();
      ctx.arc(screen[i * 2], screen[i * 2 + 1] + this.ledPitch * 0.12, coreR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
