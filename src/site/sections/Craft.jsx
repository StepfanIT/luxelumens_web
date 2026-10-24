import { CloudSnow, Moon, Sun } from 'lucide-react';
import { useRef } from 'react';
import { useContent } from '../content.jsx';
import { scrollToY, stickyProgress, useScrollFrame } from '../motion.js';
import { Eyebrow } from '../ui/Button.jsx';
import Reveal from '../ui/Reveal.jsx';
import CountUp from '../ui/CountUp.jsx';
import EaveDrawing from '../ui/EaveDrawing.jsx';

const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const hexRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, t, alphaA = 1, alphaB = 1) => {
  const [r1, g1, b1] = hexRgb(a);
  const [r2, g2, b2] = hexRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  const alpha = alphaA + (alphaB - alphaA) * t;
  return `rgba(${r}, ${g}, ${bl}, ${alpha.toFixed(3)})`;
};

const DUSK = '#1f2740';

// Day colours on the left, night on the right.
const PALETTE = {
  '--bg': ['#ede8df', '#050506'],
  '--fg': ['#1c1915', '#f4efe7'],
  '--muted': ['#5e5850', '#a39e96'],
  '--ink': ['#2a251f', '#f4efe7', 1, 0.2],
  '--wall': ['#e1d9ca', '#100f0d'],
  '--soffit': ['#d4cab8', '#16140f'],
  '--roof': ['#3d362e', '#0c0b0a'],
  '--hatch': ['#b7ab97', '#f4efe7', 1, 0.07],
  '--chip': ['#1c1915', '#f4efe7', 0.06, 0.08],
};

function Specs() {
  const { t } = useContent();
  return (
    <div className="container-page pb-28 pt-20 md:pb-40 md:pt-28">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <Reveal as="h3" className="display text-[clamp(2rem,4vw,3.4rem)]">
          {t.craft.specsTitle}
        </Reveal>
        <Reveal as="p" delay={0.1} className="flex items-center gap-2.5 text-mist">
          <CloudSnow className="h-5 w-5 text-gold-300" />
          {t.craft.weather}
        </Reveal>
      </div>
      <dl className="specs mt-10 md:mt-14">
        {t.craft.specs.map((spec, i) => (
          <Reveal key={spec.label} delay={(i % 3) * 0.08} className="spec">
            <dt className="order-2 mt-2 text-[15px] text-mist">{spec.label}</dt>
            <dd className="spec-value">
              <CountUp value={spec.value} />
            </dd>
          </Reveal>
        ))}
      </dl>
    </div>
  );
}

export default function Craft() {
  const { t } = useContent();
  const sectionRef = useRef(null);
  const stageRef = useRef(null);

  useScrollFrame((y, h) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const p = stickyProgress(section, h);
    const night = smooth((p - 0.24) / 0.52);
    // Day → blue hour → night, with the sunset glowing in between; text and
    // lines flip quickly so they never sit grey on grey.
    const bg =
      night < 0.5 ? mix(PALETTE['--bg'][0], DUSK, smooth(night * 2)) : mix(DUSK, PALETTE['--bg'][1], smooth(night * 2 - 1));
    const ink = smooth((night - 0.3) / 0.22);
    stage.style.setProperty('--night', night.toFixed(4));
    stage.style.setProperty('--sunset', Math.sin(Math.PI * night).toFixed(4));
    stage.style.setProperty('--day-copy', (1 - smooth((night - 0.16) / 0.2)).toFixed(3));
    stage.style.setProperty('--night-copy', smooth((night - 0.58) / 0.22).toFixed(3));
    for (const [name, [a, b, alphaA, alphaB]] of Object.entries(PALETTE)) {
      if (name !== '--bg') stage.style.setProperty(name, mix(a, b, ink, alphaA, alphaB));
    }
    stage.style.setProperty('--bg', bg);
    section.style.setProperty('--bg', bg);
    stage.dataset.night = night > 0.5 ? 'on' : 'off';
  });

  const jump = (toNight) => () => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const span = section.offsetHeight - window.innerHeight;
    scrollToY(top + span * (toNight ? 0.86 : 0.08));
  };

  return (
    <>
      <section id="craft" ref={sectionRef} className="craft relative" style={{ height: '220vh' }} aria-label={t.craft.label}>
        <div ref={stageRef} className="craft-stage" data-night="off">
          <div className="craft-sky" aria-hidden="true" />
          <div className="container-page relative grid h-full items-center gap-8 pb-8 pt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:py-0">
            <div className="relative">
              <Eyebrow tone="light" className="craft-eyebrow">
                {t.craft.label}
              </Eyebrow>
              <div className="craft-copy">
                <div className="craft-copy-day">
                  <h2 className="display text-[clamp(2.2rem,4.6vw,4.2rem)]">{t.craft.dayTitle}</h2>
                  <p className="craft-text">{t.craft.dayText}</p>
                </div>
                <div className="craft-copy-night" aria-hidden="true">
                  <h2 className="display text-[clamp(2.2rem,4.6vw,4.2rem)]">{t.craft.nightTitle}</h2>
                  <p className="craft-text">{t.craft.nightText}</p>
                </div>
              </div>
              <div className="daynight" role="group" aria-label={`${t.craft.day} / ${t.craft.night}`}>
                <button type="button" onClick={jump(false)} className="daynight-day">
                  <Sun className="h-4 w-4" />
                  {t.craft.day}
                </button>
                <button type="button" onClick={jump(true)} className="daynight-night">
                  <Moon className="h-4 w-4" />
                  {t.craft.night}
                </button>
                <span className="daynight-thumb" aria-hidden="true" />
              </div>
            </div>
            <figure className="craft-figure">
              <EaveDrawing />
              <figcaption>
                <ol className="craft-legend">
                  {t.craft.parts.map((part, i) => (
                    <li key={part}>
                      <span>{i + 1}</span>
                      {part}
                    </li>
                  ))}
                </ol>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
      <Specs />
    </>
  );
}
