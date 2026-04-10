import { getSupabase } from '@/lib/supabase';
import { RecurringTable } from './_components/recurring-table';
import { AddRecurringForm } from './_components/add-recurring-form';
import { ThemeToggle } from '../_components/theme-toggle';
import { formatVND } from '@/lib/dashboard/utils';
import Link from 'next/link';
import { SignOutButton } from '../_components/sign-out-button';

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

async function getRecurringExpenses(): Promise<RecurringExpense[]> {
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
  const items = await getRecurringExpenses();
  const activeTotal = items
    .filter((i) => i.active)
    .reduce((sum, i) => sum + i.amount, 0);
  const activeCount = items.filter((i) => i.active).length;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              &larr; Dashboard
            </Link>
            <p className="mt-3 text-6xl font-bold tracking-tighter tabular-nums text-foreground">
              {formatVND(activeTotal)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeCount} active subscription{activeCount !== 1 ? 's' : ''} &middot; monthly total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Add form */}
      <div className="mb-12">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Add Subscription
        </h2>
        <AddRecurringForm />
      </div>

      {/* Table */}
      <div>
        <div className="mb-4 flex items-baseline gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Subscriptions
          </h2>
          <span className="text-xs text-muted-foreground">{items.length} total</span>
        </div>
        <RecurringTable items={items} />
      </div>
    </div>
  );
}
