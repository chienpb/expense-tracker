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
- [ ] Create `docs/DECISION_LOG.md` (per §13 of the spec).
- [ ] Update `CLAUDE.md` so the "Design System" section points at `DESIGN_SYSTEM.md` (after Phase 1 lands), not the Swiss doc. Keep the Swiss doc in `/docs` as historical reference — don't delete.
- [ ] Add `app/_components/paper/` directory with a README stub.
- [ ] Add `public/textures/` and `public/glyphs.svg` with placeholder content.

### 0.2 Technical spikes (proof-of-concepts, not production)
Each spike is a throwaway `app/_spikes/<name>/page.tsx` route. Keep them around during the roadmap as a visual regression deck; delete in Phase 9.

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
- [ ] In `app/globals.css`, replace the HSL grayscale palette with the Paper Ledger tokens from §1 (Day + Midnight).
- [ ] Switch theme strategy from `next-themes` class (`.dark`) to `data-theme="day" | "night"` on `<html>` (per §12). Keep `next-themes` package but configure `attribute="data-theme"`, `value={{ light: 'day', dark: 'night' }}`.
- [ ] Add font families to `@theme`: `--font-serif`, `--font-typewriter`, `--font-hand`, `--font-hand-signature`, `--font-stamp`.
- [ ] Add type-scale tokens from §2.5 as CSS custom properties and Tailwind utilities (`text-display-hero`, `text-hand`, `text-label`, etc.).
- [ ] Add spacing scale (already close — just audit §3.2) and ruled-line constant (`--rule-spacing: 32px`).
- [ ] Expose `font-variant-numeric` utilities: `.nums-oldstyle`, `.nums-tabular`, `.nums-lining-tabular`.
- [ ] Expose letter-spacing tokens for labels (1.5px, 2.5px tracked).

### 1.2 Typography runtime
- [ ] `app/layout.tsx` — load all five Google Fonts via `next/font/google` with proper subsets. Verify `vietnamese` subset is included for Crimson Pro, Patrick Hand, Caveat.
- [ ] Set body default to Crimson Pro 14/1.55 with `font-variant-numeric: oldstyle-nums`.
- [ ] Update `<title>` and `<metadata>` (still says "Create Next App" in current `layout.tsx:18`).

### 1.3 Settings scaffolding (groundwork for a11y)
- [ ] Plan a `/settings` route shape (don't build yet). Keys: `theme`, `reduce-motion`, `reduce-skew`, `use-printed-font-for-handwritten`, `show-edit-history`. Store in a cookie (SSR-safe) + Zustand for client reads. Decision log entry.
- [ ] Add `<html>` attributes driven by settings: `data-theme`, `data-reduce-motion`, `data-reduce-skew`, `data-print-hand`. Components key off these attributes in CSS.

### 1.4 Rotation seeding
- [ ] Ship `lib/seed-rotation.ts` from the spike into production.

**Exit criteria.** `/dashboard` still renders (because nothing consumes the new tokens), but DevTools shows the new CSS vars. Toggling `data-theme` in DevTools visually re-paints the background between `#f6efe0` and `#1a1410` on an empty page.

**Asset dependency.** None.

---

## Phase 2 — Foundation primitives & SVG filter library

**Goal.** Every drawing primitive the system needs. A `/design-system` internal route displays all of them side-by-side for visual regression.

### 2.1 SVG filter defs
- [ ] `app/_components/paper/_filters.tsx` — a single `<svg width="0" height="0">` with `<defs>` for `#paper-grain`, `#stamp-wear`, `#hand-wobble`, `#ink-bleed`, `#pencil-stroke`. Include once in root layout.
- [ ] Performance gate: verify each filter is cheap on mobile. If `#paper-grain` on full-page fails the Phase 0.2 test, ship a pre-rendered PNG placeholder per §7.6 and leave a TODO to swap when the Asset A1 lands.

### 2.2 Placeholder asset generators
- [ ] `public/textures/paper-grain.png` — placeholder generated at build time from `feTurbulence`. Document swap-out path in DECISION_LOG (`Asset A1`).
- [ ] `public/glyphs.svg` — placeholder sprite using Unicode glyphs wrapped in `<symbol>` elements. Each glyph has an id like `glyph-leaf`, `glyph-star`, `glyph-hand-pointing`, etc. When Chien's real glyphs ship, we replace the `<symbol>` paths and components stay the same.
- [ ] `<Glyph name="..." />` component that resolves via `<use href="/glyphs.svg#glyph-leaf" />`.

### 2.3 Decoration primitives (code-only, no assets needed)
- [ ] `<RuledLines />` — renders the 32px ruled-line background at component level.
- [ ] `<MarginRule />` — single pink vertical line 60px from left (36px on mobile per §3.4).
- [ ] `<PaperGrain />` — wraps `#paper-grain` over a surface; automatically swapped to PNG when PNG placeholder lands.

### 2.4 `/design-system` internal route
- [ ] `app/_design-system/page.tsx` (dev-only, gated behind `NODE_ENV !== 'production'`). Lists every primitive and, as the roadmap advances, every component. This is our visual regression deck through launch.

**Exit criteria.** A dev visiting `/design-system` sees the ruled page background, margin rule, paper grain, and every Phase 2 primitive rendered on both Day and Midnight themes.

**Asset dependency.** None. Placeholders used for A1, A8.

---

## Phase 3 — Core paper components (part 1: structural)

**Goal.** Everything needed to compose a page that's recognizably "Paper Ledger," even if tables and charts are still Swiss.

Build, in order:
1. [ ] `<Page formCode pageNumber>` — the root surface (§4.1). Ruled lines, margin rule, header (~80px with 2px black rule), footer (~32px with page-no affordance), optional tape strips at corners.
2. [ ] `<FileTab>` navigation (§4.9). Manila folder metaphor. Active/inactive states.
3. [ ] `<FieldLine label value kind>` — printed/hand/stamped variants (§4.2). Slight rotation on `kind="hand"` via `tiltFor(id)`.
4. [ ] `<Stamp text subtext color rotation wear>` (§4.4). Archivo Black + `#stamp-wear`.
5. [ ] `<TapeStrip>` (§4.5) — coded placeholder SVG until Asset A5 lands.
6. [ ] `<MarginNote>` (§4.6). Caveat, pen-navy, connector line optional.
7. [ ] `<CarbonSlip>` (§4.8). Pink-tinted + stamp-red border.
8. [ ] `<PaperClip>`, `<TornCorner>`, `<FoldCrease>` (§4.7) — coded SVG placeholders behind same component API (Assets A6, A7, A4).

Each ships with:
- A `/design-system` entry showing all states (default / hover / focus / disabled).
- a11y audit: decorative SVGs get `aria-hidden` + `role="presentation"`, real meaning lives in text.

**Exit criteria.** I can compose a static "Paper Ledger" page end-to-end using only these primitives, visually matching the spec mockups (once we have them).

**Asset dependency.** Coded placeholders for A4, A5, A6, A7. Real assets swap in later phases without touching component code.

---

## Phase 4 — Core paper components (part 2: data & state)

**Goal.** Tables, charts, and every state from §6 — so we can render real data.

1. [ ] `<LedgerTable>` (§4.3). 32px rows locking to the ruled lines. Columns Date / Time / Description / Category / Amount. Refunds in stamp-red parens. Highlighter hover. Drill-in "lifts" the row as a paper-clipped detail card.
2. [ ] `<HandDrawnChart>` wrapper (§4.10) for bars, lines, areas. Uses `#hand-wobble`. Start on top of existing Recharts instance but with a custom SVG layer for strokes so we control the wobble. If Recharts can't compose with our filters cleanly, decision log: switch to raw `<svg>` + `d3-shape`.
3. [ ] `<TallyMarks count groupSize>` (§4.11).
4. [ ] `<InkBlot>` (§4.12) — coded `feTurbulence` placeholder (Asset A3).
5. [ ] `<EraserMarks>` (§4.13).
6. [ ] `<RedStringCorrection>` (§4.14).

Then every state in §6:
- [ ] Hover — highlighter swipe (200ms left→right).
- [ ] Focus — hand-traced 1.5px navy border with high-contrast outer ring fallback.
- [ ] Pressed — 1px drop + paper→paper-2.
- [ ] Disabled — dashed underline, `ink-faint` text.
- [ ] Loading — `<EraserMarks>` pulse. Rip out every spinner from the codebase.
- [ ] Empty — Caveat "Nothing on this line yet." + margin ✎.
- [ ] Error — `<InkBlot>` + stamp-red underline + Caveat margin note.
- [ ] Success — ✓ stamp + optional RECORDED sub-stamp.
- [ ] AI suggestion — pencil-gray, fades to pen-navy on accept.
- [ ] Edited — `<RedStringCorrection>` strikethrough history.
- [ ] Deleted-recently — strikethrough + VOID stamp, 5s fade-out.

**Exit criteria.** `/design-system` shows every component in every state. Dashboard charts render with paper aesthetic in a prototype route, not yet wired to real data.

**Asset dependency.** Coded placeholder for A3.

---

## Phase 5 — Page migration (the big one)

**Goal.** Replace the current UI page-by-page. Ship behind a feature flag `NEXT_PUBLIC_PAPER_UI=1` so we can A/B internally and roll back fast. Each page ships when its visual regression deck is green and a11y passes.

Order is chosen to ship the highest-visibility surface last (so we iterate on less-critical pages first):

1. [ ] **`/login`** (smallest surface, lowest risk). Paper page, carbon-slip form, stamp on submit.
2. [ ] **`/dashboard/recurring`**. LedgerTable, stamps for active/paused, torn-corner on archived.
3. [ ] **`/chat`** (AI conversation UI). Full voice pass happens here in Phase 6; this phase just rebuilds the chrome — messages on ruled paper, AI replies in Crimson with `— LK` signature, user messages in Patrick Hand.
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

*Last updated: 2026-04-21 · owner: Chien + Ledger-keeper (Claude)*
