import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fetchGallery } from '../../shared/firestore-rest.js';
import { useContent } from '../content.jsx';
import { lockScroll } from '../motion.js';
import { Eyebrow } from '../ui/Button.jsx';
import Reveal, { Lines } from '../ui/Reveal.jsx';

const caption = (photo, lang) => (lang === 'en' ? photo.captionEn || photo.captionPl : photo.captionPl || photo.captionEn) ?? '';

function Lightbox({ photos, index, onIndex, onClose }) {
  const { t, lang } = useContent();
  const ref = useRef(null);
  const open = index >= 0;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      lockScroll(true);
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'ArrowRight') onIndex((index + 1) % photos.length);
      if (event.key === 'ArrowLeft') onIndex((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, photos.length, onIndex]);

  const photo = photos[index];
  return (
    <dialog
      ref={ref}
      className="lightbox"
      onClose={() => {
        lockScroll(false);
        onClose();
      }}
      onClick={(event) => event.target === ref.current && onClose()}
    >
      {photo && (
        <figure className="flex h-full flex-col items-center justify-center gap-4 p-4 sm:p-10">
          <img src={photo.image} alt={caption(photo, lang)} className="max-h-[78vh] max-w-full rounded-2xl object-contain shadow-2xl" />
          <figcaption className="flex w-full max-w-4xl items-center justify-between gap-4">
            <span className="text-cream/85">{caption(photo, lang)}</span>
            <span className="flex gap-2">
              {photos.length > 1 && (
                <>
                  <button type="button" className="menu-button" onClick={() => onIndex((index - 1 + photos.length) % photos.length)} aria-label={t.gallery.prev}>
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button type="button" className="menu-button" onClick={() => onIndex((index + 1) % photos.length)} aria-label={t.gallery.next}>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <button type="button" className="menu-button" onClick={onClose} aria-label={t.gallery.close}>
                <X className="h-5 w-5" />
              </button>
            </span>
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}

/** Photos of real installations, added in the admin panel; hidden until there are some. */
export default function Gallery() {
  const { t, lang } = useContent();
  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(-1);
  const sentinelRef = useRef(null);
  const rowRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const controller = new AbortController();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        fetchGallery(controller.signal)
          .then(setPhotos)
          .catch(() => {});
      },
      { rootMargin: '1600px 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      controller.abort();
    };
  }, []);

  if (!photos.length) return <div ref={sentinelRef} aria-hidden="true" />;

  const scrollBy = (dir) => {
    const row = rowRef.current;
    row?.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section id="gallery" className="relative py-28 md:py-40">
      <div className="container-page flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <Eyebrow>{t.gallery.label}</Eyebrow>
          </Reveal>
          <Lines className="display mt-6 max-w-3xl text-[clamp(2.3rem,5vw,4.6rem)]" lines={[t.gallery.title]} />
        </div>
        {photos.length > 2 && (
          <div className="hidden gap-2 md:flex">
            <button type="button" className="menu-button" onClick={() => scrollBy(-1)} aria-label={t.gallery.prev}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button type="button" className="menu-button" onClick={() => scrollBy(1)} aria-label={t.gallery.next}>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      <div ref={rowRef} className="gallery-row no-scrollbar mt-12 md:mt-16" data-lenis-prevent>
        {photos.map((photo, i) => (
          <figure key={photo.id} className="gallery-item" style={{ aspectRatio: `${photo.width || 4} / ${photo.height || 3}` }}>
            <button type="button" onClick={() => setIndex(i)} className="block h-full w-full" aria-label={caption(photo, lang) || t.gallery.label}>
              <img src={photo.image} alt={caption(photo, lang)} loading="lazy" decoding="async" className="h-full w-full rounded-[22px] object-cover" />
            </button>
            {caption(photo, lang) && <figcaption className="mt-3 text-[15px] text-mist">{caption(photo, lang)}</figcaption>}
          </figure>
        ))}
      </div>
      <Lightbox photos={photos} index={index} onIndex={setIndex} onClose={() => setIndex(-1)} />
    </section>
  );
}
