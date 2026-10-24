import { ArrowUp } from 'lucide-react';
import { contactLinks, useContent } from '../content.jsx';
import { scrollToTop, useInView } from '../motion.js';
import { trackingTools } from '../tracking.js';
import Logo from '../ui/Logo.jsx';
import StoreBadges from '../ui/StoreBadges.jsx';
import { OPEN_CONSENT } from './Consent.jsx';
import { LanguageSwitch, NAV_TARGETS, goTo } from './Nav.jsx';

export default function Footer({ onPrivacy }) {
  const { t, contacts, company, marketing } = useContent();
  const markRef = useInView({ threshold: 0.35 });
  const labels = { process: t.nav.how, app: t.nav.app, craft: t.nav.craft, faq: t.nav.faq };
  const links = contactLinks(contacts);
  const tracking = trackingTools(marketing).length > 0;
  return (
    <footer id="site-footer" className="site-footer relative overflow-hidden pt-24 md:pt-32">
      <div className="container-page grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-mist">{t.footer.tagline}</p>
          <p className="mt-2 text-[15px] text-mist">{t.footer.area}</p>
          <StoreBadges className="mt-7" />
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-col gap-3">
            {NAV_TARGETS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} onClick={goTo(id)} className="footer-link">
                  {labels[id]}
                </a>
              </li>
            ))}
            <li>
              <a href="#quote" onClick={goTo('quote')} className="footer-link text-gold-200">
                {t.nav.quote}
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <a
              key={link.kind}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="footer-link"
            >
              <span className="text-mist">{t.contact[link.kind]} · </span>
              {link.label}
            </a>
          ))}
          <LanguageSwitch className={links.length ? 'mt-3' : ''} />
        </div>
      </div>

      <div ref={markRef} className="footer-mark" aria-hidden="true">
        <span className="footer-led" />
        <span className="footer-word">Luxe Lumens</span>
      </div>

      <div className="container-page relative flex flex-col gap-4 border-t border-white/[0.08] py-7 text-sm text-mist sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {company.name}. {t.footer.rights}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button type="button" onClick={onPrivacy} className="hover:text-cream">
            {t.footer.privacy}
          </button>
          {tracking && (
            <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT))} className="hover:text-cream">
              {t.consent.settings}
            </button>
          )}
          <button type="button" onClick={scrollToTop} className="group inline-flex items-center gap-2 hover:text-cream">
            {t.footer.top}
            <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
