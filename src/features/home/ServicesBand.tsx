import { Link } from 'react-router';
import { Stethoscope, Bath, BedDouble, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/design-system/decorative';
import { Reveal } from '@/design-system/motion';
import { cn } from '@/lib/cn';

const SERVICES = [
  {
    icon: Stethoscope,
    label: 'Clínica',
    description: 'Consultas, vacinas, exames e emergências.',
    to: '/clinica',
    accent: 'bg-urgent/12 text-urgent',
  },
  {
    icon: Bath,
    label: 'Banho & Tosa',
    description: 'Agende online em poucos cliques.',
    to: '/banho-e-tosa',
    accent: 'bg-teal/12 text-teal',
  },
  {
    icon: BedDouble,
    label: 'Hotel',
    description: 'Hospedagem com recreação e fotos diárias.',
    to: '/hotel',
    accent: 'bg-amber-brand/20 text-amber-brand',
  },
  {
    icon: ShoppingBag,
    label: 'Loja',
    description: 'Ração, brinquedos e higiene.',
    to: '/loja',
    accent: 'bg-sale/12 text-sale',
  },
];

export function ServicesBand() {
  return (
    <section className="relative bg-cream-deep py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="o que fazemos" title="Nossos serviços" />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => {
            const ServiceIcon = service.icon;
            return (
              <Reveal key={service.label} delay={i * 100}>
                <Link
                  to={service.to}
                  className={cn(
                    'group flex h-full flex-col gap-3 rounded-3xl bg-white p-6',
                    'shadow-[0_12px_32px_-24px_rgba(43,42,40,0.8)]',
                    'transition-all duration-300 ease-out-soft hover:-translate-y-2 hover:shadow-[0_24px_48px_-24px_rgba(43,42,40,0.6)]',
                    // Alternating vertical offset breaks the flat row.
                    i % 2 === 1 && 'lg:translate-y-6',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-14 items-center justify-center rounded-2xl transition-transform duration-300 ease-out-soft group-hover:scale-110 group-hover:-rotate-6',
                      service.accent,
                    )}
                  >
                    <ServiceIcon className="size-7" aria-hidden="true" />
                  </span>

                  <div className="flex items-center gap-1.5">
                    <p className="font-display text-lg font-bold text-charcoal">{service.label}</p>
                    <ArrowUpRight
                      className="size-4 text-muted transition-transform duration-300 ease-out-soft group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-teal"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-muted">{service.description}</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
