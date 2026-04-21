# `app/_components/paper/`

Home for every Paper Ledger component. See `docs/DESIGN_SYSTEM.md` for the full spec and `docs/ROADMAP.md` for phasing.

## Why this directory exists

Every component here is *named for its physical equivalent* — `Page`, `FieldLine`, `Stamp`, `TapeStrip`, `LedgerTable`, `HandDrawnChart`, etc. If the metaphor doesn't fit in the name, the component probably shouldn't exist.

## Placeholder-swap contract

Many components consume a hand-drawn asset (tape, paper-clip, ink blot, glyph sprite). Chien is drawing those on a separate timeline; in the meantime each component ships with a coded placeholder.

**The contract:** the component's public API (props, ref, accessibility attributes, CSS custom properties) must not change when the real asset lands. Swapping from placeholder to real asset should be a **single-file diff** — either replacing a file in `public/textures/` / `public/glyphs.svg`, or replacing the inline SVG path inside the component.

When you add a component that will eventually consume an asset:

1. Import / reference the asset by the stable path it will eventually live at.
2. Commit the placeholder to that exact path.
3. Add a TODO comment pointing at the asset ID (e.g. `// TODO(A6): paper-clip SVG`).
4. Log the placeholder strategy in `docs/DECISION_LOG.md` if it's non-obvious.

## Subfolders

- `_filters.tsx` — the single inline `<svg><defs>` block with every SVG filter. Imported once at root layout.
- `_placeholders/` — coded placeholder SVGs (geometric paper-clip, torn corner, etc.). Deleted as real assets arrive.

## Folder naming

Underscore prefix (`_components`, `_filters.tsx`, `_placeholders`) follows Next.js App Router conventions: private folders are excluded from routing. Never route anything out of this directory.
