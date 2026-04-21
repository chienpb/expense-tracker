# Dashboard Redesign — "Daybook spread" plan

> The Paper Ledger chrome shipped in Phase 5, but `/dashboard` reads as a tall single-column scroll rather than the desk-blotter **spread** the mockup intends. This doc tracks the refactor to match the reference artwork (`docs/refs/dashboard-intended.png`) without changing any data/query shape.
>
> **Scope.** Layout, chrome, and component composition on `/dashboard` only. No new data, no schema, no API change.
>
> **Non-goals.** Mobile polish (owned by Phase 9 of the main roadmap), full a11y sweep (Phase 10), new assets (Phase 7).

---

## Reference

| Source | Use |
|---|---|
| `docs/DESIGN_SYSTEM.md` | Source of truth for tokens, components, and voice. Re-read §3 (layout) and §4 (components) before touching anything. |
| `docs/ROADMAP.md` | Phases 0–6 context. This doc is a sub-track of the broader migration, not a replacement. |
| Reference mockup (intended) | `SỔ THU CHI · FORM CHN-01` spread: hero + daily chart on the left, summary boxes + tally categories + pinned Quick-Entry slip on the right. |
| Current build | `/dashboard` as of 2026-04-21 — functional, on Paper tokens, but vertically stacked and missing several spec primitives. |

## Gap summary (why we're here)

1. Page is a tall single column; intended is a two-column desk spread.
2. Masthead lacks the Vietnamese eyebrow, `week of …` title, and today's red stamp.
3. Section nav renders as plain links, not manila `<FileTab>`s.
4. Hero skips the `LINE A.` field-line framing, gross/returned footnotes, and handwritten margin notes.
5. Summary stats are a full-width band of bare figures, not bordered form-field boxes docked top-right.
6. Category breakdown is a bar chart; spec calls for `LINE B.` tally-mark rows.
7. Daily chart lacks per-bar handwritten value labels and the dashed-ellipse peak annotation (`<HandDrawnChart>` already supports it).
8. The 6-chip date-range row is the loudest chrome on the page; intended is a `week of` stepper with the presets tucked away.
9. `<QuickAdd>` lives at the bottom of the scroll; intended is a pinned `<CarbonSlip>` with a paper-clip in the right column.
10. Register has no column dividers, no pagination chrome, no footer (`PG. x / y · — balanced ✓ · INITIALS`).
11. Several spec primitives exist but aren't wired: `<MarginNote>`, `<TapeStrip>` on the page, `<PaperClip>` on the slip, dashed-ellipse chart annotations, today's `<Stamp>`.

---

## Working rules

- **One chunk = one PR.** Every chunk leaves `/dashboard` shipping and visually coherent.
- **No data changes.** `searchParams` (`range`, `from`, `to`, `day`) and every query in `lib/dashboard/queries.ts` stay exactly as they are.
- **Reuse, don't invent.** Every new visual uses a component already in `app/_components/paper/`. If something's missing, it goes into that directory, not inline.
- **Design-system deck.** Every chunk updates `/design-system#dashboard` before flipping on the real route.
- **DECISION_LOG for every non-trivial trade-off** (e.g. whether the range presets move into a popover or stay inline).

---

## Chunks

Order is chosen so the biggest visual wins land first and later chunks can't be blocked by earlier ones.

### C1 · Masthead & file-tab nav
**Goal.** The page opens with the right "form" identity.

- [ ] Replace the plain nav row with manila `<FileTab>` components top-right (`LEDGER / RECURRING / CHAT / OUT`). `OUT` = `<SignOut />`.
- [ ] Add the typewriter eyebrow `SỔ THU CHI · PERSONAL EXPENSES · FORM CHN-01` above the page title.
- [ ] Retitle the page to `Daily Ledger — week of {weekStart}` when the active range is a week-ish window; otherwise keep a range-appropriate subtitle.
- [ ] Dock today's red rubber `<Stamp text="APR · 20 · 2026">` in the masthead corner.
- [ ] Add `<TapeStrip>` at the page top corners per §3.1 (primary page).

**Exit.** Masthead matches the reference at a glance — identity, tabs, stamp.

### C2 · Spread layout (1.5fr 1fr)
**Goal.** Turn the scroll into a spread.

- [ ] Restructure `/dashboard` into a top-level CSS grid: `lg:grid-cols-[1.5fr_1fr]` with a 40–48px gutter.
- [ ] **Left column:** hero → daily chart → register.
- [ ] **Right column:** summary boxes → `LINE B.` tally list → pinned `<CarbonSlip>` Quick Add.
- [ ] Mobile: stack in the current order (hero → summary → chart → category → register → quick-add). Tape strips off per §3.4.
- [ ] Leave Ledger / QuickAdd / charts untouched inside this chunk — just move the boxes.

**Exit.** Desktop reads as a two-page spread. Mobile still works.

### C3 · Hero reframe (`LINE A.`)
**Goal.** The hero reads as a labeled form line, not a freeform block.

- [ ] Add the `LINE A. — TOTAL SPENT, WEEK TO DATE` (or range-appropriate) typewriter label above the hero amount.
- [ ] Convert `gross` / `returned` into a pair of inline `<FieldLine>`s beneath the hero — printed label, printed value, dotted underline.
- [ ] Add a `<MarginNote>` slot next to the hero for a handwritten footnote (`"net, after paybacks"` when `totalIncome > 0`; empty otherwise — no filler text).
- [ ] Add a small week-over-week delta note (`↑ a bit over last wk` or `↓ under`). Phrasing: clerical, no emoji, no exclamation.
- [ ] Introduce `getPriorRangeTotal()` helper in `lib/dashboard/queries.ts` so the delta has real data. (Only new data in the whole refactor — explicitly called out.)

**Exit.** Hero reads as the top of a ledger line, not a hero banner.

### C4 · Summary stat boxes
**Goal.** The three figures live in the right column as bordered form fields.

- [ ] Extract `<SummaryBox>` into `app/_components/paper/SummaryBox.tsx` (1px ink border, paper-2 fill, typewriter label top, serif value below).
- [ ] Move `Entries / Daily avg / Top cat` into the right column, above `LINE B.`.
- [ ] `Top cat` shows `{category} {pct}%` in the value (right now it only shows the category name).

**Exit.** Summary stats look pre-printed onto the form.

### C5 · Category breakdown → tally list
**Goal.** `LINE B.` renders as handwritten tallies, not a chart.

- [ ] Replace the `<CategoryChart>` usage in `/dashboard` with a `LINE B. — BY CATEGORY` list: each row is `{name}   {tally marks}   {amount}`.
- [ ] Tally count = round(share × 10) or a similar stable mapping — document the choice in DECISION_LOG.
- [ ] Keep `<CategoryChart>` around (still used by `/design-system`) for now; remove in the Phase-9 cleanup if unused.

**Exit.** Category breakdown feels hand-kept.

### C6 · Daily chart annotations
**Goal.** `FIG. 1 — DAILY` gets the hand-drawn callouts the spec promised.

- [ ] Add per-bar handwritten value labels above each bar (`1180k`, etc.) in Patrick Hand, pen-navy.
- [ ] Wire the dashed-ellipse annotation (already in `<HandDrawnChart>`) to the peak day with a Caveat callout (`"ouch — {category}"` if a single category dominates that day, else `"peak"`).
- [ ] Shrink the chart's height to leave room for the register below in the spread layout.
- [ ] Add the `FIG. 1 — DAILY` eyebrow.

**Exit.** The chart reads as an annotated ledger figure, not a Recharts output.

### C7 · Range control — collapse the chip row
**Goal.** The date range stops being the loudest chrome on the page.

- [ ] Replace the inline 6-chip `<DateRangeTabs>` with a compact week-stepper (`← week of Apr 14 →`) plus a "change range" button that opens a small paper-clipped popover with the presets.
- [ ] Keep `RANGE_LABELS` and the `RangeKey` contract intact — this is a pure presentation refactor.
- [ ] Document the UX choice + keyboard story in DECISION_LOG.

**Exit.** The range control is present but quiet.

### C8 · Register refinement + footer
**Goal.** The register reads like a page of a book, with a real footer.

- [ ] Trim the register to ~8 rows per page, add `next page` / `prev page` via a new `page` searchParam.
- [ ] Add dotted column rules between Date/Time, Description, Category, Amount.
- [ ] Income / payback rows: description in Patrick Hand pen-navy (already handwritten), amount as `({formatted})` in stamp-red (already done — verify).
- [ ] Add the page footer: `PG. {n} / {total} · — balanced ✓ · INITIALS ___`. The checkmark is the `<Glyph name="check">` — don't use an emoji.

**Exit.** The register feels bound, not loose.

### C9 · QuickAdd → docked carbon slip
**Goal.** QuickAdd becomes a proper pinned slip in the right column.

- [ ] Migrate `<QuickAdd>` to wrap its form in `<CarbonSlip>` with a `<PaperClip>` on top.
- [ ] Slip header reads `FORM CHN-01-A · QUICK ENTRY`.
- [ ] Field-lines: `amount:`, `category:`, `desc.:` — each a `<FieldLine kind="hand">`.
- [ ] Single `RECORD →` button (no secondary cancel; form resets on success).
- [ ] Position: `lg:sticky lg:top-8` inside the right column so it stays visible as the register scrolls.
- [ ] Mobile: unstuck, collapses to a `"File a new entry"` affordance that expands the slip.

**Exit.** The slip is the right-column anchor, visible whenever the user wants to file.

### C10 · Margin notes, final polish
**Goal.** The page feels hand-kept, not just typeset.

- [ ] Wire `<MarginNote>` slots on: hero week-over-week (C3 already seeded), peak day on chart, largest category row.
- [ ] Audit every string for voice compliance (already covered by Phase 6, but re-check each new surface added here).
- [ ] Screenshot deck: Day + Midnight, populated + empty. Update `/design-system#dashboard`.
- [ ] Vietnamese torture-string pass (`Cà phê sữa đá Cộng Cà Phê — chi nhánh quận 1`) on the new QuickAdd slip and register columns.

**Exit.** `/dashboard` visually matches the reference artwork. Close this doc.

---

## Tracking

Check boxes above as each chunk lands. When all ten chunks are complete, archive this doc at the bottom of `docs/ROADMAP.md` under a "Dashboard redesign · landed" line and remove its row from `docs/INDEX.md`.

*Last updated: 2026-04-21 · owner: Chien + Ledger-keeper (Claude) · status: planning — no chunks landed.*
