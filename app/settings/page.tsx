import type { Metadata } from 'next';
import Link from 'next/link';
import { Page } from '@/app/_components/paper/Page';
import { readLedgerSettings } from '@/lib/settings';
import { SignOut } from '@/app/dashboard/_components/_sign-out';
import { SettingsForm } from './_form';

export const metadata: Metadata = {
  title: 'House rules · Ledger',
};

/**
 * `/settings` — Paper Ledger preferences (Phase 5.5).
 *
 * A brand-new route (no Swiss predecessor), so it ships directly on
 * the Paper chrome with no `NEXT_PUBLIC_PAPER_UI` gate. The settings
 * themselves (`data-reduce-motion`, `data-reduce-skew`, `data-print-hand`,
 * `data-show-edit-history` on `<html>`) are already applied by the root
 * layout regardless of the flag, so this route is useful even when the
 * main chrome is still Swiss.
 *
 * Server reads the cookies once and hands the snapshot to the client
 * form; every subsequent toggle writes through a server action and
 * triggers `router.refresh()` to re-run this component, keeping client
 * state and cookie state in lockstep without a flash.
 */
export default async function SettingsPage() {
  const settings = await readLedgerSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <Page
        formCode="CHN-SET"
        pageNumber="1/1"
        tape
        title="House rules"
        headerMeta={todayStamp()}
        className="flex-1"
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-4">
          <nav aria-label="Ledger sections" className="flex items-baseline gap-4">
            <Link
              href="/dashboard"
              className="paper-focusable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute hover:text-ink"
            >
              Daybook
            </Link>
            <Link
              href="/dashboard/recurring"
              className="paper-focusable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute hover:text-ink"
            >
              Standing orders
            </Link>
            <Link
              href="/chat"
              className="paper-focusable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute hover:text-ink"
            >
              Correspondence
            </Link>
            <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink">
              House rules
            </span>
          </nav>
          <SignOut />
        </div>

        <header className="mb-10 max-w-prose">
          <p className="font-serif text-body text-ink-mute">
            How the ledger should be kept — for your eyes and hands. The
            clerk records every change on the spot.
          </p>
        </header>

        <SettingsForm initial={settings} />
      </Page>
    </div>
  );
}

function todayStamp(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}
