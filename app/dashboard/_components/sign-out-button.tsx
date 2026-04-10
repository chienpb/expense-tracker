'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
    >
      Sign Out
    </button>
  );
}
