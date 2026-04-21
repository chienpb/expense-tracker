# Expense Tracker

Personal expense tracker. Dashboard UI + Apple Shortcuts input. Next.js 16 on Vercel, Supabase Postgres, Auth.js v5, Vercel AI SDK with `@ai-sdk/openai` (model `gpt-5.4`).

## Invariants

- **Amounts are integers.** VND, no decimals anywhere — storage, math, or display.
- **Auth is centralized in `middleware.ts`.** Session cookie for UI, Bearer `EXPENSE_SECRET` for Shortcuts, Bearer `CRON_SECRET` for `/api/cron/*`. Individual route handlers do NOT re-check auth.
- **Supabase uses the service role key** (server-only). No RLS; access control lives in the app.
- **Design system:** the current live UI follows the Swiss/International Typographic Style (`docs/dashboard-design-system.md`); the project is migrating to the Paper Ledger system (`docs/DESIGN_SYSTEM.md`, tracked in `docs/ROADMAP.md`). Before changing any UI, read whichever governs the surface you're touching.
- **Decision log is mandatory.** Non-trivial trade-offs, spike outcomes, and rule exceptions go in `docs/DECISION_LOG.md` with date + rationale.

## Navigation

Start at **[`docs/INDEX.md`](docs/INDEX.md)** — the table of contents. It tells you which doc to open for the task at hand (API shape, database, auth flow, design system, migration roadmap, decision log).

Don't load detail docs speculatively — open them when INDEX's trigger matches what you're about to do.
