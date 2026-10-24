import { ArrowRight, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { nextPromoHoliday } from '../calendar.js';
import { useContent } from '../content.jsx';
import { goTo } from './Nav.jsx';

const KEY = 'luxe-promo-closed';

function wasClosed() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** A countdown to the next big holiday, like the app's "in 8 days" badges. */
export default function PromoBar() {
  const { t, marketing } = useContent();
  const [closed, setClosed] = useState(wasClosed);
  const holiday = useMemo(() => nextPromoHoliday(), []);
  const show = Boolean(marketing.promo && !closed && holiday);

  useEffect(() => {
    document.documentElement.style.setProperty('--promo-h', show ? '40px' : '0px');
  }, [show]);

  if (!show) return null;

  const fill = (text) => text.replace('{days}', String(holiday.days)).replace('{holiday}', t.promo.holidays[holiday.id] ?? '');
  const [first, ...rest] = fill(t.promo.text).split(/(?<=\.)\s+/);

  const close = () => {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      // Closed for this page view only.
    }
    setClosed(true);
  };

  return (
    <div className="promo" role="region" aria-label={first}>
      <div className="container-page flex h-full items-center justify-center gap-3">
        <span className="promo-led" aria-hidden="true" />
        <p className="min-w-0 truncate">
          <strong className="font-medium text-cream sm:hidden">{fill(t.promo.short)}</strong>
          <strong className="hidden font-medium text-cream sm:inline">{first}</strong>
          {rest.length > 0 && <span className="hidden text-cream/70 md:inline"> {rest.join(' ')}</span>}
        </p>
        <a href="#quote" onClick={goTo('quote')} className="promo-cta">
          <span className="sm:hidden">{t.promo.ctaShort}</span>
          <span className="hidden sm:inline">{t.promo.cta}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
        <button type="button" onClick={close} className="promo-close" aria-label={t.promo.close}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
