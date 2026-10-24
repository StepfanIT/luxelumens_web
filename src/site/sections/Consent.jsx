import { useEffect, useState } from 'react';
import { useContent } from '../content.jsx';
import { consent, loadTracking, setConsent, trackingTools } from '../tracking.js';

export const OPEN_CONSENT = 'luxe:consent';

/**
 * Asks before any analytics or ad pixel runs — and only when the admin panel
 * has such IDs at all. "Cookie settings" in the footer brings it back.
 */
export default function Consent({ onPrivacy }) {
  const { t, marketing } = useContent();
  const tools = trackingTools(marketing);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!tools.length) return;
    const choice = consent();
    if (choice === 'granted') loadTracking(marketing);
    else if (choice === null) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tools.length, marketing.ga4, marketing.pixel]);

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT, reopen);
  }, []);

  if (!tools.length || !open) return null;

  const choose = (value) => {
    const before = consent();
    setConsent(value);
    setOpen(false);
    if (value === 'granted') loadTracking(marketing);
    // Scripts already running cannot be unloaded; a reload drops them.
    else if (before === 'granted') window.location.reload();
  };

  return (
    <div className="consent glass" role="dialog" aria-live="polite" aria-label={t.consent.settings}>
      <p className="text-[14px] leading-relaxed text-cream/90">
        {t.consent.text}{' '}
        <button type="button" onClick={onPrivacy} className="underline underline-offset-4 hover:text-gold-200">
          {t.consent.more}
        </button>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => choose('granted')} className="btn-primary h-10 flex-1 justify-center px-5 text-sm">
          {t.consent.accept}
        </button>
        <button type="button" onClick={() => choose('denied')} className="btn-ghost h-10 flex-1 justify-center px-5 text-sm">
          {t.consent.reject}
        </button>
      </div>
    </div>
  );
}
