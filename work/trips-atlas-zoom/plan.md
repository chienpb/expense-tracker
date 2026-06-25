# trips-atlas-zoom — Plan

## Files to change
| Action | File | What |
|--------|------|------|
| Modify | `app/trips/_atlas-board.tsx` | Add a CSS-transform camera (wheel/pinch zoom-to-cursor, drag-to-pan, clamp), wrap Sea+seals in a transformed layer, counter-scale seals by `1/z`, invert the camera in edit-drop math, add a corner "Fit" control. |

No other files. No new dependency — native pointer/wheel events + CSS `transform` only.

## Approach & trade-offs

One camera state: `cam = {z, panX, panY}`, view-only client state (never persisted, never
touches the PATCH payload — data-model invariant holds).

**Layer split.** Inside the existing `mapRef` frame, wrap `<Sea>` + the placed seals in a new
**camera layer** div: `transform: translate(panX px, panY px) scale(z)`, `transform-origin: 0 0`,
sized `h-full w-full`. Chrome (Edit toggle, popover, Fit control) stays a sibling of the camera
layer — untransformed, screen-fixed relative to the frame.

**Constant-size seals (Option A from the spec — shorter diff).** Seals keep `left/top %` exactly
as today; their wrapper transform becomes `translate(-50%,-50%) scale(1/z)`. Net scale = 1, so
seals stay pixel-constant while their `%` positions spread by `z`. No per-seal px math, no camera
threaded into each seal — `left/top %` is byte-identical to today.

**Gesture routing.** Pan/pinch pointer handlers live on the camera layer; seals `stopPropagation`
on pointerdown so pressing a seal never starts a pan. Track active pointers in a `useRef` Map:
1 pointer → pan; 2 pointers → pinch (scale by distance ratio toward the midpoint). `setPointerCapture`
keeps the gesture alive when the pointer drifts over a seal or off-frame. The move/up handlers
no-op when the pointer map is empty, so the existing edit-mode seal drag (its own capture +
outer-div move/up) is untouched.

**Zoom-to-cursor math.** `lx = (px - panX)/z`; on zoom keep the cursor's layer point fixed:
`panX' = px - z'·lx`. Clamp `z ∈ [1, 6]`. Clamp pan to `panX ∈ [W(1-z), 0]`, `panY ∈ [H(1-z), 0]`
(no gutter; at `z=1` pan is forced to 0).

**The sharp edge — edit-drop inversion.** `fx = (clientX - rect.left - panX)/(rect.width·z)`,
same for `fy` (`rect` = frame). Popover hit-test and `DRAG_THRESHOLD` unchanged.

**Wheel listener.** Attach via `useEffect` + `addEventListener('wheel', …, {passive:false})` on
`mapRef` so `preventDefault()` works (React's onWheel can be passive). Mac trackpad pinch arrives
as `ctrlKey`+wheel — same handler covers it.

**Fit control.** Corner button matching the "Edit ✎" style (`border-2 var(--trips-frame)`,
`font-stamp text-[11px] uppercase`), top-left so it clears Edit (top-right) and popover
(bottom-right). Shown only when `z !== 1 || panX || panY` so the default fit view reads finished;
resets `cam` to `{z:1,panX:0,panY:0}`. Label "Fit" — plain text, no emoji/icon (DS ban).

Skipped: pinch one-finger-on-a-seal edge case (ignore — ponytail), camera persistence, inertia,
double-tap zoom — all explicitly out of scope; add when trips actually outgrow step one.

## TODO
- [x] Add `cam` state + `clampPan`/`clampZoom` helpers and a `ptrs` `useRef` Map.
- [x] Wrap `<Sea>` + placed seals in the camera-layer div with the `translate/scale` transform.
- [x] Counter-scale seal wrappers: replace `-translate-x-1/2 -translate-y-1/2` with inline
      `transform: translate(-50%,-50%) scale(1/z)` (both edit `<button>` and view `<Link>`).
- [x] Camera-layer pointer handlers: pan (1 ptr) + pinch (2 ptrs) with `setPointerCapture`;
      seals `stopPropagation` on pointerdown; move/up no-op when no gesture active.
- [x] `useEffect` wheel listener on `mapRef` (`passive:false`): zoom-to-cursor, clamp z + pan.
- [x] Invert camera in `onPointerUp` edit-drop: `fx = (clientX - rect.left - panX)/(rect.width·z)`,
      same for `fy`. Leave popover hit-test + `DRAG_THRESHOLD` unchanged.
- [x] Add the conditional corner "Fit" control resetting `cam`.
- [ ] verify AC1 (wheel zoom-to-cursor + clamp 1–6×): scroll over a point, confirm it stays under
      the cursor and stops at 1× / ~6× — playwright + screenshots.
- [ ] verify AC2/AC3 (pan + clamp, both modes): drag the sea in view and edit mode; confirm no
      gutter appears at any zoom and pan locks at 1×.
- [ ] verify AC4 (constant seal size): screenshot at 1× and 6×; seal px size identical, spacing grown.
- [ ] verify AC5 (view tap vs sea drag): tap a seal opens its trip; a sea drag pans without navigating.
- [ ] verify AC6 (edit drag persists correct fraction): in edit mode, zoom in, drag a seal to a
      landmark, reload — seal lands on the same map spot. Drop a seal on the popover → un-places.
- [ ] verify AC7 (Fit): zoom/pan, click Fit → camera returns to 1× centered.
- [ ] verify AC8 (no new dep): `git diff package.json` is empty.
