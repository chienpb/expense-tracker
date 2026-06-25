# Trips — Data model & data access

Schema, types, storage, and the `lib/trips.ts` / `lib/trips-carto.ts` access layer.
Read this before any migration, query, or coordinate-math change.

## Tables

Two tables, both cascade-deleted from their parent. Migrations `008`–`013`.

### `trips` (`008_trips`, `011_atlas`, `012_trip_route`)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `user_id` | UUID | FK → `users(id)` `ON DELETE CASCADE`. Tenant key — every query scopes by it. |
| `title` | TEXT | required |
| `date` | DATE | the trip date, `YYYY-MM-DD` |
| `public` | BOOLEAN | default `false`. Trip metadata, **not** CDN secrecy (images live in a public bucket). |
| `atlas_x`, `atlas_y` | DOUBLE PRECISION, nullable | Atlas placement — normalized `[0,1]` fractions of the world map. Both set or both `null` (= unplaced, in the tray). |
| `route` | JSONB, nullable | Decimated GPX route — array of ~120 `{x,y}` normalized `[0,1]` points, projected by its own bounding box (never real geography). `null` = no route. |
| `created_at` | TIMESTAMPTZ | default `now()`; list order is newest-first. |

### `scenes` (`009_scenes`, `013_scene_map`)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `trip_id` | UUID | FK → `trips(id)` `ON DELETE CASCADE` |
| `image` | TEXT | storage **object path** `${tripId}/${uuid}.${ext}` — never a full URL |
| `caption` | TEXT, nullable | |
| `position` | INTEGER | slideshow order; `addScene` appends at `max+1` |
| `map_x`, `map_y` | DOUBLE PRECISION, nullable | Trip-map placement — same `[0,1]` both-or-null rule as `atlas_x/y`. `null` = in the tray. |
| `created_at` | TIMESTAMPTZ | default `now()` |

## Storage

One **public** bucket `trips` (`010_trips_bucket`). `scenes.image` stores the
object path; `sceneImageUrl(path)` resolves the public CDN URL at render time,
so the path survives a bucket move. Uploads go to `${tripId}/${uuid}.${ext}`.

## Two invariants specific to trips

1. **Coordinates are normalized `[0,1]`, not pixels.** `atlas_x/y`, `map_x/y`,
   and every point in `route` are fractions of the asset's intrinsic size.
   The map art can be re-sized or re-drawn without moving anything. Components
   map `0–1` → viewBox/percent at render time.
2. **Placement coords are floats by design.** The repo-wide "amounts are
   integers" invariant is **money-only**. Map fractions stay floating point.

`atlas_x/y` and `map_x/y` are always written as a pair: two finite numbers in
`[0,1]` (placed) or both `null` (unplaced). The API enforces this; see
[`api.md`](api.md).

## `lib/trips.ts` — data access

Service-role client (no RLS). Every user-specific query is scoped by `user_id`
**here** — this is tenant scoping, not an auth re-check (auth lives in
`middleware.ts`). See [`../auth.md`](../auth.md) and [`../database.md`](../database.md).

| Function | Purpose |
|---|---|
| `listTrips(userId)` | User's trips, newest-first. |
| `getTrip(id)` | `{ trip, scenes[] }` (scenes in `position` order) or `null`. **Not** user-scoped — callers gate visibility (public, or owner). |
| `createTrip({userId,title,date,public})` | Insert, returns the row. |
| `updateTrip(id, userId, patch)` | Scoped UPDATE (`title`/`date`/`public`/`atlas_x`/`atlas_y`/`route`). Returns the row or `null` if not owned. |
| `deleteTrip(id, userId)` | Scoped delete (cascades to scenes). |
| `addScene(tripId, image, caption)` | Append at `position = max+1`. |
| `updateSceneCaption(id, caption)` | Caption write — caller pre-gates with `sceneOwner`. |
| `updateSceneMap(id, x, y)` | Trip-map placement — caller pre-gates with `sceneOwner`. |
| `swapScenes(a, b)` | Swap two scenes' `position` (two UPDATEs). Reorder primitive. |
| `deleteScene(id)` | Delete one scene. |
| `uploadSceneImage(tripId, file)` | Upload to the bucket, return the object path. |
| `sceneImageUrl(path)` | Path → public CDN URL. |
| `tripOwner(id)` / `sceneOwner(sceneId)` | Owner `user_id` (or `null`). The ownership gate used by the scene/gpx routes, which can't scope by `user_id` directly. |

**Ownership gating:** trip writes scope by `user_id` in the SQL. Scene/route
writes can't (the body carries a scene/trip id, not the owner), so the route
handler calls `sceneOwner`/`tripOwner` first and 404s on mismatch.

## `lib/trips-carto.ts` — coordinate math

Pure helpers, no I/O. The GPX → route pipeline is `parseGpx → normalize →
decimate`.

| Function | Purpose |
|---|---|
| `parseGpx(xml)` | Regex-scan `<trkpt lat lon>` → raw points, `x=lon`, `y=-lat` (SVG y grows down). Drops malformed/non-finite points. |
| `normalize(points)` | Scale to `[0,1]` by the points' own bounding box. |
| `decimate(points, target=120)` | Even-stride reduction to ~`target` points. |
| `toPath(points, size=100)` | Normalized points → SVG path `d` in a `size`×`size` viewBox. |

Known ceilings (`ponytail:` comments in source):
- `parseGpx` is a regex scan, not an XML parser — fine until a real export breaks it.
- `decimate` is even-stride, not Douglas–Peucker — swap to DP if a route ever loses a meaningful switchback.

Self-check: `node lib/trips-carto.ts` runs the `import.meta.main` asserts (Node strips the types; dead when bundled by Next).
