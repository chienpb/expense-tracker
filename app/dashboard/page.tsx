import type { Metadata } from 'next';
import { PAPER_UI_ENABLED } from '@/lib/paper-ui-flag';
import DashboardPaperPage from '@/app/dashboard-paper/page';
import { SwissDashboardPage } from './_swiss';

export const metadata: Metadata = {
  title: PAPER_UI_ENABLED ? 'Daybook · Ledger' : 'Expenses',
};

/**
 * `/dashboard` — Phase 5.4 flag gate. `NEXT_PUBLIC_PAPER_UI=1` renders
 * the Paper Ledger composition from `/dashboard-paper`; anything else
 * keeps the Swiss fallback live. Rollback is a one-env-var change.
 * Phase 9 collapses this file into the Paper branch.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
    day?: string;
  }>;
}) {
  if (!PAPER_UI_ENABLED) {
    return <SwissDashboardPage searchParams={searchParams} />;
  }
  return <DashboardPaperPage searchParams={searchParams} />;
}
