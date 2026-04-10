import { auth } from './auth-config';

/**
 * Check Bearer token auth (for Apple Shortcuts).
 * Used by middleware — not typically called directly from routes anymore.
 */
export function authorize(request: Request): boolean {
  const header = request.headers.get('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return token === process.env.EXPENSE_SECRET;
}

/**
 * Get the current session. Returns null if not authenticated.
 * Use in API routes when you need to check the user's role.
 */
export async function getSession() {
  return auth();
}

/**
 * Check if the current session has admin role.
 * Bearer token requests bypass this (handled by middleware).
 */
export async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'admin';
}
