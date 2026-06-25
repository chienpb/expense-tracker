# trips-atlas-home: Atlas as the Trips home, view-by-default

## What
Make the **Atlas the landing page for Trips**. Opening Trips drops you onto a
full-screen world map in **view mode** (tap a seal → sail into a trip). Editing
(reposition pins, add a trip) moves behind an explicit **edit mode** whose
controls live in a **corner popover**, not a permanent sidebar. The old
card-list page goes away.

## Why
The Atlas is the soul of the feature — the map *is* the index of where you've
been. Today it's buried one click behind a card list, and it's permanently in
"edit" posture (always-draggable, always showing a tray). Making it the home,
view-first surface lets the map fill the screen and read as a finished thing,
with editing as a deliberate gesture.

## Scope
- **In:**
  - `/trips` renders the Atlas (full-screen, thin parchment border).
  - View mode is the default: tap a placed seal → open the trip; no drag, no tray visible.
  - An **Edit ✎** affordance (corner) toggles edit mode. In edit mode seals become draggable (existing drag/persist logic) and a **corner popover** opens with: unplaced trips (drag onto map) + an **add-trip** control.
  - Creating a trip happens from the edit popover; the new trip appears as an unplaced seal ready to drag onto the map.
  - Drop a seal over the popover/off the map → un-place (PATCH null,null), as today.
  - `/trips/atlas` redirects to `/trips` (preserve old links).
  - Old `/trips` card list + standalone `NewTripForm` page are removed (functionality folded into Atlas).
- **Out:**
  - No change to `/trips/[id]` (trip map cover), `/play`, or `/trips/[id]/edit` (metadata editor) — those keep their existing view/edit behavior.
  - No new map asset, no fog-of-war, no public Atlas (still owner-only).
  - No search/filter view of trips (the card list is gone, not relocated).
  - No change to the data model or API contracts.

## Acceptance Criteria
- [ ] Visiting `/trips` shows the Atlas full-screen with a thin parchment border, in view mode.
- [ ] `/trips/atlas` redirects to `/trips`.
- [ ] In view mode: tapping a placed seal navigates into that trip; seals are **not** draggable and no tray/popover is shown.
- [ ] An Edit ✎ control toggles edit mode; toggling back returns to clean view mode.
- [ ] In edit mode: seals are draggable and persist position (PATCH atlas_x/atlas_y), using the existing 5px-threshold tap-vs-drag handler.
- [ ] In edit mode a corner popover shows unplaced trips; dragging one onto the map places it; dropping a placed seal over the popover/off-map un-places it (PATCH null,null).
- [ ] The edit popover has an add-trip control (title + date + public); creating yields a new unplaced seal without a full navigation away.
- [ ] The standalone card-list page and its create form no longer exist; no dead links to them remain (nav, "Open the Atlas →" button, etc.).
- [ ] Atlas remains owner-only; private trips behave as before.
- [ ] Paper Ledger / Cartographer's Hand styling preserved (Cartouche stays one-per-surface; popover uses existing tokens).

## Constraints / Notes
- **Design system:** Paper Ledger + Cartographer's Hand (`docs/trips/ui.md`, `docs/DESIGN_SYSTEM.md`). One Cartouche per surface; reuse existing carto primitives and tokens for the popover.
- **Auth:** unchanged — gating stays in `middleware.ts`; Atlas is owner-scoped via `listTrips`.
- **Reuse the shared drag handler** (`DRAG_THRESHOLD = 5px`, optimistic + revert, fractional coords). The only new behavior is gating drag behind edit mode (mirror the trip-map pattern from commit `edd2a65`) and moving the tray into a popover.
- **Full-screen:** map fills the viewport inside the existing carto frame border — drop the `max-w-6xl` + 16:10 box + side-by-side flex layout. Keep it responsive (mobile usable).
- ponytail: the popover is a plain conditionally-rendered element, not a new dependency. Reuse `NewTripForm` inside it rather than rebuilding the form.
