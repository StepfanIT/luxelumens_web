import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../motion.js';

/** "50 000 h" → { number: 50000, prefix: '', suffix: ' h', separator: ' ' } */
function parse(value) {
  const match = /^(\D*)(\d{1,3}(?:[ ,.  ]\d{3})+|\d+)(.*)$/.exec(value);
  if (!match) return null;
  const separator = match[2].match(/[ ,.  ]/)?.[0] ?? '';
  return {
    prefix: match[1],
    number: Number(match[2].replace(/[^\d]/g, '')),
    separator,
    suffix: match[3],
  };
}

function format(n, separator) {
  const digits = String(Math.round(n));
  return separator ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : digits;
}

/** Counts a figure up from zero the first time it comes into view. */
export default function CountUp({ value, duration = 1600 }) {
  const parsed = parse(value);
  const ref = useRef(null);
  const [shown, setShown] = useState(parsed && !reducedMotion() ? 0 : null);

  useEffect(() => {
    if (!parsed || reducedMotion()) return undefined;
    const el = ref.current;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(2, -10 * p);
          setShown(p >= 1 ? null : parsed.number * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!parsed || shown === null) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">
        {parsed.prefix}
        {format(shown, parsed.separator)}
        {parsed.suffix}
      </span>
    </span>
  );
}
