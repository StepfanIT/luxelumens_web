import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { copy } from '../../site/copy.js';
import { diffContent, getPath, mergeContent, setPath } from '../../shared/merge.js';
import { SECTIONS } from '../schema.js';
import { Button, Card, Spinner, TextInput, useToast } from '../ui.jsx';

const LANGS = ['pl', 'en'];
const merged = (data) => ({ pl: mergeContent(copy.pl, data?.pl), en: mergeContent(copy.en, data?.en) });
const diffs = (draft) => ({ pl: diffContent(copy.pl, draft.pl) ?? {}, en: diffContent(copy.en, draft.en) ?? {} });

/** One text in Polish and English side by side, each resettable to the default. */
function Bilingual({ label, long, path, draft, onChange }) {
  return (
    <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
      {LANGS.map((lang) => {
        const value = getPath(draft[lang], path) ?? '';
        const fallback = getPath(copy[lang], path);
        const changed = fallback !== undefined && value !== fallback;
        const id = `${lang}-${path}`;
        return (
          <div key={lang}>
            <div className="a-label">
              <label htmlFor={id} className="flex items-center gap-2">
                <span className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wider text-mist">{lang.toUpperCase()}</span>
                {label}
                {changed && <span className="h-1.5 w-1.5 rounded-full bg-gold-300" title="Zmienione" />}
              </label>
              {changed && (
                <button type="button" className="inline-flex items-center gap-1 text-xs text-mist hover:text-cream" onClick={() => onChange(lang, path, fallback)}>
                  <RotateCcw className="h-3 w-3" />
                  Domyślny
                </button>
              )}
            </div>
            <TextInput id={id} long={long} value={value} onChange={(event) => onChange(lang, path, event.target.value)} />
          </div>
        );
      })}
    </div>
  );
}

function ListEditor({ list, draft, onChange, onItems }) {
  const items = getPath(draft.pl, list.path) ?? [];
  const add = () => onItems(list.path, (array) => [...array, Object.fromEntries(list.item.map((field) => [field.key, '']))]);
  const remove = (i) => onItems(list.path, (array) => array.filter((_, j) => j !== i));
  const move = (i, by) =>
    onItems(list.path, (array) => {
      const next = [...array];
      const [item] = next.splice(i, 1);
      next.splice(i + by, 0, item);
      return next;
    });

  return (
    <div className="mt-8">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-mist">{list.label}</p>
      <div className="mt-3 flex flex-col gap-3">
        {items.map((item, i) => {
          const title = typeof item === 'string' ? item : item[list.item[0].key];
          return (
            <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-cream/90">
                  <span className="mr-2 tabular-nums text-mist">{i + 1}.</span>
                  {title || <span className="text-mist">(puste)</span>}
                </p>
                {!list.fixed && (
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="W górę">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="W dół">
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="!text-red-300" onClick={() => remove(i)} aria-label="Usuń">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4">
                {list.item.map((field) => (
                  <Bilingual
                    key={field.key ?? 'text'}
                    label={field.label}
                    long={field.long}
                    path={field.key === null ? `${list.path}.${i}` : `${list.path}.${i}.${field.key}`}
                    draft={draft}
                    onChange={onChange}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {!list.fixed && (
        <Button className="mt-3" onClick={add}>
          <Plus className="h-4 w-4" />
          Dodaj pytanie
        </Button>
      )}
    </div>
  );
}

function countChanges(section, draft) {
  const paths = [...section.fields.map((field) => field.path), ...(section.lists ?? []).map((list) => list.path)];
  let changed = 0;
  for (const lang of LANGS) {
    for (const path of paths) {
      if (JSON.stringify(getPath(draft[lang], path)) !== JSON.stringify(getPath(copy[lang], path))) changed += 1;
    }
  }
  return changed;
}

export default function Content({ store }) {
  const toast = useToast();
  const [remote, setRemote] = useState(undefined);
  const [draft, setDraft] = useState(null);
  const [open, setOpen] = useState('hero');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    store
      .loadContent()
      .then((data) => {
        if (!alive) return;
        setRemote(data ?? {});
        setDraft(merged(data));
      })
      .catch(() => {
        if (!alive) return;
        toast('Nie udało się wczytać treści — pokazuję domyślne', 'error');
        setRemote({});
        setDraft(merged(null));
      });
    return () => {
      alive = false;
    };
  }, [store, toast]);

  const current = useMemo(() => draft && diffs(draft), [draft]);
  const saved = useMemo(() => remote && diffs(merged(remote)), [remote]);
  const dirty = Boolean(current && saved && JSON.stringify(current) !== JSON.stringify(saved));

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!draft) return <Spinner label="Wczytywanie treści…" />;

  const change = (lang, path, value) => setDraft((d) => ({ ...d, [lang]: setPath(d[lang], path, value) }));
  // List edits (add, remove, reorder) apply to both languages at once.
  const editItems = (path, fn) =>
    setDraft((d) => ({ pl: setPath(d.pl, path, fn(getPath(d.pl, path) ?? [])), en: setPath(d.en, path, fn(getPath(d.en, path) ?? [])) }));

  const save = async () => {
    setSaving(true);
    try {
      await store.saveContent({ pl: current.pl, en: current.en });
      setRemote((r) => ({ ...r, pl: current.pl, en: current.en }));
      toast('Zapisano. Strona pokaże zmiany po odświeżeniu.');
    } catch {
      toast('Nie udało się zapisać — sprawdź połączenie i uprawnienia', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">Treści strony</h1>
          <p className="mt-1 max-w-2xl text-mist">
            Każdy tekst po polsku i po angielsku. Puste pole albo „Domyślny” przywraca tekst, z którym strona została zaprojektowana.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="../" target="_blank" rel="noreferrer" className="a-btn a-btn-secondary a-btn-md">
            Strona PL <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a href="../en/" target="_blank" rel="noreferrer" className="a-btn a-btn-secondary a-btn-md">
            EN <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <div className="mt-7 flex flex-col gap-3">
        {SECTIONS.map((section) => {
          const isOpen = open === section.id;
          const changes = countChanges(section, draft);
          return (
            <Card key={section.id} className="overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02]"
                onClick={() => setOpen(isOpen ? null : section.id)}
                aria-expanded={isOpen}
              >
                <span>
                  <span className="block font-medium">{section.title}</span>
                  {section.hint && <span className="mt-0.5 block text-sm text-mist">{section.hint}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  {changes > 0 && <span className="rounded-full bg-gold-300/15 px-2 py-0.5 text-xs text-gold-200">zmiany: {changes}</span>}
                  <ChevronDown className={`h-5 w-5 text-mist transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-white/[0.06] px-5 pb-6 pt-5">
                  <div className="flex flex-col gap-5">
                    {section.fields.map((field) => (
                      <Bilingual key={field.path} label={field.label} long={field.long} path={field.path} draft={draft} onChange={change} />
                    ))}
                  </div>
                  {(section.lists ?? []).map((list) => (
                    <ListEditor key={list.path} list={list} draft={draft} onChange={change} onItems={editItems} />
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-500 ${dirty ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="mx-auto mb-4 flex w-[min(100%-2rem,44rem)] items-center justify-between gap-4 rounded-full border border-white/10 bg-[#141418]/95 py-2 pl-5 pr-2 shadow-2xl backdrop-blur">
          <p className="text-sm text-cream/90">Masz niezapisane zmiany</p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setDraft(merged(remote))}>
              Odrzuć
            </Button>
            <Button size="sm" variant="primary" busy={saving} onClick={save}>
              Zapisz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
