# Expense Tracker

Personal expense tracker. Dashboard UI + Apple Shortcuts input. Next.js 16 on Vercel, Supabase Postgres, Auth.js v5, Vercel AI SDK with `@ai-sdk/openai` (model `gpt-5.4`).

## Invariants

- **Amounts are integers.** VND, no decimals anywhere — storage, math, or display.
- **Auth is centralized in `middleware.ts`.** Session cookie for UI, Bearer `EXPENSE_SECRET` for Shortcuts, Bearer `CRON_SECRET` for `/api/cron/*`. Individual route handlers do NOT re-check auth.
- **Supabase uses the service role key** (server-only). No RLS; access control lives in the app.
- **Design system:** the live UI is the Paper Ledger system (`docs/DESIGN_SYSTEM.md`, rollout tracked in `docs/ROADMAP.md`). Read it before changing any UI. The prior Swiss system is archived at `docs/swiss-design-system-archive.md` for portfolio reference only.
- **Decision log is mandatory.** Non-trivial trade-offs, spike outcomes, and rule exceptions go in `docs/DECISION_LOG.md` with date + rationale.

## Navigation

Start at **[`docs/INDEX.md`](docs/INDEX.md)** — the table of contents. It tells you which doc to open for the task at hand (API shape, database, auth flow, design system, migration roadmap, decision log).

Don't load detail docs speculatively — open them when INDEX's trigger matches what you're about to do.
