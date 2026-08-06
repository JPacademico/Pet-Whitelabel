import { cn } from '@/lib/cn';

export interface LegendItem {
  /** Tailwind classes for the swatch — mirror the exact classes the real element uses. */
  swatch: string;
  label: string;
}

export interface LegendProps {
  items: LegendItem[];
  className?: string;
}

/** Colour key for the scheduling editors. Colour alone never carries the meaning in the UI itself
 * (states also differ by icon and strike-through) — this just shortens the learning curve. */
export function Legend({ items, className }: LegendProps) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cn('size-3 shrink-0 rounded-[0.3rem]', item.swatch)} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
