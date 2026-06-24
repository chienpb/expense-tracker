import { tiltFor } from '@/lib/seed-rotation';

/**
 * `<WaxSeal>` — the marker primitive (Trips DS §5). Atlas trip-markers
 * AND trip-map scene-openers are the same object. Matte (recesses darker
 * than the rim — NOT a glossy gradient blob), irregular, seeded rotation.
 *
 * States:
 *  - sealed  : intact, unvisited (default)
 *  - broken  : visited — the wax cracked
 *  - ghost   : private / locked on a public Atlas (shadow impression only)
 *
 * Interactive when `onActivate`/href is implied by the parent wrapping it
 * in a button/link; this renders the seal itself + an accessible label.
 */
export function WaxSeal({
  id,
  label,
  color = 'red',
  state = 'sealed',
  glyph,
  size = 44,
}: {
  /** Stable id → deterministic tilt (feels placed, not random). */
  id: string;
  /** Accessible name (the trip/scene title). */
  label: string;
  color?: 'red' | 'gold';
  state?: 'sealed' | 'broken' | 'ghost';
  /** A short hand-drawn monogram pressed into the wax (1–2 chars). No emoji. */
  glyph?: string;
  size?: number;
}) {
  const rim = color === 'gold' ? 'var(--trips-gold)' : 'var(--trips-wax-red)';
  const tilt = tiltFor(id, 4);
  const isGhost = state === 'ghost';

  return (
    <span
      role="img"
      aria-label={isGhost ? `${label} (private)` : label}
      style={{ display: 'inline-block', width: size, height: size }}
    >
      <svg
        viewBox="-25 -25 50 50"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        style={{ transform: `rotate(${tilt}deg)`, opacity: isGhost ? 0.28 : 1 }}
      >
        {/* irregular matte disc: recesses (inner) darker than rim */}
        <circle
          cx="0"
          cy="0"
          r="22"
          fill={isGhost ? 'var(--trips-sea-deep)' : rim}
          stroke={isGhost ? 'none' : 'var(--trips-ink)'}
          strokeWidth="0.8"
          style={{ filter: 'url(#hand-wobble)' }}
        />
        {!isGhost && (
          <circle
            cx="0"
            cy="0"
            r="15"
            fill="rgba(0,0,0,0.18)"
            style={{ filter: 'url(#hand-wobble)' }}
          />
        )}
        {/* pressed monogram — hand-set, never an emoji/icon */}
        {!isGhost && glyph && (
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-hand-signature, cursive)"
            fontSize="16"
            fill="rgba(255,255,255,0.82)"
          >
            {glyph}
          </text>
        )}
        {/* broken: a single crack across the wax */}
        {state === 'broken' && (
          <path
            d="M -18 -6 L -4 2 L 2 -4 L 16 8"
            fill="none"
            stroke="var(--trips-ink)"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.6"
            style={{ filter: 'url(#hand-wobble)' }}
          />
        )}
      </svg>
    </span>
  );
}
