import { useCallback, useMemo, useState } from 'react';
import {
  CalendarCog,
  CalendarRange,
  Clock,
  Gauge,
  RotateCcw,
  Save,
  Scissors,
  Stethoscope,
  Hotel,
} from 'lucide-react';
import type {
  ClinicDemand,
  DateOverride,
  HotelAvailability,
  IsoDate,
  ServiceKind,
  WeeklyTemplate,
} from '@/domain/types';
import { availabilityRepository, bookingRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import { Button, Skeleton } from '@/design-system/primitives';
import { AdminPageHeader, AdminSection } from '@/features/admin/shared';
import { baseSlotsForDate } from '@/domain/availability';
import { addIsoDays, nowInBusinessTz, todayIsoDate } from '@/lib/datetime';
import { MAX_ADVANCE_DAYS } from '@/config/site';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/cn';
import { WeeklyTemplateEditor } from './WeeklyTemplateEditor';
import { DateOverrideEditor } from './DateOverrideEditor';
import { ClinicDemandEditor } from './ClinicDemandEditor';

interface ServiceTab {
  label: string;
  icon: typeof Scissors;
  /** What editing this tab actually changes on the public site. */
  blurb: string;
}

// Keyed by ServiceKind so the active tab is always resolvable without a fallback.
const TAB_META: Record<ServiceKind, ServiceTab> = {
  grooming: {
    label: 'Banho & Tosa',
    icon: Scissors,
    blurb: 'Estes horários são os que o cliente pode reservar em /banho-e-tosa.',
  },
  clinic: {
    label: 'Clínica',
    icon: Stethoscope,
    blurb: 'Horários exibidos em /clinica. A consulta é confirmada pelo WhatsApp, não pelo site.',
  },
  hotel: {
    label: 'Hotel',
    icon: Hotel,
    blurb: 'Horários de check-in e check-out exibidos em /hotel.',
  },
};

const TAB_ORDER: ServiceKind[] = ['grooming', 'clinic', 'hotel'];

export function AdminCalendarPage() {
  const [service, setService] = useState<ServiceKind>('grooming');
  const [draft, setDraft] = useState<WeeklyTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  const templateFetcher = useCallback(
    () => availabilityRepository.getWeeklyTemplate(service),
    [service],
  );
  const overridesFetcher = useCallback(
    () => availabilityRepository.listOverrides(service),
    [service],
  );
  const bookingsFetcher = useCallback(() => bookingRepository.list(), []);
  const demandFetcher = useCallback(() => availabilityRepository.listClinicDemand(), []);
  const hotelFetcher = useCallback(() => availabilityRepository.listHotelAvailability(), []);

  const { data: template } = useLiveQuery<WeeklyTemplate>('availability', templateFetcher);
  const { data: overrides } = useLiveQuery<DateOverride[]>('availability', overridesFetcher);
  const { data: bookings } = useLiveQuery('bookings', bookingsFetcher);
  const { data: demand } = useLiveQuery<ClinicDemand[]>('availability', demandFetcher);
  const { data: hotelAvailability } = useLiveQuery<HotelAvailability[]>(
    'availability',
    hotelFetcher,
  );

  // Template edits are batched into a draft and saved explicitly — toggling 40 slots shouldn't mean
  // 40 writes, and the admin gets a chance to back out. `draft === null` means "no local edits",
  // so the saved template shows through; deriving it this way avoids syncing prop->state in an effect.
  const current = draft ?? template ?? null;
  const isDirty = !!draft && !!template && JSON.stringify(draft) !== JSON.stringify(template);
  const activeTab = TAB_META[service];

  /** Dates within the booking window where this service has no hours at all — used to warn the
   * admin that a demand level set there will never surface publicly. */
  const closedDates = useMemo(() => {
    if (!template || !overrides) return new Set<IsoDate>();
    const today = todayIsoDate(nowInBusinessTz());
    const closed = new Set<IsoDate>();
    for (let offset = 0; offset <= MAX_ADVANCE_DAYS; offset++) {
      const date = addIsoDays(today, offset);
      if (baseSlotsForDate(date, template, overrides).length === 0) closed.add(date);
    }
    return closed;
  }, [template, overrides]);

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    await availabilityRepository.setWeeklyTemplate(service, draft);
    setSaving(false);
    setDraft(null); // fall back to the refetched saved template
    notify.success('Horários salvos.', 'As alterações já valem para o site público.');
  }

  return (
    <div>
      <title>Calendário — Pet Studio Admin</title>

      <AdminPageHeader
        icon={CalendarCog}
        eyebrow="Disponibilidade"
        title="Calendário"
        description="Defina quando cada serviço atende. O que estiver aberto aqui é exatamente o que o cliente vê no site."
      />

      <div
        className="ds-admin-enter mb-4 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Serviço"
      >
        {TAB_ORDER.map((kind) => {
          const tab = TAB_META[kind];
          const TabIcon = tab.icon;
          const isActive = service === kind;
          return (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setService(kind);
                setDraft(null); // a draft belongs to one service; don't leak it across tabs
              }}
              className={cn(
                'group flex min-h-11 items-center gap-2 rounded-full border-2 px-5 text-sm font-bold',
                'transition-all duration-200 ease-out-soft',
                isActive
                  ? 'border-amber-brand bg-amber-brand text-charcoal shadow-[0_8px_20px_-10px_var(--color-amber-brand)]'
                  : 'border-cream-deep bg-white text-charcoal hover:-translate-y-0.5 hover:border-amber-brand',
              )}
            >
              <TabIcon
                className={cn(
                  'size-4 transition-transform duration-300 ease-out-soft',
                  !isActive && 'group-hover:scale-115 group-hover:-rotate-12',
                )}
                aria-hidden="true"
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Unsaved-changes bar. Sticks just under the demo banner so it stays reachable however far
       * down the hour grid you've scrolled — the whole reason the nav was made sticky too. */}
      {isDirty && (
        <div className="ds-slide-down sticky top-16 z-30 mb-4 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-charcoal bg-charcoal p-3 text-cream shadow-[0_16px_36px_-20px_rgba(43,42,40,0.9)] md:top-4">
          <span className="ds-pulse-dot size-2.5 shrink-0 rounded-full bg-amber-brand" aria-hidden="true" />
          <span className="text-sm font-semibold">
            Alterações não salvas em {activeTab.label}.
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-cream/80 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Descartar
            </button>
            <Button onClick={handleSave} loading={saving} size="sm">
              <Save className="size-4" aria-hidden="true" />
              Salvar horários
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <AdminSection
          icon={Clock}
          title="Horário padrão da semana"
          description={activeTab.blurb}
          index={0}
          actions={
            !isDirty && (
              <span className="text-xs text-muted">Tudo salvo</span>
            )
          }
        >
          {current ? (
            <WeeklyTemplateEditor
              service={service}
              template={current}
              bookings={bookings ?? []}
              overrides={overrides ?? []}
              onChange={setDraft}
            />
          ) : (
            <Skeleton className="h-96 w-full" />
          )}
        </AdminSection>

        <AdminSection
          icon={CalendarRange}
          title="Exceções por data"
          description="Feriados, folgas e dias com horário diferente. Uma exceção sempre vence o horário padrão."
          index={1}
        >
          {current ? (
            <DateOverrideEditor
              service={service}
              template={current}
              overrides={overrides ?? []}
              bookings={bookings ?? []}
              onUpsert={(override) => void availabilityRepository.upsertOverride(override)}
            />
          ) : (
            <Skeleton className="h-80 w-full" />
          )}
        </AdminSection>

        {service === 'clinic' && (
          <AdminSection
            icon={Gauge}
            title="Nível de demanda"
            description="O selo de movimento que aparece no calendário público da clínica."
            index={2}
          >
            <ClinicDemandEditor
              demand={demand ?? []}
              closedDates={closedDates}
              onSet={(entry) => {
                void availabilityRepository.setClinicDemand(entry);
                notify.success('Nível de demanda atualizado.');
              }}
            />
          </AdminSection>
        )}

        {service === 'hotel' && (
          <AdminSection
            icon={Gauge}
            title="Vagas por noite"
            description="A ocupação que aparece no calendário público do hotel."
            index={2}
          >
            <ClinicDemandEditor
              demand={hotelAvailability ?? []}
              closedDates={closedDates}
              labels={{
                free: 'Vagas disponíveis',
                moderate: 'Poucas vagas',
                high: 'Quase lotado',
              }}
              onSet={(entry) => {
                void availabilityRepository.setHotelAvailability(entry);
                notify.success('Disponibilidade do hotel atualizada.');
              }}
            />
          </AdminSection>
        )}
      </div>
    </div>
  );
}
