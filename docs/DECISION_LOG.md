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

## 2026-06-24 · Atlas (Phase 2) — float coords, one committed SVG, pointer drag, middleware auth-hole exclusion

  Context:   Planning `/trips/atlas`: a world map where each trip is a draggable marker. Four trade-offs needed a record before build.
  Decision:  (1) **`atlas_x/atlas_y` are nullable `DOUBLE PRECISION`** — `[0,1]` fractions, `NULL` = unplaced. The amounts-are-integers invariant is money-only; x/y are floats by design (spec). (2) **The base map is ONE committed self-contained `public/trips-atlas.svg`**, drawn by a delegated Opus agent — NOT composed from `<Sea>`/`<Island>`/`<CompassRose>` at runtime. Spec demands a single re-art-able asset with no external fonts/refs so it renders identically SSR/client; primitives only inform the look. Cartouche title stays a React overlay (needs fonts). (3) **Drag = pointer events with a ~5px threshold**, no HTML5 DnD, no library; drop outside the map (over the tray) is the unplace affordance — no separate remove button. (4) **`/trips/atlas` is excluded from the `middleware.ts` GET public-viewer hole** (`^/trips/[^/]+$`) so it requires a session — owner-only stays enforced in middleware, not the page. Reuse the existing `PATCH /api/trips`; no new endpoint.
  Rationale: Smallest diff that meets every acceptance criterion while honoring both invariants (integers=money-only, auth-in-middleware) and the Cartographer's-Hand DS (gold markers, red rationed). Pointer events cover touch for free. One SVG keeps markers stable across re-arts.
  Reviewer:  Ledger-keeper (pending Chien at build)

## 2026-06-23 · Monthly Wrapped — reveal-not-streaming, generate-once-store, computed-numbers/AI-prose split

  Context:   Spec'd the Wrapped insert that fills the seam left open by Closing the Books. A 4-member Opus council (editorial restraint / interaction-motion / lazy-engineer / portfolio-wow) brainstormed format, content, streaming, and persistence. Three forks surfaced; the user resolved the entrance-spectacle fork.
  Decision:  (1) **One loose-leaf slip, not a card deck** — a swipeable deck is the Spotify gimmick reskinned and reintroduces the slideshow engine we refuse. (2) **Generate once at seal time, store on `sealed_months.wrapped_text`; never regenerate** — re-reads and the portfolio-link visitor read the stored string. (3) **Reveal, not live streaming** — the verdict is generated whole, stored, then *revealed* with an ink animation; visually identical to streaming but one render path shared by first-seal and re-read, deterministic, and compatible with generate-once-store. `streamText` rejected. (4) **Numbers computed, prose-only AI** — totals/net/largest-line/per-category come from SQL/JS as given facts; the AI's only job is one (max two) sentence "shape of the month" observation closing `— LK`. The AI never emits a number it computed nor decides the numbers. (5) **Content = one foregrounded verdict line + quiet aggregates** (spent/returned/net + largest entry named). (6) **Entrance (user's call): the wax "Settled" seal fractures**, the slip lifts, the verdict reveals as ink, aggregates fade in, then the existing page-turn continues — the portfolio "send this link" frame. (7) Folds into `POST /api/seal`; no new route, no new table.
  Rationale: Generate-once-store is the textbook fit for a once-a-month irreversible event and removes nondeterminism that would be lethal in a shared link. The computed/AI split eliminates the "AI said 1.2M, total is 1.18M" failure class and slashes cost to one short prose call per seal. Restraint and wow converged: the "single valuable observation a stats dump can't give" *is* the "one screenshot-worthy verdict line" — same artifact, satisfying both lenses. The fracture is the accepted risk (a bad crack reads as a CSS bug); discipline is one fracture, one slip, one line, then stop — no physics, no multi-fold (that's the slideshow engine). Cut as spectacle: streaks, top-category-as-trophy, percentiles/leaderboards, vanity counts, superlatives. Reduce-motion and re-read both render the finished slip flat; generation failure degrades to aggregates-only, signed `— LK`, flip proceeds.
  Reviewer:  Council (4× Opus) + Chien (entrance + content budget); Ledger-keeper (pending Chien on full spec)

## 2026-06-22 · Closing the Books — scope split, seal state model, and the summary-page seam

  Context:   First feature off `docs/IDEAS.md` (#1, holistic 8.6). The "after the seal, where does it land?" question opened a much bigger ambition: a Spotify-Wrapped-style month recap, AI-clerk-narrated, calculated and streamed in real time. That is non-trivial and deserves its own spec.
  Decision:  Cut the work into three pieces with explicit seams. (1) **Closing the Books** (now): the trigger (manual "Settle the books" button + auto-prompt on month rollover, deduped by the persisted flag), the rule-off → wax-seal *thump* ceremony, and persisting a closed flag in a new `sealed_months` table. Lands on a **year calendar** that marks the sealed month done — the calendar is the durable home for the `sealed_months` state and is in scope here. (2) **The Monthly Wrapped** (deferred, its own `/spec`): the real-time-streamed AI recap. It slots into the *seam between the seal-thump and the year calendar* — it plays before the calendar, replacing nothing. The ceremony emits "month M sealed"; the calendar consumes it; Wrapped is a clean insert later, not a rewrite. (3) Idea #7 **Annual Statement** stays untouched and separate — no illuminated/broadsheet work here. **Seal state model:** sealed months are persisted but **not** edit-locked (Shortcuts keep posting). When a new entry lands in a sealed month the seal goes **stale/reopened** (visible crack / "REOPENED" mark, `sealed_at` cleared or superseded) rather than staying silently — per §0.3 "errors and corrections are visible." Re-settling re-seals.
  Rationale: The persisted flag needs somewhere to be shown on reload; the year calendar is that somewhere, so it earns its place in this spec. Wrapped is pure layered spectacle — specifiable and buildable without touching the ceremony or calendar, so it must not bloat this spec. Stale-seal-over-silent keeps the metaphor honest: a closed book that quietly absorbed new entries would be a silent rewrite, which the system forbids.
  Reviewer:  Chien

---

## 2026-06-16 · Phase 9 · Mobile treatment — table→receipt cards, tabs→paper-tag select

  Context:   §3.4 asks that the metaphor survive at 375px: margin rule at 36px, tape strips gone, `<FileTab>` collapsed to a `<select>` paper tag, and `<LedgerTable>` rendered as a stack of torn-edge receipt cards. The 36px margin rule (`--margin-rule-offset-mobile`) and the `hidden sm:block` tape strips already shipped in Phases 1–3; the two open items were the tab collapse and the table-to-cards transform. A 375px audit also surfaced one real break: the `/dashboard` header laid the title and the four-tab masthead in one flex row, so at 375px the tabs overlapped the title and the date stamp.
  Decision:  (1) New `<TornTopEdge>` primitive — the full-width horizontal sibling of `<TornCorner>` (fixed 120-unit viewBox, `preserveAspectRatio="none"`, `vector-effect:non-scaling-stroke`), painting the card surface up to an irregular tear line. (2) `<LedgerTable>` keeps the `<table>` at `≥sm` (`hidden sm:table`) and adds a `sm:hidden` `<ul>` of `<ReceiptCard>`s below — same rows, same state surface (interactive drill-in, `paper-pencil` AI tint, `paper-row-voided` strike+fade, edit-history, inline stamp) re-expressed for one narrow column. (3) New `<PaperTagSelect>` — a native `<select>` styled as a manila tag (clipped top-left corner, pencil chevron); `<FileTab>` and the dashboard `<Masthead>` both render the tab strip at `≥sm` and collapse to it below. The masthead's mobile path navigates via `router.push` (no page-turn) and keeps OUT as a plain text button. (4) `/dashboard` header restructured to `flex-col sm:flex-row`; the today's-date `<Stamp>` is `hidden sm:block` (no room beside the collapsed tag). (5) Recurring's six-column `ActiveTable` gets the same `<ActiveCard>` receipt treatment below `sm`. (6) The register's `<DateRangeTabs>` range chip (`<PaperSelect variant="chip">`) had a hard `min-w-[15rem]` that, inside the `justify-between` ledger heading, overflowed at 375px and dragged its popover off the right edge — the heading row now stacks (`flex-col sm:flex-row`) and the chip goes fluid (`min-w-0 flex-1 sm:min-w-[15rem] sm:flex-none`) so the popover stays within the viewport (measured left=110 right=359 of 375). Verified at 375×812 across all five routes: zero horizontal overflow (`scrollWidth === 375`) open and closed, zero hydration mismatches on a clean server, Vietnamese diacritics intact on hand-written card descriptions.
  Rationale: A native `<select>` is exactly what §3.4 specifies and hands the platform picker (and its a11y) the heavy lifting at the one breakpoint where a tab strip can't fit. Reusing the existing row-state CSS on the cards (rather than a parallel mobile state system) keeps the two layouts in lockstep — a new ledger state lights up in both for free. `<TornTopEdge>` follows the placeholder-swap contract (one path constant), matching `<TornCorner>`.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-06-16 · Phase 8.1 · Bundle audit — Swiss component tree + 12 dependencies deleted

  Context:   Phase 5.6 collapsed every `/foo-paper` route onto its real path and deleted the `_swiss.tsx` page fallbacks, but the shadcn/ai-elements component library under `components/` (33 files), `components.json`, `lib/utils.ts` (the `cn` helper), and the Swiss-era dependency set were never removed. A `grep` for live imports of `@/components/*` returned zero hits across `app/` and `lib/`.
  Decision:  Deleted `components/`, `components/ai-elements/`, `components.json`, `lib/utils.ts`. Removed 12 now-unused deps: `recharts`, `react-day-picker`, `cmdk`, `radix-ui`, `lucide-react`, `class-variance-authority`, `shadcn`, `tw-animate-css`, `nanoid`, `use-stick-to-bottom`, `clsx`, `tailwind-merge`. Dropped the `@import "tw-animate-css"` and `@import "shadcn/tailwind.css"` lines from `globals.css` and the Geist/Geist_Mono `next/font` loads from `layout.tsx` (charts ship raw SVG per Phase 4; `--font-sans`/`--font-mono` now resolve to system stacks for the few remaining non-Paper utility uses).
  Rationale: Dead code is the cheapest perf win and the largest. The Paper system draws its own charts (raw SVG, `#hand-wobble`), its own select (`PaperSelect`), its own everything — nothing consumed the shadcn primitives anymore. Build stays green; no runtime import touched the deleted tree. Swiss-token CSS custom properties in `globals.css` are left for the Phase 11 cleanup sweep (they cost nothing at runtime).
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-06-16 · Phase 8.1 · Font subset + weight diet → 158KB eager (budget <200KB)

  Context:   §8.1 caps total font weight at <200KB and mandates "Vietnamese + Latin only" subsetting. The pre-audit build preloaded 222.8KB of woff2 on every page. Crimson Pro is a *variable* font, so weight trimming is free (one file per style+subset covers 400–700) — the real waste was elsewhere.
  Decision:  (1) Dropped `latin-ext` from every font (`vietnamese` carries the tone block + ₫ U+20AB; `latin-ext` is Central/Eastern-European, unused). (2) Courier trimmed to weight 400/700 (700 needed: the selected `PaperSelect` option is `font-typewriter font-semibold`, and 600 maps to 700 with no 600 face), Caveat to 400 only (every callsite renders default weight). (3) **Crimson italic split into its own `preload:false` face** exposed via a new `.font-serif-italic` utility — italic's latin+vietnamese subsets (~64KB) were being preloaded on every page for ~5 caption/fallback callsites; now they load lazily only when an italic serif glyph renders. (4) Homemade Apple (`--font-hand-hurried`) removed from the loaded set — no production surface uses it; the token falls back to `cursive` for the dev-only design-system deck.
  Rationale: Eager preload dropped 222.8KB → 158.4KB (8 files, latin+vietnamese only), comfortably under budget, with zero visible change (true Crimson italic preserved, just lazy). Measured against the rendered HTML's `rel=preload` set on a production server, not the generated-file total (which includes never-downloaded latin-ext and unused variable-italic combos gated by `unicode-range`).
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-06-16 · Phase 8.1 · `robots.ts` added (permissive) — SEO audit; no texture-PNG `next/image` (N/A)

  Context:   Authenticated Lighthouse on `/dashboard` (desktop preset, session cookie held in-memory only): best-practices 100, SEO initially 91. The miss was `/robots.txt` — the auth middleware redirected it to `/login`, which Lighthouse parsed as an invalid robots.txt. A first attempt with `Disallow: /` *dropped* SEO to 63 (failed `is-crawlable`).
  Decision:  Ship `app/robots.ts` returning a valid **permissive** (`Allow: /`) robots.txt and exempt `/robots.txt` from auth in `middleware.ts` (early-return + matcher negative-lookahead). Privacy is enforced by auth, not robots — crawlers hit `/login` and can't reach protected content regardless — so the permissive policy is safe and satisfies both `robots-txt` and `is-crawlable`. Result: dashboard SEO 100, best-practices 100, performance 94–96. The `next/image`-for-texture-PNG item is **N/A**: no paper-texture PNG exists (A1 stayed an SVG tile per Phase 7), and the SVG tiles via CSS `background-repeat` per Spike 2's perf verdict.
  Rationale: Performance's sub-95 dips trace to `server-response-time` (~2.6s local SSR with live Supabase round-trips) feeding Speed Index — an environment artifact Vercel's warm edge functions + regional DB resolve; the only deployment-independent flags (`legacy-javascript` 13KB, `unused-javascript` 28KB) both land inside the 227KB React/Next framework chunk and aren't actionable without leaving framework defaults. SVG-filter perf needs no fresh pass — Spike 2 already chose the tiled CSS-repeat path over full-element filtering.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-06-16 · Phase 8.2 · Motion default centralized on the ink curve

  Context:   §8 mandates 180–240ms at `cubic-bezier(0.2,0,0,1)` for every animation. An audit found four callsites using `transition-colors duration-150` (FileTab, masthead tabs) or a bare `transition-transform` with no explicit duration/easing (chat `<details>` chevron, PaperSelect caret), and the eraser pulse used `var(--ease-ink)` where §8 specifies ease-in-out.
  Decision:  Set Tailwind's `--default-transition-duration: 200ms` and `--default-transition-timing-function: var(--ease-ink)` in the `@theme` block, then stripped the per-callsite duration/easing overrides so every bare `transition-*` utility lands in spec by default. Eraser pulse switched to `ease-in-out` (a symmetric pulse on the asymmetric ink curve reads lopsided). Confirmed zero spring/bounce/shimmer/scale-pop/`animate-pulse|spin|ping` in production code.
  Rationale: One source of truth beats N annotated callsites; a future `transition` utility is automatically on-spec. Keyframe animations already used `var(--ease-ink)` at 180–220ms and were left as-is.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-06-12 · Phase 8.2 · The "blue page" mid-turn: `<RuledLines>` becomes an inline SVG pattern; capture pre-pass inlines `var()` in background-image

  Context:   Chien (browsing in Zen, Gecko engine) saw a solid rule-blue page on the turning leaf mid-animation. Pixel analysis of the screenshot showed the leaf's front texture had the entire `<RuledLines>` layer rasterized as solid `rule-blue` with content layers intact on top — a capture artifact, not a shader bug. The page-flip capture serializes the DOM through SVG `foreignObject`, and some engines rasterize the `repeating-linear-gradient` there with a collapsed period, filling the layer with the first color. Not reproducible in Playwright Chromium, WebKit 26, or Firefox 149 — engine/version-specific, which is exactly why it slipped through.
  Decision:  Two layers. (1) `<RuledLines>` no longer uses a CSS gradient at all — it draws the same 1px/32px lines as an inline `<svg>` pattern (`fill: var(--color-rule-blue)`), the capture path already proven by the hand-drawn charts in every engine. Visually identical; stays a server component (id derived from props, not `useId`). (2) `capture.ts` keeps a pre-pass that rewrites any computed `background-image` still containing `var(` to its resolved literal for the duration of serialization (restored in `finally`) — covers the `.paper-row-interactive` highlighter gradient and future gradient uses against the Safari-class var-resolution variant of the same bug. Dev-only debug hooks (`__pageFlipCapture`, `__pageFlipForceHold`, fallback-reason console.warn) stay; they gate on NODE_ENV and made this diagnosable.
  Rationale: The decoration layer that every page sits on cannot depend on the single least-interoperable rasterization path (repeating gradients inside `foreignObject`). Moving the structure to inline SVG fixes every engine at the source instead of enumerating browser quirks in the capture code; the pre-pass stays because it defends the *class* of bug for one-off gradients that don't justify componentization. Known residue: html-to-image's font-embedding throws in Playwright Firefox 149 dev (`normalizeFontFamily` on an undefined family) — the fallback chain catches it (CSS rotateY), revisit if it shows up in production builds.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-06-12 · Phase 8.2 · 3D rendering admitted for the page-turn only (rule exception)

  Context:   PAGE_FLIP.md replaces the planned 400ms CSS `rotateY` section transition with a WebGL page-turn. The design system has no sanctioned 3D anywhere; "nothing floats" (§0.5) and the anti-pattern list lean hard against effects-for-effect's-sake.
  Decision:  three.js is admitted for exactly one surface: the turning leaf between the three major sections (Daybook ↔ Standing Orders ↔ Correspondence). Vanilla three (no r3f), dynamically imported on first tab hover, orthographic camera, matte shading only, fully disposed after every turn. Nothing else in the app may render 3D; future 3D ideas (PAGE_FLIP.md §7) each need their own logged exception.
  Rationale: Flat `rotateY` rotates rigidly; paper bends. The 3D exists to make the ledger metaphor *more* honest, not less — and it is bounded: zero three.js bytes in any route's initial JS (verified: the only chunk containing three is the lazy one, ~130KB gz against the 180KB budget), and the fallback chain (CSS rotateY → instant swap) means navigation never depends on it.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-06-12 · Phase 8.2 · Spike S7 verdicts — html-to-image capture, curl shader, capture cost

  Context:   PAGE_FLIP.md §5 step 1 gates implementation on three proofs at `/spikes/page-flip`.
  Result:    (a) Capture fidelity — PASS. `html-to-image` `toCanvas` reproduces Crimson Pro / Patrick Hand (stacked Vietnamese diacritics) / Courier Prime and the `#hand-wobble`-filtered chart, including mid-scroll viewports via a `translate(-scroll)` style override on the clone. One blocker found and fixed: `public/textures/paper-grain.svg` failed to decode as an `<img>` because an XML comment contained a double hyphen (in the CSS custom property name for paper) — illegal in strict XML, the same class of issue resvg hit in the bake script. CSS `background-image` parsing was lenient; `<img>` was not. Comment reworded; no consumer changed.
             (b) Curl shader — reads as paper: corner-tilted axis, varying radius, back face with mirrored rules + ink-bleed ghost, mid-turn hold + sway verified in both themes (screenshots in `.screenshots/`). Visual sign-off on a recording: pending Chien.
             (c) Capture cost — 106–180ms on a spike-sized DOM at 2× (first capture pays font embedding; later ones are cheaper). Past the 150ms guideline the next capture degrades to 1× per spec. 10 consecutive flips: `renderer.info` stable at geom:2 tex:2 prog:2 — no leaks; context created and disposed per turn.
  Decision:  Proceed with the library + wiring (shipped same day). Spike route stays as the shader's visual-regression surface until Phase 11.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-06-12 · Phase 8.2 · Page-flip implementation divergences from PAGE_FLIP.md

  Context:   Three small departures surfaced during implementation; the spec asks for anything that diverged to be logged.
  Decision:  (1) Trigger surface: the spec names the masthead as the only trigger, but the Masthead currently renders only on `/dashboard` — Standing Orders and Correspondence navigate back via "← Daybook" typewriter links. Those two links route through the same `<PageTurnLink>` so the backward turn exists at all; every other link still navigates plainly. (2) Capture invalidation: "data change" is detected via a MutationObserver on the captured subtree plus a 10s TTL, rather than data-layer hooks. (3) The §1.6 grain on the leaf's front face ramps in with deformation instead of sitting at a constant 6% — a constant overlay would break the spec's own "flat leaf is pixel-identical to the DOM" requirement at turn start; the back face carries the full 6%.
  Rationale: Each keeps a harder requirement intact (backward turns existing at all, capture freshness without coupling to the data layer, pixel-identity at t=0). If the Masthead later ships on all three sections, the back-links can return to plain `<Link>`s.
  Reviewer:  Ledger-keeper (pending Chien)

---

## 2026-06-12 · Phase 7 · A11 ships as `<AnnotationArrow>` with an open flick arrowhead; A12 as `<EmphasisUnderline>`

  Context:   The last two open assets. A11 (curved annotation arrow) blocks the dashed-ellipse chart callout (DASHBOARD_REDESIGN C6); A12 (underline strokes) was optional, extracted while the pattern was fresh.
  Decision:  `<AnnotationArrow>`: three quadratic shaft variants picked by seed (FNV-1a, same pattern as InkBlot/TapeStrip), all pointing upper-right; callers aim with `rotation` + `flip` on top of a seeded ±5° waver. The arrowhead is two short curved flicks off the tip, drawn slightly heavier (2 vs 1.8 stroke-width), never a closed/filled triangle. `<EmphasisUnderline>`: inline wrapper; `single` is `RedStringCorrection`'s stroke verbatim, `double` adds a thinner counter-drifting pass, `wobbly` tightens the waver. Both run through `#hand-wobble`.
  Rationale: A filled triangular head is the one detail that instantly reads "vector marker library" — flicks keep it a pen. Fixing the unrotated direction (upper-right) and aiming via props keeps seeds purely cosmetic, so a re-seed never re-aims an arrow at the wrong thing. The ±5° cap (vs InkBlot's 12°) exists because an arrow's rotation carries meaning. C6 is now unblocked; `<HandDrawnChart>`'s inline annotation `<line>` can be replaced by the arrow when C6 lands.
  Reviewer:  Ledger-keeper (pending Chien)

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

## 2026-06-23 — Monthly Wrapped: storage & re-seal (plan)

Confirms the two open questions from `work/monthly-wrapped/spec.md` (Constraints).

- **Storage = one column, verdict only.** Only the AI verdict is persisted
  (`sealed_months.wrapped_text`). The deterministic bundle (spent/returned/net/
  per-category/largest) is **recomputed** on every read — at seal time and on `?slip`
  re-read. Recompute is a single month-scoped aggregation over a small row set: zero
  tokens, so "no second AI call on re-read" (AC#4) holds without a bundle JSON column,
  a `wrapped` table, or an `/api/wrapped` route (all explicitly Out).
- **Re-seal overwrites `wrapped_text`.** A reopened/stale month that is re-settled
  regenerates and overwrites the verdict — no versioning. The bundle being recomputed
  means the new verdict always matches current entries.
- **`expenses` has no `user_id`** (single-keeper books, per `sealing.ts`): the entry
  aggregation scopes by calendar month; only the `sealed_months` row scopes by user.

---

## 2026-06-23 — Monthly Wrapped: verdict reveal & year-nav consolidation

The reveal build (`Typewriter`, `MonthSlip`, `WrappedReveal`).

- **Typewriter unveil, not token streaming.** The verdict is generated once at seal
  time and stored; the "pen writing" is a char-by-char unveil of the already-present
  string (`Typewriter.tsx`, ~19ms/char), not a streamed `streamText`. Visually identical
  to live streaming, keeps the "generate once, re-reads cost zero tokens" design intact.
  Stroke-path handwriting (a pen tracing glyph centerlines) was scoped and rejected:
  needs a single-line font + runtime layout, ~1–2 days for a once-a-month moment.
- **Note size reserved up front.** `Typewriter` grid-stacks the full verdict invisibly
  under the revealed slice, so the slip holds its final height while writing instead of
  reflowing line by line. Reveal scroll pins `block: 'end'`.
- **One year-nav control.** Removed the in-reveal "To the year" button — it duplicated
  the dashboard footer link. The footer link is now `<YearLink>` (shared `lib/go-to-year.ts`),
  which runs the page-flip. Trade-off: the footer link, previously a plain `<Link>`, now
  flips. Accepted — one consistent control beats two that behave differently.
- **Nib asset is hand-authored inline SVG** (fountain nib: tine tip at origin, central
  slit + breather hole cut in paper color so it reads at 22px). No icon library.

## 2026-06-23 — Rubber-Stamp Auditor: verdicts on `expenses`, stale-on-edit accepted
- Per-entry audit verdict + margin note stored as two nullable columns on `expenses`
  (`audit_verdict`, `audit_note`), not a separate audit table. One keeper, no per-user
  scoping needed; a table would add a migration, joins, and scoping for no gain (YAGNI).
- Verdict is generate-once/store/replay (mirrors `sealed_months.wrapped_text`). Editing
  an already-stamped entry does **not** re-audit — stale-on-edit is accepted as a known
  ceiling, since entries are near append-only via Shortcuts. Upgrade path if it bites:
  clear the verdict on edit (or hash the content) so the next month-view re-stamps.
- AI is final judge: JS computes duplicate/anomaly candidate flags, one model call per
  month-view batch returns verdict + note and may clear/raise. No SQL tool loop — facts
  passed in, same escape-hatch-not-default stance as `wrapped.ts`.
- **/plan-stage choices (spec deferred these):**
  - **Stamp colors:** APPROVED → `navy`, SUSPICIOUS → `red`. Keeps stamp-red on the
    flagged minority only, under the ~3% budget. Reuses `LedgerRow.stamp`.
  - **Arrow scope:** the amount arrow renders on SUSPICIOUS rows only — the spec intro
    says "arrow pointing at the *flagged* figure"; AC#3 says "each audited row". Resolved
    toward the intro (the arrow *is* the flag device; nothing to flag on APPROVED).
  - **Thresholds:** duplicate window ±3 days (same category+amount, exclude self);
    anomaly = amount > 3× the all-time category median, requiring ≥4 samples in that
    category. Median rounded to integer (VND invariant).
  - **Trigger:** audit runs inline in the dashboard server render when the range is
    `this_month`/`last_month`, before reading the register — no new route/client effect.
  - **Detector self-check:** detectors live in `lib/dashboard/detectors.mjs` (pure JS,
    JSDoc-typed) with an inline assert `demo()` run via `node` (`test:audit`). No test
    framework added — two pure functions don't justify vitest/tsx.

## 2026-06-23 — Rubber-Stamp Auditor: shipped quiet (reverses two /plan-stage UX choices)
- **APPROVED is the silent default — no stamp, no note.** Live review killed the planned
  "APPROVED → navy stamp": a column where every row reads APPROVED carries zero signal and
  reads as clutter. Only SUSPICIOUS stamps now. Reverses the 2026-06-23 plan-stage "stamp
  colors" decision (navy APPROVED dropped; red SUSPICIOUS kept).
- **Notes generated only for SUSPICIOUS, at the source.** `note` made `nullable` in
  `auditSchema` (not `optional` — OpenAI strict structured-output requires every property
  in `required`; nullable is the allowed form), and the prompt sets `note: null` for
  APPROVED. ~50 fewer note generations per month-audit; APPROVED rows clean by construction.
  Display still guards on `suspicious` so pre-change persisted APPROVED notes stay hidden
  without a backfill.
- **Stamp moved to the category cell as an absolute overlay.** Inline-in-amount pushed the
  figure and wrapped large amounts onto two lines. The stamp now floats over the category
  td (`pointer-events-none`, `relative` td) so it never reflows the numeric column. The
  margin arrow (`noteArrow`) was dropped from the auditor rows — the stamp is the flag now.
  Reverses the plan-stage "arrow scope" decision.
- **Table locked to fixed widths.** `table-fixed` + `<colgroup>` (date 6rem, time 4.5rem,
  category 15rem, amount 9rem; description absorbs the slack). Numeric columns now align
  across all rows regardless of content. Reviewer: chien.

## 2026-06-24 — The Loupe: spec trade-offs (WebGL refraction over CSS lens)
- **WebGL refraction chosen over the lazy CSS lens**, despite the council flagging
  `html-to-image` fidelity as the gating risk. Mitigation: the page-turn rig already
  ships that exact capture path (`lib/page-flip/capture.ts` → `toCanvas`) in production,
  so the risk is retired, not speculative. The loupe mirrors the page-turn's
  create-overlay → ShaderMaterial → dispose lifecycle (`renderer.ts`/`leaf.ts`).
- **Two-layer reveal, not one magnified texture.** Content is provenance that does NOT
  exist in the normal DOM, so the shader composites a refracted base-page texture
  (everywhere) plus a *separate* hidden fine-print texture (only inside the lens). A
  pure "magnify what's on screen" lens was rejected as it can't reveal hidden detail.
- **Desktop-pointer only, no fallback surface.** Touch / no-WebGL / reduce-motion → the
  loupe doesn't render and provenance stays hidden. Reuses the page-turn's existing
  `<1024px` + reduce-motion gate, so "desktop only" adds no new branch. CSS-lens and
  tap-to-expand fallbacks both rejected as scope the single user doesn't need.
- **No new DB columns.** Provenance limited to what `queries.ts` already returns
  (`created_at` time, full `id`, `subcategory`, `type`, `audit_verdict/note`). The
  mockup's edit-history / device / source lines were dropped — those columns don't exist
  and entries are near-append-only via Shortcuts (DECISION_LOG 2026-06-23).
- **Open fidelity risk for /plan:** magnified micro-type must be captured at ~2×DPR to
  stay crisp under glass; if `html-to-image` can't hold it, draw that one layer directly
  to the texture canvas. Reviewer: chien.

## 2026-06-24 — The Loupe: fine-print drawn with Canvas 2D, not html-to-image
- **The hidden fine-print layer is drawn directly with Canvas 2D** (`ctx.fillText` per row
  onto a 2×-DPR canvas keyed off each `[data-row-id]` rect), not captured via
  `html-to-image`. The spec listed direct-draw as the *fallback* for the micro-type
  fidelity risk; promoting it to the **primary** path because it's both crisper (no
  upscale, no foreignObject rendering) and *less* code than cloning hidden DOM —
  `html-to-image` would also need the `var()`-inlining workaround `capture.ts` carries.
  The base page layer still reuses `capturePage()`/`toCanvas` unchanged. Reviewer: chien.

## 2026-06-24 — The Loupe: restore per-entry audit notes (reverses SUSPICIOUS-only)
- **`audit_note` is now generated for EVERY entry again** (APPROVED included), reversing
  the Rubber-Stamp Auditor's "notes only on SUSPICIOUS" decision (DECISION_LOG 2026-06-23).
  The loupe's provenance fine-print reveals the clerk's reasoning per row, so an APPROVED
  entry with a null note shows `verdict APPROVED` and nothing else under the glass — the
  reasoning the loupe exists to surface was missing.
- **Schema `note` went `z.string().nullable()` → `z.string()`** (required) and the
  `auditTask` prompt now asks for a one-line note on every entry (reason-for-hold on
  SUSPICIOUS, brief reason-it-passed on APPROVED). The *visible* ledger is unchanged —
  it still renders stamp+note on SUSPICIOUS rows only (`_ledger.tsx`), so the quiet-UI
  intent of the Auditor holds; the note now lives in the data for the loupe to read.
- **Back-fill not done.** Existing APPROVED rows keep `audit_note = null` and show no
  reasoning under the glass until re-audited; new entries get notes automatically.
  Reviewer: chien.

## 2026-06-24 — Trips Phase 1: Supabase Storage, single public bucket
- **Scene images go to a single public Supabase Storage bucket `trips`** (migration
  `010_trips_bucket.sql`), served via plain public URLs — VISION calls for manual photo
  upload and Supabase is already the platform, so no new dependency. Uploads run through
  the service-role key in `lib/trips.ts`; objects live at `${tripId}/${uuid}.${ext}`.
- **`public`/`private` is metadata only in Phase 1, not a CDN-access control.** Private
  trips' images sit in the same public bucket behind unguessable UUID paths; the flag
  governs visibility in the (Phase 2) Atlas, not link secrecy. Acceptable for a personal
  journal; revisit with signed URLs + a private bucket if real secrecy is ever needed.
- **Image rendering uses plain `<img>`, not `next/image`** — skips remote-pattern config
  for a personal app. **Scene reorder is up/down swap, not drag-and-drop** — no DnD lib.
  Reviewer: chien.

## 2026-06-24 — Trips Phase 1: public viewer carves one middleware auth hole
- **Phase 1 ships a working public viewer** (`/spec trips-p1-scenes`), revising the
  earlier "public/private is metadata only" stance above: `/trips/[id]` is readable
  **unauthenticated when the trip is public**, 404 otherwise.
- **The exception lives in `middleware.ts`.** The centralized-auth invariant says routes
  don't re-check auth, so the only sanctioned hole is an unauthenticated GET to
  `/trips/[id]` (single-trip view). `/trips` (list), `/trips/[id]/edit`, and all
  `/api/trips/*` mutations stay session-gated.
- **The page server-component is the access control**, not its absence: it loads the
  trip and `notFound()`s for private-and-not-owner, renders for owner-or-public. The
  public bucket (UUID paths) already serves images without auth, so no signed-URL work
  is needed — the prior storage entry's access model still holds. Reviewer: chien.

## 2026-06-24 — Trips Phase 2 (Atlas): marker storage + agent-drawn map
- **Marker position stored as `atlas_x` / `atlas_y` floats in `[0,1]` on `trips`** (nullable
  = unplaced), as fractions of the base map's intrinsic size — not pixels and not real
  coordinates. Survives map re-sizing/re-arting and keeps "fantasy over fidelity": no
  geocoding ever. Drag-to-place; unplaced trips sit in a tray. Reuse the existing trip
  PATCH path to persist, no new endpoint.
- **Base world map is one committed static SVG drawn by a delegated Claude Opus agent**
  that screenshots and eyeballs its own output until the art reads as hand-drawn — not a
  sourced/public-domain image and not a code-generated placeholder. SVG must be
  self-contained (no external fonts/refs) for identical SSR/CSR rendering. The drawing is
  a `/plan` build step, not runtime code.
- **Atlas is owner-only in Phase 2.** A public/shareable whole-map view is deferred;
  per-trip public sharing (Phase 1) already covers sharing. Reviewer: chien.
- **Build outcomes (shipped):** marker drag uses one pointer handler with a 5px threshold
  (tap → navigate, drag → place/move, drop off-map → un-place; the tray *is* the un-place
  affordance — no button), optimistic PATCH with revert. Page surfaces use `min-h-dvh`
  (not `min-h-full`, which collapsed to content height and showed a bg gap on short pages —
  fixed in `<Parchment>` too). Accepted seam: the agent-drawn `trips-atlas.svg` reads as
  uneven hand-inked but its coastlines lean *puffy/scalloped* — a soft miss on the anti-slop
  covenant, accepted for now, redraw candidate. Reviewer: chien.

## 2026-06-24 — Trips "Cartographer's Hand" design system (sibling to Paper Ledger)
- **A dedicated Trips design system** (`docs/trips-design-system.md`) was cooked before
  building Phase 2, as the durable reference for all Trips phases. It is a **sibling, shared
  hand**: own tokens/components, but built on Paper Ledger's bones (the 5 fonts, the SVG filter
  library, `tiltFor` seeds, "nothing floats", no-emoji, written-vs-printed layers). Register =
  **brand/experiential** (Trips-scoped; the parent expense app stays `product`).
- **The parchment-slop trap, resolved by a 4-lens design council** (cartography historian,
  anti-slop critic, SVG/CSS pragmatist, diarist). Parchment is the metaphor but `tan + burnt
  edges + wax + centered compass + dotted-red route` is THE 2026 AI default. Resolution:
  **parchment is the substrate, not the look** — ink, handwriting, and asymmetric *handled*
  damage carry identity. Banned: symmetric edge-burn/vignette, flat tan fill, centered/3D
  compass, even-dot routes, glossy wax, X-marks-spot.
- **Fork 1 (owner): sea-dominant Atlas + parchment trip pages.** The Atlas ground is an uneven
  dilute iron-gall green-grey wash with parchment islands (kills the flat-tan tell on the loud
  surface, same build cost as a rectangle); trip maps stay parchment sheets, always foxed.
- **Fork 2 (owner): route is ink-brown; red (`stamp-red`) reserved for "you are here / today"**
  only — preserves Paper Ledger's "red always means something" DNA and dodges the dotted-red
  cliché.
- **v1 primitives** (`app/trips/_components/carto/`): `HandPath`, `WaxSeal`, `Cartouche`,
  `CompassRose`, `Sea`, `Island`, `Foxing`, `TerrainGlyph` (×3), + `lib/trips-carto.ts`
  (normalize/decimate/toPath, runnable check). **Deferred:** sea monsters/marginalia, bespoke
  3D motion, procedural/generated assets, graticules. **Fog-of-war specced (one SVG mask), not
  built.** Live preview gallery at `/spikes/trips` (a literal `/trips/_preview` can't route —
  `_`-folders are private and `/trips/<x>` collides with the public `[id]` hole). Reviewer: chien.

## 2026-06-25 — Trips Phase 3 (maps + routes) spec

- **Trip-map art engine (VISION open question, resolved): GPX-inked route + hand-placed
  scene seals — both, not either/or.** The route is a `HandPath` inked stroke from an
  optional GPX upload; scenes are wax seals placed by hand (drag, like the Atlas). A trip
  with no GPX still works — hand-placed seals alone make a complete map. The `/spikes/trips`
  "Trip-map cover" already proved this rendering, so Phase 3 is wiring + GPX parsing, not new art.
- **`/trips/[id]` becomes the parchment map (the trip's front door); the slideshow moves to
  `/trips/[id]/play`.** Matches VISION ("the Trip: its own parchment map where wax seals open
  the story"). Seals deep-link into the slideshow at a specific scene. Cost: re-point existing
  links (trips list, Atlas marker, edit page) that assumed `[id]` = slideshow.
- **Procedural vs hand-drawn terrain (VISION open question): deferred to Phase 4.** Phase 3
  ships route + seals + cartouche + compass rose only. No user-placed terrain glyphs (that's a
  whole placement+storage surface); the roadmap already defers the glyph library to Phase 4.
- **GPX parsing: server-side, no new dependency** — regex `<trkpt>` scan → project lon/lat →
  reuse `normalize`/`decimate`/`toPath`. Store the route *decimated* (~120 normalized points)
  as JSON on the trip, not the raw track. Reviewer: chien (spec).

## 2026-06-25 — Trips Phase 3 (maps + routes) plan

- **GPX endpoint is `/api/trips/gpx`, not the spec's literal `/api/trips/route`.** A `route/`
  folder beside `app/api/trips/route.ts` reads as a footgun (file vs folder both named `route`).
  Same auth plumbing (middleware gates `/api/trips/*`; handler gates by `tripOwner`) — no parallel
  auth, the spec's actual constraint. POST = multipart upload (parse→normalize→decimate→store);
  DELETE = clear route.
- **Scene placement reuses `PATCH /api/trips/scenes`** (new `{id,map_x,map_y}` mode), mirroring the
  Atlas `atlas_x/atlas_y` both-or-null validation — no new endpoint, no new auth.
- **Public hole widened to `/trips/[id]/play`.** Since the slideshow moved off `[id]`, middleware
  gains one regex clause so a public trip's `/play` is reachable signed-out. `/edit` stays private;
  `/trips/atlas` stays excluded.
- **No mass link rewrite for the route move.** Cards + Atlas markers already target `/trips/[id]`;
  landing on the new map cover is the desired front door. The slideshow is reached from the cover
  (seal click / "Play ▸" link), not by re-pointing every caller. Reviewer: chien (plan).

## 2026-06-25 — Trips Phase 3 (maps + routes) build

- **`parseGpx` self-check runs via `node lib/trips-carto.ts`**, guarded by
  `(import.meta as {main?:boolean}).main` so it's a no-op when Next bundles the module. TS doesn't
  type `import.meta.main` (Node ≥24 only), hence the cast — the alternative (a separate `.mjs` test)
  can't import the `.ts` parser without duplicating it. One assert covers lon→x/-lat→y, dropped
  malformed points, normalize→[0,1], and decimate→120.
- **Migrations 012/013 applied 2026-06-25** (after owner approval — auto-mode had initially denied the
  live `ALTER TABLE`). `information_schema` confirms `trips.route` (jsonb, nullable) and
  `scenes.map_x`/`map_y` (double precision, nullable) — AC3 met. AC5 (parser: 4000 trkpts → 120
  points, switchbacks preserved) verified via the `node lib/trips-carto.ts` check style. Remaining
  browser ACs deferred to the `/verify` pass. Reviewer: chien (build).

## 2026-06-25 — Atlas base map: adopt Azgaar export; filter must leave the root `<svg>`

  Context:   Replaced the agent-drawn `public/trips-atlas.svg` with an Azgaar Fantasy Map Generator export (a fantasy world reads more "wandered" than the generated blob). In-app the colors were wrong — saturated, not the muted `dingy` cast of the raw file.
  Decision:  Keep the Azgaar SVG as the single committed asset (the Phase-2 "one re-art-able file" decision still holds — swapping the map is one `cp`). Move its `dingy` `feColorMatrix` from the root `<svg filter=...>` onto the `#viewbox` content group.
  Rationale: Chromium drops a `filter` set on the OUTERMOST `<svg>` when the file is loaded via an `<img>` tag (as the atlas board does). On a child group it applies normally. One-attribute move, no app code touched. Aspect 1496×933 ≈ the board's 16/10, no distortion; no `<text>` labels to fight the theme; existing seal placements are map-relative fractions so they survive (just re-drag).
  Reviewer:  chien.
