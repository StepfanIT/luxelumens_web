import { Power } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useContent } from '../content.jsx';
import HouseCanvas from '../lights/HouseCanvas.jsx';
import { HERO_LOOKS, swatchStyle } from '../lights/looks.js';
import { useScrollFrame } from '../motion.js';
import { Eyebrow, GhostButton, PrimaryButton } from '../ui/Button.jsx';
import { goTo } from './Nav.jsx';

/** Styled like the app's "Now playing" bar: the look, a power button, the looks. */
function LookPanel({ look, power, onLook, onPower }) {
  const { t } = useContent();
  return (
    <div className="look-panel glass hero-in" style={{ '--d': '1.05s' }}>
      <div className="flex items-center gap-3.5">
        <span className="look-thumb" style={swatchStyle(look)} aria-hidden="true">
          <span className={`look-thumb-shade ${power ? '' : 'is-off'}`} />
        </span>
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-mist">
            {power ? t.hero.playing : t.hero.off}
          </p>
          <p className="truncate text-[15.5px] font-medium tracking-[-0.01em] text-cream">{t.looks[look]}</p>
        </div>
        <button
          type="button"
          className={`power-button ${power ? 'is-on' : ''}`}
          onClick={onPower}
          aria-pressed={power}
          aria-label={power ? t.hero.turnOff : t.hero.turnOn}
        >
          <Power className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-1.5" role="group" aria-label={t.hero.tryIt}>
        {HERO_LOOKS.map((id) => (
          <button
            key={id}
            type="button"
            className={`look-dot ${id === look ? 'is-active' : ''}`}
            onClick={() => onLook(id)}
            aria-pressed={id === look}
            aria-label={t.looks[id]}
            title={t.looks[id]}
          >
            <span style={swatchStyle(id)} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useContent();
  const [look, setLook] = useState('warm');
  const [power, setPower] = useState(true);
  const [lit, setLit] = useState(false);
  const sectionRef = useRef(null);

  // If the canvas never lights (no images, no canvas), show the text anyway.
  useEffect(() => {
    const timer = setTimeout(() => setLit(true), 1600);
    return () => clearTimeout(timer);
  }, []);

  useScrollFrame((y, h) => {
    const section = sectionRef.current;
    if (!section) return;
    section.style.setProperty('--away', Math.min(1, Math.max(0, y / (h * 0.9))).toFixed(4));
  });

  const pickLook = (id) => {
    setLook(id);
    setPower(true);
  };

  return (
    <section id="top" ref={sectionRef} className={`hero ${lit ? 'is-lit' : ''}`} aria-label={t.hero.eyebrow}>
      <div className="hero-stage">
        <HouseCanvas
          look={look}
          power={power}
          intro
          introDelay={420}
          onLit={() => setLit(true)}
          options={{ focusX: 0.5, focusY: 0.6, ground: 0.84, zoom: 2.05 }}
          className="absolute inset-0 h-full w-full"
        />
        <div className="hero-shade" aria-hidden="true" />
      </div>
      <p className="sr-only">{t.hero.alt}</p>

      <div className="hero-content container-page">
        <div className="hero-copy">
          <div className="hero-in" style={{ '--d': '0.15s' }}>
            <Eyebrow>{t.hero.eyebrow}</Eyebrow>
          </div>
          <h1 className="hero-title">
            <span className="hero-line">
              <span className="hero-line-inner" style={{ '--d': '0.28s' }}>
                {t.hero.title1}
              </span>
            </span>
            <span className="hero-line">
              <span className="hero-line-inner serif-accent" style={{ '--d': '0.4s' }}>
                {t.hero.title2}
              </span>
            </span>
          </h1>
          <p className="hero-lead hero-in" style={{ '--d': '0.62s' }}>
            {t.hero.lead}
          </p>
          <div className="hero-actions hero-in" style={{ '--d': '0.78s' }}>
            <PrimaryButton href="#quote" onClick={goTo('quote')}>
              {t.hero.cta}
            </PrimaryButton>
            <GhostButton href="#seasons" onClick={goTo('seasons')}>
              {t.hero.cta2}
            </GhostButton>
          </div>
        </div>
        <LookPanel look={look} power={power} onLook={pickLook} onPower={() => setPower((on) => !on)} />
      </div>

      <div className="hero-scroll hero-in" style={{ '--d': '1.3s' }} aria-hidden="true">
        <span>{t.hero.scroll}</span>
        <span className="hero-scroll-line" />
      </div>
    </section>
  );
}
