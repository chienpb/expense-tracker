# trips-atlas-zoom: Pan & zoom the Atlas

## What
Make the world Atlas (`app/trips/_atlas-board.tsx`) pan- and zoom-able like
Google Maps: scroll/pinch to zoom toward the cursor, drag the sea to pan. Wax
seals keep a constant pixel size at every zoom level — only their positions
spread apart. First step toward scaling the Atlas to ~50+ trips without clutter;
richer pins (types, grouping) come after.

## Why
The Atlas is a single fixed image with seals at static `[0,1]` positions. With a
handful of trips it's fine; at 50 the seals overlap into an unreadable cluster.
Zoom-to-declutter is the standard map answer and unblocks the pin work that
follows.

## Scope
- **In:**
  - Wheel/trackpad zoom centered on the cursor; two-finger pinch zoom on touch.
  - Drag the background (sea/map) to pan, in both view and edit modes.
  - Seals stay constant pixel size; positions are still fractions of the map, so
    they spread as you zoom.
  - Clamp: min zoom = fit (1×, the whole map fills the frame), max ~6×. Pan
    clamped so the map can't be dragged fully out of the frame.
  - A small "recenter / fit" control to reset the camera to 1× centered.
  - Edit-mode seal placement keeps working: tap-vs-drag threshold unchanged,
    drop-to-place/un-place math updated to invert the current camera transform.
- **Out:**
  - Per-trip parchment map (`[id]/_trip-map.tsx`) — one small image, no clutter.
  - Pin types, clustering/grouping, fog-of-war — the *next* steps.
  - Persisting the camera (pan/zoom) across reloads — resets to fit on load.
  - Inertia/momentum scrolling, double-tap-to-zoom — not needed for step one.
  - Any new dependency — native CSS transform only.

## Acceptance Criteria
- [ ] Scrolling the wheel over the Atlas zooms toward the cursor; pinch zooms on
      touch. Zoom is clamped to [1×, ~6×].
- [ ] Dragging the sea pans the map; pan is clamped so the map edge can't cross
      into the frame interior (no empty gutter).
- [ ] Panning works in both view mode and edit mode.
- [ ] Wax seals render at the same pixel size regardless of zoom level; their
      on-screen spacing grows with zoom.
- [ ] In view mode, a tap on a seal still opens its trip; a drag on the sea pans
      (does not open a trip).
- [ ] In edit mode: dragging a seal still moves it and persists the correct
      `[0,1]` fraction (verified by reload landing the seal in the same map
      spot); dropping onto the popover still un-places; the tap-vs-drag
      threshold is unchanged.
- [ ] A recenter/fit control resets the camera to 1× centered.
- [ ] No new npm dependency added.

## Constraints / Notes
- **Paper Ledger / Cartographer's Hand** design system — read
  `docs/trips-design-system.md` before the recenter control's visual; match the
  existing corner "Edit ✎" button style.
- **Coords stay normalized `[0,1]`, both-or-null** (data-model invariant). The
  camera is view-only client state; nothing about pan/zoom touches the DB or the
  PATCH payload.
- **The transform inversion is the one sharp edge.** Today edit-drop math is
  `fx = (clientX - rect.left) / rect.width`. With a `translate(panX,panY)
  scale(z)` camera it becomes `fx = (clientX - rect.left - panX) / (rect.width *
  z)`. Get this right or seals land in the wrong place.
- Constant-seal-size trick: keep seals positioned by `left/top %` inside the
  transformed layer and counter-scale each seal by `1/z`, OR compute their
  screen px from the camera. Either keeps fraction positioning identical to
  today — pick whichever is the shorter diff at /plan time.
- Auth unchanged — `/trips/atlas` stays owner-only via `middleware.ts`.
