import { useEffect, useRef, useState } from 'react';

export interface CountUpProps {
  to: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts from 0 to `to` once the element scrolls into view. Snaps straight to the final value
 * when the user prefers reduced motion, or when IntersectionObserver isn't available. */
export function CountUp({ to, suffix = '', durationMs = 1400, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  // When motion is unwanted or unobservable, render the final value straight away. Decided at
  // mount rather than in an effect so there's no cascading render.
  const skipAnimation = () => prefersReducedMotion() || typeof IntersectionObserver === 'undefined';
  const [value, setValue] = useState(() => (skipAnimation() ? to : 0));

  useEffect(() => {
    const node = ref.current;
    if (!node || skipAnimation()) return;

    let frame = 0;
    let start: number | null = null;

    const step = (timestamp: number) => {
      start ??= timestamp;
      const progress = Math.min((timestamp - start) / durationMs, 1);
      // easeOutCubic — fast start, gentle settle.
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            frame = requestAnimationFrame(step);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
}
