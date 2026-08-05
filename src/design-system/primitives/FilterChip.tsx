import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/lib/cn';

export interface FilterChipProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  /** Optional result count shown in a pill on the right. */
  count?: number;
  active: boolean;
  onClick: () => void;
  className?: string;
}

/** Icon-bearing filter toggle shared by the Shop and Gallery. Uses aria-pressed rather than a
 * checkbox so screen readers announce it as a toggle. */
export function FilterChip({
  icon: Icon,
  label,
  count,
  active,
  onClick,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'group inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-bold',
        'transition-all duration-200 ease-out-soft',
        active
          ? 'border-teal bg-teal text-white shadow-[0_6px_16px_-8px_var(--color-teal)]'
          : 'border-cream-deep bg-white text-charcoal hover:-translate-y-0.5 hover:border-teal hover:text-teal-deep',
        className,
      )}
    >
      {Icon && (
        <Icon
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 transition-transform duration-300 ease-out-soft',
            'group-hover:scale-115 group-hover:-rotate-12',
          )}
        />
      )}
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[0.65rem] leading-none font-extrabold tabular-nums',
            active ? 'bg-white/25 text-white' : 'bg-cream-deep text-muted',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
