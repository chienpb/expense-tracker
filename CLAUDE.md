# Expense Tracker

Personal expense tracker. Dashboard UI + Apple Shortcuts input. Next.js 16 on Vercel, Supabase Postgres, Auth.js v5, Vercel AI SDK with `@ai-sdk/openai` (model `gpt-5.4`).

## Invariants

- **Amounts are integers.** VND, no decimals anywhere — storage, math, or display.
- **Auth is centralized in `middleware.ts`.** Session cookie for UI, Bearer `EXPENSE_SECRET` for Shortcuts, Bearer `CRON_SECRET` for `/api/cron/*`. Individual route handlers do NOT re-check auth.
- **Supabase uses the service role key** (server-only). No RLS; access control lives in the app.
- **Design system:** the live UI is the Paper Ledger system (`docs/DESIGN_SYSTEM.md`, rollout tracked in `docs/ROADMAP.md`). Read it before changing any UI. The prior Swiss system is archived at `docs/swiss-design-system-archive.md` for portfolio reference only.
- **Decision log is mandatory.** Non-trivial trade-offs, spike outcomes, and rule exceptions go in `docs/DECISION_LOG.md` with date + rationale.

## Browser automation

When using `playwright-cli` against the local dev server, load the saved auth state instead of typing credentials:

```bash
playwright-cli open http://localhost:3000
playwright-cli state-load .claude/skills/playwright-cli/state/auth.json
playwright-cli goto http://localhost:3000/dashboard
```

The state file is gitignored. If it has expired (you land on `/login` instead of the dashboard), re-login using the dev credentials in `.claude/skills/playwright-cli/state/credentials.json` (gitignored, next to `auth.json`) — **without reading or printing the raw values**. Never `cat`/Read the credentials file and never paste credentials literally into a command; let the shell substitute them, and pass `--raw` so playwright-cli doesn't echo the filled values back into the transcript:

```bash
CREDS=.claude/skills/playwright-cli/state/credentials.json
playwright-cli goto http://localhost:3000/login
# find the Name / Seal textbox refs (e<n>, e<m>) via `playwright-cli snapshot`, then:
playwright-cli --raw fill e<n> "$(jq -r .email "$CREDS")"
playwright-cli --raw fill e<m> "$(jq -r .password "$CREDS")" --submit
playwright-cli goto http://localhost:3000/dashboard   # confirm sign-in landed
playwright-cli state-save .claude/skills/playwright-cli/state/auth.json
```

**Screenshots** go under `.screenshots/` (gitignored). Name them `<slug>-<YYYYMMDD-HHMMSS>.png` — e.g. `dashboard-20260421-172630.png`. No cleanup needed; the whole directory is ignored.

```bash
playwright-cli screenshot --filename=.screenshots/dashboard-20260421-172630.png
```

## Navigation

Start at **[`docs/INDEX.md`](docs/INDEX.md)** — the table of contents. It tells you which doc to open for the task at hand (API shape, database, auth flow, design system, migration roadmap, decision log).

Don't load detail docs speculatively — open them when INDEX's trigger matches what you're about to do.
