const MAX_SIDE = 1600;
// Firestore documents hold at most 1 MiB, so photos stay well below that.
const MAX_CHARS = 700_000;

/**
 * Scales a photo down to 1600 px on its longer side and encodes it as WebP
 * (JPEG where the browser cannot encode WebP), lowering the quality until it
 * fits in a Firestore document. Returns a data URL with its size.
 */
export async function preparePhoto(file) {
  if (!file.type.startsWith('image/')) throw new Error('To nie jest zdjęcie.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const webp = canvas.toDataURL('image/webp', 0.8).startsWith('data:image/webp');
  const type = webp ? 'image/webp' : 'image/jpeg';
  for (let quality = 0.82; quality >= 0.4; quality -= 0.08) {
    const image = canvas.toDataURL(type, quality);
    if (image.length <= MAX_CHARS) return { image, width, height };
  }
  throw new Error('Zdjęcie jest zbyt szczegółowe — spróbuj mniejszego.');
}
