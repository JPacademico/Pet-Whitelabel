import type { ComponentType, SVGProps } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { CountUp } from '@/design-system/motion';
import { cn } from '@/lib/cn';

export type StatTone = 'teal' | 'amber' | 'urgent' | 'success';

export interface StatCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  /** Short line under the value explaining what the number is counting. */
  hint?: string;
  to: string;
  tone?: StatTone;
  /** Stagger index — turns a grid of cards into a cascade instead of a pop. */
  index?: number;
}

// Tone drives the accent bar, icon chip and hover ring together so a card never mixes signals.
const toneClasses: Record<StatTone, { bar: string; chip: string; ring: string }> = {
  teal: { bar: 'bg-teal', chip: 'bg-teal/12 text-teal-deep', ring: 'hover:border-teal' },
  amber: {
    bar: 'bg-amber-brand',
    chip: 'bg-amber-brand/20 text-charcoal',
    ring: 'hover:border-amber-brand',
  },
  urgent: { bar: 'bg-urgent', chip: 'bg-urgent/12 text-urgent', ring: 'hover:border-urgent' },
  success: { bar: 'bg-success', chip: 'bg-success/12 text-success', ring: 'hover:border-success' },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  to,
  tone = 'teal',
  index = 0,
}: StatCardProps) {
  const tones = toneClasses[tone];

  return (
    <Link
      to={to}
      style={{ '--enter-delay': `${index * 70}ms` } as React.CSSProperties}
      className={cn(
        'ds-admin-enter group relative flex flex-col gap-3 overflow-hidden rounded-2xl border-2 border-transparent bg-white p-5',
        'shadow-[0_8px_24px_-12px_rgba(43,42,40,0.25)] transition-all duration-200 ease-out-soft',
        'hover:-translate-y-1 hover:shadow-[0_18px_34px_-18px_rgba(43,42,40,0.45)]',
        tones.ring,
      )}
    >
      <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', tones.bar)} />

      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-xl transition-transform duration-300 ease-out-soft group-hover:scale-110 group-hover:-rotate-6',
            tones.chip,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <ArrowUpRight
          className="size-4 text-muted opacity-0 transition-all duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      <p className="font-display text-3xl font-bold text-charcoal tabular-nums">
        <CountUp to={value} />
      </p>
      <div>
        <p className="text-sm font-semibold text-charcoal">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
    </Link>
  );
}
