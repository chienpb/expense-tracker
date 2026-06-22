---
description: Read a spec, write work/<slug>/plan.md with a TODO checklist
---

You are running `/plan`. **Clean room: read only the inputs named below — ignore prior
conversation.** The spec is the source of truth, not chat history.

## Context
- Argument: the slug. If omitted and exactly one `work/*/` folder lacks a `plan.md`,
  use it; if ambiguous, show a picker.
- Read: `work/<slug>/spec.md` (required). `docs/INDEX.md` to find which detail docs
  apply, then read those (e.g. `api.md`, `database.md`, `auth.md`,
  `DESIGN_SYSTEM.md` for UI — the last is mandatory for any UI work).

## Job
Turn the spec into a tactical plan. Be lazy: smallest diff that satisfies every
acceptance criterion. No speculative abstractions. Reuse existing components, tokens,
and helpers — name them.

Honor invariants: amounts are integers (VND, no decimals); auth lives in
`middleware.ts` (no per-route checks); Supabase service role, no RLS; UI follows
Paper Ledger.

## Output
Write `work/<slug>/plan.md`:

```markdown
# <slug> — Plan

## Files to change
| Action | File | What |
|--------|------|------|
| Create/Modify/Delete | path | one line |

## Approach & trade-offs
Short prose. Why this shape. What you deliberately skipped and when to add it.

## TODO
- [ ] step
- [ ] ...
- [ ] verify: <how each acceptance criterion is checked>
```

Map every acceptance criterion to at least one TODO. If the spec is ambiguous or a
criterion isn't checkable, stop and flag it instead of guessing. If a non-trivial
trade-off emerges, append it to `docs/DECISION_LOG.md`.

Then tell the user: `/clear`, then `/build <slug>`.
