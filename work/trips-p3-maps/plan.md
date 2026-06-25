# trips-p3-maps — Plan

## Files to change
| Action | File | What |
|--------|------|------|
| Create | `supabase/migrations/012_trip_route.sql` | `ALTER TABLE trips ADD COLUMN route JSONB` (nullable; decimated `{x,y}[]`) — one statement |
| Create | `supabase/migrations/013_scene_map.sql` | `ALTER TABLE scenes ADD COLUMN map_x DOUBLE PRECISION, ADD COLUMN map_y DOUBLE PRECISION` — one statement |
| Modify | `lib/trips.ts` | `Trip` gains `route: Pt[] \| null`; `Scene` gains `map_x/map_y: number \| null`; add `updateSceneMap(id, x, y)` (scoped via existing `sceneOwner` gate in route). `getTrip`/`listTrips` selects already `*`. |
| Modify | `lib/trips-carto.ts` | Add `parseGpx(xml): Pt[]` — regex `<trkpt lat lon>`, `x=lon`, `y=-lat`, finite-only. One assert self-check. |
| Modify | `app/api/trips/scenes/route.ts` | PATCH: accept `{ id, map_x, map_y }` mode (both numbers in `[0,1]` **or** both `null`), gate via `sceneOwner`, call `updateSceneMap`. |
| Create | `app/api/trips/gpx/route.ts` | `POST` (multipart `tripId`+`file`) parse→`normalize`→`decimate(120)`→validate→`updateTrip(route)`; `DELETE` (`{tripId}`) → `route:null`. Both gated by `tripOwner`. |
| Modify | `middleware.ts` | Widen public GET hole to also match `^/trips/[^/]+/play$` (keep `/trips/atlas` excluded; `/edit` stays private). |
| Modify | `app/trips/[id]/page.tsx` | Becomes the **map cover**. Same gating; pass `trip`, `scenes`, `isOwner` to `<TripMap>`. |
| Create | `app/trips/[id]/_trip-map.tsx` | Client: parchment sheet (mirrors spike cover) — `Foxing` + `HandPath variant="route"` + `WaxSeal` seals at `map_x/y%` + `Cartouche` + `CompassRose`. Owner: tray + GPX upload + remove-route + pointer drag (5px threshold, place/move/unplace). Seal click → `/trips/[id]/play?scene=<pos>`. |
| Create | `app/trips/[id]/play/page.tsx` | The old viewer logic: `getTrip` + gating + build slides; read `searchParams.scene` → `initial` index; render `<Slideshow>`. |
| Move | `app/trips/[id]/_slideshow.tsx` → `app/trips/[id]/play/_slideshow.tsx` | Add `initial?: number` prop (start index); otherwise unchanged. |

## Approach & trade-offs

**Wiring, not net-new art.** Every primitive exists. The cover composes exactly the spike's
`/spikes/trips` "Trip-map cover" stack (back→front): parchment bg → `Foxing` → `HandPath route` →
`WaxSeal` seals → `Cartouche` → `CompassRose`. The drag/click/place/unplace mechanic is copied
verbatim from `app/trips/atlas/_atlas-board.tsx` (5px `DRAG_THRESHOLD`, rect→fraction math,
optimistic state, drop-outside = unplace). Only the persist target differs: seal placement →
`PATCH /api/trips/scenes {id,map_x,map_y}` instead of `/api/trips {atlas_x,atlas_y}`.

**Route move.** `/trips/[id]` is now the cover; the slideshow moves to `/trips/[id]/play`. No mass
link rewrite: cards (`TripCard`) and Atlas markers already point at `/trips/[id]` — landing on the
map cover is the *desired* new front door. The slideshow is reached from the cover (seal click, or a
"play from start" link). Middleware grows one clause so a public trip's `/play` is reachable signed
out.

**GPX endpoint.** New `/api/trips/gpx` (multipart) rather than the spec's literal `/api/trips/route`
suggestion — a `route/` folder next to `app/api/trips/route.ts` reads as a footgun. Same auth plumbing
(middleware gates `/api/trips/*`; handler gates by `tripOwner`), no parallel auth. Route stored
**decimated** (~120 normalized `{x,y}`) as JSONB on `trips.route`. `// ponytail: regex trkpt scan;
swap to an XML parser only if a real export breaks it.`

**Coords are floats** (integer invariant is money-only). Scene placement reuses the both-or-null
validation already in `PATCH /api/trips`.

**Deliberately skipped:** terrain-glyph *placement* UI (Phase 4 — cover may scatter a fixed glyph or
two, no user control); `WaxSeal state="broken"` (no visit-tracking yet — all seals ship `sealed`);
fog-of-war, public Atlas, route editing, multi-route (all out per spec). Orphaned-blob cleanup
unchanged from P1. The red "you are here" accent: ship at most one (first scene), rationed — add only
if the cover feels flat without it.

## TODO
- [x] `012_trip_route.sql` written — **apply BLOCKED** (auto-mode denied the live ALTER; user must run `npm run db:migrate -- supabase/migrations/012_trip_route.sql`)
- [x] `013_scene_map.sql` written — **apply BLOCKED** (same; run `npm run db:migrate -- supabase/migrations/013_scene_map.sql`)
- [x] `lib/trips.ts`: `Trip.route: Pt[]|null`, `Scene.map_x/map_y: number|null`, `updateSceneMap(id,x,y)`
- [x] `lib/trips-carto.ts`: `parseGpx` (x=lon, y=-lat, finite-only) + assert self-check (`node lib/trips-carto.ts`, `import.meta.main`-guarded)
- [x] `app/api/trips/scenes/route.ts` PATCH: `{id,map_x,map_y}` mode — both in `[0,1]` or both null, else 400; `sceneOwner` gate; `updateSceneMap`
- [x] `app/api/trips/gpx/route.ts`: POST multipart parse→normalize→decimate(120)→validate finite `{x,y}∈[0,1]`→`updateTrip(route)`; DELETE → null; `tripOwner` gate
- [x] `middleware.ts`: add `|| /^\/trips\/[^/]+\/play$/.test(pathname)` to the public GET hole
- [x] Move `_slideshow.tsx` into `play/`, add `initial?: number` (default 0) → `useState(initial)`
- [x] `app/trips/[id]/play/page.tsx`: getTrip + gating (notFound unless public/owner) + slides; `searchParams.scene` → index in `scenes` by `position`; pass `initial`
- [x] `app/trips/[id]/page.tsx`: gating unchanged; render `<TripMap trip scenes isOwner>`; "Edit ✎" (owner) + "Play ▸" link to `/play`
- [x] `app/trips/[id]/_trip-map.tsx`: compose cover (Foxing/HandPath route/WaxSeal/Cartouche/CompassRose); placed seals at `left/top %`, glyph=position; owner tray + GPX upload + remove-route; pointer drag (5px threshold) place/move/unplace → `PATCH /api/trips/scenes`; seal *click* → `router.push(/trips/${id}/play?scene=${pos})`; non-owner = links only
- [ ] verify AC1: `/trips/[id]` shows the map cover; `/trips/[id]/play` runs the slideshow (P1 prev/next/filmstrip intact)
- [ ] verify AC2: signed-out/non-owner can load a public trip's `/trips/[id]` map; private 404s (browser, `/verify`)
- [x] verify AC3: `information_schema` — `trips.route` jsonb nullable, `scenes.map_x/map_y` double precision nullable ✓
- [ ] verify AC4: upload `.gpx` → route renders + persists on reload; re-upload replaces; remove-route → `route` null
- [ ] verify AC5: feed a real multi-thousand-`<trkpt>` file → ~120 points, switchbacks visible in the inked line
- [ ] verify AC6: unplaced scene in tray only; placed scene on map only (not both)
- [ ] verify AC7: drag tray→map places; drag placed seal moves; drag off→tray unplaces; all persist on reload
- [ ] verify AC8: click (not drag) a seal → `/trips/[id]/play?scene=<pos>` opens on that scene
- [ ] verify AC9: route-less trip with placed seals renders a complete, good map
- [ ] verify AC10: Cartouche shows title · date · "N scenes"; CompassRose present; seals stay correct on container resize (% positions)
- [ ] verify AC11: non-owner/signed-out cover shows no upload/tray/drag affordances
- [ ] verify AC12: matches Cartographer's Hand (`docs/trips-design-system.md`); none of the banned defaults (vignette, dotted-red route, X-marks-spot, glossy wax, GPS pins) — `pnpm lint` + `pnpm build` green
