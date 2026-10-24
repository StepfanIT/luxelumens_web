import { useId } from 'react';

/** The app's mark: a gold L, a white L and the beam of light between them. */
export function LogoMark({ className = 'h-7 w-7' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d58f" />
          <stop offset=".55" stopColor="#d8a24d" />
          <stop offset="1" stopColor="#a8742c" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="29" y1="0" x2="62" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe6b3" stopOpacity=".95" />
          <stop offset=".45" stopColor="#f2b75c" stopOpacity=".45" />
          <stop offset="1" stopColor="#f2b75c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M29.5 40 64 29.2V47.2L29.5 44Z" fill={`url(#${id}b)`} />
      <path d="M9 10.5h4.3v38.2h30v4.4H9Z" fill={`url(#${id}g)`} />
      <path d="M19.1 10.5h3.8v29.7H30V44H19.1Z" fill="#f7f4ee" />
    </svg>
  );
}

export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 -ml-1" />
      <span className="text-[17px] font-[560] tracking-[-0.02em] text-cream">
        Luxe <span className="text-gold-300">Lumens</span>
      </span>
    </span>
  );
}
