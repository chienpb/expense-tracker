# the-loupe — Plan

## Files to change
| Action | File | What |
|--------|------|------|
| Create | `lib/loupe/fineprint.ts` | Build the hidden provenance texture: read `[data-row-id]` rects from the live DOM, draw 5 fine-print lines per row to a 2×-DPR `<canvas>` with Canvas 2D. No html-to-image. |
| Create | `lib/loupe/lens.ts` | Lens mesh + `ShaderMaterial`: full-viewport quad, transparent outside radius; inside radius = radial-refracted base sample + brass `seal-gold` rim + rim chromatic aberration + fine-print composited at the magnified UV. |
| Create | `lib/loupe/index.ts` | Orchestrator: `pickUp()` / `setDown()`. Captures base (`capturePage`) + builds fine-print once on pick-up, creates overlay (`createOverlay`), runs the rAF loop tracking the cursor, recaptures both textures on scroll/resize, disposes on set-down / Esc / click-down / context-loss. |
| Create | `app/dashboard/_components/_loupe.tsx` | Client component. Gate on mount (reduce-motion + `<1024px` + `pointer:fine` + WebGL); render the resting brass loupe glyph (aria-hidden `seal-gold` SVG, no shadow) in the ledger margin; click toggles `import('@/lib/loupe')` pick-up/set-down. |
| Modify | `app/dashboard/_components/_ledger.tsx` | Render `<Loupe expenses={expenses} />` inside `<Ledger>` (it already holds the raw `Expense[]`; the rendered rows already carry `data-row-id`). |
| Modify | `docs/DECISION_LOG.md` | Record: fine-print drawn directly with Canvas 2D (the spec's "fallback") chosen as the **primary** path over html-to-image. |

## Approach & trade-offs

**Reuse the page-flip rig wholesale where it fits.** `capturePage(document.body)` gives the base texture (one-shot, its own cache invalidation is harmless here since the loupe and page-turn are never active together). `createOverlay()` already gives a fixed, `pointer-events-none`, transparent, z-9999 canvas with a 1:1-px orthographic y-up camera, a webglcontextlost handler, and a `dispose()` that force-loses the context — exactly the loupe lifecycle. `readLeafTheme()`-style hex→`Vector3` parsing reads `--color-seal-gold` for the brass. The curl shader in `leaf.ts` is **not** reusable — the loupe needs its own short lens shader.

**The overlay only paints inside the glass.** Outside the lens radius the fragment is `discard`/alpha 0, so the real DOM page shows through untouched — same trick the page-turn leaf uses. The base capture exists only so the magnified area *inside* the glass can be refracted (WebGL can't sample live DOM).

**Fine-print = Canvas 2D, not html-to-image.** The spec flags micro-type fidelity at high DPR as the one genuine unknown and offers direct canvas drawing as a fallback. Drawing 5 short lines per row with `ctx.fillText` on a 2×-DPR canvas is *simpler* than cloning hidden DOM through `html-to-image` (no `var()`-inlining hazard, no foreignObject quirks) and is crisp by construction. So it's the primary path, not a fallback. The builder iterates `el.querySelectorAll('[data-row-id]')`, matches each to its `Expense` by id (Map), and draws at the row's `getBoundingClientRect()` — captured in the same frame as the base so they align. Genuinely "text that only exists under glass": it's never in the DOM, only on the GPU texture revealed within the lens radius.

**Held-only cost.** Zero WebGL / capture at rest — the glyph is plain SVG; nothing is imported or captured until first click. rAF loop tracks `mousemove`; capture runs only on pick-up and on scroll/resize (coalesced via a dirty flag consumed in the loop, one capture in flight at a time).

**Deliberately skipped:** no touch/CSS/no-WebGL fallback surface (gate hides the glyph entirely — add only if a non-WebGL reveal is ever wanted); no persistent context (create on pick-up, dispose on set-down); no new DB columns (fine-print reads only existing `Expense` fields). The gate's `pointer:fine` + WebGL checks are added alongside the page-turn's existing reduce-motion + `<1024px` checks (replicated, ~4 lines — not worth exporting the private `gatesPass`).

## TODO
- [x] `lib/loupe/fineprint.ts`: `buildFinePrint(root, byId, dpr=2)` → returns a viewport-sized `<canvas>`. For each `[data-row-id]` in `root`, look up the `Expense`, draw at its rect (5 lines: exact `created_at` time w/ seconds, full `id`, `subcategory`, `type`, `audit_verdict` + `audit_note`). Missing `subcategory`/`audit_*` → `—`, never `null`/`undefined`. Typewriter/small-serif metrics, `ink` color (PRINTED layer, §0.2). [AC: provenance fields, `—` fallback, high-DPR legibility]
- [x] `lib/loupe/lens.ts`: `buildLensScene(w, h, baseTex, fineTex, brassVec3)` → full-viewport `PlaneGeometry` + `ShaderMaterial`. Uniforms: `uMouse` (page px, y-up), `uRadius`, `uBase`, `uFine`, `uBrass`, `uPageSize`. Frag: outside radius → discard; inside → radial UV magnification (spherical bulge), brass rim ring in `[~0.92,1.0]`, R/G/B sampled at staggered radii near the rim (chromatic aberration), then alpha-composite `uFine` at the magnified UV. `setMouse()` updates the uniform. [AC: refraction not flat zoom, brass rim, rim aberration, fine-print inside only]
- [x] `lib/loupe/index.ts`: `pickUp({ captureEl, root, expenses })` and `setDown()`. On pick-up: `capturePage` + `buildFinePrint` → `createOverlay` → build lens scene → rAF loop renders at last cursor pos. Listeners: `mousemove` (track), `click`/`Esc` (set down), `scroll`/`resize` (mark dirty → recapture base+fine-print, rebuild textures). On set-down/context-loss: remove listeners, `dispose()` scene + overlay (force context loss), drop textures. [AC: pick-up/track/release, recapture-on-scroll alignment, no context at rest]
- [x] `app/dashboard/_components/_loupe.tsx`: gate in `useEffect` (`prefers-reduced-motion` OR `dataset.reduceMotion==='1'` OR `innerWidth<1024` OR `!matchMedia('(pointer:fine)').matches` OR no-WebGL → render nothing). Resting glyph = aria-hidden, `tabIndex=-1`, `seal-gold`, no drop-shadow SVG positioned in the left margin near the ledger heading (mirror `MarginNote` positioning). Click → dynamic `import('@/lib/loupe')`, toggle pick-up/set-down; pass `document.body` as `captureEl`, the ledger-table root as `root`, and `expenses`. [AC: drawn-on-page glyph, gate hides on touch/no-WebGL/reduce-motion, decorative aria-hidden]
- [x] `_ledger.tsx`: import + render `<Loupe expenses={expenses} />`. Confirm the rendered `<tr>`/card carry `data-row-id={row.id}` (they do) so fine-print can match rows. [AC: provenance covers the visible rows]
- [x] `docs/DECISION_LOG.md`: dated entry — Canvas-2D fine-print chosen over html-to-image (primary, not fallback); rationale = crisper micro-type, no `var()`/foreignObject hazard, less code.
- [x] verify (playwright-cli, dev server, saved auth state):
  - Loupe glyph renders in the ledger margin as `seal-gold`, no shadow; at rest **no extra `<canvas>`** in DOM. [AC 1, 7]
  - Click → a canvas appears and tracks the cursor; click-down / `Esc` removes it and the canvas is gone (no leaked context). [AC 2, 7]
  - Screenshot the held lens: visible radial refraction (curved, not flat), brass rim, rim color fringing; fine-print legible inside, absent outside. [AC 3, 4, 5]
  - A row with null `subcategory`/`audit_*` shows `—` under glass, never `null`. [AC 6]
  - Scroll a few rows while held, screenshot: fine-print still aligned to the rows under the glass. [AC 8]
  - Resize viewport to `<1024px` (and/or emulate touch / set reduce-motion): glyph absent, page unchanged. [AC 8-gate, 9]
