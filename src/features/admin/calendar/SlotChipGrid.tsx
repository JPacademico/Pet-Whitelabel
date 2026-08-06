import { Check, X } from 'lucide-react';
import type { TimeSlot } from '@/domain/types';
import { cn } from '@/lib/cn';
import { PERIOD_LABELS, SLOT_PALETTE, periodOf, type SlotPeriod } from './slotPalette';

export interface SlotChipGridProps {
  /** Times currently open. */
  value: TimeSlot[];
  onToggle: (time: TimeSlot) => void;
  /** Times that already carry a booking — shown with the same amber ring the week grid uses. */
  bookedTimes?: Set<TimeSlot>;
  disabled?: boolean;
}

const PERIOD_ORDER: SlotPeriod[] = ['morning', 'afternoon', 'evening'];

/**
 * A single day's hours as period-grouped chips. Same colour language as the weekly grid — teal is
 * open, red is closed — so switching between the two editors doesn't mean relearning the palette.
 */
export function SlotChipGrid({ value, onToggle, bookedTimes, disabled = false }: SlotChipGridProps) {
  const open = new Set(value);
  // A saved date can carry times outside the palette; never hide an hour that's actually active.
  const times = [...new Set([...SLOT_PALETTE, ...value])].sort();

  return (
    <div className="flex flex-col gap-3">
      {PERIOD_ORDER.map((period) => {
        const periodTimes = times.filter((time) => periodOf(time) === period);
        if (periodTimes.length === 0) return null;

        return (
          <div key={period}>
            <p className="mb-1.5 text-[0.65rem] font-extrabold tracking-widest text-muted uppercase">
              {PERIOD_LABELS[period]}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {periodTimes.map((time) => {
                const isOpen = open.has(time);
                const isBooked = bookedTimes?.has(time) ?? false;
                return (
                  <button
                    key={time}
                    type="button"
                    disabled={disabled}
                    onClick={() => onToggle(time)}
                    aria-pressed={isOpen}
                    aria-label={`${time} — ${isOpen ? 'aberto' : 'fechado'}`}
                    title={
                      isBooked
                        ? 'Já existe agendamento neste horário'
                        : isOpen
                          ? 'Aberto — clique para fechar'
                          : 'Fechado — clique para abrir'
                    }
                    className={cn(
                      'inline-flex min-h-9 items-center gap-1 rounded-lg border-2 px-2.5 text-xs font-bold tabular-nums',
                      'transition-all duration-150 ease-out-soft disabled:cursor-not-allowed disabled:opacity-50',
                      isOpen
                        ? 'border-teal bg-teal text-white hover:bg-teal-deep'
                        : 'border-urgent/25 bg-urgent/10 text-urgent/80 hover:border-teal hover:bg-teal/15 hover:text-teal-deep',
                      isBooked && 'shadow-[inset_0_0_0_2px_var(--color-amber-brand)]',
                    )}
                  >
                    {isOpen ? (
                      <Check className="size-3" aria-hidden="true" />
                    ) : (
                      <X className="size-3" aria-hidden="true" />
                    )}
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
