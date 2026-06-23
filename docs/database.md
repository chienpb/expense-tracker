# Database

Postgres on Supabase. Access from the app goes through `lib/supabase.ts`, which uses the service role key (server-only). No RLS — access control is enforced in the app via [`auth.md`](auth.md).

## Tables

### `expenses`

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | PK |
| `amount` | `INTEGER` | VND, no decimals — **amounts are always integers** |
| `description` | `TEXT` | |
| `category` | `TEXT` | Constrained in code by `lib/categories.ts` |
| `subcategory` | `TEXT` | Constrained in code by `lib/categories.ts` |
| `type` | `TEXT` | `'expense'` \| `'income'` |
| `date` | `DATE` | Defaults to today |
| `created_at` | `TIMESTAMPTZ` | |

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | PK |
| `email` | `TEXT` | UNIQUE |
| `password_hash` | `TEXT` | bcrypt (see `lib/password.ts`) |
| `role` | `TEXT` | `'admin'` \| `'guest'` |
| `created_at` | `TIMESTAMPTZ` | |

### `sealed_months`

The "Closing the Books" ceremony persists a per-user closed flag per calendar month. Sealing is a snapshot, **not** an edit-lock — the Shortcuts endpoint keeps writing. A month whose latest entry's `created_at` is after its `sealed_at` reads as *reopened* (stale), computed at read time in `lib/dashboard/sealing.ts` — **no triggers**. Re-settling upserts a fresh `sealed_at`.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | PK |
| `user_id` | `UUID` | FK → `users(id)`, `ON DELETE CASCADE` |
| `month` | `DATE` | First-of-month key, e.g. `2026-06-01` |
| `sealed_at` | `TIMESTAMPTZ` | When the books were closed; bumped on re-settle |
| `wrapped_text` | `TEXT` | Monthly Wrapped verdict — the Ledger-keeper's one-line month statement, generated once at seal time. Nullable: failed generation or a pre-Wrapped seal falls back to the deterministic aggregates. The numbers are recomputed on read, never stored. |

UNIQUE `(user_id, month)`. Scope every query by `user_id` in app code (no RLS).

## `execute_sql`

A Postgres function used by the custom-query and SQL-tool endpoints to run parameterized SQL safely. Defined in `supabase/migrations/001_init.sql`. Must be installed in the Supabase SQL editor.

DDL statements (`CREATE`, `DROP`, `ALTER`, etc.) are blocked at the application layer inside `lib/sql-tool.ts` — do not remove those guards without a decision-log entry.

## Migrations

`supabase/migrations/`:

- `001_init.sql` — `expenses` table + `execute_sql` function.
- `004_users.sql` — `users` table.
- `005_sealed_months.sql` — `sealed_months` table (Closing the Books).
- `006_wrapped_text.sql` — `sealed_months.wrapped_text` column (Monthly Wrapped).

Either apply via the Supabase SQL editor, or run from the CLI (below). Seed the admin user manually after running `004_users.sql`.

## Running SQL / migrations from the CLI

`scripts/migrate.mjs` pushes any `.sql` through the `execute_sql` RPC using the
`SUPABASE_SERVICE_ROLE_KEY` already in `.env.local` — no Supabase UI, no DB
password. The package manager is **pnpm**.

```bash
# a migration file
pnpm db:migrate -- supabase/migrations/005_sealed_months.sql

# an ad-hoc query (insert dummy data, inspect, clean up) via stdin.
# Call node directly here — `pnpm run` swallows the heredoc on stdin.
node --env-file=.env.local scripts/migrate.mjs /dev/stdin <<'SQL'
DELETE FROM expenses WHERE description = 'stale test' AND amount = 1
SQL
```

- **One statement per invocation.** The RPC's non-SELECT branch runs the whole
  string as a single command; split multi-statement migrations into separate
  files (or separate runs).
- `SELECT`s come back as JSON; everything else returns `{ "affected_rows": n }`.
- This is the trusted migration channel and intentionally bypasses the
  `lib/sql-tool.ts` DDL guard (that guard only protects the LLM query path).
- VND is integer-only — never insert decimals.

## Writing SQL from code

- Prefer the Supabase client (`lib/supabase.ts`) for CRUD.
- Use the `executeSQL` tool (`lib/sql-tool.ts`) only for LLM-driven queries — it's the same interface every AI endpoint shares.
- Currency is VND integer; never add decimal handling. Format for display with `Intl.NumberFormat('vi-VN')`.
