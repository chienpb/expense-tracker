# work/ — spec → plan → build artifacts

AI-native flow, slimmed from the mx-tools ticket workflow. The user brainstorms the
spec; the AI cooks plan + implementation. Each phase is a clean room: it reads only
its named inputs, not chat history. `/clear` between phases.

```
/spec <slug>   you + AI brainstorm        → work/<slug>/spec.md   (interactive)
  /clear
/plan <slug>   reads spec only            → work/<slug>/plan.md   (TODO checklist)
  /clear
/build <slug>  reads spec + plan          → code + checked TODOs
  /clear
/code-review + /verify   review phase = existing built-in skills, nothing custom
```

## Conventions
- One folder per unit of work: `work/<slug>/` holding `spec.md` + `plan.md`.
- `<slug>` is kebab-case, e.g. `m1-ink-engine`. Git history is the archive — no
  active/completed split.
- Non-trivial trade-offs go in `docs/DECISION_LOG.md` (existing invariant), not here.
- Decision capture, doc index, and review all reuse what the repo already has. The
  only added machinery is the three commands and this folder.
