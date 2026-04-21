/**
 * `<PaperClip>` — metal paper-clip decoration (§4.7).
 *
 * Coded placeholder for Asset A6. Renders a stroke-only SVG of a
 * standard paper-clip silhouette — two concentric rounded loops with
 * a final curl — positioned absolutely on a corner of the parent.
 * Consumers mark a page or card as "starred / pinned" by rendering a
 * clip over the top edge.
 *
 * When Chien ships the real paper-clip, only the SVG body changes;
 * the prop shape is stable.
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

// TODO(A6): replace with Chien's hand-drawn paper-clip SVG.
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
      {/* Outer loop — drops down the page, hooks at the bottom, turns
          back up and finishes just shy of the top. */}
      <path
        d="M 10 3
           L 10 42
           Q 10 49 16 49
           Q 22 49 22 42
           L 22 12
           Q 22 7 18 7
           Q 14 7 14 12
           L 14 40"
        fill="none"
        stroke="var(--color-ink-mute)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Highlight to hint at the metal sheen without adding a gradient
          (§11 — no gradients on UI chrome). */}
      <path
        d="M 11 6 L 11 40"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
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
