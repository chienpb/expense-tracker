# `public/textures/`

Raster texture files. Each <30KB, tileable where noted. Per §12 of `DESIGN_SYSTEM.md`.

Current files are **coded placeholders** (generated at build time from SVG `feTurbulence`) until Chien ships real hand-drawn/photographed textures.

| Asset | File | Tileable | Status |
|---|---|---|---|
| A1 | `paper-grain.png` | yes | placeholder (feTurbulence) |
| A2 | `coffee-ring.png` | no | placeholder |
| A3 | `ink-blot-1.png`, `ink-blot-2.png`, `ink-blot-3.png` | no | placeholder |
| A4 | `fold-crease.png` | no | placeholder |

When a real asset arrives:
1. Drop it in at the exact path above.
2. Verify in `/design-system` that it renders correctly on both Day and Midnight themes.
3. Add a DECISION_LOG entry recording the swap date.
