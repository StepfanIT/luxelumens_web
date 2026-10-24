import { PROJECT_ID, emulatorHost } from './firebase.js';

// The public page talks to Firestore over plain REST: it only reads the
// site's texts and writes new quote requests, both of which the security
// rules allow without signing in. No SDK, no key.

function root() {
  const host = emulatorHost();
  const origin = host ? `http://${host}` : 'https://firestore.googleapis.com';
  return `${origin}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
}

export function decodeValue(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('mapValue' in value) return decodeFields(value.mapValue.fields ?? {});
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decodeValue);
  return undefined;
}

export function decodeFields(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields ?? {})) out[key] = decodeValue(value);
  return out;
}

export function encodeValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'object') return { mapValue: { fields: encodeFields(value) } };
  return { stringValue: String(value) };
}

export function encodeFields(object) {
  const out = {};
  for (const [key, value] of Object.entries(object)) out[key] = encodeValue(value);
  return out;
}

/**
 * The admin's overrides of the page texts (site/content), or null. Uses
 * batchGet, which reports a missing document in a 200 response instead of a
 * 404 that would show up as an error in the browser console.
 */
export async function fetchSiteContent(signal) {
  const res = await fetch(`${root()}:batchGet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents: [`projects/${PROJECT_ID}/databases/(default)/documents/site/content`] }),
    signal,
  });
  if (!res.ok) throw new Error(`content ${res.status}`);
  const [result] = await res.json();
  return result?.found ? decodeFields(result.found.fields) : null;
}

/** Photos of finished installations (gallery/{id}), in the admin's order. */
export async function fetchGallery(signal) {
  const res = await fetch(`${root()}/gallery?pageSize=40`, { signal });
  if (!res.ok) throw new Error(`gallery ${res.status}`);
  const body = await res.json();
  return (body.documents ?? [])
    .map((doc) => ({ id: doc.name.split('/').pop(), ...decodeFields(doc.fields) }))
    .filter((photo) => typeof photo.image === 'string' && photo.image.startsWith('data:image/'))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function randomId() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

/** Saves a quote request as leads/<id>, stamped with the server's time. */
export async function submitLead(lead) {
  const id = randomId();
  const name = `projects/${PROJECT_ID}/databases/(default)/documents/leads/${id}`;
  const body = {
    writes: [
      {
        update: { name, fields: encodeFields(lead) },
        currentDocument: { exists: false },
        updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
      },
    ],
  };
  const res = await fetch(`${root()}:commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`lead ${res.status}`);
  return id;
}
