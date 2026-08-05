import { type ReactNode } from 'react';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-cream-deep px-6 py-12 text-center',
        className,
      )}
    >
      <div className="text-amber-brand" aria-hidden="true">
        {icon ?? <PawPrint className="size-10" />}
      </div>
      <p className="font-display text-lg font-bold text-charcoal">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}
