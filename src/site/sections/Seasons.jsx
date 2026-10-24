import { Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { seasonalLook } from '../calendar.js';
import { useContent } from '../content.jsx';
import HouseCanvas from '../lights/HouseCanvas.jsx';
import { LOOKS } from '../lights/looks.js';
import { Eyebrow } from '../ui/Button.jsx';
import Reveal, { Lines } from '../ui/Reveal.jsx';

const accent = (id) => LOOKS[id]?.swatch?.[0] ?? '#efc57a';

/**
 * One card per occasion: the same house in that scene. Cards are stills until
 * pointed at (or, on phones, centred), then the effect plays.
 */
function SceneCard({ item, live, onLive }) {
  return (
    <article
      className={`scene-card ${live ? 'is-live' : ''}`}
      style={{ '--accent': accent(item.look) }}
      onPointerEnter={() => onLive(item.look)}
      onFocus={() => onLive(item.look)}
      tabIndex={0}
      aria-label={`${item.name}, ${item.date}`}
    >
      <div className="scene-card-media">
        <HouseCanvas
          look={item.look}
          animate={live}
          options={{ focusX: 0.56, focusY: 0.56, scale: 1.18 }}
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div className="scene-card-text">
        <p className="scene-card-date">{item.date}</p>
        <h3 className="scene-card-name">{item.name}</h3>
        <p className="scene-card-line">{item.text}</p>
      </div>
    </article>
  );
}

/** The same house for every occasion of the year, as a gallery of scenes. */
export default function Seasons() {
  const { t } = useContent();
  const items = t.seasons.items;
  const [live, setLive] = useState(() => seasonalLook() ?? 'christmas');
  const rowRef = useRef(null);

  // On phones the card in the middle of the swipe row is the live one.
  useEffect(() => {
    const row = rowRef.current;
    if (!row || !window.matchMedia('(max-width: 767px)').matches) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setLive(entry.target.dataset.look)),
      { root: row, threshold: 0.6 },
    );
    Array.from(row.children).forEach((cell) => io.observe(cell));
    return () => io.disconnect();
  }, [items.length]);

  return (
    <section id="seasons" className="relative py-28 md:py-36" aria-label={t.seasons.title}>
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow>{t.seasons.label}</Eyebrow>
            </Reveal>
            <Lines className="display mt-6 text-[clamp(2.3rem,5vw,4.6rem)]" lines={[t.seasons.title]} />
          </div>
          <Reveal delay={0.15} className="autopilot glass">
            <Sparkles className="h-4 w-4 shrink-0 text-gold-300" />
            <span>{t.seasons.autopilot}</span>
          </Reveal>
        </div>
      </div>

      <div ref={rowRef} className="scene-grid no-scrollbar mt-12 md:mt-16" data-lenis-prevent>
        {items.map((item) => (
          <div key={item.look} data-look={item.look} className="scene-cell">
            <SceneCard item={item} live={live === item.look} onLive={setLive} />
          </div>
        ))}
      </div>
    </section>
  );
}
