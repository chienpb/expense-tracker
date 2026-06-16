'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { PageTurnLink } from '@/app/_components/page-turn-link';

const TABS = [
  { id: 'ledger', label: 'Ledger', href: '/dashboard' },
  { id: 'recurring', label: 'Recurring', href: '/dashboard/recurring' },
  { id: 'chat', label: 'Chat', href: '/chat' },
] as const;

/**
 * Dashboard top-right file-tab nav — three route tabs + an OUT tab that
 * fires `signOut()`. Styled to match `<FileTab>`: active tab reads as
 * part of the page, inactive tabs sit behind.
 *
 * Kept inline in `app/dashboard/_components/` rather than generalized
 * into `paper/` because the OUT-as-tab affordance is specific to this
 * masthead — FileTab's router-agnostic contract stays clean.
 *
 * The three route tabs navigate through `<PageTurnLink>` — the WebGL
 * page-turn (docs/PAGE_FLIP.md). OUT signs out plainly; it never flips.
 */
export function Masthead() {
  const pathname = usePathname();

  function tabClass(active: boolean) {
    return [
      'group relative -mb-[2px] inline-flex items-end px-5 pt-2.5 pb-2',
      'font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)]',
      'border border-b-0 transition-colors',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pen-navy',
      active
        ? 'z-10 border-ink bg-paper text-ink border-b-paper'
        : 'border-ink/40 bg-paper-2 text-ink-mute hover:text-ink',
    ].join(' ');
  }

  return (
    <div
      role="tablist"
      aria-label="Ledger sections"
      className="relative flex items-end gap-1 border-b-2 border-ink"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname?.startsWith(tab.href) ?? false;
        return (
          <PageTurnLink
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={active}
            aria-current={active ? 'page' : undefined}
            tabIndex={active ? 0 : -1}
            className={tabClass(active)}
            style={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
          >
            {tab.label}
          </PageTurnLink>
        );
      })}
      <button
        type="button"
        role="tab"
        aria-selected={false}
        tabIndex={-1}
        onClick={() => signOut({ callbackUrl: '/login' })}
        className={tabClass(false)}
        style={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
      >
        Out
      </button>
    </div>
  );
}
