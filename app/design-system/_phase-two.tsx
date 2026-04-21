import { Glyph, GLYPH_NAMES } from '@/app/_components/paper/Glyph';
import { MarginRule } from '@/app/_components/paper/MarginRule';
import { PaperGrain } from '@/app/_components/paper/PaperGrain';
import { RuledLines } from '@/app/_components/paper/RuledLines';
import {
  PhaseTitle,
  Sample,
  SampleLabel,
  SectionTitle,
  ThemeFork,
} from './_parts';

export function PhaseTwo() {
  return (
    <>
      <PhaseTitle
        phase="Phase 2 · Complete"
        title="Foundation primitives"
        description={
          <>
            SVG filters, glyph sprite, and the three decoration overlays that
            every future component stacks on top of. Rendered on both Day and
            Midnight — regressions caught at the lowest layer before they
            propagate.
          </>
        }
      />

      <SectionTitle id="filters" number="§7">
        SVG filters
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        The five reusable{' '}
        <code className="font-typewriter text-[13px]">url(#id)</code> effects
        mounted once by{' '}
        <code className="font-typewriter text-[13px]">PaperFilters</code> in
        the root layout.{' '}
        <code className="font-typewriter text-[13px]">#paper-grain</code> is
        here for small decorative surfaces; page backgrounds use the tiled{' '}
        <code className="font-typewriter text-[13px]">{'<PaperGrain>'}</code>{' '}
        primitive per §7.6.
      </p>
      <ThemeFork>
        <FilterSamples />
      </ThemeFork>

      <SectionTitle id="glyphs" number="§5 · A8">
        Glyph sprite
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Twelve Unicode fallbacks wrapped in{' '}
        <code className="font-typewriter text-[13px]">{'<symbol>'}</code>{' '}
        elements inside{' '}
        <code className="font-typewriter text-[13px]">public/glyphs.svg</code>.
        When Chien&apos;s hand-drawn set lands, the paths swap but the ids —
        and therefore every consumer — stay put.
      </p>
      <ThemeFork>
        <GlyphGrid />
      </ThemeFork>

      <SectionTitle id="decoration" number="§3.1">
        Decoration overlay stack
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Ruled lines, margin rule, and paper grain stacked in a{' '}
        <code className="font-typewriter text-[13px]">position: relative</code>{' '}
        surface. Every overlay is{' '}
        <code className="font-typewriter text-[13px]">pointer-events: none</code>{' '}
        and{' '}
        <code className="font-typewriter text-[13px]">aria-hidden</code>.
      </p>
      <ThemeFork>
        <PaperSurfaceSample />
      </ThemeFork>
    </>
  );
}

function FilterSamples() {
  return (
    <div className="space-y-6">
      <Sample label="#paper-grain (filter path)">
        <div
          className="h-20 w-full"
          style={{
            background: 'var(--color-paper)',
            filter: 'url(#paper-grain)',
          }}
        />
      </Sample>

      <Sample label="#stamp-wear">
        <div
          className="inline-block border-2 border-stamp-red px-3 py-1 text-stamp-red font-stamp text-[14px] uppercase tracking-[var(--letter-spacing-label-s)]"
          style={{ filter: 'url(#stamp-wear)', transform: 'rotate(-4deg)' }}
        >
          Recorded
        </div>
      </Sample>

      <Sample label="#hand-wobble">
        <svg width="260" height="40" style={{ filter: 'url(#hand-wobble)' }}>
          <path
            d="M 10 20 L 250 20"
            stroke="var(--color-pen-navy)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </Sample>

      <Sample label="#ink-bleed">
        <span
          className="font-hand text-hand-l text-pen-navy"
          style={{ filter: 'url(#ink-bleed)' }}
        >
          Phở bò — 45.000₫
        </span>
      </Sample>

      <Sample label="#pencil-stroke">
        <span
          className="font-hand text-hand text-pencil-gray"
          style={{ filter: 'url(#pencil-stroke)' }}
        >
          (ledger-keeper suggestion)
        </span>
      </Sample>
    </div>
  );
}

function GlyphGrid() {
  return (
    <ul className="grid grid-cols-3 gap-3 text-ink">
      {GLYPH_NAMES.map((name) => (
        <li
          key={name}
          className="flex items-center gap-3 border border-ink/15 p-3"
        >
          <Glyph name={name} size={24} />
          <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            {name}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PaperSurfaceSample() {
  return (
    <div className="relative h-80 w-full overflow-hidden bg-paper">
      <PaperGrain />
      <RuledLines />
      <MarginRule />
      <div
        className="relative pr-4 pt-3"
        style={{
          paddingLeft: 'calc(var(--margin-rule-offset-mobile) + 12px)',
        }}
      >
        <SampleLabel>Form CHN-01 · Page 1/1</SampleLabel>
        <div className="mt-3 font-serif text-body text-ink">
          Printed line — system-authored value, Crimson Pro.
        </div>
        <div className="mt-4 font-hand text-hand text-pen-navy">
          Handwritten entry — Patrick Hand, pen-navy.
        </div>
        <div className="mt-4 font-serif italic text-caption text-ink-mute">
          (caption in serif italic — see §2.5)
        </div>
      </div>
    </div>
  );
}
