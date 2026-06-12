/**
 * Horizontal notebook ruled lines — 1px `rule-blue` every 32px,
 * anchored to a 12px top offset per §3.1. Expected to sit inside a
 * `position: relative` surface (typically `<Page>`).
 *
 * Even-empty-space rule: the lines continue through empty areas of
 * the page — that's what makes the surface recognisably "paper."
 *
 * Drawn as an inline SVG pattern rather than a CSS
 * `repeating-linear-gradient`: the page-flip capture (PAGE_FLIP.md §2)
 * serializes the DOM through SVG `foreignObject`, and some engines
 * (Zen/older Gecko, stable Safari) rasterize repeating gradients there
 * with a collapsed period — the whole layer comes out solid rule-blue
 * on the turning leaf. Inline SVG is the capture-proven path (same as
 * the hand-drawn charts). See DECISION_LOG 2026-06-12.
 */
type RuledLinesProps = {
  /** Top offset of the first rule line in px. Defaults to 12 per §3.1. */
  offset?: number | string;
  /**
   * Line rhythm in px. Defaults to 32 — must match the `--rule-spacing`
   * token (SVG pattern tiles can't read CSS custom properties).
   */
  spacing?: number;
  className?: string;
};

export function RuledLines({
  offset = 12,
  spacing = 32,
  className,
}: RuledLinesProps) {
  const offsetPx =
    typeof offset === 'number' ? offset : Number.parseFloat(offset) || 0;
  // Stays a server component, so no useId — the id is derived from the
  // props. Same-props duplicates share one definition, which is exactly
  // what `url(#…)` resolves to anyway.
  const patternId = `paper-rules-${spacing}-${offsetPx}`;

  return (
    <svg
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ''}`}
    >
      <defs>
        <pattern
          id={patternId}
          width="8"
          height={spacing}
          y={offsetPx}
          patternUnits="userSpaceOnUse"
        >
          <rect width="8" height="1" fill="var(--color-rule-blue)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
