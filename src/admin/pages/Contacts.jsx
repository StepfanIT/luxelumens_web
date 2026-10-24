import { useEffect, useState } from 'react';
import { defaultCompany, defaultContacts } from '../../site/copy.js';
import { APP_FIELDS, COMPANY_FIELDS, CONTACT_FIELDS } from '../schema.js';
import { Button, Card, Label, Spinner, TextInput, useToast } from '../ui.jsx';

function problem(key, value) {
  const v = String(value ?? '').trim();
  if (!v) return null;
  if (['phone', 'whatsapp'].includes(key) && v.replace(/[^\d]/g, '').length < 9) return 'Za krótki numer';
  if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Niepoprawny e-mail';
  if (key === 'instagram' && !/^https:\/\/(www\.)?instagram\.com\/.+/i.test(v)) return 'Wklej pełny link: https://instagram.com/…';
  if (key === 'facebook' && !/^https:\/\/(www\.)?facebook\.com\/.+/i.test(v)) return 'Wklej pełny link: https://facebook.com/…';
  if (key === 'appStore' && !/^https:\/\/apps\.apple\.com\/.+/i.test(v)) return 'Link musi zaczynać się od https://apps.apple.com/';
  if (key === 'googlePlay' && !/^https:\/\/play\.google\.com\/.+/i.test(v)) return 'Link musi zaczynać się od https://play.google.com/';
  return null;
}

export default function Contacts({ store }) {
  const toast = useToast();
  const [values, setValues] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    store
      .loadContent()
      .then((data) =>
        setValues({ contacts: { ...defaultContacts, ...(data?.contacts ?? {}) }, company: { ...defaultCompany, ...(data?.company ?? {}) } }),
      )
      .catch(() => {
        toast('Nie udało się wczytać danych', 'error');
        setValues({ contacts: { ...defaultContacts }, company: { ...defaultCompany } });
      });
  }, [store, toast]);

  if (!values) return <Spinner label="Wczytywanie…" />;

  const set = (group, key) => (event) => setValues((v) => ({ ...v, [group]: { ...v[group], [key]: event.target.value } }));
  const errors = Object.fromEntries(
    [...CONTACT_FIELDS, ...APP_FIELDS].map((field) => [field.key, problem(field.key, values.contacts[field.key])]),
  );
  if (problem('email', values.company.email)) errors.companyEmail = problem('email', values.company.email);
  const invalid = Object.values(errors).some(Boolean);

  const save = async () => {
    setSaving(true);
    try {
      const trim = (object) => Object.fromEntries(Object.entries(object).map(([k, v]) => [k, String(v ?? '').trim()]));
      await store.saveContent({ contacts: trim(values.contacts), company: trim(values.company) });
      toast('Zapisano');
    } catch {
      toast('Nie udało się zapisać', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-[-0.035em]">Kontakt, aplikacja i firma</h1>
      <p className="mt-1 text-mist">Puste pola są ukryte na stronie. Dane firmy trafiają do polityki prywatności.</p>

      <Card className="mt-7 p-6">
        <h2 className="font-medium">Kontakt na stronie</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {CONTACT_FIELDS.map((field) => (
            <div key={field.key} className={field.type === 'url' ? 'sm:col-span-2' : ''}>
              <Label htmlFor={`c-${field.key}`} hint={errors[field.key]}>
                {field.label}
              </Label>
              <TextInput
                id={`c-${field.key}`}
                type={field.type}
                value={values.contacts[field.key]}
                onChange={set('contacts', field.key)}
                placeholder={field.placeholder}
                aria-invalid={Boolean(errors[field.key])}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-medium">Aplikacja w sklepach</h2>
        <p className="mt-1 text-sm text-mist">
          Dopóki pola są puste, przyciski App Store i Google Play na stronie mają napis „Wkrótce”. Po wklejeniu linku prowadzą do sklepu.
        </p>
        <div className="mt-5 grid gap-5">
          {APP_FIELDS.map((field) => (
            <div key={field.key}>
              <Label htmlFor={`c-${field.key}`} hint={errors[field.key]}>
                {field.label}
              </Label>
              <TextInput
                id={`c-${field.key}`}
                type="url"
                value={values.contacts[field.key] ?? ''}
                onChange={set('contacts', field.key)}
                placeholder={field.placeholder}
                aria-invalid={Boolean(errors[field.key])}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-medium">Dane firmy</h2>
        <p className="mt-1 text-sm text-mist">Administrator danych z formularza wyceny (RODO).</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {COMPANY_FIELDS.map((field) => (
            <div key={field.key}>
              <Label htmlFor={`f-${field.key}`} hint={field.key === 'email' ? errors.companyEmail : undefined}>
                {field.label}
              </Label>
              <TextInput id={`f-${field.key}`} type={field.type} value={values.company[field.key]} onChange={set('company', field.key)} placeholder={field.placeholder} />
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" busy={saving} disabled={invalid} onClick={save}>
          Zapisz
        </Button>
      </div>
    </div>
  );
}
