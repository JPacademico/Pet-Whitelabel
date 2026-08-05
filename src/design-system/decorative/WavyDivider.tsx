import { cn } from '@/lib/cn';

export type DividerVariant = 'scallop' | 'torn' | 'wave' | 'slant';

export interface WavyDividerProps {
  variant?: DividerVariant;
  /** Text-color utility class controlling the fill, e.g. "text-cream". */
  className?: string;
  flip?: boolean;
}

const paths: Record<DividerVariant, string> = {
  scallop:
    'M0 0 C 60 24 120 24 180 0 C 240 24 300 24 360 0 C 420 24 480 24 540 0 C 600 24 660 24 720 0 ' +
    'C 780 24 840 24 900 0 C 960 24 1020 24 1080 0 C 1140 24 1200 24 1260 0 C 1320 24 1380 24 1440 0 ' +
    'L 1440 40 L 0 40 Z',
  torn:
    'M0 8 L60 22 L120 4 L180 26 L240 10 L300 28 L360 6 L420 24 L480 12 L540 30 L600 8 L660 24 ' +
    'L720 10 L780 28 L840 6 L900 26 L960 12 L1020 30 L1080 8 L1140 24 L1200 10 L1260 28 L1320 6 ' +
    'L1380 26 L1440 8 L1440 40 L0 40 Z',
  wave:
    'M0 20 C 180 0 360 40 540 20 C 720 0 900 40 1080 20 C 1260 0 1350 30 1440 18 L 1440 40 L 0 40 Z',
  slant: 'M0 40 L1440 0 L1440 40 Z',
};

/** Torn/scalloped edge between sections, matching example.png. SVG (not an image) so it scales
 * and recolors via currentColor. */
export function WavyDivider({ variant = 'scallop', className, flip = false }: WavyDividerProps) {
  return (
    <svg
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn('block h-6 w-full sm:h-10', flip && 'rotate-180', className)}
    >
      <path d={paths[variant]} fill="currentColor" />
    </svg>
  );
}
