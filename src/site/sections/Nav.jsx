import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { contactLinks, useContent } from '../content.jsx';
import { lockScroll, scrollToId, useScrollFrame } from '../motion.js';
import Logo from '../ui/Logo.jsx';
import { PrimaryButton } from '../ui/Button.jsx';

export const NAV_TARGETS = ['process', 'app', 'craft', 'faq'];

/** Link to the same page in the other language. */
export function languageHref(lang, target) {
  if (lang === target) return '#top';
  return target === 'en' ? './en/' : '../';
}

export function LanguageSwitch({ className = '' }) {
  const { lang, t } = useContent();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t.nav.language}>
      {['pl', 'en'].map((code) => (
        <a
          key={code}
          href={languageHref(lang, code)}
          hrefLang={code}
          lang={code}
          aria-current={code === lang ? 'true' : undefined}
          className={code === lang ? 'is-active' : ''}
        >
          {code.toUpperCase()}
        </a>
      ))}
    </div>
  );
}

/** Scrolls smoothly to a section instead of jumping. */
export const goTo = (id, after) => (event) => {
  event.preventDefault();
  after?.();
  scrollToId(id);
};

export default function Nav() {
  const { t, contacts } = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useScrollFrame((y) => setScrolled(y > 24));

  useEffect(() => {
    lockScroll(open);
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const labels = { process: t.nav.how, app: t.nav.app, craft: t.nav.craft, faq: t.nav.faq };
  const close = () => setOpen(false);

  return (
    <header className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <a href="#top" onClick={goTo('top')} aria-label="Luxe Lumens" className="shrink-0">
          <Logo />
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_TARGETS.map((id) => (
            <a key={id} href={`#${id}`} onClick={goTo(id)} className="nav-link">
              {labels[id]}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitch className="hidden sm:flex" />
          <PrimaryButton href="#quote" onClick={goTo('quote')} className="nav-cta hidden sm:inline-flex">
            {t.nav.quote}
          </PrimaryButton>
          <button
            type="button"
            className="menu-button lg:hidden"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={t.nav.menu}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open} data-lenis-prevent>
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <button type="button" className="menu-button" onClick={close} aria-label={t.nav.close} tabIndex={open ? 0 : -1}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="container-page mt-8 flex flex-col" aria-label="Mobile">
          {NAV_TARGETS.map((id, i) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={goTo(id, close)}
              className="mobile-link"
              style={{ '--d': `${0.06 + i * 0.05}s` }}
              tabIndex={open ? 0 : -1}
            >
              {labels[id]}
            </a>
          ))}
        </nav>
        <div className="container-page mt-auto pb-10">
          <PrimaryButton href="#quote" onClick={goTo('quote', close)} className="w-full justify-between" tabIndex={open ? 0 : -1}>
            {t.nav.quote}
          </PrimaryButton>
          <div className="mt-6 flex items-center justify-between gap-4">
            <LanguageSwitch />
            <div className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-sm text-mist">
              {contactLinks(contacts).slice(0, 2).map((link) => (
                <a key={link.kind} href={link.href} tabIndex={open ? 0 : -1} className="hover:text-cream">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
