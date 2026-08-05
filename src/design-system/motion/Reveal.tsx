import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface RevealProps {
  children: ReactNode;
  /** Stagger in ms — give siblings increasing values to cascade them in. */
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'zoom';
  as?: ElementType;
  className?: string;
}

const directionClass = {
  up: '',
  left: 'ds-reveal--left',
  right: 'ds-reveal--right',
  zoom: 'ds-reveal--zoom',
} as const;

/**
 * Reveals its children when they scroll into view. Uses IntersectionObserver + a CSS transition
 * rather than an animation library, so it costs nothing in bundle size.
 *
 * Fails open: if IntersectionObserver is unavailable the content is shown immediately, so a
 * missing API can never leave the page blank.
 */
export function Reveal({ children, delay = 0, direction = 'up', as, className }: RevealProps) {
  const Component = (as ?? 'div') as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  // Start visible when IntersectionObserver is unavailable, so a missing API can never leave the
  // content hidden. Decided at mount rather than in an effect to avoid a cascading render.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect(); // reveal once; don't re-hide on scroll back up
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      data-visible={visible}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
      className={cn('ds-reveal', directionClass[direction], className)}
    >
      {children}
    </Component>
  );
}
