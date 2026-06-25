# Trips — API

Three route files under `app/api/trips/`. Read this before touching any trips
endpoint. For the app-wide API/auth contract see [`../api.md`](../api.md) and
[`../auth.md`](../auth.md).

## Auth & ownership (applies to all routes)

- Auth is the **session cookie**, enforced in `middleware.ts`. Handlers do
  **not** re-check auth — they only *read* the user id via `auth()` and scope
  every write to it.
- `userId()` (local to each file) returns `session.user.id` or `null` → `401`.
- Trip writes scope by `user_id` in SQL. Scene/route writes pre-gate with
  `sceneOwner`/`tripOwner` and return **`404` (not 403)** on someone else's
  resource — existence is not leaked.
- Placement coords (`atlas_x/y`, `map_x/y`) follow a **both-or-null** rule:
  two finite numbers in `[0,1]`, or both `null`. Anything else → `400`.

---

## `/api/trips` — trip CRUD

### `POST` — create
Body (JSON): `{ title, date, public? }`
- `title` required (trimmed) → `400` if empty.
- `date` must match `^\d{4}-\d{2}-\d{2}$` → `400` otherwise.
- `public` is `true` only if strictly `=== true`.
- → `201` with the trip row.

### `PATCH` — update
Body (JSON): `{ id, ...patch }`, `id` required → `400` if missing.
Optional fields, each applied only if present and well-typed:
- `title` (string, trimmed), `date` (string, trimmed), `public` (boolean)
- `atlas_x` + `atlas_y` — both-or-null in `[0,1]`, else `400`.
- → the updated row, or `404` if not owned/found.

> `route` is **not** settable here — it goes through `/api/trips/gpx`.

### `DELETE`
Body (JSON): `{ id }` → `{ ok: true }`. Scoped by owner; cascades to scenes.

---

## `/api/trips/scenes` — scene CRUD

### `POST` — upload + insert (multipart)
Form: `{ tripId, image: File, caption? }`
- `tripId` required → `400`. `image` must be a non-empty `File` → `400`.
- `tripOwner(tripId) !== uid` → `404`.
- Uploads to the bucket, inserts at `position = max+1`.
- → `201` with the scene row.

### `PATCH` — caption / placement / reorder (JSON)
One of three shapes, dispatched in this order:
1. `{ swap: [idA, idB] }` — swap two scenes' positions (reorder). Both must be
   owned → else `404`. → `{ ok: true }`.
2. `{ id, map_x, map_y }` — trip-map placement, both-or-null in `[0,1]`. → `{ ok: true }`.
3. `{ id, caption }` — set/clear caption (empty string → `null`). → `{ ok: true }`.

`id` required for 2/3; `sceneOwner(id) !== uid` → `404`.

### `DELETE`
Body (JSON): `{ id }`. Owner-gated → `404` otherwise. → `{ ok: true }`.

---

## `/api/trips/gpx` — the trip's route

The route is decoration projected by its own bounding box, never geography
(Trips DS — fantasy over fidelity).

### `POST` — upload (multipart)
Form: `{ tripId, file: .gpx }`
- `tripId` required → `400`. `file` must be a non-empty `File` → `400`.
- `tripOwner(tripId) !== uid` → `404`.
- Pipeline: `parseGpx → normalize → decimate(120)`. Result must have ≥2 points,
  all finite and in `[0,1]`, else → `400` "No usable track found".
- Re-upload **replaces** the route. → `{ route }`.

### `DELETE`
Body (JSON): `{ tripId }`. Owner-gated. Sets `route = null`. → `{ ok: true }`.

---

## Status code summary

| Code | When |
|---|---|
| `200` | PATCH/DELETE success (or POST gpx). |
| `201` | Trip or scene created. |
| `400` | Missing/invalid input (bad date, empty title, bad coords, no track). |
| `401` | No session. |
| `404` | Resource missing **or** not owned by the caller. |
