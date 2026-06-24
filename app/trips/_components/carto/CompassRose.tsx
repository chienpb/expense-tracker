/**
 * `<CompassRose>` — 16-point portolan wind-rose (Trips DS §5).
 *
 * Flat two-color, hand-wobbled, NOT 3D/gradient/symmetric-clipart. Goes
 * off-center in a corner; it has a job (orientation), one per map. The
 * fleur on North and alternating filled/hollow points are the historical
 * tell (Catalan Atlas convention). Decorative → aria-hidden.
 */
export function CompassRose({
  size = 96,
  className,
}: {
  size?: number;
  className?: string;
}) {
  // 16 winds; long cardinals, shorter half/quarter winds.
  const points = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2; // 0 = North (up)
    const long = i % 4 === 0;
    const r = long ? 46 : i % 2 === 0 ? 30 : 20;
    return { a, r, filled: i % 2 === 0 };
  });

  return (
    <svg
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ filter: 'url(#hand-wobble)' }}
    >
      {/* rhumb circle */}
      <circle cx="0" cy="0" r="47" fill="none" stroke="var(--trips-ink)" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="8" fill="none" stroke="var(--trips-ink)" strokeWidth="0.6" />
      {points.map(({ a, r, filled }, i) => {
        const tip = { x: Math.cos(a) * r, y: Math.sin(a) * r };
        const w = i % 4 === 0 ? 5 : 3;
        const baseA1 = a - Math.PI / 2;
        const l = { x: Math.cos(baseA1) * w, y: Math.sin(baseA1) * w };
        // Each point is a kite split into a filled half and a hollow half.
        return (
          <g key={i}>
            <polygon
              points={`0,0 ${l.x},${l.y} ${tip.x},${tip.y}`}
              fill={filled ? 'var(--trips-ink)' : 'none'}
              stroke="var(--trips-ink)"
              strokeWidth="0.5"
            />
            <polygon
              points={`0,0 ${-l.x},${-l.y} ${tip.x},${tip.y}`}
              fill="none"
              stroke="var(--trips-ink)"
              strokeWidth="0.5"
            />
          </g>
        );
      })}
      {/* North fleur — a small lily, the hand-set signature */}
      <path
        d="M 0 -47 C -3 -40 -3 -36 0 -34 C 3 -36 3 -40 0 -47 Z"
        fill="var(--trips-gold)"
        stroke="var(--trips-ink)"
        strokeWidth="0.5"
      />
    </svg>
  );
}
