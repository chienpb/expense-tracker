# Now

> The current state of play. A fresh thread reads this first to know where things
> stand — no code-spelunking needed. History lives in git + `DECISION_LOG.md`;
> this file stays small. `/next` writes "Next up"; `/close` rotates it into
> "Just shipped" and trims. Keep "Just shipped" to the last 1–2 entries.

## Just shipped
- **Rubber-Stamp Auditor** (2026-06-23) — per-entry AI verdict (generate-once/store/replay
  on `expenses.audit_verdict/note`). Shipped quiet: APPROVED is the silent default (no
  stamp, no note); only SUSPICIOUS stamps — red overlay on the category cell so it never
  reflows the amount. Notes generated only for SUSPICIOUS. Table locked to fixed column
  widths (`table-fixed` + colgroup). See `DECISION_LOG.md` 2026-06-23.
- **Monthly Wrapped** (2026-06-23) — AI-clerk verdict slip fills the Closing-the-Books
  seam: wax fractures, slip lifts, verdict writes on char-by-char under a hand-drawn nib.

## Next up
_(none chosen — run `/next`)_

## On deck
Top unbuilt candidates from `IDEAS.md` (argue with the scores):
- **#2 Wet Ink** — GPU ink-diffusion as a new entry bleeds onto the page.
- **#3 The Loupe** — brass magnifier reveals fine-print that only exists under glass.

> ~~#5 Pressed-Ink Sparklines~~ — already shipped. Charts have been raw hand-drawn
> SVG (`HandDrawnChart`, `filter: url(#hand-wobble)`) since Phase 4 (DECISION_LOG
> 2026-04-21, "charts ship on raw SVG, not Recharts"). Backlog entry was stale.
