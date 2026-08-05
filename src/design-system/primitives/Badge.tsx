import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'sale' | 'urgent' | 'out-of-stock' | 'new' | 'success' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

// Never communicate meaning by color alone — every variant pairs a color with distinct weight/text.
const variantClasses: Record<BadgeVariant, string> = {
  sale: 'bg-sale text-white font-extrabold -rotate-2',
  urgent: 'bg-urgent text-white font-extrabold',
  'out-of-stock': 'bg-charcoal/80 text-white font-bold',
  new: 'bg-teal text-white font-bold',
  success: 'bg-success text-white font-bold',
  neutral: 'bg-cream-deep text-charcoal font-semibold',
};

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs tracking-wide uppercase',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
