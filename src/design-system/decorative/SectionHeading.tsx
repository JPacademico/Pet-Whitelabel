import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SectionHeadingProps {
  /** Small script-styled kicker above the title. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'dark',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'font-script text-2xl leading-none',
            tone === 'dark' ? 'text-teal' : 'text-amber-soft',
          )}
        >
          {eyebrow}
        </span>
      )}

      <h2
        className={cn(
          'font-display text-3xl leading-tight font-extrabold sm:text-4xl',
          tone === 'dark' ? 'text-charcoal' : 'text-cream',
        )}
      >
        {title}
      </h2>

      {/* Hand-drawn style underline flourish. */}
      <svg
        viewBox="0 0 120 10"
        aria-hidden="true"
        className={cn('h-2.5 w-28', tone === 'dark' ? 'text-amber-brand' : 'text-amber-soft')}
        preserveAspectRatio="none"
      >
        <path
          d="M2 7c22-5 44-5 58-3s38 3 58-2"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {description && (
        <p className={cn('max-w-xl', tone === 'dark' ? 'text-muted' : 'text-cream/70')}>
          {description}
        </p>
      )}
    </div>
  );
}
