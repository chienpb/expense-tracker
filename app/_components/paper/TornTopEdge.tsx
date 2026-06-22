/**
 * `<TornTopEdge>` — horizontal torn-paper top edge (§3.4 · mobile receipts).
 *
 * The full-width sibling of `<TornCorner>`. Where the corner tear marks
 * an archived sheet, this runs the width of a card and reads as "this
 * receipt was torn off the pad." Used to top the receipt cards the
 * `<LedgerTable>` collapses into below 640px.
 *
 * Mechanics mirror `<TornCorner>`: nothing is clipped away. The SVG sits
 * just above the card's top edge, paints the card's own background up to
 * an irregular tear line (so the body blends seamlessly into it), and
 * leaves the area above the line transparent so the page shows through.
 * `preserveAspectRatio="none"` lets the fixed-viewBox jags stretch to any
 * card width. Decorative only — `aria-hidden`, no hit-testing.
 */
type TornTopEdgeProps = {
  /** Height of the torn strip in px. Default 8. */
  height?: number;
  /** Card background to paint up to the tear line. Match the card. */
  background?: string;
  /** Tear-line stroke color. Default `ink-mute`. */
  edgeColor?: string;
  className?: string;
};

// Irregular fiber tear across a 120-wide viewBox. Peaks/valleys vary in
// spacing and depth so the edge reads as torn-along-the-grain rather
// than a saw-tooth pattern. The fill closes down to the strip's base.
const TEAR_LINE =
  'M0 5.4 L6 2.1 L11 6.2 L17.5 3 L24 5.6 L31 1.6 L37.5 5.1 L44 2.9 ' +
  'L51 6.1 L57.5 2.6 L64 5 L71 1.9 L78 5.7 L85 3 L92 6.2 L99 2.2 ' +
  'L106 5.1 L113 3.1 L120 5.3';

export function TornTopEdge({
  height = 8,
  background = 'var(--color-paper)',
  edgeColor = 'var(--color-ink-mute)',
  className,
}: TornTopEdgeProps) {
  return (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      width="100%"
      height={height}
      viewBox="0 0 120 8"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 ${className ?? ''}`}
      style={{ top: -(height - 1) }}
    >
      {/* Paint the card surface up to the tear line; above it stays
          transparent so the ruled page reads through the torn edge. */}
      <path d={`${TEAR_LINE} L120 8 L0 8 Z`} fill={background} />
      {/* The tear edge itself — fibers parted, faint. */}
      <path
        d={TEAR_LINE}
        fill="none"
        stroke={edgeColor}
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
