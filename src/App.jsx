import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  Instagram,
  Layers3,
  Menu,
  MessageCircle,
  Moon,
  Palette,
  Phone,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Timer,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const heroImage =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=86';

const galleryImages = [
  {
    title: 'Ciepła elewacja',
    label: 'Ciepła biel',
    src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=82',
  },
  {
    title: 'Scena świąteczna',
    label: 'Tryb świąteczny',
    src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=82',
  },
  {
    title: 'Podświetlenie tarasu',
    label: 'Strefa zewnętrzna',
    src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=82',
  },
  {
    title: 'Strefa wejścia',
    label: 'Bezpieczeństwo',
    src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=82',
  },
];

const navLinks = [
  ['Rozwiązania', '#solutions'],
  ['Możliwości', '#features'],
  ['Proces', '#process'],
  ['Galeria', '#gallery'],
  ['Kontakt', '#contact'],
];

const benefits = [
  {
    icon: Palette,
    title: '16M+ kolorów',
    text: 'Od miękkiej bieli po wyraziste sceny na święta, spotkania i podświetlenie elewacji.',
  },
  {
    icon: Sun,
    title: 'Ciepła biel 2700K',
    text: 'Nie agresywny neon, tylko eleganckie światło architektoniczne do codziennego użycia.',
  },
  {
    icon: Droplets,
    title: 'Gotowe na pogodę',
    text: 'System jest przygotowany na deszcz, śnieg, mróz i stały montaż na zewnątrz budynku.',
  },
  {
    icon: Smartphone,
    title: 'Sterowanie z telefonu',
    text: 'Sceny, harmonogramy, jasność i strefy obsługujesz bez dodatkowych pilotów.',
  },
];

const solutions = [
  {
    title: 'Stałe oświetlenie elewacji',
    text: 'Dyskretna linia pod podbitką, która podkreśla architekturę domu i nie wygląda jak sezonowa girlanda.',
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=82',
  },
  {
    title: 'Święta bez drabiny',
    text: 'Boże Narodzenie, Halloween, majówka czy urodziny: odpowiednia scena włącza się w aplikacji.',
    image:
      'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=900&q=82',
  },
  {
    title: 'Taras i ogród',
    text: 'Ciepłe światło konturowe na wieczory na zewnątrz, bez ostrych reflektorów i prześwietlonych okien.',
    image:
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=900&q=82',
  },
];

const appFeatures = [
  ['Strefy domu', 'Osobno elewacja, garaż, wejście i taras.'],
  ['Harmonogramy', 'Automatyczne włączanie po zachodzie słońca.'],
  ['Gotowe sceny', 'Święta, ciepły wieczór, bezpieczeństwo i dzień meczu.'],
  ['Jasność', 'Od delikatnej linii po wyraziste podświetlenie.'],
];

const process = [
  {
    icon: Phone,
    title: 'Konsultacja',
    text: 'Ustalamy typ elewacji, preferencje kolorystyczne i cel: estetyka, święta, bezpieczeństwo albo wszystko naraz.',
  },
  {
    icon: Layers3,
    title: 'Plan światła',
    text: 'Dobieramy trasy, strefy i kolor profilu, aby system był dyskretny w dzień i efektowny wieczorem.',
  },
  {
    icon: Zap,
    title: 'Montaż',
    text: 'Montujemy kontroler, linie LED i prowadzimy okablowanie tak, aby nie tworzyć wizualnego chaosu.',
  },
  {
    icon: CheckCircle2,
    title: 'Konfiguracja',
    text: 'Podłączamy aplikację, pokazujemy sceny, harmonogramy i podstawowe ustawienia do codziennego użycia.',
  },
];

const featureCards = [
  {
    icon: ShieldCheck,
    title: '5 lat gwarancji',
    text: 'System jest projektowany do stałego montażu zewnętrznego, a nie jako dekoracja na jeden sezon.',
  },
  {
    icon: Timer,
    title: 'Do 50 000 godzin',
    text: 'Długi czas pracy modułów LED przy regularnym, wieczornym użytkowaniu.',
  },
  {
    icon: BadgeCheck,
    title: 'Profil pod elewację',
    text: 'Kolor profilu dobieramy do podbitki, więc system nie przyciąga uwagi w ciągu dnia.',
  },
  {
    icon: Moon,
    title: 'Sceny na cały rok',
    text: 'Ciepłe światło na co dzień, kolorowe sceny na święta i miękkie podświetlenie dla bezpieczeństwa.',
  },
];

const testimonials = [
  {
    name: 'Marta K.',
    text: 'Najbardziej podoba mi się to, że w dzień system jest prawie niewidoczny. Wieczorem dom wygląda zupełnie inaczej.',
  },
  {
    name: 'Adam R.',
    text: 'Zamiast co roku montować lampki, po prostu otwieramy aplikację. Na święta to ogromna wygoda.',
  },
  {
    name: 'Karolina S.',
    text: 'Trybu ciepłej bieli używamy prawie codziennie. Kolory włączamy tylko na okazje, więc całość wygląda elegancko.',
  },
];

function Logo({ light = false }) {
  return (
    <a href="#top" className="group flex items-center gap-3" aria-label="Luxe Lumens">
      <span
        className={`grid h-11 w-11 place-items-center rounded-2xl border ${
          light
            ? 'border-white/20 bg-white/10 text-white'
            : 'border-skybrand/15 bg-white text-skybrand shadow-soft'
        }`}
      >
        <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden="true">
          <path
            d="M11 31V8h5v18h13v5H11Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path
            d="M20 24V8h5v11h8v5H20Z"
            fill="currentColor"
            opacity="0.58"
          />
          <path
            d="M8 34h24"
            stroke={light ? '#f7c873' : '#0eaec3'}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="leading-none">
        <span
          className={`block text-[1.02rem] font-extrabold uppercase tracking-[0.18em] ${
            light ? 'text-white' : 'text-ink'
          }`}
        >
          Luxe
        </span>
        <span
          className={`mt-1 block text-[0.68rem] font-bold uppercase tracking-[0.34em] ${
            light ? 'text-butter' : 'text-skybrand'
          }`}
        >
          Lumens
        </span>
      </span>
    </a>
  );
}

function SectionIntro({ eyebrow, title, text, align = 'center', tone = 'light' }) {
  const dark = tone === 'dark';

  return (
    <div className={align === 'left' ? 'max-w-2xl' : 'mx-auto max-w-3xl text-center'}>
      <p
        className={`text-sm font-extrabold uppercase tracking-[0.22em] ${
          dark ? 'text-butter' : 'text-skybrand'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-3xl font-extrabold tracking-tight md:text-5xl ${
          dark ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      {text ? (
        <p className={`mt-5 text-base leading-8 md:text-lg ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
          {text}
        </p>
      ) : null}
    </div>
  );
}

function ThemeToggle({ theme, onThemeChange }) {
  return (
    <div className="theme-toggle" aria-label="Wybór motywu">
      <button
        type="button"
        className={theme === 'light' ? 'active' : ''}
        onClick={() => onThemeChange('light')}
        aria-pressed={theme === 'light'}
      >
        <Sun className="h-4 w-4" />
        Jasny
      </button>
      <button
        type="button"
        className={theme === 'gold' ? 'active' : ''}
        onClick={() => onThemeChange('gold')}
        aria-pressed={theme === 'gold'}
      >
        <Moon className="h-4 w-4" />
        Złoty
      </button>
    </div>
  );
}

function Header({ theme, onThemeChange }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/88 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo light={theme === 'gold'} />
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-bold text-slate-600 transition hover:text-skybrand"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
          <a
            href="tel:+48123456789"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-ink shadow-sm transition hover:border-skybrand/30 hover:text-skybrand"
          >
            <Phone className="h-4 w-4" />
            +48 123 456 789
          </a>
          <a
            href="#contact"
            className="rounded-full bg-ink px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:bg-skybrand"
          >
            Wycena
          </a>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-ink lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navLinks.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-2xl px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
            <a
              href="#contact"
              className="mt-2 rounded-2xl bg-ink px-4 py-3 text-center font-extrabold text-white"
            onClick={() => setOpen(false)}
          >
              Umów konsultację
            </a>
            <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-porcelain pt-28">
      <div className="absolute inset-0 bg-grid bg-[size:28px_28px]" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-28 lg:pt-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-skybrand/20 bg-white px-4 py-2 text-sm font-extrabold text-skybrand shadow-sm">
            <Sparkles className="h-4 w-4" />
            Stałe oświetlenie zewnętrzne
          </div>
          <h1 className="mt-7 max-w-4xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Stałe oświetlenie elewacji, które wygląda elegancko w dzień i po zmroku
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Luxe Lumens podkreśla architekturę domu, tworzy sceny na święta i
            steruje się z telefonu. Bez sezonowych girland, widocznych przewodów
            i przypadkowego efektu dekoracji.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-skybrand px-6 py-4 text-base font-extrabold text-white shadow-soft transition hover:bg-navy"
            >
              Oblicz koszt projektu
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#gallery"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-4 text-base font-extrabold text-ink transition hover:border-skybrand/40 hover:text-skybrand"
            >
              Zobacz realizacje
              <Play className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            {[
              ['5 lat', 'gwarancji'],
              ['50k h', 'żywotność LED'],
              ['2700K', 'ciepła biel'],
            ].map(([value, label]) => (
              <div key={value} className="border-l border-slate-200 pl-4">
                <div className="text-2xl font-extrabold text-ink">{value}</div>
                <div className="mt-1 text-sm font-semibold text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] bg-ink shadow-lift">
            <img
              src={heroImage}
              alt="Nowoczesny dom z wieczornym oświetleniem elewacji"
              className="h-[520px] w-full object-cover image-mask"
            />
            <div className="absolute inset-x-8 top-8 rounded-full border border-white/16 bg-white/12 p-2 backdrop-blur-md">
              <div className="light-track h-3 rounded-full" />
            </div>
            <div className="absolute bottom-6 left-6 right-6 grid gap-3 rounded-[1.5rem] bg-white/92 p-5 shadow-soft backdrop-blur-md sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-skybrand">
                  Tryb architektoniczny
                </p>
                <p className="mt-2 text-xl font-extrabold text-ink">
                  Ciepła linia na elewacji, kolory tylko wtedy, gdy są potrzebne
                </p>
              </div>
              <div className="flex items-center gap-2">
                {['#f7c873', '#ffffff', '#0eaec3', '#1566d1', '#ef476f'].map((color) => (
                  <span
                    key={color}
                    className="h-8 w-8 rounded-full border border-slate-200 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -right-4 top-20 hidden rounded-3xl bg-white p-4 shadow-soft xl:block">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-skybrand/10 text-skybrand">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Autoscena</p>
                <p className="font-extrabold text-ink">Zachód słońca 20:41</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {benefits.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-skybrand/10 text-skybrand">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-extrabold text-ink">{title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Solutions() {
  return (
    <section id="solutions" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionIntro
          eyebrow="Rozwiązania"
          title="Światło, które nie wygląda jak tymczasowa dekoracja"
          text="Najważniejsza różnica nie tkwi w liczbie kolorów, lecz w tym, jak system zachowuje się na co dzień: czysta elewacja w dzień, kontrolowany nastrój wieczorem."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {solutions.map((item) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-5 top-5 h-2 rounded-full bg-white/80 shadow-[0_0_28px_rgba(247,200,115,0.8)]" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-extrabold text-ink">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
                <a
                  href="#contact"
                  className="mt-5 inline-flex items-center gap-2 font-extrabold text-skybrand"
                >
                  Dobierz rozwiązanie
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppControl() {
  return (
    <section id="features" className="overflow-hidden bg-porcelain py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionIntro
            align="left"
            eyebrow="Sterowanie"
            title="Z telefonu, bez dodatkowych pilotów i skomplikowanych instrukcji"
            text="Logika jest prosta: wybierasz strefę, scenę, jasność albo harmonogram. To ma być narzędzie dla domu, nie kolejny techniczny problem."
          />
          <div className="mt-8 grid gap-3">
            {appFeatures.map(([title, text]) => (
              <div
                key={title}
                className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua/10 text-aqua">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink">{title}</h3>
                  <p className="mt-1 leading-7 text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="rounded-[2rem] bg-ink p-4 shadow-lift">
            <div className="rounded-[1.5rem] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-skybrand">
                    Aplikacja Luxe
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold text-ink">Wieczorna elewacja</h3>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-skybrand text-white">
                  <Wand2 className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-3xl">
                <img
                  src="https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=1100&q=82"
                  alt="Dom z wieczornym oświetleniem architektonicznym"
                  className="h-72 w-full object-cover"
                />
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-ink">Jasność</span>
                  <span className="font-bold text-skybrand">68%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-slate-100">
                  <div className="h-3 w-[68%] rounded-full bg-gradient-to-r from-butter via-aqua to-skybrand" />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ['Codziennie', '#f7c873'],
                  ['Święto', '#1566d1'],
                  ['Bezpieczeństwo', '#0eaec3'],
                ].map(([label, color]) => (
                  <button
                    key={label}
                    type="button"
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
                  >
                    <span
                      className="block h-8 w-8 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="mt-3 block text-sm font-extrabold text-ink">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 -left-4 hidden rounded-3xl bg-white p-5 shadow-soft md:block">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-skybrand" />
              <span className="font-extrabold text-ink">Harmonogram aktywny</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionIntro
          eyebrow="Korzyści"
          title="Mniej wizualnego hałasu, więcej zaufania do produktu"
          text="Strona ma sprzedawać nie samą taśmę LED, lecz poczucie dopracowanego domu: czysty montaż, długą żywotność i proste sterowanie."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-ink">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="bg-ink py-20 text-white lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionIntro
            align="left"
            tone="dark"
            eyebrow="Proces"
            title="Od zgłoszenia do pierwszej sceny bez zbędnego zamieszania"
            text="Dobry serwis daje klientowi jasność na każdym kroku. Dlatego proces jest pokazany osobno, tak jak w mocnych stronach produktowych."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {process.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="rounded-3xl border border-white/12 bg-white/[0.06] p-6">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-skybrand">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-extrabold text-butter">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section id="gallery" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionIntro
          eyebrow="Galeria"
          title="Elewacja, która wygląda naturalnie, a nie jak reklamowy baner"
          text="Tu najlepiej działają konkretne, czytelne zdjęcia domów. Klient od razu widzi produkt, zamiast domyślać się go z abstrakcyjnych neonowych grafik."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {galleryImages.map((item, index) => (
            <article
              key={item.title}
              className={`group relative overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-sm ${
                index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <img
                src={item.src}
                alt={item.title}
                className="h-80 w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/82 via-ink/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-sm font-bold text-butter">{item.label}</p>
                <h3 className="mt-1 text-2xl font-extrabold text-white">{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-porcelain py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionIntro
            align="left"
            eyebrow="Zaufanie"
            title="Strona powinna brzmieć jak realni ludzie, nie jak szablon reklamowy"
          />
          <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 shadow-sm">
            {[1, 2, 3, 4, 5].map((item) => (
              <Star key={item} className="h-5 w-5 fill-butter text-butter" />
            ))}
            <span className="ml-2 text-sm font-extrabold text-ink">Miejsce na prawdziwe opinie</span>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="leading-8 text-slate-700">“{item.text}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-skybrand/10 font-extrabold text-skybrand">
                  {item.name[0]}
                </div>
                <div>
                  <p className="font-extrabold text-ink">{item.name}</p>
                  <p className="text-sm font-semibold text-slate-500">Właściciel domu</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-[2rem] bg-ink p-8 text-white lg:p-10">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-butter">
            Zapytanie
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
            Pokażemy, jak może wyglądać światło na Twoim domu
          </h2>
          <p className="mt-5 max-w-xl leading-8 text-slate-300">
            Zostaw kontakt, a ustalimy typ elewacji, długość linii, sceny i
            sposób montażu. Bez agresywnej sprzedaży, po prostu konkretna
            rozmowa o zadaniu.
          </p>
          <div className="mt-10 grid gap-5">
            <a href="tel:+48123456789" className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-butter">
                <Phone className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-extrabold">+48 123 456 789</span>
                <span className="text-sm text-slate-300">Viber, Telegram, WhatsApp</span>
              </span>
            </a>
            <a href="https://www.instagram.com/" className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-butter">
                <Instagram className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-extrabold">@luxe.lumens</span>
                <span className="text-sm text-slate-300">Realizacje i sceny świetlne</span>
              </span>
            </a>
          </div>
        </div>

        <form className="rounded-[2rem] border border-slate-200 bg-porcelain p-6 shadow-soft lg:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-extrabold text-ink">Imię</span>
              <input
                type="text"
                placeholder="Na przykład Jan"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-skybrand focus:ring-4 focus:ring-skybrand/10"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-extrabold text-ink">Telefon</span>
              <input
                type="tel"
                placeholder="+48"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-skybrand focus:ring-4 focus:ring-skybrand/10"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-extrabold text-ink">Typ obiektu</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-skybrand focus:ring-4 focus:ring-skybrand/10">
                <option>Dom jednorodzinny</option>
                <option>Szeregowiec</option>
                <option>Elewacja komercyjna</option>
                <option>Taras lub ogród</option>
              </select>
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-extrabold text-ink">
                Co chcesz podświetlić?
              </span>
              <textarea
                rows="5"
                placeholder="Elewacja, garaż, wejście, taras, sceny świąteczne..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-skybrand focus:ring-4 focus:ring-skybrand/10"
              />
            </label>
          </div>
          <button
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-skybrand px-6 py-4 font-extrabold text-white shadow-soft transition hover:bg-navy"
          >
            Wyślij zapytanie
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mt-4 text-center text-sm font-semibold text-slate-500">
            Skontaktujemy się w ciągu dnia roboczego
          </p>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
            Stałe oświetlenie LED elewacji dla domów, świąt i codziennego
            wieczornego komfortu.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="tel:+48123456789"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-3 text-sm font-extrabold hover:bg-white/10"
          >
            <Phone className="h-4 w-4" />
            Zadzwoń
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-3 text-sm font-extrabold hover:bg-white/10"
          >
            <MessageCircle className="h-4 w-4" />
            Napisz
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.localStorage.getItem('luxe-lumens-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('luxe-lumens-theme', theme);
  }, [theme]);

  return (
    <main data-theme={theme}>
      <Header theme={theme} onThemeChange={setTheme} />
      <Hero />
      <Benefits />
      <Solutions />
      <AppControl />
      <Features />
      <Process />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
