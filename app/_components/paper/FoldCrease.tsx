/**
 * `<FoldCrease>` — a diagonal crease across a paper corner (§4.7).
 *
 * Asset A4. A folded-over corner: a softly curved crease line, the
 * turned-back flap in a slightly lighter paper tone with a gently
 * bowed edge, and a soft shadow under the fold — signalling "this
 * sheet has been folded." Used on monthly-summary pages where the
 * paper has been folded to fit an envelope.
 *
 * Positioned absolutely — parent must be `position: relative`. Purely
 * decorative; hidden from assistive tech.
 */
type FoldCreaseProps = {
  /** Corner the crease leans toward. Default `tr`. */
  corner?: 'tl' | 'tr' | 'bl' | 'br';
  /** Length of the crease in px. Default 90. */
  size?: number;
  className?: string;
};

// Asset A4 — hand-drawn fold. Drawn in the default `tr` orientation
// (corner at 90,0); the other corners reuse it via mirror transforms.
export function FoldCrease({
  corner = 'tr',
  size = 90,
  className,
}: FoldCreaseProps) {
  const position = cornerPosition(corner);
  const flip = cornerFlip(corner);

  return (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 90 90"
      className={`pointer-events-none absolute ${className ?? ''}`}
      style={{ ...position, transform: flip }}
    >
      {/* Soft shadow the flap casts on the sheet — runs just outside the
          fold on the unfolded side, slightly fatter mid-way where the
          paper lifts. Barely there (~12%) so it never reads as a drop
          shadow per §11. */}
      <path
        d="M 87.5 90 C 64 65.5, 42 43, 26 27.5 C 17.5 19.5, 8.5 10.5, 1 3"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.12"
      />
      {/* The folded-over flap. Slightly lighter paper tone — it caught
          the light when it was turned over. The hypotenuse bows gently
          toward the corner: real paper bellies along a fold instead of
          creasing dead straight. */}
      <path
        d="M 90 0 L 90 90 C 61 58.5, 30.5 27.5, 0 0 Z"
        fill="var(--color-paper-2)"
        opacity="0.55"
      />
      {/* A faint second pass along the flap's free edge so the turned-
          over sheet has a discernible paper edge, not just a fill. */}
      <path
        d="M 88.5 87 C 60.5 57.5, 32 29, 2.5 2"
        fill="none"
        stroke="var(--color-paper-2)"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* The crease itself — thin ink line wavering along the fold
          (paper never folds perfectly straight), roughened further by
          the shared hand-wobble filter. */}
      <path
        d="M 89.5 89 C 73 71.5, 58 57.5, 45.5 44.5 C 33 31.5, 14.5 14, 0.5 1"
        fill="none"
        stroke="var(--color-ink-mute)"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.45"
        style={{ filter: 'url(#hand-wobble)' }}
      />
      {/* Two short pressure marks where the fold was pinched flat —
          the kind of emphasis a thumbnail run leaves near each end. */}
      <path
        d="M 84 83 C 79.5 78.5, 76.5 75.5, 72.5 71.5 M 17 16 C 13 12, 9.5 8.5, 6 5"
        fill="none"
        stroke="var(--color-ink-mute)"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.3"
        style={{ filter: 'url(#hand-wobble)' }}
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
