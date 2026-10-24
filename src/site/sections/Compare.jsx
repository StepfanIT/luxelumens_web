import { Check, X } from 'lucide-react';
import { useContent } from '../content.jsx';
import { Eyebrow, PrimaryButton } from '../ui/Button.jsx';
import { goTo } from './Nav.jsx';
import { LogoMark } from '../ui/Logo.jsx';
import Reveal, { Lines } from '../ui/Reveal.jsx';

export default function Compare() {
  const { t } = useContent();
  const { compare } = t;
  return (
    <section id="compare" className="relative py-28 md:py-40">
      <div className="container-page">
        <Reveal>
          <Eyebrow>{compare.label}</Eyebrow>
        </Reveal>
        <Lines className="display mt-6 max-w-4xl text-[clamp(2.3rem,5.2vw,4.8rem)]" lines={[compare.title]} />

        <Reveal className="compare mt-14 md:mt-20" delay={0.1}>
          <div className="compare-us-col" aria-hidden="true" />
          <div className="compare-row compare-head">
            <span />
            <span className="compare-them">{compare.them}</span>
            <span className="compare-us">
              <LogoMark className="h-6 w-6" />
              {compare.us}
            </span>
          </div>
          {compare.rows.map((row) => (
            <div key={row.label} className="compare-row">
              <span className="compare-label">{row.label}</span>
              <span className="compare-them">
                <X className="compare-icon" aria-hidden="true" />
                <span>{row.them}</span>
              </span>
              <span className="compare-us">
                <Check className="compare-icon" aria-hidden="true" />
                <span>{row.us}</span>
              </span>
            </div>
          ))}
        </Reveal>

        <Reveal className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center md:mt-16" delay={0.1}>
          <PrimaryButton href="#quote" onClick={goTo('quote')}>
            {compare.cta}
          </PrimaryButton>
          <p className="text-mist">{compare.ctaNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
