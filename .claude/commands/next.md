---
description: Read the project state, suggest what to ship next, write the pick into docs/NOW.md
---

You are running `/next`. This is the **session entry point** — it replaces having to
tell Claude "go check the code first." You orient yourself, then help the user pick the
next feature. Conversational, not a build step.

## Read first (only these)
- `docs/NOW.md` — current state: just shipped, next up, on deck. The anchor.
- `docs/IDEAS.md` — the scored backlog.
- `git log --oneline -8` — what actually landed recently.
- Tail of `docs/DECISION_LOG.md` — the most recent entry or two, for live context
  (e.g. seams left open, deferred scope).

Don't read the whole codebase. `NOW.md` plus the above is enough to orient.

## Job
Suggest 2–3 candidates for what to ship next, drawn from `NOW.md` "On deck" and
`IDEAS.md`. For each: one line on what it is and why now (leftover seams, leverage,
the user's mood). Recommend one — don't just list. Be lazy: flag if a candidate is big
enough to deserve its own `/spec` vs. a quick build.

Then discuss with the user until they pick. This is a real conversation — push back,
surface trade-offs.

## Output
Once the user commits to a feature, write its name + a one-line why into the **Next up**
section of `docs/NOW.md` (replace the placeholder). Leave everything else in the file
alone.

Then tell the user: `/clear`, then `/spec <slug>`.
