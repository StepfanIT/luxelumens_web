/**
 * Lays the admin's overrides over the default texts. Objects merge key by
 * key, arrays item by item (an override array sets the length, so FAQ items
 * can be added or removed), and an empty or mistyped value keeps the default.
 */
export function mergeContent(base, extra) {
  if (extra === undefined || extra === null) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(extra)) return base;
    return extra.map((item, i) => (i < base.length ? mergeContent(base[i], item) : item));
  }
  if (base && typeof base === 'object') {
    if (typeof extra !== 'object' || Array.isArray(extra)) return base;
    const out = { ...base };
    for (const key of Object.keys(extra)) {
      out[key] = key in base ? mergeContent(base[key], extra[key]) : extra[key];
    }
    return out;
  }
  if (typeof base === 'string') return typeof extra === 'string' && extra.trim() !== '' ? extra : base;
  return typeof extra === typeof base ? extra : base;
}

const isEmpty = (value) =>
  value === undefined || value === '' || (value && typeof value === 'object' && !Array.isArray(value) && !Object.keys(value).length);

/**
 * The inverse of mergeContent: only what differs from the defaults, so the
 * stored overrides stay small and untouched texts follow future defaults.
 * A list whose length changed is stored whole.
 */
export function diffContent(base, value) {
  if (Array.isArray(base)) {
    if (!Array.isArray(value)) return undefined;
    if (value.length !== base.length) return value;
    const items = value.map((item, i) => diffContent(base[i], item));
    if (items.every(isEmpty)) return undefined;
    return items.map((item) => (isEmpty(item) ? (typeof base[0] === 'object' ? {} : '') : item));
  }
  if (base && typeof base === 'object') {
    const out = {};
    for (const key of Object.keys(value ?? {})) {
      const d = diffContent(base[key], value[key]);
      if (!isEmpty(d)) out[key] = d;
    }
    return Object.keys(out).length ? out : undefined;
  }
  if (typeof value !== typeof base || value === base) return undefined;
  return typeof value === 'string' && value.trim() === '' ? undefined : value;
}

/** Immutable set of `value` at a dotted path ("faq.items.2.q"). */
export function setPath(object, path, value) {
  const [head, ...rest] = path.split('.');
  const key = Array.isArray(object) ? Number(head) : head;
  const next = Array.isArray(object) ? [...object] : { ...object };
  next[key] = rest.length ? setPath(object?.[key] ?? {}, rest.join('.'), value) : value;
  return next;
}

export function getPath(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}
