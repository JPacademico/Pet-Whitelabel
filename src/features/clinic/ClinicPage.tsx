import { useMemo, useState } from 'react';
import {
  Stethoscope,
  Syringe,
  ClipboardList,
  Cross,
  Siren,
  MessageCircle,
  Check,
  Microscope,
} from 'lucide-react';
import { Badge, Button } from '@/design-system/primitives';
import { SectionHeading, Blob, WavyDivider } from '@/design-system/decorative';
import { Reveal, FloatingObject } from '@/design-system/motion';
import { SITE } from '@/config/site';
import { buildWhatsappUrl, whatsappTemplates } from '@/lib/whatsapp';
import { cn } from '@/lib/cn';
import { formatDisplayDate } from '@/lib/datetime';
import { baseSlotsForDate } from '@/domain/availability';
import type { IsoDate } from '@/domain/types';
import { ClinicCalendar } from './ClinicCalendar';
import { useClinicAvailability } from './useClinicAvailability';

interface ClinicService {
  id: string;
  icon: typeof Stethoscope;
  title: string;
  description: string;
  /** Exact wording injected into the WhatsApp message when this card is selected. */
  whatsappLabel: string;
  urgent?: boolean;
}

const SERVICES: ClinicService[] = [
  {
    id: 'consulta',
    icon: Stethoscope,
    title: 'Consulta geral',
    description: 'Avaliação clínica completa do seu pet.',
    whatsappLabel: 'uma consulta geral',
  },
  {
    id: 'vacinacao',
    icon: Syringe,
    title: 'Vacinação',
    description: 'Calendário de vacinas em dia, com carteirinha.',
    whatsappLabel: 'uma vacinação',
  },
  {
    id: 'exames',
    icon: Microscope,
    title: 'Exames',
    description: 'Exames laboratoriais e de imagem.',
    whatsappLabel: 'exames laboratoriais',
  },
  {
    id: 'cirurgia',
    icon: Cross,
    title: 'Cirurgias',
    description: 'Procedimentos com equipe especializada.',
    whatsappLabel: 'uma avaliação cirúrgica',
  },
  {
    id: 'checkup',
    icon: ClipboardList,
    title: 'Check-up anual',
    description: 'Pacote preventivo completo para cães e gatos.',
    whatsappLabel: 'um check-up anual',
  },
  {
    id: 'emergencia',
    icon: Siren,
    title: 'Emergência',
    description: 'Atendimento prioritário para casos urgentes.',
    whatsappLabel: 'um atendimento de EMERGÊNCIA',
    urgent: true,
  },
];

export function ClinicPage() {
  const { template, overrides, demand, loading } = useClinicAvailability();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<IsoDate | undefined>(undefined);

  const selectedService = SERVICES.find((s) => s.id === selectedServiceId) ?? null;

  const whatsappUrl = useMemo(() => {
    if (!selectedService) {
      return buildWhatsappUrl(SITE.whatsapp, whatsappTemplates.clinicConsult({}));
    }
    const slots = selectedDate ? baseSlotsForDate(selectedDate, template, overrides) : undefined;
    return buildWhatsappUrl(
      SITE.whatsapp,
      whatsappTemplates.clinicService({
        service: selectedService.whatsappLabel,
        date: selectedDate ? formatDisplayDate(selectedDate) : undefined,
        slots,
      }),
    );
  }, [selectedService, selectedDate, template, overrides]);

  return (
    <div className="relative overflow-hidden">
      <title>Clínica Veterinária — Pet Studio</title>

      <Blob className="bg-urgent/10" size={360} top="2%" right="-12%" />
      <Blob className="bg-teal/10" size={420} top="55%" left="-16%" delay={6} />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="relative">
          <FloatingObject
            shape="paw"
            top="-6%"
            left="88%"
            size={54}
            interactive
            label="Patinha saltitante"
            className="hidden text-teal/60 sm:block"
          />
          <SectionHeading
            eyebrow="saúde em primeiro lugar"
            title="Clínica Veterinária"
            description="Escolha o serviço, veja a disponibilidade e fale conosco — a mensagem já vai pronta."
          />
        </div>

        {/* Step 1 — service selection */}
        <Reveal delay={60} className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-extrabold text-cream">
              1
            </span>
            <h3 className="font-display text-lg font-bold text-charcoal">
              Qual serviço você precisa?
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => {
              const ServiceIcon = service.icon;
              const isSelected = selectedServiceId === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedServiceId(isSelected ? null : service.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'group relative flex flex-col gap-2 rounded-2xl border-2 bg-white p-5 text-left',
                    'transition-all duration-250 ease-out-soft hover:-translate-y-1.5',
                    // Staggered tilt keeps the grid from reading as a plain table.
                    i % 3 === 0 && 'lg:-rotate-[0.6deg]',
                    i % 3 === 2 && 'lg:rotate-[0.6deg]',
                    isSelected
                      ? 'border-teal shadow-[0_18px_40px_-22px_var(--color-teal)]'
                      : service.urgent
                        ? 'border-urgent/60 hover:border-urgent'
                        : 'border-cream-deep hover:border-teal',
                  )}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-teal text-white">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <ServiceIcon
                      className={cn(
                        'size-7 transition-transform duration-300 ease-out-soft group-hover:scale-115 group-hover:-rotate-8',
                        service.urgent ? 'text-urgent' : 'text-teal',
                      )}
                      aria-hidden="true"
                    />
                    <h4 className="font-display font-bold text-charcoal">{service.title}</h4>
                  </div>

                  {service.urgent && <Badge variant="urgent">Urgente</Badge>}
                  <p className="text-sm text-muted">{service.description}</p>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Step 2 — availability */}
        <Reveal delay={80} className="mt-12">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-extrabold text-cream">
              2
            </span>
            <h3 className="font-display text-lg font-bold text-charcoal">
              Veja a disponibilidade
              <span className="ml-2 text-sm font-normal text-muted">(opcional)</span>
            </h3>
          </div>

          {loading ? (
            <div className="h-96 w-full animate-pulse rounded-3xl bg-cream-deep" />
          ) : (
            <ClinicCalendar
              template={template}
              overrides={overrides}
              demand={demand}
              selected={selectedDate}
              onSelect={setSelectedDate}
            />
          )}
        </Reveal>
      </div>

      {/* Step 3 — sticky CTA band that reflects the current selection */}
      <div className="relative bg-charcoal py-12 text-cream">
        <WavyDivider variant="wave" className="absolute top-0 right-0 left-0 rotate-180 text-cream" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <span className="flex size-8 items-center justify-center rounded-full bg-amber-brand text-sm font-extrabold text-charcoal">
            3
          </span>
          <p className="font-display text-2xl font-bold">
            {selectedService
              ? `Vamos agendar ${selectedService.title.toLowerCase()}?`
              : 'Pronto para agendar?'}
          </p>
          <p className="text-cream/70">
            {selectedService ? (
              <>
                Sua mensagem já vai preenchida com <strong className="text-amber-soft">{selectedService.title}</strong>
                {selectedDate && (
                  <>
                    {' '}
                    para <strong className="text-amber-soft">{formatDisplayDate(selectedDate)}</strong>
                  </>
                )}
                .
              </>
            ) : (
              'Selecione um serviço acima para personalizar a mensagem, ou fale conosco direto.'
            )}
          </p>
          <Button asChild size="lg" className="mt-1">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-5" aria-hidden="true" />
              Agendar Consulta
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
