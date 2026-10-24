import { useInView } from '../motion.js';

/** Fades and lifts its content in the first time it scrolls into view. */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const ref = useInView();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--d': `${delay}s`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

/** A headline whose lines slide up from behind a mask, one after another. */
export function Lines({ as: Tag = 'h2', lines, className = '', lineClassName = '', delay = 0, step = 0.09 }) {
  const ref = useInView();
  return (
    <Tag ref={ref} className={`lines ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="line">
          <span className={`line-inner ${lineClassName} ${line.className ?? ''}`} style={{ '--d': `${delay + i * step}s` }}>
            {line.text ?? line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
