# trips-p2-atlas: The Atlas

## What
A whimsical world map at `/trips/atlas`. Each Phase-1 trip is a hand-placed
marker on the map; clicking a marker sails into that trip's scene slideshow
(`/trips/[id]`). You place/move markers by dragging them onto the map; their
position is stored per trip. The base map is a single hand-drawn SVG asset.

## Why
Phase 1 made the soul (scenes). The Atlas is the first frame: it turns a flat
list of trips into one fantasy world you can wander — the "all trips together
form one Atlas" promise from the vision. Owner-only for now; the whole-map
public view waits until you actually want to share it.

## Scope
- **In:**
  - `/trips/atlas` — owner-only world-map view rendering the base SVG with a
    marker per *placed* trip (newest-first ordering doesn't matter spatially).
  - Drag-to-place: drag a marker on the map to set its position; persists on
    drop. Unplaced trips live in a side **tray**; drag from tray onto the map
    to place. Drag a placed marker back off / to a "remove" affordance to unplace.
  - Storage: `atlas_x` / `atlas_y` on `trips` — floats in `[0,1]` (fractions of
    the map's intrinsic width/height, so the map can be re-sized/re-arted
    without moving markers). `NULL` = unplaced.
  - Marker → click navigates to `/trips/[id]`. Marker shows the trip title
    (label or on-hover, direction-B wax-seal style).
  - One base map SVG asset, drawn by a **delegated Claude Opus agent** that
    renders and eyeballs its own output (screenshot loop) until the art reads as
    a believable hand-drawn fantasy world map. Lives in the repo as a static asset.
  - Paper Ledger / treasure-parchment (direction B) styling throughout.
  - Entry: link to `/trips/atlas` from the `/trips` list page.
- **Out (deferred):**
  - Public/shareable Atlas route — Phase 2.5+/4. (Per-trip public sharing already exists.)
  - Fog-of-war reveal — Phase 4.
  - Per-trip parchment maps, GPX routes — Phase 3.
  - Real coordinates / geocoding — never (fantasy over fidelity).
  - Marker clustering, zoom/pan beyond what one screen needs, multi-map library.

## Acceptance Criteria
- [ ] `/trips/atlas` renders the base SVG map for the signed-in owner; private
      trips are visible to the owner (it's their private overview).
- [ ] Migration adds `atlas_x` / `atlas_y` (nullable float) to `trips`.
- [ ] A trip with no position shows in the tray, not on the map; a placed trip
      shows as a marker at its `(atlas_x, atlas_y)` and not in the tray.
- [ ] Dragging a tray item onto the map places it (writes x/y); dragging a
      placed marker moves it (updates x/y); both persist across reload.
- [ ] A marker can be un-placed (returns to tray, x/y → NULL).
- [ ] Clicking (not dragging) a placed marker navigates to `/trips/[id]`.
- [ ] Marker positions are stored as `[0,1]` fractions and stay visually
      correct if the map element is resized (responsive).
- [ ] The base map SVG exists in the repo and the drawing agent has confirmed
      (via its own screenshots) it looks like a hand-drawn fantasy world, not a
      placeholder rectangle.
- [ ] Styling matches Paper Ledger / direction-B; no new UI invariants broken.

## Constraints / Notes
- **Auth in middleware** — `/trips/atlas` and any new `/api/trips/*` writes are
  gated there; route handlers scope by `user_id`, no re-check (existing invariant).
- **Amounts/integers** invariant: N/A here, but x/y are *floats* by design —
  the integer rule is money-only.
- Reuse the existing `PATCH /api/trips` (or extend it) to persist `atlas_x/y`;
  don't invent a new endpoint if the trip-update path already exists.
- Marker click-vs-drag must be disambiguated (drag threshold) so placing never
  accidentally navigates.
- The map-drawing agent is a build step for `/plan`, not runtime code: it
  produces a committed static SVG. Keep the SVG self-contained (no external
  fonts/refs) so it renders identically server- and client-side.
- Paper Ledger is mandatory reading before any UI work (`docs/DESIGN_SYSTEM.md`).
