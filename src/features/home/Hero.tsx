import { Link } from 'react-router';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/design-system/primitives';
import { FloatingObject, PawShape } from '@/design-system/motion';
import { WavyDivider, Blob } from '@/design-system/decorative';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-amber-brand pt-12 pb-24 sm:pt-16">
      <Blob className="bg-white/20" size={460} top="-18%" left="-12%" />
      <Blob className="bg-teal/20" size={300} top="55%" right="-8%" delay={4} />

      {/* Interactive pet objects — hover or click them. */}
      <FloatingObject
        shape="bone"
        top="16%"
        left="6%"
        size={72}
        interactive
        label="Ossinho — passe o mouse para brincar"
        className="hidden text-cream sm:block"
      />
      <FloatingObject
        shape="yarn"
        top="66%"
        left="10%"
        size={58}
        delay={1.6}
        interactive
        label="Novelo de lã — passe o mouse para desenrolar"
        className="hidden text-teal sm:block"
      />
      <FloatingObject
        shape="bone"
        top="70%"
        left="88%"
        size={54}
        delay={2.4}
        interactive
        label="Outro ossinho"
        className="hidden text-cream/80 sm:block"
      />
      <FloatingObject
        shape="paw"
        top="12%"
        left="90%"
        size={44}
        delay={0.8}
        className="hidden text-charcoal/15 lg:block"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 sm:px-6 md:flex-row">
        <div className="flex-1 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/10 px-3 py-1 text-xs font-bold text-charcoal">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
            Clínica · Banho &amp; Tosa · Hotel · Loja
          </span>

          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-extrabold text-charcoal sm:text-6xl">
            Cuidado e carinho
            <br />
            para o seu
            <span className="relative ml-3 inline-block">
              <span className="relative z-10">melhor amigo</span>
              {/* Hand-drawn highlight behind the key phrase. */}
              <svg
                viewBox="0 0 200 20"
                aria-hidden="true"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 z-0 h-4 w-full text-teal/45"
              >
                <path
                  d="M3 14c40-8 90-10 130-7s50 6 64 2"
                  stroke="currentColor"
                  strokeWidth="9"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-lg text-charcoal/80 md:mx-0">
            Tudo o que seu pet precisa em um só lugar, pertinho de você em Aracaju.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
            <Button asChild size="lg">
              <Link to="/banho-e-tosa">
                Agendar banho &amp; tosa
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/loja">Ver a loja</Link>
            </Button>
          </div>
        </div>

        {/* Layered medallion instead of a flat centered circle. */}
        <div className="relative flex flex-1 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute size-64 rotate-12 rounded-[42%] bg-cream/50 sm:size-80"
          />
          <span
            aria-hidden="true"
            className="absolute size-60 -rotate-6 rounded-[46%] bg-cream/80 sm:size-72"
          />
          <div className="relative flex size-56 items-center justify-center rounded-full bg-cream shadow-[0_28px_60px_-30px_rgba(43,42,40,0.85)] sm:size-72">
            <PawShape className="size-28 text-amber-brand sm:size-36" />
          </div>
        </div>
      </div>

      <WavyDivider variant="scallop" className="absolute right-0 bottom-0 left-0 text-cream" />
    </section>
  );
}
