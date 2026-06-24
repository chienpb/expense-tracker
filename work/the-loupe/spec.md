# the-loupe: The Loupe

## What
A brass magnifying glass that rests in the ledger page margin. Click it to pick it up;
it then follows the cursor and refracts the page through a real WebGL lens. Inside the
glass — and **only** inside the glass — each ledger row reveals its hidden **provenance
fine-print**: the exact wall-clock time it was logged, its full entry id, its
subcategory and type, and the auditor's verdict reasoning. Click again (or Esc) to set
the loupe back down.

The lens is two layers, not one: the base page is captured and refracted for optical
realism, and a *separate* hidden fine-print texture is revealed only within the lens
radius. The fine-print does not exist anywhere in the normal DOM — it is genuinely
"text that only exists under glass."

## Why
The keystone of the "shader deepening" cluster (IDEAS #3, holistic 8.2): a high-craft,
demo-able "send this link" moment that extends the three.js rig already shipped for the
page-turn. It also surfaces real clerical detail that's deliberately too fine to print
at normal size — honoring the Paper Ledger conceit that a real ledger carries marks and
metadata you only see when you lean in with a glass.

## Scope
- **In:**
  - A resting brass loupe in the ledger page margin (hand-drawn / `seal-gold`, part of
    the page, not a floating button — nothing floats per §0.5).
  - Pick-up / set-down toggle (click the loupe to grab; click-down or `Esc` to release).
    Off by default → zero WebGL/capture cost at rest.
  - WebGL lens that follows the cursor while held: refraction (radial UV distortion),
    a brass rim, and chromatic aberration / dispersion at the rim.
  - **Two-layer reveal:** base page captured once to a texture (reusing
    `lib/page-flip/capture.ts`); a hidden per-row provenance layer captured to a second,
    high-DPR texture; shader composites base everywhere + fine-print inside the lens.
  - Provenance content, PRINTED layer only (system metadata is never handwritten — §0.2):
    - exact `created_at` wall-clock time (rows show only the date)
    - full entry `id` (UUID)
    - `subcategory` (rows show only category)
    - `type` (expense / income)
    - `audit_verdict` + `audit_note` (the Ledger-keeper's stamp reasoning, when present)
  - Lives on the ledger / register view where per-row provenance is meaningful.
  - Recapture the base + fine-print textures on scroll / resize while the loupe is held.
- **Out:**
  - **No fallback surface.** Desktop fine-pointer + WebGL only. On touch, no-WebGL, or
    reduce-motion the loupe simply does not appear; provenance stays hidden. (Reuses the
    page-turn's existing `<1024px` + `prefers-reduced-motion` / `dataset.reduceMotion`
    gate — no new branch.)
  - **No new DB columns / migration.** Fake edit-history ("edited once, was 40.000"),
    device, and source are dropped — those columns don't exist and entries are
    near-append-only via Shortcuts (DECISION_LOG 2026-06-23).
  - No CSS-lens degradation, no tap-to-expand slip, no mobile lens.
  - No persistent WebGL context (create on pick-up, dispose on set-down — mirror the
    page-turn lifecycle).
  - Not on the dashboard charts or other pages — ledger only.

## Acceptance Criteria
- [ ] A brass loupe glyph rests in the ledger margin; it reads as drawn-on-the-page
      (`seal-gold`, no drop shadow), not a UI chip.
- [ ] Clicking the loupe picks it up: a WebGL lens attaches to the cursor and tracks it
      over the ledger. Clicking-down or pressing `Esc` sets it back in the margin.
- [ ] While held, the area under the lens is visibly **refracted** (radial distortion)
      with a brass rim and rim chromatic aberration — not a flat CSS zoom.
- [ ] Inside the lens, each ledger row shows its provenance fine-print (exact time, full
      id, subcategory, type, audit verdict/note); outside the lens none of it is visible
      anywhere on the page.
- [ ] The fine-print stays **legible** when magnified (rendered at high DPR so it isn't
      a blurry upscale of normal-size text).
- [ ] Rows with no `subcategory` / `audit_*` render those lines as `—` (or omit), never
      as `null`/`undefined`.
- [ ] At rest (loupe down) there is no WebGL context and no `html-to-image` capture
      running — confirmed by no extra canvas in the DOM and no capture cost on scroll.
- [ ] On a touch device, with WebGL unavailable, or with reduce-motion set, the loupe
      does not render at all and the page behaves exactly as today.
- [ ] Scrolling or resizing while the loupe is held keeps the lens aligned (textures
      recaptured), with no stale-row misalignment under the glass.
- [ ] Decorative lens/rim SVG and the loupe glyph are `aria-hidden`; provenance carries
      no new accessible meaning that isn't otherwise reachable (it's an enhancement).

## Constraints / Notes
- **Design system (Paper Ledger):** loupe rim = `seal-gold` (the one "special occasions"
  brass accent). Fine-print is PRINTED layer — typewriter `label` / small serif, `ink`
  — because system metadata never appears handwritten (§0.2). `audit_note` keeps the
  Ledger-keeper voice. No emoji, no floating elements, no spinner. Currency in any
  revealed amount stays VND integer, dotted grouping.
- **Reuse, don't reinvent:**
  - Base-page texture → `capturePage()` / `toCanvas` in `lib/page-flip/capture.ts`.
  - Overlay + renderer + ShaderMaterial lifecycle → mirror `lib/page-flip/renderer.ts`
    and `leaf.ts` (orthographic, 1:1 CSS px, `ColorManagement.disabled`, dispose after).
  - Gate → the same reduce-motion + `<1024px` checks the page-turn already uses
    (`use-page-turn.ts`), so "desktop only" is free.
- **Provenance source:** raw `Expense[]` from `lib/dashboard/queries.ts` already carries
  `created_at`, `subcategory`, `type`, `id`, `audit_verdict`, `audit_note`. These are
  *not* in `LedgerRow` today — the hidden fine-print layer reads the raw rows, not the
  mapped `LedgerRow`. No query change needed.
- **Perf:** capture is one-shot per pick-up / scroll / resize, never per-frame (the
  council's stated risk; the page-turn proves this capture path is viable). Lens canvas
  is `pointer-events-none`, z-index above the page like the page-turn overlay.
- **Fidelity risk to watch in /plan:** the magnified fine-print must be rendered at
  ~2× devicePixelRatio in its own capture so it stays crisp under the glass — the one
  genuine unknown. If `html-to-image` can't hold micro-type at high DPR, fall back to
  drawing the fine-print directly to the texture canvas (skip html-to-image for that
  layer only).
