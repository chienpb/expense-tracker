import { tiltFor } from '@/lib/seed-rotation';

/**
 * `<AnnotationArrow>` — pen-drawn curved arrow (§5, asset A11).
 *
 * A single quadratic pen stroke with an open two-flick arrowhead, as
 * if the clerk circled a figure and dragged the nib over to a note in
 * the margin. Pairs with the dashed-ellipse annotation in
 * `<HandDrawnChart>` (DASHBOARD_REDESIGN C6): ellipse around the peak,
 * arrow from the ellipse to the Caveat callout.
 *
 * Three shaft curvatures, picked deterministically from `seed` (same
 * annotation → same arrow). Every variant starts lower-left and points
 * upper-right inside the box; aim it with `rotation` (and `flip` to
 * mirror) rather than relying on the variant. A small seeded tilt is
 * layered on top so two arrows at the same rotation never sit
 * identically.
 *
 * Decorative by default (`role="presentation"`, `aria-hidden`) — the
 * meaning lives in the text the arrow points at, per §6.7.
 */
type AnnotationArrowProps = {
  /** Bounding-box size in px. Default 48 (spec range ~40–60). */
  size?: number;
  /** Ink color. Default `pen-navy`. */
  color?: string;
  /** Variant + tilt seed. Set per-annotation for variety. */
  seed?: string;
  /**
   * Rotation in degrees, on top of the seeded ±5° waver. The unrotated
   * arrow points upper-right; e.g. `rotation={90}` points lower-right.
   */
  rotation?: number;
  /** Mirror horizontally (arrow points upper-left instead). */
  flip?: boolean;
  /** Override the wobble filter (e.g. disable in a CI snapshot). */
  filter?: string | false;
  className?: string;
};

type ArrowVariant = {
  /** The shaft — one quadratic stroke, lower-left to upper-right. */
  shaft: string;
  /** The arrowhead — two quick flicks off the tip, drawn as one path. */
  head: string;
};

/**
 * Three shafts in a 48×48 box, tips landing in the upper-right region.
 * Arrowhead barbs are short curved flicks (never a closed triangle —
 * a filled head reads as a vector marker, not a pen). `#hand-wobble`
 * roughens all of it at render time.
 */
const ARROW_VARIANTS: readonly ArrowVariant[] = [
  // 0 — gentle sweep: rises steeply off the tail, flattens toward the tip.
  {
    shaft: 'M 7 41 Q 12 16 38 9',
    head: 'M 31.3 7.3 Q 34.8 8 38 9 Q 35.3 11.3 33 13.7',
  },
  // 1 — deep bow: sags through the middle, then climbs hard to the tip.
  {
    shaft: 'M 6 36 Q 28 38 40 14',
    head: 'M 34.3 17.8 Q 37 15.6 40 14 Q 40.3 17.4 40.4 20.9',
  },
  // 2 — lazy arc: nearly level, a slight hump where the hand drifted up.
  {
    shaft: 'M 6 28 Q 22 20 40 24',
    head: 'M 34.6 19.6 Q 37.5 21.8 40 24 Q 36.7 25 33.4 25.8',
  },
];

/**
 * Same FNV-1a as `lib/seed-rotation`, kept local so variant picking
 * can use a salted seed (`#arrow`) — otherwise variant and tilt would
 * be locked to the same byte pattern and visually correlate.
 */
function hash32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function variantFor(seed: string): ArrowVariant {
  return ARROW_VARIANTS[hash32(`${seed}#arrow`) % ARROW_VARIANTS.length];
}

export function AnnotationArrow({
  size = 48,
  color = 'var(--color-pen-navy)',
  seed = 'annotation-arrow',
  rotation = 0,
  flip = false,
  filter,
  className,
}: AnnotationArrowProps) {
  const angle = rotation + tiltFor(seed, 5);
  const variant = variantFor(seed);
  const appliedFilter =
    filter === false ? undefined : (filter ?? 'url(#hand-wobble)');

  return (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      data-ledger-tilt
      className={`inline-block shrink-0 ${className ?? ''}`}
      style={{
        transform: `rotate(${angle}deg)${flip ? ' scaleX(-1)' : ''}`,
      }}
    >
      <g
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: appliedFilter }}
      >
        <path d={variant.shaft} />
        {/* Slightly heavier head — the nib slows and presses at the
            end of a stroke, so the flicks carry more ink. */}
        <path d={variant.head} strokeWidth={2} />
      </g>
    </svg>
  );
}
