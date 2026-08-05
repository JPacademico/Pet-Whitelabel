import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const baseClasses =
  'w-full rounded-xl border-2 bg-white px-4 py-2.5 text-charcoal placeholder:text-muted ' +
  'transition-colors duration-150 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-cream-deep';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        baseClasses,
        invalid
          ? 'border-urgent focus:border-urgent'
          : 'border-cream-deep focus:border-teal',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
