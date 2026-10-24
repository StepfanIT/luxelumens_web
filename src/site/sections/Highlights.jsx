import { Camera, ShieldCheck, Smartphone, Wrench } from 'lucide-react';
import { useContent } from '../content.jsx';
import Reveal from '../ui/Reveal.jsx';

const ICONS = [ShieldCheck, Camera, Wrench, Smartphone];

/** The offer in four facts, right under the first screen. */
export default function Highlights() {
  const { t } = useContent();
  return (
    <section aria-label={t.hero.eyebrow} className="relative border-y border-white/[0.07] bg-[#08080a]">
      <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-5 py-7 md:grid-cols-4 md:py-8">
        {t.highlights.map((item, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <Reveal as="li" key={item} delay={i * 0.06} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-300/10 text-gold-300 ring-1 ring-gold-300/20">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[14.5px] font-medium leading-snug text-cream/90 md:text-[15.5px]">{item}</span>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
