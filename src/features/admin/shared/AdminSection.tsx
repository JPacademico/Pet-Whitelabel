import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/cn';

export interface AdminSectionProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  /** One line telling the admin what editing here actually changes on the public site. */
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Stagger index, matching StatCard's cascade. */
  index?: number;
  className?: string;
  bodyClassName?: string;
}

/** A titled panel. Every admin section is one of these, so headings, spacing and help text
 * stay consistent instead of each page inventing its own. */
export function AdminSection({
  icon: Icon,
  title,
  description,
  actions,
  children,
  index = 0,
  className,
  bodyClassName,
}: AdminSectionProps) {
  return (
    <section
      style={{ '--enter-delay': `${index * 70}ms` } as React.CSSProperties}
      className={cn(
        'ds-admin-enter rounded-3xl border-2 border-cream-deep bg-white/70 p-4 sm:p-5',
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cream-deep text-teal-deep">
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
          )}
          <div>
            <h2 className="font-display text-lg font-bold text-charcoal">{title}</h2>
            {description && <p className="mt-0.5 max-w-prose text-sm text-muted">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
