import { MessageCircle, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { contactLinks, useContent } from '../content.jsx';
import { useScrollFrame } from '../motion.js';
import { PrimaryButton } from '../ui/Button.jsx';
import { goTo } from './Nav.jsx';

/** On phones: the quote button (and call / WhatsApp) always one thumb away. */
export default function MobileBar() {
  const { t, contacts } = useContent();
  const [shown, setShown] = useState(false);
  const covered = useRef(false);

  const update = () => setShown(window.scrollY > window.innerHeight * 0.85 && !covered.current);

  useEffect(() => {
    const targets = ['quote', 'site-footer'].map((id) => document.getElementById(id)).filter(Boolean);
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? seen.add(entry.target) : seen.delete(entry.target)));
      covered.current = seen.size > 0;
      update();
    });
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useScrollFrame(update);

  const links = contactLinks(contacts).filter((link) => link.kind === 'phone' || link.kind === 'whatsapp');
  return (
    <div className={`mobile-bar lg:hidden ${shown ? 'is-shown' : ''}`} aria-hidden={!shown}>
      <PrimaryButton href="#quote" onClick={goTo('quote')} className="h-[52px] flex-1 justify-between" tabIndex={shown ? 0 : -1}>
        {t.mobileBar.quote}
      </PrimaryButton>
      {links.map((link) => {
        const Icon = link.kind === 'phone' ? Phone : MessageCircle;
        return (
          <a
            key={link.kind}
            href={link.href}
            target={link.kind === 'whatsapp' ? '_blank' : undefined}
            rel="noreferrer"
            className="mobile-bar-icon"
            aria-label={link.kind === 'phone' ? t.mobileBar.call : t.mobileBar.whatsapp}
            tabIndex={shown ? 0 : -1}
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}
