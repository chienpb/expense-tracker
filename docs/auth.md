# Auth

Three auth paths, all enforced **centrally in `middleware.ts`**. Individual API route handlers do NOT re-check auth — if a route is running, middleware already decided it's allowed.

| Caller | Mechanism | Secret |
|---|---|---|
| Browser UI | Auth.js v5 session cookie (JWT strategy) | `AUTH_SECRET` |
| Apple Shortcuts → `/api/*` | `Authorization: Bearer <token>` | `EXPENSE_SECRET` |
| Vercel cron → `/api/cron/*` | `Authorization: Bearer <token>` | `CRON_SECRET` |

## Browser UI (Auth.js v5)

- Credentials provider (email + password). Users table — see [`database.md`](database.md).
- Passwords hashed with bcrypt via `lib/password.ts`.
- JWT session strategy; session shape is `{ id, email, role }`.
- Config: `lib/auth-config.ts`. Helpers: `lib/auth.ts` (`authorize`, `getSession`, `requireAdmin`).
- Type augmentation for `Session` / `JWT` lives in `types/next-auth.d.ts`.
- Route handler: `app/api/auth/[...nextauth]/route.ts`.
- Login UI: `app/login/page.tsx`. Client-side provider wrapper: `app/providers.tsx`.

## Apple Shortcuts

Every Shortcut-invoked POST sends `Authorization: Bearer <EXPENSE_SECRET>`. Middleware matches the header and bypasses the session cookie check for those requests. See [`api.md`](api.md) for the endpoint list.

## Cron

Vercel cron hits `/api/cron/*` with `Authorization: Bearer <CRON_SECRET>`. A separate secret from `EXPENSE_SECRET` so a leaked Shortcuts token can't trigger cron actions.

## RBAC

- `admin` — full read/write.
- `guest` — read-only.
- Enforced at route level via `requireAdmin()` from `lib/auth.ts` for any mutation accessible to logged-in guests.

## Rules when touching auth

- Never add auth checks inside individual route handlers — extend `middleware.ts` instead.
- Never log or echo any of the three secrets. No `console.log(process.env.EXPENSE_SECRET)` even temporarily.
- Any change to the session shape (`{ id, email, role }`) must also update `types/next-auth.d.ts` and every `requireAdmin`-style helper.
- Record non-trivial changes (new provider, role added, session shape change) in [`DECISION_LOG.md`](DECISION_LOG.md).
