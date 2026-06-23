# Paper Ledger — Remaining Work

> Phases 0–9 + "Closing the Books" shipped (verify via `git log --oneline` and `docs/DECISION_LOG.md`). The Paper Ledger system is live; Swiss is archived. What's left:

## Phase 10 — Accessibility & polish

The metaphor must never cost usability (§9). None of this has shipped — no `@axe-core/react` in deps, no contrast/SR sweep on record.

- [ ] WCAG AA contrast sweep. `ink-mute` and `pen-navy` on `paper` ≥ 4.5:1; `stamp-red` on `paper` (non-text) ≥ 3:1. Automate with `@axe-core/react` in dev.
- [ ] Handwriting readability: no `text-hand-s` instance < 14px. Ship the "Use printed font for handwritten content" setting end-to-end.
- [ ] Rotation cap: every `tiltFor` element respects `data-reduce-skew="1"` → 0°.
- [ ] Focus indicators visible on every interactive element (hand-traced border + solid high-contrast outer ring).
- [ ] Screen-reader pass: decorative SVGs `aria-hidden` + `role="presentation"`; meaning in text. VoiceOver end-to-end.
- [ ] Color blindness: stamp-red always pairs with a glyph (✓, ×, ✎).
- [ ] Vietnamese torture test: longest realistic strings don't break tables/cards; tabular-nums hold.
- [ ] Reduced-motion: system `prefers-reduced-motion` disables every §8 animation; setting flag overrides either way.

**Exit criteria.** Lighthouse a11y 100. Axe 0 violations. VoiceOver walkthrough clean.

## Phase 11 — Portfolio polish & launch

- [ ] Clean up `/design-system` route (still live at `app/design-system/page.tsx`) — delete or gate behind `/admin`.
- [ ] Screenshot deck: Day hero, Midnight hero, mobile receipt view, empty/error states, stamp animation, AI reply. 1440×900 + 375×812.
- [ ] Short screen recording (15–30s): "log an expense → stamp appears" and "monthly report → paper flips."
- [ ] `docs/CASE_STUDY.md`: one-page design narrative (why paper ledger, what Swiss lacked, trade-offs, Vietnamese-recognition). Link before/after.
- [ ] Update README with "built with Paper Ledger design system — see `DESIGN_SYSTEM.md`."
- [ ] Every §13 + Quick-Reference Card checklist passes on every page.

(Swiss doc archive + feature-flag close-out already done in Phase 5.6.)

## Deferred odds and ends (from shipped phases)

- [ ] Per-page screen-reader pass (Phase 5 deferred it to the a11y phase — folds into Phase 10).
- [ ] SVG-filter perf check on real mid-tier Android (Phases 8/9 deferred for lack of hardware; risk low — tiled CSS `background-repeat` already chosen over full-element filtering).
- [ ] Custom date ranges on `/dashboard` (Phase 5.4 shipped presets only; custom deferred).
- [ ] Paper grain (A1): still the `feTurbulence` SVG tile. PNG bake measured 94KB (>30KB budget). Revisit only with a photographed grain.
