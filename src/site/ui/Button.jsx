import { ArrowRight } from 'lucide-react';

/** Cream pill with an arrow that slides on hover. */
export function PrimaryButton({ as: Tag = 'a', children, className = '', icon = true, ...rest }) {
  return (
    <Tag className={`btn-primary group ${className}`} {...rest}>
      <span>{children}</span>
      {icon && (
        <span className="btn-primary-icon" aria-hidden="true">
          <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-[3px]" />
        </span>
      )}
    </Tag>
  );
}

export function GhostButton({ as: Tag = 'a', children, className = '', ...rest }) {
  return (
    <Tag className={`btn-ghost ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/** Small section label: a lit LED and a word. */
export function Eyebrow({ children, className = '', tone = 'dark' }) {
  return (
    <span className={`eyebrow ${tone === 'light' ? 'eyebrow-light' : ''} ${className}`}>
      <span className="eyebrow-led" aria-hidden="true" />
      {children}
    </span>
  );
}
