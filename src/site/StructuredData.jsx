import { useEffect } from 'react';
import { contactLinks, useContent } from './content.jsx';

/**
 * schema.org data for search engines, kept in step with the current texts:
 * the FAQ (rich results) and, once the panel has contacts, the business card.
 */
export default function StructuredData() {
  const { t, lang, contacts } = useContent();

  useEffect(() => {
    const url = lang === 'en' ? 'https://luxelumens.pl/en/' : 'https://luxelumens.pl/';
    const data = [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: lang,
        mainEntity: t.faq.items
          .filter((item) => item?.q?.trim() && item?.a?.trim())
          .map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
      },
    ];
    const links = contactLinks(contacts);
    const phone = links.find((link) => link.kind === 'phone');
    const email = links.find((link) => link.kind === 'email');
    const profiles = links.filter((link) => link.kind === 'instagram' || link.kind === 'facebook').map((link) => link.href);
    if (phone || email || profiles.length) {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'HomeAndConstructionBusiness',
        '@id': 'https://luxelumens.pl/#business',
        name: 'Luxe Lumens',
        url,
        ...(phone ? { telephone: phone.label } : {}),
        ...(email ? { email: email.label } : {}),
        ...(profiles.length ? { sameAs: profiles } : {}),
      });
    }
    let script = document.getElementById('ld-live');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'ld-live';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }, [t, lang, contacts]);

  return null;
}
