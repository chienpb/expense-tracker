# Paper Ledger — Decision Log

> Per §13 of `DESIGN_SYSTEM.md`. Record every non-trivial design/code decision, every rule exception, and every spike outcome. Keep it short; if it grows past ~20 entries the system itself needs revision.

**Format**
```
YYYY-MM-DD · one-line decision
  Context:   why this came up
  Decision:  what we chose
  Rationale: why
  Reviewer:  who signed off
```

---

## 2026-04-21 · Spike routes live at `app/spikes/` (no underscore)

  Context:   The roadmap originally specified `app/_spikes/<name>/page.tsx`.
  Decision:  Use `app/spikes/<name>/page.tsx` and `app/design-system/page.tsx` (no underscore).
  Rationale: Next.js App Router treats `_`-prefixed folders as *private* and excludes them from routing entirely. A page at `app/_spikes/foo/page.tsx` is unreachable. To keep them reachable in dev and deletable at launch, the public segment name is required. Each page gates itself with `process.env.NODE_ENV === 'development'` and `middleware.ts` adds `/spikes` + `/design-system` to the public route list.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · `paper-grain` ships as an SVG, not a PNG, in Phase 0.1

  Context:   Phase 0.1 needed a placeholder inside `public/textures/`. The spec (§7.1 + §12) eventually calls for a PNG (`paper-grain.png`, tileable, <30KB) baked from feTurbulence, but the PNG pipeline is a Phase 2.2 item.
  Decision:  Ship `public/textures/paper-grain.svg` now. It carries the exact §7.1 recipe (`baseFrequency="0.9"`, two octaves, `stitchTiles="stitch"`, warm-dark feColorMatrix) and is immediately usable as `background-image: url(...)` on any surface. Phase 2.2 will render the same recipe to PNG at build time; consumers swap the `.svg` → `.png` URL — single-line change.
  Rationale: Zero-blocking placeholder that documents the recipe in code rather than in prose. If a consumer surface appears before Phase 2.2, it uses the SVG with the known filter cost accepted (Spike 2 verdict: acceptable on dev-laptop and iPhone 12).
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Documentation restructured into CLAUDE.md + INDEX.md + per-topic docs

  Context:   `CLAUDE.md` had grown to ~120 lines holding project intro, stack, env vars, full project tree, DB schema, full API specs, auth flow, Shortcuts setup, and categories. Every session paid that cost even when the task only touched one surface. Paper Ledger will keep adding docs (DESIGN_SYSTEM, ROADMAP, DECISION_LOG, future CASE_STUDY), so the "one big CLAUDE.md" model was going to get worse.
  Decision:  Three-tier split. `CLAUDE.md` keeps only identity + invariants + a pointer to `docs/INDEX.md`. `docs/INDEX.md` is a one-screen table of contents: each doc has a one-line *trigger* ("read when X"). Runtime detail extracted into `docs/api.md`, `docs/database.md`, `docs/auth.md`. Env vars live in `.env.local.example` (expanded to include `AUTH_SECRET` and `CRON_SECRET`, which were previously missing).
  Rationale: CLAUDE.md stays ~20 lines forever; detail docs are only loaded when their trigger matches. Design-system pointer now references both Swiss (current) and Paper Ledger (target) — the Phase 1 handoff is a one-line edit instead of a CLAUDE.md rewrite.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Caveat font does not carry Vietnamese subset

  Context:   Spike #1 attempted to load Caveat with the `vietnamese` subset via `next/font/google`; TS rejected it.
  Decision:  Load Caveat with `['latin', 'latin-ext']` only. Confirmed against the spec — §2.3 explicitly forbids Vietnamese in Caveat ("English-only moments at 24px+"), so this aligns with intent rather than constraining us.
  Rationale: Caveat is the signature/display fallback; any Vietnamese rendering risk means Patrick Hand is the required hand font. Enforced at the font-loading layer.
  Reviewer:  Ledger-keeper (pending Chien)

---

## Spike verdicts (Phase 0.2)

All six spike routes are live at `/spikes/*` in development. Visit each, run the verdict checklist at the bottom of the page, and replace the "Pending" line below with the result.

### Spike 1 — Fonts + Vietnamese diacritics — **PASS**
  Reviewed: 2026-04-21 · Chien (visual).
  Result:   All five fonts load. Patrick Hand renders every stacked-tone glyph cleanly (`ấ ầ ẩ ẫ ậ ằ ắ ẳ ẵ ặ ề ế ể ễ ệ ồ ố ổ ỗ ộ ờ ớ ở ỡ ợ ừ ứ ử ữ ự ỳ ỷ ỹ ỵ`). Caveat, by spec, does not carry Vietnamese — confirmed.
  Decision: Patrick Hand is the hand font for Phase 1. `lib/paper-fonts.ts` ships into the root layout as-is.

### Spike 2 — SVG filter performance — **PASS**
  Reviewed: 2026-04-21 · Chien (DevTools).
  Result:   Both path A (filter-on-surface) and path B (CSS-tiled pre-filter) perform acceptably on the dev laptop; no visible jank on scroll.
  Decision: Prefer path B (CSS-tiled) by default per §7.6 — cheaper, predictable on weaker devices. Keep path A available for small decorative elements. Re-test on a mid-tier Android in Phase 2.1.

### Spike 3 — Deterministic rotation — **PASS**
  Reviewed: 2026-04-21 · Chien (console).
  Result:   No hydration warnings; tilts are stable across reloads and distributed across the full [-2°, +2°] range.
  Decision: `lib/seed-rotation.ts` ships as-is into Phase 1. Every handwritten component consumes `tiltFor(id)` keyed by a stable row id.

### Spike 4 — Numeral alignment — **PASS**
  Reviewed: 2026-04-21 · Chien (visual).
  Result:   Crimson Pro renders `oldstyle-nums` correctly (digit heights vary, e.g. "4" descends); `tabular-nums` columns align; VND dotted grouping renders via `Intl.NumberFormat('vi-VN')`.
  Decision: Body-table default in Phase 1 is `font-variant-numeric: oldstyle-nums tabular-nums`. Hero numerals use `lining-nums tabular-nums`.

### Spike 5 — Day/Midnight theme — **PASS (with known limitation)**
  Reviewed: 2026-04-21 · Chien (visual).
  Result:   The mechanism works — toggling `data-theme` on `<html>` swaps every CSS-variable consumer instantly (palette swatches, preview card, handwritten Vietnamese label). The spike's outer layout chrome didn't fully repaint because it still has Tailwind arbitrary-value classes (`bg-[#f6efe0]`) from the earlier Swiss system that don't read from the variables.
  Decision: Confirmed pass. The chrome-repaint gap is exactly what Phase 1.1 resolves — replacing every hardcoded color across the codebase with `var(--color-*)` consumers. Not a spike failure; it's the work Phase 1.1 tracks.
  Plan:     Phase 1.1 migrates `ThemeProvider` to `attribute="data-theme" value={{ light: 'day', dark: 'night' }}` and rewrites `app/globals.css` + every component to the new token set.

### Spike 6 — Reduce motion / reduce skew — **PASS**
  Reviewed: 2026-04-21 · Chien (toggle + macOS reduce-motion).
  Result:   Both user overrides (`data-reduce-skew`, `data-reduce-motion`) AND the system `prefers-reduced-motion` media query correctly flatten tilts to 0° and freeze animations.
  Decision: Phase 1.3 stores the two overrides in a settings cookie and writes them to `<html>` from the server. All animated components gate their CSS on the combination of media query + data-attribute.

---
