'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SETTINGS_COOKIE, type LedgerSettings } from '@/lib/settings';

/**
 * Server action — persists one Paper Ledger setting to a cookie.
 *
 * Each setting has its own cookie (keys in `SETTINGS_COOKIE`) so the
 * root layout can hydrate `<html>` data-attributes during SSR without
 * a round-trip. After writing, we revalidate `/` so the `<html>` attrs
 * refresh on the next navigation — the client-side `router.refresh()`
 * in the form covers the current page.
 *
 * `showEditHistory` is stored as `'1'` / `'0'` (its default is true, so
 * the "missing" state must mean "on"); the other three write `'1'` on
 * and clear the cookie on off.
 */
const COOKIE_OPTIONS = {
  path: '/',
  // Settings are not secrets; they're UX preferences. But scoping to
  // httpOnly=false keeps the door open for a future client-only read.
  httpOnly: false,
  sameSite: 'lax' as const,
  // One year — these are sticky preferences, not a session.
  maxAge: 60 * 60 * 24 * 365,
};

export async function setLedgerSetting<K extends keyof LedgerSettings>(
  key: K,
  value: LedgerSettings[K],
): Promise<void> {
  const store = await cookies();
  const cookieName = SETTINGS_COOKIE[key];

  if (key === 'showEditHistory') {
    store.set(cookieName, value ? '1' : '0', COOKIE_OPTIONS);
  } else if (value) {
    store.set(cookieName, '1', COOKIE_OPTIONS);
  } else {
    store.delete(cookieName);
  }

  revalidatePath('/', 'layout');
}
