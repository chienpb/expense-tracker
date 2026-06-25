# trips-p3-maps: Trip maps + routes

## What
Each trip gets its own hand-drawn **parchment map** as its landing page. `/trips/[id]`
becomes the map (cover); the scene slideshow moves to `/trips/[id]/play`. On the map,
the traveller's **route** (from an optional GPX upload) is inked across the parchment,
and each scene is a hand-placed **wax seal**; clicking a seal sails into that scene in
the slideshow. A cartouche (title · date · scene count) and a compass rose dress the
sheet. No route still works — a trip with only hand-placed seals is a complete map.

This is the proven `/spikes/trips` "Trip-map cover" wired to real data: the carto
components (`carto/*`), GPX helpers (`decimate`/`normalize`/`toPath`), and the
Cartographer's Hand design system already exist. Phase 3 is wiring, GPX parsing, and
two placement/storage surfaces — not net-new art.

## Why
Phase 1 made the soul (scenes); Phase 2 made the first frame (the Atlas of all trips).
Phase 3 gives each individual trip its own world — "the Trip: its own parchment map
where wax seals open the story" (VISION). It's the surface that makes a single journey
feel like a place you step into, not a photo carousel.

## Scope
- **In:**
  - **Map landing.** `/trips/[id]` renders the parchment trip-map (cover). The existing
    scene slideshow moves to `/trips/[id]/play`. Seals on the map deep-link into the
    slideshow at a specific scene (e.g. `/trips/[id]/play?scene=<position>`).
  - **GPX route (optional per trip).** Owner uploads a `.gpx`; server parses `<trkpt>`
    lat/lon, projects + `normalize`s to `[0,1]`, `decimate`s to ~120 points, stores the
    decimated point array. Rendered as a `HandPath variant="route"` inked stroke.
    Re-upload replaces; a "remove route" clears it. A trip with no route renders the
    map without a route line.
  - **Hand-placed scene seals.** Each scene gets `map_x`/`map_y` (`[0,1]` fractions,
    nullable = unplaced). Owner drags a scene's seal onto the map to place/move it —
    same drag mechanic and click-vs-drag disambiguation as the Atlas. Unplaced scenes
    sit in a tray; drag onto the map to place, drag off to unplace. Works with or
    without a route.
  - **Cartouche + compass rose.** `Cartouche(title, date, "N scenes")` and a
    `CompassRose` dress the sheet. Static, no user config.
  - **Scene-seal click** (not drag) → `/trips/[id]/play?scene=<position>`. Glyph = scene
    position number; one red "you are here"–style accent is allowed per §design (the
    most-recent or first scene), rationed.
  - **Public viewing.** A public trip's `/trips/[id]` map is viewable by anyone (private
    trips 404 for non-owners, as today). Public viewers see placed seals + route but get
    no edit/drag/tray UI. Owner-only controls (upload GPX, drag seals) are gated.
  - Paper Ledger / Cartographer's Hand styling throughout (mandatory invariant).
- **Out (deferred):**
  - Hand-placed **terrain glyphs** (mountain/tree/wave placement UI + storage) → Phase 4
    (roadmap defers the glyph library; the system may still scatter a *fixed* ambient
    glyph or two, but no user placement).
  - Auto-distributing seals along the route — we chose hand-placed.
  - Fog-of-war / Atlas reveal → Phase 4.
  - Real coordinates / a real basemap under the route → never (fantasy over fidelity).
    The GPX is projected by its own bounding box only; it is decoration, not geography.
  - Multiple routes per trip, waypoint/elevation/time data, route editing by hand.
  - Strava/OAuth, any auto-sync.

## Acceptance Criteria
- [ ] `/trips/[id]` renders the parchment trip-map for a trip the owner can see; the
      slideshow now lives at `/trips/[id]/play` and still works (Phase-1 behaviour intact).
- [ ] A public trip's `/trips/[id]` map is viewable when signed out / by a non-owner;
      a private trip 404s for non-owners (unchanged from Phase 1's rule).
- [ ] Migration adds `route` (nullable JSON array of `{x,y}` in `[0,1]`) to `trips` and
      `map_x`/`map_y` (nullable float) to `scenes`.
- [ ] Owner can upload a `.gpx`; the route renders as a `HandPath` inked stroke that
      persists across reload. Re-upload replaces it; "remove route" clears it (route → null).
- [ ] GPX parsing tolerates a real-world file (thousands of `<trkpt>`), decimates to
      ~120 points, and the inked line follows the track's shape (switchbacks visible).
- [ ] A scene with no `map_x/map_y` shows in the tray, not on the map; a placed scene
      shows as a wax seal at its position and not in the tray.
- [ ] Dragging a tray scene onto the map places it; dragging a placed seal moves it;
      both persist across reload. A seal can be unplaced (returns to tray, coords → null).
- [ ] Clicking (not dragging) a placed seal navigates to `/trips/[id]/play?scene=<pos>`
      and the slideshow opens on that scene.
- [ ] A trip with no route and placed seals renders a complete, good-looking map (route
      is genuinely optional).
- [ ] Cartouche shows title · date · scene count; a compass rose is present. Positions
      are `[0,1]` fractions and stay correct when the map element is resized (responsive).
- [ ] Non-owner / signed-out map view shows no upload, tray, or drag affordances.
- [ ] Styling matches Cartographer's Hand (`docs/trips-design-system.md`); none of the
      banned defaults (vignette, dotted-red route, X-marks-spot, glossy wax, GPS pins).

## Constraints / Notes
- **Auth in middleware** — `/trips/[id]/play` and any new `/api/trips/*` writes are gated
  there; route handlers only READ the user id and scope writes by `user_id` /
  `tripOwner`/`sceneOwner` (existing invariant, no re-check).
- **Reuse the existing endpoints.** Extend `PATCH /api/trips/scenes` to accept
  `map_x`/`map_y` (mirror the Atlas `atlas_x/atlas_y` both-or-null validation in
  `PATCH /api/trips`). GPX upload is multipart — add it to the scenes route or a small
  `/api/trips/route` handler; don't invent parallel auth plumbing.
- **GPX parsing is server-side, no new dependency.** `<trkpt lat="" lon="">` is simple
  XML — extract with a regex / lightweight parse, project lon→x / lat→y, then reuse
  `normalize` + `decimate` + `toPath`. `// ponytail: regex trkpt scan; swap to an XML
  parser only if a real export breaks it.` Leave one assert-style check on the parser.
- **Store the route decimated**, not raw — ~120 normalized points as JSON on the trip,
  so render is cheap and the point fits the column. Validate it's an array of finite
  `{x,y}` in `[0,1]` before write.
- **Click-vs-drag** must be disambiguated (drag threshold) so placing a seal never
  accidentally navigates — same problem the Atlas already solved; reuse that mechanic.
- **Coordinates are floats by design** — the integer invariant is money-only.
- **`/trips/[id]` route move:** the slideshow component (`[id]/_slideshow.tsx`) and its
  page move to `[id]/play`; update every internal link (`/trips` cards, Atlas marker
  click target, edit page) that currently points at `/trips/[id]` expecting the slideshow.
- Read `docs/trips-design-system.md` before any UI work; the spike at `/spikes/trips`
  is the reference rendering for the cover.
