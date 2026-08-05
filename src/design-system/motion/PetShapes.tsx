import type { SVGProps } from 'react';

/**
 * Hand-built pet shapes used by the decorative floaters. Kept as real geometry (not icon-font
 * glyphs) so they can carry two tones and animate their inner parts independently on hover.
 */

export function BoneShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 48" fill="none" {...props}>
      <g className="ds-shape-body">
        <path
          d="M22 24c-4.5 0-8-3-8-7.5S17.5 9 22 9c1.6 0 3 .4 4.2 1.2C27.4 7.6 30 6 33 6c4.5 0 8 3.5 8 8 0 1-.2 2-.6 2.9h19.2A7.8 7.8 0 0 1 59 14c0-4.5 3.5-8 8-8 3 0 5.6 1.6 6.8 4.2A7.5 7.5 0 0 1 78 9c4.5 0 8 3 8 7.5S82.5 24 78 24h-.5c.3.9.5 1.8.5 2.8 0 4.5-3.5 8-8 8-3 0-5.6-1.6-6.8-4.2A7.5 7.5 0 0 1 59 32c-3.5 0-6.5-2.2-7.6-5.2H48.6C47.5 29.8 44.5 32 41 32c-1.6 0-3-.4-4.2-1.2C35.6 33.4 33 35 30 35c-4.5 0-8-3.5-8-8 0-1 .2-1.9.5-2.8H22Z"
          fill="currentColor"
        />
      </g>
      {/* Highlight adds a little dimension without a second asset. */}
      <path
        d="M30 15c-2.2 0-4 1.3-4 3s1.8 3 4 3"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="ds-shape-gloss"
      />
    </svg>
  );
}

export function YarnBallShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <circle cx="50" cy="50" r="34" fill="currentColor" />
      {/* The winding lines spin on hover, which is what sells it as a ball of wool. */}
      <g
        className="ds-yarn-winding"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M50 16c-9 11-9 23 0 34s9 23 0 34" />
        <path d="M27 26c11 6 19 13 21 21" />
        <path d="M18 47c11 3 19 7 26 13" />
        <path d="M25 71c10-5 17-11 20-18" />
        <path d="M44 82c7-7 13-12 21-15" />
      </g>
      {/* Loose thread trailing off the ball. */}
      <path
        d="M84 50c8 3 12 9 10 15s-9 8-13 5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="ds-yarn-thread"
      />
    </svg>
  );
}

export function PawShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <ellipse cx="50" cy="66" rx="24" ry="20" />
      <ellipse cx="22" cy="42" rx="10" ry="13" />
      <ellipse cx="40" cy="26" rx="11" ry="14" />
      <ellipse cx="62" cy="26" rx="11" ry="14" />
      <ellipse cx="79" cy="42" rx="10" ry="13" />
    </svg>
  );
}

export function FishShape(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 60" fill="currentColor" {...props}>
      <path d="M8 30c12-16 32-24 50-24 14 0 22 10 22 24S72 54 58 54C40 54 20 46 8 30Z" />
      <path d="M80 30 96 14v32L80 30Z" />
      <circle cx="34" cy="24" r="3.4" fill="rgba(255,255,255,0.75)" />
    </svg>
  );
}
