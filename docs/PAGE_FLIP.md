# The Page Flip — WebGL page-turn navigation

> **Status: draft spec, ready for implementation.**
> Closes ROADMAP Phase 8.2's "page-flip transition between major sections" — but properly, with real paper, not the placeholder 400ms `rotateY`.
>
> This document is the full brief. Read `DESIGN_SYSTEM.md` §0, §7, §8 before writing any code. When this doc and your instincts disagree, this doc wins. When this doc and `DESIGN_SYSTEM.md` disagree, the design system wins.

---

## 0. What we are building, in one paragraph

When the user navigates between the major sections of the ledger (Daybook ↔ Standing Orders ↔ Correspondence), the current page **physically turns** like a leaf in a real bound ledger: the corner lifts, the sheet bends across a curl, you glimpse the *back* of the page — blank ruled paper with the ghost of the front's ink bleeding through — and it settles flat to reveal the next section already lying underneath. Forward in the book (left tab → right tab) turns right-to-left; backward turns left-to-right. It is rendered in WebGL (three.js) because flat CSS `rotateY` is a card trick, and paper does not rotate rigidly — it **bends**.

This is the only 3D in the app. It exists to make the metaphor *more* honest, not to show off. If at any point it starts reading as "website with a WebGL effect" instead of "someone turned the page," stop and fix that before anything else.

---

## 1. Quality bar — what separates this from slop

This is a portfolio centerpiece. The difference between amazing and slop is entirely in the physical details. Every item below is **required**, not aspirational:

1. **The corner lifts first.** A real page-turn starts at the bottom-outside corner: it peels up (~80–120ms) before the whole leaf commits to the turn. The curl propagates diagonally from that corner, not as a uniform cylinder from frame zero.
2. **The sheet bends, with a moving curl radius.** Model the page as a high-segment plane (≥ 48×64 segments) deformed in the **vertex shader** around a moving, slightly tilted curl axis. The curl radius starts loose (~18% of page width) and tightens as the turn passes vertical, then relaxes as the page lays down. The paper must never look like it's wrapped around a rigid pipe.
3. **The back of the page is a real back.** When the leaf passes vertical you see its reverse: the same `paper` color, the same ruled lines (`rule-blue` horizontals, `rule-pink` margin rule — mirrored, since you're seeing the sheet from behind), plus a **horizontally mirrored, ~6–8% opacity, slightly blurred ghost of the front texture** — ink bleed-through. This single detail does more for believability than everything else combined. Do not skip it.
4. **Light is matte and diegetic.** Paper is matte. Zero specular, zero environment maps, zero bloom. Shading is a hand-rolled lambert-ish term in the fragment shader: the concave side of the curl darkens gently, the convex side lightens *very* slightly. Light direction is fixed, top-left-ish (consistent with the existing tape-strip and stamp shading). On Midnight theme (`data-theme="night"`), warm the shadow tones — the lamp, not daylight.
5. **The turning leaf casts a soft shadow on the page below.** A blurred, curl-shaped contact shadow that sweeps across the underlying page as the leaf passes over it. Cheap version is fine (a gradient quad tracking the curl line, ~10–15% `ink` opacity, heavy soft edge) — but it must exist and must move with the leaf.
6. **Paper grain on the leaf.** Sample the existing `public/textures/paper-grain.svg` tile (rasterize once to a small `CanvasTexture` at init) at ~6% over both faces. The leaf must not be smoother than the page it came from.
7. **Timing per §8 of the design system.** Total turn: **400ms** (the one sanctioned long duration), easing `cubic-bezier(0.2, 0.0, 0, 1)` — fast in, gentle settle, like ink drying. The settle at the end is a dampened lay-flat, **not** a spring bounce (springs are a §11 anti-pattern). Corner-peel anticipation lives inside the 400ms, it does not extend it.
8. **Deterministic, with one seeded imperfection.** Tilt the curl axis by a small seeded amount (reuse the `tiltFor(id)` idea from `lib/seed-rotation.ts`, seeded on the destination route) so the Daybook→Recurring turn always bends *exactly* the same way, every time. Identical replay builds trust; randomness reads as glitch.

**Banned outright** (instant slop): specular highlights, gradients on UI chrome, motion blur passes, postprocessing of any kind, particle effects, page "flutter," rubber-band springs, sound effects, turning more than one leaf, skeuomorphic book covers/spines creeping into frame.

---

## 2. The architecture — one leaf of WebGL over real DOM

The trick that keeps this honest and cheap: **only the turning leaf is 3D.** The incoming page is never a texture — it is the real, live DOM that was just routed in, sitting underneath a transparent full-viewport canvas overlay. Only the *outgoing* page needs to be captured.

### Sequence

```
user clicks tab (e.g. Recurring, from Daybook)
 │
 ├─ 1. CAPTURE  snapshot current page DOM → texture (front of leaf)
 ├─ 2. OVERLAY  mount fixed, pointer-events-none, transparent WebGL canvas;
 │              draw the captured page flat at z=0 — pixel-identical to the DOM
 │              below it (verify this; any offset/scale mismatch kills the illusion)
 ├─ 3. NAVIGATE router.push(). The new route renders *under* the overlay.
 │              The user cannot tell anything changed yet — the flat leaf covers it.
 ├─ 4. TURN     when the new route has painted, play the 400ms turn.
 │              The leaf curls away and the live DOM beneath is revealed.
 └─ 5. CLEANUP  unmount canvas, dispose() geometry/textures/renderer. Nothing
                3D survives between navigations.
```

### Slow-route case (this replaces a spinner — design system §6.5 says NEVER a spinner)

If the new route hasn't painted by the time the turn would start, the page turns **partway and holds** — lifted to ~60°, hanging mid-air with a slow (~1s period) sub-degree sway, exactly like a person holding a page up while they check something. When the route paints, the turn completes. This is the loading state. It is physical, in-character, and better than anything a progress bar could do. (Respect a hard timeout: if the route hasn't painted in 4s, finish the turn anyway and let the page's own loading states take over.)

### DOM → texture capture

- Use **`html-to-image`** (`toCanvas`) on the page root element. It serializes the DOM through SVG `foreignObject` — which means **fonts and SVG filters are the risk**. The spike (§5) exists to prove this works with Crimson Pro / Patrick Hand / Courier Prime and the `#hand-wobble`-filtered charts before any real integration.
- Capture at `min(devicePixelRatio, 2)`, viewport-sized. Pre-warm: trigger capture **on tab hover/focus** (alongside Next's link prefetch) so click→turn latency is near zero; invalidate the cached capture on scroll/resize/data change.
- If a capture takes >150ms on the dashboard (worst case: full table + charts), capture at 1× and let texture filtering hide it — the leaf is moving; nobody can read a turning page.
- **Fallback chain:** capture fails or WebGL context refused → CSS `rotateY` 400ms (the original Phase 8.2 plan) → reduced-motion → instant swap. All three must ship. The flip is an enhancement; navigation never breaks because of it.

### Three.js usage

- **Vanilla three, no react-three-fiber.** One transition overlay does not justify r3f + drei in the bundle. A single module, `lib/page-flip/` (e.g. `renderer.ts`, `leaf.ts` with the shaders, `capture.ts`, `index.ts` orchestrator), dynamically imported.
- `import('three')` (or better: named imports so tree-shaking keeps it to WebGLRenderer/Scene/OrthographicCamera/PlaneGeometry/ShaderMaterial/CanvasTexture) **only on first tab hover** — zero bytes of three.js in any route's initial JS. Verify with the bundle analyzer; budget for the whole feature (three + html-to-image + our code) is **≤ 180KB gzipped, lazy chunk**.
- **Orthographic camera** mapped 1:1 to viewport pixels. This is a page on a desk seen from above, not a hero scene; perspective distortion of the underlying layout would read as broken.
- One leaf mesh, two `ShaderMaterial`s (front: captured texture; back: procedural ruled paper + mirrored ghost — `BackSide`/`FrontSide` pair or a single material reading `gl_FrontFacing`), one shadow quad. That's the entire scene graph.
- Drive the animation with the elapsed-time easing curve, render on demand inside the 400ms window only. No persistent rAF loop ever runs outside an active turn.

### Integration point

`app/dashboard/_components/_masthead.tsx` is the only trigger surface. The three route tabs (`/dashboard`, `/dashboard/recurring`, `/chat`) get the intercepted navigation; the **OUT** tab and every other link in the app navigate plainly. Wrap the interception in a small client component/hook (`usePageTurn()`) so the masthead stays readable. Direction comes from tab order: higher index = forward = right-to-left turn.

---

## 3. Gates — when the flip does NOT run

Every one of these falls back to instant/plain navigation. No partial effects.

| Condition | Detection |
|---|---|
| Reduced motion | `prefers-reduced-motion` **or** `data-reduce-motion="1"` on `<html>` (the user setting from `/settings` — both must be honored, per ROADMAP Phase 10) |
| Small viewport | `< 1024px` width. Mobile is a receipt scroll (§3.4); receipts don't page-turn. Phase 9 may revisit; don't pre-build it |
| WebGL unavailable / context lost | try/catch on renderer init; `webglcontextlost` mid-turn → snap to completed state, navigate, clean up |
| Same-section navigation | searchParam changes (range picker, day drill-in) never flip — only the three masthead tabs |
| Back/forward browser buttons | v1: plain navigation. Intercepting popstate for a reverse-flip is a nice-to-have; do not let it complicate v1 |
| A turn is already running | queue nothing; complete the current turn, navigate to the latest target |

---

## 4. Theme correctness

The leaf samples its colors from the **live CSS custom properties** at capture time (`getComputedStyle(document.documentElement)`) — `--color-paper`, `--color-rule-blue`, `--color-rule-pink`, `--color-ink` — never hard-coded hex. A Midnight-theme user turns a Midnight page: dark leather-toned leaf, subdued rules, warm lamp-toned shadowing. Test both themes; a cream leaf flying across a Midnight page is an instant bug.

---

## 5. Build order

Work in this order; each step has a checkable exit.

1. **Spike** — `app/spikes/page-flip/page.tsx` (dev-gated like the existing spikes). Hard-code two fake ledger pages. Prove: (a) `html-to-image` faithfully captures our fonts + SVG-filtered content, (b) the curl shader looks like paper (get sign-off on a screen recording before proceeding), (c) capture cost on a dashboard-sized DOM. **Write the verdicts to `docs/DECISION_LOG.md`** — including the headline decision "3D rendering admitted for the page-turn only," which is a §0-adjacent rule exception and *must* be logged with rationale.
2. **Library** — extract to `lib/page-flip/` with the orchestrator API: `turnPage({ direction, captureEl, onNavigate }): Promise<void>`. Dynamic-import boundary lives here.
3. **Wire** — `usePageTurn()` in the masthead, all gates from §3, hover pre-warm, fallback chain.
4. **Verify** — see §6.
5. **Docs** — row in `docs/INDEX.md` is already present; update ROADMAP Phase 8.2 checkbox with a pointer to this doc; final DECISION_LOG entry for anything that diverged from this spec.

Keep the spike route around afterward as the visual-regression surface for the shader (same convention as the other spikes — deleted in Phase 11).

---

## 6. Acceptance criteria

Functional:
- [ ] Daybook → Recurring turns right-to-left; Recurring → Daybook turns left-to-right; Chat participates in tab order; OUT never flips.
- [ ] The revealed page is the live DOM — interactive the frame the turn ends (click a table row immediately after a flip: it works).
- [ ] Flat-leaf overlay at turn start is pixel-identical to the page it covers (overlay screenshot diff ≈ 0).
- [ ] Slow route → page holds mid-turn, completes on paint; 4s timeout completes regardless.
- [ ] All §3 gates verified, including `data-reduce-motion="1"` set from `/settings`.
- [ ] Both themes correct, including the bleed-through ghost and shadow tones.

Quality (the slop line — a reviewer checks the recording against §1):
- [ ] Corner peels before the leaf commits. Curl radius visibly varies through the turn.
- [ ] Back of leaf shows mirrored rules + ink bleed-through ghost.
- [ ] Moving soft shadow on the underlying page.
- [ ] No specular sheen anywhere, no bounce at settle, 400ms total, ink-drying easing.
- [ ] Same navigation pair produces an identical turn every time.

Performance:
- [ ] Zero three.js bytes in initial route JS (bundle analyzer proof). Lazy chunk ≤ 180KB gz.
- [ ] 60fps turn on a mid-tier laptop; no rAF loop and no WebGL context alive outside an active turn (verify disposal — `renderer.info` leak check after 10 consecutive flips).
- [ ] No layout shift, no scrollbar jump, no flash of unstyled new page before the turn.

---

## 7. Out of scope (log ideas, don't build them)

Annual-report 3D book, receipt-spindle data viz, desk-scene shell, 3D stamp thump, login pen. Each is a separate future spec. This feature is **one leaf, turning** — nail it completely rather than gesturing at five things.

---

*Drafted 2026-06-12 · spec owner: Chien · implementation: open · — LK*
