# `public/textures/`

Filed under: Paper Ledger surfaces
Cross-ref:   `docs/DESIGN_SYSTEM.md` §7 · §12 · `docs/ROADMAP.md` inventory A1 · A2 · A3 · A4
Budget:      Each raster ≤ 30KB. Tileable where noted. Use `next/image` with `priority` on above-the-fold surfaces.

---

## Inventory

| Row | Asset                  | Placeholder form              | Lives at                          | Tileable | Status                              |
|-----|------------------------|-------------------------------|-----------------------------------|----------|-------------------------------------|
| A1  | Paper grain            | SVG (`feTurbulence` recipe)   | `paper-grain.svg`                 | yes      | Placeholder shipped (Phase 0.1)     |
| A2  | Coffee ring            | Per-component coded SVG       | — (lives inside its component)    | no       | Coded placeholder in Phase 3        |
| A3  | Ink blot (3 variants)  | `<InkBlot>` component, coded  | — (lives inside `<InkBlot>`)      | no       | Coded placeholder in Phase 4.1 (#4) |
| A4  | Fold crease            | CSS gradient line             | — (coded in `<FoldCrease>`)       | no       | Coded placeholder in Phase 3 (#8)   |

**Reading the table.** Only A1 lives here today — page-level tiling is the one case where a standalone file beats component-local SVG. A2/A3/A4 stay inside their consumer components during Phases 3–4 and migrate to this directory only when Chien delivers real art.

## `paper-grain.svg` — how to consume

The SVG carries the §7.1 recipe: `feTurbulence` at `baseFrequency="0.9"`, two octaves, stitched tiles, mapped through a warm-dark `feColorMatrix`. Transparent background.

```css
.paper-surface {
  background-color: var(--color-paper);          /* #f6efe0 on Day */
  background-image: url("/textures/paper-grain.svg");
  background-repeat: repeat;
  background-size: 200px 200px;
  /* Final grain tint sits near 6% against the paper; the SVG's alpha
     is pre-attenuated, so no additional opacity step is needed. */
}
```

On devices where the SVG filter cost bites (see `DECISION_LOG.md` → Spike 2 verdict), Phase 2.2 pre-renders this to `paper-grain.png` at build time. Same path, `.png` extension — consumers swap the URL.

## Swap-out contract

When Chien delivers a real asset (or Phase 2.2 bakes the PNG):

1. Drop the file in at the same path the placeholder referenced (or update the single `url()` reference).
2. Verify in `/design-system` on both Day and Midnight themes.
3. Log the swap date in `docs/DECISION_LOG.md` with the A-row number.

No component code changes. If a swap needs new props, the placeholder's API is wrong — fix the API, not the asset.
