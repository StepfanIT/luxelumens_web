import { Bluetooth, Users, Wifi } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useContent } from '../content.jsx';
import { screensFor } from '../screens.js';
import Phone from '../ui/Phone.jsx';
import Reveal, { Lines } from '../ui/Reveal.jsx';
import { Eyebrow } from '../ui/Button.jsx';

// The light around the phone takes the colour of what each screen shows.
const GLOW = {
  home: 'rgba(231, 180, 100, 0.6)',
  scenes: 'rgba(255, 150, 70, 0.55)',
  effects: 'rgba(200, 90, 255, 0.5)',
  color: 'rgba(90, 140, 255, 0.5)',
  schedule: 'rgba(231, 180, 100, 0.55)',
  nowplaying: 'rgba(255, 170, 80, 0.6)',
};

const BADGE_ICONS = [Bluetooth, Wifi, Users];

function Badges() {
  const { t } = useContent();
  return (
    <ul className="mt-14 flex flex-wrap gap-2.5 md:mt-20">
      {t.app.badges.map((badge, i) => {
        const Icon = BADGE_ICONS[i] ?? Wifi;
        return (
          <Reveal as="li" key={badge} delay={i * 0.06} className="app-badge">
            <Icon className="h-4 w-4 text-gold-300" />
            {badge}
          </Reveal>
        );
      })}
    </ul>
  );
}

/** Desktop: the phone holds still while the chapters scroll past it. */
function StickyStory({ chapters, screens, label }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.index));
        });
      },
      { rootMargin: '-46% 0px -46% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [chapters.length]);

  const key = chapters[active]?.key ?? 'home';
  return (
    <div className="mt-10 hidden grid-cols-2 gap-10 lg:grid xl:gap-20">
      <div className="relative">
        <div className="app-sticky">
          <div className="app-halo" style={{ '--glow': GLOW[key] }} aria-hidden="true" />
          <Phone
            screens={chapters.map((chapter) => ({ src: screens[chapter.key] }))}
            active={active}
            glow={GLOW[key]}
            style={{ '--w': 'clamp(270px, 23vw, 330px)' }}
            label={label}
          />
          <div className="app-progress" aria-hidden="true">
            {chapters.map((chapter, i) => (
              <span key={chapter.key} className={i === active ? 'is-active' : ''} />
            ))}
          </div>
        </div>
      </div>
      <ol>
        {chapters.map((chapter, i) => (
          <li
            key={chapter.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className={`app-chapter ${i === active ? 'is-active' : ''}`}
          >
            <p className="app-chapter-num">
              {String(i + 1).padStart(2, '0')}
              <span> / {String(chapters.length).padStart(2, '0')}</span>
            </p>
            <h3 className="app-chapter-title">{chapter.title}</h3>
            <p className="app-chapter-text">{chapter.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Phones: swipeable cards, each with its screen rising from the bottom. */
function Cards({ chapters, screens }) {
  const [active, setActive] = useState(0);
  const rowRef = useRef(null);

  const onScroll = () => {
    const row = rowRef.current;
    if (!row) return;
    const cards = Array.from(row.children);
    const center = row.scrollLeft + row.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    cards.forEach((card, i) => {
      const d = Math.abs(card.offsetLeft + card.clientWidth / 2 - center);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive(best);
  };

  return (
    <div className="lg:hidden">
      <div ref={rowRef} onScroll={onScroll} className="app-cards no-scrollbar" data-lenis-prevent>
        {chapters.map((chapter, i) => (
          <article key={chapter.key} className="app-card" style={{ '--glow': GLOW[chapter.key] }}>
            <p className="app-chapter-num">{String(i + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 text-[1.6rem] font-semibold leading-[1.08] tracking-[-0.03em]">{chapter.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-mist">{chapter.text}</p>
            <div className="app-card-phone">
              <Phone screens={[{ src: screens[chapter.key] }]} glow={GLOW[chapter.key]} style={{ '--w': 'min(62vw, 250px)' }} />
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 flex justify-center gap-1.5" aria-hidden="true">
        {chapters.map((chapter, i) => (
          <span key={chapter.key} className={`app-dot ${i === active ? 'is-active' : ''}`} />
        ))}
      </div>
    </div>
  );
}

export default function AppStory() {
  const { t, lang } = useContent();
  const screens = useMemo(() => screensFor(lang), [lang]);
  const chapters = t.app.chapters.filter((chapter) => screens[chapter.key]);
  return (
    <section id="app" className="relative py-28 md:py-40">
      <div className="container-page">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <Reveal>
              <Eyebrow>{t.app.label}</Eyebrow>
            </Reveal>
            <Lines
              className="display mt-6 text-[clamp(2.6rem,6.2vw,5.6rem)]"
              lines={[t.app.title1, { text: t.app.title2, className: 'serif-accent' }]}
            />
          </div>
          <Reveal as="p" delay={0.15} className="text-body max-w-sm lg:pb-3">
            {t.app.lead}
          </Reveal>
        </div>
        <StickyStory chapters={chapters} screens={screens} label={t.app.label} />
      </div>
      <div className="mt-12">
        <Cards chapters={chapters} screens={screens} />
      </div>
      <div className="container-page">
        <Badges />
      </div>
    </section>
  );
}
