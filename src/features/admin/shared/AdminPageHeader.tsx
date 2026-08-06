import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/cn';

export interface AdminPageHeaderProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Small uppercase label above the title — tells the admin which area of the site they're in. */
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Shared page banner for every admin screen. Keeping the shape identical across pages is what makes
 * the panel feel like one product instead of four unrelated screens.
 */
export function AdminPageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        'ds-admin-enter relative mb-6 overflow-hidden rounded-3xl bg-charcoal px-5 py-5 text-cream sm:px-7 sm:py-6',
        className,
      )}
    >
      {/* Decorative wash — pure CSS, no image request. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-amber-brand/20 blur-3xl"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-brand text-charcoal shadow-[0_10px_24px_-12px_rgba(240,178,29,0.9)]">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[0.7rem] font-extrabold tracking-widest text-amber-brand uppercase">
              {eyebrow}
            </p>
            <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">{title}</h1>
            {description && <p className="mt-1 max-w-prose text-sm text-cream/70">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
