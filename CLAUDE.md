# Expense Tracker

A personal expense tracker with no UI. Input is plain text via Apple Shortcuts. Hosted on Vercel, backed by Supabase.

## Stack

- **Next.js 16** (App Router) on Vercel
- **Supabase** (Postgres) for storage
- **Vercel AI SDK** with `@ai-sdk/openai` provider, model `gpt-5.4`
- **Auth:** single shared secret in `Authorization: Bearer <token>` header

## Environment Variables

```
EXPENSE_SECRET=        # shared secret for all API endpoints
SUPABASE_URL=          # from Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=  # secret key (sb_secret_...) from Supabase API Keys tab
OPENAI_API_KEY=        # OpenAI API key
```

## Project Structure

```
app/api/
  log/route.ts       # POST - log a new expense via plain text
  report/route.ts    # POST - generate expense report (summary or full list)
  custom/route.ts    # POST - freeform natural language query
  health/route.ts    # GET  - health check (no auth required)
lib/
  auth.ts            # shared secret validation
  categories.ts      # category/subcategory list + prompt formatter
  sql-tool.ts        # reusable executeSQL tool with DDL blocking
  supabase.ts        # Supabase client
supabase/migrations/
  001_init.sql       # expenses table + execute_sql Postgres function
```

## Database

Table: `expenses`
- `id` UUID PK
- `amount` INTEGER (VND, no decimals)
- `description` TEXT
- `category` TEXT
- `subcategory` TEXT
- `date` DATE (defaults to today)
- `created_at` TIMESTAMPTZ

The `execute_sql` Postgres function must be created via `supabase/migrations/001_init.sql` in the Supabase SQL editor.

## API Endpoints

### POST /api/log
Parses plain Vietnamese/English text and inserts/updates/deletes expense rows via LLM.
- Body: `{ "text": "bún bò 25k" }`
- Response: `{ "status": "succeeded" }` or `{ "status": "failed", "error": "..." }`

### POST /api/report
Returns an expense report for a time range.
- Body: `{ "range": "yesterday|last_week|last_month", "mode": "summary|full" }`
- Summary mode: AI-generated insights via SQL queries
- Full mode: plain text table of all rows in range

### POST /api/custom
Freeform natural language query against the expenses table (SELECT only).
- Body: `{ "text": "food spending last 5 days" }`
- Response: `{ "status": "succeeded", "result": "<plain text>" }`

### GET /api/health
Returns `{ "status": "ok", "db": "ok" }` if Supabase is reachable.

## Apple Shortcuts

All POST endpoints require header: `Authorization: Bearer <EXPENSE_SECRET>`

Three shortcuts:
1. **Log Expense** — Ask for Input → POST `/api/log` with `{ "text": input }`
2. **Expense Report** — Choose range + mode → POST `/api/report`
3. **Custom Query** — Ask for Input → POST `/api/custom` with `{ "text": input }`

## Categories

Food & Drink, Transport, Shopping, Personal Care, Entertainment, Health, Bills & Utilities, Travel, Other — defined in `lib/categories.ts`, injected into LLM system prompts.
