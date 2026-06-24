import type { ReactNode } from 'react';

/**
 * `<Cartouche>` — a strapwork title plate (Trips DS §5). Dutch-Golden-Age
 * rolled-corner brackets around a hand-set title. ONE per surface; allowed
 * only on the Atlas masthead and a trip-map cover — forbidden in lists and
 * scene captions (see §3 decoration budget).
 *
 * The title is the WRITTEN layer → Caveat; an optional sub is PRINTED →
 * Courier. The border is hand-wobbled so no two render identically.
 */
export function Cartouche({
  title,
  sub,
  className,
}: {
  title: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative inline-block px-8 py-4 ${className ?? ''}`}>
      {/* strapwork frame */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ filter: 'url(#hand-wobble)' }}
      >
        <rect
          x="2"
          y="3"
          width="96"
          height="94"
          fill="var(--trips-land-hi)"
          stroke="var(--trips-frame)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        {/* rolled corner brackets */}
        {[
          'M 2 14 C -4 10 -4 2 8 3',
          'M 98 14 C 104 10 104 2 92 3',
          'M 2 86 C -4 90 -4 98 8 97',
          'M 98 86 C 104 90 104 98 92 97',
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--trips-frame)"
            strokeWidth="1.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="relative text-center">
        <div
          className="font-hand-signature leading-tight text-[var(--trips-ink)]"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
        >
          {title}
        </div>
        {sub && (
          <div className="mt-1 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-frame)]">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
