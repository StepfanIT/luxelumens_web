import { ArrowRight, Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { useContent } from '../content.jsx';
import { Eyebrow } from '../ui/Button.jsx';
import Reveal, { Lines } from '../ui/Reveal.jsx';
import { goTo } from './Nav.jsx';

function Item({ q, a, open, onToggle }) {
  const id = useId();
  return (
    <div className={`faq-item ${open ? 'is-open' : ''}`}>
      <h3>
        <button type="button" className="faq-question" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <span>{q}</span>
          <span className="faq-icon" aria-hidden="true">
            <Plus className="h-4 w-4" />
          </span>
        </button>
      </h3>
      <div id={id} className="faq-answer" role="region">
        <div>
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const { t } = useContent();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-28 md:py-40">
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <Eyebrow>{t.faq.label}</Eyebrow>
          </Reveal>
          <Lines className="display mt-6 text-[clamp(2.3rem,5vw,4.4rem)]" lines={[t.faq.title]} />
          <Reveal as="p" delay={0.15} className="text-body mt-6">
            {t.faq.more}{' '}
            <a href="#quote" onClick={goTo('quote')} className="group inline-flex items-center gap-1.5 text-cream underline-offset-4 hover:underline">
              {t.faq.ask}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>
        <Reveal className="faq-list" delay={0.1}>
          {t.faq.items.filter((item) => item?.q?.trim()).map((item, i) => (
            <Item key={`${item.q}-${i}`} q={item.q} a={item.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
