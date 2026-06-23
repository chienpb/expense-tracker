# rubber-stamp-auditor: The Rubber-Stamp Auditor

## What
The Ledger-keeper audits each month's entries and stamps every one **APPROVED** or
**SUSPICIOUS**, with a one-line margin note in the keeper's hand and a margin arrow
pointing at the flagged figure. Verdicts are generated once per month on first view,
stored, and replayed for free — same generate-once/store/replay model as Monthly
Wrapped.

## Why
Daily-useful: surfaces likely duplicates and out-of-pattern amounts the moment you
look at a month, in the ledger's own voice. Reuses the AI-clerk plumbing
(`lib/dashboard/wrapped.ts`, `ledger-keeper-prompt`) while it's fresh.

## Scope
- **In:**
  - Two deterministic detectors over a month's entries:
    - **Likely duplicate** — same `category` + `amount` within a short window (e.g. ±3 days), excluding the entry itself.
    - **Amount anomaly** — entry amount unusually high for its `category` vs. that category's history (simple stat, e.g. > k× the category median/mean; no ML).
  - **AI as final judge.** JS computes candidate flags, then **one** `generateObject`/`generateText` call per audit run covers the whole month's unstamped batch: for each entry it returns `verdict` (`APPROVED` | `SUSPICIOUS`) + a one-line clerical `note`. The AI may clear a false-positive flag or raise its own. Numbers passed as facts; the clerk states no figures of its own (same guardrails as the Wrapped verdict).
  - **Storage:** two nullable columns on `expenses` — `audit_verdict` (TEXT) and `audit_note` (TEXT). `null` verdict = unaudited. New migration `007_audit.sql`.
  - **Trigger:** on-demand, on month view, keyed on **per-entry** state — not month-end/seal. Viewing a month finds entries with `audit_verdict IS NULL`; if any, one run stamps that batch, stores, and replays for free on later views. **Independent of sealing** — the live current month is audited too, so a new entry gets stamped on the next view (the daily-utility point). Past months: audited once on first view, free after. Differs from Monthly Wrapped on purpose (Wrapped runs once at seal; the Auditor runs on view, per unaudited entry).
  - **Surface:** stamp + margin note + arrow on each row in the existing dashboard entry list. Paper Ledger components (`<Stamp>`, hand-drawn glyphs).
- **Out:**
  - Re-auditing on edit. Verdict is generated once and never invalidated (stale-on-edit accepted; entries are near append-only via Shortcuts). Marked with a `ponytail:` comment.
  - SQL tool loop / multi-step agent. One model call per run, facts passed in — same escape-hatch-not-default stance as `wrapped.ts`.
  - Cron / at-creation auditing, a dedicated audit page, user-configurable thresholds, more than the two detectors above.

## Acceptance Criteria
- [ ] `007_audit.sql` adds `audit_verdict` + `audit_note` to `expenses`; `docs/database.md` updated (column rows + migrations list).
- [ ] Viewing a month with unaudited entries triggers exactly **one** model call covering all of them; verdicts + notes are persisted; a second view of the same month makes **no** model call.
- [ ] Each audited row renders an `APPROVED` or `SUSPICIOUS` stamp, the keeper's one-line margin note, and an arrow pointing at the entry's amount.
- [ ] Duplicate detector flags a same-category/same-amount entry within the window; amount-anomaly detector flags an entry well above its category's norm. Detectors are covered by a runnable self-check (assert-based, no framework).
- [ ] AI verdict respects the clerk guardrails: no figures of its own, dry 1962-clerical voice, one line per entry. Failure of the AI call leaves verdicts `null` and the row simply un-stamped (no crash) — same graceful-degrade as Wrapped.
- [ ] `SUSPICIOUS` uses `stamp-red`; `APPROVED` uses a non-red stamp color (stamp-red is reserved for warnings/corrections; pick from the palette in `/plan`). Stamp-red stays under ~3% of screen.
- [ ] Amounts are integers throughout (detector math and display).

## Constraints / Notes
- **Invariants:** amounts are integers; auth stays in `middleware.ts` (no re-check in the audit path); Supabase service-role; Paper Ledger design system (read `DESIGN_SYSTEM.md` — `<Stamp>` §4.4, margin notes = Patrick Hand `pen-navy`, no emoji/icons, stamp-red budget).
- **`expenses` has no `user_id`** (single-keeper books). The audit columns live on the row; no per-user scoping needed for verdicts — only the seal path is user-scoped.
- Reuse `ledgerKeeperInstructions` and the Wrapped facts/guardrail pattern. Don't fork the prompt system.
- Open design choices for `/plan`: APPROVED stamp color, exact anomaly threshold (k), duplicate window width, arrow glyph. Defaults are fine; surface them, don't block.
