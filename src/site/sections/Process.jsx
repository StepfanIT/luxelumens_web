import { useRef } from 'react';
import { useContent } from '../content.jsx';
import { passProgress, useScrollFrame } from '../motion.js';
import { Eyebrow, PrimaryButton } from '../ui/Button.jsx';
import Reveal, { Lines } from '../ui/Reveal.jsx';
import { goTo } from './Nav.jsx';

/** Four steps on a line of light that fills in as the visitor reads. */
export default function Process() {
  const { t } = useContent();
  const steps = t.process.steps;
  const listRef = useRef(null);

  useScrollFrame((y, h) => {
    const list = listRef.current;
    if (!list) return;
    const p = passProgress(list, h, { from: 0.85, to: 0.55 });
    list.style.setProperty('--fill', p.toFixed(4));
    Array.from(list.children).forEach((item, i) => {
      item.classList.toggle('is-lit', p >= (i + 0.15) / steps.length || p >= 0.999);
    });
  });

  return (
    <section id="process" className="relative py-28 md:py-40">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <Reveal>
              <Eyebrow>{t.process.label}</Eyebrow>
            </Reveal>
            <Lines className="display mt-6 text-[clamp(2.3rem,5vw,4.6rem)]" lines={[t.process.title]} />
          </div>
        </div>
        <ol ref={listRef} className="steps mt-16 md:mt-24" style={{ '--count': steps.length }}>
          {steps.map((step, i) => (
            <li key={step.title} className="step">
              <span className="step-node" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-text">{step.text}</p>
            </li>
          ))}
        </ol>
        <Reveal className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center md:mt-20">
          <PrimaryButton href="#quote" onClick={goTo('quote')}>
            {t.process.cta}
          </PrimaryButton>
          <p className="text-mist">{t.process.ctaNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
