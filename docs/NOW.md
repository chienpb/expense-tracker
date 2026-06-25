# Now

> The current state of play. A fresh thread reads this first to know where things
> stand — no code-spelunking needed. History lives in git + `DECISION_LOG.md`;
> this file stays small. `/next` writes "Next up"; `/close` rotates it into
> "Just shipped" and trims. Keep "Just shipped" to the last 1–2 entries.

## Just shipped
- **Trips — Atlas pan & zoom** (2026-06-25) — the Atlas (`app/trips/_atlas-board.tsx`) now
  pans and zooms like a map: wheel/pinch zoom-to-cursor (clamped 1×–6×), drag-the-sea to pan
  (both view + edit modes, clamped to no gutter), a conditional corner "Fit" reset. Wax seals
  stay pixel-constant (counter-scaled `1/z`) so they spread instead of clustering. Native CSS
  `translate/scale` camera — no new dep; camera is view-only client state, coords stay `[0,1]`,
  DB/API/auth untouched. Edit-drop inverts the camera (`fx = (clientX - left - panX)/(width·z)`).
  Wheel delta clamped + sensitivity tuned so trackpad zoom isn't sluggish. See `DECISION_LOG.md`
  2026-06-25 ("Atlas pan/zoom"). Seam: browser ACs (pan/zoom/place-after-zoom) verified by logic,
  not yet exercised live; pinch one-finger-on-a-seal edge case ignored (out of scope).
- **Trips Phase 4 — Atlas is the Trips home** (2026-06-25) — `/trips` now renders the
  full-screen Atlas in view-by-default mode (placed seals are `<Link>`s; tap → sail into
  the trip). Editing moved behind an explicit corner "Edit ✎" toggle that gates the drag
  handlers + draggable seals and opens a corner popover (unplaced-trips list + reused
  `NewTripForm`). Drop a seal over the popover/off-map → un-place. Old `/trips` card list,
  `TripCard`, and the standalone `atlas/` route are deleted; `/trips/atlas` → `/trips`
  via native `redirects()` (308). No data-model/API/auth changes. See `DECISION_LOG.md`
  2026-06-25 ("Atlas is the Trips home"). Seams: drag-place/un-place verified by logic +
  reused handler, not exercised live (every trip was already placed); `NewTripForm`'s
  `sm:flex-row` dropped (popover was its only caller).

## Next up
_(none chosen — run `/next`)_

## On deck
Top unbuilt candidates from `IDEAS.md` (argue with the scores):
- **Trips — richer Atlas pins** — now unblocked by pan/zoom: pin types, clustering/grouping,
  fog-of-war. The declutter follow-on the zoom spec was the first step toward.
- **Trips — terrain glyphs** — user-placed hand-drawn glyphs (mountains, trees,
  waves) on the trip-map; deferred out of Phase 3 (a whole placement+storage surface).
- **Trips Atlas polish** — redraw `trips-atlas.svg` coastlines (less scalloped), and/or
  a public/shareable whole-map Atlas (deferred from Phase 2).
- **#2 Wet Ink** — GPU ink-diffusion as a new entry bleeds onto the page.

> ~~#5 Pressed-Ink Sparklines~~ — already shipped. Charts have been raw hand-drawn
> SVG (`HandDrawnChart`, `filter: url(#hand-wobble)`) since Phase 4 (DECISION_LOG
> 2026-04-21, "charts ship on raw SVG, not Recharts"). Backlog entry was stale.
