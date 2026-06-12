/**
 * `<TornCorner>` — paper-corner tear decoration (§4.7).
 *
 * Hand-drawn tear (Asset A7). Paints a small patch in the corner
 * of its parent that reads as "this sheet's corner has been torn."
 * The patch fills with the parent's background color and exposes a
 * jagged edge — nothing is actually clipped away, so the effect is
 * purely visual. Use on archived / set-aside items per §4.7.
 *
 * The tear line lives in `TEAR_EDGE`; swapping the artwork again only
 * means changing that path — corner/size/color props stay identical.
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

/**
 * Hand-torn tear line (Asset A7), drawn for the top-right corner:
 * from the top edge (x≈27) down to the bottom edge (x≈14). Micro-jags
 * of irregular spacing (0.8–2.8px) and depth (1.5–4.5px) over a base
 * line that bulges slightly toward the corner near the top third,
 * then sweeps concavely back in — the way paper tears along its grain
 * rather than along a cut.
 */
const TEAR_EDGE = `M 27 0
   L 25.4 2.1
   L 28.8 3.6
   L 24.9 6.4
   L 27.6 8.2
   L 26.2 9.1
   L 29.4 11.6
   L 25.1 13.2
   L 27.9 15.8
   L 23.6 17.1
   L 26.8 19.4
   L 24.1 20.3
   L 25.9 23.2
   L 21.8 24.6
   L 24.6 26.9
   L 20.4 28.1
   L 22.9 30.8
   L 18.6 31.9
   L 21.1 34.4
   L 17.2 35.6
   L 19.4 38.2
   L 15.1 39.3
   L 16.9 41.6
   L 13.4 42.4
   L 14.2 44`;

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
      {/* Paint the top-right corner with `background` up to the tear
          line, mimicking the absent paper. The tear runs top-edge to
          bottom-edge with irregular fiber jags — spacing and depth
          vary, and the line bows slightly toward the corner before
          sweeping back in (a hand-tear, not a scissor cut). */}
      <path
        d={`${TEAR_EDGE}
           L 14.2 44
           L 44 44
           L 44 0 Z`}
        fill={background}
      />
      {/* A fainter offset stroke just inside the tear — the lifted
          paper-fiber layer beneath the visible edge. */}
      <path
        d="M 27.8 1.2
           L 27.1 4.1
           L 28.7 7.4
           L 27.3 10.6
           L 28.5 14.2
           L 26.1 17.6
           L 26.9 21.2
           L 24.3 24.8
           L 23.8 28.6
           L 21.5 31.8
           L 20.6 35.5
           L 17.9 38.8
           L 16.1 42.5"
        fill="none"
        stroke={edgeColor}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.22"
      />
      {/* The tear edge itself — slightly darker where the fibers
          separated. */}
      <path
        d={TEAR_EDGE}
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
