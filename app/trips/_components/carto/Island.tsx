import type { ReactNode } from 'react';

/**
 * `<Island>` — a parchment landmass on the Sea (Trips DS §2).
 *
 * The land is NEVER one fill: a darker interior (`land-lo`) with a warmer
 * coastal rim (`land-hi`), a hand-wobbled brown-black coastline (never pure
 * black), and coastal stipple feathering into the water — the portolan
 * signature, the single strongest hand-made tell. Paper fiber from the
 * shared #paper-grain shows through.
 *
 * `d` is an SVG path in a 0–100 viewBox; a default believable silhouette is
 * provided. Markers (WaxSeals) render as children, absolutely positioned.
 */
const DEFAULT_ISLAND =
  'M 20 50 C 16 38 26 28 38 26 C 44 18 60 18 66 28 C 80 28 86 40 82 52 C 88 60 82 74 70 76 C 62 86 44 86 36 78 C 22 78 16 64 20 50 Z';

export function Island({
  id = 'default',
  d = DEFAULT_ISLAND,
  size = 320,
  children,
  className,
}: {
  /** Distinct per island on a page — scopes the clip-path id (no hooks in RSC). */
  id?: string;
  d?: string;
  size?: number;
  children?: ReactNode;
  className?: string;
}) {
  const clipId = `island-clip-${id}`;
  return (
    <div
      className={`relative ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="absolute inset-0"
        aria-hidden="true"
        focusable="false"
        style={{ filter: 'url(#hand-wobble)' }}
      >
        {/* coastal stipple: an expanded, short-dashed echo feathering into the sea */}
        <path
          d={d}
          fill="none"
          stroke="var(--trips-stipple)"
          strokeWidth="2.4"
          strokeDasharray="0.6 2.4"
          strokeLinecap="round"
          opacity="0.55"
          transform="translate(50 50) scale(1.05) translate(-50 -50)"
        />
        {/* interior (darker) */}
        <path d={d} fill="var(--trips-land-lo)" />
        {/* coastal rim (warmer/lighter), inset slightly */}
        <path
          d={d}
          fill="var(--trips-land-hi)"
          transform="translate(50 50) scale(0.86) translate(-50 -50)"
        />
        {/* paper fiber clipped to the land */}
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          clipPath={`url(#${clipId})`}
          fill="var(--trips-ink)"
          style={{ filter: 'url(#paper-grain)' }}
          opacity="0.5"
        />
        {/* coastline — brown-black, never #000 */}
        <path
          d={d}
          fill="none"
          stroke="var(--trips-ink)"
          strokeWidth="1"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {children}
    </div>
  );
}
