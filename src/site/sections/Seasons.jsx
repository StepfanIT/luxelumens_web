import { Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { useContent } from '../content.jsx';
import HouseCanvas from '../lights/HouseCanvas.jsx';
import { LOOKS } from '../lights/looks.js';
import { stickyProgress, useScrollFrame } from '../motion.js';
import { Eyebrow } from '../ui/Button.jsx';

const STEP_VH = 56;

/** Text gradient in the look's own colours. */
function lookText(id) {
  const colors = LOOKS[id]?.swatch ?? ['#f4efe7'];
  const stops = colors.length > 1 ? colors : [colors[0], colors[0]];
  return { backgroundImage: `linear-gradient(100deg, ${stops.join(', ')})` };
}

function Timeline({ items, active, months }) {
  const item = items[active];
  const everyday = item.day === 0;
  const at = everyday ? 100 : (item.day / 365) * 100;
  const glow = LOOKS[item.look]?.swatch?.[0] ?? '#efc57a';
  return (
    <div className="timeline" style={{ '--at': `${at}%`, '--glow': glow }} aria-hidden="true">
      <div className="timeline-track">
        <div className={`timeline-fill ${everyday ? 'is-everyday' : ''}`} />
        {items.map((entry, i) =>
          entry.day === 0 ? null : (
            <span
              key={entry.look}
              className={`timeline-dot ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}
              style={{ left: `${(entry.day / 365) * 100}%` }}
            />
          ),
        )}
      </div>
      <div className="timeline-months">
        {months.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  );
}

/** One house through the year: the scroll walks the calendar, the roofline follows. */
export default function Seasons() {
  const { t } = useContent();
  const items = t.seasons.items;
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);

  useScrollFrame((y, h) => {
    const section = sectionRef.current;
    if (!section) return;
    const p = stickyProgress(section, h);
    setActive(Math.min(items.length - 1, Math.floor(p * items.length)));
    section.style.setProperty('--p', p.toFixed(4));
  });

  const item = items[active];
  return (
    <section
      id="seasons"
      ref={sectionRef}
      className="seasons relative"
      style={{ height: `calc(${items.length * STEP_VH}vh + 100svh)` }}
      aria-label={t.seasons.title}
    >
      <div className="seasons-stage">
        <HouseCanvas
          look={item.look}
          options={{ focusX: 0.52, focusY: 0.56, ground: 0.6, zoom: 1.9 }}
          className="absolute inset-0 h-full w-full"
        />
        <div className="seasons-shade" aria-hidden="true" />

        <div className="container-page relative z-[1] flex h-full flex-col pb-8 pt-24 md:pb-10 md:pt-28">
          <div className="max-w-xl">
            <Eyebrow>{t.seasons.label}</Eyebrow>
            <h2 className="display mt-4 text-[clamp(2rem,4.2vw,3.7rem)]">{t.seasons.title}</h2>
          </div>

          <div className="mt-auto flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div key={active} className="season-card" aria-live="polite">
              <p className={`season-date ${item.date.length > 6 ? 'is-long' : ''}`} style={lookText(item.look)}>
                {item.date}
              </p>
              <p className="season-name">{item.name}</p>
              <p className="season-text">{item.text}</p>
            </div>
            <div className="autopilot glass">
              <Sparkles className="h-4 w-4 shrink-0 text-gold-300" />
              <span>{t.seasons.autopilot}</span>
            </div>
          </div>

          <Timeline items={items} active={active} months={t.seasons.months} />
        </div>
      </div>
    </section>
  );
}
