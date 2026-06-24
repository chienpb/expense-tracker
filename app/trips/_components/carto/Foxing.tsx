import { tiltFor } from '@/lib/seed-rotation';

/**
 * `<Foxing>` — asymmetric age for a parchment surface (Trips DS §1).
 *
 * This is the SANCTIONED replacement for the banned symmetric edge-burn /
 * vignette. A few irregular brown stains at *asymmetric* seeded positions
 * + one off-center fold crease. "Time leaves marks": older trips fox more
 * (raise `intensity`). Decorative → aria-hidden, pointer-events: none.
 *
 * Layer it as an absolutely-positioned overlay inside a `relative` parent.
 */
export function Foxing({
  seed,
  intensity = 0.5,
}: {
  /** Stable id → the same surface always foxes the same way. */
  seed: string;
  /** 0–1, scales stain count + opacity (age). */
  intensity?: number;
}) {
  // Seeded, asymmetric stain placements (never a centered glow). Small
  // brown age-spots, not big pale blobs — keep radii tight so they read as
  // foxing. Positions in %; sizes in px so they don't stretch with the box.
  const t = tiltFor(seed, 100); // -100..100, reused as a cheap PRNG
  const stains = [
    { left: 14 + (t % 9), top: 22, r: 14 },
    { left: 78, top: 12 + ((t * 3) % 11), r: 10 },
    { left: 86, top: 70, r: 18 },
    { left: 28, top: 86, r: 12 },
    { left: 52, top: 48, r: 9 },
    { left: 66, top: 30, r: 11 },
  ].slice(0, 3 + Math.round(intensity * 3));
  // Fold crease: off-center vertical, faint valley + ink darkening.
  const foldLeft = 38 + (t % 12);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ mixBlendMode: 'multiply' }}
    >
      {stains.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.r * 2,
            height: s.r * 2,
            background: `radial-gradient(circle, var(--trips-fox) 0%, transparent 70%)`,
            opacity: 0.18 + intensity * 0.22,
            filter: 'url(#hand-wobble)',
          }}
        />
      ))}
      {/* fold crease — faint valley */}
      <span
        className="absolute top-0 h-full"
        style={{
          left: `${foldLeft}%`,
          width: 2,
          background: 'var(--trips-stipple)',
          opacity: 0.16,
        }}
      />
    </div>
  );
}
