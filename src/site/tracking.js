// Analytics and ad measurement, loaded only after the visitor agrees, and
// only when the admin panel has the IDs. Without both, nothing runs.

const CONSENT_KEY = 'luxe-consent';
const SOURCE_KEY = 'luxe-source';
let loaded = false;

export const validGa4 = (id) => /^G-[A-Z0-9]{4,16}$/.test(String(id ?? '').trim());
export const validPixel = (id) => /^\d{8,20}$/.test(String(id ?? '').trim());
export const trackingTools = (marketing) =>
  [validGa4(marketing.ga4) && 'Google Analytics', validPixel(marketing.pixel) && 'Meta Pixel'].filter(Boolean);

export function consent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Without storage the question simply comes back next visit.
  }
}

export function loadTracking(marketing) {
  if (loaded) return;
  loaded = true;
  const ga4 = String(marketing.ga4 ?? '').trim();
  const pixel = String(marketing.pixel ?? '').trim();
  if (validGa4(ga4)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // gtag.js reads the arguments object itself.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', ga4);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`;
    document.head.appendChild(script);
  }
  if (validPixel(pixel)) {
    // Meta's base code: a queue until fbevents.js arrives.
    const fbq = function fbq(...args) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = window.fbq || fbq;
    window._fbq = window._fbq || window.fbq;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
    window.fbq('init', pixel);
    window.fbq('track', 'PageView');
  }
}

/** A sent quote request, for ad campaigns that optimise for leads. */
export function trackLead() {
  if (!loaded) return;
  window.gtag?.('event', 'generate_lead');
  window.fbq?.('track', 'Lead');
}

/**
 * Where this visit came from (UTM tags, ad click IDs, referring site),
 * remembered for the session and sent with a quote request — no cookies.
 */
export function rememberSource() {
  try {
    if (sessionStorage.getItem(SOURCE_KEY) !== null) return;
    const params = new URLSearchParams(window.location.search);
    const parts = [];
    const utm = ['utm_source', 'utm_medium', 'utm_campaign'].map((key) => params.get(key)).filter(Boolean);
    if (utm.length) parts.push(utm.join(' / '));
    if (params.has('gclid')) parts.push('Google Ads');
    if (params.has('fbclid')) parts.push('Facebook / Instagram');
    const referrer = document.referrer ? new URL(document.referrer).hostname : '';
    if (referrer && referrer !== window.location.hostname) parts.push(referrer);
    sessionStorage.setItem(SOURCE_KEY, parts.join(' · ').slice(0, 300));
  } catch {
    // Storage blocked: the request just goes without a source.
  }
}

export function visitSource() {
  try {
    return sessionStorage.getItem(SOURCE_KEY) ?? '';
  } catch {
    return '';
  }
}
