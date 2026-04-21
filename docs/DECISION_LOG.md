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

## 2026-04-21 · Phase 1 · `dark` Tailwind variant re-bound to `[data-theme="night"]`

  Context:   Phase 1.1 switches `next-themes` from `attribute="class"` (which sets `.dark` on `<html>`) to `attribute="data-theme"` with `value={{ light: "day", dark: "night" }}` per DESIGN_SYSTEM §12. Every pre-existing shadcn `dark:*` Tailwind utility keyed off the `.dark` class — those would silently stop responding to theme changes.
  Decision:  Redefine the v4 variant in `app/globals.css` to `@custom-variant dark (&:is([data-theme="night"] *))`. The Swiss token blocks now live under `:root, [data-theme="day"]` and `[data-theme="night"]` so `bg-background`, `dark:bg-card`, etc. continue to work on unmigrated pages through Phase 5.
  Rationale: Zero churn in shadcn-consuming code, one selector change to own the migration. Keeps the roadmap's Phase 5 flag-flip surgical: we don't need to touch every `dark:` utility to drop Swiss.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 1 · Paper Ledger font variables renamed `--font-*-face`

  Context:   Tailwind v4 exposes `font-serif`, `font-hand`, etc. utilities by defining `--font-serif`, `--font-hand`, ... in `@theme inline`. `lib/paper-fonts.ts` originally used the same names for `next/font/google`'s `variable` option, so both next/font (via a class on `<html>`) and Tailwind (via `@theme inline`) would write to the same custom property — an unstable race on specificity.
  Decision:  Rename the next/font variables to `--font-serif-face`, `--font-typewriter-face`, `--font-hand-face`, `--font-hand-signature-face`, `--font-stamp-face`, `--font-hand-hurried-face`. `@theme inline` bridges each Tailwind font utility to its `-face` var: `--font-hand: var(--font-hand-face), "Comic Sans MS", cursive;` etc. The utility name stays `font-hand` (matches §12 of the spec); the rename is internal.
  Rationale: Explicit ownership — next/font writes the actual font-family, Tailwind bridges it into the utility. Existing spike pages that read `var(--font-hand)` keep working because `:root` now carries `--font-hand` courtesy of Tailwind's `@theme inline` emission.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 1 · Settings persisted as cookies, read server-side in root layout

  Context:   Phase 1.3 calls for `data-reduce-motion`, `data-reduce-skew`, `data-print-hand`, `data-show-edit-history` attributes on `<html>` so components can gate CSS against them. We need them on the first paint (no FOUC of unreduced motion) and we don't want a hydration mismatch.
  Decision:  Store each setting as a dedicated cookie (`ledger-reduce-motion`, `ledger-reduce-skew`, `ledger-print-hand`, `ledger-show-edit-history`). `lib/settings.ts::readLedgerSettings()` reads them in the async root layout via `next/headers` → `cookies()` and `settingsToHtmlAttrs()` converts to the HTML attributes. `theme` itself stays owned by `next-themes` (its own cookie + `localStorage`).
  Plan:      A client Zustand store will mirror the cookies in Phase 5.5 when the `/settings` route ships. Writers (the eventual settings page) will `document.cookie = ...` + call the store setter; readers on the client will consume the store. For Phase 1–4, devs flip the cookies from DevTools to exercise every branch.
  Rationale: SSR-correct by construction (cookies are always available before HTML emits), no JS-driven class cascade, no reliance on a hydration-time effect that could flash motion/skew. Rejects `localStorage` alone (not SSR-readable) and rejects a single JSON cookie (harder to set/inspect from the eventual `/settings` form).
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 2 · `paper-grain.png` build-time bake deferred

  Context:   Phase 2.2 listed `public/textures/paper-grain.png` as "placeholder generated at build time from `feTurbulence`." Baking a PNG from an SVG that relies on filter primitives (`feTurbulence`, `feColorMatrix`) requires a real rasterizer — `sharp`, `@resvg/resvg-js`, or `puppeteer`-style headless rendering — none of which are currently in the project's dependency graph.
  Decision:  Ship only the tileable SVG placeholder (`public/textures/paper-grain.svg`). The `<PaperGrain>` primitive consumes it via `background-image: url(...)` with CSS-repeat per §7.6 + Spike 2 verdict. No component change needed when the PNG lands; `<PaperGrain>` updates the single `url()` reference.
  Rationale: Browsers cache rasterized SVG backgrounds as bitmaps, so the tile is effectively a PNG once painted. Adding a native rasterizer as a build dependency for a single placeholder asset is poor ROI; the real swap is Chien's photographed grain (Asset A1) in Phase 8. If Phase 9.1's performance sweep shows the SVG cache missing on mobile, we revisit then.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 3 · `<MarginNote>` defaults to Patrick Hand, not Caveat

  Context:   §4.6 of the spec says "Pen-navy Caveat, hand-s." That conflicts with §2.3, which explicitly forbids Caveat below 24px and for any Vietnamese content. `hand-s` is 14–16px and Vietnamese margin notes are a core use case ("sửa lại mai", "ngon!", place names, people's names).
  Decision:  Default `<MarginNote>` to `font-hand` (Patrick Hand) at `text-hand-s`. Expose `hand="signature"` as an opt-in for English-only display flourishes at 24px+ (signatures, ornamental notes). The 14–16px floor is enforced by `text-hand-s`, not by the hand prop.
  Rationale: §2.3 is the stronger rule — it's the typography law that prevents illegibility. §4.6's Caveat reference reads as a holdover from the earlier design when margin notes were assumed English-only. Default to the safer hand; let callers opt up to Caveat when the content is display-grade English.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 3 · `data-ledger-tilt` is the universal reduce-skew hook

  Context:   Phase 3 lands eight components that tilt — `<FieldLine kind="hand">`, `<Stamp>`, `<TapeStrip>`, `<MarginNote>`, `<CarbonSlip>`, and any future handwriting-bearing surface. Phase 7 requires all of them to flatten to 0° when `data-reduce-skew="1"` is set (or when `prefers-reduced-motion: reduce` is active per Spike 6). A per-component conditional in every file was going to rot — easy to forget, easy to miss when hooking new components.
  Decision:  Every tilted DOM node carries a `data-ledger-tilt` attribute and writes its rotation as an inline `transform: rotate(...)`. Two rules in `app/globals.css` flatten them at the layer:
               `[data-reduce-skew="1"] [data-ledger-tilt] { transform: none !important; }`
               `@media (prefers-reduced-motion: reduce) { [data-ledger-tilt] { transform: none !important; } }`
             `!important` defeats the inline rotation — that's the intent of the override.
  Rationale: One rule enforces the invariant across every present and future component. New tilted components only need to mark the node with `data-ledger-tilt`; no JS, no theme-aware prop drilling, no per-component CSS. `!important` is the correct tool here because the inline style is itself the baseline that the preference overrides.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 3 · Stamp rotation uses a dedicated `stampRotationFor(id)` helper

  Context:   §2.4 says stamps are "always rotated 4–8deg." Existing `tiltFor(id, maxDeg)` returns a value in `[-maxDeg, +maxDeg]` linearly, which means many seeds land near 0° — a stamp that's "almost straight" reads as a designed badge, not a slammed-down rubber stamp.
  Decision:  Add `stampRotationFor(id, minDeg=4, maxDeg=8)` to `lib/seed-rotation.ts`. Hash the id, take the low bit as sign, take the rest mod the [min, max] range as magnitude. Stamps never land in the neutral zone.
  Rationale: The spec's tolerance matters — the reason stamps are rotated at all is that a worn, human-applied stamp is never axis-aligned. Bending the seed to respect that keeps the metaphor honest without a new prop surface. `tiltFor` stays cheap for handwriting (which should look close to straight most of the time).
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 3 · `<CarbonSlip>` pink derived via `color-mix` instead of a new token

  Context:   §4.8 specifies the slip's background as `#f7d8d0` — a pink tint. That color doesn't exist in the §1 palette and has no Midnight counterpart. Adding a dedicated `--color-carbon-pink` for both themes would bloat the token set for a single component; hardcoding `#f7d8d0` would break the Midnight theme.
  Decision:  Compute the background at render time via `color-mix(in srgb, var(--color-stamp-red) 14%, var(--color-paper))`. On Day that resolves to a warm pink near `#f4d6cd`; on Midnight it resolves to a muted ember against the dark leather paper — in-palette on both themes automatically.
  Rationale: Zero token bloat, zero theme drift, and the resulting color is derived from existing §1 tokens so it shifts correctly if either ever changes. `color-mix` is supported in every browser matrix we target (Chromium 111+, Firefox 113+, Safari 16.2+).
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 2 · Decoration primitives are absolute overlays

  Context:   `<RuledLines>`, `<MarginRule>`, and `<PaperGrain>` each need to cover the full parent surface without claiming layout space — consumers (future `<Page>`, `<CarbonSlip>`, dialogs) must be able to stack them behind content and keep interacting with the normal flex/grid layout of the page body.
  Decision:  Each primitive renders as `position: absolute; inset: 0` (MarginRule as a 1px `top-0 bottom-0` stripe), with `pointer-events: none` and `aria-hidden="true"`. Consumers wrap a `position: relative` surface and stack the overlays as the first children; page content follows in the same surface.
  Rationale: Zero layout side-effects, single contract for every decoration primitive, accessibility-correct by construction (decorative SVG stays invisible to AT per §9). The shape generalises cleanly to `<TapeStrip>`, `<Stamp>`, `<CoffeeRing>` in Phase 3.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 1 · Geist (sans/mono) kept loaded through Phase 5

  Context:   Paper Ledger has no role for Geist — the text faces are Crimson Pro (serif), Courier Prime (typewriter), Patrick Hand (hand), Caveat (signature), Archivo Black (stamp), Homemade Apple (hurried hand). The natural instinct was to remove the Geist imports from `app/layout.tsx`.
  Decision:  Keep Geist imports for now. shadcn chrome still on unmigrated pages (all of `/dashboard`, `/chat`, `/login`) references `font-sans` / `font-mono` and expects Geist. Tailwind's `--font-sans` / `--font-mono` tokens in `@theme inline` already bridge to `var(--font-geist-sans)` / `var(--font-geist-mono)`.
  Rationale: Remove Geist only after Phase 5 finishes page migration — any page still using `font-sans` would otherwise fall back to a system font mid-migration. The delete is a one-line follow-up and will land in Phase 9.1 (bundle audit).
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
