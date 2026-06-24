# trips-p1-scenes: Trips Phase 1 — Scenes (the soul)

## What
A `/trips` section: record a trip as an ordered sequence of **scenes** (image +
caption) and wander back through it as a slideshow. No maps, no Atlas — just the
storytelling primitive, styled in **Treasure Parchment (direction B)**.

A trip = `{ title, date, public, scenes[] }`; a scene = `{ image, caption, position }`.

## Why
The vision's core rule is "story first, map second." The slideshow of scenes is the
soul; everything later (Atlas, parchment maps, routes) is theatre around it. We build
the soul as a complete, lovable thing first. Done right, you can record a real trip and
enjoy stepping back into it before any frame exists.

## Scope
- **In:**
  - DB: `trips` + `scenes` tables; one public Supabase Storage bucket `trips`.
  - `/trips` — owner's trips as cards, newest first (authed).
  - Create a trip (title, date, public toggle).
  - `/trips/[id]/edit` (authed, owner-only) — upload images, write/edit captions,
    reorder scenes (up/down swap), toggle public, delete a scene, delete the trip.
  - `/trips/[id]` — the scene slideshow: image + caption told in sequence, prev/next
    + filmstrip nav.
  - **Public viewer:** an unauthenticated visitor can open `/trips/[id]` **iff**
    `trip.public`; private or nonexistent → 404. The owner (session) sees their own
    private trips at the same route.
  - Treasure Parchment styling, reusing Paper Ledger fonts/tokens where they fit.
- **Out:**
  - Any map, Atlas, route/GPX, wax-seal-on-map (Phases 2–4).
  - Real coordinates / placement.
  - The full hand-drawn asset library — Phase 1 ships a minimal parchment surface;
    the library grows later (Phase 4). Don't build it all now.
  - Signed URLs / private bucket (see Constraints — UUID paths suffice for now).
  - Drag-and-drop reorder, `next/image` (decided against — DECISION_LOG 2026-06-24).
  - Sharing affordances beyond the public URL itself (no share sheet, no OG cards).

## Acceptance Criteria
- [ ] Migration creates `trips` (id, user_id FK CASCADE, title, date, public, created_at)
      and `scenes` (id, trip_id FK CASCADE, image, caption, position, created_at).
- [ ] `/trips` lists only the signed-in owner's trips as cards, newest first; requires a session.
- [ ] Can create a trip with title, date, and a public/private toggle; it appears in the list.
- [ ] On `/trips/[id]/edit` the owner can: upload an image (lands in the `trips`
      bucket at `${tripId}/${uuid}.${ext}`), write/edit its caption, reorder scenes
      via up/down, delete a scene, toggle public, and delete the trip.
- [ ] `/trips/[id]` renders scenes in `position` order as a slideshow: one image +
      caption at a time, with prev/next and a filmstrip; wraps or stops cleanly at ends.
- [ ] An unauthenticated request to `/trips/[id]` succeeds (renders the slideshow)
      when the trip is public, and 404s when it is private or missing.
- [ ] Middleware lets unauthenticated GETs reach `/trips/[id]` **only**; `/trips`,
      `/trips/[id]/edit`, and all `/api/trips/*` mutations still require a session.
- [ ] A private trip the owner just created is NOT viewable in a logged-out browser.
- [ ] The UI reads as Treasure Parchment (tan `#e6d2a4` surface, wax `SHARED` stamp
      for public, dashed/muted for private) and uses Paper Ledger type families.

## Constraints / Notes
- **Auth invariant exception (logged).** `middleware.ts` centralizes auth and routes
  do not re-check. Phase 1 carves the *one* allowed hole: unauthenticated read of
  `/trips/[id]`. The page server-component enforces public-or-owner and 404s otherwise
  — that check is the access control, not the absence of it. All mutations stay authed.
- **Storage / images** — already decided (DECISION_LOG 2026-06-24): single **public**
  Supabase Storage bucket `trips`, plain public URLs, uploads via the service-role key
  in `lib/trips.ts`, objects at `${tripId}/${uuid}.${ext}`. `public`/`private` is trip
  metadata, **not** CDN secrecy — private images sit in the same bucket behind
  unguessable UUID paths. Fine for a personal journal + a public viewer of *public*
  trips; revisit with signed URLs only if real secrecy is ever needed.
- **Rendering** — plain `<img>` (no `next/image` remote-pattern config); reorder is
  up/down swap (no DnD lib). Both per DECISION_LOG 2026-06-24.
- **No money** — the integer-VND invariant doesn't apply here; trips have no amounts.
- **Migrations** — bucket migration already named `010_trips_bucket.sql` in the log;
  tables go in a new `008_trips.sql` (or next free number) — `/plan` finalizes.
- **Treasure Parchment is new territory** vs the live ink-on-cream ledger. Lift the
  shared fonts (Crimson Pro, Courier Prime, Patrick Hand/Caveat, Archivo Black) and the
  PRINTED/WRITTEN discipline; the tan surface + wax seals are Phase-1-local additions,
  not a global token change. Check font choices against `docs/DESIGN_SYSTEM.md` first.
