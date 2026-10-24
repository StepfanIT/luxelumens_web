import { useEffect, useState } from 'react';
import { defaultMarketing } from '../../site/copy.js';
import { validGa4, validPixel } from '../../site/tracking.js';
import { Button, Card, Label, Spinner, TextInput, useToast } from '../ui.jsx';

function Toggle({ id, checked, onChange, title, text }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-6">
      <span>
        <span className="block font-medium">{title}</span>
        <span className="mt-1 block text-sm text-mist">{text}</span>
      </span>
      <span className="relative mt-1 inline-flex shrink-0">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-white/15 transition peer-checked:bg-gold-300 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold-300" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-cream shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function Marketing({ store }) {
  const toast = useToast();
  const [values, setValues] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    store
      .loadContent()
      .then((data) => setValues({ ...defaultMarketing, ...(data?.marketing ?? {}) }))
      .catch(() => {
        toast('Nie udało się wczytać ustawień', 'error');
        setValues({ ...defaultMarketing });
      });
  }, [store, toast]);

  if (!values) return <Spinner label="Wczytywanie…" />;

  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  const ga4Error = values.ga4.trim() && !validGa4(values.ga4) ? 'Format: G-XXXXXXXXXX' : '';
  const pixelError = values.pixel.trim() && !validPixel(values.pixel) ? 'Sam numer, np. 123456789012345' : '';

  const save = async () => {
    setSaving(true);
    try {
      await store.saveContent({
        marketing: { promo: values.promo, autoplay: values.autoplay, ga4: values.ga4.trim(), pixel: values.pixel.trim() },
      });
      toast('Zapisano');
    } catch {
      toast('Nie udało się zapisać', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-[-0.035em]">Marketing</h1>
      <p className="mt-1 text-mist">Elementy, które zachęcają do wyceny, i pomiar skuteczności reklam.</p>

      <Card className="mt-7 flex flex-col gap-6 p-6">
        <Toggle
          id="m-promo"
          checked={values.promo}
          onChange={(v) => set('promo', v)}
          title="Pasek odliczania do świąt"
          text="Na górze strony: „Do Bożego Narodzenia zostało 61 dni. Zamów wycenę z wyprzedzeniem.” Święto i liczba dni liczą się same."
        />
        <div className="h-px bg-white/[0.06]" />
        <Toggle
          id="m-autoplay"
          checked={values.autoplay}
          onChange={(v) => set('autoplay', v)}
          title="Pokaz scen na pierwszym ekranie"
          text="Dom sam zmienia światło co kilka sekund, zaczynając od najbliższego święta. Zatrzymuje się, gdy odwiedzający wybierze scenę."
        />
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-medium">Statystyki i reklamy</h2>
        <p className="mt-1 text-sm leading-relaxed text-mist">
          Po wpisaniu identyfikatora strona zapyta odwiedzających o zgodę na cookies (RODO) i dopiero po zgodzie włączy pomiar.
          Wysłanie formularza jest liczone jako konwersja (generate_lead w Google, Lead w Meta). Puste pola = brak śledzenia i brak pytania o zgodę.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="m-ga4" hint={ga4Error}>
              Google Analytics 4 (Measurement ID)
            </Label>
            <TextInput id="m-ga4" value={values.ga4} onChange={(event) => set('ga4', event.target.value)} placeholder="G-XXXXXXXXXX" />
          </div>
          <div>
            <Label htmlFor="m-pixel" hint={pixelError}>
              Meta Pixel (ID)
            </Label>
            <TextInput id="m-pixel" inputMode="numeric" value={values.pixel} onChange={(event) => set('pixel', event.target.value)} placeholder="123456789012345" />
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-medium">Skąd przychodzą klienci</h2>
        <p className="mt-1 text-sm leading-relaxed text-mist">
          Każde zgłoszenie ma pole „Źródło”: tagi UTM z linku reklamy, kliknięcie z Google Ads lub Facebooka/Instagrama i stronę, z której ktoś przyszedł —
          bez cookies. Do linków w reklamach i na Instagramie dopisuj np. <code className="text-cream">?utm_source=instagram&amp;utm_medium=bio</code>.
        </p>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" busy={saving} disabled={Boolean(ga4Error || pixelError)} onClick={save}>
          Zapisz
        </Button>
      </div>
    </div>
  );
}
