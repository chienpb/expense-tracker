import type { Metadata } from 'next';
import { PAPER_UI_ENABLED } from '@/lib/paper-ui-flag';
import RecurringPaperPage from '@/app/dashboard/recurring-paper/page';
import { SwissRecurringPage } from './_swiss';

export const metadata: Metadata = {
  title: PAPER_UI_ENABLED
    ? 'Standing Orders · Ledger'
    : 'Recurring · Expense Tracker',
};

/**
 * `/dashboard/recurring` — Phase 5.2 flag gate. `NEXT_PUBLIC_PAPER_UI=1`
 * renders the Paper Ledger composition from `/dashboard/recurring-paper`;
 * anything else keeps the Swiss fallback live. Rollback is a one-env-var
 * change. Phase 9 collapses this file into the Paper branch.
 */
export default async function RecurringPage() {
  if (!PAPER_UI_ENABLED) {
    return <SwissRecurringPage />;
  }
  return <RecurringPaperPage />;
}
