import { Marquee } from '@/design-system/decorative';
import { Hero } from './Hero';
import { AboutSection } from './AboutSection';
import { ServicesBand } from './ServicesBand';
import { PracticalInfo } from './PracticalInfo';
import { MapSection } from './MapSection';
import { TestimonialBand } from './TestimonialBand';

export function HomePage() {
  return (
    <>
      <title>Pet Studio — Clínica, Banho & Tosa, Hotel e Loja</title>
      <Hero />
      <Marquee
        items={[
          'banho & tosa',
          'clínica veterinária',
          'hotel para pets',
          'ração e brinquedos',
          'vacinação',
          'feito com carinho',
        ]}
        duration={32}
        className="bg-teal py-3 text-white"
      />
      <AboutSection />
      <ServicesBand />
      <PracticalInfo />
      <MapSection />
      <TestimonialBand />
    </>
  );
}
