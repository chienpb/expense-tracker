import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { Page } from '@/app/_components/paper/Page';
import { TallyMarks } from '@/app/_components/paper/TallyMarks';
import { formatVND } from '@/lib/dashboard/utils';
import { formatPrintedDate } from '@/lib/paper-format';
import { StandingOrderRegister } from './_register';
import { NewStandingOrderSlip } from './_slip';

export const metadata: Metadata = {
  title: 'Standing Orders · Ledger',
};

export interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  subcategory: string | null;
  frequency: string;
  next_due: string;
  active: boolean;
  created_at: string;
}

async function getRecurring(): Promise<RecurringExpense[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .order('active', { ascending: false })
    .order('next_due', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export default async function RecurringPage() {
  const items = await getRecurring();
  const active = items.filter((i) => i.active);
  const monthlyTotal = active.reduce(
    (sum, i) => sum + monthlyAmount(i),
    0,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Page
        formCode="CHN-02"
        pageNumber="1/1"
        tape
        title="Standing Orders"
        headerMeta={formatPrintedDate(new Date())}
        className="flex-1"
      >
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <Link
            href="/dashboard"
            className="paper-focusable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute hover:text-ink"
          >
            &larr; Daybook
          </Link>
          <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            Kept on rotation
          </span>
        </div>

        <section aria-labelledby="tally-heading" className="mb-10">
          <h2
            id="tally-heading"
            className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
          >
            Per month, on the books
          </h2>
          <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-3">
            <p className="font-serif text-display-hero font-bold leading-none nums-lining-tabular text-ink">
              {formatVND(monthlyTotal)}
            </p>
            {active.length > 0 ? (
              <p className="flex items-center gap-3 font-serif text-body text-ink-mute">
                <span>across</span>
                <TallyMarks count={active.length} height={22} />
                <span>
                  active {active.length === 1 ? 'order' : 'orders'}
                </span>
              </p>
            ) : (
              <p className="font-hand-signature text-hand-signature text-ink-faint">
                No standing orders on the books.
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="register-heading" className="mb-12">
          <h2
            id="register-heading"
            className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
          >
            Register · {items.length} {items.length === 1 ? 'entry' : 'entries'}
          </h2>
          <StandingOrderRegister items={items} />
        </section>

        <section aria-labelledby="new-order-heading">
          <h2
            id="new-order-heading"
            className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
          >
            New standing order
          </h2>
          <NewStandingOrderSlip />
        </section>
      </Page>
    </div>
  );
}

/**
 * Normalise an order's cadence to a monthly amount so the hero tally
 * reflects actual monthly outlay regardless of cycle. Approximations
 * are fine here — 30-day month, 7-day week — because this is a running
 * estimate, not an accounting figure.
 */
function monthlyAmount(item: RecurringExpense): number {
  switch (item.frequency) {
    case 'daily':
      return Math.round(item.amount * 30);
    case 'weekly':
      return Math.round((item.amount * 365) / 7 / 12);
    case 'yearly':
      return Math.round(item.amount / 12);
    case 'monthly':
    default:
      return item.amount;
  }
}

