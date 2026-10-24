import { useMemo, useRef } from 'react';
import { useContent } from '../content.jsx';
import { passProgress, useScrollFrame } from '../motion.js';
import { Eyebrow } from '../ui/Button.jsx';

const strip = (word) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/** A paragraph that lights up word by word as it scrolls through the view. */
export default function Manifesto() {
  const { t } = useContent();
  const words = useMemo(() => t.manifesto.text.split(/\s+/).filter(Boolean), [t.manifesto.text]);
  const keys = useMemo(() => new Set(t.manifesto.highlight.split(/\s+/).map(strip)), [t.manifesto.highlight]);
  const textRef = useRef(null);
  const wordRefs = useRef([]);
  const glowRef = useRef(null);

  useScrollFrame((y, h) => {
    const text = textRef.current;
    if (!text) return;
    const p = passProgress(text, h, { from: 0.88, to: 0.42 });
    const n = words.length;
    const soft = 5;
    wordRefs.current.forEach((el, i) => {
      if (!el) return;
      const lit = Math.min(1, Math.max(0, (p * (n + soft) - i) / soft));
      el.style.setProperty('--lit', lit.toFixed(3));
    });
    glowRef.current?.style.setProperty('--p', p.toFixed(3));
  });

  wordRefs.current.length = words.length;
  return (
    <section id="manifesto" className="manifesto relative overflow-hidden py-28 md:py-44">
      <div ref={glowRef} className="manifesto-glow" aria-hidden="true" />
      <div className="container-page relative">
        <Eyebrow>{t.manifesto.label}</Eyebrow>
        <p ref={textRef} className="manifesto-text mt-8 md:mt-10">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className={`mword ${keys.has(strip(word)) ? 'is-key' : ''}`}
            >
              {word}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
