import { useCallback, useState } from 'react';
import { Save } from 'lucide-react';
import type {
  ClinicDemand,
  DateOverride,
  HotelAvailability,
  ServiceKind,
  WeeklyTemplate,
} from '@/domain/types';
import { availabilityRepository, bookingRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import { Button } from '@/design-system/primitives';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/cn';
import { WeeklyTemplateEditor } from './WeeklyTemplateEditor';
import { DateOverrideEditor } from './DateOverrideEditor';
import { ClinicDemandEditor } from './ClinicDemandEditor';

const TABS: { value: ServiceKind; label: string }[] = [
  { value: 'grooming', label: 'Banho & Tosa' },
  { value: 'clinic', label: 'Clínica' },
  { value: 'hotel', label: 'Hotel' },
];

export function AdminCalendarPage() {
  const [service, setService] = useState<ServiceKind>('grooming');
  const [draft, setDraft] = useState<WeeklyTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  const templateFetcher = useCallback(
    () => availabilityRepository.getWeeklyTemplate(service),
    [service],
  );
  const overridesFetcher = useCallback(() => availabilityRepository.listOverrides(service), [service]);
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
      <h1 className="mb-4 font-display text-2xl font-bold text-charcoal">Calendário</h1>

      <div className="mb-6 flex gap-2" role="tablist" aria-label="Serviço">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={service === tab.value}
            onClick={() => {
              setService(tab.value);
              setDraft(null); // a draft belongs to one service; don't leak it across tabs
            }}
            className={cn(
              'min-h-11 rounded-full px-5 text-sm font-semibold transition-colors',
              service === tab.value
                ? 'bg-amber-brand text-charcoal'
                : 'bg-white text-charcoal hover:bg-cream',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-charcoal">Horário padrão da semana</h2>
          <Button onClick={handleSave} loading={saving} disabled={!isDirty}>
            <Save className="size-4" aria-hidden="true" />
            Salvar horários
          </Button>
        </div>
        {current ? (
          <WeeklyTemplateEditor
            service={service}
            template={current}
            bookings={bookings ?? []}
            overrides={overrides ?? []}
            onChange={setDraft}
          />
        ) : (
          <p className="text-muted">Carregando…</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-charcoal">Exceções por data</h2>
        <DateOverrideEditor
          service={service}
          overrides={overrides ?? []}
          bookings={bookings ?? []}
          onUpsert={(override) => void availabilityRepository.upsertOverride(override)}
        />
      </section>

      {service === 'clinic' && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-charcoal">
            Nível de demanda (calendário público)
          </h2>
          <ClinicDemandEditor
            demand={demand ?? []}
            onSet={(entry) => {
              void availabilityRepository.setClinicDemand(entry);
              notify.success('Nível de demanda atualizado.');
            }}
          />
        </section>
      )}

      {service === 'hotel' && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-charcoal">
            Vagas por noite (calendário público do hotel)
          </h2>
          <ClinicDemandEditor
            demand={hotelAvailability ?? []}
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
        </section>
      )}
    </div>
  );
}
