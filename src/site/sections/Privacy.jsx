import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useContent } from '../content.jsx';
import { lockScroll } from '../motion.js';

/** The privacy notice for the quote form, filled with the company's details. */
export default function Privacy({ open, onClose }) {
  const { t, company, contacts } = useContent();
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      lockScroll(true);
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const fill = (text) =>
    text
      .replace('{company}', company.name || 'Luxe Lumens')
      .replace('{address}', company.address ? `, ${company.address}` : '')
      .replace('{nip}', company.nip ? `, NIP ${company.nip}` : '')
      .replace('{email}', company.email || contacts.email || '—');

  return (
    <dialog
      ref={ref}
      className="privacy"
      onClose={() => {
        lockScroll(false);
        onClose();
      }}
      onClick={(event) => event.target === ref.current && onClose()}
      aria-labelledby="privacy-title"
    >
      <div className="privacy-panel" data-lenis-prevent>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 id="privacy-title" className="text-3xl font-semibold tracking-[-0.03em]">
              {t.privacy.title}
            </h2>
            <p className="mt-2 text-sm text-mist">{t.privacy.updated}</p>
          </div>
          <button type="button" onClick={onClose} className="menu-button" aria-label={t.privacy.close}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-8 flex flex-col gap-6">
          {t.privacy.sections.map((section) => (
            <section key={section.h}>
              <h3 className="font-medium text-cream">{section.h}</h3>
              <p className="mt-1.5 leading-relaxed text-mist">{fill(section.p)}</p>
            </section>
          ))}
        </div>
      </div>
    </dialog>
  );
}
