import { type ReactNode, useId } from 'react';
import { cn } from '@/lib/cn';

export interface FieldWrapperProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: (ids: { inputId: string; describedBy: string | undefined }) => ReactNode;
}

export function FieldWrapper({
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldWrapperProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-semibold text-charcoal">
        {label}
        {required && (
          <span className="text-urgent" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children({ inputId, describedBy })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-urgent">
          {error}
        </p>
      )}
    </div>
  );
}
