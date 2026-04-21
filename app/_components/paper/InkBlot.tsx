import { tiltFor } from '@/lib/seed-rotation';

/**
 * `<InkBlot>` — irregular splatter used as the error marker (§4.12 · §6.7).
 *
 * Coded placeholder for Asset A3. A small ellipse pushed through
 * `url(#hand-wobble)` to break its outline, plus two satellite flecks
 * for the "splashed ink" read. Used next to a field whose value
 * couldn't be written (validation error) — softer than a red banner,
 * still unambiguous when paired with the margin note per §6.7.
 *
 * Decorative by default (`role="presentation"`, `aria-hidden`). Real
 * meaning lives in the adjacent error text so screen readers don't
 * have to reinterpret a splatter glyph.
 *
 * Swap contract: when Chien ships the hand-inked blot set (A3), the
 * `<g>` body is the only thing that changes. Size, color, and seeded
 * rotation props stay identical.
 */
type InkBlotProps = {
  /** Bounding-box size in px. Default 28. */
  size?: number;
  /** Ink color. Default `pen-navy`. Errors use `stamp-red`. */
  color?: string;
  /** Tilt seed. Defaults to `"ink-blot"`; set per-row for variety. */
  seed?: string;
  /** Override the wobble filter (e.g. disable in a CI snapshot). */
  filter?: string | false;
  className?: string;
};

// TODO(A3): replace the inline paths with Chien's hand-inked blot set.
export function InkBlot({
  size = 28,
  color = 'var(--color-pen-navy)',
  seed = 'ink-blot',
  filter,
  className,
}: InkBlotProps) {
  const angle = tiltFor(seed, 12);
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
        {/* Main body — irregular enough after wobble to read as a blot,
            not a dot. Radii are prime-ish so the displacement doesn't
            resolve to a clean oval. */}
        <ellipse cx="14" cy="14" rx="7" ry="6" />
        {/* A tail where the pen lifted. */}
        <ellipse cx="20.5" cy="11.5" rx="2.2" ry="1.4" opacity="0.85" />
        {/* Two satellite flecks — the drops that flew when the pen
            pressed too hard. */}
        <circle cx="5" cy="9" r="1.1" opacity="0.7" />
        <circle cx="22.5" cy="20" r="0.8" opacity="0.6" />
      </g>
    </svg>
  );
}
