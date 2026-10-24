/**
 * Scales a photo down so its longer side is at most `maxSide` and encodes it
 * as WebP (JPEG where the browser cannot encode WebP), lowering the quality
 * until the data URL fits in `maxChars`. Used for gallery uploads in the
 * panel and for the house photo in the quote form.
 */
export async function preparePhoto(file, { maxSide = 1600, maxChars = 700_000 } = {}) {
  if (!file?.type?.startsWith('image/')) throw new Error('not-an-image');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
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
    if (image.length <= maxChars) return { image, width, height };
  }
  throw new Error('too-large');
}
