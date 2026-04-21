/**
 * `<TallyMarks>` — hand-drawn count marks (§4.11).
 *
 * Renders `count` strokes grouped in fives with a diagonal slash
 * through each full group (the IIII-and-a-slash that everyone has
 * seen on the back of a receipt). Hand-drawn via SVG with the shared
 * `#hand-wobble` filter so the strokes look made by one pen.
 *
 * We chose SVG over Caveat text (which the spec mentions) because
 * the glyph "|" renders cleanly in almost no handwriting font and
 * the crossbar on a full group is impossible to typeset anyway.
 * The spec's intent — "hand-drawn tally, pen-navy" — is what ships.
 *
 * A11y: lifts the count into the a11y tree as `"Tally: 17"`. The
 * strokes themselves are decorative.
 */
type TallyMarksProps = {
  /** How many tallies to draw. Clamped to 0. */
  count: number;
  /** Group size. §4.11 default is 5; pass 4 for the "four-bar" variant. */
  groupSize?: number;
  /** Stroke color. Default `pen-navy`. */
  color?: string;
  /** Height in px for one group's strokes. Default 28. */
  height?: number;
  /** Override the wobble filter (e.g. disable in CI snapshots). */
  filter?: string | false;
  /** A11y label prefix. Default `"Tally"`. */
  label?: string;
  className?: string;
};

const STROKE_W = 1.5;
const STROKE_GAP = 5; // px between strokes
const STROKE_LEAN = 1.2; // px — top drifts right
const GROUP_GAP = 10; // px between groups

export function TallyMarks({
  count,
  groupSize = 5,
  color = 'var(--color-pen-navy)',
  height = 28,
  filter,
  label = 'Tally',
  className,
}: TallyMarksProps) {
  const total = Math.max(0, Math.floor(count));
  const appliedFilter =
    filter === false ? undefined : (filter ?? 'url(#hand-wobble)');

  const fullGroups = Math.floor(total / groupSize);
  const remainder = total - fullGroups * groupSize;

  // Lay out in a single flex row so consumers can `flex-wrap` by
  // setting max-width on the wrapper. Each group is its own inline
  // SVG so the crossbar math stays local.
  const groupWidth = (groupSize - 1) * STROKE_GAP + STROKE_W + STROKE_LEAN * 2;
  const fullGroupViewBoxWidth = groupWidth + 4; // room for the crossbar ends

  return (
    <span
      role="img"
      aria-label={`${label}: ${total}`}
      className={`inline-flex items-end gap-[${GROUP_GAP}px] ${className ?? ''}`}
      style={{ gap: `${GROUP_GAP}px` }}
    >
      {Array.from({ length: fullGroups }).map((_, i) => (
        <svg
          key={`g-${i}`}
          aria-hidden="true"
          role="presentation"
          focusable="false"
          height={height}
          viewBox={`0 0 ${fullGroupViewBoxWidth} ${height}`}
          style={{ width: `${fullGroupViewBoxWidth}px` }}
        >
          <TallyStrokes
            color={color}
            count={groupSize}
            height={height}
            filter={appliedFilter}
          />
          {/* Crossbar — a quick diagonal from lower-left to upper-right
              of the group, drawn slightly past the vertical strokes
              at each end for the "slash through" read. */}
          <path
            d={`M 0 ${height - 3} L ${fullGroupViewBoxWidth} 3`}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_W}
            strokeLinecap="round"
            style={{ filter: appliedFilter }}
          />
        </svg>
      ))}
      {remainder > 0 && (
        <svg
          aria-hidden="true"
          role="presentation"
          focusable="false"
          height={height}
          viewBox={`0 0 ${remainder * STROKE_GAP} ${height}`}
          style={{ width: `${remainder * STROKE_GAP}px` }}
        >
          <TallyStrokes
            color={color}
            count={remainder}
            height={height}
            filter={appliedFilter}
          />
        </svg>
      )}
    </span>
  );
}

function TallyStrokes({
  color,
  count,
  height,
  filter,
}: {
  color: string;
  count: number;
  height: number;
  filter?: string;
}) {
  return (
    <g style={{ filter }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = i * STROKE_GAP + 2;
        return (
          <path
            key={i}
            d={`M ${x + STROKE_LEAN} 2 L ${x} ${height - 2}`}
            stroke={color}
            strokeWidth={STROKE_W}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </g>
  );
}
