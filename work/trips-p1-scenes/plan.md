# trips-p1-scenes — Plan

## Files to change
| Action | File | What |
|--------|------|------|
| Create | `supabase/migrations/008_trips.sql` | `trips` table (one statement) |
| Create | `supabase/migrations/009_scenes.sql` | `scenes` table + FK CASCADE (one statement) |
| Create | `supabase/migrations/010_trips_bucket.sql` | `insert into storage.buckets … public=true` (one statement, `on conflict do nothing`) |
| Create | `lib/trips.ts` | All data access (service-role) + storage upload/URL helpers, every query scoped by `user_id` |
| Modify | `middleware.ts` | Carve the one hole: `GET /trips/[id]` only is public |
| Create | `app/trips/_components/Parchment.tsx` | Phase-1-local tan surface wrapper (server) — fonts inherited, no global token change |
| Create | `app/trips/_components/TripCard.tsx` | One list card (server) — title, date, SHARED stamp / private mark |
| Create | `app/trips/page.tsx` | Owner's trips list (newest first) + new-trip form mount (server, authed) |
| Create | `app/trips/_components/NewTripForm.tsx` | Client: title / `<input type=date>` / public checkbox → `POST /api/trips` |
| Create | `app/trips/[id]/page.tsx` | Viewer (server). Loads trip+scenes; `notFound()` unless public-or-owner |
| Create | `app/trips/[id]/_slideshow.tsx` | Client: image+caption, prev/next, filmstrip |
| Create | `app/trips/[id]/edit/page.tsx` | Editor shell (server, owner-only else `notFound()`) |
| Create | `app/trips/[id]/edit/_editor.tsx` | Client: upload, caption edit, up/down swap, delete scene, toggle public, delete trip |
| Create | `app/api/trips/route.ts` | `POST`/`PATCH`/`DELETE` a trip (mutations, session-scoped by `user_id`) |
| Create | `app/api/trips/scenes/route.ts` | `POST` (multipart upload+insert) / `PATCH` (caption or `{swap:[a,b]}`) / `DELETE` a scene |

## Approach & trade-offs
Everything decided in DECISION_LOG 2026-06-24 is taken as given: single **public**
bucket `trips`, plain `<img>`, up/down swap (no DnD), public viewer hole in
`middleware.ts`. No new decision-log entry needed — those two entries already cover
storage + the auth hole.

**Auth.** Middleware stays the only auth gate. The hole is exactly
`req.method === 'GET' && /^\/trips\/[^/]+$/.test(pathname)` — matches `/trips/abc`
but not `/trips` (list, one segment) nor `/trips/abc/edit` (three segments) nor any
`/api/trips/*`. The viewer page is the access control: load trip, `notFound()` unless
`trip.public` or `session.user.id === trip.user_id`. Mutation handlers scope every
write by `user_id` (verify `trip.user_id === session.user.id`) — that's tenant
scoping per `database.md`, **not** an auth re-check, so the invariant holds.

**Storage.** `scenes.image` stores the object **path** (`${tripId}/${uuid}.${ext}`),
not the full URL; `lib/trips.ts` exposes `sceneImageUrl(path)` via
`supabase.storage.from('trips').getPublicUrl()`. Path is stable if the bucket ever
moves. Upload runs through the service-role client in `lib/trips.ts`.

**UI.** Don't reuse `<Page>` — it's the ruled ink-on-cream ledger, wrong surface. A
tiny local `<Parchment>` wrapper paints the tan `#e6d2a4` field with arbitrary
Tailwind values and inherits the five fonts already loaded on `<html>`. Reuse
existing `<Stamp text="SHARED" color="gold">` for public; dashed muted text for
private. Mutations go through `/api/trips/*` (sanctioned by middleware), not server
actions.

**Mutations are plain `fetch` + `router.refresh()`**, mirroring `<QuickAdd>`. Reorder
sends `{swap:[idA,idB]}`; the handler reads both rows and swaps their `position` (two
UPDATEs) so the client never tracks positions.

**Deliberately skipped:** orphaned storage objects on trip/scene delete (rows cascade,
blobs leak — acceptable for a personal journal; add a storage-remove call if it
matters). Slideshow **stops** at the ends (prev/next disabled), no wrap — simpler,
spec allows either. No signed URLs, no `next/image`, no maps/Atlas (Phases 2–4).

## TODO
- [x] `008_trips.sql`: `trips(id uuid pk default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade, title text not null, date date not null, public boolean not null default false, created_at timestamptz default now())`
- [x] `009_scenes.sql`: `scenes(id uuid pk default gen_random_uuid(), trip_id uuid not null references trips(id) on delete cascade, image text not null, caption text, position int not null, created_at timestamptz default now())`
- [x] `010_trips_bucket.sql`: `insert into storage.buckets (id, name, public) values ('trips','trips',true) on conflict (id) do nothing`
- [x] Run all three via `node --env-file=.env.local scripts/migrate.mjs <file>` (one per invocation — `pnpm db:migrate --` forwards `--` literally; call node directly)
- [x] `lib/trips.ts`: `listTrips(userId)`, `getTrip(id)` (trip + scenes ordered by `position`), `createTrip`, `updateTrip`, `deleteTrip`, `addScene` (position = max+1), `updateSceneCaption`, `swapScenes(a,b)`, `deleteScene`, `uploadSceneImage(tripId, file)`, `sceneImageUrl(path)`
- [x] `middleware.ts`: add public-route check for `GET /trips/[id]` (regex above), before the catch-all session redirect
- [x] `<Parchment>` wrapper + `<TripCard>` + viewer + slideshow + editor + new-trip form per Files table
- [x] `app/api/trips/route.ts` + `app/api/trips/scenes/route.ts`, every handler scoping by session `user_id`
- [ ] verify (migration): tables + bucket exist; FK CASCADE confirmed (`delete trip` removes its scenes)
- [ ] verify (`/trips` list): logged-in, shows only own trips newest-first; logged-out → redirect to `/login`
- [ ] verify (create): new trip with title + date + public toggle appears in the list
- [ ] verify (edit): upload lands at `${tripId}/${uuid}.${ext}` in bucket; caption edit, up/down reorder, delete scene, toggle public, delete trip all work; non-owner / logged-out hitting `/edit` → `notFound()`
- [ ] verify (viewer): scenes render in `position` order; prev/next + filmstrip navigate; stops cleanly at ends
- [ ] verify (public access): logged-out `GET /trips/[id]` renders when `public`, 404s when private or missing
- [ ] verify (private guard): a just-created private trip is NOT viewable in a logged-out browser
- [ ] verify (style): tan `#e6d2a4` surface, gold SHARED stamp for public / dashed-muted for private, Paper Ledger fonts
```
