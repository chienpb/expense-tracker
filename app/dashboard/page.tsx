import { getExpenses, getSpendingByDay, getSpendingByCategory, getSpendingByDayAndCategory, getOverview } from '@/lib/dashboard/queries';
import { getDateRange, getDayCount, formatVND, type RangeKey, RANGE_LABELS } from '@/lib/dashboard/utils';
import { DateRangeFilter } from './_components/date-range-filter';
import { OverviewCards } from './_components/overview-cards';
import { SpendingChart } from './_components/spending-chart';
import { CategoryChart } from './_components/category-chart';
import { TransactionsTable } from './_components/transactions-table';
import { HeroAmount } from './_components/hero-amount';
import { AddExpenseForm } from './_components/add-expense-form';
import Link from 'next/link';
import { SignOutButton } from './_components/sign-out-button';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string; day?: string }>;
}) {
  const params = await searchParams;
  const range = (params.range ?? '7d') as RangeKey;
  const { from, to } = getDateRange(range, params.from, params.to);
  const dayCount = getDayCount(from, to);

  const rawDay = params.day && /^\d{4}-\d{2}-\d{2}$/.test(params.day) ? params.day : undefined;
  const selectedDay = rawDay && rawDay >= from && rawDay <= to ? rawDay : undefined;
  const effFrom = selectedDay ?? from;
  const effTo = selectedDay ?? to;
  const effDayCount = selectedDay ? 1 : dayCount;

  const [expenses, dailySpending, categorySpending, dayCategory, overview] = await Promise.all([
    getExpenses(effFrom, effTo),
    getSpendingByDay(from, to),
    getSpendingByCategory(effFrom, effTo),
    getSpendingByDayAndCategory(from, to),
    getOverview(effFrom, effTo),
  ]);

  const categoriesByDay: Record<string, { category: string; total: number }[]> = {};
  for (const row of dayCategory) {
    (categoriesByDay[row.date] ??= []).push({ category: row.category, total: row.total });
  }

  const dailyAvg = effDayCount > 0 ? Math.round(overview.totalSpent / effDayCount) : 0;
  const topCategory = categorySpending[0]?.category ?? '—';
  const net = overview.totalSpent - overview.totalIncome;

  const clearDayHref = (() => {
    const p = new URLSearchParams();
    p.set('range', range);
    if (range === 'custom') { p.set('from', from); p.set('to', to); }
    return `/dashboard?${p.toString()}`;
  })();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total Spent
            </p>
            <HeroAmount value={formatVND(overview.totalIncome > 0 ? net : overview.totalSpent)} />
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedDay ? (
                <>
                  <span className="text-foreground">{selectedDay}</span>
                  {' · '}
                  <Link href={clearDayHref} className="underline underline-offset-2 hover:text-foreground">
                    clear
                  </Link>
                </>
              ) : (
                <>{range === 'custom' ? 'Custom range' : RANGE_LABELS[range]} &middot; {from} — {to}</>
              )}
            </p>
            {overview.totalIncome > 0 && (
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                Before paybacks: {formatVND(overview.totalSpent)} &middot; Got back <span className="text-green-600 dark:text-green-400">{formatVND(overview.totalIncome)}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              Chat
            </Link>
            <Link
              href="/dashboard/recurring"
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              Subscriptions
            </Link>
            <DateRangeFilter current={range} from={from} to={to} />
            <SignOutButton />
          </div>
        </div>
      </header>

      <OverviewCards
        count={overview.count}
        dailyAvg={formatVND(dailyAvg)}
        topCategory={topCategory}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-12 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Daily Spending
          </h2>
          <SpendingChart
            data={dailySpending}
            categoriesByDay={categoriesByDay}
            selectedDay={selectedDay}
            range={range}
            rangeFrom={from}
            rangeTo={to}
          />
        </div>
        <div>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            By Category
          </h2>
          <CategoryChart data={categorySpending} />
        </div>
      </div>

      <div className="mt-8 sm:mt-12">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Transactions
            </h2>
            <span className="text-xs text-muted-foreground">{expenses.length} records</span>
          </div>
          <AddExpenseForm />
        </div>
        <TransactionsTable expenses={expenses} />
      </div>
    </div>
  );
}
