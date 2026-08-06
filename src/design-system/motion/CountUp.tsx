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

/**
 * Counts up to `to` once the element scrolls into view. Snaps straight to the final value when the
 * user prefers reduced motion, or when IntersectionObserver isn't available.
 *
 * `to` may change after mount — the admin dashboard feeds it from an async query — so the animation
 * runs from whatever is currently on screen rather than restarting at zero, and the skip path reads
 * `to` during render rather than holding a stale copy in state.
 */
export function CountUp({ to, suffix = '', durationMs = 1400, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  // Decided once, at mount: the environment can't change between renders, and reading it here
  // rather than in an effect keeps the skip path free of state entirely.
  const [skip] = useState(
    () => prefersReducedMotion() || typeof IntersectionObserver === 'undefined',
  );
  const [animated, setAnimated] = useState(0);
  // Mirrors `animated` for the effect to read without depending on it (which would re-run the
  // animation on every frame it produces).
  const animatedRef = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (skip || !node) return;

    const from = animatedRef.current;
    let frame = 0;
    let start: number | null = null;

    const step = (timestamp: number) => {
      start ??= timestamp;
      const progress = Math.min((timestamp - start) / durationMs, 1);
      // easeOutCubic — fast start, gentle settle.
      const next = Math.round(from + (to - from) * (1 - Math.pow(1 - progress, 3)));
      animatedRef.current = next;
      setAnimated(next);
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
  }, [to, durationMs, skip]);

  const value = skip ? to : animated;

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
}
