import type { ResolvedSlot, TimeSlot } from '@/domain/types';
import { Skeleton } from '@/design-system/primitives';
import { cn } from '@/lib/cn';

export interface SlotGridProps {
  slots: ResolvedSlot[];
  selected: TimeSlot | undefined;
  onSelect: (time: TimeSlot) => void;
  loading?: boolean;
}

export function SlotGrid({ slots, selected, onSelect, loading }: SlotGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return <p className="text-sm text-muted">Nenhum horário disponível para esta data.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isUnavailable = slot.state !== 'free';
        return (
          <button
            key={slot.time}
            type="button"
            disabled={isUnavailable}
            aria-label={isUnavailable ? `${slot.time} — indisponível` : slot.time}
            onClick={() => onSelect(slot.time)}
            className={cn(
              'min-h-11 rounded-xl border-2 text-sm font-semibold transition-colors',
              isUnavailable && 'cursor-not-allowed border-cream-deep bg-cream-deep text-muted line-through',
              !isUnavailable &&
                selected === slot.time &&
                'border-teal bg-teal text-white',
              !isUnavailable &&
                selected !== slot.time &&
                'border-cream-deep bg-white text-charcoal hover:border-teal',
            )}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
