import { useState, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { BoneShape, YarnBallShape, PawShape, FishShape } from './PetShapes';

export type FloatingShape = 'bone' | 'yarn' | 'paw' | 'fish';

export interface FloatingObjectProps {
  shape: FloatingShape;
  /** Position as a percentage of the containing (relatively-positioned) element. */
  top: string;
  left: string;
  size?: number;
  /** Seconds — desyncs multiple instances so they don't drift in lockstep. */
  delay?: number;
  duration?: number;
  /** Vertical drift amplitude in px. */
  drift?: number;
  /** Rotation amplitude in degrees. */
  rotate?: number;
  /**
   * Makes the object respond to pointer/keyboard: it reacts on hover and can be nudged by
   * clicking. Interactive objects are exposed to assistive tech as a labelled button; purely
   * decorative ones stay hidden from it.
   */
  interactive?: boolean;
  /** Accessible name, required when `interactive`. */
  label?: string;
  className?: string;
}

const shapeComponents = {
  bone: BoneShape,
  yarn: YarnBallShape,
  paw: PawShape,
  fish: FishShape,
} as const;

/** Per-shape hover personality: the bone wags, the yarn ball unspools and rolls. */
const hoverClass: Record<FloatingShape, string> = {
  bone: 'ds-floater--bone',
  yarn: 'ds-floater--yarn',
  paw: 'ds-floater--paw',
  fish: 'ds-floater--fish',
};

export function FloatingObject({
  shape,
  top,
  left,
  size = 48,
  delay = 0,
  duration = 7,
  drift = 14,
  rotate = 8,
  interactive = false,
  label,
  className,
}: FloatingObjectProps) {
  const [nudged, setNudged] = useState(false);
  const Shape = shapeComponents[shape];

  const style: CSSProperties & Record<string, string | number> = {
    top,
    left,
    width: size,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    '--float-drift': `${-drift}px`,
    '--float-rotate': `${rotate}deg`,
  };

  const inner = (
    <span className="ds-floater__inner">
      <Shape className="ds-floater__shape" style={{ width: '100%', height: 'auto' }} />
    </span>
  );

  if (!interactive) {
    return (
      <span
        aria-hidden="true"
        className={cn('ds-floater', hoverClass[shape], className)}
        style={style}
      >
        {inner}
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        setNudged(true);
        window.setTimeout(() => setNudged(false), 700);
      }}
      className={cn(
        'ds-floater ds-floater--interactive',
        hoverClass[shape],
        nudged && 'ds-floater--nudged',
        className,
      )}
      style={style}
    >
      {inner}
    </button>
  );
}
