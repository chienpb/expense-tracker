/**
 * Paper Ledger — SVG filter library.
 *
 * Mounted once from the root layout. Exposes five reusable `url(#id)`
 * filters covering every drawing effect the system needs. Per §7 of
 * `docs/DESIGN_SYSTEM.md`:
 *
 *   #paper-grain    — fractal noise for paper surfaces (§7.1)
 *   #stamp-wear     — broken-ink rubber stamp impression (§7.2)
 *   #hand-wobble    — chart strokes and hand-traced borders (§7.3)
 *   #ink-bleed      — slight blur on large handwriting (§7.4)
 *   #pencil-stroke  — AI suggestions / draft state (§7.5)
 *
 * Performance note (§7.6 + DECISION_LOG Spike 2): applying a filter
 * to a full-page surface is measurably slower than tiling a small
 * pre-filtered image. The `<PaperGrain>` primitive consumes the tiled
 * fallback at `public/textures/paper-grain.svg`; `#paper-grain` is
 * kept here for small decorative elements (badges, accent blocks) and
 * for devs who want to compose it with other filters.
 */
export default function PaperFilters() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* §7.1 — Paper grain. Map greyscale noise onto warm ink tone.
            The alpha channel (0.06) is the final 6% tint over paper. */}
        <filter
          id="paper-grain"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            seed="7"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.17
                    0 0 0 0 0.14
                    0 0 0 0 0.09
                    0 0 0 0.06 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>

        {/* §7.2 — Stamp wear. Coarse turbulence drives a displacement
            map; compositing `in` keeps only the source, so we get a
            broken-ink silhouette of whatever the stamp content is. */}
        <filter id="stamp-wear" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.4"
            numOctaves="2"
            seed="4"
            result="wear"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wear"
            scale="2.5"
            xChannelSelector="R"
            yChannelSelector="G"
            result="worn"
          />
          <feComposite in="worn" in2="wear" operator="in" />
        </filter>

        {/* §7.3 — Hand wobble. Slow turbulence, small displacement.
            Use on stroked SVG paths (charts, hand-traced borders). */}
        <filter id="hand-wobble" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="2"
            seed="2"
            result="wobbleNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wobbleNoise"
            scale="1.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* §7.4 — Ink bleed. Very small Gaussian blur plus a modest
            matrix bump to spread pigment. Use sparingly on large hand
            text; kills legibility below ~20px. */}
        <filter id="ink-bleed" x="-2%" y="-2%" width="104%" height="104%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1.15 0"
          />
        </filter>

        {/* §7.5 — Pencil stroke. Lighter turbulence than the stamp,
            lower alpha composite so the stroke reads as graphite over
            paper. Applied to AI-suggestion / draft text. */}
        <filter id="pencil-stroke" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.2"
            numOctaves="2"
            seed="5"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0.35 0"
            result="grainAlpha"
          />
          <feComposite
            in="SourceGraphic"
            in2="grainAlpha"
            operator="out"
            result="streaked"
          />
          <feGaussianBlur in="streaked" stdDeviation="0.15" />
        </filter>
      </defs>
    </svg>
  );
}
