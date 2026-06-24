# Now

> The current state of play. A fresh thread reads this first to know where things
> stand — no code-spelunking needed. History lives in git + `DECISION_LOG.md`;
> this file stays small. `/next` writes "Next up"; `/close` rotates it into
> "Just shipped" and trims. Keep "Just shipped" to the last 1–2 entries.

## Just shipped
- **The Loupe** (2026-06-24) — brass margin magnifier; WebGL lens composites a refracted
  base-page texture + a separate hidden fine-print texture (Canvas 2D per-row provenance:
  log time, full id, subcategory, type, audit verdict/note) revealed only inside the glass.
  Desktop-pointer/WebGL only, no fallback surface. Restored the Auditor's per-entry
  `audit_note` (now on APPROVED too) so the loupe has reasoning for every row; visible
  ledger still shows it on SUSPICIOUS only. See `DECISION_LOG.md` 2026-06-24.
- **Rubber-Stamp Auditor** (2026-06-23) — per-entry AI verdict (generate-once/store/replay
  on `expenses.audit_verdict/note`). Shipped quiet: APPROVED is the silent default (no
  stamp); only SUSPICIOUS stamps — red overlay on the category cell so it never reflows
  the amount. Table locked to fixed column widths. See `DECISION_LOG.md` 2026-06-23.

## Next up
_(none chosen — run `/next`)_

## On deck
Top unbuilt candidates from `IDEAS.md` (argue with the scores):
- **#2 Wet Ink** — GPU ink-diffusion as a new entry bleeds onto the page.

> ~~#5 Pressed-Ink Sparklines~~ — already shipped. Charts have been raw hand-drawn
> SVG (`HandDrawnChart`, `filter: url(#hand-wobble)`) since Phase 4 (DECISION_LOG
> 2026-04-21, "charts ship on raw SVG, not Recharts"). Backlog entry was stale.
