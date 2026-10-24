import { Power } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { seasonalLook } from '../calendar.js';
import { useContent } from '../content.jsx';
import HouseCanvas from '../lights/HouseCanvas.jsx';
import { HERO_LOOKS, swatchStyle } from '../lights/looks.js';
import { reducedMotion, useScrollFrame } from '../motion.js';
import { Eyebrow, GhostButton, PrimaryButton } from '../ui/Button.jsx';
import { goTo } from './Nav.jsx';

// How long each scene plays while the hero shows them by itself.
const AUTO_MS = 3800;

/** Styled like the app's "Now playing" bar: the look, a power button, the looks. */
function LookPanel({ looks, look, power, auto, touched, onLook, onPower }) {
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
      <div className="mt-4 flex items-center justify-between gap-1" role="group" aria-label={t.hero.tryIt}>
        {looks.map((id) => (
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
            {auto && id === look && (
              <svg key={look} className="look-ring" viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="20" style={{ animationDuration: `${AUTO_MS}ms` }} />
              </svg>
            )}
          </button>
        ))}
      </div>
      {!touched && <p className="look-hint">{t.hero.hint}</p>}
    </div>
  );
}

export default function Hero() {
  const { t, marketing } = useContent();
  const seasonal = useMemo(() => seasonalLook(), []);
  const looks = useMemo(
    () => (seasonal && !HERO_LOOKS.includes(seasonal) ? [HERO_LOOKS[0], seasonal, ...HERO_LOOKS.slice(1)] : HERO_LOOKS),
    [seasonal],
  );
  // The seasonal scene goes first, warm white closes the round.
  const sequence = useMemo(() => {
    const rest = looks.filter((id) => id !== 'warm' && id !== seasonal);
    return [...(seasonal ? [seasonal] : []), ...rest, 'warm'];
  }, [looks, seasonal]);

  const [look, setLook] = useState('warm');
  const [power, setPower] = useState(true);
  const [lit, setLit] = useState(false);
  const [auto, setAuto] = useState(() => !reducedMotion());
  const [touched, setTouched] = useState(false);
  const [inView, setInView] = useState(true);
  const sectionRef = useRef(null);
  const step = useRef(-1);

  // If the canvas never lights (no images, no canvas), show the text anyway.
  useEffect(() => {
    const timer = setTimeout(() => setLit(true), 1600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!marketing.autoplay) setAuto(false);
  }, [marketing.autoplay]);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || !lit || !inView || !power) return undefined;
    const timer = setInterval(() => {
      step.current = (step.current + 1) % sequence.length;
      setLook(sequence[step.current]);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [auto, lit, inView, power, sequence]);

  useScrollFrame((y, h) => {
    const section = sectionRef.current;
    if (!section) return;
    section.style.setProperty('--away', Math.min(1, Math.max(0, y / (h * 0.9))).toFixed(4));
  });

  const stopDemo = () => {
    setAuto(false);
    setTouched(true);
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
        <LookPanel
          looks={looks}
          look={look}
          power={power}
          auto={auto && lit && power}
          touched={touched}
          onLook={(id) => {
            stopDemo();
            setLook(id);
            setPower(true);
          }}
          onPower={() => {
            stopDemo();
            setPower((on) => !on);
          }}
        />
      </div>

      <div className="hero-scroll hero-in" style={{ '--d': '1.3s' }} aria-hidden="true">
        <span>{t.hero.scroll}</span>
        <span className="hero-scroll-line" />
      </div>
    </section>
  );
}
