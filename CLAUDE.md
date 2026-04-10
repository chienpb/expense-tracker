# Expense Tracker

A personal expense tracker with dashboard UI and Apple Shortcuts input. Hosted on Vercel, backed by Supabase.

## Stack

- **Next.js 16** (App Router) on Vercel
- **Supabase** (Postgres) for storage
- **Vercel AI SDK** with `@ai-sdk/openai` provider, model `gpt-5.4`
- **Auth.js v5** (NextAuth) with Credentials provider, JWT sessions, RBAC (admin/guest)
- **Auth (API):** Bearer token for Apple Shortcuts, session cookie for browser UI — both enforced in middleware

## Environment Variables

```
AUTH_SECRET=           # generated via `npx auth secret`, required by Auth.js
EXPENSE_SECRET=        # shared secret for Apple Shortcuts API endpoints
CRON_SECRET=           # secret for Vercel cron jobs
SUPABASE_URL=          # from Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=  # secret key (sb_secret_...) from Supabase API Keys tab
OPENAI_API_KEY=        # OpenAI API key
```

## Project Structure

```
app/
  login/page.tsx         # Login page (email + password)
  providers.tsx          # Client-side SessionProvider wrapper
  dashboard/             # Protected dashboard UI
  api/
    auth/[...nextauth]/route.ts  # Auth.js route handler
    log/route.ts         # POST - log expense via plain text
    report/route.ts      # POST - generate expense report
    custom/route.ts      # POST - freeform natural language query
    expenses/route.ts    # POST/PATCH/DELETE - CRUD expenses
    recurring/route.ts   # GET/POST/PATCH/DELETE - recurring expenses
    cron/recurring/route.ts  # GET - cron job for recurring expenses
    health/route.ts      # GET - health check (no auth)
middleware.ts            # Centralized auth: session for UI, Bearer for API, CRON_SECRET for cron
lib/
  auth-config.ts         # Auth.js v5 config (Credentials provider, JWT callbacks, RBAC)
  auth.ts                # Helper functions (authorize, getSession, requireAdmin)
  password.ts            # bcrypt hash/verify helpers
  categories.ts          # category/subcategory list + prompt formatter
  sql-tool.ts            # reusable executeSQL tool with DDL blocking
  supabase.ts            # Supabase client
types/
  next-auth.d.ts         # Type augmentation for Session/JWT with role
supabase/migrations/
  001_init.sql           # expenses table + execute_sql Postgres function
  004_users.sql          # users table for auth
```

## Database

Table: `expenses`
- `id` UUID PK
- `amount` INTEGER (VND, no decimals)
- `description` TEXT
- `category` TEXT
- `subcategory` TEXT
- `type` TEXT ('expense' | 'income')
- `date` DATE (defaults to today)
- `created_at` TIMESTAMPTZ

Table: `users`
- `id` UUID PK
- `email` TEXT UNIQUE
- `password_hash` TEXT (bcrypt)
- `role` TEXT ('admin' | 'guest')
- `created_at` TIMESTAMPTZ

The `execute_sql` Postgres function must be created via `supabase/migrations/001_init.sql` in the Supabase SQL editor.

## Authentication

- **Browser UI:** Auth.js v5 Credentials provider with JWT session strategy. Login at `/login`. Session carries `{ id, email, role }`.
- **Apple Shortcuts:** Bearer token in `Authorization` header, checked by middleware.
- **Cron:** Separate `CRON_SECRET` Bearer token for `/api/cron/*` routes.
- **Middleware** handles all auth centrally — individual API routes do not check auth themselves.
- **RBAC:** `admin` has full access, `guest` is read-only (enforced at route level via `requireAdmin()` when needed).

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
