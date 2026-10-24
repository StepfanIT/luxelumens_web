import { Bluetooth, Users, Wifi } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useContent } from '../content.jsx';
import { screensFor } from '../screens.js';
import Phone from '../ui/Phone.jsx';
import Reveal, { Lines } from '../ui/Reveal.jsx';
import { Eyebrow } from '../ui/Button.jsx';
import StoreBadges from '../ui/StoreBadges.jsx';

// The stage behind the phone takes the colour of what each screen shows.
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
    <ul className="flex flex-wrap gap-2.5">
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

/** Desktop: the phone stands on a lit stage that holds still while the chapters scroll. */
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
    <div className="mt-14 hidden grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-12 lg:grid xl:gap-20">
      <div className="relative">
        <div className="app-stage" style={{ '--glow': GLOW[key] }}>
          <span className="app-stage-led" aria-hidden="true" />
          <Phone
            screens={chapters.map((chapter) => ({ src: screens[chapter.key] }))}
            active={active}
            glow={GLOW[key]}
            className="app-stage-phone"
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

/** Phones: swipeable slides, each with the whole phone on its own stage. */
function Slides({ chapters, screens }) {
  const [active, setActive] = useState(0);
  const rowRef = useRef(null);

  const onScroll = () => {
    const row = rowRef.current;
    if (!row) return;
    const center = row.scrollLeft + row.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    Array.from(row.children).forEach((slide, i) => {
      const d = Math.abs(slide.offsetLeft + slide.clientWidth / 2 - center);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive(best);
  };

  const go = (i) => {
    const slide = rowRef.current?.children[i];
    slide?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div className="lg:hidden">
      <div ref={rowRef} onScroll={onScroll} className="app-slides no-scrollbar" data-lenis-prevent>
        {chapters.map((chapter, i) => (
          <article key={chapter.key} className="app-slide">
            <div className="app-slide-stage" style={{ '--glow': GLOW[chapter.key] }}>
              <span className="app-stage-led" aria-hidden="true" />
              <Phone screens={[{ src: screens[chapter.key] }]} glow={GLOW[chapter.key]} style={{ '--w': 'min(50vw, 214px)' }} />
            </div>
            <p className="app-chapter-num mt-6">
              {String(i + 1).padStart(2, '0')}
              <span> / {String(chapters.length).padStart(2, '0')}</span>
            </p>
            <h3 className="mt-2 text-[1.55rem] font-semibold leading-[1.1] tracking-[-0.03em]">{chapter.title}</h3>
            <p className="mt-2.5 text-[15.5px] leading-relaxed text-mist">{chapter.text}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-1" role="tablist" aria-label="Slides">
        {chapters.map((chapter, i) => (
          <button
            key={chapter.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={chapter.title}
            onClick={() => go(i)}
            className="grid h-8 w-8 place-items-center"
          >
            <span className={`app-dot ${i === active ? 'is-active' : ''}`} />
          </button>
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
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow>{t.app.label}</Eyebrow>
            </Reveal>
            <Lines
              className="display mt-6 text-[clamp(2.6rem,6.2vw,5.6rem)]"
              lines={[t.app.title1, { text: t.app.title2, className: 'serif-accent' }]}
            />
          </div>
          <Reveal delay={0.15} className="max-w-sm lg:pb-3">
            <p className="text-body">{t.app.lead}</p>
            <StoreBadges className="mt-6" note />
          </Reveal>
        </div>
        <StickyStory chapters={chapters} screens={screens} label={t.app.label} />
      </div>
      <div className="mt-12">
        <Slides chapters={chapters} screens={screens} />
      </div>
      <div className="container-page mt-14 md:mt-20">
        <Badges />
      </div>
    </section>
  );
}
