import { tiltFor } from '@/lib/seed-rotation';

/**
 * `<TapeStrip>` — translucent masking-tape patch (§4.5).
 *
 * Decorative. Typically placed on the top corners of a `<Page>` so it
 * reads as a sheet of paper taped onto a desk. Hidden <640px per §3.4.
 *
 * Asset A5: three hand-drawn variants, each with gently torn short
 * ends, faint wrinkle creases across the surface, and subtle edge
 * ridges. The variant is picked deterministically from `seed`, so the
 * same placement always gets the same piece of tape. Paths are drawn
 * in a fixed 92×22 coordinate space and stretched to the requested
 * size via `preserveAspectRatio="none"`.
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
  /** Seed for deterministic rotation + tape variant. */
  seed?: string;
  /** Strip opacity. Default 0.55. */
  opacity?: number;
  className?: string;
};

/** Drawing space all variants are authored in (the default size). */
const ART_W = 92;
const ART_H = 22;

type TapeVariant = {
  /** Tape body outline — torn short ends, near-straight long edges. */
  body: string;
  /** Faint near-horizontal crease strokes across the surface. */
  wrinkles: string[];
  /** Edge-ridge strokes: [lightRidge, shadowRidge]. */
  ridges: [string, string];
};

/**
 * Hand-drawn tape bodies. Long edges wander by <1px so the strip still
 * reads as machine-cut tape; short ends jag in/out 1–2.5px so they read
 * as torn off the roll.
 */
const VARIANTS: TapeVariant[] = [
  // Variant 0 — torn slightly inward at top-left, flared at bottom-right.
  {
    body:
      'M2.6,0.9 L1,3.1 L2.8,5.4 L1.2,8.2 L2.5,10.6 L0.8,13.4 L2.4,15.8 ' +
      'L1.1,18.4 L2.9,21.2 L46,21.5 L89.6,21 L91.2,18.6 L89.4,16.2 ' +
      'L91,13.5 L89.2,11.1 L90.8,8.4 L89,6 L90.6,3.2 L89.1,0.8 L45,0.5 Z',
    wrinkles: [
      'M9,6.2 Q30,7.4 51,6.6 T84,7.1',
      'M12,12.1 Q34,11 56,12.4 T86,11.6',
      'M7,17 Q28,16 50,17.3 T81,16.5',
    ],
    ridges: [
      'M6,2.9 Q46,2.1 87,2.7',
      'M6,19.3 Q46,20 87,19.1',
    ],
  },
  // Variant 1 — chunkier tear on the right end, calmer left end.
  {
    body:
      'M1.8,0.7 L2.9,3.6 L1.2,6.4 L2.6,9.4 L1.4,12.2 L2.8,15.2 L1.3,18 ' +
      'L2.5,21.1 L44,21.6 L88.8,21.2 L90.2,19 L88.6,17.4 L91.1,14.6 ' +
      'L89,12.4 L91.3,9.4 L89.2,7.2 L90.9,4.2 L88.7,2.4 L89.8,0.6 L45,0.9 Z',
    wrinkles: [
      'M10,5 Q33,6.3 55,5.2 T85,5.9',
      'M8,11.4 Q31,10.3 54,11.7 T84,10.8',
      'M14,15.6 Q35,16.6 58,15.4 T83,16.2',
      'M11,18.6 Q36,17.8 60,18.8 T82,18.1',
    ],
    ridges: [
      'M5,3.3 Q47,2.4 86,3.1',
      'M5,18.9 Q47,19.7 86,18.7',
    ],
  },
  // Variant 2 — both ends nipped diagonally, one deep crease.
  {
    body:
      'M3.1,1.1 L1.4,4.4 L3,6.8 L1.1,10 L2.7,12.8 L1,15.6 L2.6,18.2 ' +
      'L1.6,21 L43,21.4 L90,21.3 L88.9,18.8 L90.7,16 L89,13.8 L91.2,10.8 ' +
      'L89.3,8.6 L91,5.6 L89.5,3.4 L90.4,1 L46,0.6 Z',
    wrinkles: [
      'M8,8 Q32,9.6 56,8.2 T85,9',
      'M22,3.4 Q24,11 21.2,18.8',
      'M10,14.6 Q34,13.4 58,14.9 T84,14',
    ],
    ridges: [
      'M6,2.6 Q46,3.3 86,2.5',
      'M6,19.5 Q46,18.8 86,19.6',
    ],
  },
];

/** FNV-1a 32-bit — local copy so the asset stays self-contained. */
function hash32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function variantFor(seed: string | undefined): TapeVariant {
  if (!seed) return VARIANTS[0];
  return VARIANTS[hash32(seed) % VARIANTS.length];
}

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
  const angle = rotation ?? (seed ? tiltFor(seed, 4) : 0);
  const variant = variantFor(seed);

  return (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      width={width}
      height={height}
      viewBox={`0 0 ${ART_W} ${ART_H}`}
      preserveAspectRatio="none"
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
      {/* Tape body — torn short ends. */}
      <path d={variant.body} fill="var(--color-highlighter)" />
      {/* Edge ridges — light catch on top, faint shade on bottom,
          hinting at the raised edges of real masking tape. */}
      <path
        d={variant.ridges[0]}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path
        d={variant.ridges[1]}
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      {/* Wrinkle creases — faint, near-horizontal. */}
      {variant.wrinkles.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.22)'}
          strokeWidth="0.6"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function toCss(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}
