import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page
  if (pathname === '/dashboard/login') return NextResponse.next();

  // Check session cookie
  const session = request.cookies.get('dashboard_session')?.value;
  if (!session || session !== process.env.DASHBOARD_PASSWORD) {
    const loginUrl = new URL('/dashboard/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
