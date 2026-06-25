# trips-atlas-home — Plan

## Files to change
| Action | File | What |
|--------|------|------|
| Move+Modify | `app/trips/atlas/_atlas-board.tsx` → `app/trips/_atlas-board.tsx` | Becomes the Trips home client component. Full-screen layout, view-by-default, edit-mode gate, corner popover (unplaced trips + `NewTripForm`). Fix carto imports (`../` → `./`). |
| Modify | `app/trips/page.tsx` | Server: `auth()` + `listTrips`, render `<AtlasBoard trips={trips} />`. Drop `Parchment`/`TripCard`/`NewTripForm`/"Open the Atlas" link. Keep `metadata.title = 'Atlas'` (or 'Trips'). |
| Delete | `app/trips/atlas/page.tsx` + dir | Route removed; replaced by config redirect. |
| Delete | `app/trips/_components/TripCard.tsx` | Only the old card list used it. |
| Modify | `next.config.ts` | Add `redirects()` → `/trips/atlas` → `/trips` (permanent). |

Keep: `NewTripForm.tsx` (reused in popover), `Parchment.tsx` (still used by edit/play pages).

## Approach & trade-offs
The atlas board already *is* the feature; this is mostly relocation + a view/edit
gate copied verbatim from the trip-map (`edd2a65`): an `editing` state, draggable
`<button>` seals when editing, plain `<Link href={/trips/[id]}>` seals when not.
Page gates owner-only already, so no `isOwner` prop needed.

**Full-screen:** drop `max-w-6xl` + `aspectRatio 16/10` + `lg:flex-row`. Outer
`h-dvh w-full` with thin frame padding; mapRef fills it (`absolute inset-0`,
`border-2 border-[var(--trips-frame)]`). Stays responsive (no fixed box).

**Tray → popover:** the tray moves into a corner element rendered only in edit
mode, holding the unplaced-trips list + `NewTripForm`. `NewTripForm`'s existing
`router.refresh()` re-runs the server page → new trip shows as an unplaced seal,
no navigation away. Reused as-is (its `#7a5c33` palette already reads as frame ink).

**One genuinely new bit:** the old un-place test was "drop outside the map rect" —
trivially true when the tray sat *beside* the map. Now the map is full-screen, so
off-map is a sliver. Add a `popoverRef` and treat a drop inside its rect as
un-place (the popover *is* the un-place affordance, mirroring "the tray IS the
un-place affordance"). Otherwise: inside `[0,1]` → place, else → un-place.

**Redirect** via `next.config.ts` (native, 308) rather than a stub page — lets us
delete the `atlas/` route entirely.

Skipped: no CompassRose on the atlas (wasn't there, out of scope); no search/filter
(card list is gone, not relocated); no API/data-model/auth changes.

## TODO
- [x] Move `_atlas-board.tsx` to `app/trips/`, fix carto import paths (`../_components` → `./_components`).
- [x] Add `editing` state + `canEdit`; an Edit ✎ toggle in a corner (mirror trip-map's `data-on` toggle button).
- [x] View mode: placed seals render as `<Link href={/trips/${t.id}}>`; no pointer handlers, no popover. Edit mode: draggable `<button>` seals (existing 5px handler).
- [x] Gate container `onPointerMove`/`onPointerUp` behind `canEdit` (as trip-map does).
- [x] Replace `<aside>` tray with a corner popover (`popoverRef`) rendered only when `canEdit`: unplaced-trips list + `<NewTripForm />`.
- [x] In `onPointerUp`: if drop point ∈ `popoverRef` rect → `persist(null,null)`; else fraction inside `[0,1]` → place, outside → `persist(null,null)`.
- [x] Full-screen layout: drop `max-w-6xl`/`aspectRatio`/`lg:flex-row`; `h-dvh` frame + map fills it; keep mobile usable. Keep single `<Cartouche>`.
- [x] Rewrite `app/trips/page.tsx` to render `<AtlasBoard>`; remove `Parchment`/`TripCard`/`NewTripForm`/Atlas link imports.
- [x] Delete `app/trips/atlas/page.tsx` (+ dir) and `app/trips/_components/TripCard.tsx`.
- [x] Add `redirects()` to `next.config.ts`: `/trips/atlas` → `/trips`.
- [x] verify (full-screen + view mode): `/trips` shows the atlas full-screen, thin parchment border, no tray/popover; tapping a placed seal navigates to `/trips/[id]`; seals not draggable.
- [x] verify (redirect): visiting `/trips/atlas` lands on `/trips`.
- [x] verify (edit mode): Edit ✎ toggles; seals draggable + persist (PATCH atlas_x/atlas_y via existing handler); toggling back returns to clean view.
- [x] verify (popover): unplaced trips listed; drag one onto map places it; drop a placed seal over the popover OR off-map un-places it (PATCH null,null).
- [x] verify (add-trip): popover's `NewTripForm` (title+date+public) creates a trip that appears as a new unplaced seal without navigating away.
- [x] verify (dead links): grep for `/trips/atlas`, `Open the Atlas`, `TripCard` — none remain in `app/`.
- [x] verify (owner-only + styling): atlas still owner-scoped via `listTrips`; private trips render as before; one Cartouche per surface; popover uses existing tokens.
