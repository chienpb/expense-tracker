import { auth } from '@/lib/auth-config';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname === '/login' ||
    pathname === '/robots.txt' ||
    pathname === '/api/health' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/spikes') ||
    pathname.startsWith('/design-system')
  ) {
    return;
  }

  // Trips Phase 1 — the ONE sanctioned auth hole (DECISION_LOG 2026-06-24):
  // an unauthenticated GET may reach the public viewer at `/trips/[id]` only.
  // The page server-component is the access control — it `notFound()`s unless
  // the trip is public or owned by the session. Matches `/trips/abc` but NOT
  // `/trips` (list), `/trips/abc/edit`, nor any `/api/trips/*` mutation.
  // `/trips/atlas` is NOT a public trip — it's the owner-only world map, so it
  // must fall through to the session check below, not slip through this hole.
  // Phase 3: the slideshow moved to `/trips/[id]/play`, so a public trip's
  // `/play` must also be reachable signed out (`/edit` stays private — the
  // page server-component is the access control either way).
  if (
    req.method === 'GET' &&
    pathname !== '/trips/atlas' &&
    (/^\/trips\/[^/]+$/.test(pathname) || /^\/trips\/[^/]+\/play$/.test(pathname))
  ) {
    return;
  }

  // Cron routes — use their own CRON_SECRET
  if (pathname.startsWith('/api/cron/')) {
    const bearer = req.headers.get('authorization')?.replace('Bearer ', '');
    if (bearer !== process.env.CRON_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return;
  }

  // API routes — accept Bearer token (Apple Shortcuts) OR session
  if (pathname.startsWith('/api/')) {
    const authHeader = req.headers.get('authorization') ?? '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (bearer === process.env.EXPENSE_SECRET) return;
    if (req.auth) return;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // All other routes (dashboard, etc.) — require session
  if (!req.auth) {
    return Response.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|robots\\.txt|glyphs\\.svg|textures/).*)',
  ],
};
