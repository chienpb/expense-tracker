# rubber-stamp-auditor — Plan

## Files to change
| Action | File | What |
|--------|------|------|
| Create | `supabase/migrations/007_audit.sql` | `ALTER TABLE expenses ADD COLUMN audit_verdict TEXT, ADD COLUMN audit_note TEXT;` (one statement, both nullable) |
| Modify | `docs/database.md` | Add `audit_verdict` + `audit_note` rows to the `expenses` table; add `007` to the Migrations list |
| Create | `lib/dashboard/detectors.mjs` | Pure JS detectors: `findDuplicates(entries, windowDays)`, `findAnomalies(entries, medians, k, minSamples)`, `flagCandidates(...)`. Inline assert-based `demo()` self-check guarded by `import.meta.url` |
| Create | `lib/dashboard/audit.ts` | `auditMonth(month)`: read month entries + unaudited set → category medians query → `flagCandidates` → ONE `generateObject` judge call (catch → no-op) → persist per-entry verdict+note |
| Modify | `lib/dashboard/queries.ts` | Add `audit_verdict: 'APPROVED' \| 'SUSPICIOUS' \| null` and `audit_note: string \| null` to the `Expense` interface (`select('*')` already returns them) |
| Modify | `app/_components/paper/LedgerTable.tsx` | Add optional `note?: ReactNode` + `noteArrow?: boolean` to `LedgerRow`. Render the note as a `font-hand text-hand-s text-pen-navy` line under the description (table cell + receipt card); render `<AnnotationArrow>` beside the amount when `noteArrow` |
| Modify | `app/dashboard/_components/_ledger.tsx` | Map `expense.audit_verdict` → `row.stamp` (`navy` APPROVED / `red` SUSPICIOUS) and `expense.audit_note` → `row.note`; `noteArrow` only when SUSPICIOUS |
| Modify | `app/dashboard/page.tsx` | When `range` is `this_month`/`last_month`, `await auditMonth(monthKey)` before reading expenses (verdicts land before the list renders) |
| Modify | `docs/DECISION_LOG.md` | Append the /plan-stage choices (colors, thresholds, window, arrow scope, inline trigger, detector self-check) |

## Approach & trade-offs

**Two columns, no new table.** Already decided (DECISION_LOG 2026-06-23): verdict + note
ride on `expenses`. `select('*')` in `getExpenses` returns them for free — only the
`Expense` type widens. Stamps then render on *any* range that shows an audited row, not
just month views, because the verdict is stored per row (the daily-utility point).

**Trigger = inline server render on month-range views.** The page is a server component
and the audit is generate-once/replay, so `auditMonth` runs inline (await) before
`getExpenses`, only when `range ∈ {this_month, last_month}` — the two calendar-month
ranges in `RangeKey`. First view of a month pays one model call; every later view finds
`audit_verdict IS NOT NULL` and makes none. No new route, no client effect, no spinner —
same write-then-read shape the seal path uses, minus the POST. *Skipped:* auditing
arbitrary custom ranges (can span two months) and a manual re-audit control.
`// ponytail: fires on this_month/last_month only; older months audit if reselected as those ranges`

**Detectors are pure `.mjs` with an inline self-check.** No test runner exists in the
repo and scripts are plain `.mjs`. Putting the deterministic detectors in
`detectors.mjs` (JSDoc-typed, imported by the TS orchestrator) lets the self-check run
with zero new deps: `node lib/dashboard/detectors.mjs`. Adding `tsx`/vitest just to test
two pure functions fails the ladder. AC#4's "runnable self-check, no framework" → asserts
in a `demo()` at the bottom.

**One judge call, facts in.** `flagCandidates` produces candidate flags in JS; one
`generateObject` (zod array of `{id, verdict, note}`) covers the whole unaudited batch.
The model gets the entries + candidate flags as given facts and may clear a false positive
or raise its own. No SQL tool loop (spec Out). On any failure we catch and leave verdicts
`null` — rows render un-stamped, no crash (AC#5, mirrors `wrapped.ts`).
`generateObject` + zod is already used in `lib/sql-tool.ts`, so no new pattern.

**Persistence = per-row updates.** Supabase has no clean bulk-update-distinct-values;
`Promise.all` of `update({audit_verdict, audit_note}).eq('id', id)` over the batch is fine
at single-keeper monthly volume. `// ponytail: per-row updates; one CASE statement if a month ever holds thousands`

**Thresholds (spec deferred to /plan, defaults fine):**
- Duplicate window: **±3 days**, same `category` + same `amount`, excluding self.
- Anomaly: amount **> 3× the all-time median** for its `category`, requiring **≥4**
  historical samples in that category (else too thin to judge). All-time median via one
  `select amount, category` query. `// ponytail: full-table category read; add a date floor if the table grows large`
- Integers throughout — median of an even-count set rounds with `Math.round` (VND invariant).

**Stamp colors:** `APPROVED` → **`navy`** (calm, non-warning); `SUSPICIOUS` → **`red`**.
stamp-red stays on the suspicious minority only, well under the ~3% budget (§DESIGN_SYSTEM
color rules). Reuses `LedgerRow.stamp` (already rendered in the amount cell).

**Arrow scope:** the `<AnnotationArrow>` points at the amount on **SUSPICIOUS rows only**
— matching the spec intro's "margin arrow pointing at the *flagged* figure" and keeping
the register calm. AC#3 reads "each audited row … an arrow"; the intro scopes it to
flagged figures. Resolved toward the intro (arrow = the flag device; nothing to flag on
APPROVED). Flagged in DECISION_LOG. **If you want an arrow on every audited row, say so.**

**Row height:** an audited row carries the note on a second line inside the description
cell, so it spans ~2 ruled lines instead of 1 (LedgerTable's 32px/one-rule property).
Accepted for audited rows — the note is the point. Un-audited rows are unchanged.

Skipped (spec Out): re-audit on edit (stale-on-edit, `// ponytail:` at the map site),
SQL tool loop, cron/at-creation audit, dedicated audit page, configurable thresholds,
more than the two detectors.

## TODO
- [x] `007_audit.sql`: single `ALTER TABLE expenses ADD COLUMN audit_verdict TEXT, ADD COLUMN audit_note TEXT;`. **Apply BLOCKED by sandbox** (production DB) — file written; run `pnpm db:migrate -- supabase/migrations/007_audit.sql` to apply.
- [x] `docs/database.md`: add the two column rows to `expenses` + a `007` line in Migrations.
- [x] `lib/dashboard/detectors.mjs`:
  - [x] `findDuplicates(entries, windowDays=3)` → ids flagged when another entry shares `category`+`amount` within ±windowDays (exclude self).
  - [x] `computeMedians(allEntries)` → `Map<category, {median, count}>` (integer).
  - [x] `findAnomalies(entries, medians, k=3, minSamples=4)` → ids where `amount > k*median` and category has ≥minSamples.
  - [x] `flagCandidates(...)` → per-id `{ duplicate?: reason, anomaly?: reason }`.
  - [x] `demo()` asserts: dup pair flags both; within-norm does not; 3×+ above a ≥4-sample median flags; thin-category outlier does **not**. Guarded by `import.meta.url`.
- [x] `package.json`: add `"test:audit": "node lib/dashboard/detectors.mjs"`.
- [x] `lib/dashboard/audit.ts` — `auditMonth(month)`:
  - [x] Query the month's entries; filter to `audit_verdict IS NULL`. If none, return.
  - [x] Query all-time `id, amount, category, date` for `computeMedians`.
  - [x] `flagCandidates` over the month (dup vs already-audited counts); verdict lands on unaudited set.
  - [x] ONE `generateObject` — facts in, per-entry `verdict` + one-line clerical `note`, guardrails from `wrapped.ts`. `try/catch` → leave null.
  - [x] Persist: `Promise.all` of `update({ audit_verdict, audit_note }).eq('id', id)`.
- [x] `lib/dashboard/queries.ts`: widen `Expense` with `audit_verdict` + `audit_note`.
- [x] `LedgerTable.tsx`: `LedgerRow` gains `note?` + `noteArrow?`; note line under description (shared `Description`), `<AnnotationArrow>` beside the amount when `noteArrow` (shared `Amount`).
- [x] `_ledger.tsx`: set `stamp` (navy APPROVED / red SUSPICIOUS), `note`, `noteArrow` (SUSPICIOUS) when audited. `// ponytail: no re-audit on edit`.
- [x] `page.tsx`: `await auditMonth(from)` when `range` is `this_month`/`last_month`, before the reads.
- [x] DECISION_LOG: /plan-stage choices (already appended at plan time).

### verify (per acceptance criterion)
- [ ] **AC1 — migration + docs:** `007_audit.sql` applied; `\d expenses` shows both columns; `database.md` lists them + `007`.
- [ ] **AC2 — one call, then replay:** view `this_month` (or `last_month`) with unaudited entries → exactly one model call, verdicts+notes persisted; reload → no model call (no latency / no request fires).
- [ ] **AC3 — render:** each audited row shows an APPROVED/SUSPICIOUS stamp + the keeper's one-line note; SUSPICIOUS rows show the amount arrow (per resolved scope). Eyeball desktop + mobile (375px receipt card).
- [ ] **AC4 — detectors:** `pnpm test:audit` (i.e. `node lib/dashboard/detectors.mjs`) passes — dup pair flagged, within-norm not, anomaly above ≥4-sample median flagged, thin-category outlier not.
- [ ] **AC5 — guardrails + graceful fail:** generated note is ≤1 line, dry clerical, states no figure of its own; force `generateObject` to throw → rows render un-stamped (verdicts stay null), page does not crash.
- [ ] **AC6 — color budget:** SUSPICIOUS uses `stamp-red`, APPROVED uses `navy`; stamp-red stays well under ~3% of the screen (eyeball a month that's mostly APPROVED).
- [ ] **AC7 — integers:** detector math + every rendered amount are integers (no decimals in median/threshold or display).
