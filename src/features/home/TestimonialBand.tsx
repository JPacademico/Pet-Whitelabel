import { Quote } from 'lucide-react';
import { WavyDivider } from '@/design-system/decorative';
import { Reveal, FloatingObject } from '@/design-system/motion';

const TESTIMONIALS = [
  {
    quote: 'Levo minha cachorrinha aqui há dois anos — o carinho da equipe faz toda a diferença.',
    author: 'Ana B.',
    pet: 'tutora da Mel',
  },
  {
    quote: 'Deixei meu gato hospedado por uma semana e recebi foto todo dia. Voltei tranquila.',
    author: 'Carlos E.',
    pet: 'tutor do Simba',
  },
  {
    quote: 'Atenderam meu cão numa emergência de domingo. Não esqueço até hoje.',
    author: 'Fernanda L.',
    pet: 'tutora do Bidu',
  },
];

export function TestimonialBand() {
  return (
    <section className="relative bg-charcoal py-16 text-cream">
      <WavyDivider variant="wave" className="absolute top-0 right-0 left-0 rotate-180 text-cream" />

      <FloatingObject
        shape="bone"
        top="16%"
        left="5%"
        size={54}
        interactive
        label="Ossinho"
        className="hidden text-white/15 lg:block"
      />
      <FloatingObject
        shape="yarn"
        top="62%"
        left="91%"
        size={48}
        delay={2}
        interactive
        label="Novelo de lã"
        className="hidden text-white/15 lg:block"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center font-script text-3xl text-amber-soft">quem já passou por aqui</p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <Reveal key={item.author} delay={i * 120}>
              <figure
                className={`flex h-full flex-col gap-3 rounded-3xl bg-white/6 p-6 backdrop-blur transition-transform duration-300 ease-out-soft hover:-translate-y-2 ${
                  i === 1 ? 'md:-translate-y-5' : ''
                }`}
              >
                <Quote className="size-7 text-amber-brand" aria-hidden="true" />
                <blockquote className="flex-1 text-cream/90">{item.quote}</blockquote>
                <figcaption className="text-sm">
                  <span className="font-bold text-amber-soft">{item.author}</span>
                  <span className="text-cream/50"> — {item.pet}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
