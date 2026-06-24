/**
 * `<TerrainGlyph>` — the starter terrain set (Trips DS §5). Münster/Saxton
 * "molehill" convention: little drawn marks, 1px stroke, flat or no fill,
 * hand-wobbled. v1 ships THREE; the library grows one glyph at a time
 * (Phase 4, "a world that grows"). Decorative → aria-hidden.
 *
 * mountain — overlapping humps with one shaded flank
 * tree     — lollipop cluster
 * wave     — parallel wavy lines (open water)
 */
export type TerrainKind = 'mountain' | 'tree' | 'wave';

export function TerrainGlyph({
  kind,
  size = 28,
  className,
}: {
  kind: TerrainKind;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ filter: 'url(#hand-wobble)' }}
    >
      <g
        fill="none"
        stroke="var(--trips-ink)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === 'mountain' && (
          <>
            <path d="M 3 26 L 11 12 L 16 20 L 22 9 L 29 26 Z" />
            {/* one shaded flank */}
            <path d="M 22 9 L 29 26 L 24 26 Z" fill="var(--trips-stipple)" stroke="none" opacity="0.5" />
            <path d="M 11 12 L 16 20 L 13 22 Z" fill="var(--trips-stipple)" stroke="none" opacity="0.35" />
          </>
        )}
        {kind === 'tree' && (
          <>
            <circle cx="11" cy="13" r="6" />
            <path d="M 11 19 L 11 27" />
            <circle cx="21" cy="16" r="5" />
            <path d="M 21 21 L 21 27" />
          </>
        )}
        {kind === 'wave' && (
          <>
            <path d="M 3 12 Q 8 8 13 12 T 23 12 T 30 12" />
            <path d="M 3 20 Q 8 16 13 20 T 23 20 T 30 20" />
          </>
        )}
      </g>
    </svg>
  );
}
