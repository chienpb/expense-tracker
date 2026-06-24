# trips-p2-atlas — Plan

## Files to change
| Action | File | What |
|--------|------|------|
| Create | `supabase/migrations/011_atlas.sql` | `ALTER TABLE trips ADD COLUMN atlas_x/atlas_y` (nullable float) — one statement |
| Modify | `lib/trips.ts` | `Trip` type gains `atlas_x/atlas_y: number \| null`; `updateTrip` patch accepts them |
| Modify | `app/api/trips/route.ts` | PATCH accepts `atlas_x/atlas_y` (both numbers in `[0,1]` **or** both `null`); validate |
| Modify | `middleware.ts` | Exclude `/trips/atlas` from the GET public-viewer hole so it requires a session |
| Create | `app/trips/atlas/page.tsx` | Owner-only server component: `auth()` → `listTrips` → split placed/tray → `<AtlasBoard>` |
| Create | `app/trips/atlas/_atlas-board.tsx` | Client: Sea ground + base SVG + `<WaxSeal>` markers + tray + pointer drag/click + PATCH |
| Create | `public/trips-atlas.svg` | The base map — single self-contained SVG, drawn by a delegated Opus agent |
| Modify | `app/trips/page.tsx` | Add entry link to `/trips/atlas` via `<Parchment action>` |

## Approach & trade-offs

**Reuse, don't invent.** Markers are the existing `<WaxSeal>` (color `gold` — `--trips-red` stays
rationed for "you are here"). Ground is the existing `<Sea>`. Title plate is `<Cartouche>`. Drag
math uses the existing `[0,1]` convention already baked into `lib/trips-carto.ts` and the
`atlas_x/atlas_y` storage decision. No new endpoint — extend the existing `PATCH /api/trips`
(spec §Constraints). No new dependency.

**One SVG asset, not composed primitives.** The spec is explicit: the base map is *one committed,
self-contained SVG* (no external fonts/refs, so it renders identically SSR/client and the map can
be re-arted without moving markers). So `<Island>`/`<CompassRose>` inform the *look the agent
matches*, but the shipped terrain is a static `public/trips-atlas.svg`. Title text needs fonts, so
the cartouche stays a React overlay; the SVG carries only terrain (sea wash, coastlines, islands,
an off-center compass, asymmetric foxing). Rendered as a plain `<img>` filling an aspect-locked
container — markers overlay as `%`-positioned siblings, so fractions stay correct on resize.

**Pointer events, not HTML5 DnD, not a library.** One `pointerdown/move/up` handler with a ~5px
drag threshold disambiguates click (navigate) from drag (place/move). Drop *inside* the map rect →
PATCH `atlas_x/atlas_y` (fraction of rect); drop *outside* (over the tray) → PATCH `null,null`
(unplace, returns to tray). The tray being outside the map *is* the "remove affordance" — no
separate button. Optimistic local state moves the trip between tray and map.

**Auth.** `/trips/atlas` happens to match the middleware GET-hole regex `^/trips/[^/]+$` (meant for
the public per-trip viewer). Exclude it explicitly so an unauthenticated GET redirects to `/login`
— keeps the owner-only invariant in `middleware.ts`, not in the page.

**Deliberately skipped:** `<WaxSeal state="broken">` (needs a "visited" signal we don't track —
all markers ship `sealed`; add when visit-tracking exists). Fog-of-war, public Atlas, GPX routes
(all out per spec). Touch-drag is covered free by pointer events; no extra touch handling.

## TODO
- [x] `011_atlas.sql`: written + applied via `pnpm db:migrate supabase/migrations/011_atlas.sql` (note: pnpm, no `--` separator).
- [x] `lib/trips.ts`: add `atlas_x/atlas_y: number | null` to `Trip`; widen `updateTrip` patch `Pick` to include them
- [x] `app/api/trips/route.ts` PATCH: accept `atlas_x/atlas_y`. Valid = both finite numbers in `[0,1]`, or both `null`. Reject mismatched/out-of-range with 400. Pass through to `updateTrip`.
- [x] `middleware.ts`: change the GET hole to also require `pathname !== '/trips/atlas'`
- [x] `app/trips/atlas/page.tsx`: `auth()` → redirect `/login` if no session; `listTrips(uid)`; pass trips to `<AtlasBoard>`. `metadata.title = 'Atlas'`.
- [x] `app/trips/atlas/_atlas-board.tsx`: aspect-locked relative container; `<Sea>` + `<img src="/trips-atlas.svg" alt="">` fill; placed trips → `<WaxSeal color="gold">` at `left/top %` with hover/label of title; unplaced → tray list of draggable seals; `<Cartouche title="The Atlas">` overlay; pointer drag + threshold; on drop call `PATCH /api/trips` and update local state.
- [x] `public/trips-atlas.svg`: drawn by an Opus subagent (6 render-and-critique passes), 11 KB, self-contained (no external fonts/refs/script, viewBox `0 0 1600 1000`), correct palette, off-center compass at ~(1400,810). CAVEAT: coastlines read as uniform puffy scallops ("cloud blobs") — passes literal AC8 (not a placeholder rectangle) but the stricter anti-slop covenant wants more varied, hand-inked coasts. Flagged to owner for a possible redraw pass. Brief: write a self-contained SVG fantasy world map (fixed viewBox e.g. `0 0 1600 1000`), matching `docs/trips-design-system.md` §1 anti-slop covenant + §2 palette (hardcode the `--trips-*` hex; no external refs/fonts, bake or omit filters); render + screenshot it in a loop until it reads as a believable hand-drawn fantasy world, not a placeholder. Agent confirms via its own screenshots.
- [x] `app/trips/page.tsx`: add `<Link href="/trips/atlas">` in the `<Parchment action>` slot, styled like the existing parchment chrome
- [x] verify AC2: `atlas_x`/`atlas_y` confirmed `double precision`, nullable (information_schema query).
- [ ] verify AC1, AC3–AC7: need the dev server + live drag (browser). Migration is now applied, so run `/verify`. Code paths are in place.
- [x] verify AC8: `public/trips-atlas.svg` committed, self-contained, viewBox `0 0 1600 1000`; agent did 6 screenshot passes. Not a placeholder rectangle. (See coastline caveat above.)
- [x] verify AC9: gold markers (not red), `<Sea>` ground, `<Cartouche title="The Atlas">`, red rationed. `pnpm lint` — 0 errors in changed files; `pnpm build` green. SVG coastline read flagged as the one soft anti-slop concern.
