# Trips — Design Reference

Claude Design wireframe (source of truth, interactive):
**https://claude.ai/design/p/e0b3b708-8861-4bef-81e5-d88c199e89ee?file=Trips.dc.html**

> These are `.dc.html` files on Claude Design's own runtime — reference only, not
> droppable into Next.js. Read them for layout, palette, and copy; rebuild in React.

## Two files

- **`Trips.dc.html`** — the interactive prototype. Three views, one parchment frame:
  Atlas → Trip → Scene. This is the spatial/interaction reference.
- **`Trips - Directions.dc.html`** — three art directions side by side (the open
  "how illustrated" question from the vision). **Pick one before Phase 1 spec.**

## The three art directions (decision needed)

| | Feel | Surface | Seals | Stamp |
|---|---|---|---|---|
| **A · Surveyor's Daybook** | closest to current ledger; ink-on-cream, quiet | `#f4ecdb`, pink margin rule, blue-grey route | flat red discs | `PUBLIC` boxed |
| **B · Treasure Parchment** | warmer, whimsical, most illustrated | `#e6d2a4`, burnt edges, terrain glyphs | wax-seal gradient | wax `SHARED` |
| **C · Naturalist's Field Atlas** | cooler, topographic, studied | `#f0ead4`, contour rings, blue route | pin outlines | `CATALOGUED` |

The interactive `Trips.dc.html` is built in **direction B** (treasure parchment). B leans
hardest into the vision's "fantasy over fidelity / hand-drawn everything." A is the safest
continuity with the existing Paper Ledger ink-on-cream. → resolve in `/spec trips-p1-scenes`.

## How the views map onto our roadmap

- **Scene view** (photo + caption + filmstrip nav, prev/next) → **Phase 1**. This is the
  soul and the only view we build first. Wireframe shows the whole scene UX already.
- **Trip view** (parchment map + numbered wax seals + scene rail) → **Phase 3** (map/route).
- **Atlas view** (world map, trip markers, public/private legend, fog of war) → **Phase 2/4**.

## Reusable tokens lifted from the wireframe

- Fonts: `Crimson Pro` (serif body/headings), `Courier Prime` (mono labels/meta),
  `Patrick Hand` + `Caveat` (handwriting — captions, titles), `Archivo Black` (stamp).
- Public/private language: **"a story to share" / "a page of the diary"**, stamp reads
  `PUBLIC` (A) or wax `SHARED` (B). Private = dashed border, muted.
- Scene model in the prototype matches our planned shape: `{ place, sub, coord, caption,
  photo }` sequenced 1..n — confirms the Phase-1 schema.

_Note: check the wireframe's font choices against `docs/DESIGN_SYSTEM.md` before adopting —
Paper Ledger may already specify its own families._
</content>
