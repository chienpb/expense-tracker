# Trips — UI layer

Pages, components, and the "Cartographer's Hand" carto primitives under
`app/trips/`. For the visual rules (tokens, filters, voice) read
[`../trips-design-system.md`](../trips-design-system.md) — this doc is the
component map, not the design spec.

Convention: pages are **Server Components** that fetch + gate, and hand data to
a `_`-prefixed **Client Component** for interaction. Server reads the DB and
resolves image URLs; the client does drag/forms and calls the API, then
`router.refresh()`.

## Routes & pages

| Route | File | Type | Does |
|---|---|---|---|
| `/trips` | `page.tsx` | Server | Owner's trip list. `auth()` + `listTrips`. Renders `<Parchment>` → `<NewTripForm>` + `<TripCard>` grid. |
| `/trips/[id]` | `page.tsx` | Server | The trip-map cover. `getTrip` + `sceneImageUrl`, computes `isOwner`. Renders `<TripMap>`. |
| `/trips/[id]/play` | `page.tsx` + `_slideshow.tsx` | Server + Client | Scene slideshow. `?scene=` deep-links a start index. |
| `/trips/[id]/edit` | `page.tsx` + `_editor.tsx` | Server + Client | Owner-only editor: upload/caption/reorder/delete scenes, toggle public, delete trip. |
| `/trips/atlas` | `page.tsx` + `_atlas-board.tsx` | Server + Client | World map of all trips as draggable wax seals. Owner-only. |

### Visibility gating
`getTrip` is **not** user-scoped. Each page decides: the cover/slideshow show
a trip if `public` **or** viewer is owner; `edit` is owner-only. The atlas
lists only the owner's trips.

## The shared drag interaction

Both `_atlas-board.tsx` (trip → atlas) and `_trip-map.tsx` (scene → trip map)
use **one** pointer handler with a `DRAG_THRESHOLD = 5px`:

- A press that never crosses 5px = a **tap** → navigate (into the trip / into
  the slideshow).
- A press that crosses it = a **drag** → on drop, compute the fraction of the
  map rect; inside `[0,1]` → PATCH the placement, outside (over the tray) →
  PATCH `null,null` (the tray *is* the un-place affordance).
- Optimistic update with revert on PATCH failure. Fractions are of the live
  map rect, so they survive resize.

The atlas always allows drag; the trip map gates drag behind an explicit
**edit mode** (view-by-default — see commit `edd2a65`).

## Top-level components

| Component | Type | Props | Notes |
|---|---|---|---|
| `NewTripForm` | Client | — | `POST /api/trips`. Title + native `<input type=date>` + public checkbox. |
| `Parchment` | Server | `{title, subtitle?, action?, children}` | Page shell: aged-tan surface + bordered box + header. |
| `TripCard` | Server | `{trip}` | Link to `/trips/[id]`; title, formatted date, public/private badge. |

## Carto primitives (`_components/carto/`)

The hand-drawn map vocabulary. All decorative ones are `aria-hidden`; most
apply the `hand-wobble` SVG filter. Stroke/path rendering goes through
`toPath` (`lib/trips-carto.ts`); seeded rotation/tilt comes from `tiltFor`
(`lib/seed-rotation.ts`).

| Component | Props | Renders |
|---|---|---|
| `Sea` | `{rhumb?, children?, className?}` | Atlas ground — layered radial gradients + optional 16 rhumb rays. |
| `Island` | `{id?, d?, size?, children?}` | A parchment landmass: layered coastal fills + grain + coastline. |
| `HandPath` | `{points, variant?, width, height, label?}` | Workhorse stroke. `variant`: `route` (dashed brown), `ink` (solid), `rhumb` (faint). |
| `WaxSeal` | `{id, label, color?, state?, glyph?, size?}` | Marker. `color` red/gold; `state` sealed/broken/ghost; ghost = private (0.28 opacity). Seeded rotation. |
| `Cartouche` | `{title, sub?, className?}` | Strapwork title plate. **One per surface.** |
| `CompassRose` | `{size?, className?}` | 16-point wind-rose with gold North fleur. One per map. |
| `TerrainGlyph` | `{kind, size?}` | `mountain` / `tree` / `wave` — molehill-convention terrain. |
| `Foxing` | `{seed, intensity?}` | Seeded age stains + fold crease (`mix-blend: multiply`). Replaces the banned vignette. |

## The Atlas world map asset

`/trips/atlas` renders `public/trips-atlas.svg` as a single `<img>` over
`<Sea>`; seals are React overlays positioned by `[0,1]` fractions, fully
decoupled from the map art — **swapping the map = replacing that one file.**

Current asset: an Azgaar Fantasy Map Generator export (`df153a9`). Its
`dingy` color filter must live on the `#viewbox` group, **not** the root
`<svg>` — Chromium drops a root-`<svg>` filter when the file is loaded via
`<img>` (DECISION_LOG 2026-06-25).
