# Now

> The current state of play. A fresh thread reads this first to know where things
> stand — no code-spelunking needed. History lives in git + `DECISION_LOG.md`;
> this file stays small. `/next` writes "Next up"; `/close` rotates it into
> "Just shipped" and trims. Keep "Just shipped" to the last 1–2 entries.

## Just shipped
- **Trips Phase 2 — Atlas** (2026-06-24) — `/trips/atlas`: owner-only world map; each placed
  trip is a gold `<WaxSeal>` at `atlas_x/atlas_y` (`[0,1]` fractions, nullable = tray).
  Drag tray→map to place, marker→map to move, marker→off-map to un-place; one pointer
  handler w/ 5px threshold (tap = sail into trip), optimistic PATCH. Base map is one
  committed self-contained SVG drawn by a delegated Opus agent. Middleware excludes
  `/trips/atlas` from the public `[id]` hole. See `DECISION_LOG.md` 2026-06-24. Seams:
  SVG coastlines lean puffy/scalloped (anti-slop soft miss, redraw candidate); live
  drag ACs (AC1, AC3–AC7) confirmed by eyeball, no formal `/verify` run yet.
- **Trips Phase 1 — Scenes** (2026-06-24) — `/trips`: record a journey as ordered
  image+caption scenes, wander back as a slideshow (prev/next + filmstrip, stops at ends).
  Treasure Parchment surface; `trips`/`scenes` tables + public `trips` storage bucket;
  one carved middleware hole (unauth `GET /trips/[id]`, page is the access control).
  See `DECISION_LOG.md` 2026-06-24 (×2). Seams: orphaned blobs leak on delete (rows
  cascade, images don't).

## Next up
_(none chosen — run `/next`)_

## On deck
Top unbuilt candidates from `IDEAS.md` (argue with the scores):
- **Trips Atlas polish** — redraw `trips-atlas.svg` coastlines (less scalloped), and/or
  Phase 2.5 public/shareable whole-map Atlas (deferred from Phase 2).
- **#2 Wet Ink** — GPU ink-diffusion as a new entry bleeds onto the page.

> ~~#5 Pressed-Ink Sparklines~~ — already shipped. Charts have been raw hand-drawn
> SVG (`HandDrawnChart`, `filter: url(#hand-wobble)`) since Phase 4 (DECISION_LOG
> 2026-04-21, "charts ship on raw SVG, not Recharts"). Backlog entry was stale.
