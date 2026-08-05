import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  MessageCircle,
  Camera,
  HeartPulse,
  Utensils,
  TreePine,
  ShieldCheck,
  Clock,
  BedDouble,
  CalendarRange,
} from 'lucide-react';
import { Button, Card } from '@/design-system/primitives';
import { SectionHeading, Blob, WavyDivider, Marquee } from '@/design-system/decorative';
import { Reveal, FloatingObject, CountUp } from '@/design-system/motion';
import { SITE } from '@/config/site';
import { buildWhatsappUrl, whatsappTemplates } from '@/lib/whatsapp';
import { formatDisplayDate, toIsoDate } from '@/lib/datetime';
import { HotelCalendar } from './HotelCalendar';
import { useHotelAvailability } from './useHotelAvailability';

const BENEFITS = [
  {
    icon: TreePine,
    title: 'Espaço amplo e arejado',
    description: 'Área de recreação coberta e pátio externo para gastar energia todos os dias.',
  },
  {
    icon: HeartPulse,
    title: 'Acompanhamento veterinário',
    description: 'Nossa clínica fica no mesmo endereço — cuidado imediato se precisar.',
  },
  {
    icon: Camera,
    title: 'Fotos e vídeos diários',
    description: 'Você recebe atualizações do seu pet no WhatsApp todos os dias.',
  },
  {
    icon: Utensils,
    title: 'Alimentação personalizada',
    description: 'Mantemos a ração e a rotina alimentar que seu pet já conhece.',
  },
  {
    icon: ShieldCheck,
    title: 'Ambiente monitorado',
    description: 'Câmeras 24h e equipe presente em período integral.',
  },
  {
    icon: BedDouble,
    title: 'Descanso individual',
    description: 'Cada hóspede tem seu espaço para dormir com conforto e tranquilidade.',
  },
];

const STATS = [
  { value: 850, suffix: '+', label: 'hospedagens realizadas' },
  { value: 24, suffix: 'h', label: 'de monitoramento' },
  { value: 12, suffix: '', label: 'anos de experiência' },
];

export function HotelPage() {
  const { availability, loading } = useHotelAvailability();
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    const ms = range.to.getTime() - range.from.getTime();
    return Math.max(1, Math.round(ms / 86_400_000));
  }, [range]);

  const whatsappUrl = useMemo(
    () =>
      buildWhatsappUrl(
        SITE.whatsapp,
        whatsappTemplates.hotelStay({
          checkIn: range?.from ? formatDisplayDate(toIsoDate(range.from)) : undefined,
          checkOut: range?.to ? formatDisplayDate(toIsoDate(range.to)) : undefined,
        }),
      ),
    [range],
  );

  return (
    <div className="relative overflow-hidden">
      <title>Hotel para Pets — Pet Studio</title>

      {/* Hero */}
      <section className="relative overflow-hidden bg-teal pt-12 pb-20 text-white">
        <Blob className="bg-white/10" size={420} top="-14%" left="-10%" />
        <Blob className="bg-amber-brand/25" size={300} top="45%" right="-8%" delay={3} />

        <FloatingObject
          shape="bone"
          top="14%"
          left="8%"
          size={58}
          interactive
          label="Ossinho saltitante"
          className="hidden text-white/70 sm:block"
        />
        <FloatingObject
          shape="yarn"
          top="62%"
          left="86%"
          size={62}
          delay={1.4}
          interactive
          label="Novelo de lã"
          className="hidden text-amber-soft sm:block"
        />
        <FloatingObject
          shape="fish"
          top="24%"
          left="80%"
          size={44}
          delay={2.2}
          className="hidden text-white/40 lg:block"
        />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="font-script text-3xl text-amber-soft">de férias?</span>
          <h1 className="mt-1 font-display text-4xl leading-tight font-extrabold sm:text-5xl">
            Hotel para Pets
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            Seu pet hospedado com carinho, rotina e acompanhamento veterinário — enquanto você
            viaja tranquilo.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 border-white text-white hover:bg-white hover:text-teal">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-5" aria-hidden="true" />
              Agende conosco
            </a>
          </Button>
        </div>

        <WavyDivider variant="scallop" className="absolute right-0 bottom-0 left-0 text-cream" />
      </section>

      <Marquee
        items={['hospedagem com amor', 'recreação diária', 'fotos todo dia', 'veterinário no local', 'cama quentinha']}
        duration={34}
        className="bg-amber-brand py-3 text-charcoal"
      />

      {/* Benefits */}
      <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading
          eyebrow="por que o Pet Studio"
          title="Benefícios da hospedagem"
          description="Tudo pensado para que a rotina do seu pet mude o mínimo possível."
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, i) => {
            const BenefitIcon = benefit.icon;
            return (
              <Reveal key={benefit.title} delay={(i % 3) * 90}>
                <Card
                  hoverable
                  className={`flex h-full flex-col gap-2 ${
                    i % 3 === 1 ? 'lg:translate-y-5' : ''
                  }`}
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-teal/12 text-teal">
                    <BenefitIcon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-1 font-display font-bold text-charcoal">{benefit.title}</h3>
                  <p className="text-sm text-muted">{benefit.description}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-cream-deep py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:px-6">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 110} className="text-center">
              <p className="font-display text-4xl font-extrabold text-teal">
                <CountUp to={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Availability */}
      <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading
          eyebrow="próximos 2 meses"
          title="Disponibilidade"
          description="Selecione a data de entrada e de saída para já enviar tudo pronto no WhatsApp."
        />

        <Reveal delay={80} className="mt-8">
          {loading ? (
            <div className="mx-auto h-96 w-full max-w-2xl animate-pulse rounded-3xl bg-cream-deep" />
          ) : (
            <HotelCalendar availability={availability} range={range} onRangeChange={setRange} />
          )}
        </Reveal>

        <Reveal delay={120}>
          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 rounded-3xl border-2 border-cream-deep bg-white p-6 text-center">
            {range?.from ? (
              <div className="flex flex-col items-center gap-1">
                <p className="flex items-center gap-2 font-display font-bold text-charcoal">
                  <CalendarRange className="size-5 text-teal" aria-hidden="true" />
                  {formatDisplayDate(toIsoDate(range.from))}
                  {range.to && <> — {formatDisplayDate(toIsoDate(range.to))}</>}
                </p>
                {nights > 0 && (
                  <p className="flex items-center gap-1.5 text-sm text-muted">
                    <Clock className="size-4" aria-hidden="true" />
                    {nights} {nights === 1 ? 'diária' : 'diárias'}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Escolha as datas acima (opcional) — ou fale direto com a gente.
              </p>
            )}

            <Button asChild size="lg">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-5" aria-hidden="true" />
                Agende conosco
              </a>
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
