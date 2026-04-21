import { tiltFor } from '@/lib/seed-rotation';

/**
 * `<TapeStrip>` — translucent masking-tape patch (§4.5).
 *
 * Decorative. Typically placed on the top corners of a `<Page>` so it
 * reads as a sheet of paper taped onto a desk. Hidden <640px per §3.4.
 *
 * Coded placeholder for Asset A5 (roadmap). When the hand-drawn strip
 * ships, this file is the single swap point — replace the SVG body
 * with the new `<image>` or path while keeping the same props.
 */
type TapeStripProps = {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  /** Tape length. Default 92px. */
  width?: number;
  /** Tape height. Default 22px. */
  height?: number;
  /**
   * Rotation in degrees. If omitted and `seed` is set, derived via
   * `tiltFor(seed, 4)` for a stable per-instance lean. Otherwise 0.
   */
  rotation?: number;
  /** Seed for deterministic rotation when `rotation` is unset. */
  seed?: string;
  /** Strip opacity. Default 0.55. */
  opacity?: number;
  className?: string;
};

// TODO(A5): replace inline SVG with Chien's hand-drawn tape strips.
export function TapeStrip({
  top,
  bottom,
  left,
  right,
  width = 92,
  height = 22,
  rotation,
  seed,
  opacity = 0.55,
  className,
}: TapeStripProps) {
  const angle =
    rotation ?? (seed ? tiltFor(seed, 4) : 0);

  return (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`pointer-events-none absolute ${className ?? ''}`}
      data-ledger-tilt
      style={{
        top: toCss(top),
        bottom: toCss(bottom),
        left: toCss(left),
        right: toCss(right),
        transform: `rotate(${angle}deg)`,
        opacity,
      }}
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="var(--color-highlighter)"
      />
      {/* Highlight stripes running along the tape's length give a hint
          of the translucent ridges on real masking tape. */}
      <line
        x1="4"
        y1="4"
        x2={width - 4}
        y2="4"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.75"
      />
      <line
        x1="4"
        y1={height - 4}
        x2={width - 4}
        y2={height - 4}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.75"
      />
    </svg>
  );
}

function toCss(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}
