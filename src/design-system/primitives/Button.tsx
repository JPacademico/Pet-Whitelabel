import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Render as the single child element (e.g. a router Link) instead of a <button>, keeping this
   * component's styling. The child becomes responsible for its own disabled/loading semantics. */
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-teal text-white hover:bg-teal-deep active:bg-teal-deep',
  secondary:
    'bg-transparent text-charcoal border-2 border-charcoal hover:bg-charcoal hover:text-white',
  ghost: 'bg-transparent text-charcoal hover:bg-cream-deep',
  danger: 'bg-urgent text-white hover:brightness-95',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-4 py-2 gap-1.5',
  md: 'text-base px-6 py-2.5 gap-2',
  lg: 'text-lg px-8 py-3.5 gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, asChild = false, disabled, className, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          'inline-flex min-h-11 items-center justify-center rounded-full font-semibold',
          'transition-colors duration-150 ease-out-soft',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
