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

## `execute_sql`

A Postgres function used by the custom-query and SQL-tool endpoints to run parameterized SQL safely. Defined in `supabase/migrations/001_init.sql`. Must be installed in the Supabase SQL editor.

DDL statements (`CREATE`, `DROP`, `ALTER`, etc.) are blocked at the application layer inside `lib/sql-tool.ts` — do not remove those guards without a decision-log entry.

## Migrations

`supabase/migrations/`:

- `001_init.sql` — `expenses` table + `execute_sql` function.
- `004_users.sql` — `users` table.

Migrations are applied manually via the Supabase SQL editor. Seed the admin user manually after running `004_users.sql`.

## Writing SQL from code

- Prefer the Supabase client (`lib/supabase.ts`) for CRUD.
- Use the `executeSQL` tool (`lib/sql-tool.ts`) only for LLM-driven queries — it's the same interface every AI endpoint shares.
- Currency is VND integer; never add decimal handling. Format for display with `Intl.NumberFormat('vi-VN')`.
