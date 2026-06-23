---
description: Mark the current feature shipped — rotate docs/NOW.md, confirm the decision log, remind to commit
---

You are running `/close`. This terminates a build cycle: the feature passed review and
is shipping. You record it and reset the anchor for the next `/next`. Small and
mechanical — don't re-review the code here.

## Context
- Argument (optional): the slug or feature name. If omitted, use whatever is in the
  **Next up** section of `docs/NOW.md`; if that's empty, ask the user what shipped.
- Read: `docs/NOW.md`, and the tail of `docs/DECISION_LOG.md`.

## Job
1. **Rotate `docs/NOW.md`:**
   - Move the shipped feature into **Just shipped** as a new top entry — `**Name** (YYYY-MM-DD) — one line, note any seam left open`. Use today's date.
   - Trim **Just shipped** back to the last 1–2 entries (older ones live in git + the log).
   - Clear **Next up** back to `_(none chosen — run `/next`)_`.
   - Update **On deck** if this ship changes what's most sensible next (e.g. remove what just shipped, surface a newly-unblocked idea).
2. **Confirm the decision log:** check `docs/DECISION_LOG.md` has an entry for this work
   (the invariant requires one for non-trivial trade-offs). If a real trade-off shipped
   and there's no entry, write one — date + rationale + reviewer. If the work was
   trivial, say so and skip.
3. **Remind to commit:** if there are uncommitted changes (`git status`), surface them
   and suggest a commit message in the repo's style. Don't commit unless the user asks.

## Done
Tell the user the cycle is closed and the next one starts with `/clear`, then `/next`.
