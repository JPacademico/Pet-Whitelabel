import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { CalendarCheck, CalendarOff, RotateCcw, SlidersHorizontal, CalendarRange } from 'lucide-react';
import type { DateOverride, GroomingBooking, IsoDate, ServiceKind, TimeSlot, WeeklyTemplate } from '@/domain/types';
import { Badge, Button, EmptyState } from '@/design-system/primitives';
import { Legend } from '@/features/admin/shared';
import {
  addIsoDays,
  formatDisplayDate,
  formatDisplayDateShort,
  nowInBusinessTz,
  parseIsoDate,
  todayIsoDate,
  toIsoDate,
  weekdayOf,
} from '@/lib/datetime';
import { MAX_ADVANCE_DAYS } from '@/config/site';
import { bookingsAffectedBySlotRemoval } from '@/domain/availability';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/cn';
import { SlotChipGrid } from './SlotChipGrid';
import { summarizeSlots } from './slotPalette';

export interface DateOverrideEditorProps {
  service: ServiceKind;
  template: WeeklyTemplate;
  overrides: DateOverride[];
  bookings: GroomingBooking[];
  onUpsert: (override: DateOverride) => void;
}

/** An override row that says nothing (open, inheriting the template) isn't an exception — it's the
 * residue of one that was undone, and it shouldn't clutter the list. */
function isRealException(override: DateOverride): boolean {
  return override.closed || override.slots !== null;
}

export function DateOverrideEditor({
  service,
  template,
  overrides,
  bookings,
  onUpsert,
}: DateOverrideEditorProps) {
  const now = nowInBusinessTz();
  const today = todayIsoDate(now);
  const [selectedDate, setSelectedDate] = useState<IsoDate | undefined>(undefined);

  const exceptions = overrides.filter(isRealException);
  const closedDates = exceptions.filter((o) => o.closed).map((o) => parseIsoDate(o.date));
  const customDates = exceptions
    .filter((o) => !o.closed && o.slots !== null)
    .map((o) => parseIsoDate(o.date));

  const upcoming = exceptions
    .filter((o) => o.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const current = selectedDate ? overrides.find((o) => o.date === selectedDate) : undefined;
  const templateSlots = selectedDate
    ? (template.slotsByWeekday[weekdayOf(selectedDate)] ?? [])
    : [];
  const isCustom = current?.slots != null;
  const effectiveSlots = current?.slots ?? templateSlots;

  const bookedTimes = new Set(
    selectedDate
      ? bookings
          .filter((b) => b.date === selectedDate && b.status === 'scheduled')
          .map((b) => b.time)
      : [],
  );

  /** Refuses a closure that would strand a booking. Only grooming is bookable, so only grooming
   * can strand anything. Returns true when the change is safe to apply. */
  function guardRemovals(date: IsoDate, removed: TimeSlot[]): boolean {
    if (service !== 'grooming') return true;
    const affected = removed.flatMap((time) => bookingsAffectedBySlotRemoval(date, time, bookings));
    if (affected.length === 0) return true;
    notify.error(
      'Existem agendamentos nestes horários.',
      `Cancele ou remarque ${affected.length} agendamento(s) antes de fechar este horário.`,
    );
    return false;
  }

  function handleToggleClosed() {
    if (!selectedDate) return;
    const nextClosed = !current?.closed;

    if (nextClosed && !guardRemovals(selectedDate, effectiveSlots)) return;

    onUpsert({ service, date: selectedDate, closed: nextClosed, slots: current?.slots ?? null });
    notify.success(nextClosed ? 'Data marcada como fechada.' : 'Data reaberta.');
  }

  function handleUseCustomHours() {
    if (!selectedDate) return;
    // Seeded from the weekday's own template, so "personalizar" starts from what the date already
    // does rather than from an empty day.
    onUpsert({ service, date: selectedDate, closed: false, slots: [...templateSlots] });
  }

  function handleToggleSlot(time: TimeSlot) {
    if (!selectedDate) return;
    const isOpen = effectiveSlots.includes(time);
    if (isOpen && !guardRemovals(selectedDate, [time])) return;

    const nextSlots = isOpen
      ? effectiveSlots.filter((t) => t !== time)
      : [...effectiveSlots, time].sort();
    onUpsert({ service, date: selectedDate, closed: false, slots: nextSlots });
  }

  function handleResetToDefault(date: IsoDate) {
    const override = overrides.find((o) => o.date === date);
    // Reverting custom hours can drop times the template doesn't have; reopening a closed day can't
    // strand anything, so only the custom-hours case needs the guard.
    if (override?.slots) {
      const weekdaySlots = template.slotsByWeekday[weekdayOf(date)] ?? [];
      const removed = override.slots.filter((t) => !weekdaySlots.includes(t));
      if (!guardRemovals(date, removed)) return;
    }
    onUpsert({ service, date, closed: false, slots: null });
    notify.success('Data voltou ao horário padrão da semana.');
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex shrink-0 flex-col gap-3">
        <DayPicker
          mode="single"
          locale={ptBR}
          selected={selectedDate ? parseIsoDate(selectedDate) : undefined}
          onSelect={(d) => setSelectedDate(d ? toIsoDate(d) : undefined)}
          startMonth={parseIsoDate(today)}
          endMonth={parseIsoDate(addIsoDays(today, MAX_ADVANCE_DAYS))}
          modifiers={{ closed: closedDates, custom: customDates }}
          modifiersClassNames={{ closed: 'rdp-day-closed', custom: 'rdp-day-custom' }}
          className="rounded-2xl border-2 border-cream-deep bg-white p-4"
        />
        <Legend
          items={[
            { swatch: 'bg-urgent/30', label: 'Fechado' },
            { swatch: 'bg-teal/25 shadow-[inset_0_0_0_2px_var(--color-teal)]', label: 'Horário próprio' },
          ]}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="rounded-2xl border-2 border-cream-deep bg-white p-4">
          {!selectedDate ? (
            <p className="text-sm text-muted">
              Selecione uma data no calendário para fechá-la ou dar a ela um horário próprio,
              diferente do padrão da semana.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  {/* `capitalize` would title-case the whole string ("Quarta-Feira, 12 De
                    * Agosto"); only the first letter should change. */}
                  <p className="font-display font-bold text-charcoal first-letter:uppercase">
                    {formatDisplayDate(selectedDate)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {current?.closed
                      ? 'Fechado o dia inteiro — não aparece como disponível no site.'
                      : isCustom
                        ? `Horário próprio: ${summarizeSlots(effectiveSlots).join(' · ') || 'nenhum horário'}`
                        : 'Segue o horário padrão da semana.'}
                  </p>
                </div>
                <Badge
                  variant={current?.closed ? 'urgent' : isCustom ? 'new' : 'neutral'}
                >
                  {current?.closed ? 'Fechado' : isCustom ? 'Personalizado' : 'Padrão'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={current?.closed ? 'secondary' : 'danger'}
                  size="sm"
                  onClick={handleToggleClosed}
                >
                  {current?.closed ? (
                    <>
                      <CalendarCheck className="size-4" aria-hidden="true" />
                      Reabrir esta data
                    </>
                  ) : (
                    <>
                      <CalendarOff className="size-4" aria-hidden="true" />
                      Fechar esta data
                    </>
                  )}
                </Button>

                {!current?.closed &&
                  (isCustom ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResetToDefault(selectedDate)}
                    >
                      <RotateCcw className="size-4" aria-hidden="true" />
                      Voltar ao padrão
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={handleUseCustomHours}>
                      <SlidersHorizontal className="size-4" aria-hidden="true" />
                      Personalizar horários deste dia
                    </Button>
                  ))}
              </div>

              {!current?.closed && isCustom && (
                <div className="rounded-xl bg-cream p-3">
                  <SlotChipGrid
                    value={effectiveSlots}
                    bookedTimes={bookedTimes}
                    onToggle={handleToggleSlot}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border-2 border-cream-deep bg-white p-4">
          <h3 className="mb-3 font-display font-bold text-charcoal">Próximas exceções</h3>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarRange className="size-8" />}
              title="Nenhuma exceção marcada"
              description="Feriados e dias com horário diferente aparecem aqui."
              className="py-8"
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((override) => (
                <li
                  key={override.date}
                  className={cn(
                    'flex flex-wrap items-center gap-2 rounded-xl border-2 px-3 py-2 transition-colors',
                    override.closed
                      ? 'border-urgent/25 bg-urgent/10'
                      : 'border-teal/25 bg-teal/10',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedDate(override.date)}
                    className="text-left text-sm font-bold text-charcoal underline-offset-2 hover:underline"
                  >
                    {formatDisplayDateShort(override.date)}
                  </button>
                  <span className="text-xs text-muted">
                    {override.closed
                      ? 'Fechado'
                      : (summarizeSlots(override.slots ?? []).join(' · ') || 'Sem horários')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => handleResetToDefault(override.date)}
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    Voltar ao padrão
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
