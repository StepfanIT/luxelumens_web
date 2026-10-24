import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { copy, defaultCompany, defaultContacts } from './copy.js';
import { mergeContent } from '../shared/merge.js';
import { fetchSiteContent } from '../shared/firestore-rest.js';

const CACHE_KEY = 'luxe-site-content';
const ContentContext = createContext(null);

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function writeCache(value) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // Private mode or full storage: the page simply refetches next time.
  }
}

/** Default texts, with the admin's edits from Firestore laid over them. */
export function ContentProvider({ lang, children }) {
  const [remote, setRemote] = useState(readCache);

  useEffect(() => {
    const controller = new AbortController();
    fetchSiteContent(controller.signal)
      .then((data) => {
        setRemote(data);
        writeCache(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const value = useMemo(
    () => ({
      lang,
      t: mergeContent(copy[lang], remote?.[lang]),
      contacts: mergeContent(defaultContacts, remote?.contacts),
      company: mergeContent(defaultCompany, remote?.company),
      reviews: Array.isArray(remote?.reviews) ? remote.reviews.filter((review) => review?.name && (review.textPl || review.textEn)) : [],
    }),
    [lang, remote],
  );
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);

/** Links for the contacts the admin filled in; anything malformed is skipped. */
export function contactLinks(contacts) {
  const links = [];
  const digits = (value) => String(value ?? '').replace(/[^\d+]/g, '');
  const phone = digits(contacts.phone);
  if (phone.replace('+', '').length >= 9) links.push({ kind: 'phone', href: `tel:${phone}`, label: contacts.phone });
  const whatsapp = digits(contacts.whatsapp).replace('+', '');
  if (whatsapp.length >= 9) links.push({ kind: 'whatsapp', href: `https://wa.me/${whatsapp}`, label: contacts.whatsapp });
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacts.email ?? '')) {
    links.push({ kind: 'email', href: `mailto:${contacts.email}`, label: contacts.email });
  }
  for (const kind of ['instagram', 'facebook']) {
    const url = String(contacts[kind] ?? '').trim();
    if (/^https:\/\/(www\.)?(instagram|facebook)\.com\//i.test(url)) {
      const handle = url.replace(/^https:\/\/(www\.)?(instagram|facebook)\.com\//i, '').replace(/\/$/, '');
      links.push({ kind, href: url, label: handle ? `@${handle}` : kind });
    }
  }
  return links;
}
