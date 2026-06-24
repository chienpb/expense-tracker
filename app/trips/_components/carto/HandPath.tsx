import type { Pt } from '@/lib/trips-carto';
import { toPath } from '@/lib/trips-carto';

/**
 * `<HandPath>` — the workhorse stroke (Trips DS §5). Renders a route,
 * rhumb line, coastline, or any inked line through NORMALIZED 0–1 points.
 *
 * - `variant="route"`: the traveller's path — ink-brown, varied-length
 *   dashes (never even round dots), round caps, hand-wobbled.
 * - `variant="ink"`: a solid structural line (coastline, cartouche rule).
 * - `variant="rhumb"`: faint, thin, low-opacity sea guides.
 *
 * Points are 0–1; the parent gives the pixel box via `width`/`height`.
 * Decorative by default (aria-hidden); pass `label` for a meaningful line.
 */
export function HandPath({
  points,
  variant = 'ink',
  width,
  height,
  label,
  className,
}: {
  points: Pt[];
  variant?: 'route' | 'ink' | 'rhumb';
  width: number;
  height: number;
  label?: string;
  className?: string;
}) {
  const d = toPath(points, 100);
  const stroke = {
    route: 'var(--trips-route)',
    ink: 'var(--trips-ink)',
    rhumb: 'var(--trips-rhumb)',
  }[variant];
  // Varied-length dashes for the route (the anti-"even-dots" tell);
  // solid for ink; sparse for rhumb.
  const dash = { route: '5 3 2 4 7 3', ink: undefined, rhumb: '1 5' }[variant];
  const w = { route: 1.6, ink: 1, rhumb: 0.4 }[variant];
  const opacity = variant === 'rhumb' ? 0.5 : 1;

  return (
    <svg
      viewBox="0 0 100 100"
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      style={{ filter: 'url(#hand-wobble)', overflow: 'visible' }}
    >
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash}
        opacity={opacity}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
