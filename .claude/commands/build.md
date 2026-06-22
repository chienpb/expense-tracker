---
description: Execute work/<slug>/plan.md, checking off TODOs as you go
---

You are running `/build`. **Clean room: read only the inputs named below — ignore prior
conversation.** Spec + plan are the source of truth.

## Context
- Argument: the slug. If omitted and exactly one `work/*/` folder has unchecked TODOs
  in its `plan.md`, use it; if ambiguous, show a picker.
- Read: `work/<slug>/spec.md` and `work/<slug>/plan.md` (both required). Read the
  detail docs the plan references; `docs/DESIGN_SYSTEM.md` is mandatory for UI work.

## Job
Work the TODO checklist in order. After each item lands, check it off in `plan.md`
(`- [x]`) so the file is a live progress indicator. Match surrounding code — naming,
comment density, idiom.

Stay on the plan. If reality diverges (the plan was wrong, a step is impossible, a new
constraint appears), **stop and tell the user** — don't silently re-architect. Small
obvious corrections are fine; note them in `plan.md`.

Honor invariants: integer amounts; auth only in `middleware.ts`; Paper Ledger UI;
log non-trivial trade-offs to `docs/DECISION_LOG.md`.

## Done
When the checklist is complete:
1. Run `npm run lint` and `npm run build`; fix what breaks.
2. Confirm each acceptance criterion in `spec.md` is met.
3. Tell the user it's ready for review: `/clear`, then `/code-review` and `/verify`
   (existing skills — the review phase reuses them, nothing custom).
