# Now

> The current state of play. A fresh thread reads this first to know where things
> stand — no code-spelunking needed. History lives in git + `DECISION_LOG.md`;
> this file stays small. `/next` writes "Next up"; `/close` rotates it into
> "Just shipped" and trims. Keep "Just shipped" to the last 1–2 entries.

## Just shipped
- **Trips Phase 3 — maps + routes** (2026-06-25) — `/trips/[id]` is now the parchment
  trip-map (cover); the slideshow moved to `/trips/[id]/play` (seal tap deep-links via
  `?scene=<pos>`). Owner uploads a `.gpx` → `parseGpx`→`normalize`→`decimate` to ~120 pts,
  stored as `trips.route` (jsonb) and inked as a `HandPath`; scenes drag between a tray and
  the map, persisted as `scenes.map_x/map_y` (reuses the Atlas pointer handler + PATCH
  `/api/trips/scenes`). GPX endpoint is `/api/trips/gpx`. Middleware hole widened to
  `/trips/[id]/play`. Migrations 012/013. `/verify` PASS 2026-06-25 (route up/render/remove,
  all 3 drag directions persisted, deep-links, signed-out/private access). See
  `DECISION_LOG.md` 2026-06-25 (×3). Seams: coord-range 400 confirmed by read only (UI never
  sends out-of-range); terrain glyphs deferred to Phase 4; Phase 1's orphaned-blob leak still open.
- **Trips Phase 2 — Atlas** (2026-06-24) — `/trips/atlas`: owner-only world map; each placed
  trip is a gold `<WaxSeal>` at `atlas_x/atlas_y` (`[0,1]` fractions, nullable = tray).
  Drag tray→map to place, marker→map to move, marker→off-map to un-place; one pointer
  handler w/ 5px threshold (tap = sail into trip), optimistic PATCH. Base map is one
  committed self-contained SVG drawn by a delegated Opus agent. Middleware excludes
  `/trips/atlas` from the public `[id]` hole. See `DECISION_LOG.md` 2026-06-24. Seams:
  SVG coastlines lean puffy/scalloped (anti-slop soft miss, redraw candidate); live
  drag ACs (AC1, AC3–AC7) confirmed by eyeball, no formal `/verify` run yet.

## Next up
_(none chosen — run `/next`)_

## On deck
Top unbuilt candidates from `IDEAS.md` (argue with the scores):
- **Trips Phase 4 — terrain glyphs** — user-placed hand-drawn glyphs (mountains, trees,
  waves) on the trip-map; deferred out of Phase 3 (a whole placement+storage surface).
- **Trips Atlas polish** — redraw `trips-atlas.svg` coastlines (less scalloped), and/or
  Phase 2.5 public/shareable whole-map Atlas (deferred from Phase 2).
- **#2 Wet Ink** — GPU ink-diffusion as a new entry bleeds onto the page.

> ~~#5 Pressed-Ink Sparklines~~ — already shipped. Charts have been raw hand-drawn
> SVG (`HandDrawnChart`, `filter: url(#hand-wobble)`) since Phase 4 (DECISION_LOG
> 2026-04-21, "charts ship on raw SVG, not Recharts"). Backlog entry was stale.
