---
description: Brainstorm a feature spec with the user, write work/<slug>/spec.md
---

You are running `/spec`. This is the **only interactive phase** — you and the user
brainstorm together to produce a spec. The user drives WHAT and WHY; you ask sharp
questions, surface trade-offs, and write it down.

## Context
- Argument (optional): a slug or one-line idea. e.g. `/spec m0-capture-spike`.
- If a slug is given and `work/<slug>/spec.md` exists, you're **refining** it — make
  targeted edits, preserve the rest. Otherwise it's a **fresh** spec.
- Read first: `docs/INDEX.md` to orient. If the feature touches UI, read
  `docs/DESIGN_SYSTEM.md` (mandatory invariant). Read the matching IDEAS.md row if
  this comes from the backlog.

## Interview
Ask the user, one cluster at a time (don't dump all questions at once):
- **What** — the feature in one or two sentences.
- **Why** — the value. Skip if obvious.
- **Scope** — what's in, what's explicitly out.
- **Acceptance criteria** — checkable bullets. This is the contract `/plan` builds against.
- **Constraints** — invariants in play (amounts are integers, auth in middleware,
  Paper Ledger design system, etc.), perf budgets, anything that shaped a decision.

Push back when scope balloons (ponytail) or criteria are untestable. Recommend; don't
just transcribe.

## Output
Write `work/<slug>/spec.md`:

```markdown
# <slug>: <Title>

## What
## Why
## Scope
- In:
- Out:
## Acceptance Criteria
- [ ] ...
## Constraints / Notes
```

If a non-trivial trade-off or spike verdict came up, append it to
`docs/DECISION_LOG.md` with today's date + rationale (existing invariant).

Then tell the user: `/clear`, then `/plan <slug>`.
