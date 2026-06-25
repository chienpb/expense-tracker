# Trips — technical reference

The Trips feature: a trip is a sequence of **scenes** (image + caption), shown
as a slideshow, placed on a per-trip parchment **map**, and pinned on a world
**Atlas**. This folder is the technical reference — start here, then open the
doc whose trigger matches your task.

| Doc | Open when |
|---|---|
| [`data-model.md`](data-model.md) | Touching the schema, a migration, a query, storage, or coordinate math (`lib/trips.ts`, `lib/trips-carto.ts`). |
| [`api.md`](api.md) | Touching any `app/api/trips/*` route — endpoint contracts, auth, ownership gating. |
| [`ui.md`](ui.md) | Touching a page or component under `app/trips/` — the component map and the drag interaction. |

Related, not duplicated here:
- [`../trips-design-system.md`](../trips-design-system.md) — the "Cartographer's Hand" visual spec (tokens, filters, voice). Read before any visual change.
- [`../../work/trips/VISION.md`](../../work/trips/VISION.md) + [`ROADMAP.md`](../../work/trips/ROADMAP.md) — the product vision and phase plan (what to build next).
- [`../DECISION_LOG.md`](../DECISION_LOG.md) — every trips trade-off, dated, searchable.

## The shape in one screen

```
trips (008,011,012)            scenes (009,013)
  id, user_id, title, date       id, trip_id, image(path), caption, position
  public                         map_x, map_y   ── trip-map placement [0,1]|null
  atlas_x, atlas_y  ── world     created_at
  route (jsonb ~120 pts)
  created_at                   storage: public bucket `trips` (010)

app/trips/
  page.tsx ............. /trips         list + create
  [id]/page.tsx ........ /trips/[id]    trip-map cover  → TripMap
  [id]/play ............ slideshow
  [id]/edit ............ owner editor
  atlas ................ /trips/atlas   world map (public/trips-atlas.svg)
  _components/carto/ ... hand-drawn primitives (Sea, Island, WaxSeal, ...)

app/api/trips/
  route.ts ............. trip CRUD
  scenes/route.ts ...... scene upload / caption / reorder / placement
  gpx/route.ts ......... route upload (GPX → normalize → decimate)
```

## Three things to know before you change anything

1. **Auth is in `middleware.ts`, not the handlers.** Routes only *read* the
   user id and scope writes by it. `/trips/[id]` (GET) is publicly viewable
   when `public`; `/trips/atlas` and `/edit` are owner-only.
2. **Everything spatial is normalized `[0,1]`**, both-or-null. Pixels never hit
   the DB. The integers-are-money invariant does **not** apply to coords.
3. **The Atlas map is one swappable file** (`public/trips-atlas.svg`); seals
   float on top as fraction overlays. Maps and markers are decoupled.

## Current status

Phases 1–3 shipped (scenes, Atlas, trip maps + GPX routes). **Phase 4** (fog-of-war
reveal, deeper asset library) is next and optional — see the roadmap.
