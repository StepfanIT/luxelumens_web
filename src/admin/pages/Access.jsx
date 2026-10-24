import { Plus, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, Spinner, TextInput, useToast } from '../ui.jsx';

export default function Access({ store, user }) {
  const toast = useToast();
  const [emails, setEmails] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    store
      .loadAdmins()
      .then(setEmails)
      .catch(() => {
        toast('Nie udało się wczytać listy', 'error');
        setEmails([]);
      });
  }, [store, toast]);

  if (!emails) return <Spinner label="Wczytywanie…" />;

  const persist = async (next, message) => {
    setSaving(true);
    try {
      await store.saveAdmins(next);
      setEmails(next);
      toast(message);
    } catch {
      toast('Nie udało się zapisać', 'error');
    }
    setSaving(false);
  };

  const add = (event) => {
    event.preventDefault();
    const email = draft.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Podaj poprawny e-mail', 'error');
    if (emails.includes(email)) return toast('Ten adres już ma dostęp', 'error');
    setDraft('');
    return persist([...emails, email], `Dodano ${email}`);
  };

  const me = user?.email?.toLowerCase();
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-[-0.035em]">Dostęp do panelu</h1>
      <p className="mt-1 text-mist">
        Panel otworzą tylko te konta Google (albo konta z potwierdzonym e-mailem). Pozostali zobaczą „Brak dostępu”.
      </p>

      <Card className="mt-7 divide-y divide-white/[0.06]">
        {emails.map((email) => (
          <div key={email} className="flex items-center justify-between gap-4 px-5 py-3.5">
            <span className="flex min-w-0 items-center gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-gold-300" />
              <span className="truncate">{email}</span>
              {email === me && <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-xs text-mist">Ty</span>}
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={saving || (email === me && emails.length === 1)}
              onClick={() => persist(emails.filter((e) => e !== email), `Usunięto ${email}`)}
              aria-label={`Usuń ${email}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {!emails.length && <p className="px-5 py-6 text-sm text-mist">Lista jest pusta.</p>}
      </Card>

      <form onSubmit={add} className="mt-4 flex gap-2">
        <TextInput type="email" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="adres@gmail.com" aria-label="Nowy adres" />
        <Button type="submit" variant="primary" busy={saving}>
          <Plus className="h-4 w-4" />
          Dodaj
        </Button>
      </form>
    </div>
  );
}
