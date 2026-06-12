import { tiltFor } from '@/lib/seed-rotation';

/**
 * `<InkBlot>` — irregular splatter used as the error marker (§4.12 · §6.7).
 *
 * Asset A3: a set of five hand-inked blot silhouettes — lobed,
 * asymmetric blobs with satellite flecks, as if ink dropped from a
 * fountain pen. Each render picks one variant deterministically from
 * `seed` (same field → same blot, same tilt), then pushes it through
 * `url(#hand-wobble)` so the outline never reads as a clean vector.
 * Used next to a field whose value couldn't be written (validation
 * error) — softer than a red banner, still unambiguous when paired
 * with the margin note per §6.7.
 *
 * Decorative by default (`role="presentation"`, `aria-hidden`). Real
 * meaning lives in the adjacent error text so screen readers don't
 * have to reinterpret a splatter glyph.
 */
type InkBlotProps = {
  /** Bounding-box size in px. Default 28. */
  size?: number;
  /** Ink color. Default `pen-navy`. Errors use `stamp-red`. */
  color?: string;
  /** Tilt + variant seed. Defaults to `"ink-blot"`; set per-row for variety. */
  seed?: string;
  /** Override the wobble filter (e.g. disable in a CI snapshot). */
  filter?: string | false;
  className?: string;
};

type BlotPath = {
  d: string;
  /** Satellite flecks sit lighter on the page than the main pool. */
  opacity?: number;
};

/**
 * Five hand-inked splatter variants in a 28×28 box. First path is the
 * main pool; the rest are satellite flecks thrown off when the nib hit
 * the page. All silhouettes are deliberately lobed and off-axis — the
 * `#hand-wobble` filter roughens the edge further at render time.
 */
const BLOT_VARIANTS: readonly (readonly BlotPath[])[] = [
  // 0 — heavy drop: bulging three-lobed pool, flecks flung to opposite corners.
  [
    {
      d: 'M8.9 8.4 C10.6 5.9 15.7 5 18.6 6.9 C21.3 8.6 22.6 11.4 21.5 14 C23 14.6 23.4 16.4 22.1 17.4 C21 18.2 19.6 17.8 18.9 16.8 C17.5 19.8 13 21.2 10.1 19.5 C7.4 17.9 6.3 14.7 7.3 12 C5.8 11.5 5.4 9.8 6.6 8.9 C7.3 8.4 8.2 8.3 8.9 8.4 Z',
    },
    {
      d: 'M4.2 6.1 c0.8 -0.6 2 -0.2 2.1 0.8 c0.1 0.9 -0.9 1.6 -1.8 1.2 c-0.8 -0.4 -0.9 -1.4 -0.3 -2 Z',
      opacity: 0.75,
    },
    {
      d: 'M23.6 20.3 c0.7 -0.3 1.5 0.2 1.4 1 c-0.1 0.7 -1 1.1 -1.6 0.6 c-0.5 -0.4 -0.4 -1.2 0.2 -1.6 Z',
      opacity: 0.6,
    },
    {
      d: 'M16.8 23.1 c0.5 -0.2 1 0.1 1 0.7 c0 0.5 -0.6 0.9 -1.1 0.6 c-0.4 -0.3 -0.4 -1 0.1 -1.3 Z',
      opacity: 0.55,
    },
  ],
  // 1 — splash with a drag tail: pool thrown left, thin tail where the
  //     pen skidded toward the upper right, one drop past the tail tip.
  [
    {
      d: 'M6.8 12.6 C7.2 9.4 10.9 7.2 14.2 8 C16.4 8.5 18 9.9 18.6 11.7 C20.4 11.2 23.3 10.2 24.7 9.7 C25.5 9.4 25.9 10.4 25.1 10.9 C23.5 11.8 20.8 13.2 19 14 C19.1 16.5 17.3 18.9 14.5 19.6 C10.8 20.5 7 18.1 6.6 14.8 C6.5 14 6.6 13.3 6.8 12.6 Z',
    },
    {
      d: 'M25.7 7.2 c0.6 -0.4 1.4 0 1.4 0.7 c0 0.7 -0.8 1.1 -1.4 0.7 c-0.5 -0.3 -0.5 -1 0 -1.4 Z',
      opacity: 0.7,
    },
    {
      d: 'M4 19.6 c0.7 -0.4 1.5 0 1.5 0.8 c0 0.7 -0.8 1.2 -1.5 0.8 c-0.6 -0.4 -0.6 -1.2 0 -1.6 Z',
      opacity: 0.6,
    },
    {
      d: 'M10.9 4.6 c0.5 -0.3 1.1 0 1.1 0.6 c0 0.5 -0.6 0.9 -1.1 0.6 c-0.4 -0.3 -0.4 -0.9 0 -1.2 Z',
      opacity: 0.55,
    },
  ],
  // 2 — two merged drops: a smaller pool ran into a bigger one below it,
  //     pinched at the waist where they met.
  [
    {
      d: 'M12.1 5.9 C14.3 4.8 17.2 5.8 18.2 8 C19 9.7 18.6 11.5 17.4 12.8 C19.5 13.6 21 15.6 20.6 17.9 C20.1 20.7 17 22.5 14 21.8 C11.4 21.2 9.7 18.9 9.9 16.5 C10 15.3 10.6 14.2 11.5 13.4 C10 12.5 9.2 10.8 9.6 9 C9.9 7.6 10.9 6.5 12.1 5.9 Z',
    },
    {
      d: 'M22.4 9.1 c0.7 -0.5 1.7 -0.1 1.8 0.8 c0.1 0.8 -0.8 1.4 -1.6 1 c-0.7 -0.3 -0.8 -1.3 -0.2 -1.8 Z',
      opacity: 0.7,
    },
    {
      d: 'M5.6 13.7 c0.6 -0.4 1.4 -0.1 1.5 0.7 c0.1 0.7 -0.7 1.2 -1.4 0.8 c-0.6 -0.3 -0.6 -1.1 -0.1 -1.5 Z',
      opacity: 0.6,
    },
    {
      d: 'M21.7 22.6 c0.5 -0.3 1.1 0 1.1 0.6 c0 0.5 -0.6 0.9 -1.1 0.6 c-0.4 -0.3 -0.4 -0.9 0 -1.2 Z',
      opacity: 0.5,
    },
  ],
  // 3 — wide flat blot with a drip: ink pooled sideways, then a thin run
  //     bled down the page before drying.
  [
    {
      d: 'M6.4 11.9 C8 9.2 12.6 8 16.6 8.8 C20.1 9.5 22.7 11.6 22.3 13.9 C22 15.9 19.5 17.3 16.4 17.6 C16.6 19.1 16.5 21.3 15.7 22.4 C15.3 23 14.5 22.9 14.3 22.2 C14 21 13.9 19 13.9 17.7 C10.6 17.7 7.3 16.4 6.4 14.3 C6.1 13.5 6.1 12.7 6.4 11.9 Z',
    },
    {
      d: 'M24.5 8 c0.6 -0.4 1.4 -0.1 1.5 0.7 c0.1 0.7 -0.7 1.2 -1.4 0.8 c-0.6 -0.3 -0.6 -1.1 -0.1 -1.5 Z',
      opacity: 0.7,
    },
    {
      d: 'M4.3 18.7 c0.6 -0.3 1.2 0 1.2 0.7 c0 0.6 -0.7 1 -1.2 0.6 c-0.5 -0.3 -0.5 -1 0 -1.3 Z',
      opacity: 0.6,
    },
    {
      d: 'M19.4 21.4 c0.5 -0.3 1.1 0 1.1 0.6 c0 0.5 -0.6 0.9 -1.1 0.6 c-0.4 -0.3 -0.4 -0.9 0 -1.2 Z',
      opacity: 0.55,
    },
  ],
  // 4 — fine spray: smaller lobed core, more flecks scattered wide,
  //     as if the pen was flicked rather than pressed.
  [
    {
      d: 'M10.3 10.2 C12.1 7.9 15.6 7.5 17.8 9.3 C18.9 8.6 20.4 9 20.7 10.2 C21 11.2 20.3 12 19.4 12.3 C20.3 14.2 19.7 16.5 17.9 17.7 C15.6 19.3 12.2 18.8 10.6 16.7 C9.1 14.8 9 12.2 10.3 10.2 Z',
    },
    {
      d: 'M5.1 6.8 c0.7 -0.5 1.6 -0.1 1.7 0.7 c0.1 0.8 -0.8 1.4 -1.6 1 c-0.6 -0.3 -0.7 -1.2 -0.1 -1.7 Z',
      opacity: 0.7,
    },
    {
      d: 'M23.7 6.2 c0.5 -0.3 1.2 0 1.2 0.6 c0 0.6 -0.7 1 -1.2 0.7 c-0.5 -0.3 -0.5 -1 0 -1.3 Z',
      opacity: 0.6,
    },
    {
      d: 'M24.4 16.5 c0.6 -0.4 1.3 0 1.3 0.7 c0 0.6 -0.7 1.1 -1.3 0.7 c-0.5 -0.3 -0.5 -1 0 -1.4 Z',
      opacity: 0.6,
    },
    {
      d: 'M6.1 20.2 c0.5 -0.3 1.1 0 1.1 0.6 c0 0.5 -0.6 0.9 -1.1 0.6 c-0.4 -0.3 -0.4 -0.9 0 -1.2 Z',
      opacity: 0.55,
    },
    {
      d: 'M14.7 23.1 c0.5 -0.2 1 0.1 1 0.6 c0 0.5 -0.6 0.8 -1 0.6 c-0.4 -0.3 -0.4 -0.9 0 -1.2 Z',
      opacity: 0.5,
    },
  ],
];

/**
 * Same FNV-1a as `lib/seed-rotation`, kept local so blot picking can
 * use a salted seed (`#blot`) — otherwise variant and tilt would be
 * locked to the same byte pattern and visually correlate.
 */
function hash32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function variantFor(seed: string): readonly BlotPath[] {
  return BLOT_VARIANTS[hash32(`${seed}#blot`) % BLOT_VARIANTS.length];
}

export function InkBlot({
  size = 28,
  color = 'var(--color-pen-navy)',
  seed = 'ink-blot',
  filter,
  className,
}: InkBlotProps) {
  const angle = tiltFor(seed, 12);
  const paths = variantFor(seed);
  const appliedFilter =
    filter === false ? undefined : (filter ?? 'url(#hand-wobble)');

  return (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 28 28"
      data-ledger-tilt
      className={`inline-block shrink-0 ${className ?? ''}`}
      style={{ transform: `rotate(${angle}deg)` }}
    >
      <g fill={color} style={{ filter: appliedFilter }}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} opacity={p.opacity} />
        ))}
      </g>
    </svg>
  );
}
