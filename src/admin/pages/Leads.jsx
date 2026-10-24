import { Copy, Download, Inbox, Mail, MessageCircle, Phone, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BUILDINGS, STATUSES } from '../schema.js';
import { Badge, Button, Card, Spinner, TextInput, fullTime, relativeTime, useToast } from '../ui.jsx';

const statusOf = (key) => STATUSES.find((status) => status.key === key) ?? STATUSES[0];
const digits = (phone) => String(phone ?? '').replace(/[^\d+]/g, '');

function exportCsv(leads) {
  const header = ['Data', 'Imię', 'Telefon', 'E-mail', 'Miejscowość', 'Budynek', 'Długość okapów (m)', 'Wiadomość', 'Status', 'Notatki', 'Język'];
  const rows = leads.map((lead) => [
    fullTime(lead.createdAt),
    lead.name,
    lead.phone,
    lead.email,
    lead.city,
    BUILDINGS[lead.building] ?? lead.building,
    lead.length || '',
    lead.message,
    statusOf(lead.status).label,
    lead.notes,
    lead.lang,
  ]);
  const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(cell).join(';')).join('\r\n');
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zgloszenia-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function LeadDrawer({ lead, store, onClose }) {
  const toast = useToast();
  const [notes, setNotes] = useState(lead.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => setNotes(lead.notes ?? ''), [lead.id, lead.notes]);
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const update = async (patch, message) => {
    try {
      await store.updateLead(lead.id, patch);
      if (message) toast(message);
    } catch {
      toast('Nie udało się zapisać zmian', 'error');
    }
  };

  const saveNotes = async () => {
    if (notes === (lead.notes ?? '')) return;
    setSaving(true);
    await update({ notes: notes.slice(0, 4000) }, 'Notatka zapisana');
    setSaving(false);
  };

  const remove = async () => {
    try {
      await store.deleteLead(lead.id);
      toast('Zgłoszenie usunięte');
      onClose();
    } catch {
      toast('Nie udało się usunąć', 'error');
    }
  };

  const phone = digits(lead.phone);
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose} role="presentation">
      <aside
        className="flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0b0b0e] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={lead.name}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-6">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-mist">{fullTime(lead.createdAt)}</p>
            <h2 className="mt-1.5 truncate text-2xl font-semibold tracking-[-0.03em]">{lead.name}</h2>
            <p className="mt-1 text-mist">
              {lead.city} · {BUILDINGS[lead.building] ?? lead.building}
              {lead.length ? ` · ~${lead.length} m` : ''}
            </p>
          </div>
          <Button variant="ghost" className="!h-9 !w-9 !px-0" onClick={onClose} aria-label="Zamknij">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div className="grid grid-cols-3 gap-2">
            <a href={`tel:${phone}`} className="a-btn a-btn-secondary a-btn-md">
              <Phone className="h-4 w-4" />
              Zadzwoń
            </a>
            <a href={`https://wa.me/${phone.replace('+', '')}`} target="_blank" rel="noreferrer" className="a-btn a-btn-secondary a-btn-md">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            {lead.email ? (
              <a href={`mailto:${lead.email}`} className="a-btn a-btn-secondary a-btn-md">
                <Mail className="h-4 w-4" />
                E-mail
              </a>
            ) : (
              <Button
                onClick={() => navigator.clipboard?.writeText(lead.phone).then(() => toast('Numer skopiowany'))}
              >
                <Copy className="h-4 w-4" />
                Kopiuj
              </Button>
            )}
          </div>

          <dl className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[15px]">
            <dt className="text-mist">Telefon</dt>
            <dd className="select-all">{lead.phone}</dd>
            <dt className="text-mist">E-mail</dt>
            <dd className="select-all break-all">{lead.email || '—'}</dd>
            <dt className="text-mist">Język strony</dt>
            <dd>{lead.lang === 'en' ? 'angielski' : 'polski'}</dd>
          </dl>

          {lead.message && (
            <div>
              <p className="a-label">Wiadomość</p>
              <p className="whitespace-pre-wrap rounded-xl bg-white/[0.03] p-4 leading-relaxed text-cream/90">{lead.message}</p>
            </div>
          )}

          <div>
            <p className="a-label">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status.key}
                  type="button"
                  className={`a-chip ${lead.status === status.key ? 'is-active' : ''}`}
                  onClick={() => update({ status: status.key }, `Status: ${status.label}`)}
                  aria-pressed={lead.status === status.key}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="lead-notes" className="a-label">
              Notatki
              <span className="a-label-hint">widoczne tylko w panelu</span>
            </label>
            <TextInput id="lead-notes" long rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={saveNotes} placeholder="Np. oddzwonić w piątek, wysłać wycenę…" />
            <div className="mt-2 flex justify-end">
              <Button size="sm" variant="primary" busy={saving} disabled={notes === (lead.notes ?? '')} onClick={saveNotes}>
                Zapisz notatkę
              </Button>
            </div>
          </div>

          <div className="mt-4 border-t border-white/[0.06] pt-6">
            {confirm ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-red-200">Usunąć to zgłoszenie na zawsze?</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setConfirm(false)}>
                    Anuluj
                  </Button>
                  <Button size="sm" variant="danger" onClick={remove}>
                    Usuń
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="ghost" className="!text-red-300" onClick={() => setConfirm(true)}>
                <Trash2 className="h-4 w-4" />
                Usuń zgłoszenie
              </Button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function Leads({ store }) {
  const toast = useToast();
  const [leads, setLeads] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(
    () =>
      store.watchLeads(setLeads, () => {
        toast('Nie udało się wczytać zgłoszeń', 'error');
        setLeads([]);
      }),
    [store, toast],
  );

  const counts = useMemo(() => {
    const out = { all: leads?.length ?? 0 };
    STATUSES.forEach((status) => {
      out[status.key] = leads?.filter((lead) => (lead.status ?? 'new') === status.key).length ?? 0;
    });
    return out;
  }, [leads]);

  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (leads ?? []).filter((lead) => {
      if (filter !== 'all' && (lead.status ?? 'new') !== filter) return false;
      if (!needle) return true;
      return [lead.name, lead.phone, lead.email, lead.city, lead.message, lead.notes].some((value) =>
        String(value ?? '').toLowerCase().includes(needle),
      );
    });
  }, [leads, filter, search]);

  const open = leads?.find((lead) => lead.id === openId);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">Zgłoszenia</h1>
          <p className="mt-1 text-mist">Prośby o wycenę wysłane z formularza na stronie.</p>
        </div>
        <Button onClick={() => exportCsv(shown)} disabled={!shown.length}>
          <Download className="h-4 w-4" />
          Eksport CSV
        </Button>
      </header>

      <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[{ key: 'all', label: 'Wszystkie' }, ...STATUSES].map((status) => (
            <button
              key={status.key}
              type="button"
              className={`a-chip ${filter === status.key ? 'is-active' : ''}`}
              onClick={() => setFilter(status.key)}
              aria-pressed={filter === status.key}
            >
              {status.label}
              <span className="tabular-nums opacity-70">{counts[status.key]}</span>
            </button>
          ))}
        </div>
        <label className="relative block lg:w-72">
          <span className="sr-only">Szukaj</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Szukaj: imię, telefon, miasto…" className="!pl-10" />
        </label>
      </div>

      <Card className="mt-5 overflow-hidden">
        {leads === null ? (
          <Spinner label="Wczytywanie…" />
        ) : !shown.length ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-300/10 text-gold-300">
              <Inbox className="h-5 w-5" />
            </span>
            <p className="font-medium">{leads.length ? 'Nic nie pasuje do filtra' : 'Jeszcze nie ma zgłoszeń'}</p>
            <p className="max-w-sm text-sm text-mist">
              {leads.length ? 'Zmień status albo wyszukiwaną frazę.' : 'Gdy ktoś wyśle formularz na stronie, zgłoszenie pojawi się tutaj od razu.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {shown.map((lead) => {
              const status = statusOf(lead.status);
              return (
                <li key={lead.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(lead.id)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-4 text-left transition hover:bg-white/[0.03] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_9rem_8rem]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${lead.status === 'new' ? 'bg-gold-300 shadow-[0_0_10px_rgba(239,197,122,0.9)]' : 'bg-white/15'}`} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{lead.name}</span>
                        <span className="block truncate text-sm text-mist md:hidden">
                          {lead.phone} · {lead.city}
                        </span>
                      </span>
                    </span>
                    <span className="hidden truncate text-[15px] text-cream/85 md:block">{lead.phone}</span>
                    <span className="hidden truncate text-[15px] text-mist md:block">
                      {lead.city}
                      {lead.length ? ` · ~${lead.length} m` : ''}
                    </span>
                    <span className="justify-self-end md:justify-self-start">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </span>
                    <span className="col-span-2 text-xs text-mist md:col-span-1 md:text-right md:text-sm">{relativeTime(lead.createdAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {open && <LeadDrawer lead={open} store={store} onClose={() => setOpenId(null)} />}
    </div>
  );
}
