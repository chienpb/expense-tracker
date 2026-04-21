'use client';

import { signOut } from 'next-auth/react';

/**
 * `<SignOut>` — typewriter sign-out affordance for the paper header.
 * Mirrors the Swiss `<SignOutButton>` but inherits the paper chrome.
 */
export function SignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="paper-focusable paper-pressable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute hover:text-ink"
    >
      Close the book
    </button>
  );
}
