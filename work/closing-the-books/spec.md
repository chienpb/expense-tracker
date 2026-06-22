# closing-the-books: Closing the Books

## What
A month-end ceremony: the user "settles the books" on a month — a horizontal rule
is drawn off under the last entry, a wax seal *thumps* down, and the page flips to a
**year calendar** with that month now marked sealed/done. The closed state is
persisted (a new `sealed_months` table) so it survives reload. Sealing does **not**
lock edits; if a new entry later lands in a sealed month, the seal goes **stale
("reopened")** rather than silently absorbing it.

## Why
The keystone of the Paper Ledger metaphor (IDEAS.md #1, holistic 8.6, Fit 10). "Settle
the books" is a real monthly ritual a ledger-keeper performs — it gives the month a
sense of closure and a durable record of *when* it was closed. It's also the first
real consumer of the generative-ink primitives (rule-off stroke, wax seal); the engine
falls out of it rather than being built speculatively.

## Scope
- **In:**
  - `sealed_months` table + migration (per-user closed flag with `sealed_at`).
  - Manual trigger: a "Settle the books — <Month Year>" affordance on the dashboard.
  - Auto trigger: on load, if the prior month is fully past and not already sealed,
    prompt/offer the ceremony (deduped by the persisted flag — no double-firing).
  - The ceremony: rule-off stroke animation → wax-seal thump (existing motion §8,
    seal-gold/stamp-red per §1). Honors `reduce motion`.
  - **Year calendar** destination: 12-month grid, sealed months marked done (seal
    glyph + `sealed_at` date), current/open months plain. This is the durable view of
    `sealed_months` state on reload.
  - **Stale-seal state:** a sealed month whose entries changed after `sealed_at`
    renders as reopened (visible crack / "REOPENED" mark). Re-settling re-seals.
  - The **seam** for the future Monthly Wrapped: the ceremony emits a "month M sealed"
    event/transition; the calendar consumes it. Wrapped will later play *between* the
    seal-thump and the calendar without replacing either.
- **Out:**
  - **The Monthly Wrapped** (AI-clerk real-time-streamed recap) — its own `/spec`.
  - Idea #7 **Annual Statement** (illuminated broadsheet) — untouched, separate.
  - **Edit-locking** sealed months at the API. Sealing is a snapshot, not a freeze.
  - Any reusable "generative-ink toolkit" as a standalone module — extract on the
    *second* consumer (Wet Ink #2), not here. Primitives live inline for now.
  - Re-open as an explicit user action — reopening is automatic (a new entry does it);
    no manual "unseal" button.

## Acceptance Criteria
- [ ] `sealed_months` migration exists in `supabase/migrations/` and is documented in
      `docs/database.md`. Columns at least: user_id, month (year+month key), sealed_at.
      Unique per (user, month).
- [ ] Pressing "Settle the books" on an open month plays the rule-off → wax-seal
      ceremony, then lands on the year calendar with that month marked sealed.
- [ ] Reloading after sealing shows the month still sealed (state read from DB, not
      client memory).
- [ ] On first load in a new month, the immediately-prior unsealed past month surfaces
      the close affordance; an already-sealed month does **not** re-prompt.
- [ ] A new entry dated within a sealed month (e.g. posted via Shortcuts) makes that
      month render as **stale/reopened** on next view; re-settling clears it back to
      sealed. Detected by comparing entry timestamps against `sealed_at` (no triggers).
- [ ] The year calendar correctly distinguishes: open, sealed, stale-reopened, and
      future months.
- [ ] Ceremony respects the "reduce motion / reduce skew" setting (§9) — flattens to a
      non-animated sealed state.
- [ ] Visuals pass the Quick-Reference Card: seal is a `<Stamp>`-family element (not a
      pill/toast), no drop shadows, no emoji, wax uses `seal-gold`/`stamp-red`, rule-off
      is a real pen stroke. Verified at 1440×900 and 375×812.
- [ ] No regression to existing write paths — `/api/expenses` and the Shortcuts
      endpoint are unchanged (sealing reads, it does not gate writes).

## Constraints / Notes
- **Amounts are integers (VND).** Any totals shown on the calendar/marker follow this.
- **Auth in middleware.** The new sealing endpoint(s) re-check nothing; auth is the
  session cookie via `middleware.ts`. Sealing is per authenticated user.
- **Supabase service-role, no RLS** — scope every `sealed_months` query by `user_id` in
  app code.
- **Paper Ledger system is mandatory** (`docs/DESIGN_SYSTEM.md`). Reuse the existing
  page-flip rig (`docs/PAGE_FLIP.md`) for the flip to the calendar; reuse `<Stamp>`,
  motion §8, and SVG filters §7 (`#stamp-wear` for the seal). The rule-off stroke is a
  new draw-on animation but stays inline — not promoted to a shared module yet.
- **Month key:** store as a stable string/date (e.g. first-of-month `DATE`) so it sorts
  and dedupes cleanly; format for display per §10 ("Jun 2026").
- **Stale detection is a read-time query**, not a DB trigger or a write-path hook —
  keeps the Shortcuts contract untouched (ponytail: no triggers until a read-time
  compare measurably falls short).
- Decision recorded: `docs/DECISION_LOG.md` 2026-06-22 (scope split, seal state model,
  Wrapped seam).
