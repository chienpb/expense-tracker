# Chien — "Paper Ledger" Design System
## A tactile, hand-kept expense tracker disguised as a Vietnamese sổ thu chi

> **One-line philosophy.** Every screen should feel like a real, well-worn paper ledger that someone has actually been keeping for years — not a digital app pretending to be paper. When in doubt, ask: *"would this exist on the page if I printed and wrote on it?"* If no, redesign it.

---

## 0. The Metaphor — non-negotiable rules

These are the ground rules. Every component, state, and interaction must obey them.

1. **Two layers exist: PRINTED and WRITTEN.** Printed = the form's pre-existing structure (typewriter font, black ink, geometric, immutable). Written = the user's contributions (handwriting font, navy ink, slightly tilted, organic).
2. **The system never invents data in the WRITTEN layer.** AI suggestions, system messages, and computed values appear PRINTED. Only the user's actual entries are HANDWRITTEN.
3. **Errors and corrections are visible.** Crossed-out text, red ink corrections, margin notes — never silent rewrites.
4. **Time leaves marks.** Older entries fade slightly. Heavily edited rows have visible erasure marks. Today's date gets a fresh red rubber stamp.
5. **Nothing floats.** No drop shadows for "elevation." If something needs to sit above the page, it's a piece of paper *taped*, *paper-clipped*, or *stapled* on top.
6. **No emoji. No icons in the lucide/feather sense.** Only stamps, hand-drawn glyphs, and typographic ornaments (❧ ✦ § ¶ †).

---

## 1. Color Palette

All colors named for their physical referent. Use HSL/oklch in code so dark mode (= "Midnight Ledger") can rotate them as a set.

### Light mode — "Daybook"
| Token | Hex | Use |
|---|---|---|
| `paper`         | `#f6efe0` | Primary page background — aged cream paper |
| `paper-2`       | `#f0e7d4` | Inset panels, file-tab unselected, secondary surfaces |
| `paper-3`       | `#e9deb9` | Pressed states, disabled fields |
| `ink`           | `#2c2418` | Printed text, form rules, structural lines (NOT pure black — printed ink fades) |
| `ink-mute`      | `#8a7a5e` | Caption text, table headers, form labels |
| `ink-faint`     | `#bfb094` | Disabled labels, watermarks, tertiary text |
| `rule-blue`     | `#a8c3d9` | Horizontal ruled lines (notebook lines) |
| `rule-pink`     | `#d89090` | The vertical margin rule (one per page, ~60px from left) |
| `pen-navy`      | `#1f3a5f` | Handwritten user input. THE color of "user-authored" data |
| `pen-navy-deep` | `#142844` | Heavy hand pressure — totals, signatures |
| `stamp-red`     | `#b02a2a` | Rubber stamps, refunds, corrections, "DUE", warnings |
| `stamp-red-fade`| `#c46b6b` | Stamp impressions on rough paper, secondary stamps |
| `pencil-gray`   | `#6b6055` | Pencil annotations — for *drafts*, AI suggestions before commit |
| `highlighter`   | `#ffe88a` | Yellow highlighter — for filtered/searched/focused rows. Use sparingly |
| `coffee-stain`  | `#a07a4a` at 12% opacity | Decorative only. Never for data |
| `seal-gold`     | `#a68a3b` | Wax seal accents — special occasions only (annual report, milestone) |

### Dark mode — "Midnight Ledger"
The metaphor shifts: now it's a leather-bound diary read by lamplight. Don't just invert.

| Token | Hex | Use |
|---|---|---|
| `paper`         | `#1a1410` | Dark leather/aged page |
| `paper-2`       | `#221a14` | Insets |
| `paper-3`       | `#2c2218` | Pressed |
| `ink`           | `#e8dcc4` | "Faded gold ink" — printed text |
| `ink-mute`      | `#9a8a6e` | Captions |
| `ink-faint`     | `#5a4e3a` | Disabled |
| `rule-blue`     | `#3a4a5a` | Ruled lines, much more subdued |
| `rule-pink`     | `#5a3a3a` | Margin rule |
| `pen-navy`      | `#7ab0e0` | Pen ink — now glows slightly, as if wet |
| `stamp-red`     | `#e06060` | Stamps |
| `pencil-gray`   | `#807565` | Pencil |
| `highlighter`   | `#5a4e1a` | Highlighter (mutes nicely on dark) |

### Color usage rules
- Never use more than ONE accent color per screen region.
- Refunds, deletions, errors, "DUE", and stamps all share `stamp-red`. They are conceptually one thing: "marked in red."
- Never use stamp-red on more than ~3% of the visible screen.
- Pen-navy and ink (printed) should never appear on the same line, *unless* the line is a form field where the user has filled in a printed prompt.

---

## 2. Typography

Three families. Each has a strict semantic role. Mixing roles is a bug.

### 2.1 Printed / Serif — `"Crimson Pro"`
- **Role:** Body text, headings, computed values, headlines, anything the system "prints" for the user.
- **Weights used:** 400 (regular), 600 (mid), 700 (bold).
- **Italics:** Yes — captions, footnotes, parenthetical asides, "see ledger entry 14".
- **Numerals:** Use `font-variant-numeric: oldstyle-nums` for body text and `tabular-nums oldstyle-nums` for tables (so columns line up but numbers still feel set with care). For large hero numerals, use `lining-nums tabular-nums`.
- **Why Crimson Pro:** Clean transitional serif with full Vietnamese diacritic support. Reads well at 12px in tables, holds up at 96px as a hero.

### 2.2 Typewriter / Mono — `"Courier Prime"`
- **Role:** Form labels, table headers, status messages, system metadata, "FORM CHN-01", "PAGE 16/52", date/time stamps. Anything that looks pre-printed onto a form.
- **Weights:** 400, 700.
- **Letter-spacing:** Always `1–2.5px`. Always `text-transform: uppercase` for labels.
- **Use rule:** If it's a *label* for a field the user fills in, it's typewriter. If it's a *value* the user wrote, it's handwriting. If it's a value the system computed, it's serif.

### 2.3 Handwriting — `"Patrick Hand"` (primary) + `"Caveat"` (display fallback)
- **Role:** Anything the user authored. Margin notes. Reactions. The actual contents of input fields after submission.
- **Primary: Patrick Hand.** Single weight (400). Full Vietnamese diacritic support including stacked tones (`ấ ầ ẩ ẫ ậ ằ ắ ẳ ẵ ặ ề ế ể ễ ệ ồ ố ổ ỗ ộ ờ ớ ở ỡ ợ ừ ứ ử ữ ự ỳ ỷ ỹ ỵ`). Verified against real vocabulary (`Phở bò`, `Cà phê sữa đá — Cộng Cà Phê`, `Bún chả Đắc Kim`, `Hoàn tiền từ Mai`) — renders cleanly.
- **Display fallback: Caveat.** Use *only* for English-only moments at 24px+ — signatures ("— LK"), section flourishes, decorative chat labels. Never for anything that might contain Vietnamese. If mixed content is possible, Patrick Hand wins.
- **No italic variant exists.** Handwritten italics aren't real anyway — emphasis in handwriting is expressed by: underline (single pen stroke beneath), double-underline, circling, larger size, or stamp-red ink. Never by slanting.
- **Hand pressure / weight variation:** Patrick Hand is single-weight. Simulate hand pressure via `-webkit-text-stroke: 0.4px currentColor` for emphasized entries (totals, important notes). Don't overuse — most entries are normal pressure.
- **Color:** Always `pen-navy`. Never `ink`. Never `stamp-red` (corrections use stamp-red but in handwriting form — a different combination, see §6).
- **Rotation:** Always between `-2deg` and `+2deg`. Randomize per element with a deterministic seed (e.g. hash of entry id) so the same row always tilts the same way — this is critical for trust.
- **Size:** Always 1.3–1.5× the size of the surrounding printed text. Handwriting is bigger than print on real paper.
- **Optional second hand:** Reserve a slot for `"Homemade Apple"` as a "hurried note" variant (more slanted, fuller VN coverage) if you want a second distinguishable hand for rushed / casual entries.

### 2.4 Display Stamp — `"Archivo Black"`
- **Role:** Rubber stamp impressions ONLY. "RECEIVED", "PAID", "DUE", "DRAFT", "VOID".
- **Always uppercase, always inside a 2px border, always rotated 4–8deg.**
- Apply a turbulence filter (see §7) for the broken-ink look. Never used cleanly.

### 2.5 Type scale
Express as `clamp(min, fluid, max)` so it scales gracefully.

| Token | Family | Size | Line-height | Usage |
|---|---|---|---|---|
| `display-hero` | serif 700 | `clamp(56px, 8vw, 96px)` | 0.95 | Net total, monthly hero amount |
| `display`     | serif 700 | 48px | 1.05 | Page titles ("Daily Ledger") |
| `title-1`     | serif 700 | 32px | 1.1 | Section headers ("Dear Ledger-keeper") |
| `title-2`     | serif 600 | 22px | 1.2 | Subsections |
| `body-l`      | serif 400 | 18px | 1.55 | Article body, AI replies |
| `body`        | serif 400 | 14px | 1.55 | Default printed text |
| `caption`     | serif italic 400 | 13px | 1.4 | Footnotes, asides (printed italics only — never handwriting) |
| `label`       | mono 400 | 10px (1.5–2.5px tracked) | 1.3 | All form labels, table headers, system tags |
| `hand-l`      | Patrick Hand 400 + 0.4px stroke | 28px | 1.1 | Major handwritten entries (totals annotation) |
| `hand`        | Patrick Hand 400 | 18–22px | 1.15 | Standard handwritten input |
| `hand-s`      | Patrick Hand 400 | 14–16px | 1.2 | Margin notes, parentheticals (note: Patrick Hand at <14px loses legibility — don't go smaller) |
| `hand-signature` | Caveat 400 | 24px+ | 1.1 | Signatures & English-only display flourishes only |
| `stamp`       | display 400 | 11–14px (1.5px tracked) | 1 | Rubber stamps |

---

## 3. Layout & Grid

### 3.1 The page
Every primary surface is conceptually one **page**. Pages have:
- A pink **margin rule** (`rule-pink`, 1px) at exactly **60px from the left edge**. Nothing crosses this rule except headers and decorative elements (tape).
- Horizontal **ruled lines** (`rule-blue`, 1px) every **32px** down the entire page, anchored to a 12px top offset. Even empty space has rule lines — that's what makes it feel like paper.
- A printed **header** at the top (~80px tall, separated by a 2px black line from the body).
- A printed **footer** at the bottom (~32px, with page number / signature affordance).
- Optional **tape strips** at top corners (top: -8px; rotation -3deg / +2deg), only on "primary" pages (Dashboard, Ledger). Modal dialogs are pieces of paper *placed on top* — they get tape too.

### 3.2 Spacing scale
Multiples of 4. Most things should be a multiple of **8**, vertical rhythm should land on multiples of **32** to match ruled-line spacing.

`4, 8, 12, 16, 20, 24, 32, 48, 64, 80`

### 3.3 Grid
- Page max width: **1440px** centered, with breathing room on wider viewports represented as the desk surface (a darker `#dac8a4` outside the page, optional).
- Internal column system: **12-column** with 24px gutters, but used loosely — a real ledger isn't a grid system. Don't be afraid to break it.
- Common splits: `1.5fr 1fr` (Dashboard left/right), `2fr 1fr 1.1fr` (3-column report).

### 3.4 Mobile
The metaphor must survive at 375px wide. Approach:
- Page becomes a **vertical receipt scroll** rather than a desk-blotter spread.
- Margin rule moves to 36px.
- Ruled lines stay (they identify the metaphor).
- Tape strips disappear (they look weird on narrow paper).
- Tabs collapse to a `<select>` styled as a paper tag.
- Tables become a **stack of receipts** — each row a tiny torn-edge card.

---

## 4. Component Library

Every component named for its physical equivalent.

### 4.1 `<Page>` — root surface
Implements the ruled background, margin rule, header zone, footer zone. Accepts a `formCode` prop ("CHN-01") and `pageNumber`.

### 4.2 `<FieldLine label, value, kind>`
The fundamental input. Renders a typewriter label + an underlined slot. `kind` controls the value style:
- `kind="hand"` (default for user input) — Patrick Hand, navy, slight rotation.
- `kind="print"` (default for system values) — Crimson, ink color.
- `kind="stamped"` — for confirmed/locked values, sets a small stamp next to it.
The underline is a 1px black line, always.

**Emphasis inside a handwritten value:** never slant. Use a `<u class="hand-underline">` that renders a wobbly SVG stroke beneath. For strong emphasis, double-underline or switch the stroke to stamp-red.

### 4.3 `<LedgerTable>`
The transactions table. Rows are 32px tall (one ruled-line each — they snap perfectly). Columns:
- Date (typewriter, mute)
- Time (typewriter, mute)
- Description (serif OR handwriting per row, depending on entry type)
- Category (typewriter, uppercase, mute)
- Amount ₫ (serif, oldstyle-nums, right-aligned, bold; refunds in stamp-red parentheses)

Hover state: a faint highlighter band (`highlighter` at 30% opacity) sweeps across the row.
Drill-in: clicking a row "lifts" it as a paper-clipped detail card on top of the page.

### 4.4 `<Stamp>` — rubber stamp
A rotated rectangular border with stamp text inside. Props: `text`, `subtext`, `color` (default red), `rotation`, `wear` (0–1, controls turbulence intensity). Apply CSS filter `url(#stamp-wear)` for the broken-ink texture.

### 4.5 `<TapeStrip>` — translucent yellow tape
Decorative only. Props: `top, left/right, width, rotation, opacity`. Renders a rect with subtle inner highlights.

### 4.6 `<MarginNote>` — handwritten note in the margin
Pulls into the left margin (or floats right, near content). Pen-navy Caveat, `hand-s`. Optional: a thin ink line connecting the note to the referenced item.

### 4.7 `<PaperClip>` / `<TornCorner>` / `<FoldCrease>`
Small decorative components. Use sparingly — they signal "this attached to the page." Use a paper-clip on starred items, torn corner on archived ones, fold crease on monthly summaries.

### 4.8 `<CarbonSlip>` — pink form
A pink tinted rect (`#f7d8d0`) bordered in stamp-red, slightly rotated. Used for "Quick Add" forms — the metaphor is "tear off a carbon copy slip and fill it in."

### 4.9 `<FileTab>` — navigation
Manila-folder-style tabs at the top. Active tab connects seamlessly into the page below (same background, no bottom border on the tab); inactive tabs sit "behind" with `paper-2` fill.

### 4.10 `<HandDrawnChart>`
Chart wrapper that applies the hand-drawn aesthetic:
- Bars/areas: 15% opacity fill of the data color, 1.5px stroke
- Line charts: 1.5px stroke, `stroke-linecap="round"`, slight wobble via `feTurbulence` (baseFrequency `0.02`, displacement `1.2`)
- Annotations: dashed ellipses (3-2 dasharray) circling notable points, with a navy ink line and Caveat label
- Axes: a single bottom line, 1.5px, no grid

### 4.11 `<TallyMarks count={n} groupSize={5}>`
Renders count as IIII / patterns in Caveat, navy. Used for category breakdowns where the count matters more than precision.

### 4.12 `<InkBlot>` — error state
A small irregular navy splatter SVG. Used as the "this couldn't be written" indicator — appears next to fields that failed validation. Better than a red exclamation mark.

### 4.13 `<EraserMarks>` — loading / saving state
A faint pinkish-gray smudge overlay that pulses softly. The metaphor: "we're rubbing this out / writing this in." Replaces spinners.

### 4.14 `<RedStringCorrection>` — for edits
When a user edits a value, the old value remains visible with a single horizontal stamp-red strikethrough, and the new value appears immediately above or after in handwriting. Toggleable in settings ("show edit history").

---

## 5. Iconography

**No icons in the conventional sense.** Replace them with one of:

1. **Typographic glyphs** — `❧ ✦ § ¶ † ‡ ☞ ✎ ✐ ◆`. These exist in every font.
2. **Hand-drawn SVG glyphs** — small, ~16–20px, drawn with the same wobble filter as charts. Stored as a sprite sheet `glyphs.svg`.
3. **Stamps** — for status (PAID, DUE, VOID, DRAFT, ✓).
4. **Tally marks** — for counts.
5. **Arrows** — pen-drawn arrows pointing to things (curved, with a hand-drawn arrowhead, navy ink).

The glyph palette (memorize):
- `❧` — section opener / decorative bullet
- `✦` — important / starred
- `☞` — "see also" / link out
- `✎` — edit / write
- `→ ↗` — arrows (curved hand-drawn versions for emphasis)
- `✓` — checkmark, drawn as a quick pen-stroke
- `×` — cross out / delete
- `?` and `!` — drawn as hand-glyphs in margin

---

## 6. States

### 6.1 Hover
Highlighter pass — a subtle yellow band (`highlighter` at 30%) swipes across the element. Duration 200ms.

### 6.2 Focus (keyboard)
A 1.5px pen-navy border drawn *as if hand-traced* (slightly imperfect rectangle, `feTurbulence` displacement). Or simpler: a 2px dashed pen-navy outline.

### 6.3 Pressed / active
Element drops 1px and the paper darkens slightly (paper → paper-2).

### 6.4 Disabled
Text fades to `ink-faint`. Field underline becomes dashed instead of solid.

### 6.5 Loading
`<EraserMarks>` overlay. NEVER a spinner.

### 6.6 Empty
"Nothing on this line yet." in Caveat, ink-faint. Plus a subtle pencil-gray ✎ glyph in the margin inviting input.

### 6.7 Error
`<InkBlot>` next to the field. Field underline becomes stamp-red. Error message in Caveat, stamp-red, in the margin.

### 6.8 Success
A small ✓ stamped in stamp-red, with optional "RECORDED" sub-stamp.

### 6.9 AI suggestion (uncommitted)
Pencil-gray text, slightly faded. The metaphor: "the AI is suggesting this in pencil; commit it to ink to keep it." Click to accept → fades from pencil-gray to pen-navy.

### 6.10 Edited
Shows the strikethrough history (see `<RedStringCorrection>`).

### 6.11 Deleted (recently)
Shows the entry crossed out with a stamp-red strike + a `<Stamp text="VOID">` overlay for 5 seconds, then fades out.

---

## 7. SVG Filters & Effects

Define these as a single inline `<svg>` `<defs>` block at the top of the document. Reference them via `filter: url(#name)`.

### 7.1 `#paper-grain`
`feTurbulence baseFrequency="0.9" numOctaves="2"` → `feColorMatrix` to mute → composite at 6% opacity. Apply to body backgrounds.

### 7.2 `#stamp-wear`
`feTurbulence baseFrequency="0.4"` → `feDisplacementMap scale="2.5"` → `feComposite operator="in"`. Applied to stamps for the broken-ink look.

### 7.3 `#hand-wobble`
`feTurbulence baseFrequency="0.02" numOctaves="2"` → `feDisplacementMap scale="1.2"`. Applied to chart strokes and hand-drawn borders.

### 7.4 `#ink-bleed`
A subtle Gaussian blur (`stdDeviation="0.3"`) + slight color spread. Applied to handwriting at large sizes.

### 7.5 `#pencil-stroke`
Lighter turbulence + lower opacity composite. Used for AI-suggestion / draft state.

### 7.6 Performance notes
SVG filters CAN be slow if applied to large surfaces. Tile small filtered patterns and CSS-repeat them rather than filtering a 1440px element every frame.

---

## 8. Motion

Real ink and paper barely move. Animations should feel *physical*, never tweened-rubber.

- **Default duration:** 180–240ms.
- **Default easing:** `cubic-bezier(0.2, 0.0, 0, 1)` — fast in, gentle settle. Like ink drying.
- **Allowed motions:**
  - Paper *slides up* from the bottom for new entries (200ms, 12px translate).
  - Stamp *thumps down* with a 60ms scale from 1.4 → 1, plus a tiny rotation jitter.
  - Page *flips* for navigation (optional, 400ms 3D rotateY — use only between major sections, e.g. Dashboard ↔ Recurring).
  - Highlighter *swipes* across (200ms, left → right).
  - Eraser *pulses* (1s ease-in-out infinite) for loading.
- **Forbidden:** spring bounces, scale-pop on hover, gradient shimmers, "shimmer" skeletons. None of these exist on paper.

---

## 9. Accessibility

The metaphor is rich but cannot be at the expense of usability.

- **Contrast:** All text must hit WCAG AA. ink-mute on paper ≥ 4.5:1. pen-navy on paper ≥ 4.5:1. Test stamp-red on paper for non-text uses (3:1).
- **Handwriting font readability:** Caveat at 18px+ only. Below that, fall back to Crimson italic. Provide a setting "Use printed font for handwritten content" for users with reading difficulty.
- **Rotation:** Cap rotation at ±2deg. Provide a "reduce motion / reduce skew" setting that flattens all rotations to 0.
- **Focus indicators:** Keyboard focus must be unambiguous. The hand-traced border MUST also include a high-contrast solid outer ring for users who need it.
- **Screen readers:** All decorative SVG (tape, stamps, ink blots) gets `aria-hidden="true"` + `role="presentation"`. Real meaning lives in text.
- **Color blindness:** Stamp-red is the only red. It encodes "warning / refund / correction". Always pair with a glyph (✓, ×, ✎) so color is never the only signal.
- **Vietnamese:** Test every screen with the longest reasonable Vietnamese strings ("Cà phê sữa đá Cộng Cà Phê — chi nhánh quận 1"). Tabular-nums must hold. Caveat must render `Cộng` correctly (verify; fall back if not).

---

## 10. Content & Voice

The voice of the printed system is **clerical, polite, slightly old-fashioned**. Like a bank teller from 1962.
- "Recorded ✓" not "Saved!"
- "On this page" not "Loaded items"
- "Settle the books" for end-of-month
- "Entries" not "transactions" in chrome (the word "transactions" is fine in column headers)
- Dates: "Mon, 20 Apr 2026" for printed, the user can write whatever they want
- Currency: VND with VN-style dotted grouping (`1.180.000 ₫`)

The AI assistant is "**the Ledger-keeper**" — a personified ghost-clerk. Always polite, never enthusiastic, slightly dry. No exclamation marks. No emoji. Signs replies with `— LK` in pencil-gray.

---

## 11. Anti-patterns — never do these

- ❌ Drop shadows for elevation (use tape, paper-clips, fold creases)
- ❌ Pure black `#000` (use `ink` `#2c2418`)
- ❌ Rounded corners > 4px on anything structural (paper has straight edges)
- ❌ Material/shadcn/Apple-system iconography
- ❌ Skeleton loaders, shimmer effects, spinners
- ❌ Toast notifications (use a stamp instead — appears, dries, stays)
- ❌ Hover scale-up effects
- ❌ Gradients of any kind on UI chrome
- ❌ Modals that fade in centered with backdrop blur (use a paper-clipped slip)
- ❌ Translucent glassmorphism
- ❌ "Bouncing" loading dots
- ❌ Emoji
- ❌ Lorem ipsum (always real Vietnamese expenses if filling)

---

## 12. File & code conventions

- Tailwind config: extend with the named tokens from §1 (`bg-paper`, `text-ink`, `border-ink`, `text-pen-navy`, `font-hand`, `font-typewriter`, `font-stamp`).
- Components live in `app/_components/paper/` — `Page.tsx`, `FieldLine.tsx`, `Stamp.tsx`, `TapeStrip.tsx`, `LedgerTable.tsx`, `HandDrawnChart.tsx`, etc.
- SVG filters in `app/_components/paper/_filters.tsx` — a single `<defs>` block included once at root layout.
- Glyph sprites in `public/glyphs.svg`.
- Paper texture PNGs (the 4–6 allowed rasters from earlier) in `public/textures/` — `paper-grain.png`, `coffee-ring.png`, `ink-blot-1.png`, `fold-crease.png`. Each <30KB.
- Handwriting rotation seeding: `src/lib/seed-rotation.ts` exports `tiltFor(id: string): number` returning a stable value in `[-2, 2]`.
- Theme switching: a single `data-theme="day" | "night"` attribute on `<html>`. All tokens swap via CSS variables.

---

## 13. Decision log — record exceptions here

When you must break a rule, document it. Format:

```
2026-04-22 · TornCorner used on Recurring inactive items
  Rationale: visually communicates "set aside" better than fading
  Reviewed: Chien
```

Keep this list short. If it grows past 10 entries, the system needs revision, not more exceptions.

---

## Quick reference card (print and tape to your desk)

| Question | Answer |
|---|---|
| Is this user input? | Caveat, pen-navy, slight tilt |
| Is this a label? | Courier Prime, uppercase, tracked, ink-mute |
| Is this a value the system computed? | Crimson Pro, ink |
| How do I show "saved"? | Stamp it |
| How do I show "loading"? | Eraser marks pulse |
| How do I show an error? | Ink blot + margin note in stamp-red Caveat |
| How do I show a sticker/badge? | Stamp, NEVER a pill |
| How do I elevate a modal? | Paper-clip it on top |
| What color? | Whatever you wrote last time. Never invent new ones |
| Am I about to add an emoji? | Stop. Use a glyph or stamp |

---

*Last updated: 2026-04-20 · v1.0 · — Ledger-keeper*
