/**
 * Paper grain overlay — 6% warm-dark noise tiled across the parent.
 *
 * Consumes `/textures/paper-grain.svg` (Asset A1, placeholder) as a
 * 200×200 CSS-tiled background per §7.6 + DECISION_LOG Spike 2 —
 * tiling a cached bitmap is cheaper than filtering a full-page
 * surface on mid-tier devices.
 *
 * Swap contract: when the PNG placeholder or Chien's photographed
 * grain lands, change the `url()` below only — consumers stay put.
 */
type PaperGrainProps = {
  className?: string;
};

export function PaperGrain({ className }: PaperGrainProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none absolute inset-0 ${className ?? ''}`}
      style={{
        backgroundImage: 'url("/textures/paper-grain.svg")',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
      }}
    />
  );
}
