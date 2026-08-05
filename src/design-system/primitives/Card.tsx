import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ hoverable = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white p-5 shadow-[0_8px_24px_-12px_rgba(43,42,40,0.25)]',
        hoverable &&
          'transition-transform duration-200 ease-out-soft hover:-translate-y-1 hover:scale-[1.02]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
