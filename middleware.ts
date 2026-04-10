import { auth } from '@/lib/auth-config';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname === '/login' ||
    pathname === '/api/health' ||
    pathname.startsWith('/api/auth/')
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon).*)'],
};
