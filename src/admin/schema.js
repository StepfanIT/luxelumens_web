// What the admin can edit on the page, section by section. Paths point into
// the copy (src/site/copy.js); each field is edited in Polish and English
// side by side. Lists with `fixed` keep their length (they are tied to
// screenshots or light looks); the FAQ can grow and shrink.

const f = (path, label, long = false) => ({ path, label, long });

export const SECTIONS = [
  {
    id: 'hero',
    title: 'Ekran startowy',
    hint: 'Pierwsze, co widzi odwiedzający: dom, nagłówek i przyciski.',
    fields: [
      f('hero.eyebrow', 'Nadtytuł'),
      f('hero.title1', 'Nagłówek — pierwsza linia'),
      f('hero.title2', 'Nagłówek — druga linia (złota kursywa)'),
      f('hero.lead', 'Opis pod nagłówkiem', true),
      f('hero.cta', 'Przycisk główny'),
      f('hero.cta2', 'Przycisk drugi'),
    ],
  },
  {
    id: 'manifesto',
    title: 'Manifest',
    hint: 'Duży tekst, który rozświetla się słowo po słowie.',
    fields: [
      f('manifesto.label', 'Etykieta'),
      f('manifesto.text', 'Tekst', true),
      f('manifesto.highlight', 'Słowa wyróżnione na złoto (oddzielone spacją)'),
    ],
  },
  {
    id: 'seasons',
    title: 'Rok okazji',
    hint: 'Dom zmienia światło wraz z przewijaniem. Kolory scen są stałe, teksty możesz zmienić.',
    fields: [f('seasons.label', 'Etykieta'), f('seasons.title', 'Nagłówek'), f('seasons.autopilot', 'Opis Autopilota', true)],
    lists: [
      {
        path: 'seasons.items',
        label: 'Okazje',
        fixed: true,
        item: [
          { key: 'date', label: 'Data' },
          { key: 'name', label: 'Nazwa' },
          { key: 'text', label: 'Opis', long: true },
        ],
      },
    ],
  },
  {
    id: 'app',
    title: 'Aplikacja',
    hint: 'Rozdziały odpowiadają kolejnym zrzutom ekranu z aplikacji.',
    fields: [
      f('app.label', 'Etykieta'),
      f('app.title1', 'Nagłówek — pierwsza linia'),
      f('app.title2', 'Nagłówek — druga linia (kursywa)'),
      f('app.lead', 'Opis', true),
    ],
    lists: [
      {
        path: 'app.chapters',
        label: 'Rozdziały',
        fixed: true,
        item: [
          { key: 'title', label: 'Tytuł' },
          { key: 'text', label: 'Opis', long: true },
        ],
      },
      { path: 'app.badges', label: 'Plakietki', fixed: true, item: [{ key: null, label: 'Tekst' }] },
    ],
  },
  {
    id: 'craft',
    title: 'Wykonanie (dzień i noc)',
    fields: [
      f('craft.label', 'Etykieta'),
      f('craft.dayTitle', 'Nagłówek dzienny'),
      f('craft.dayText', 'Opis dzienny', true),
      f('craft.nightTitle', 'Nagłówek nocny'),
      f('craft.nightText', 'Opis nocny', true),
      f('craft.specsTitle', 'Nagłówek liczb'),
      f('craft.weather', 'Zdanie o pogodzie'),
    ],
    lists: [
      { path: 'craft.parts', label: 'Opis rysunku (1–4)', fixed: true, item: [{ key: null, label: 'Element' }] },
      {
        path: 'craft.specs',
        label: 'Liczby',
        fixed: true,
        item: [
          { key: 'value', label: 'Wartość' },
          { key: 'label', label: 'Podpis' },
        ],
      },
    ],
  },
  {
    id: 'compare',
    title: 'Porównanie',
    fields: [
      f('compare.label', 'Etykieta'),
      f('compare.title', 'Nagłówek'),
      f('compare.them', 'Kolumna: lampki sezonowe'),
      f('compare.us', 'Kolumna: Luxe Lumens'),
    ],
    lists: [
      {
        path: 'compare.rows',
        label: 'Wiersze',
        fixed: true,
        item: [
          { key: 'label', label: 'Cecha' },
          { key: 'them', label: 'Lampki sezonowe' },
          { key: 'us', label: 'Luxe Lumens' },
        ],
      },
    ],
  },
  {
    id: 'process',
    title: 'Jak to działa',
    fields: [f('process.label', 'Etykieta'), f('process.title', 'Nagłówek')],
    lists: [
      {
        path: 'process.steps',
        label: 'Kroki',
        fixed: true,
        item: [
          { key: 'title', label: 'Tytuł' },
          { key: 'text', label: 'Opis', long: true },
        ],
      },
    ],
  },
  {
    id: 'faq',
    title: 'Pytania',
    fields: [
      f('faq.label', 'Etykieta'),
      f('faq.title', 'Nagłówek'),
      f('faq.more', 'Tekst pod nagłówkiem'),
      f('faq.ask', 'Link do formularza'),
    ],
    lists: [
      {
        path: 'faq.items',
        label: 'Pytania i odpowiedzi',
        item: [
          { key: 'q', label: 'Pytanie' },
          { key: 'a', label: 'Odpowiedź', long: true },
        ],
      },
    ],
  },
  {
    id: 'quote',
    title: 'Wycena (formularz)',
    fields: [
      f('quote.label', 'Etykieta'),
      f('quote.title1', 'Nagłówek — pierwsza linia'),
      f('quote.title2', 'Nagłówek — druga linia (kursywa)'),
      f('quote.lead', 'Opis', true),
      f('quote.direct', 'Nagłówek kontaktów'),
      f('quote.form.successTitle', 'Po wysłaniu — nagłówek'),
      f('quote.form.successText', 'Po wysłaniu — tekst', true),
    ],
    lists: [{ path: 'quote.perks', label: 'Zalety', fixed: true, item: [{ key: null, label: 'Tekst' }] }],
  },
  {
    id: 'footer',
    title: 'Stopka',
    fields: [f('footer.tagline', 'Opis firmy', true), f('footer.area', 'Obszar działania')],
  },
];

export const CONTACT_FIELDS = [
  { key: 'phone', label: 'Telefon', placeholder: '+48 600 000 000', type: 'tel' },
  { key: 'whatsapp', label: 'WhatsApp (numer)', placeholder: '+48 600 000 000', type: 'tel' },
  { key: 'email', label: 'E-mail', placeholder: 'kontakt@luxelumens.pl', type: 'email' },
  { key: 'instagram', label: 'Instagram (pełny link)', placeholder: 'https://instagram.com/luxe.lumens', type: 'url' },
  { key: 'facebook', label: 'Facebook (pełny link)', placeholder: 'https://facebook.com/luxelumens', type: 'url' },
];

export const COMPANY_FIELDS = [
  { key: 'name', label: 'Nazwa firmy', placeholder: 'Luxe Lumens Sp. z o.o.' },
  { key: 'address', label: 'Adres', placeholder: 'ul. Przykładowa 1, 30-001 Kraków' },
  { key: 'nip', label: 'NIP', placeholder: '000-000-00-00' },
  { key: 'email', label: 'E-mail w sprawie danych osobowych', placeholder: 'rodo@luxelumens.pl', type: 'email' },
];

export const STATUSES = [
  { key: 'new', label: 'Nowe', tone: 'gold' },
  { key: 'contacted', label: 'W kontakcie', tone: 'blue' },
  { key: 'quoted', label: 'Wycena wysłana', tone: 'violet' },
  { key: 'won', label: 'Zrealizowane', tone: 'green' },
  { key: 'lost', label: 'Bez realizacji', tone: 'gray' },
];

export const BUILDINGS = { house: 'Dom', terraced: 'Bliźniak / szeregowiec', business: 'Firma', other: 'Inny' };
