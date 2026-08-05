import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/design-system/primitives';
import { SectionHeading, Blob } from '@/design-system/decorative';
import { Reveal, FloatingObject, CountUp } from '@/design-system/motion';

const STATS = [
  { value: 4200, suffix: '+', label: 'pets atendidos' },
  { value: 12, suffix: '', label: 'anos cuidando' },
  { value: 98, suffix: '%', label: 'tutores satisfeitos' },
];

export function AboutSection() {
  return (
    <section className="relative overflow-hidden py-16">
      <Blob className="bg-teal/10" size={340} top="6%" left="-14%" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal direction="left">
          <SectionHeading
            align="left"
            eyebrow="prazer, somos o Pet Studio"
            title="Quem somos"
            description="Nascemos do carinho por animais e da vontade de reunir tudo em um só endereço — sem
              que você precise correr a cidade inteira. Nossa equipe junta veterinários, groomers e
              cuidadores apaixonados por bichos, prontos para receber o seu pet como parte da família."
          />
          <Button asChild variant="secondary" className="mt-6">
            <Link to="/clinica">
              Conhecer a clínica
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>

        <Reveal direction="right" delay={140}>
          <div className="relative grid grid-cols-2 gap-4">
            <FloatingObject
              shape="yarn"
              top="-12%"
              left="44%"
              size={50}
              interactive
              label="Novelo de lã"
              className="text-teal"
            />

            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`rounded-3xl border-2 border-cream-deep bg-white p-6 text-center ${
                  i === 0 ? 'col-span-2 bg-amber-brand' : ''
                }`}
              >
                <p
                  className={`font-display text-4xl font-extrabold ${
                    i === 0 ? 'text-charcoal' : 'text-teal'
                  }`}
                >
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </p>
                <p className={`mt-1 text-sm ${i === 0 ? 'text-charcoal/70' : 'text-muted'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
