import { Star } from 'lucide-react';
import { useContent } from '../content.jsx';
import { Eyebrow } from '../ui/Button.jsx';
import Reveal, { Lines } from '../ui/Reveal.jsx';

/** Real customer reviews entered in the admin panel; hidden until there are some. */
export default function Reviews() {
  const { t, lang, reviews } = useContent();
  if (!reviews.length) return null;
  return (
    <section id="reviews" className="relative py-28 md:py-40">
      <div className="container-page">
        <Reveal>
          <Eyebrow>{t.reviews.label}</Eyebrow>
        </Reveal>
        <Lines className="display mt-6 max-w-3xl text-[clamp(2.3rem,5vw,4.6rem)]" lines={[t.reviews.title]} />
        <div className="reviews mt-14 md:mt-20">
          {reviews.map((review, i) => {
            const text = lang === 'en' ? review.textEn || review.textPl : review.textPl || review.textEn;
            const stars = Math.max(1, Math.min(5, Number(review.stars) || 5));
            return (
              <Reveal as="figure" key={`${review.name}-${i}`} delay={(i % 3) * 0.08} className="review-card">
                <div className="flex gap-1 text-gold-300" aria-label={`${stars}/5`}>
                  {Array.from({ length: stars }, (_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-5 text-[1.08rem] leading-relaxed text-cream/90">{lang === 'en' ? `“${text}”` : `„${text}”`}</blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="font-medium text-cream">{review.name}</span>
                  {review.place && <span className="text-mist"> · {review.place}</span>}
                </figcaption>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
