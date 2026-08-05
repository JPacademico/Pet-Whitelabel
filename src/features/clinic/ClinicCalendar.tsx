import { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { CalendarOff, Clock } from 'lucide-react';
import type { ClinicDemand, DateOverride, IsoDate, WeeklyTemplate } from '@/domain/types';
import {
  addIsoDays,
  formatDisplayDate,
  nowInBusinessTz,
  parseIsoDate,
  todayIsoDate,
  toIsoDate,
  isPastSlot,
} from '@/lib/datetime';
import { baseSlotsForDate, resolveDemandLevel } from '@/domain/availability';
import { MAX_ADVANCE_DAYS } from '@/config/site';
import { cn } from '@/lib/cn';

export interface ClinicCalendarProps {
  template: WeeklyTemplate;
  overrides: DateOverride[];
  demand: ClinicDemand[];
  selected: IsoDate | undefined;
  onSelect: (date: IsoDate | undefined) => void;
}

const DEMAND_COPY = {
  free: { label: 'Boa disponibilidade', className: 'text-success' },
  moderate: { label: 'Movimento moderado', className: 'text-amber-brand' },
  high: { label: 'Alta demanda', className: 'text-urgent' },
  closed: { label: 'Fechado', className: 'text-muted' },
} as const;

/**
 * Interactive availability calendar. Selecting a day reveals the consultation times open that day,
 * but booking still happens over WhatsApp — the times are shown so the visitor can name one.
 */
export function ClinicCalendar({
  template,
  overrides,
  demand,
  selected,
  onSelect,
}: ClinicCalendarProps) {
  const now = nowInBusinessTz();
  const today = todayIsoDate(now);
  const maxDate = addIsoDays(today, MAX_ADVANCE_DAYS);

  const isClosed = (date: Date) =>
    baseSlotsForDate(toIsoDate(date), template, overrides).length === 0;

  const levelIs = (level: ClinicDemand['level']) => (date: Date) =>
    !isClosed(date) && resolveDemandLevel(toIsoDate(date), demand) === level;

  const selectedSlots = useMemo(() => {
    if (!selected) return [];
    return baseSlotsForDate(selected, template, overrides)
      .slice()
      .sort()
      .filter((time) => !isPastSlot(selected, time, now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, template, overrides]);

  const selectedLevel = selected ? resolveDemandLevel(selected, demand) : null;
  const selectedClosed = selected
    ? baseSlotsForDate(selected, template, overrides).length === 0
    : false;

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
      <DayPicker
        mode="single"
        locale={ptBR}
        selected={selected ? parseIsoDate(selected) : undefined}
        onSelect={(date) => onSelect(date ? toIsoDate(date) : undefined)}
        startMonth={parseIsoDate(today)}
        endMonth={parseIsoDate(maxDate)}
        disabled={[isClosed, { before: parseIsoDate(today) }]}
        modifiers={{
          free: levelIs('free'),
          moderate: levelIs('moderate'),
          high: levelIs('high'),
        }}
        modifiersClassNames={{
          free: 'rdp-day-demand-free',
          moderate: 'rdp-day-demand-moderate',
          high: 'rdp-day-demand-high',
        }}
        className="mx-auto rounded-3xl border-2 border-cream-deep bg-white p-4 shadow-[0_16px_40px_-28px_rgba(43,42,40,0.7)]"
      />

      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border-2 border-cream-deep bg-white p-5">
          {!selected ? (
            <p className="text-sm text-muted">
              Escolha um dia no calendário para ver os horários de consulta disponíveis.
            </p>
          ) : selectedClosed ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <CalendarOff className="size-4" aria-hidden="true" />
              Não atendemos nesta data.
            </div>
          ) : (
            <>
              <p className="font-display font-bold text-charcoal capitalize">
                {formatDisplayDate(selected)}
              </p>
              {selectedLevel && (
                <p className={cn('mt-1 text-sm font-bold', DEMAND_COPY[selectedLevel].className)}>
                  {DEMAND_COPY[selectedLevel].label}
                </p>
              )}

              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold tracking-widest text-muted uppercase">
                  <Clock className="size-3.5" aria-hidden="true" />
                  Horários de atendimento
                </p>
                {selectedSlots.length === 0 ? (
                  <p className="text-sm text-muted">
                    Não há mais horários para hoje. Escolha outro dia.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {selectedSlots.map((time) => (
                      <li
                        key={time}
                        className="rounded-xl border-2 border-cream-deep bg-cream px-3 py-2 text-sm font-bold text-charcoal"
                      >
                        {time}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-muted">
                  Estes são os horários de atendimento da data. A confirmação é feita pelo WhatsApp.
                </p>
              </div>
            </>
          )}
        </div>

        <ul className="flex flex-wrap gap-4 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-success/70" /> Boa disponibilidade
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-amber-brand/70" /> Movimento moderado
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-urgent/70" /> Alta demanda
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-charcoal/25" /> Fechado
          </li>
        </ul>
      </div>
    </div>
  );
}
