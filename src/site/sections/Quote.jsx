import { ArrowRight, Check, Loader2, Mail, MessageCircle, Phone as PhoneIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import onUrl from '../../assets/house/on.webp';
import { submitLead } from '../../shared/firestore-rest.js';
import { contactLinks, useContent } from '../content.jsx';
import { Eyebrow } from '../ui/Button.jsx';
import Reveal, { Lines } from '../ui/Reveal.jsx';

const BUILDINGS = ['house', 'terraced', 'business', 'other'];
const ICONS = { phone: PhoneIcon, whatsapp: MessageCircle, email: Mail };

export function DirectContacts({ className = '' }) {
  const { t, contacts } = useContent();
  const links = contactLinks(contacts);
  if (!links.length) return null;
  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {links.map((link) => {
        const Icon = ICONS[link.kind] ?? ArrowRight;
        return (
          <li key={link.kind}>
            <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="direct-link">
              <span className="direct-icon">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-[0.14em] text-mist">{t.contact[link.kind]}</span>
                <span className="block truncate text-[15px] text-cream">{link.label}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

const empty = { name: '', phone: '', email: '', city: '', building: 'house', length: 40, lengthUnknown: false, message: '', consent: false, website: '' };

function validate(values, f) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = f.required;
  const digits = values.phone.replace(/[^\d]/g, '');
  if (!values.phone.trim()) errors.phone = f.required;
  else if (digits.length < 9 || digits.length > 15 || /[^\d\s+()-]/.test(values.phone)) errors.phone = f.invalidPhone;
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = f.invalidEmail;
  if (values.city.trim().length < 2) errors.city = f.required;
  if (!values.consent) errors.consent = f.consentRequired;
  return errors;
}

function Field({ id, label, hint, error, optional, optionalLabel, children }) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="text-mist/70"> · {optionalLabel}</span>}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Quote({ onPrivacy }) {
  const { t, lang } = useContent();
  const f = t.quote.form;
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const openedAt = useRef(Date.now());
  const formRef = useRef(null);

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validate(values, f);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    // Bots fill the hidden field or submit within a blink; pretend it worked.
    if (values.website || Date.now() - openedAt.current < 2500) {
      setStatus('sent');
      return;
    }
    setStatus('sending');
    try {
      await submitLead({
        name: values.name.trim().slice(0, 80),
        phone: values.phone.trim().slice(0, 30),
        email: values.email.trim().slice(0, 120),
        city: values.city.trim().slice(0, 80),
        building: values.building,
        length: values.lengthUnknown ? 0 : Number(values.length),
        message: values.message.trim().slice(0, 2000),
        lang,
        consent: true,
        status: 'new',
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setValues(empty);
    setErrors({});
    setStatus('idle');
    openedAt.current = Date.now();
  };

  const describedBy = (key) => (errors[key] ? `${key}-error` : undefined);

  return (
    <section id="quote" className="quote relative overflow-hidden py-28 md:py-40">
      <div className="quote-backdrop" aria-hidden="true">
        <img src={onUrl} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container-page relative grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-20">
        <div className="lg:pt-6">
          <Reveal>
            <Eyebrow>{t.quote.label}</Eyebrow>
          </Reveal>
          <Lines
            className="display mt-6 text-[clamp(2.6rem,5.6vw,5.2rem)]"
            lines={[t.quote.title1, { text: t.quote.title2, className: 'serif-accent' }]}
          />
          <Reveal as="p" delay={0.15} className="text-body mt-6 max-w-md">
            {t.quote.lead}
          </Reveal>
          <Reveal as="ul" delay={0.22} className="mt-8 flex flex-col gap-3">
            {t.quote.perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-cream/90">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gold-400/15 text-gold-300">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                </span>
                {perk}
              </li>
            ))}
          </Reveal>
          <Reveal delay={0.28} className="mt-10 max-w-sm">
            <DirectContactsBlock title={t.quote.direct} />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="quote-card glass">
          {status === 'sent' ? (
            <div className="quote-done" role="status">
              <span className="quote-done-mark">
                <Check className="h-7 w-7" strokeWidth={2.4} />
              </span>
              <h3 className="mt-7 text-3xl font-semibold tracking-[-0.03em]">{f.successTitle}</h3>
              <p className="text-body mt-3 max-w-xs">{f.successText}</p>
              <button type="button" onClick={reset} className="btn-ghost mt-8">
                {f.again}
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={submit} noValidate className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="q-name" label={f.name} error={errors.name}>
                  <input id="q-name" name="name" autoComplete="given-name" className="input" value={values.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} maxLength={80} />
                </Field>
                <Field id="q-phone" label={f.phone} error={errors.phone}>
                  <input id="q-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className="input" value={values.phone} onChange={set('phone')} aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy('phone')} maxLength={30} placeholder="+48" />
                </Field>
                <Field id="q-email" label={f.email} optional optionalLabel={f.optional} error={errors.email}>
                  <input id="q-email" name="email" type="email" autoComplete="email" className="input" value={values.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email')} maxLength={120} />
                </Field>
                <Field id="q-city" label={f.city} error={errors.city}>
                  <input id="q-city" name="city" autoComplete="address-level2" className="input" value={values.city} onChange={set('city')} aria-invalid={Boolean(errors.city)} aria-describedby={describedBy('city')} maxLength={80} />
                </Field>
              </div>

              <fieldset className="field">
                <legend className="field-label">{f.building}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BUILDINGS.map((key) => (
                    <label key={key} className={`chip ${values.building === key ? 'is-active' : ''}`}>
                      <input type="radio" name="building" value={key} checked={values.building === key} onChange={set('building')} className="sr-only" />
                      {f.buildings[key]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="field">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor="q-length" className="field-label">
                    {f.length}
                  </label>
                  <span className="text-sm tabular-nums text-cream">
                    {values.lengthUnknown ? '—' : `~${values.length} ${f.meters}`}
                  </span>
                </div>
                <input
                  id="q-length"
                  name="length"
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={values.length}
                  onChange={set('length')}
                  disabled={values.lengthUnknown}
                  className="range mt-3"
                  style={{ '--p': `${((values.length - 10) / 190) * 100}%` }}
                />
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="field-hint mt-0">{f.lengthHint}</p>
                  <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-mist">
                    <input type="checkbox" checked={values.lengthUnknown} onChange={set('lengthUnknown')} className="checkbox" />
                    {f.lengthUnknown}
                  </label>
                </div>
              </div>

              <Field id="q-message" label={f.message} optional optionalLabel={f.optional}>
                <textarea id="q-message" name="message" rows={3} className="input resize-none" value={values.message} onChange={set('message')} placeholder={f.messagePlaceholder} maxLength={2000} />
              </Field>

              <div className="hidden" aria-hidden="true">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
                </label>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-mist">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={values.consent}
                    onChange={set('consent')}
                    className="checkbox mt-0.5"
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={describedBy('consent')}
                  />
                  <span>
                    {f.consent}{' '}
                    <button type="button" onClick={onPrivacy} className="text-cream underline underline-offset-4 hover:text-gold-200">
                      {f.privacy}
                    </button>
                    .
                  </span>
                </label>
                {errors.consent && (
                  <p id="consent-error" className="field-error ml-8" role="alert">
                    {errors.consent}
                  </p>
                )}
              </div>

              {status === 'error' && (
                <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100" role="alert">
                  <p>{f.error}</p>
                  <DirectContactsBlock title={f.errorDirect} compact />
                </div>
              )}

              <button type="submit" className="btn-primary w-full justify-between" disabled={status === 'sending'}>
                <span>{status === 'sending' ? f.sending : f.submit}</span>
                <span className="btn-primary-icon" aria-hidden="true">
                  {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </span>
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function DirectContactsBlock({ title, compact = false }) {
  const { contacts } = useContent();
  if (!contactLinks(contacts).length) return null;
  return (
    <div className={compact ? 'mt-3' : ''}>
      <p className={compact ? 'text-red-100/80' : 'text-sm font-medium uppercase tracking-[0.14em] text-mist'}>{title}</p>
      <DirectContacts className="mt-3" />
    </div>
  );
}
