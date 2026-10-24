import { ExternalLink, FileText, Images, Inbox, LogOut, Megaphone, MessageSquareQuote, Phone, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { emulatorHost, hasFirebaseConfig } from '../shared/firebase.js';
import { LogoMark } from '../site/ui/Logo.jsx';
import Access from './pages/Access.jsx';
import Contacts from './pages/Contacts.jsx';
import Content from './pages/Content.jsx';
import Gallery from './pages/Gallery.jsx';
import Leads from './pages/Leads.jsx';
import Marketing from './pages/Marketing.jsx';
import Reviews from './pages/Reviews.jsx';
import { demoStore } from './store/demo.js';
import { Button, Card, Spinner, TextInput, ToastProvider } from './ui.jsx';

const PAGES = [
  { id: 'leads', label: 'Zgłoszenia', icon: Inbox, Page: Leads },
  { id: 'content', label: 'Treści strony', icon: FileText, Page: Content },
  { id: 'gallery', label: 'Realizacje', icon: Images, Page: Gallery },
  { id: 'reviews', label: 'Opinie', icon: MessageSquareQuote, Page: Reviews },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, Page: Marketing },
  { id: 'contacts', label: 'Kontakt i aplikacja', icon: Phone, Page: Contacts },
  { id: 'access', label: 'Dostęp', icon: ShieldCheck, Page: Access },
];

const AUTH_ERRORS = {
  'auth/popup-closed-by-user': 'Logowanie zostało przerwane.',
  'auth/cancelled-popup-request': 'Logowanie zostało przerwane.',
  'auth/popup-blocked': 'Przeglądarka zablokowała okno logowania. Zezwól na wyskakujące okna.',
  'auth/invalid-credential': 'Nieprawidłowy e-mail lub hasło.',
  'auth/wrong-password': 'Nieprawidłowy e-mail lub hasło.',
  'auth/user-not-found': 'Nieprawidłowy e-mail lub hasło.',
  'auth/invalid-email': 'Niepoprawny adres e-mail.',
  'auth/too-many-requests': 'Zbyt wiele prób. Spróbuj za kilka minut.',
  'auth/unauthorized-domain': 'Ta domena nie jest dodana w Firebase → Authentication → Authorized domains.',
  'auth/operation-not-allowed': 'Ta metoda logowania jest wyłączona w Firebase Authentication.',
  'auth/network-request-failed': 'Brak połączenia z internetem.',
};

function useHashPage() {
  const read = () => {
    const id = window.location.hash.replace('#', '');
    return PAGES.some((page) => page.id === id) ? id : 'leads';
  };
  const [page, setPage] = useState(read);
  useEffect(() => {
    const onHash = () => setPage(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return page;
}

function Centered({ children }) {
  return (
    <div className="grid min-h-[100svh] place-items-center px-5 py-16">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className="h-8 w-8 -ml-1" />
      <span className="text-[17px] font-[560] tracking-[-0.02em]">
        Luxe <span className="text-gold-300">Lumens</span>
        <span className="ml-2 text-mist">Panel</span>
      </span>
    </div>
  );
}

function SignIn({ store }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const run = async (kind, fn) => {
    setBusy(kind);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(AUTH_ERRORS[err?.code] ?? 'Nie udało się zalogować.');
    }
    setBusy(null);
  };

  return (
    <Centered>
      <Brand />
      <Card className="mt-8 p-7">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Zaloguj się</h1>
        <p className="mt-1.5 text-sm text-mist">Zgłoszenia z formularza i treści strony.</p>
        <Button variant="primary" className="mt-6 w-full" busy={busy === 'google'} onClick={() => run('google', () => store.signInGoogle())}>
          Zaloguj przez Google
        </Button>
        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-mist">
          <span className="h-px flex-1 bg-white/10" />
          lub
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <form onSubmit={(event) => (event.preventDefault(), run('email', () => store.signInEmail(email.trim(), password)))} className="flex flex-col gap-3">
          <TextInput type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" aria-label="E-mail" required />
          <TextInput type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Hasło" aria-label="Hasło" required />
          <Button type="submit" busy={busy === 'email'}>
            Zaloguj
          </Button>
        </form>
        {error && (
          <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100" role="alert">
            {error}
          </p>
        )}
      </Card>
      <p className="mt-6 text-center text-sm text-mist">
        Chcesz tylko zobaczyć panel?{' '}
        <a href="?demo" className="text-cream underline underline-offset-4">
          Tryb demonstracyjny
        </a>
      </p>
    </Centered>
  );
}

function NoAccess({ store, user }) {
  return (
    <Centered>
      <Brand />
      <Card className="mt-8 p-7">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Brak dostępu</h1>
        <p className="mt-3 leading-relaxed text-mist">
          Konto <span className="text-cream">{user.email}</span> nie jest na liście administratorów. Poproś administratora o dodanie go w zakładce „Dostęp”.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          Pierwszy administrator: w konsoli Firebase → Firestore utwórz dokument <code className="text-cream">site/admins</code> z polem{' '}
          <code className="text-cream">emails</code> (tablica) i wpisz w nim ten adres.
        </p>
        <Button className="mt-6" onClick={() => store.signOut()}>
          <LogOut className="h-4 w-4" />
          Wyloguj
        </Button>
      </Card>
    </Centered>
  );
}

function NotConfigured() {
  return (
    <Centered>
      <Brand />
      <Card className="mt-8 p-7">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Panel nie jest połączony</h1>
        <p className="mt-3 leading-relaxed text-mist">
          Ta wersja strony została zbudowana bez konfiguracji Firebase (VITE_FIREBASE_API_KEY i VITE_FIREBASE_APP_ID). Instrukcja jest w README repozytorium.
        </p>
        <a href="?demo" className="a-btn a-btn-primary a-btn-md mt-6">
          Otwórz tryb demonstracyjny
        </a>
      </Card>
    </Centered>
  );
}

function Shell({ store, user }) {
  const page = useHashPage();
  const [newCount, setNewCount] = useState(0);
  useEffect(() => store.watchLeads((leads) => setNewCount(leads.filter((lead) => (lead.status ?? 'new') === 'new').length), () => {}), [store]);
  const { Page } = PAGES.find((p) => p.id === page);

  return (
    <div className="min-h-[100svh] lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#08080a]/95 backdrop-blur lg:h-[100svh] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:block lg:px-5 lg:py-6">
          <Brand />
          <Button size="sm" variant="ghost" className="lg:hidden" onClick={() => store.signOut()} aria-label="Wyloguj">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0" aria-label="Panel">
          {PAGES.map(({ id, label, icon: Icon }) => (
            <a key={id} href={`#${id}`} className={`a-nav-link shrink-0 ${page === id ? 'is-active' : ''}`} aria-current={page === id ? 'page' : undefined}>
              <Icon className="h-4 w-4" />
              {label}
              {id === 'leads' && newCount > 0 && (
                <span className="ml-auto rounded-full bg-gold-300 px-1.5 text-[11px] font-semibold text-[#1a1206]">{newCount}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 hidden flex-col gap-1 border-t border-white/[0.06] p-3 lg:flex">
          <a href="../" target="_blank" rel="noreferrer" className="a-nav-link">
            <ExternalLink className="h-4 w-4" />
            Otwórz stronę
          </a>
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="min-w-0 truncate text-sm text-mist" title={user.email}>
              {user.email}
            </span>
            <Button size="sm" variant="ghost" onClick={() => store.signOut()} aria-label="Wyloguj">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 pb-16 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        {store.mode === 'demo' && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold-300/25 bg-gold-300/[0.07] px-5 py-3.5 text-sm text-gold-100">
            <span>Tryb demonstracyjny — przykładowe dane, zapisywane tylko w tej przeglądarce.</span>
            <button type="button" className="underline underline-offset-4" onClick={() => (store.reset(), window.location.reload())}>
              Przywróć przykładowe dane
            </button>
          </div>
        )}
        <Page store={store} user={user} />
      </main>
    </div>
  );
}

export default function Admin() {
  const store = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('demo')) return demoStore;
    if (!hasFirebaseConfig && !emulatorHost()) return null;
    return 'firebase';
  }, []);
  const [firebase, setFirebase] = useState(null);
  const [user, setUser] = useState(undefined);
  const [access, setAccess] = useState(undefined);

  // The Firebase SDK loads only when the panel really talks to Firebase.
  useEffect(() => {
    if (store !== 'firebase') return;
    import('./store/firebase.js').then(({ createFirebaseStore }) => setFirebase(createFirebaseStore()));
  }, [store]);

  const active = store === 'firebase' ? firebase : store;

  useEffect(() => {
    if (!active) return undefined;
    return active.onAuth((next) => {
      setUser(next);
      setAccess(undefined);
      if (next) {
        active
          .checkAccess()
          .then(setAccess)
          .catch(() => setAccess(false));
      }
    });
  }, [active]);

  let body;
  if (store === null) body = <NotConfigured />;
  else if (!active || user === undefined || (user && access === undefined)) body = <Spinner label="Ładowanie panelu…" />;
  else if (!user) body = <SignIn store={active} />;
  else if (!access) body = <NoAccess store={active} user={user} />;
  else body = <Shell store={active} user={user} />;

  return <ToastProvider>{body}</ToastProvider>;
}
