// Demo store: everything lives in this browser's localStorage, seeded with a
// few made-up requests, so the panel can be tried without Firebase.

const KEY = 'luxe-admin-demo';
const SITE_CACHE = 'luxe-site-content';

const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();

const SEED = {
  leads: [
    {
      id: 'demo1',
      name: 'Anna Kowalska',
      phone: '+48 600 100 200',
      email: 'anna.k@example.com',
      city: 'Kraków',
      building: 'house',
      length: 65,
      message: 'Chcemy podświetlić dom i garaż, najlepiej przed świętami.',
      when: 'holidays',
      source: 'instagram / bio · instagram.com',
      lang: 'pl',
      status: 'new',
      notes: '',
      createdAt: hoursAgo(2),
    },
    {
      id: 'demo2',
      name: 'Piotr Nowak',
      phone: '+48 501 222 333',
      email: '',
      city: 'Wieliczka',
      building: 'terraced',
      length: 30,
      message: '',
      when: 'month',
      source: 'Google Ads',
      lang: 'pl',
      status: 'new',
      notes: '',
      createdAt: hoursAgo(20),
    },
    {
      id: 'demo3',
      name: 'Emily Carter',
      phone: '+48 790 555 010',
      email: 'emily@example.com',
      city: 'Warszawa',
      building: 'house',
      length: 0,
      message: 'Is it possible to have different colours on the terrace?',
      when: 'flexible',
      source: 'google.com',
      lang: 'en',
      status: 'contacted',
      notes: 'Wysłała zdjęcia domu, oddzwonić w piątek.',
      createdAt: hoursAgo(50),
    },
    {
      id: 'demo4',
      name: 'Marta Wiśniewska',
      phone: '+48 512 400 900',
      email: 'marta.w@example.com',
      city: 'Niepołomice',
      building: 'house',
      length: 90,
      message: 'Duży dom z dwoma garażami.',
      lang: 'pl',
      status: 'quoted',
      notes: 'Wycena wysłana mailem.',
      createdAt: hoursAgo(120),
    },
    {
      id: 'demo5',
      name: 'Tomasz Zieliński',
      phone: '+48 698 777 123',
      email: '',
      city: 'Skawina',
      building: 'business',
      length: 140,
      message: 'Lokal usługowy, interesuje nas podświetlenie elewacji od ulicy.',
      lang: 'pl',
      status: 'won',
      notes: 'Montaż umówiony.',
      createdAt: hoursAgo(300),
    },
  ],
  content: null,
  gallery: [],
  admins: ['demo@luxelumens.pl'],
};

function read() {
  try {
    return { ...SEED, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { ...SEED };
  }
}

function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  emit();
}

const listeners = new Set();
const galleryListeners = new Set();
function emit() {
  const { leads, gallery } = read();
  listeners.forEach((fn) => fn(sortLeads(leads)));
  galleryListeners.forEach((fn) => fn(sortPhotos(gallery)));
}
const sortPhotos = (photos) => [...photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const sortLeads = (leads) => [...leads].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

export const demoStore = {
  mode: 'demo',
  user: { email: 'demo@luxelumens.pl', name: 'Demo' },
  onAuth(fn) {
    fn(this.user);
    return () => {};
  },
  async signOut() {
    window.location.href = window.location.pathname;
  },
  async checkAccess() {
    return true;
  },
  watchLeads(fn) {
    listeners.add(fn);
    fn(sortLeads(read().leads));
    const onStorage = (event) => event.key === KEY && emit();
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(fn);
      window.removeEventListener('storage', onStorage);
    };
  },
  async updateLead(id, patch) {
    const state = read();
    state.leads = state.leads.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead));
    write(state);
  },
  async deleteLead(id) {
    const state = read();
    state.leads = state.leads.filter((lead) => lead.id !== id);
    write(state);
  },
  async loadContent() {
    return read().content;
  },
  async saveContent(part) {
    const state = read();
    state.content = { ...(state.content ?? {}), ...part, updatedAt: new Date().toISOString() };
    write(state);
    // Let the page in this browser show the edits right away.
    localStorage.setItem(SITE_CACHE, JSON.stringify(state.content));
  },
  watchGallery(fn) {
    galleryListeners.add(fn);
    fn(sortPhotos(read().gallery));
    return () => galleryListeners.delete(fn);
  },
  async addPhoto(photo) {
    const state = read();
    state.gallery = [...state.gallery, { ...photo, id: `p${Date.now().toString(36)}`, createdAt: new Date().toISOString() }];
    try {
      write(state);
    } catch {
      throw new Error('Pamięć przeglądarki jest pełna — w trybie demo zmieści się tylko kilka zdjęć.');
    }
  },
  async updatePhoto(id, patch) {
    const state = read();
    state.gallery = state.gallery.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo));
    write(state);
  },
  async deletePhoto(id) {
    const state = read();
    state.gallery = state.gallery.filter((photo) => photo.id !== id);
    write(state);
  },
  async loadAdmins() {
    return read().admins;
  },
  async saveAdmins(emails) {
    const state = read();
    state.admins = emails;
    write(state);
  },
  reset() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(SITE_CACHE);
    emit();
  },
};
