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
      <AboutSection />
      <ServicesBand />
      <PracticalInfo />
      <MapSection />
      <TestimonialBand />
    </>
  );
}
