import { Glyph, GLYPH_NAMES } from '@/app/_components/paper/Glyph';
import { MarginRule } from '@/app/_components/paper/MarginRule';
import { PaperGrain } from '@/app/_components/paper/PaperGrain';
import { RuledLines } from '@/app/_components/paper/RuledLines';

export default function DesignSystemIndex() {
  return (
    <div className="mx-auto max-w-5xl font-serif text-ink">
      <h1 className="text-title-1 font-bold">Phase 2 — Foundation primitives</h1>
      <p className="mt-2 text-body leading-relaxed text-ink-mute">
        Every primitive below is rendered on both Day and Midnight themes so we
        catch regressions before any page consumes them. Components land here
        the moment they ship; states (hover / focus / disabled / empty /
        error) arrive with Phases 3–4.
      </p>

      <div id="foundation" aria-hidden="true" />

      <SectionTitle>SVG filters (§7)</SectionTitle>
      <p className="text-body-l leading-relaxed">
        The five reusable <code className="font-typewriter text-[13px]">url(#id)</code>{' '}
        effects mounted once by <code className="font-typewriter text-[13px]">PaperFilters</code>{' '}
        in the root layout. <code className="font-typewriter text-[13px]">#paper-grain</code>{' '}
        is here for small decorative surfaces; page backgrounds use the tiled{' '}
        <code className="font-typewriter text-[13px]">{'<PaperGrain>'}</code> primitive
        per §7.6.
      </p>
      <ThemeFork id="filters">
        <FilterSamples />
      </ThemeFork>

      <SectionTitle>Glyphs (§5 · Asset A8)</SectionTitle>
      <p className="text-body-l leading-relaxed">
        Twelve Unicode fallbacks wrapped in <code className="font-typewriter text-[13px]">{'<symbol>'}</code>{' '}
        elements inside <code className="font-typewriter text-[13px]">public/glyphs.svg</code>.
        When Chien&apos;s hand-drawn set lands, the paths swap but the ids —
        and therefore every consumer — stay put.
      </p>
      <ThemeFork id="glyphs">
        <GlyphGrid />
      </ThemeFork>

      <SectionTitle>Decoration primitives</SectionTitle>
      <p className="text-body-l leading-relaxed">
        Ruled lines, margin rule, and paper grain stacked in a{' '}
        <code className="font-typewriter text-[13px]">position: relative</code>{' '}
        surface. Every overlay is <code className="font-typewriter text-[13px]">pointer-events: none</code>
        {' '}and <code className="font-typewriter text-[13px]">aria-hidden</code>.
      </p>
      <ThemeFork id="decoration">
        <PaperSurfaceSample />
      </ThemeFork>
    </div>
  );
}

/* ---------------------------------------------------------------------
 * Primitives used only by this page.
 * ------------------------------------------------------------------- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 mb-3 font-typewriter text-[11px] uppercase tracking-[0.2em] text-ink-mute">
      {children}
    </h2>
  );
}

function ThemeFork({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="mt-4 grid gap-4 md:grid-cols-2">
      <ThemePanel theme="day" label="Day — Daybook">
        {children}
      </ThemePanel>
      <ThemePanel theme="night" label="Night — Midnight Ledger">
        {children}
      </ThemePanel>
    </div>
  );
}

function ThemePanel({
  theme,
  label,
  children,
}: {
  theme: 'day' | 'night';
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div data-theme={theme} className="bg-paper text-ink">
      <div className="border-b border-ink/20 px-4 py-2 font-typewriter text-[10px] uppercase tracking-[0.2em] text-ink-mute">
        {label}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FilterSamples() {
  return (
    <div className="space-y-6">
      <FilterSample label="#paper-grain (filter path)">
        <div
          className="h-20 w-full"
          style={{ background: 'var(--color-paper)', filter: 'url(#paper-grain)' }}
        />
      </FilterSample>

      <FilterSample label="#stamp-wear">
        <div
          className="inline-block border-2 border-stamp-red px-3 py-1 text-stamp-red font-stamp text-[14px] uppercase tracking-[0.15em]"
          style={{ filter: 'url(#stamp-wear)', transform: 'rotate(-4deg)' }}
        >
          Recorded
        </div>
      </FilterSample>

      <FilterSample label="#hand-wobble">
        <svg width="260" height="40" style={{ filter: 'url(#hand-wobble)' }}>
          <path
            d="M 10 20 L 250 20"
            stroke="var(--color-pen-navy)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </FilterSample>

      <FilterSample label="#ink-bleed">
        <span
          className="font-hand text-hand-l text-pen-navy"
          style={{ filter: 'url(#ink-bleed)' }}
        >
          Phở bò — 45.000₫
        </span>
      </FilterSample>

      <FilterSample label="#pencil-stroke">
        <span
          className="font-hand text-hand text-pencil-gray"
          style={{ filter: 'url(#pencil-stroke)' }}
        >
          (ledger-keeper suggestion)
        </span>
      </FilterSample>
    </div>
  );
}

function FilterSample({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 font-typewriter text-[10px] uppercase tracking-[0.15em] text-ink-mute">
        {label}
      </div>
      {children}
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
          <span className="font-typewriter text-[11px] uppercase tracking-[0.15em] text-ink-mute">
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
        style={{ paddingLeft: 'calc(var(--margin-rule-offset-mobile) + 12px)' }}
      >
        <div className="font-typewriter text-[10px] uppercase tracking-[0.2em] text-ink-mute">
          Form CHN-01 · Page 1/1
        </div>
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
