import { Fragment } from 'react';
import { cn } from '@/lib/cn';

export interface MarqueeProps {
  items: string[];
  /** Seconds for one full loop. Longer = slower. */
  duration?: number;
  className?: string;
}

/**
 * Infinite scrolling word strip. The item list is rendered twice and the track translates -50%,
 * which makes the loop seamless without measuring anything at runtime. Pauses on hover.
 */
export function Marquee({ items, duration = 30, className }: MarqueeProps) {
  const sequence = (
    <span className="flex shrink-0 items-center">
      {items.map((item) => (
        <Fragment key={item}>
          <span className="px-6 font-display text-lg font-bold whitespace-nowrap sm:text-xl">
            {item}
          </span>
          <span aria-hidden="true" className="text-2xl leading-none opacity-60">
            •
          </span>
        </Fragment>
      ))}
    </span>
  );

  return (
    <div
      className={cn('ds-marquee overflow-hidden', className)}
      style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
    >
      {/* Duplicated for the seamless loop; the copy is hidden from assistive tech. */}
      <div className="ds-marquee__track">
        {sequence}
        <span aria-hidden="true" className="flex shrink-0 items-center">
          {sequence}
        </span>
      </div>
    </div>
  );
}
