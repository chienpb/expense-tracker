# Documentation Index

Table of contents for all project docs. Read the doc whose trigger matches what you're about to do — don't load everything.

## Core

| Doc | Read when |
|---|---|
| [`../CLAUDE.md`](../CLAUDE.md) | Already loaded every session. Lists invariants and points here. |
| [`../README.md`](../README.md) | Running the dev server, deploy notes. |
| [`../.env.local.example`](../.env.local.example) | Setting up environment variables. Source of truth for the full list. |

## Runtime

| Doc | Read when |
|---|---|
| [`api.md`](api.md) | Touching any `/api/*` route or the Apple Shortcuts contract. |
| [`database.md`](database.md) | Schema changes, migrations, or writing SQL against `expenses` / `users`. |
| [`auth.md`](auth.md) | Auth flows, `middleware.ts`, RBAC, session/JWT shape. |

## Design system

| Doc | Read when |
|---|---|
| [`dashboard-design-system.md`](dashboard-design-system.md) | Any UI change on the **current** Swiss dashboard (live in production). |
| [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) | Any work inside the **Paper Ledger** migration — components, tokens, filters, voice. |
| [`ROADMAP.md`](ROADMAP.md) | Planning or executing a Paper Ledger phase; checking what ships when. |
| [`DECISION_LOG.md`](DECISION_LOG.md) | Recording a non-trivial trade-off or spike verdict. |

## Historical / planning

| Doc | Read when |
|---|---|
| [`nextauth-plan.md`](nextauth-plan.md) | Reference for the original Auth.js v5 rollout (already shipped). |

---

## Adding a new doc

1. Drop the file in `docs/`.
2. Add a row to the right table above with a one-line *trigger* — not a summary. The trigger answers "what task makes me open this?"
3. If the doc captures a decision, also add a dated entry to [`DECISION_LOG.md`](DECISION_LOG.md).
