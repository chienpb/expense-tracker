# Dashboard Narrator — handwritten commentary layer

> The Paper Ledger dashboard is built to *feel* hand-kept. That illusion is
> carried almost entirely by the handwritten asides: margin notes on the
> hero, the week-over-week delta line, the peak-day callout on the chart,
> the "top cat." suffix on the summary box. Each one is a tiny decision
> tree — when to speak, when to stay quiet, what magnitude word to pick,
> what to do with missing data.
>
> Today those decision trees live inline in `app/dashboard/page.tsx` and
> scattered helpers. This doc is the placeholder for the module that
> consolidates them — the **narrator**.

## What it is

A pure, deterministic, rule-based module that takes the dashboard's range
stats as input and returns a structured list of things the ledger *might*
say — each one tagged with where it wants to render and how loud it wants
to be. The dashboard then picks which to render based on available slots
and voice budget.

It is **not**:

- An LLM. Commentary has to paint on the first render, cannot cost tokens
  per page load, and has to be cacheable as part of the ordinary RSC
  payload. That ruled the LLM-authored variant out on day one.
- A localization layer. English-first, Paper Ledger voice (`DESIGN_SYSTEM.md`
  §12), clerical and understated.
- A charting annotation library. The narrator returns *what to say*; the
  chart owns *how to draw the ellipse*.

## Why a module, not more inline helpers

Once you have more than a handful of these asides:

- the thresholds and magnitude words drift between functions,
- the voice ages unevenly (one helper says `well over`, another says
  `way higher`),
- there's no single place to turn commentary off for a11y-reduced users or
  for a "quiet mode" setting,
- testing the copy is painful because it's entangled with the JSX.

A narrator module centralizes the voice, makes every saying individually
testable with fixed inputs, and gives the render layer one contract to
consume.

## Shape (sketch — to be decided by the implementer)

The rough idea is a function that takes the dashboard's derived stats
(current range total, prior range total, category breakdown, peak day,
top payback counterpart, etc.) and returns a list of narration items.
Each item carries where on the page it wants to land (hero, chart, tally,
summary), how it wants to render (margin note / handwritten footnote /
stamp caption), and a terseness/volume knob so the dashboard can trim if
too many fire at once.

The render layer asks the narrator for the notes pertinent to a given
slot and renders the top-priority one — or nothing, if the narrator
decided the data didn't warrant a remark.

Full schema, slot taxonomy, and rule catalogue are the first job of the
person picking this up.

## Starting inventory

Annotations that already exist inline today and are the natural first
migrations:

- Hero **week-over-week delta** (`renderDelta` in `app/dashboard/page.tsx`).
- Hero **counterpart margin note** (`extractCounterpart` + inline JSX).
- Chart **peak-day callout** (inline `peak: {date} · {category}`).
- Summary **top-category share** (inline `{name} {pct}%`).

Obvious extensions the mockup implies but aren't wired yet:

- Chart dashed-ellipse peak ellipse with a Caveat callout (`ouch — {cat}`).
- Largest-category margin note on the tally list.
- Register footer's `— balanced ✓` and its inverse when reconciliation
  would fail (it never does today, but the narrator should own the rule).
- "Quiet day" / "no entries" gentle encouragement on empty ranges.

## Non-goals

- Randomness or persona modes. One voice, deterministic output, same
  input → same string. Surprise is earned by the *shape* of the data,
  not by the narrator rolling dice.
- Vietnamese pass. Voice is English-first; Vietnamese localization is a
  Phase-10 concern and will come with its own voice doc, not a branch in
  the narrator.
- Real-time streaming. All inputs are known at render time.

## Where it lives when it lands

`lib/dashboard/narrator/` — module directory so rules can split across
files (`delta.ts`, `peak.ts`, `counterpart.ts`, …) without a 500-line
god-function. `index.ts` exports the single `narrate(stats)` entry point
the dashboard consumes.

---

*Status: placeholder. Not implemented. Inline helpers in
`app/dashboard/page.tsx` are the interim. Pick this up when annotation
count crosses ~5 or when copy drift becomes visible between helpers.*
