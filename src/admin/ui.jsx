import { Loader2 } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

export function Button({ variant = 'secondary', size = 'md', busy = false, className = '', children, ...rest }) {
  return (
    <button type="button" className={`a-btn a-btn-${variant} a-btn-${size} ${className}`} disabled={busy || rest.disabled} {...rest}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`a-card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Label({ htmlFor, children, hint }) {
  return (
    <label htmlFor={htmlFor} className="a-label">
      {children}
      {hint && <span className="a-label-hint">{hint}</span>}
    </label>
  );
}

export function TextInput({ long = false, className = '', ...rest }) {
  if (long) return <textarea rows={3} className={`a-input resize-y ${className}`} {...rest} />;
  return <input className={`a-input ${className}`} {...rest} />;
}

const TONES = {
  gold: 'bg-gold-400/15 text-gold-200 ring-gold-400/30',
  blue: 'bg-sky-400/10 text-sky-200 ring-sky-400/25',
  violet: 'bg-violet-400/10 text-violet-200 ring-violet-400/25',
  green: 'bg-emerald-400/10 text-emerald-200 ring-emerald-400/25',
  gray: 'bg-white/5 text-mist ring-white/10',
};

export function Badge({ tone = 'gray', className = '', children }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${TONES[tone]} ${className}`}>{children}</span>;
}

export function Spinner({ label }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-mist">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);
  const push = useCallback((text, tone = 'ok') => {
    const key = (id.current += 1);
    setToasts((list) => [...list, { key, text, tone }]);
    setTimeout(() => setToasts((list) => list.filter((toast) => toast.key !== key)), 3800);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.key} className={`a-toast ${toast.tone === 'error' ? 'a-toast-error' : ''}`}>
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/** "2 godz. temu" style times for the lead list. */
export function relativeTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'przed chwilą';
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? 'wczoraj' : `${days} dni temu`;
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fullTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
