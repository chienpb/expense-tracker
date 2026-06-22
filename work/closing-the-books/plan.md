# closing-the-books — Plan

## Files to change
| Action | File | What |
|--------|------|------|
| Create | `supabase/migrations/005_sealed_months.sql` | `sealed_months` table: `user_id`, `month DATE` (first-of-month), `sealed_at TIMESTAMPTZ`, UNIQUE `(user_id, month)`. |
| Modify | `docs/database.md` | Document the `sealed_months` table + migration row. |
| Create | `lib/dashboard/sealing.ts` | Server query helpers + status logic: `getSealedMonths(userId)`, `getMonthLastEntry()`, `monthStatus(...)`, `monthKey`/`priorMonthKey` helpers. |
| Create | `app/api/seal/route.ts` | `POST` — upsert a seal for the session user `(user_id, month)`, `sealed_at=now()`. Re-settle = same upsert. |
| Create | `app/dashboard/year/page.tsx` | Year-calendar route (server): 12-month grid, status per cell, `?year=` nav. Durable read of `sealed_months`. |
| Create | `app/dashboard/year/_month-cell.tsx` | Client cell for open-past / stale months: in-place re-settle (POST + seal-thump) → `router.refresh()`. |
| Create | `app/dashboard/_components/_settle-books.tsx` | Client ceremony: affordance → rule-off stroke → wax-seal thump → flip to `/dashboard/year`. Reduce-motion flattens. |
| Modify | `app/dashboard/page.tsx` | `auth()` for `userId`; compute prior-unsealed-month candidate + a "Year ▸" link; render `<SettleBooks>` after `<Ledger>`. |
| Modify | `app/globals.css` | `@keyframes paper-rule-draw` + `.paper-rule-off` class (stroke-dashoffset draw-on) + reduced-motion guard. |
| Modify | `docs/DECISION_LOG.md` | Add the 2026-06-22 entry (scope split, seal-state model, Wrapped seam) if not already present. |

## Approach & trade-offs

**One POST endpoint, server-component reads.** The calendar and dashboard read
`sealed_months` directly via `lib/dashboard/sealing.ts` (server). Only writes need a
route → just `POST /api/seal` (upsert). No GET. Auth is the session cookie via
`middleware.ts`; `user_id` comes from `auth()` (`session.user.id`). No per-route auth check.

**Month status is computed, never stored.** Per the spec, no triggers/write-path hooks.
A single `execute_sql` query gives `month → max(created_at)` over `expenses`; combine with
`sealed_months` rows in code:
- `month > current month` → **future**
- sealed AND `last_entry > sealed_at` → **reopened (stale)**
- sealed → **sealed**
- else → **open**

This keeps `/api/log`, `/api/expenses` and the Shortcuts contract untouched (AC #9).

**`expenses` has no `user_id`** (single-keeper books). Stale detection compares against
*all* entries in the month; `sealed_months` is still keyed by the session user per spec.
Resolved assumption, not a blocker — noted in the decision log.

**Two settle surfaces, one endpoint.** The headline ceremony (rule-off → seal → flip)
lives on the dashboard for the auto-surfaced prior month (AC #2, #4). Re-settling a stale
month (AC #5) and settling any other open past month happens in-place on the calendar cell
(POST + seal-thump, no flip — we're already there). Both call `POST /api/seal`. The full
rule-off cinematic on every cell would be heavy and off-narrative; skipped — add a per-cell
flip only if a reviewer wants it.

**Reuse, not new primitives.** Seal = `<Stamp color="gold">` + `.paper-stamp-thump` (§8).
Flip = existing `turnPage()` from `lib/page-flip` (targetPath `/dashboard/year`,
direction `forward`). Rule-off is the one new bit: an inline SVG stroke drawn on via
`stroke-dashoffset` (`#hand-wobble` for the pen waver) — kept inline, **not** promoted to a
shared module (spec: extract on the second consumer).

**Wrapped seam (no infra).** The ceremony is a linear async sequence with an explicit
`// seam: Monthly Wrapped plays here, between thump and flip` point; `POST /api/seal`
returns the sealed month so a future Wrapped can consume it. No event bus built — YAGNI
until the Wrapped spec lands.

**Reduce-motion.** Ceremony gates on `prefers-reduced-motion` **or**
`data-reduce-motion="1"` (same check `use-page-turn` uses). When reduced: no rule-off, no
thump, no flip — POST then plain `router.push('/dashboard/year')`, landing on a static
sealed state (AC #7). The new CSS keyframe is guarded under both as well.

## TODO
- [x] `005_sealed_months.sql`: table + UNIQUE `(user_id, month)`; `month` as first-of-month `DATE`.
- [x] `lib/dashboard/sealing.ts`: `getSealedMonths(userId)`, `getMonthLastEntries()` (one `execute_sql`), `monthStatus()`, `monthKey(date)` / `priorMonthKey(today)` (→ `YYYY-MM-01`).
- [x] `app/api/seal/route.ts`: read `auth()` userId, validate `month` body, upsert via Supabase `.upsert(..., { onConflict: 'user_id,month' })`, return the row. No auth re-check.
- [x] `_settle-books.tsx`: affordance (gold stamp-border, §4.4); on activate → rule-off draw → seal thump → POST → `turnPage`/fallback nav; reduce-motion short-circuit.
- [x] `app/dashboard/year/page.tsx`: `auth()` userId, fetch sealed + last-entry maps, render 12 cells for `?year=` (default current). Sealed → gold `<Stamp>` + `sealed_at` (`formatPrintedDate`). Reopened → stamp-red crack/"REOPENED". Open plain, future `ink-faint`. Prev/next year `<Link>`.
- [x] `_month-cell.tsx`: open-past + stale cells get in-place re-settle (POST + `.paper-stamp-thump` on the cell) → `router.refresh()`.
- [x] `app/dashboard/page.tsx`: compute candidate (prior month, unsealed, fully past); render `<SettleBooks month=...>` after register; add "Year ▸" link.
- [x] `globals.css`: `paper-rule-draw` keyframe + `.paper-rule-off`; reduced-motion + `data-reduce-motion='1'` guards.
- [x] `docs/database.md`: add `sealed_months` table + migration `005` row.
- [x] `docs/DECISION_LOG.md`: 2026-06-22 entry already present (verified, line 16).
- [x] verify AC#1: migration file present, documented, columns + UNIQUE `(user,month)`. ✓ static.
- [ ] verify AC#2: settle on dashboard → rule-off → seal → lands on `/dashboard/year` with month sealed. → /verify
- [ ] verify AC#3: reload `/dashboard/year` → month still sealed (DB read). → /verify
- [ ] verify AC#4: in a new month the prior unsealed month surfaces the affordance; a sealed month does not re-prompt. → /verify
- [ ] verify AC#5: insert an expense dated in a sealed month (raw SQL / Shortcuts) → calendar shows reopened; re-settle → back to sealed. → /verify
- [ ] verify AC#6: calendar distinguishes open / sealed / reopened / future. → /verify
- [ ] verify AC#7: with `data-reduce-motion="1"` (cookie), ceremony flattens to static sealed state. → /verify
- [ ] verify AC#8: seal is gold `<Stamp>` (no pill/toast/shadow/emoji), `seal-gold`/`stamp-red`, real pen-stroke rule-off; check at 1440×900 and 375×812 (playwright-cli). → /verify
- [ ] verify AC#9: `/api/log`, `/api/expenses`, Shortcuts unchanged — sealing only reads. ✓ no write-path files touched; runtime spot-check → /verify

> **Runtime gate:** the verify-AC items need migration `005` applied in the Supabase
> SQL editor (manual, per project convention) + the dev server. Code + `npm run build`
> are green; runtime verification is the `/verify` phase.
```
```

## Next
`/clear`, then `/build closing-the-books`.
