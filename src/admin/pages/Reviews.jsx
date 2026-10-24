import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, Label, Spinner, TextInput, useToast } from '../ui.jsx';

const blank = () => ({ name: '', place: '', stars: 5, textPl: '', textEn: '' });

export default function Reviews({ store }) {
  const toast = useToast();
  const [reviews, setReviews] = useState(null);
  const [saved, setSaved] = useState('[]');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    store
      .loadContent()
      .then((data) => {
        const list = Array.isArray(data?.reviews) ? data.reviews.map((review) => ({ ...blank(), ...review })) : [];
        setReviews(list);
        setSaved(JSON.stringify(list));
      })
      .catch(() => {
        toast('Nie udało się wczytać opinii', 'error');
        setReviews([]);
      });
  }, [store, toast]);

  if (!reviews) return <Spinner label="Wczytywanie…" />;

  const set = (i, key, value) => setReviews((list) => list.map((review, j) => (j === i ? { ...review, [key]: value } : review)));
  const move = (i, by) =>
    setReviews((list) => {
      const next = [...list];
      const [item] = next.splice(i, 1);
      next.splice(i + by, 0, item);
      return next;
    });
  const incomplete = reviews.some((review) => !review.name.trim() || !(review.textPl.trim() || review.textEn.trim()));
  const dirty = JSON.stringify(reviews) !== saved;

  const save = async () => {
    setSaving(true);
    try {
      const clean = reviews.map((review) => ({
        name: review.name.trim().slice(0, 60),
        place: review.place.trim().slice(0, 60),
        stars: Math.max(1, Math.min(5, Number(review.stars) || 5)),
        textPl: review.textPl.trim().slice(0, 600),
        textEn: review.textEn.trim().slice(0, 600),
      }));
      await store.saveContent({ reviews: clean });
      setReviews(clean);
      setSaved(JSON.stringify(clean));
      toast('Zapisano');
    } catch {
      toast('Nie udało się zapisać', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl pb-10">
      <h1 className="text-3xl font-semibold tracking-[-0.035em]">Opinie</h1>
      <p className="mt-1 text-mist">
        Sekcja z opiniami pojawi się na stronie, gdy dodasz pierwszą. Publikuj tylko prawdziwe opinie klientów, za ich zgodą.
      </p>

      <div className="mt-7 flex flex-col gap-4">
        {reviews.map((review, i) => (
          <Card key={i} className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`r-name-${i}`}>Imię i nazwisko</Label>
                <TextInput id={`r-name-${i}`} value={review.name} onChange={(event) => set(i, 'name', event.target.value)} placeholder="Anna K." />
              </div>
              <div>
                <Label htmlFor={`r-place-${i}`}>Miejscowość</Label>
                <TextInput id={`r-place-${i}`} value={review.place} onChange={(event) => set(i, 'place', event.target.value)} placeholder="Kraków" />
              </div>
            </div>
            <div className="mt-4">
              <span className="a-label">Ocena</span>
              <div className="flex gap-1" role="radiogroup" aria-label="Ocena">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={review.stars === n}
                    aria-label={`${n}/5`}
                    onClick={() => set(i, 'stars', n)}
                    className={n <= review.stars ? 'text-gold-300' : 'text-white/20'}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`r-pl-${i}`}>Opinia (PL)</Label>
                <TextInput id={`r-pl-${i}`} long value={review.textPl} onChange={(event) => set(i, 'textPl', event.target.value)} />
              </div>
              <div>
                <Label htmlFor={`r-en-${i}`} hint="opcjonalnie">
                  Opinia (EN)
                </Label>
                <TextInput id={`r-en-${i}`} long value={review.textEn} onChange={(event) => set(i, 'textEn', event.target.value)} />
              </div>
            </div>
            <div className="mt-3 flex justify-between">
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="W górę">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" disabled={i === reviews.length - 1} onClick={() => move(i, 1)} aria-label="W dół">
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <Button size="sm" variant="ghost" className="!text-red-300" onClick={() => setReviews((list) => list.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
                Usuń
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button onClick={() => setReviews((list) => [...list, blank()])}>
          <Plus className="h-4 w-4" />
          Dodaj opinię
        </Button>
        <div className="flex items-center gap-3">
          {incomplete && <span className="text-sm text-mist">Uzupełnij imię i treść każdej opinii</span>}
          <Button variant="primary" busy={saving} disabled={!dirty || incomplete} onClick={save}>
            Zapisz
          </Button>
        </div>
      </div>
    </div>
  );
}
