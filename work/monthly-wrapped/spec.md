# monthly-wrapped: Monthly Wrapped

## What
When the user seals a month (Closing the Books), the wax "Settled" seal **fractures**
and a loose-leaf **slip** lifts out of the seam carrying the Ledger-keeper's month
statement: one foregrounded, generated, handwritten **verdict line** (the screenshot),
with quiet computed aggregates below it. It plays once — in the existing seam, between
the seal-thump and the page-turn to the year calendar — and is then stored, so
re-reading a past month opens the finished slip instantly with no animation and no
second AI call.

Spotify Wrapped reimagined as a 1962 bookkeeper's single penned insert: one sharp
observation a stats dump can't give you, not a swipeable deck of vanity metrics.

## Why
The keystone payoff of "Closing the Books" — the seam was deliberately left open for it
(`_settle-books.tsx`). Sealing a month currently just persists a flag and flips to the
calendar; Wrapped makes the ceremony *mean something*. It's the portfolio "send this
link" moment (chienpham.com doubles as a showcase): a wax seal that cracks to reveal a
ghost-bookkeeper's verdict on your actual ledger is native to the Paper Ledger metaphor
and impossible for a neon slideshow to imitate. It's also the second real consumer of
the AI persona + page-flip rig, reusing both rather than building new infrastructure.

## Scope
- **In:**
  - **Deterministic stat bundle**, computed in SQL/JS for the sealed month — zero
    tokens, zero hallucination: total spent, total returned (income), net, per-category
    breakdown, and the single largest entry (named). Reuses the aggregation pattern
    already in `/api/report` `mode:'full'` (`totalSpent`, `totalIncome`, `formatAmount`).
  - **AI verdict line:** the stat bundle is passed to the Ledger-keeper persona as
    *given facts*; the AI's ONLY job is one (max two) sentence clerical observation —
    the "shape of the month" — closing `— LK`. The AI never emits a number it computed
    itself and never decides what the numbers are.
  - **Generate-once-and-store:** generation fires at seal time inside `POST /api/seal`;
    the verdict text is persisted on `sealed_months` (new `wrapped_text` column).
    Re-reads and the portfolio-link visitor read the stored string — never regenerated.
  - **The slip component** — a single tilted loose-leaf on `paper-2` with a paper-clip,
    rendering: the verdict line (Caveat handwriting, foregrounded) + aggregates below
    (spent / returned-in-parens / net + largest entry named, VND dotted grouping).
    Renders **standalone** so it works on the year surface, not only in the seam.
  - **Live-seal entrance (the wow beat):** after the seal-thump, the gold "Settled" wax
    **fractures** (clip-path fracture + existing `stamp-wear` filter), the slip edge
    lifts from under it, the verdict line **reveals as ink** (reveal animation of the
    just-generated stored string — NOT live token streaming; see Constraints), then the
    aggregates fade in below. A brief beat (~1–1.2s), then the existing page-turn to
    `/dashboard/year` continues.
  - **Re-read:** the year-calendar sealed-month cell gets a tucked-slip / paper-clip
    affordance; opening it shows that month's slip **already written**, flat, no replay,
    no AI call. Deep-link friendly (a sealed month maps to its stored slip).
  - **Reduce-motion / reduce-skew fallback:** no fracture, no ink reveal, no tilt — the
    finished slip (verdict + aggregates) is simply present. This is the same render as
    the re-read path. Mandatory.
  - **Graceful degradation:** if generation fails or stalls, the slip still stands as a
    complete statement from the deterministic aggregates alone, signed `— LK`, and the
    flip proceeds. The aggregates are never gated on the AI.
- **Out (v2 / never — do not build now):**
  - **Live token-streaming** (`streamText` + client reader). Reveal-of-stored-text is
    the chosen mechanism; real streaming is an incompatible second render path. (Decision
    log 2026-06-23.)
  - **Multi-card / flip-through slideshow.** One slip. Any swipeable deck reintroduces
    the slideshow engine this feature explicitly refuses.
  - **Wrapped clichés:** streaks, "top category" as a trophy/ranking, percentiles or
    leaderboard ("more than X% of months"), entry-count vanity metrics, superlatives.
  - **A dedicated `/api/wrapped` route or a separate `wrapped` table.** Generation folds
    into `/api/seal`; storage is one column on `sealed_months`.
  - **A share/export pipeline.** The slip + its deep-link URL *is* the shareable
    artifact; no PNG export, no social card.
  - **Multi-section unfolding insert** (fold creases, ink-bloom-along-fold). The v1 hero
    is the seal fracture + one verdict line; the elaborate unfold is v2 if ever.
  - **Pen-scratch / ambient audio.** Off / not built.
  - Touching the Shortcuts or `/api/expenses` write paths.

## Acceptance Criteria
- [ ] `sealed_months` gains a nullable `wrapped_text TEXT` column via a migration in
      `supabase/migrations/`, documented in `docs/database.md`.
- [ ] Sealing a month computes the deterministic stat bundle (spent, returned, net,
      per-category, largest entry) from that month's entries, scoped by `user_id`.
- [ ] The AI verdict is generated from those facts via the Ledger-keeper persona, is at
      most two sentences, closes `— LK`, and contains **no** number the AI itself
      invented (all figures rendered come from the deterministic bundle, not the AI).
- [ ] The verdict is stored on the sealed row at seal time; re-reading the month makes
      **zero** new AI calls and shows the identical stored text.
- [ ] On a live seal (motion on, desktop), after the seal-thump the wax fractures, the
      slip lifts, the verdict reveals as ink, aggregates fade in, then the existing
      page-turn to `/dashboard/year` runs. The seal→calendar flow is not broken.
- [ ] The slip renders **standalone** on the year surface (sealed-month cell), so
      reduce-motion users — who skip the ceremony — still see their Wrapped.
- [ ] Reduce-motion / reduce-skew shows the finished slip whole: no fracture, no reveal,
      no tilt. Verified by toggling the setting and the system media query.
- [ ] If generation fails/stalls, the slip still presents the deterministic aggregates
      as a complete statement signed `— LK`, and the flip proceeds — no spinner, no
      blocked ceremony.
- [ ] Amounts: integer VND, dotted grouping `1.180.000 ₫`, returns in parentheses.
- [ ] Visuals pass the Quick-Reference Card: slip is a paper insert (not a card/toast),
      no drop shadows, no emoji, verdict in handwriting (Caveat), wax fracture reuses
      `stamp-wear`. Verified at 1440×900 and 375×812. On mobile (no page-turn rig) the
      slip enters vertically and dismisses to `/dashboard/year` via plain navigation.

## Constraints / Notes
- **Amounts are integers (VND).** Every figure on the slip follows dotted grouping;
  returns/income in parens.
- **Auth in middleware.** `/api/seal` re-checks nothing; per authenticated user.
- **Supabase service-role, no RLS** — scope the month's entry query and the
  `sealed_months` write by `user_id` in app code.
- **Paper Ledger system mandatory** (`docs/DESIGN_SYSTEM.md`). Reuse: the `<Stamp>`
  family + `stamp-wear` filter (the fracturing wax), `hand-wobble`/`pathLength` stroke
  draw (same trick as the rule-off) for the ink reveal, Caveat for the verdict, the
  page-flip rig (`lib/page-flip`) for the unchanged exit to `/dashboard/year`, and the
  Ledger-keeper persona (`lib/ledger-keeper-prompt.ts`).
- **Reveal ≠ streaming (decided).** The verdict is generated whole at seal time, stored,
  then *revealed* with a CSS/JS ink animation. This is visually identical to streaming
  but is one render path shared by first-seal and re-read, is deterministic, and is
  compatible with generate-once-store. Live `streamText` is explicitly rejected.
- **AI cost: one call per seal, ever.** No per-view tokens. The deterministic numbers
  are passed in as facts, so the call is a short prose generation, not a SQL tool-loop
  (keep the SELECT tool available only if a richer pattern observation proves necessary;
  default to passing the bundle and skipping the tool loop — ponytail).
- **Voice guardrails:** the verdict task block must explicitly forbid superlatives
  (biggest/most/record), praise/judgment of the user, "this month you…" recap cadence,
  rhetorical questions, and closing uplift. State a finding, not a verdict-of-character.
  Hard cap the length. gpt-5.4 drifts into milestone/cheerleading exactly here.
- **The fracture is the risk.** A slightly-off crack reads as a CSS bug, not craft.
  Discipline: one fracture, one slip-lift, one verdict line — then stop. Resist
  scope-gravity toward physics/particles/multi-fold (that road is the slideshow engine).
- **Stale months:** a sealed month can go stale/reopened if a later entry lands in it
  (existing Closing-the-Books behavior). Out of scope here whether re-settling
  regenerates `wrapped_text`; default lazy assumption is re-seal overwrites it. Confirm
  in `/plan`.
- Decision recorded: `docs/DECISION_LOG.md` 2026-06-23 (reveal-not-streaming;
  generate-once-store on `sealed_months`; numbers-computed/prose-only split; wow-vs-
  restraint resolved to one verdict line + aggregates with the wax-fracture entrance).
