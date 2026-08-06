import type { ComponentType, SVGProps } from 'react';
import { Link } from 'react-router';
import { ExternalLink, Settings2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { StatTone } from './StatCard';

export type SectionStatus = 'live' | 'attention' | 'closed';

export interface SectionMetric {
  label: string;
  value: string;
  /** `danger` turns the chip red — used for "fechado hoje" and "esgotado", never for a neutral count. */
  tone?: 'neutral' | 'good' | 'warn' | 'danger';
}

export interface SiteSectionCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  name: string;
  /** Public route this card represents, e.g. '/banho-e-tosa'. */
  path: string;
  /** Admin route that edits it. Omitted for sections with no editor yet (Home, Galeria). */
  manageTo?: string;
  manageLabel?: string;
  status: SectionStatus;
  metrics: SectionMetric[];
  tone?: StatTone;
  index?: number;
}

const accentClasses: Record<StatTone, string> = {
  teal: 'bg-teal',
  amber: 'bg-amber-brand',
  urgent: 'bg-urgent',
  success: 'bg-success',
};

const statusClasses: Record<SectionStatus, { dot: string; label: string; text: string }> = {
  live: { dot: 'bg-success', label: 'No ar', text: 'text-success' },
  attention: { dot: 'bg-amber-brand', label: 'Requer atenção', text: 'text-charcoal' },
  closed: { dot: 'bg-urgent', label: 'Fechado hoje', text: 'text-urgent' },
};

const metricClasses: Record<NonNullable<SectionMetric['tone']>, string> = {
  neutral: 'bg-cream-deep text-charcoal',
  good: 'bg-success/12 text-success',
  warn: 'bg-amber-brand/20 text-charcoal',
  danger: 'bg-urgent/12 text-urgent',
};

/**
 * One public page of the site, summarised: whether it's live today, the numbers behind it, and the
 * two things you can do with it (edit it, or go look at it). The dashboard is a row of these so the
 * admin can see the whole site's state without opening four screens.
 */
export function SiteSectionCard({
  icon: Icon,
  name,
  path,
  manageTo,
  manageLabel = 'Gerenciar',
  status,
  metrics,
  tone = 'teal',
  index = 0,
}: SiteSectionCardProps) {
  const statusStyle = statusClasses[status];

  return (
    <article
      style={{ '--enter-delay': `${index * 70}ms` } as React.CSSProperties}
      className={cn(
        'ds-admin-enter group relative flex flex-col gap-3 overflow-hidden rounded-2xl border-2 border-cream-deep bg-white p-4',
        'transition-all duration-200 ease-out-soft hover:-translate-y-1 hover:border-transparent',
        'hover:shadow-[0_18px_34px_-18px_rgba(43,42,40,0.45)]',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 ease-out-soft group-hover:scale-x-100',
          accentClasses[tone],
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-cream-deep text-charcoal transition-transform duration-300 ease-out-soft group-hover:scale-110 group-hover:-rotate-6">
            <Icon className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display font-bold text-charcoal">{name}</h3>
            <p className="text-xs text-muted">{path}</p>
          </div>
        </div>
        <span className={cn('flex items-center gap-1.5 text-xs font-bold', statusStyle.text)}>
          <span aria-hidden="true" className={cn('size-2 rounded-full', statusStyle.dot)} />
          {statusStyle.label}
        </span>
      </div>

      {metrics.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {metrics.map((metric) => (
            <li
              key={metric.label}
              className={cn(
                'rounded-lg px-2 py-1 text-xs font-semibold',
                metricClasses[metric.tone ?? 'neutral'],
              )}
            >
              <span className="tabular-nums">{metric.value}</span>{' '}
              <span className="font-medium opacity-80">{metric.label}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center gap-3 border-t border-cream-deep pt-3 text-sm font-semibold">
        {manageTo ? (
          <Link
            to={manageTo}
            className="inline-flex items-center gap-1.5 text-teal-deep transition-colors hover:text-charcoal"
          >
            <Settings2 className="size-4" aria-hidden="true" />
            {manageLabel}
          </Link>
        ) : (
          <span className="text-xs text-muted">Conteúdo fixo — sem edição no painel</span>
        )}
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-muted transition-colors hover:text-charcoal"
        >
          Ver página
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
