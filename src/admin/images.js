import { preparePhoto as prepare } from '../shared/photo.js';

/** A gallery photo: up to 1600 px, small enough for a Firestore document. */
export async function preparePhoto(file) {
  try {
    return await prepare(file, { maxSide: 1600, maxChars: 700_000 });
  } catch (error) {
    if (error?.message === 'not-an-image') throw new Error('Zdjęcie: to nie jest plik graficzny.');
    if (error?.message === 'too-large') throw new Error('Zdjęcie jest zbyt szczegółowe — spróbuj mniejszego.');
    throw error;
  }
}
