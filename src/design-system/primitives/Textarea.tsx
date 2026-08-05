import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid, className, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full resize-y rounded-xl border-2 bg-white px-4 py-2.5 text-charcoal placeholder:text-muted',
        'transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:bg-cream-deep',
        invalid ? 'border-urgent focus:border-urgent' : 'border-cream-deep focus:border-teal',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
