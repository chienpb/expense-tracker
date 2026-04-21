import Link from 'next/link';

const SPIKES = [
  {
    slug: 'fonts',
    title: 'S1 · Fonts + Vietnamese diacritics',
    goal: 'Verify the five Paper-Ledger Google Fonts load and Patrick Hand / Caveat render every Vietnamese stacked-tone glyph cleanly. If Patrick Hand ships broken tones, log the fallback candidate.',
  },
  {
    slug: 'filter-perf',
    title: 'S2 · SVG filter performance',
    goal: 'Apply #paper-grain to a full-viewport surface and scroll. If FPS tanks on mid-tier devices, fall back to a pre-rendered tile + CSS repeat.',
  },
  {
    slug: 'rotation',
    title: 'S3 · Deterministic rotation seeding',
    goal: 'Confirm tiltFor(id) returns a stable value so SSR and CSR agree — a mismatched rotation on hydration would feel broken.',
  },
  {
    slug: 'numerals',
    title: 'S4 · Numerals alignment',
    goal: 'Render VND amounts (1.180.000 ₫) with oldstyle-nums tabular-nums. Columns must line up; oldstyle numerals must actually render in Crimson Pro.',
  },
  {
    slug: 'theme',
    title: 'S5 · Day ↔ Midnight theme',
    goal: 'Toggle data-theme="day|night" on <html> and confirm every token swaps via CSS variables only, compatible with next-themes.',
  },
  {
    slug: 'motion',
    title: 'S6 · Reduce-motion / reduce-skew',
    goal: 'System prefers-reduced-motion AND a user-override data-reduce-skew both collapse rotation to 0° and disable filter-based animations.',
  },
];

export default function SpikeIndex() {
  return (
    <div className="mx-auto max-w-3xl font-serif">
      <h1 className="text-3xl font-bold">Phase 0 spikes</h1>
      <p className="mt-3 text-[#8a7a5e]">
        Six de-risking prototypes. Each one ends with a written verdict in{' '}
        <code className="font-mono text-[13px]">docs/DECISION_LOG.md</code>.
      </p>
      <ol className="mt-8 space-y-6">
        {SPIKES.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/spikes/${s.slug}`}
              className="text-lg font-semibold text-[#1f3a5f] hover:underline"
            >
              {s.title}
            </Link>
            <p className="mt-1 text-sm leading-relaxed">{s.goal}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
