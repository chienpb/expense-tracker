/**
 * `<TornCorner>` — paper-corner tear decoration (§4.7).
 *
 * Coded placeholder for Asset A7. Paints a small patch in the corner
 * of its parent that reads as "this sheet's corner has been torn."
 * The patch fills with the parent's background color and exposes a
 * jagged edge — nothing is actually clipped away, so the effect is
 * purely visual. Use on archived / set-aside items per §4.7.
 *
 * When Chien ships the hand-drawn tear (Asset A7), only the SVG path
 * changes; corner/size/color props stay identical.
 */
type TornCornerProps = {
  /** Anchor corner. Default `tr` (top-right). */
  corner?: 'tl' | 'tr' | 'bl' | 'br';
  /** Size of the torn patch in px. Default 44. */
  size?: number;
  /**
   * Background color to paint over. Should match the surface behind
   * the torn corner — typically `paper` (default) or `paper-2`.
   */
  background?: string;
  /** Color of the torn-edge line. Default `ink-mute`. */
  edgeColor?: string;
  className?: string;
};

// TODO(A7): replace with Chien's hand-drawn torn-corner SVG.
export function TornCorner({
  corner = 'tr',
  size = 44,
  background = 'var(--color-paper)',
  edgeColor = 'var(--color-ink-mute)',
  className,
}: TornCornerProps) {
  const position = cornerPosition(corner);
  const flip = cornerFlip(corner);

  return (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 44 44"
      className={`pointer-events-none absolute ${className ?? ''}`}
      style={{ ...position, transform: flip }}
    >
      {/* Paint the top-right corner with `background` up to a jagged
          tear line, mimicking the absent paper. */}
      <path
        d="M 44 0
           L 44 44
           L 8 44
           L 12 36
           L 6 30
           L 14 25
           L 10 18
           L 18 14
           L 16 8
           L 24 6
           L 26 0 Z"
        fill={background}
      />
      {/* The tear itself — a slightly darker edge where the fibers
          separated. */}
      <path
        d="M 26 0 L 24 6 L 16 8 L 18 14 L 10 18 L 14 25 L 6 30 L 12 36 L 8 44"
        fill="none"
        stroke={edgeColor}
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}

function cornerPosition(
  corner: 'tl' | 'tr' | 'bl' | 'br',
): React.CSSProperties {
  switch (corner) {
    case 'tl':
      return { top: 0, left: 0 };
    case 'tr':
      return { top: 0, right: 0 };
    case 'bl':
      return { bottom: 0, left: 0 };
    case 'br':
      return { bottom: 0, right: 0 };
  }
}

function cornerFlip(corner: 'tl' | 'tr' | 'bl' | 'br'): string | undefined {
  // The path is drawn for the top-right corner; mirror for the others.
  switch (corner) {
    case 'tr':
      return undefined;
    case 'tl':
      return 'scaleX(-1)';
    case 'br':
      return 'scaleY(-1)';
    case 'bl':
      return 'scale(-1, -1)';
  }
}
