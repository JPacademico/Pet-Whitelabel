import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import type { ClinicDemand, DemandLevel } from '@/domain/types';
import { addIsoDays, formatDisplayDate, nowInBusinessTz, parseIsoDate, todayIsoDate, toIsoDate } from '@/lib/datetime';
import { MAX_ADVANCE_DAYS } from '@/config/site';
import { resolveDemandLevel } from '@/domain/availability';
import { cn } from '@/lib/cn';

export interface ClinicDemandEditorProps {
  demand: ClinicDemand[];
  onSet: (entry: ClinicDemand) => void;
  /** Override the level wording — the hotel talks about vacancies, the clinic about demand. */
  labels?: Partial<Record<Exclude<DemandLevel, 'closed'>, string>>;
}

const DEFAULT_LABELS: Record<Exclude<DemandLevel, 'closed'>, string> = {
  free: 'Livre',
  moderate: 'Moderado',
  high: 'Alta demanda',
};

const LEVEL_STYLES: Record<Exclude<DemandLevel, 'closed'>, string> = {
  free: 'border-success bg-success/15 text-success',
  moderate: 'border-amber-brand bg-amber-brand/20 text-charcoal',
  high: 'border-urgent bg-urgent/15 text-urgent',
};

const LEVEL_ORDER: Exclude<DemandLevel, 'closed'>[] = ['free', 'moderate', 'high'];

export function ClinicDemandEditor({ demand, onSet, labels }: ClinicDemandEditorProps) {
  const levelLabels = { ...DEFAULT_LABELS, ...labels };
  const now = nowInBusinessTz();
  const today = todayIsoDate(now);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const currentLevel = selectedDate ? resolveDemandLevel(selectedDate, demand) : undefined;

  const levelIs = (level: DemandLevel) => (date: Date) =>
    resolveDemandLevel(toIsoDate(date), demand) === level;

  return (
    <div className="flex flex-col gap-4 md:flex-row">
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
        className="rounded-2xl bg-white p-4 shadow-sm"
      />

      <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
        {!selectedDate ? (
          <p className="text-sm text-muted">
            Selecione uma data para definir o nível de demanda exibido no site.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-display font-bold text-charcoal capitalize">
              {formatDisplayDate(selectedDate)}
            </p>
            <p className="text-sm text-muted">Nível exibido publicamente:</p>
            <div className="flex flex-wrap gap-2">
              {LEVEL_ORDER.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onSet({ date: selectedDate, level })}
                  aria-pressed={currentLevel === level}
                  className={cn(
                    'min-h-11 rounded-xl border-2 px-4 text-sm font-semibold transition-colors',
                    currentLevel === level
                      ? LEVEL_STYLES[level]
                      : 'border-cream-deep text-muted hover:border-teal',
                  )}
                >
                  {levelLabels[level]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
