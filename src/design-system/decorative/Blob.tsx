import { cn } from '@/lib/cn';

export interface BlobProps {
  /** Tailwind colour utility, e.g. "bg-teal/10". */
  className?: string;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: number;
}

/** Slowly morphing organic shape used behind sections to break up the rectangular grid. */
export function Blob({ className, size = 320, top, left, right, bottom, delay = 0 }: BlobProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('ds-blob', className)}
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        animationDelay: `${delay}s`,
      }}
    />
  );
}
