import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { CalendarOff, CircleCheck, CircleAlert, Flame } from 'lucide-react';
import type { ClinicDemand, DemandLevel, IsoDate } from '@/domain/types';
import {
  addIsoDays,
  formatDisplayDate,
  nowInBusinessTz,
  parseIsoDate,
  todayIsoDate,
  toIsoDate,
  weekdayOf,
} from '@/lib/datetime';
import { MAX_ADVANCE_DAYS } from '@/config/site';
import { resolveDemandLevel } from '@/domain/availability';
import { Legend } from '@/features/admin/shared';
import { cn } from '@/lib/cn';
import { WEEKDAY_SHORT } from './slotPalette';

type EditableLevel = Exclude<DemandLevel, 'closed'>;

export interface ClinicDemandEditorProps {
  demand: ClinicDemand[];
  onSet: (entry: ClinicDemand) => void;
  /** Override the level wording — the hotel talks about vacancies, the clinic about demand. */
  labels?: Partial<Record<EditableLevel, string>>;
  /** Dates the service is closed on. The level still saves, but it never reaches the public
   * calendar on those days, and saying so up front avoids a confusing "I set it and nothing
   * changed" loop. */
  closedDates?: Set<IsoDate>;
}

const DEFAULT_LABELS: Record<EditableLevel, string> = {
  free: 'Livre',
  moderate: 'Moderado',
  high: 'Alta demanda',
};

const LEVEL_META: Record<
  EditableLevel,
  { icon: typeof CircleCheck; active: string; swatch: string; hint: string }
> = {
  free: {
    icon: CircleCheck,
    active: 'border-success bg-success/15 text-success',
    swatch: 'bg-success/40',
    hint: 'Agenda tranquila',
  },
  moderate: {
    icon: CircleAlert,
    active: 'border-amber-brand bg-amber-brand/20 text-charcoal',
    swatch: 'bg-amber-brand/50',
    hint: 'Movimento médio',
  },
  high: {
    icon: Flame,
    active: 'border-urgent bg-urgent/15 text-urgent',
    swatch: 'bg-urgent/40',
    hint: 'Quase sem espaço',
  },
};

const LEVEL_ORDER: EditableLevel[] = ['free', 'moderate', 'high'];

const STRIP_DAYS = 14;

export function ClinicDemandEditor({
  demand,
  onSet,
  labels,
  closedDates,
}: ClinicDemandEditorProps) {
  const levelLabels = { ...DEFAULT_LABELS, ...labels };
  const now = nowInBusinessTz();
  const today = todayIsoDate(now);
  const [selectedDate, setSelectedDate] = useState<IsoDate | undefined>(undefined);

  const currentLevel = selectedDate ? resolveDemandLevel(selectedDate, demand) : undefined;
  const selectedIsClosed = selectedDate ? (closedDates?.has(selectedDate) ?? false) : false;

  const levelIs = (level: DemandLevel) => (date: Date) =>
    resolveDemandLevel(toIsoDate(date), demand) === level;

  // A fortnight of upcoming days, so the admin can see the run of levels without clicking through
  // the calendar one date at a time.
  const strip = Array.from({ length: STRIP_DAYS }, (_, i) => {
    const date = addIsoDays(today, i);
    return {
      date,
      level: resolveDemandLevel(date, demand),
      closed: closedDates?.has(date) ?? false,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex shrink-0 flex-col gap-3">
          <DayPicker
            mode="single"
            locale={ptBR}
            selected={selectedDate ? parseIsoDate(selectedDate) : undefined}
            onSelect={(d) => setSelectedDate(d ? toIsoDate(d) : undefined)}
            startMonth={parseIsoDate(today)}
            endMonth={parseIsoDate(addIsoDays(today, MAX_ADVANCE_DAYS))}
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
            className="rounded-2xl border-2 border-cream-deep bg-white p-4"
          />
          <Legend
            items={LEVEL_ORDER.map((level) => ({
              swatch: LEVEL_META[level].swatch,
              label: levelLabels[level],
            }))}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="rounded-2xl border-2 border-cream-deep bg-white p-4">
            {!selectedDate ? (
              <p className="text-sm text-muted">
                Selecione uma data para definir o nível exibido no calendário público.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="font-display font-bold text-charcoal first-letter:uppercase">
                  {formatDisplayDate(selectedDate)}
                </p>

                {selectedIsClosed && (
                  <p className="flex items-start gap-2 rounded-xl bg-urgent/10 px-3 py-2 text-sm text-urgent">
                    <CalendarOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    Esta data está fechada no horário do serviço, então o nível não aparece no site.
                  </p>
                )}

                <p className="text-sm text-muted">Nível exibido publicamente:</p>
                <div className="flex flex-wrap gap-2">
                  {LEVEL_ORDER.map((level) => {
                    const meta = LEVEL_META[level];
                    const LevelIcon = meta.icon;
                    const isActive = currentLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => onSet({ date: selectedDate, level })}
                        aria-pressed={isActive}
                        className={cn(
                          'flex min-h-11 flex-col items-start gap-0.5 rounded-xl border-2 px-4 py-2 text-sm font-semibold',
                          'transition-all duration-200 ease-out-soft',
                          isActive
                            ? meta.active
                            : 'border-cream-deep text-muted hover:-translate-y-0.5 hover:border-teal hover:text-teal-deep',
                        )}
                      >
                        <span className="flex items-center gap-1.5">
                          <LevelIcon className="size-4" aria-hidden="true" />
                          {levelLabels[level]}
                        </span>
                        <span className="text-[0.7rem] font-normal opacity-75">{meta.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border-2 border-cream-deep bg-white p-4">
            <h3 className="mb-3 font-display font-bold text-charcoal">Próximos {STRIP_DAYS} dias</h3>
            <ul className="flex flex-wrap gap-1.5">
              {strip.map((day) => {
                const meta = day.level === 'closed' ? null : LEVEL_META[day.level];
                const levelLabel = day.level === 'closed' ? 'Fechado' : levelLabels[day.level];
                const isSelected = selectedDate === day.date;
                return (
                  <li key={day.date}>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(day.date)}
                      aria-pressed={isSelected}
                      title={`${formatDisplayDate(day.date)} — ${day.closed ? 'fechado' : levelLabel}`}
                      className={cn(
                        'flex size-11 flex-col items-center justify-center rounded-xl border-2 text-xs font-bold transition-all duration-150 ease-out-soft',
                        'hover:-translate-y-0.5',
                        day.closed
                          ? 'border-urgent/30 bg-urgent/10 text-urgent line-through'
                          : (meta?.active ?? 'border-cream-deep text-muted'),
                        isSelected && 'outline-2 outline-offset-2 outline-charcoal',
                      )}
                    >
                      {day.date.slice(8)}
                      <span className="text-[0.6rem] font-normal opacity-70">
                        {WEEKDAY_SHORT[weekdayOf(day.date)]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
