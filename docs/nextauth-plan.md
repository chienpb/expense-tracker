# NextAuth Implementation Plan

## Goal

Replace the cookie-based password auth with Auth.js v5 (NextAuth) using the Credentials provider, JWT sessions, and RBAC (admin/guest roles). Keep the existing Bearer token auth for Apple Shortcuts.

## New Dependencies

- `next-auth@5` (Auth.js v5 — App Router native)
- `bcryptjs` + `@types/bcryptjs` (password hashing)

## Database Changes

### New table: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'guest')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Add as `supabase/migrations/002_users.sql`. Seed your admin account manually after running the migration.

## New Environment Variables

```
AUTH_SECRET=           # generated via `npx auth secret`, required by Auth.js
```

No other new env vars needed — we use the existing Supabase client to query the `users` table.

## File Changes

### New Files

| File | Purpose |
|---|---|
| `lib/auth-config.ts` | Auth.js v5 config — Credentials provider, JWT callbacks with role |
| `app/api/auth/[...nextauth]/route.ts` | Auth.js route handler (GET + POST) |
| `middleware.ts` | Protects routes — checks session or Bearer token |
| `app/login/page.tsx` | Login form (email + password) |
| `lib/password.ts` | `hashPassword()` and `verifyPassword()` using bcryptjs |
| `types/next-auth.d.ts` | Type augmentation for `Session` and `JWT` to include `role` |
| `supabase/migrations/002_users.sql` | Users table + seed admin account |

### Modified Files

| File | Change |
|---|---|
| `lib/auth.ts` | Add `getSession()` helper that wraps Auth.js `auth()`. Keep `authorize()` for Bearer token compat. Add `authorizeRequest()` that checks Bearer OR session. |
| `app/api/log/route.ts` | Switch from `authorize()` to `authorizeRequest()` |
| `app/api/report/route.ts` | Same |
| `app/api/custom/route.ts` | Same |
| `app/api/expenses/route.ts` | Same |
| `app/layout.tsx` | Wrap with `SessionProvider` (if needed client-side) |
| `app/page.tsx` | Redirect to `/dashboard` if authenticated, `/login` if not |
| `app/dashboard/page.tsx` | Gate behind auth (middleware handles this) |

## Auth.js Configuration

```typescript
// lib/auth-config.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { verifyPassword } from "./password"
import { getSupabase } from "./supabase"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as {
          email: string
          password: string
        }

        const supabase = getSupabase()
        const { data: user } = await supabase
          .from("users")
          .select("id, email, password_hash, role")
          .eq("email", email)
          .single()

        if (!user) return null

        const valid = await verifyPassword(password, user.password_hash)
        if (!valid) return null

        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      return session
    },
  },
})
```

## Middleware Strategy

```typescript
// middleware.ts
import { auth } from "./lib/auth-config"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Public routes — no auth needed
  if (
    pathname === "/login" ||
    pathname === "/api/health" ||
    pathname.startsWith("/api/auth/") // NextAuth routes
  ) {
    return
  }

  // API routes — accept Bearer token OR session
  if (pathname.startsWith("/api/")) {
    const bearer = req.headers.get("Authorization")?.slice(7)
    if (bearer === process.env.EXPENSE_SECRET) return // Apple Shortcuts
    if (!req.auth) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    return
  }

  // All other routes (dashboard, chat, etc.) — require session
  if (!req.auth) {
    return Response.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

## RBAC Enforcement

| Role | Can do |
|---|---|
| `admin` | Full CRUD on expenses, chat with AI (read + write SQL), manage everything |
| `guest` | Read-only queries, chat with AI (SELECT-only SQL), view dashboard |

Enforcement happens at the API route level:

```typescript
// Example: in a write endpoint
const session = await auth()
if (session?.user.role !== "admin") {
  return Response.json({ error: "Forbidden" }, { status: 403 })
}
```

Bearer token requests are implicitly `admin` (only you have the secret).

## Login Page

Minimal form — email + password, calls `signIn("credentials", ...)` from `next-auth/react`. On success redirects to `/dashboard`. On error shows inline message. No registration page — accounts are created manually.

## Implementation Order

1. **Install deps** — `next-auth@5 bcryptjs @types/bcryptjs`
2. **DB migration** — create `users` table, seed admin account
3. **Auth config** — `lib/auth-config.ts`, route handler, type augmentations
4. **Password utils** — `lib/password.ts`
5. **Middleware** — protect routes, dual auth (Bearer + session)
6. **Update `lib/auth.ts`** — add `authorizeRequest()` that checks both methods
7. **Update API routes** — switch to `authorizeRequest()`
8. **Login page** — `/app/login/page.tsx`
9. **Update dashboard/layout** — remove old cookie auth, use session
10. **Test** — login flow, API with Bearer, API with session, role gating
11. **Seed a guest account** — test guest restrictions

## Future (Out of Scope)

- Chat UI (`/chat` page with `useChat()` from Vercel AI SDK) — next phase
- OAuth providers (Google, GitHub) — only if needed
- Self-registration / invite links
- Rate limiting per user
