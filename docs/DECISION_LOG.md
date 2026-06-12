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

## 2026-06-12 · Phase 7 · Assets are SVG-first; A2–A8 drawn in-code; PNG bake exists as tooling only

  Context:   The asset inventory assumed Chien would hand-draw raster/vector files and deliver them for swap-in. Chien opted to have the assets drawn in-code as SVG instead (subagent pass, 2026-06-12), and asked whether anything still needs to be a PNG.
  Decision:  SVG is the canonical format for every Paper Ledger asset. A2–A8 shipped as drawn SVG paths inside their components (A8 in `public/glyphs.svg`). Added `scripts/bake-assets.mjs` (`pnpm bake:assets`, `@resvg/resvg-js` devDependency) to rasterize any asset SVG to PNG on demand. Baked the A1 grain as a trial: 94KB against the 30KB budget — noise doesn't PNG-compress — so the 1.5KB SVG tile stays at runtime and the PNG was discarded. A1's real swap now waits on a photographed grain; A11 (curved arrow) and A12 (underlines) remain open.
  Rationale: The browser bitmap-caches the SVG background tile after one rasterization, so the PNG's only win was decode predictability — not worth 60× the bytes. Keeping the bake script costs one devDependency and gives a one-command path to raster output whenever a future asset (photographed grain, social previews) genuinely needs it. resvg implements SVG 1.1 filters, so even `feTurbulence` textures bake correctly; note it rejects `--` inside XML comments, which the script strips before parsing.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-06-12 · Middleware · Public asset files exempted from the auth matcher

  Context:   Asset A8 (the hand-drawn glyph sprite) never rendered for unauthenticated visitors: `<use href="/glyphs.svg#…">` fetches the sprite without a session, the middleware matcher caught `/glyphs.svg`, and the redirect handed the browser the login page's HTML instead of SVG — so every `<use>` silently rendered nothing on `/login`, `/spikes/*`, and `/design-system`. Authenticated pages masked the bug. (The sprite root also carried `style="display:none"`, which Chromium honours for externally referenced symbols; swapped for the standard zero-size root while debugging.)
  Decision:  Add `glyphs\.svg` and `textures/` to the middleware matcher's exclusion group, alongside the existing `_next/static` / icon exemptions. Public static art is now served without touching auth.
  Rationale: The "auth is centralized in middleware.ts" invariant is about routes and data, not decorative static files — excluding them at the matcher keeps the auth code path untouched. Listing the two names explicitly (rather than excluding any path with a dot) keeps the matcher auditable: adding a new public asset is a deliberate one-line change.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-04-21 · Dashboard · Native `<select>` replaced by `<PaperSelect>`; range picker collapses to a chip

  Context:   The dashboard's six-pill range picker wrapped to two rows and duplicated overlapping presets ("This week" alongside "Last 7 days"). The three form selects — `<QuickAdd>`, `<EntrySlip>`, `<Slip>` (recurring) — used native `<select>`, so their menus popped as the host OS dropdown and broke the paper aesthetic in a way no styling could fix.
  Decision:  Ship `app/_components/paper/PaperSelect.tsx` — a custom combobox/listbox primitive with two variants: `field-line` (underlined handwritten trigger, used by the three forms) and `chip` (bordered paper pill, used by the new range picker). All four call sites migrated in one pass. `<DateRangeTabs>` now renders a single chip `LAST 7 DAYS · Apr 15–21 ▾` driven by `PaperSelect`, replacing the six pills. Mobile variant deliberately not specialised — scope-bounded per Chien.
  Rationale: Doing the migration in one PR avoids a dangling "some selects are paper, some are native" state. `PaperSelect` is the natural home for the paper listbox — every previous form select already leaned on the same underlined-handwritten treatment, so the field-line variant is a direct translation with no styling debt. The chip variant falls out of the same primitive via `renderTrigger`, which is cheaper than building a second popover from scratch. Keyboard model mirrors native `<select>` (Space/Enter/↑/↓/Home/End/Esc) so muscle memory carries over.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-04-21 · Phase 6 · Ledger-keeper voice lives in `lib/ledger-keeper-prompt.ts`; `formatVND` gains a space

  Context:   Phase 6 asks for a single clerical-1962 voice across every AI surface (`/api/log`, `/api/report`, `/api/custom`, chat agent) so the Ledger-keeper persona reads consistently regardless of which endpoint the user hits. The four endpoints historically grew their own instruction blocks — each drifting on amount formatting (`đ` vs `₫`, no space vs space) and signing off differently.
  Decision:  Ship `lib/ledger-keeper-prompt.ts` exporting `LEDGER_KEEPER_PERSONA` + a `ledgerKeeperInstructions(task)` helper. Each endpoint now wraps its task-specific instructions through the helper so voice rules (no exclamation marks, no emoji, ledger vocabulary, `— LK` sign-off) live in one place. `/api/log` retains its `Succeeded` / `Failed: …` contract since Apple Shortcuts parses the text — the prompt carves out an explicit exception for that endpoint. `formatVND` in `lib/dashboard/utils.ts` updated from `1.180.000₫` to `1.180.000 ₫` per §10; the `đ` usage in `/api/report` full-mode table and in prompts is out. Duplicate `todayStamp()` helpers in `/dashboard`, `/dashboard/recurring`, `/chat`, `/settings` collapsed onto `formatPrintedDate(new Date())` from `lib/paper-format.ts`.
  Rationale: One persona block beats four drifting ones, and the endpoints still own their own behaviour below the persona — the helper only prepends voice. The `/api/log` carve-out is unavoidable (the script-facing response shape is load-bearing); documenting it inline in the prompt keeps future edits from accidentally humanising that endpoint. The `formatVND` space is the system spec and was the only deviation across every call site; fixing it at the source propagates cleanly through dashboard / recurring / chat tool receipts without per-caller edits.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-04-21 · Phase 5.6 · Swiss nuke — flag removed, side routes collapsed, Swiss doc archived

  Context:   All five Phase 5 migrations shipped behind `NEXT_PUBLIC_PAPER_UI`, each keeping a `/foo-paper` side route + `_swiss.tsx` fallback for rollback. With the Paper chrome proven on desktop, keeping two copies of every route is pure tax — every edit risks drifting Swiss, and the flag obscures what's actually live.
  Decision:  Delete the gate wholesale. Each `/foo-paper` side route's components move into the real route (`app/login-paper/_form.tsx` → `app/login/_form.tsx`, same for `-paper` siblings under `/dashboard`, `/dashboard/recurring`, `/chat`). Each `_swiss.tsx` + Swiss `_components/` directory is deleted. `lib/paper-ui-flag.ts` removed; `middleware.ts` loses the `/login-paper` whitelist. `docs/dashboard-design-system.md` renamed to `docs/swiss-design-system-archive.md`; `CLAUDE.md` and `docs/INDEX.md` now point at Paper as the sole live system with the archive as portfolio reference.
  Rationale: Phase 5.6 ("Swiss nuke") is the formal close-out the roadmap always called for; it just happens now instead of at launch. Mobile (Phase 9) + a11y (Phase 10) still need work, but they build on the Paper chrome either way — there is no scenario in which Swiss gets revived, so maintaining it is dead weight. The rollback story is now `git revert`, which is fine for a personal tracker.
  Reviewer:  Chien

---

## 2026-04-21 · Phase 5.5 · `/settings` ships without a flag gate or Swiss fallback

  Context:   Phase 5.5 introduces a brand-new `/settings` route. Every prior Phase 5 migration used a `/foo-paper` side route plus a `NEXT_PUBLIC_PAPER_UI` gate on `/foo` to preserve the Swiss predecessor for instant rollback. `/settings` has no predecessor, and the settings cookies are already read by the root layout regardless of the flag (Phase 1.3).
  Decision:  Ship directly at `app/settings/page.tsx` on the Paper chrome. No `/settings-paper` side route, no gate, no Swiss fallback. Theme toggle routes through `next-themes` (`useTheme()`); the four cookie-backed settings post to a `setLedgerSetting` server action that writes the cookie + `revalidatePath('/', 'layout')`.
  Rationale: The gate pattern exists to protect against regressions in an already-shipped surface. A new route has nothing to regress against; adding the plumbing would be ceremony. The settings themselves are universal — they affect the `<html>` data-attributes the root layout emits, which apply even while the main chrome is still Swiss.
  Reviewer:  Ledger-keeper (pending Chien)

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

## 2026-04-21 · Phase 4 · `<HandDrawnChart>` ships on raw SVG, not Recharts

  Context:   §4.10 calls for bar / line / area charts with `filter: url(#hand-wobble)` on every stroke, a single bottom rule (no grid), no tooltip, no legend, and dashed-ellipse annotations. The roadmap left the choice open: "start on top of Recharts, switch to raw SVG if it can't compose with our filters cleanly." Recharts is already a dependency, so the natural first attempt was a Recharts wrapper.
  Decision:  Render the chart as a single raw `<svg>` with explicit path math for each kind (bar, line, area). `#hand-wobble` is applied once to the data `<g>`, annotations, and baseline. No Recharts usage in `<HandDrawnChart>`.
  Rationale: Applying an SVG filter at Recharts' root surface breaks its event/tooltip hit-testing, and we don't want tooltips or legend chrome anyway. The raw path math (`xFor`, `yFor`, bars rect, line polyline + dots, area closed path to baseline) is ~100 lines total — less than configuring Recharts Bar/Line/Area with custom shape functions to thread filters through. When Phase 5 wires dashboard data in, consumers format the `{ label, value }[]` themselves — same shape Recharts wanted anyway. Recharts stays in the tree for any future chart that needs interactivity we explicitly opt into.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 4 · `<LedgerTable>` delegates drill-in rendering

  Context:   §4.3 says "clicking a row lifts it as a paper-clipped detail card on top of the page." Implementing the lift inside `<LedgerTable>` would pin it to one layout (absolute-positioned card, fixed z-index, fixed reflow model) and couple it to the consumer's page chrome. Dashboard, Recurring, and Reports each want a different detail shape (fields vs. chart vs. attachments).
  Decision:  The table exposes two props — `onDrillIn(row)` and `activeRowId` — and nothing more. Consumers render the paper-clipped detail card themselves, positioned wherever their page layout wants it, keyed by `activeRowId`. Rows become keyboard-activatable (`role="button"`, `tabIndex=0`, Enter/Space) automatically when `onDrillIn` is set.
  Rationale: Single-responsibility — the table handles row state and affordance, the page handles the detail view. The `/design-system` prototype shows the canonical composition (LedgerTable + slide-in FieldLines inside a PaperClip'd card). Consumers that want a different detail treatment don't have to fight the component.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 4 · Row state driven by `data-status`, not component variants

  Context:   §6 defines eleven states (hover, focus, pressed, disabled, loading, empty, error, success, AI-suggested, edited, deleted-recently). Rendering each as a dedicated `<LedgerTable>` variant (`<AILedgerRow>`, `<VoidedLedgerRow>`) would explode the API; every new state would touch the table's prop surface.
  Decision:  Add a single `status?: 'default' | 'ai-suggested' | 'deleted-recently'` field on the row data, projected onto the `<tr>` as `data-status`. CSS classes (`.paper-row-ai`, `.paper-row-voided`) gate every visual transform — pencil-stroke filter, VOID strike, 5s fade — keyed on the attribute. Edit history rides orthogonally via `previousAmount`, which the amount cell threads into `<RedStringCorrection>` only if present.
  Rationale: Every future state (e.g. "pending approval") becomes one enum value + one CSS rule, not a new component. `data-status` is addressable from DevTools, so debugging a stuck row is one selector away. Matches the convention we already use (`data-theme`, `data-reduce-skew`, `data-ledger-tilt`, `data-show-edit-history`).
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 4 · `<TallyMarks>` renders as SVG strokes, not Caveat text

  Context:   §4.11 specifies tally marks "in Caveat, navy." Caveat's "I" is a reasonable vertical stroke, but the diagonal slash that crosses the first four marks in a group of five is impossible to typeset — there's no glyph for it — and forcing Caveat to stretch or rotate an underscore to fake it looked worse than every alternative.
  Decision:  Draw every stroke as an inline SVG `<path>` with `#hand-wobble` applied, pen-navy default, 1.5px stroke width. The spec's intent (pen-navy, hand-drawn, group-of-five with a slash) holds; the glyph source shifts from the font to our own path geometry.
  Rationale: Consistent with `<InkBlot>`, `<TapeStrip>`, `<PaperClip>`, `<TornCorner>`, `<FoldCrease>` — every hand-drawn primitive so far ships as inline SVG and swaps for a Chien asset via the same path. Keeping `<TallyMarks>` on text would have made it the outlier.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 2 · Decoration primitives are absolute overlays

  Context:   `<RuledLines>`, `<MarginRule>`, and `<PaperGrain>` each need to cover the full parent surface without claiming layout space — consumers (future `<Page>`, `<CarbonSlip>`, dialogs) must be able to stack them behind content and keep interacting with the normal flex/grid layout of the page body.
  Decision:  Each primitive renders as `position: absolute; inset: 0` (MarginRule as a 1px `top-0 bottom-0` stripe), with `pointer-events: none` and `aria-hidden="true"`. Consumers wrap a `position: relative` surface and stack the overlays as the first children; page content follows in the same surface.
  Rationale: Zero layout side-effects, single contract for every decoration primitive, accessibility-correct by construction (decorative SVG stays invisible to AT per §9). The shape generalises cleanly to `<TapeStrip>`, `<Stamp>`, `<CoffeeRing>` in Phase 3.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5 · `NEXT_PUBLIC_PAPER_UI` gates the migration, per-route branch

  Context:   Phase 5 of the roadmap migrates five pages page-by-page behind a feature flag. The flag needs to (a) let us A/B internally before the flip, (b) support rollback without a redeploy, (c) keep the Swiss fallback live on every migrated route until Phase 9 deletes it. Options on the table: runtime env var, cookie, middleware rewrite, build-time constant.
  Decision:  A single `NEXT_PUBLIC_PAPER_UI` env var, read through `lib/paper-ui-flag.ts::PAPER_UI_ENABLED`. `'1'` = Paper, anything else = Swiss. Each migrated page (`/login`, and the four to come) imports the flag and branches between a `_swiss.tsx` fallback and the paper composition. Side routes (`/login-paper`, …) stay reachable regardless of the flag for parity review — middleware whitelists them alongside `/login`.
  Rationale: `NEXT_PUBLIC_*` inlines at build, so the branch is a tree-shakable constant — zero runtime cost, no hydration mismatch. Per-page branching means unmigrated pages pay nothing; Swiss deletion in Phase 9 is one file + one import away. Rejected: middleware rewrite (forces full-page redirect, kills the clean side-by-side comparison), cookie (needs SSR wiring we already spent on `ledger-*` preferences and would add a second story without benefit). Rejected: a single top-level switch in `layout.tsx` — that forces every Phase 5 page to migrate together, which defeats the point of shipping one route per PR.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5 · `/login` renders on a `<CarbonSlip>`-shaped form, not `<Page>` body content

  Context:   §4.1 + §4.8 suggest a few compositions for auth. The form could sit directly on a `<Page>` ruled body (printed labels + ruled inputs) or on a `<CarbonSlip>` overlay (pink-tinted, stamp-red bordered, tilted). The Swiss original is centered in a plain card; the migration should improve the metaphor, not just re-skin it.
  Decision:  The page is a `<Page>` with tape strips and a "Daily Register" title; the form is a carbon-slip-shaped `<form>` overlaying the ruled body. Inputs use `<FieldLine kind="hand">`-matching visuals (typewriter label above a 1px-ink-underlined Patrick Hand input, pen-navy) — rebuilt inline here since `<FieldLine>` is display-only per §4.2 and the editable sibling was not planned for Phase 4. Submit is a pressed-paper button (Archivo Black, border-2) that locks on `checking` and fires either a navy `RECORDED` thump (success → navigate after 700 ms) or a red `REJECTED` thump (failure → clear password + stamp-red margin note).
  Rationale: The slip treatment is the correct metaphor for an entry pass — it's literally the form the clerk hands you. Putting the form on a carbon slip gives us the stamp-red border "this is an official document" affordance for free, keeps the pink tint derived from `color-mix` (no new token), and sits naturally on top of the ruled page. Rejected: inlining into the ruled body (too plain for a high-signal action), stamping a `<FieldLine>` onto a non-slip card (loses the bordered-form feel). The 700 ms recorded-hold is under §8's 1 s ceiling and long enough for the stamp to be seen — redirect sooner and the user never sees the confirmation.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.2 · paused standing orders render as torn-corner receipts, not muted rows

  Context:   The `recurring_expenses` schema only carries `active: boolean` — no separate `archived` column. The roadmap asks for "LedgerTable, stamps for active/paused, torn-corner on archived." On the live Swiss page, paused items sit in the same table at `opacity-40` — fine as a placeholder, but the paper metaphor needs a physical affordance: an item that's no longer "on the books" is physically set aside, not just dimmed.
  Decision:  Split the register into two surfaces. Active orders stay on the ruled body as a `LedgerTable`-shaped table (32px rows, typewriter labels, oldstyle-tabular amounts, `paper-row-interactive` highlighter) with a navy `<Stamp text="Active">` in the actions column. Paused orders are pulled out into a "Set aside" stack — each item rendered as a small receipt on `paper-2`, tilted by `tiltFor(id)`, with `<TornCorner corner="tr">` overlaid and a red `<Stamp text="Paused">`. "Paused" doubles as "archived" for this schema; when/if we add a true `archived` state the torn-corner treatment moves cleanly to it.
  Rationale: Torn corners want a surface to sit on, not a table row — a corner-tear absolutely positioned over a `<tr>` fights row padding and doesn't read as "this slip is torn" because the surrounding rows are intact. Receipts on `paper-2` give the tear something to eat into. The two-surface split also separates the keyboard affordances cleanly — active items are a table row keyboard users scan; paused items are focusable cards they revisit less often.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.2 · `/dashboard/recurring` delegates to the Paper page component, not a rebuild

  Context:   Phase 5.2 needed the same flag pattern as Phase 5.1 (`/login` → `/login-paper`): a side route kept reachable for parity review, plus a gated main route that branches on `PAPER_UI_ENABLED`. For `/login` the branch imports a named client component (`LoginForm` from `/login-paper/_form`) and composes its own chrome. Here the Paper page is server-rendered (Supabase data fetched in the page component), so the "import the client form" pattern doesn't apply cleanly.
  Decision:  `/dashboard/recurring/page.tsx` imports the default export of `/dashboard/recurring-paper/page.tsx` and renders it directly when `PAPER_UI_ENABLED` is on. Both routes remain reachable — the side route for parity review, the gated route for users — and the data-fetch lives once in the Paper page. Swiss preserved in `_swiss.tsx`; `recurring-table.tsx` had its `../page` import rewired to `../_swiss` because the type moved with the Swiss copy.
  Rationale: Importing another route's default export is supported by the App Router (server components compose freely) and keeps the Paper view as the single source of truth. Rejected: factoring the Paper composition out into a neutral `_paper.tsx` module that both routes import — adds a third file for no benefit, since `/dashboard/recurring-paper` already is that neutral module. Under a single request the Supabase read runs once; the only cost is a second read when someone navigates between the two routes, which is acceptable for a dev-only parity flow.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.3 · `/chat` rebuilt on plain primitives, not the ai-elements `<Message>` / `<Conversation>`

  Context:   `/chat` (Swiss) composes on the shadcn-shaped ai-elements kit — `Message`, `MessageContent`, `Conversation`, `PromptInput`, `Tool*`. Each of those reaches into `@/components/ui/*` (button, tooltip, input-group, spinner, collapsible). Dropping a Paper chrome on top would mean fighting `is-user` bubble styles, pill toolbars, and a `max-w-[95%]` bubble container that's wrong for a ledger page. A surface swap this shallow doesn't justify re-theming five kits of primitives.
  Decision:  The Paper chat is a standalone `_chat.tsx` client component that uses `@ai-sdk/react`'s `useChat` directly plus `streamdown` for markdown rendering. Conversation is a plain `<ol>`, tool calls are native `<details>` + `<summary>`, and the compose slip is a raw `<form>` + `<textarea>` styled to match `/login` and `/dashboard/recurring-paper`'s pink carbon form. No ai-elements imports, no shadcn `<Button>` or `<Collapsible>`. Streamdown plugins (`cjk`, `code`, `math`, `mermaid`) ship identically so rendered Markdown fidelity holds.
  Rationale: Every ai-elements piece carried at least one Swiss anti-pattern for Paper (§11) — rounded-pill bubble, tooltip-wrapped icon buttons, Spinner for submit state. Re-implementing around them costs more than rebuilding from primitives we already own. Rejected: theming the ai-elements pieces via class overrides (the bubble's `rounded-sm` and `bg-foreground` live in the component, not via tokens — every consumer branch would need a `data-paper` fork). When Phase 9 deletes the feature flag, the ai-elements files stay live only if something else imports them; otherwise they're dead code to drop alongside `components/ui/button-group.tsx` etc.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.3 · `— LK` signature is a typographic flourish in the UI, not (yet) emitted by the model

  Context:   §10 of `DESIGN_SYSTEM.md` says the Ledger-keeper signs replies with `— LK` in pencil-gray. Two ways to land that: (a) teach the model to write `— LK` at the end of every reply, or (b) render the signature in the UI as a typographic element after the message completes.
  Decision:  Render in the UI for Phase 5.3. The signature appears on every fully-streamed assistant reply as a Caveat hand-signature line, pencil-gray, with a seeded tilt. Model-level sign-off waits for Phase 6 (voice pass), where the shared `lib/ledger-keeper-prompt.ts` will take ownership of persona.
  Rationale: Phase 5.3 is explicitly chrome-only per the roadmap ("Full voice pass happens here in Phase 6; this phase just rebuilds the chrome"). A UI signature is a one-component flourish, deterministic, and it survives model changes. When Phase 6 teaches the model to sign, we keep or drop the UI signature based on whether doubled sign-offs read clean — easy to collapse to one line later. Rejected: hard-coding the signature as the last token of every response pre-Phase-6 (would violate the phase's chrome-only scope and touch the API route).
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.3 · Caveat `— LK` signature is OK despite "no Caveat for Vietnamese" rule

  Context:   DECISION_LOG 2026-04-21 "Caveat font does not carry Vietnamese subset" and §2.3 of the spec both forbid Caveat for content that could contain Vietnamese. The Paper chat renders the Ledger-keeper's sign-off as Caveat `— LK`, which sits directly under Vietnamese reply bodies.
  Decision:  Allowed — the sign-off string is a fixed, English-only glyph sequence ("— LK"). Typography rule applies to *content that might contain Vietnamese*; `— LK` never will. Patrick Hand remains required for any user-authored or content-shaped text.
  Rationale: §2.3 explicitly scopes Caveat to "signatures & English-only display flourishes only" (24px+). `text-hand-signature` is 24px. The signature is outside the translatable content surface, so the risk the rule guards against (stacked-tone fallbacks to Latin) can't arise. Documented here so a future audit doesn't flag it as a regression.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.3 · tool calls render as `<details>` receipts inline, not as separate paper-clipped slips

  Context:   Tool parts (currently just `executeSQL`) land mid-reply and need a way to display their state (running / done / error), input (SQL), and output (rows). Two shapes considered: (1) a paper-clipped slip floating above the Ledger-keeper's reply (§4.7 metaphor), (2) a flat typewritten receipt folded into the reply in-flow.
  Decision:  Flat inline receipt using native `<details>` + `<summary>` with a state stamp in the summary corner. Running → `<EraserMarks>`; completed → navy `Filed` stamp; error → red `Error` stamp (and auto-opens). Input/output both render in Courier Prime with tabular-nums.
  Rationale: Paper-clipped floats are for *modals* and drill-ins (§4.7) — a tool call is mid-narrative chrome, not a surface to be lifted. Inline receipts also avoid hit-test and z-index fights with the sticky compose slip. `<details>` is keyboard-native and announces state changes without custom ARIA. Rejected: the ai-elements `<Tool>` + `<Collapsible>` pair (would re-introduce shadcn chrome the §5.3 split just removed).
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.3 · document scroll + sticky compose slip, no stick-to-bottom container

  Context:   Swiss `/chat` uses `use-stick-to-bottom` inside a bounded `h-dvh` flex column: header / scrollable conversation / fixed input. Paper Ledger wants a "running correspondence book" read — the page is a long document that grows downward, not a three-row app shell.
  Decision:  The Paper chat inherits the document scroll container. Conversation is a flowing `<ol>` inside `<Page>`'s main; the compose slip uses `position: sticky; bottom: 16px` so it rides the viewport bottom once the page is long enough to scroll. Auto-scroll to bottom runs on `messages.at(-1)?.id` change — every new message id, never on token delta — so streaming doesn't yank users who've scrolled up.
  Rationale: The three-pane shell is a chat-app idiom; Paper Ledger is a page metaphor. Document scroll also keeps the `<Page>` tape strips and ruled lines visible during normal use. `use-stick-to-bottom` auto-scrolls on every render, which on a streaming reply means ~5–20 scroll events per second — noticeable in dev. Per-message-id scrolling is one event per turn, which matches the "new entry lands" rhythm of the rest of the app. Rejected: bounded conversation container (loses the page read); rejected: removing the sticky input (forces the user to scroll for the next entry on long conversations).
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.2 · hero shows estimated monthly outlay, not raw sum of active amounts

  Context:   The Swiss page shows `sum(active.amount)` as the "monthly total." That's correct only when every active order is monthly — a yearly order of 7.200.000 ₫ would inflate the number as if the user paid 7.2M every month. As the register grows to mix daily/weekly/yearly cycles, the single-sum heuristic drifts further from what "on rotation per month" means.
  Decision:  Normalise each order to a monthly amount before summing. 30-day month for daily, 365/7/12 weeks-per-month for weekly, `amount/12` for yearly. The hero still prints the bold serif total, but it's now a running estimate of monthly outlay regardless of cycle mix.
  Rationale: The metaphor is "what falls off the ledger per month on rotation" — a monthly estimate matches the voice. Approximations (30-day month, no DST) are fine at this layer; the number is for orientation, not accounting. The real billing cadence is surfaced in each row's `Cycle` column. Rejected: showing one total per cycle (four hero lines competes with the actual register below); rejected: a toggle between "as-charged" and "monthly-equivalent" — adds UI churn for a spreadsheet-shaped control, wrong register for Ledger-keeper voice.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.4 · `/dashboard` daily chart is hand-drawn inline, not `<HandDrawnChart>`

  Context:   Phase 5.4's daily bars need per-day drill-in (click a bar → `?day=YYYY-MM-DD`) and keyboard a11y — every bar must be a focus target, not just a hover-tooltip. `<HandDrawnChart>` renders an `<svg>` with no hit targets, no selected-state styling, and no income stack. Retrofitting all three into the generic component would leak dashboard concerns (routing, search-param build) into a shared primitive.
  Decision:  Ship a route-local `<DailyChart>` that re-implements the same wobble-filter SVG geometry inline. It stacks income (stamp-red) on top of expense (pen-navy), dims non-selected bars when a `selectedDay` is present, and lays transparent `<rect>` hit targets with `role="button" tabIndex={0}` behind each slot so every bar is keyboard-activatable.
  Rationale: The Phase 4 decision "charts ship on raw SVG, not Recharts" (DECISION_LOG 2026-04-21) already accepted that charts with interaction needs would be bespoke. `<HandDrawnChart>` stays as the simple primitive for read-only charts (e.g. the design-system deck, future report surfaces). Rejected: extending `<HandDrawnChart>` with `onBarClick` + `activeIndex` — pushes wobble-filter geometry toward a Recharts shape, exactly what the earlier decision refused.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.4 · Category chart stays horizontal, drops `<HandDrawnChart>`

  Context:   The Swiss `/dashboard` renders categories as a ranked horizontal bar list — conventional for top-N ranking, and well-matched to the paper metaphor (think: a typewritten accounts-receivable list). `<HandDrawnChart kind="bar">` is vertical-axis only.
  Decision:  Route-local `<CategoryChart>` renders an `<ol>` of rows — each row = Patrick Hand category label + oldstyle-tabular amount + a `#hand-wobble`-filtered `<rect>` strip sized to the top category. Top row swaps to `stamp-red`; the rest ride `pen-navy`.
  Rationale: A vertical chart of five categories would fight the ruled body rhythm and duplicate the daily chart's visual. Horizontal ranking reads "who took the biggest slice this week" in one glance, which is the Swiss version's job too. Rejected: rotating `<HandDrawnChart>` 90° — the label + axis layout is hard-coded vertical; would be more plumbing than a 20-line bespoke list.
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.4 · Range filter drops the custom-calendar popover

  Context:   The Swiss dashboard pairs seven presets with a `react-day-picker` popover for arbitrary ranges. The popover is a shadcn composition (Radix Popover + Calendar) that doesn't read as "paper" and that would need a ground-up paper port.
  Decision:  Phase 5.4 ships presets only, as a flat row of paper-tab pills (`<DateRangeTabs>`). Custom-range selection — plus the rest of user settings — is deferred to Phase 5.5's `/settings` route, where a proper paper calendar primitive lands alongside other preferences.
  Rationale: The Swiss `range=custom&from=...&to=...` URL shape is preserved in the server code, so a manually-typed URL still loads a custom range — just no UI to pick one until 5.5. This keeps the 5.4 diff bounded and removes a Radix dependency from the paper chrome. Rejected: inline popover in paper chrome (doesn't match the tactile affordance language — popovers are screen-app idiom, not document idiom).
  Reviewer:  Ledger-keeper (pending Chien)

## 2026-04-21 · Phase 5.4 · Drill-in opens the edit slip above the ledger, not a modal

  Context:   The Swiss transactions table opens a shadcn `<Dialog>` to edit a row. A modal feels right in an app shell — a scrim darkens the world, the form claims focus — but it breaks the document metaphor Paper Ledger trades on. The page should read as a continuous sheet; interactions should sit *on* the sheet, not *above* it.
  Decision:  Row drill-in mounts the shared `<EntrySlip>` (same carbon-slip shape as `/login` + `/dashboard/recurring-paper`) inline at the top of the ledger section, with a `<PaperClip>` decoration at the top-right corner as the "pinned for review" affordance called for by §4.7. Close / Save / Discard all live on the slip.
  Rationale: Keeps the ruled body unscrimmed and the page scrollable to see the edit in context ("I'm amending *this* row on *this* register"). Also unifies add + edit on one component — the slip has an optional `onDiscard` prop for the edit flow. Rejected: shadcn dialog with paper chrome (dialog is still a modal mechanically — scrim + focus-trap + portal); rejected: per-row inline editing (forces every row to carry form state even when idle).
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
