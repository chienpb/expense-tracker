import { tiltFor } from '@/lib/seed-rotation';

/**
 * `<CoffeeRing>` — a coffee-cup ring stain (§1, asset A2).
 *
 * Decorative only — never carries data, per the `coffee-stain` token
 * spec. Reads as "a cup once sat on this page": a darker, slightly
 * broken outer rim where the liquid pooled (two overlapping imperfect
 * ellipse paths give the varying stroke-width feel), and a much
 * fainter inner wash. The rim has a gap or two where the cup lifted.
 *
 * Positioned absolutely — parent must be `position: relative`. Purely
 * decorative; hidden from assistive tech. Keep default opacity low
 * (token spec is ~12%) — it should be noticed second, not first.
 *
 * Coded placeholder for Asset A2 (roadmap). When Chien's hand-drawn
 * stain ships, this file is the single swap point — replace the SVG
 * body with the new `<image>` / paths while keeping the same props.
 */
type CoffeeRingProps = {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  /** Outer diameter of the ring in px. Default 150. */
  size?: number;
  /**
   * Rotation in degrees. If omitted and `seed` is set, derived via
   * `tiltFor(seed, 180)` for a stable per-instance turn (a ring is
   * round, so rotation only moves the lift-gaps). Otherwise 0.
   */
  rotation?: number;
  /** Seed for deterministic rotation when `rotation` is unset. */
  seed?: string;
  /** Stain opacity. Default 0.12 per the `coffee-stain` token spec. */
  opacity?: number;
  className?: string;
};

// TODO(A2): replace inline SVG paths with Chien's hand-drawn coffee ring.
export function CoffeeRing({
  top,
  bottom,
  left,
  right,
  size = 150,
  rotation,
  seed,
  opacity = 0.12,
  className,
}: CoffeeRingProps) {
  const angle = rotation ?? (seed ? tiltFor(seed, 180) : 0);

  return (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 160 160"
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
      stroke="var(--color-coffee-stain)"
      fill="none"
      strokeLinecap="round"
    >
      {/* Inner wash — the faint film left inside the rim. A wobbly
          closed ellipse with a whisper of fill; softness comes from
          low opacity layering, never blur (§11). */}
      <path
        d="M 80 25
           C 112 26, 136 51, 135 82
           C 134 112, 109 137, 79 136
           C 49 135, 25 111, 26 80
           C 27 51, 50 24, 80 25 Z"
        fill="var(--color-coffee-stain)"
        fillOpacity="0.10"
        strokeWidth="3"
        strokeOpacity="0.28"
      />
      {/* Outer rim, first pass — where the liquid pooled darkest.
          Open path: the gap at the top is where the cup lifted. */}
      <path
        d="M 96 14
           C 122 19, 146 44, 147 76
           C 148 110, 124 144, 86 147
           C 50 150, 15 122, 13 84
           C 11 50, 38 20, 70 14"
        strokeWidth="2.5"
        strokeOpacity="0.9"
      />
      {/* Outer rim, second pass — slightly offset and thinner, so the
          two strokes drift together and apart for a hand-traced,
          varying-width rim. Its own gap sits at the lower left. */}
      <path
        d="M 88 145
           C 122 142, 146 112, 145 80
           C 144 46, 118 16, 84 15
           C 52 14, 22 40, 19 72
           C 17 96, 28 122, 50 136"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      {/* A stray droplet just outside the rim — the small accident
          that sells the stain as real. */}
      <ellipse
        cx="139"
        cy="34"
        rx="3"
        ry="2.4"
        fill="var(--color-coffee-stain)"
        fillOpacity="0.5"
        stroke="none"
      />
    </svg>
  );
}

function toCss(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}
