# Paper Ledger — Adoption Roadmap

> Migrating the expense tracker from the current Swiss/International system (`dashboard-design-system.md`) to the full **Paper Ledger** system (`DESIGN_SYSTEM.md`).
>
> Target quality: **portfolio-grade**. No shortcuts. Months, not weeks.
>
> **Split of labor.**
> - **Code (me, Claude):** tokens, components, page migration, SVG filter plumbing, copy pass, a11y, motion, perf.
> - **Assets (Chien):** hand-drawn SVGs, rubber stamp impressions, ink blots, paper-clip / torn-corner / fold-crease, glyph sprite, paper texture photography.
>
> **Blocking rule.** Assets are never on the critical path. Every component that will eventually consume a hand-drawn asset ships first with a coded placeholder (geometric SVG, `feTurbulence`-generated shape, or Unicode glyph) behind the same component API. When Chien delivers a real asset, we swap the file — no component rewrite.

---

## Asset inventory (what Chien will hand-draw, eventually)

Tracked so nothing is forgotten. Order suggests priority, but any order is fine — everything has a coded placeholder until replaced.

| # | Asset | Format | Placeholder strategy |
|---|---|---|---|
| A1 | Paper grain texture | PNG (tileable, <30KB) | `feTurbulence`-generated noise at 6% opacity |
| A2 | Coffee ring stain | PNG w/ alpha | SVG ellipse with `feTurbulence` displacement |
| A3 | Ink blot set (3–5 variants) | SVG | `feTurbulence` + `feDisplacementMap` on a circle |
| A4 | Fold crease | PNG w/ alpha | CSS gradient line |
| A5 | Tape strips (2–3 variants) | SVG | yellow-tinted rect + 2 highlight lines |
| A6 | Paper-clip | SVG | geometric stroke path drawn in code |
| A7 | Torn-corner mask | SVG | jagged clip-path generated in code |
| A8 | Hand-drawn glyph sprite (~12) | `public/glyphs.svg` | Unicode fallbacks `❧ ✦ ☞ ✎ ✓ × → ↗ † ‡ ¶ §` |
| A9 | Wax seal (gold, annual accents) | SVG | circle with `feTurbulence`, seal-gold fill |
| A10 | Signature flourish ("— LK") | SVG path | Caveat "— LK" text until replaced |
| A11 | Pen-drawn curved arrow (for annotations) | SVG | SVG quadratic path drawn in code |
| A12 | Hand-drawn underline strokes (single / double / wobbly) | SVG | `feTurbulence` applied to a straight line |

---

## Phase 0 — Foundation & technical spikes

**Goal.** De-risk every hard thing before we touch a single user-facing screen. No visual change ships in this phase.

### 0.1 Repo hygiene
- [x] Create `docs/DECISION_LOG.md` (per §13 of the spec).
- [x] Refactor docs: slim `CLAUDE.md` to invariants + pointer, add `docs/INDEX.md` as table of contents, extract API/database/auth into their own `docs/*.md`. Design-system pointer now references both Swiss (current) and Paper Ledger (target) so the handoff in Phase 1 is a one-line edit.
- [x] Add `app/_components/paper/` directory with a README stub (scope, placeholder-swap contract, folder conventions).
- [x] Add `public/textures/` and `public/glyphs.svg` with placeholder content. `public/glyphs.svg` ships 12 `<symbol>` Unicode fallbacks per asset A8. `public/textures/paper-grain.svg` ships the §7.1 `feTurbulence` recipe, tileable. A2/A3/A4 stay as component-local coded placeholders until Phases 3–4 per the inventory table in `public/textures/README.md`.

### 0.2 Technical spikes (proof-of-concepts, not production)
Each spike is a throwaway `app/spikes/<name>/page.tsx` route, gated at runtime on `process.env.NODE_ENV === 'development'`. Keep them around during the roadmap as a visual regression deck; delete in Phase 9.

1. **Font loading.** Load Crimson Pro, Courier Prime, Patrick Hand, Caveat, Archivo Black via `next/font/google`. Render full Vietnamese diacritic torture strings (`Phở bò`, `Cà phê sữa đá — Cộng Cà Phê`, `Bún chả Đắc Kim`, `Hoàn tiền từ Mai`). Verify Patrick Hand actually renders stacked tones (`ấ ầ ẩ ẫ ậ`) — if not, flag fallback strategy.
2. **SVG filter performance.** Apply `#paper-grain` to a 1440×900 div. Measure FPS on scroll on a mid-tier laptop + iPhone 12. If it hitches, resolve per §7.6 (tile + CSS-repeat instead of filtering the full element).
3. **Deterministic rotation.** Implement `lib/seed-rotation.ts` → `tiltFor(id: string): number ∈ [-2, 2]`. Unit-test that the same id always returns the same tilt across SSR/CSR (this is critical — a different tilt on hydration will feel broken).
4. **`oldstyle-nums` vs `tabular-nums`.** Verify Crimson Pro supports both `font-variant-numeric: oldstyle-nums` and `tabular-nums oldstyle-nums` via OpenType features. Render a column of VND amounts with dotted grouping (`1.180.000 ₫`) — must align under `tabular-nums`.
5. **`data-theme` switch.** Prototype Day ↔ Midnight Ledger toggle. All tokens must swap via CSS variables only — no JS-driven class cascade. Confirm compatibility with `next-themes` (currently in `layout.tsx`).
6. **Reduce-motion / reduce-skew.** Confirm the system `prefers-reduced-motion` media query and a user-controlled override can both collapse rotations to 0 and disable filter-based animations.

**Exit criteria.** Every spike produces a written verdict in `docs/DECISION_LOG.md` with the chosen approach and any residual risks.

**Asset dependency.** None.

---

## Phase 1 — Design tokens & theme infrastructure

**Goal.** Replace the Swiss color/spacing/type tokens with the Paper Ledger ones. App still looks Swiss (because no components consume the new tokens yet), but every new token is in place and switchable.

### 1.1 Tailwind v4 token replacement
- [x] In `app/globals.css`, replace the HSL grayscale palette with the Paper Ledger tokens from §1 (Day + Midnight). Swiss tokens kept alive on the same `[data-theme]` switch so shadcn chrome still renders until Phase 5.
- [x] Switch theme strategy from `next-themes` class (`.dark`) to `data-theme="day" | "night"` on `<html>` (per §12). `attribute="data-theme"`, `value={{ light: 'day', dark: 'night' }}`. `@custom-variant dark` re-bound to `[data-theme="night"]` — DECISION_LOG 2026-04-21.
- [x] Add font families to `@theme`: `--font-serif`, `--font-typewriter`, `--font-hand`, `--font-hand-signature`, `--font-stamp`, `--font-hand-hurried`. next/font variables renamed `--font-*-face` to avoid collision — DECISION_LOG 2026-04-21.
- [x] Add type-scale tokens from §2.5 as CSS custom properties and Tailwind utilities (`text-display-hero`, `text-hand`, `text-label`, etc.).
- [x] Add spacing scale (already close — just audit §3.2) and ruled-line constant (`--rule-spacing: 32px`). Tailwind v4 default scale covers §3.2; `--rule-spacing`, `--margin-rule-offset`, `--margin-rule-offset-mobile` added.
- [x] Expose `font-variant-numeric` utilities: `.nums-oldstyle`, `.nums-tabular`, `.nums-oldstyle-tabular`, `.nums-lining-tabular`.
- [x] Expose letter-spacing tokens for labels (1.5px, 2.5px tracked) — `--letter-spacing-label-s` (0.15em), `--letter-spacing-label-m` (0.25em).

### 1.2 Typography runtime
- [x] `app/layout.tsx` — load all five Paper Ledger fonts via `next/font/google` with proper subsets (Crimson Pro + Patrick Hand carry `vietnamese`; Caveat does not, per §2.3 + DECISION_LOG). Geist kept for Phase 5 shadcn compatibility — DECISION_LOG 2026-04-21.
- [x] Set body default to Crimson Pro 14/1.55 with `font-variant-numeric: oldstyle-nums`. Applied in `@layer base` in `globals.css`.
- [x] Update `<title>` and `<metadata>` — now "Ledger".

### 1.3 Settings scaffolding (groundwork for a11y)
- [x] Plan a `/settings` route shape (don't build yet). Keys: `theme`, `reduce-motion`, `reduce-skew`, `use-printed-font-for-handwritten`, `show-edit-history`. Cookie-per-setting (SSR-safe); client Zustand store deferred to Phase 5.5 with the route itself — DECISION_LOG 2026-04-21.
- [x] Add `<html>` attributes driven by settings: `data-theme`, `data-reduce-motion`, `data-reduce-skew`, `data-print-hand`, `data-show-edit-history`. `lib/settings.ts` → `readLedgerSettings()` + `settingsToHtmlAttrs()` called from root layout.

### 1.4 Rotation seeding
- [x] Ship `lib/seed-rotation.ts` from the spike into production. (Already landed in Phase 0.1; no changes needed.)

**Exit criteria.** `/dashboard` still renders (because nothing consumes the new tokens), but DevTools shows the new CSS vars. Toggling `data-theme` in DevTools visually re-paints the background between `#f6efe0` and `#1a1410` on an empty page.

**Asset dependency.** None.

---

## Phase 2 — Foundation primitives & SVG filter library

**Goal.** Every drawing primitive the system needs. A `/design-system` internal route displays all of them side-by-side for visual regression.

### 2.1 SVG filter defs
- [x] `app/_components/paper/_filters.tsx` — a single `<svg width="0" height="0">` with `<defs>` for `#paper-grain`, `#stamp-wear`, `#hand-wobble`, `#ink-bleed`, `#pencil-stroke`. Mounted once from `app/layout.tsx` as the first `<body>` child.
- [x] Performance gate: §7.6 path chosen up-front — `<PaperGrain>` consumes the tileable SVG (`public/textures/paper-grain.svg`) via CSS `background-repeat` per Spike 2's verdict. `#paper-grain` filter remains available for small decorative elements and is rendered in `/design-system` for regression checks.

### 2.2 Placeholder asset generators
- [x] `public/textures/paper-grain.svg` (placeholder) — tileable §7.1 recipe already ships from Phase 0.1. PNG bake deferred — see DECISION_LOG 2026-04-21 "Phase 2 · `paper-grain.png` build-time bake deferred" (no rasterizer in deps; SVG tile is cached as a bitmap by the browser). Real PNG lands with Chien's photographed grain in Phase 8.
- [x] `public/glyphs.svg` — placeholder sprite with 12 `<symbol>` Unicode fallbacks shipped in Phase 0.1. Ids frozen per `GLYPH_NAMES`.
- [x] `<Glyph name="..." />` component at `app/_components/paper/Glyph.tsx` — typed `GlyphName` union, resolves via `<use href="/glyphs.svg#glyph-{name}" />`. Decorative by default; pass `title` to lift into the a11y tree.

### 2.3 Decoration primitives (code-only, no assets needed)
- [x] `<RuledLines />` — `repeating-linear-gradient` driven by `--color-rule-blue` + `--rule-spacing`, anchored to a 12px top offset per §3.1.
- [x] `<MarginRule />` — 1px `rule-pink` absolute stripe at `--margin-rule-offset-mobile` on <640px, `--margin-rule-offset` from `sm:` up.
- [x] `<PaperGrain />` — tiles `/textures/paper-grain.svg` as a 200×200 background overlay. Single `url()` is the swap point for the PNG / real asset.

### 2.4 `/design-system` internal route
- [x] `app/design-system/page.tsx` + `layout.tsx` (dev-only, gated on `NODE_ENV === 'development'`; the folder can't be underscored because that would make it unrouteable). Lists every Phase 2 primitive — filters, glyphs, decoration overlays — rendered side-by-side on Day and Midnight via nested `data-theme` panels. The visual regression deck through launch.

**Exit criteria.** A dev visiting `/design-system` sees the ruled page background, margin rule, paper grain, and every Phase 2 primitive rendered on both Day and Midnight themes.

**Asset dependency.** None. Placeholders used for A1, A8.

---

## Phase 3 — Core paper components (part 1: structural)

**Goal.** Everything needed to compose a page that's recognizably "Paper Ledger," even if tables and charts are still Swiss.

Build, in order:
1. [x] `<Page formCode pageNumber>` — the root surface (§4.1). Ruled lines, margin rule, header (~80px with 2px black rule), footer (~32px with page-no affordance), optional tape strips at corners.
2. [x] `<FileTab>` navigation (§4.9). Manila folder metaphor. Active/inactive states. Router-agnostic tablist semantics — accepts `href` (renders as `next/link`) or `onChange`.
3. [x] `<FieldLine label value kind>` — printed/hand/stamped variants (§4.2). Slight rotation on `kind="hand"` via `tiltFor(id)`. Display-only; editable sibling ships with Phase 4.
4. [x] `<Stamp text subtext color rotation wear>` (§4.4). Archivo Black + `#stamp-wear`. Seeded rotation via `stampRotationFor(id)` giving |4–8°| with random sign.
5. [x] `<TapeStrip>` (§4.5) — coded placeholder SVG until Asset A5 lands.
6. [x] `<MarginNote>` (§4.6). Patrick Hand by default (Caveat unsafe for Vietnamese per §2.3) — `hand="signature"` opt-in for English-only display flourishes. DECISION_LOG 2026-04-21.
7. [x] `<CarbonSlip>` (§4.8). Pink-tinted via `color-mix(stamp-red 14%, paper)` + stamp-red border.
8. [x] `<PaperClip>`, `<TornCorner>`, `<FoldCrease>` (§4.7) — coded SVG placeholders behind same component API (Assets A6, A7, A4).

Each ships with:
- [x] A `/design-system` entry showing all states (default / hover / focus / disabled). `app/design-system/_phase-three.tsx` renders every component on Day + Midnight.
- [x] a11y audit: decorative SVGs get `aria-hidden` + `role="presentation"`, real meaning lives in text. `<Stamp>` lifts `text` + `subtext` into `aria-label` (the stamp encodes state and must reach AT).

**Exit criteria.** I can compose a static "Paper Ledger" page end-to-end using only these primitives, visually matching the spec mockups (once we have them).

**Asset dependency.** Coded placeholders for A4, A5, A6, A7. Real assets swap in later phases without touching component code.

---

## Phase 4 — Core paper components (part 2: data & state)

**Goal.** Tables, charts, and every state from §6 — so we can render real data.

1. [x] `<LedgerTable>` (§4.3). 32px rows locked to the ruled lines. Columns Date / Time / Description / Category / Amount. Refunds in stamp-red parens via `formatSignedVND`. Highlighter hover + hand-traced focus via `.paper-row-interactive`. Drill-in delegated: `onDrillIn(row)` + `activeRowId`; consumers mount the paper-clipped detail card above the page.
2. [x] `<HandDrawnChart>` wrapper (§4.10) for bars, lines, areas. Raw SVG (not Recharts) per DECISION_LOG 2026-04-21 "Phase 4 · charts ship on raw SVG, not Recharts." `#hand-wobble` on every stroke; dashed annotation ellipses + Caveat labels.
3. [x] `<TallyMarks count groupSize>` (§4.11). SVG strokes, pen-navy default, `#hand-wobble` applied.
4. [x] `<InkBlot>` (§4.12) — coded `feTurbulence` placeholder (Asset A3). `InkBlot.tsx`, seeded tilt, swap-ready.
5. [x] `<EraserMarks>` (§4.13). Inline + overlay variants, 1s pulse, respects reduced motion.
6. [x] `<RedStringCorrection>` (§4.14). Inline SVG strike (not `text-decoration`) pushed through `#hand-wobble`; supports chained history; hidden when `data-show-edit-history="0"`.

Then every state in §6:
- [x] Hover — highlighter swipe (200ms left→right). `.paper-row-interactive::before` keyframe in `globals.css`.
- [x] Focus — hand-traced 1.5px navy border + 3px outer ring via `.paper-focusable` / `.paper-row-interactive:focus-visible`.
- [x] Pressed — 1px drop + paper→paper-2 via `.paper-pressable:active` and `.paper-row-interactive:active`.
- [x] Disabled — dashed underline, `ink-faint` text. `FieldLine disabled` + `.paper-disabled` utility.
- [x] Loading — `<EraserMarks>` pulse. Spinner rip-out happens per-page in Phase 5; `<LedgerTable loading>` already consumes `<EraserMarks>`.
- [x] Empty — `<EmptyLine>` prints "Nothing on this line yet." in hand-signature face + pencil `✎` glyph.
- [x] Error — `<InkBlot>` + stamp-red underline + Caveat margin note (shown in `/design-system` state matrix).
- [x] Success — `<Stamp text="Recorded">` + `.paper-stamp-thump` animation on mount.
- [x] AI suggestion — `<PencilNote>`; pencil-gray + `#pencil-stroke` filter, fades to pen-navy on accept via `.paper-pencil-accepted` transition.
- [x] Edited — `<RedStringCorrection>` strikethrough history.
- [x] Deleted-recently — `<VoidedEntry>` / `paper-row-voided` strike + VOID stamp + 5s `paper-void-fade` keyframe.

**Exit criteria.** `/design-system` shows every component in every state. Dashboard-prototype section at the bottom of the deck composes `<LedgerTable>`, `<HandDrawnChart>`, `<TallyMarks>`, `<PaperClip>`, and a Ledger-keeper note into a Phase-5 preview (not wired to real data).

**Asset dependency.** Coded placeholder for A3.

---

## Phase 5 — Page migration (the big one)

**Goal.** Replace the current UI page-by-page. Ship behind a feature flag `NEXT_PUBLIC_PAPER_UI=1` so we can A/B internally and roll back fast. Each page ships when its visual regression deck is green and a11y passes.

Order is chosen to ship the highest-visibility surface last (so we iterate on less-critical pages first):

1. [x] **`/login`** (smallest surface, lowest risk). Paper page, carbon-slip form, stamp on submit. Ships at `/login-paper` (side route) and is gated on `/login` behind `NEXT_PUBLIC_PAPER_UI=1`. Swiss form preserved in `app/login/_swiss.tsx` for flag-off fallback. Visual regression deck lives under `/design-system#login` with all four states (idle / checking / recorded / rejected).
2. [x] **`/dashboard/recurring`**. Standing-orders register. Active rows on the ruled body with navy ACTIVE stamps; paused orders pulled out into a "Set aside" stack of torn-corner receipts with red PAUSED stamps (§4.7). New orders filed on the same pink carbon slip as `/login`. Ships at `/dashboard/recurring-paper` (side route); `/dashboard/recurring` delegates via `PAPER_UI_ENABLED`. Swiss preserved in `_swiss.tsx`. `/design-system#recurring` covers populated / all-paused / empty / slip-rejected on Day + Midnight.
3. [x] **`/chat`** (AI conversation UI). Paper chrome only — streaming, tool calls, and `/api/chat` unchanged. Correspondence renders as a flowing `<Page>` of entries: user messages in Patrick Hand pen-navy with seeded tilt, Ledger-keeper replies in printed Crimson closing with `— LK` in Caveat pencil-gray once the ink has dried. Tool calls fold out inline as `<details>` receipts with a navy `Filed` / red `Error` state stamp. Compose slip reuses the pink carbon form from `/login` and `/dashboard/recurring-paper`; `position: sticky` rides the viewport bottom. ai-elements / shadcn primitives dropped — `useChat` + `streamdown` direct. Ships at `/chat-paper` (side route); `/chat` delegates via `PAPER_UI_ENABLED`. Swiss preserved in `_swiss.tsx`. `/design-system#chat` covers empty / exchange / tool-call / streaming on Day + Midnight. Full voice pass (model-level `— LK` sign-off via `lib/ledger-keeper-prompt.ts`) is Phase 6.
4. [ ] **`/dashboard`** (overview + charts + today's entries). The hero screen.
5. [ ] New **`/settings`** route (theme, reduce-motion, reduce-skew, use-printed-font, show-edit-history).

For each page:
- [ ] Identify every current Swiss component → map to Paper equivalent.
- [ ] Rebuild in a side route (e.g. `/dashboard-paper`) until parity, then flip the flag.
- [ ] Keyboard-nav check, screen-reader check, Vietnamese torture-string check per page.

### 5.1 Mobile treatment (§3.4)
Every page needs its mobile variant designed + tested at 375px:
- [ ] Margin rule moves to 36px.
- [ ] Tape strips removed on <640px.
- [ ] FileTab collapses to `<select>` styled as a paper tag.
- [ ] LedgerTable becomes a stack of receipt cards (torn-edge tops).

**Exit criteria.** All five pages shipped behind the flag. Flag flipped on. Swiss code deleted (keep old doc in `docs/` for portfolio narrative).

**Asset dependency.** Still only placeholders. Assets can arrive any time during Phase 5 and we'll hot-swap them.

---

## Phase 6 — Content & voice pass

**Goal.** Every string in the app matches the "Ledger-keeper" voice (§10).

- [ ] Inventory every user-facing string: button labels, empty states, error messages, AI system prompts, toasts (which should now be stamps).
- [ ] Rewrite to clerical-1962 voice. Examples: "Recorded ✓" not "Saved!" / "On this page" not "Loaded items" / "Settle the books" for month-end.
- [ ] Remove every exclamation mark. Every emoji. Every "!" in copy.
- [ ] Date formatting helper: `"Mon, 20 Apr 2026"` for printed dates. User-written dates stay free-form.
- [ ] Currency helper: VND with VN-style dotted grouping (`1.180.000 ₫`). Locale `vi-VN`, no fraction digits.
- [ ] **AI system prompts** (`app/api/log/route.ts`, `app/api/report/route.ts`, `app/api/custom/route.ts`, `app/chat/page.tsx` LLM calls): personify as "the Ledger-keeper." Always polite, never enthusiastic, no exclamation marks, signs replies with `— LK` in pencil-gray. Add this to a shared `lib/ledger-keeper-prompt.ts` so the voice is consistent across endpoints.
- [ ] Replace every toast/sonner call with a `<Stamp>` that thumps in, dries, stays. Audit: remove `sonner` dependency if nothing else uses it.

**Exit criteria.** A stranger skimming the app can tell it's "in character" on every screen.

**Asset dependency.** None.

---

## Phase 7 — Accessibility & polish

**Goal.** The metaphor is never at the expense of usability (§9).

- [ ] WCAG AA contrast sweep. `ink-mute` on `paper` must hit 4.5:1. `pen-navy` on `paper` must hit 4.5:1. `stamp-red` on `paper` for non-text uses must hit 3:1. Automate with `@axe-core/react` in dev.
- [ ] Handwriting readability: Patrick Hand below 14px is banned (already documented in §2.3); ensure no `text-hand-s` instance renders <14px. Ship the "Use printed font for handwritten content" setting end-to-end.
- [ ] Rotation cap: every element that uses `tiltFor` respects `data-reduce-skew="1"` and collapses to 0°.
- [ ] Focus indicators: keyboard focus visible on every interactive element. Hand-traced border PLUS a solid high-contrast outer ring (§9).
- [ ] Screen reader pass: every decorative SVG (tape, stamps, blots, clips) has `aria-hidden="true"` + `role="presentation"`. Meaning lives in text. Run through VoiceOver end-to-end.
- [ ] Color blindness: stamp-red is the only red. Every use pairs with a glyph (✓, ×, ✎).
- [ ] Vietnamese torture test: the longest realistic strings ("Cà phê sữa đá Cộng Cà Phê — chi nhánh quận 1") don't break any table or card. Tabular-nums hold.
- [ ] Reduced-motion respect: system `prefers-reduced-motion` disables every animation in §8. Our setting flag can override either way.

**Exit criteria.** Lighthouse a11y score 100. Axe 0 violations. VoiceOver walkthrough doesn't stumble.

**Asset dependency.** None.

---

## Phase 8 — Asset integration

**Goal.** Swap every coded placeholder for Chien's real hand-drawn asset.

Happens incrementally throughout Phases 3–7 as assets arrive, but this phase is the formal sweep + polish.

For each asset in the inventory table:
- [ ] Chien delivers the file to `public/textures/` or `public/glyphs.svg` or `app/_components/paper/assets/`.
- [ ] I swap the placeholder. Single-file change if the API holds.
- [ ] Visual regression check in `/design-system`. Tune rotation / turbulence / opacity if needed.
- [ ] DECISION_LOG entry recording the swap date + any adjustments.

Ordering (easiest hand-off to hardest):
1. Paper grain texture (A1)
2. Coffee ring (A2)
3. Ink blots (A3)
4. Fold crease (A4)
5. Glyph sprite (A8) — biggest wins; replaces ~12 Unicode fallbacks
6. Tape strips (A5)
7. Paper-clip (A6)
8. Torn-corner (A7)
9. Wax seal (A9) — only after milestone screens exist
10. Signature flourish (A10)
11. Curved arrow (A11)
12. Underline strokes (A12)

**Asset dependency.** This IS the asset phase. But because every placeholder already works, the timeline is elastic — I keep building against placeholders, Chien ships assets when ready, and each swap is a small, isolated PR.

---

## Phase 9 — Performance, portfolio polish, and launch

**Goal.** Ship a thing that holds up to portfolio scrutiny.

### 9.1 Performance
- [ ] Bundle audit. Font subsetting (Vietnamese + Latin only). Verify total font weight <200KB.
- [ ] Lighthouse ≥ 95 on all four categories on the dashboard.
- [ ] SVG filter perf on a mid-tier Android (not just iPhone). If any filter regresses, fall back to pre-rendered textures.
- [ ] `next/image` for every paper texture PNG with `priority` on the visible ones.

### 9.2 Motion review
- [ ] Every animation matches §8 (180–240ms, ink-drying easing). Rip out anything spring-y or bouncing.
- [ ] Page-flip transition between major sections (Dashboard ↔ Recurring) per §8. Make it subtle — 400ms `rotateY`.

### 9.3 Portfolio case-study assets
- [ ] Clean up `/design-system` route; either delete or gate behind `/admin`.
- [ ] Remove spike routes.
- [ ] Screenshot deck: Day theme hero, Midnight hero, mobile receipt view, empty state, error state, stamp animation, AI reply example. 1440×900 and 375×812.
- [ ] Short screen recording (15–30s) of "log an expense → stamp appears" and "monthly report → paper flips."
- [ ] `docs/CASE_STUDY.md`: one-page narrative of the design decisions (why paper ledger, what Swiss lacked, trade-offs, what Vietnamese users recognize instantly). Link before/after screenshots.
- [ ] Update README with "built with Paper Ledger design system — see `DESIGN_SYSTEM.md`."

### 9.4 Final QA
- [ ] Every checklist from §13 and the Quick-Reference Card of the spec passes on every page.
- [ ] Delete the Swiss doc's references from `CLAUDE.md`; leave the file as `docs/swiss-design-system-archive.md`.
- [ ] Close the feature flag — Paper UI is the only UI.

**Exit criteria.** Portfolio-shippable.

---

## Working rhythm

- **One phase = one PR series.** Each phase lands behind the feature flag, verified in `/design-system`, merged, not revisited.
- **No phase skipping.** Each phase de-risks the next. If Phase 0 surfaces a killer (e.g. Patrick Hand can't render stacked tones), we revise the whole plan before coding further.
- **Decision log is mandatory.** Every non-trivial trade-off lands in `docs/DECISION_LOG.md` with date + rationale + reviewer.
- **Placeholders are first-class.** I never wait on an asset. The component ships with the best coded placeholder I can write; Chien's real asset is a single-file swap.
- **Visual regression deck.** `/design-system` is the single source of truth for "does it look right." I screenshot it at the end of every phase.

## What's in scope vs. not

In scope: UI migration of `/login`, `/dashboard`, `/dashboard/recurring`, `/chat`, new `/settings`. AI prompt voice. Accessibility. Mobile. Dark ("Midnight") theme.

Out of scope (for this roadmap): backend schema changes, auth changes, new features, API rewrites. This is a design-system adoption, not a product rewrite. If a screen needs new data to express the metaphor (e.g. "edit history" for `<RedStringCorrection>`), we log it and decide case-by-case.

---

*Last updated: 2026-04-21 · owner: Chien + Ledger-keeper (Claude) · Phases 0 + 1 + 2 + 3 + 4 complete · Phase 5 in progress (/login + /dashboard/recurring + /chat migrated).*
