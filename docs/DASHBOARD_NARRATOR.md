# Dashboard Narrator — handwritten commentary layer (unbuilt)

> **Status: placeholder. Not implemented.** Pick this up when the
> handwritten-aside count crosses ~5, or when copy drift becomes visible
> between the inline helpers.

The Paper Ledger dashboard's hand-kept feel is carried by its handwritten
asides — hero margin note, week-over-week delta, peak-day chart callout,
the `top cat.` summary suffix. Each is a small decision tree: when to
speak, when to stay quiet, which magnitude word, what to do with missing
data. Today those trees live inline in `app/dashboard/page.tsx`
(`renderDelta`, `extractCounterpart`, and scattered JSX).

## What it would be

A pure, deterministic, rule-based module — no LLM (commentary paints on
first render, must stay in the RSC payload, cannot cost tokens per load),
no localization (English-first, `DESIGN_SYSTEM.md` §12 voice), no charting.
It takes the dashboard's derived range stats and returns a list of
narration items, each tagged with where it wants to render (hero, chart,
tally, summary), how (margin note / footnote / stamp caption), and a
volume knob so the render layer can trim when too many fire. Same input →
same string, always.

Lands at `lib/dashboard/narrator/` with rules split per file
(`delta.ts`, `peak.ts`, `counterpart.ts`, …) behind a single
`narrate(stats)` entry point. Full schema and rule catalogue are the first
job of whoever picks this up.

## First migrations (inline today)

- Hero week-over-week delta (`renderDelta`).
- Hero counterpart margin note (`extractCounterpart`).
- Chart peak-day callout.
- Summary top-category share.

Plus extensions the mockup implies but that aren't wired: dashed-ellipse
peak callout, largest-category tally note, register `— balanced ✓` and its
failure inverse, "quiet day" / empty-range encouragement.
