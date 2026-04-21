# API

All `/api/*` routes live in `app/api/`. Auth is enforced centrally in `middleware.ts` — individual route handlers do NOT check auth themselves. See [`auth.md`](auth.md) for the full auth matrix.

## Endpoints

### `POST /api/log`

Parses plain Vietnamese/English text and inserts/updates/deletes expense rows via LLM.

- **Body:** `{ "text": "bún bò 25k" }`
- **Response:** `{ "status": "succeeded" }` or `{ "status": "failed", "error": "..." }`
- **Auth:** Bearer `EXPENSE_SECRET` (Shortcuts) or browser session.

### `POST /api/report`

Generates an expense report for a time range.

- **Body:** `{ "range": "yesterday" | "last_week" | "last_month", "mode": "summary" | "full" }`
- **Summary mode:** AI-generated insights derived via SQL queries.
- **Full mode:** plain text table of every row in range.

### `POST /api/custom`

Freeform natural-language query against the expenses table (SELECT only; DDL blocked in `lib/sql-tool.ts`).

- **Body:** `{ "text": "food spending last 5 days" }`
- **Response:** `{ "status": "succeeded", "result": "<plain text>" }`

### `POST|PATCH|DELETE /api/expenses`

CRUD for individual expense rows. Browser UI only (session cookie).

### `GET|POST|PATCH|DELETE /api/recurring`

CRUD for recurring-expense templates. Browser UI only.

### `GET /api/cron/recurring`

Vercel cron handler that materializes recurring templates into `expenses`. Auth: `Authorization: Bearer ${CRON_SECRET}`. See [`auth.md`](auth.md).

### `GET /api/health`

No auth. Returns `{ "status": "ok", "db": "ok" }` when Supabase is reachable.

### `GET|POST /api/auth/[...nextauth]`

Auth.js v5 route handler (login/logout/session). See [`auth.md`](auth.md).

## Apple Shortcuts

Every POST endpoint invoked from Shortcuts requires:

```
Authorization: Bearer <EXPENSE_SECRET>
```

Three shortcuts exist:

1. **Log Expense** — Ask for Input → `POST /api/log` with `{ "text": input }`.
2. **Expense Report** — Choose range + mode → `POST /api/report`.
3. **Custom Query** — Ask for Input → `POST /api/custom` with `{ "text": input }`.

## LLM contract

- **Provider:** `@ai-sdk/openai`, model `gpt-5.4`, via the Vercel AI SDK.
- **Categories:** `lib/categories.ts` exports the canonical category/subcategory list and a prompt formatter. All LLM system prompts inject it — do NOT hardcode category strings in route handlers.
- **SQL tool:** `lib/sql-tool.ts` exports the shared `executeSQL` tool (DDL blocked, SELECT/UPDATE/INSERT/DELETE allowed). Reuse it rather than rolling a new one per route.
