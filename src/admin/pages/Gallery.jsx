import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { preparePhoto } from '../images.js';
import { Button, Card, Spinner, TextInput, useToast } from '../ui.jsx';

function PhotoCard({ photo, first, last, onMove, store }) {
  const toast = useToast();
  const [captions, setCaptions] = useState({ captionPl: photo.captionPl ?? '', captionEn: photo.captionEn ?? '' });
  const [confirm, setConfirm] = useState(false);

  useEffect(() => setCaptions({ captionPl: photo.captionPl ?? '', captionEn: photo.captionEn ?? '' }), [photo.captionPl, photo.captionEn]);

  const save = async (key) => {
    if ((photo[key] ?? '') === captions[key]) return;
    try {
      await store.updatePhoto(photo.id, { [key]: captions[key].slice(0, 160) });
      toast('Podpis zapisany');
    } catch {
      toast('Nie udało się zapisać', 'error');
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-black">
        <img src={photo.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        {[
          ['captionPl', 'Podpis PL', 'np. Kraków · Boże Narodzenie'],
          ['captionEn', 'Podpis EN', 'e.g. Kraków · Christmas'],
        ].map(([key, label, placeholder]) => (
          <label key={key} className="block">
            <span className="a-label">{label}</span>
            <TextInput
              value={captions[key]}
              placeholder={placeholder}
              onChange={(event) => setCaptions((c) => ({ ...c, [key]: event.target.value }))}
              onBlur={() => save(key)}
            />
          </label>
        ))}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" disabled={first} onClick={() => onMove(-1)} aria-label="Wcześniej">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" disabled={last} onClick={() => onMove(1)} aria-label="Później">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {confirm ? (
            <div className="flex gap-1">
              <Button size="sm" onClick={() => setConfirm(false)}>
                Anuluj
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => store.deletePhoto(photo.id).then(() => toast('Zdjęcie usunięte'), () => toast('Nie udało się usunąć', 'error'))}
              >
                Usuń
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" className="!text-red-300" onClick={() => setConfirm(true)}>
              <Trash2 className="h-4 w-4" />
              Usuń
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Gallery({ store }) {
  const toast = useToast();
  const [photos, setPhotos] = useState(null);
  const [busy, setBusy] = useState(0);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  useEffect(
    () =>
      store.watchGallery(setPhotos, () => {
        toast('Nie udało się wczytać zdjęć', 'error');
        setPhotos([]);
      }),
    [store, toast],
  );

  const upload = async (files) => {
    const list = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));
    if (!list.length) return;
    let order = Math.max(0, ...(photos ?? []).map((photo) => photo.order ?? 0));
    setBusy(list.length);
    for (const file of list) {
      try {
        const prepared = await preparePhoto(file);
        order += 1;
        await store.addPhoto({ ...prepared, captionPl: '', captionEn: '', order });
      } catch (error) {
        toast(error?.message?.startsWith('Zdj') || error?.message?.startsWith('Pami') ? error.message : `Nie udało się dodać: ${file.name}`, 'error');
      }
      setBusy((n) => n - 1);
    }
    toast(list.length === 1 ? 'Zdjęcie dodane' : 'Zdjęcia dodane');
  };

  const move = async (i, by) => {
    const a = photos[i];
    const b = photos[i + by];
    if (!a || !b) return;
    try {
      await Promise.all([store.updatePhoto(a.id, { order: b.order ?? i + by }), store.updatePhoto(b.id, { order: a.order ?? i })]);
    } catch {
      toast('Nie udało się zmienić kolejności', 'error');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.035em]">Realizacje</h1>
      <p className="mt-1 max-w-2xl text-mist">
        Zdjęcia gotowych instalacji. Sekcja „Realizacje” pojawi się na stronie, gdy dodasz pierwsze zdjęcie. Zdjęcia są zmniejszane do 1600 px przed wysłaniem.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          upload(event.dataTransfer.files);
        }}
        className={`mt-7 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition ${
          drag ? 'border-gold-300 bg-gold-300/[0.06]' : 'border-white/15 hover:border-white/30 hover:bg-white/[0.02]'
        }`}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-300/10 text-gold-300">
          <ImagePlus className="h-5 w-5" />
        </span>
        <span className="font-medium">{busy ? `Dodawanie… (${busy})` : 'Dodaj zdjęcia'}</span>
        <span className="text-sm text-mist">Przeciągnij tutaj albo kliknij, żeby wybrać z dysku lub telefonu</span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(event) => (upload(event.target.files), (event.target.value = ''))} />

      {photos === null ? (
        <Spinner label="Wczytywanie…" />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo, i) => (
            <PhotoCard key={photo.id} photo={photo} first={i === 0} last={i === photos.length - 1} onMove={(by) => move(i, by)} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}
