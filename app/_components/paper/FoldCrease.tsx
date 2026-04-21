/**
 * `<FoldCrease>` — a diagonal crease across a paper corner (§4.7).
 *
 * Coded placeholder for Asset A4. A single thin diagonal line with a
 * faint shadow running along one side, signalling "this sheet has been
 * folded." Used on monthly-summary pages where the paper has been
 * folded to fit an envelope.
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

// TODO(A4): replace with Chien's fold-crease SVG / PNG.
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
      {/* A subtle "lighter paper" triangle on one side of the crease
          suggests the folded-back flap caught the light. Kept at 6%
          opacity so it never reads as a gradient per §11. */}
      <polygon points="90,0 90,90 0,0" fill="var(--color-paper-2)" opacity="0.55" />
      {/* The crease itself — 1px ink, slightly irregular thanks to the
          shared hand-wobble filter. */}
      <line
        x1="90"
        y1="0"
        x2="0"
        y2="90"
        stroke="var(--color-ink-mute)"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.45"
        style={{ filter: 'url(#hand-wobble)' }}
      />
      {/* A barely-visible shadow on the unfolded side reinforces the
          fold without becoming a drop shadow. */}
      <line
        x1="88"
        y1="2"
        x2="2"
        y2="88"
        stroke="var(--color-ink)"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.12"
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
