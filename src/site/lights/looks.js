// Light looks for the house preview, modelled on the app's effects.
// paint(i, n, t, out) writes the colour (0..255) and level (1 = full) of LED
// i of n at time t (ms). `gain` brightens saturated looks, whose coloured
// light is darker than warm white; `swatch` colours the look's chip.

const hex = (value) => [
  parseInt(value.slice(1, 3), 16),
  parseInt(value.slice(3, 5), 16),
  parseInt(value.slice(5, 7), 16),
];
const lerp = (a, b, t) => a + (b - a) * t;

/** Deterministic noise in 0..1, for twinkles that look random but repeat. */
const noise = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function put(out, color, level = 1) {
  out[0] = color[0];
  out[1] = color[1];
  out[2] = color[2];
  out[3] = level;
}

function blend(out, a, b, t, level = 1) {
  out[0] = lerp(a[0], b[0], t);
  out[1] = lerp(a[1], b[1], t);
  out[2] = lerp(a[2], b[2], t);
  out[3] = level;
}

function hsv(h, out, level = 1) {
  const f = (k) => {
    const x = (k + h * 6) % 6;
    return 255 * (1 - Math.max(0, Math.min(x, 4 - x, 1)));
  };
  out[0] = f(5);
  out[1] = f(3);
  out[2] = f(1);
  out[3] = level;
}

const WARM = hex('#ffb35e');
const RED = hex('#ff2b2b');
const GREEN = hex('#12c95a');
const SNOW = hex('#fff1dc');
const ORANGE = hex('#ff7a12');
const VIOLET = hex('#8f3bff');
const WHITE = hex('#fff6ec');
const DEEP = hex('#0b4dff');
const CYAN = hex('#14d8ff');
const PINK = hex('#ff4fa8');
const ROSE = hex('#ff1f4b');
const PASTELS = ['#ffe066', '#7bffc6', '#ff9bd6', '#b9a2ff'].map(hex);
const AMBER = hex('#ff9a3c');
const CORAL = hex('#ff5470');
const DUSK = hex('#9c5cff');
const GOLD = hex('#ffbe45');

export const LOOKS = {
  warm: {
    swatch: ['#ffd9a1', '#ffb35e'],
    gain: 1,
    paint(i, n, t, out) {
      put(out, WARM, 0.95 + 0.05 * Math.sin(t / 900 + i * 0.7));
    },
  },
  christmas: {
    swatch: ['#ff2b2b', '#fff1dc', '#12c95a'],
    gain: 1.3,
    paint(i, n, t, out) {
      const group = Math.floor((i + Math.floor(t / 1600)) / 3) % 3;
      const sparkle = noise(i * 13 + Math.floor(t / 160)) > 0.92 ? 1.7 : 1;
      put(out, group === 0 ? RED : group === 1 ? SNOW : GREEN, sparkle);
    },
  },
  halloween: {
    swatch: ['#ff7a12', '#8f3bff'],
    gain: 1.35,
    paint(i, n, t, out) {
      const wave = 0.5 + 0.5 * Math.sin((i / n) * 18 - t / 650);
      blend(out, ORANGE, VIOLET, wave * wave, 0.85 + 0.15 * wave);
    },
  },
  poland: {
    swatch: ['#fff6ec', '#ff2b2b'],
    gain: 1.25,
    paint(i, n, t, out) {
      const block = Math.floor((i + t / 220) / 10) % 2;
      put(out, block === 0 ? WHITE : RED);
    },
  },
  rainbow: {
    swatch: ['#ff3b3b', '#ffd23b', '#3bff7a', '#3b9bff', '#b33bff'],
    gain: 1.3,
    paint(i, n, t, out) {
      hsv(((i / n) * 1.4 + t / 7000) % 1, out);
    },
  },
  ocean: {
    swatch: ['#0b4dff', '#14d8ff'],
    gain: 1.4,
    paint(i, n, t, out) {
      const wave = 0.5 + 0.5 * Math.sin((i / n) * 22 + t / 520);
      blend(out, DEEP, CYAN, wave, 0.8 + 0.2 * wave);
    },
  },
  valentine: {
    swatch: ['#ff4fa8', '#ff1f4b'],
    gain: 1.35,
    paint(i, n, t, out) {
      const mix = 0.5 + 0.5 * Math.sin((i / n) * 9 + t / 1500);
      blend(out, PINK, ROSE, mix, 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(t / 1100)));
    },
  },
  easter: {
    swatch: ['#ffe066', '#7bffc6', '#ff9bd6'],
    gain: 1.15,
    paint(i, n, t, out) {
      const at = (i / 7 + t / 2400) % PASTELS.length;
      const k = Math.floor(at);
      const f = at - k;
      const ease = f < 0.75 ? 0 : (f - 0.75) / 0.25;
      blend(out, PASTELS[k], PASTELS[(k + 1) % PASTELS.length], ease * ease * (3 - 2 * ease));
    },
  },
  summer: {
    swatch: ['#ff9a3c', '#ff5470', '#9c5cff'],
    gain: 1.2,
    paint(i, n, t, out) {
      const p = ((i / n) * 1.2 + t / 9000) % 2;
      const x = p > 1 ? 2 - p : p;
      if (x < 0.5) blend(out, AMBER, CORAL, x * 2);
      else blend(out, CORAL, DUSK, (x - 0.5) * 2);
    },
  },
  newyear: {
    swatch: ['#ffbe45', '#fff6ec'],
    gain: 1.15,
    paint(i, n, t, out) {
      const spark = noise(i * 7 + Math.floor(t / 90));
      if (spark > 0.9) put(out, WHITE, 1.9);
      else put(out, GOLD, 0.75 + 0.25 * Math.sin(t / 400 + i));
    },
  },
};

/** Looks offered in the hero, in order. */
export const HERO_LOOKS = ['warm', 'christmas', 'halloween', 'poland', 'rainbow', 'ocean'];

export function swatchStyle(id) {
  const colors = LOOKS[id]?.swatch ?? ['#ffffff'];
  return colors.length === 1
    ? { background: colors[0] }
    : { background: `conic-gradient(from 210deg, ${colors.join(', ')}, ${colors[0]})` };
}
