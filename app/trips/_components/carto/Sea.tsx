import type { ReactNode } from 'react';

/**
 * `<Sea>` — the Atlas ground (Trips DS §2, resolved fork: sea-dominant).
 *
 * An aged, UNEVEN dilute iron-gall green-grey wash — never a flat fill,
 * never teal/sepia. Built from layered off-center radial gradients (cheap,
 * SSR-identical, no live full-surface filter). Optional faint rhumb lines
 * radiate from a hidden corner wind-rose — the portolan signature that
 * fills the sea without a fill. Islands (trips) render as children.
 */
export function Sea({
  rhumb = true,
  children,
  className,
}: {
  rhumb?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  // Rhumb lines from one off-center origin (16 winds), drawn faint + thin.
  // Coordinates in a 0–100 viewBox; rays run well past the edges (clipped).
  const ox = 72;
  const oy = 34;
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return { x2: ox + Math.cos(a) * 160, y2: oy + Math.sin(a) * 160 };
  });

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{
        backgroundColor: 'var(--trips-sea)',
        backgroundImage: [
          'radial-gradient(60% 50% at 22% 28%, rgba(255,255,255,0.10), transparent 70%)',
          'radial-gradient(70% 60% at 80% 75%, var(--trips-sea-deep), transparent 65%)',
          'radial-gradient(40% 40% at 60% 18%, rgba(111,122,105,0.5), transparent 70%)',
        ].join(','),
      }}
    >
      {rhumb && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ filter: 'url(#hand-wobble)' }}
        >
          {rays.map((r, i) => (
            <line
              key={i}
              x1={ox}
              y1={oy}
              x2={r.x2}
              y2={r.y2}
              stroke="var(--trips-rhumb)"
              strokeWidth="0.3"
              opacity="0.45"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      )}
      {children}
    </div>
  );
}
