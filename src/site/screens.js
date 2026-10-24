// App screenshots per language (src/assets/app/<lang>/<screen>.webp).
const files = import.meta.glob('../assets/app/*/*.webp', { eager: true, import: 'default' });

export const SCREEN_KEYS = ['home', 'scenes', 'effects', 'color', 'schedule', 'nowplaying'];

export function screensFor(lang) {
  return Object.fromEntries(SCREEN_KEYS.map((key) => [key, files[`../assets/app/${lang}/${key}.webp`]]));
}
