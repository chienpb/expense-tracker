/**
 * `<PaperClip>` — metal paper-clip decoration (§4.7).
 *
 * Hand-drawn asset A6. Renders a stroke-only SVG of the classic gem
 * clip — one continuous wire: nested double loop at the top, a bottom
 * bend that sweeps across the inner leg (the crossover), free ends at
 * the bottom — positioned absolutely on a corner of the parent.
 * Consumers mark a page or card as "starred / pinned" by rendering a
 * clip over the top edge.
 */
type PaperClipProps = {
  /** Anchor corner. Default `tl` (top-left). */
  corner?: 'tl' | 'tr' | 'bl' | 'br';
  /** Overall bounding size in px. Default 48. */
  size?: number;
  /** Rotation in degrees. Default leans inward (-14 on tl/bl, +14 on tr/br). */
  rotation?: number;
  /** Offset from the corner in px. Default 12. */
  offset?: number;
  className?: string;
};

export function PaperClip({
  corner = 'tl',
  size = 48,
  rotation,
  offset = 12,
  className,
}: PaperClipProps) {
  const angle = rotation ?? (corner === 'tl' || corner === 'bl' ? -14 : 14);
  const position = cornerPosition(corner, offset);

  return (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      width={size}
      height={size * 1.6}
      viewBox="0 0 32 52"
      className={`pointer-events-none absolute ${className ?? ''}`}
      data-ledger-tilt
      style={{ ...position, transform: `rotate(${angle}deg)` }}
    >
      {/* Gem clip traced as one continuous wire, the way a pen would
          follow it without lifting:
            1. inner free end at the bottom (tip pokes just past the
               bottom loop — the inner-leg crossover of a real clip),
            2. up the inner-left leg, over the small top bend,
            3. down the inner-right leg, around the bottom bend which
               sweeps left *across* the inner leg,
            4. up the outer-left leg, over the wide top bend (nesting
               the small one), down the outer-right leg to the free end,
               which eases inward like a relaxed wire tip.
          Straight runs are shallow cubics with ±0.3px drift so the
          lines waver like careful pen strokes, not vector rules. */}
      <path
        d="M 12.5 49.7
           C 12.7 46.4 12.8 40.2 13 35.2
           C 13.2 28 13.1 20.2 13.3 13.4
           C 13.4 9.6 14.9 7.4 16.6 7.5
           C 18.3 7.6 19.5 9.8 19.5 13.1
           C 19.4 20.4 19.6 28 19.5 34.2
           C 19.45 36.6 19.6 39 19.6 40.8
           C 19.8 44.8 17.6 47.9 14.6 48
           C 11.6 48.1 9.7 44.6 9.8 40.4
           C 9.6 34.2 9.8 26 9.7 18.2
           C 9.65 15.2 9.7 12.6 9.8 10.6
           C 9.9 5.8 12.4 3 16.4 3.1
           C 20.4 3.2 23.1 6.2 23.1 10.4
           C 23 18.2 23.2 26 23.1 33.2
           C 23.05 36.4 23.2 40.4 22.9 43.8
           C 22.85 44.6 22.6 45.3 22.2 45.8"
        fill="none"
        stroke="var(--color-ink-mute)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sheen — two faint hairlines riding the lit edge of the outer
          wire (left leg + top bend), instead of a gradient (§11: no
          gradients on UI chrome). Kept dim so it reads as a glint. */}
      <path
        d="M 10.7 13.5
           C 10.6 21 10.8 29 10.7 36.5"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path
        d="M 12.3 5.7
           C 13.6 4.5 15.2 4 16.6 4.1"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function cornerPosition(
  corner: 'tl' | 'tr' | 'bl' | 'br',
  offset: number,
): React.CSSProperties {
  const o = `${offset}px`;
  switch (corner) {
    case 'tl':
      return { top: `-${offset / 2}px`, left: o };
    case 'tr':
      return { top: `-${offset / 2}px`, right: o };
    case 'bl':
      return { bottom: `-${offset / 2}px`, left: o };
    case 'br':
      return { bottom: `-${offset / 2}px`, right: o };
  }
}
