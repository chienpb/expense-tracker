# monthly-wrapped — Plan

## Files to change
| Action | File | What |
|--------|------|------|
| Create | `supabase/migrations/006_wrapped_text.sql` | `ALTER TABLE sealed_months ADD COLUMN wrapped_text TEXT;` |
| Modify | `docs/database.md` | Document `wrapped_text` column + the new migration in the list |
| Create | `lib/dashboard/wrapped.ts` | `computeMonthBundle(month)`, the verdict task block + `generateVerdict(bundle, label)`, `getWrappedText(userId, month)` |
| Modify | `app/api/seal/route.ts` | After upsert path: compute bundle → generate verdict (catch → null) → store `wrapped_text`; return `{ month, sealed_at, wrapped_text, bundle }` |
| Create | `app/_components/paper/MonthSlip.tsx` | Presentational slip (shared flat render): `<PaperClip>` + Caveat verdict + aggregates. `reveal?` toggles ink-wipe on the verdict |
| Create | `app/dashboard/_components/_wrapped-reveal.tsx` | Client seam component: fracturing "Settled" wax over the lifting slip, timed beat, then `onDone()`. Wraps `<MonthSlip reveal>` |
| Modify | `app/dashboard/_components/_settle-books.tsx` | Add a `'wrapped'` phase between thump and flip: render `<WrappedReveal>` from `/api/seal`'s response, then `goToYear()` |
| Modify | `app/dashboard/year/_month-cell.tsx` | Sealed cell → `<Link href="?slip=<month>">` + a tucked-slip / paper-clip affordance |
| Modify | `app/dashboard/year/page.tsx` | Read `?slip`; if a sealed month, compute bundle + `getWrappedText` → render `<MonthSlip>` in a dismissible overlay (deep-link) |
| Modify | `app/globals.css` | `@keyframes paper-seal-fracture` + `paper-ink-reveal`; both disabled under `prefers-reduced-motion` and `[data-reduce-motion='1']` |

## Approach & trade-offs

**One column, recompute the rest.** Per spec, storage is exactly `wrapped_text` on
`sealed_months` — no bundle JSON, no `wrapped` table, no `/api/wrapped` route. The
verdict (the expensive, once-only AI prose) is stored; the deterministic bundle is
*recomputed* on every read (re-seal and `?slip`). Recompute is a single month-scoped
aggregation over a small row set — zero tokens, so "zero new AI calls on re-read" holds
(AC#4). For a stable `sealed` month entries don't change; if a later entry lands, the
month reads `reopened` (existing stale logic) and re-settling regenerates.

**`expenses` has no `user_id`.** Per `sealing.ts`, these are single-keeper books — the
month-entry query scopes by calendar month only; the `sealed_months` read/write scopes
by `user_id` (unchanged). Spec's "scoped by user_id" applies to the seal row, not the
entry aggregation.

**Generation folds into the existing `/api/seal` upsert** (no new route). Bundle facts
go in as *given numbers*; the AI's only job is one–two clerical sentences closing `— LK`,
forbidden from emitting any figure. No SQL tool loop — pass the bundle, call
`generateText` once (ponytail; tool loop is the spec's escape hatch, not the default).
On failure we store `NULL` and the slip still stands on aggregates alone (AC#7).

**Reveal = CSS, not streaming.** The stored string is revealed with a left→right ink-wipe
(`paper-ink-reveal`, new keyframe) and the wax fractures via clip-path + the existing
`stamp-wear` filter. One render path (`<MonthSlip>`) serves first-seal (`reveal`),
re-read (flat), and reduced-motion (flat) — reduced-motion disables both keyframes via
the same overrides `paper-rule-off` already uses.

**Live entrance lives in the seam already marked** in `_settle-books.tsx` (the comment
between thump and flip). The flip/exit and mobile plain-nav paths in `goToYear()` are
untouched — Wrapped only adds a phase before they run.

Skipped (per spec Out): streaming, multi-card deck, share/export, multi-fold unfold,
audio, any Shortcuts/`/api/expenses` change. Add only if explicitly requested.

## TODO
- [x] `006_wrapped_text.sql`: `ALTER TABLE sealed_months ADD COLUMN wrapped_text TEXT;`
      (nullable). File written. **Apply pending** — `pnpm db:migrate` is blocked
      by the sandbox; run `pnpm db:migrate -- supabase/migrations/006_wrapped_text.sql`.
      → **AC: column exists (once applied)**
- [x] `docs/database.md`: add `wrapped_text` row to the `sealed_months` table + a `006`
      line in Migrations.
- [x] `lib/dashboard/wrapped.ts`:
  - [x] `WrappedBundle` type: `totalSpent`, `totalIncome`, `net`, `byCategory[]`,
        `largest {description, category, amount} | null`.
  - [x] `computeMonthBundle(month)`: one month-scoped query (`date >= month AND
        date < month + 1 month`), aggregate in JS (reuse the `/api/report` reduce
        pattern: `type !== 'income'` = spent, `=== 'income'` = returned). Integers only.
  - [x] Verdict task block via `ledgerKeeperInstructions(...)`: facts in (pre-formatted
        VND), **max two sentences**, close `— LK`. Guardrails: forbid superlatives
        (biggest/most/record), praise/judgment, "this month you…" recap, rhetorical
        questions, closing uplift; forbid stating any figure not in the facts.
  - [x] `generateVerdict(bundle, label)`: `generateText({ model: openai('gpt-5.4'), ... })`,
        returns trimmed prose; throws on failure (caller catches).
  - [x] `getWrappedText(userId, month)`: select `wrapped_text` for that sealed row.
- [x] `app/api/seal/route.ts`: after the upsert, `computeMonthBundle` →
      `try generateVerdict catch → null` → `update … set wrapped_text` (or fold into the
      upsert payload). Return `{ month, sealed_at, wrapped_text, bundle }`.
- [x] `MonthSlip.tsx`: tilted `paper-2` loose-leaf (`data-ledger-tilt`) + `<PaperClip>`;
      verdict in `font-hand-signature` (Caveat, ≥24px per §2.3), foregrounded;
      aggregates below using `formatVND`/`formatSignedVND` (returns in parens), largest
      entry named. No drop shadow, no emoji. `reveal?` adds `paper-ink-reveal` to the
      verdict. If `verdict` is null, render aggregates + a `— LK` line only.
- [x] `globals.css`: `@keyframes paper-seal-fracture` (clip-path crack, two halves part)
      + `.paper-ink-reveal` (clip-path inset wipe L→R, ~700ms, `var(--ease-ink)`); both
      `animation: none` under `@media (prefers-reduced-motion: reduce)` and
      `html[data-reduce-motion='1']`.
- [x] `_wrapped-reveal.tsx` (client): render the `Settled` `<Stamp wear=0>` with the
      fracture class over the lifting `<MonthSlip reveal>`; one crack, one lift, one
      verdict; after ~1–1.2s call `onDone()`. Honor `motionReduced()` → render flat slip,
      no fracture/reveal, short beat.
- [x] `_settle-books.tsx`: `postSeal()` returns the JSON; add phase `'wrapped'` after
      `'sealing'` that mounts `<WrappedReveal bundle verdict label onDone={goToYear}>`.
      Reduce-motion branch: keep current behavior (POST, plain push) — the year
      `?slip` path is where reduced-motion users read their Wrapped.
- [x] `_month-cell.tsx`: sealed branch → `<Link href={\`?slip=${month}\`}>` preserving
      `year`; add tucked-slip/paper-clip affordance beside the seal. Open/reopened
      branches unchanged.
- [x] `year/page.tsx`: parse `?slip` (validate `YYYY-MM-01` + status `sealed`); compute
      bundle + `getWrappedText`; render `<MonthSlip>` (flat) in a fixed overlay with a
      close `<Link>` back to `/dashboard/year?year=…`. Deep-link friendly.
- [x] Append DECISION_LOG 2026-06-23 confirmations: (a) re-seal **overwrites**
      `wrapped_text`; (b) only the verdict is stored — the bundle is recomputed
      deterministically on every read (one column, no bundle JSON).

### verify (per acceptance criterion)
- [ ] **Column**: `006` migration applied; `\d sealed_months` shows `wrapped_text`.
- [ ] **Bundle**: seal a month with known entries; logged bundle matches hand-sum
      (spent/returned/net/per-category/largest).
- [ ] **Verdict**: ≤2 sentences, ends `— LK`, no AI-invented number (every rendered
      figure traces to the bundle). Eyeball one generation.
- [ ] **Store-once**: re-open the same sealed month via `?slip` → identical text, no new
      AI call (check no request fires / no latency).
- [ ] **Live seal (desktop, motion on)**: playwright at 1440×900 — thump → fracture →
      slip lift → ink reveal → aggregates → page-turn to `/dashboard/year`. Flow intact.
- [ ] **Standalone**: `?slip=<sealed month>` renders the slip on the year surface.
- [ ] **Reduce-motion / reduce-skew**: toggle `data-reduce-motion`/`data-reduce-skew`
      and the media query → finished slip, no fracture/reveal/tilt.
- [ ] **Generation fail**: force `generateVerdict` to throw → slip shows aggregates +
      `— LK`, flip still proceeds, no spinner.
- [ ] **Amounts**: dotted grouping `1.180.000 ₫`, returns in parens — verified on the slip.
- [ ] **Quick-Ref + mobile**: screenshot 1440×900 and 375×812 — paper insert (not
      card/toast), no shadow, no emoji, Caveat verdict, wax fracture via `stamp-wear`;
      mobile enters vertically and dismisses via plain nav.
