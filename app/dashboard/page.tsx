import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getExpenses,
  getSpendingByDay,
  getSpendingByCategory,
  getSpendingByDayAndCategory,
  getOverview,
} from '@/lib/dashboard/queries';
import {
  getDateRange,
  getDayCount,
  formatVND,
  type RangeKey,
  RANGE_LABELS,
} from '@/lib/dashboard/utils';
import { Page } from '@/app/_components/paper/Page';
import { TallyMarks } from '@/app/_components/paper/TallyMarks';
import { Stamp } from '@/app/_components/paper/Stamp';
import { DateRangeTabs } from './_components/_date-range';
import { DailyChart } from './_components/_daily-chart';
import { CategoryChart } from './_components/_category-chart';
import { Ledger } from './_components/_ledger';
import { QuickAdd } from './_components/_quick-add';
import { SignOut } from './_components/_sign-out';

export const metadata: Metadata = {
  title: 'Daybook · Ledger',
};

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
  const params = await searchParams;
  const range = (params.range ?? '7d') as RangeKey;
  const { from, to } = getDateRange(range, params.from, params.to);
  const dayCount = getDayCount(from, to);

  const rawDay =
    params.day && /^\d{4}-\d{2}-\d{2}$/.test(params.day) ? params.day : undefined;
  const selectedDay = rawDay && rawDay >= from && rawDay <= to ? rawDay : undefined;
  const effFrom = selectedDay ?? from;
  const effTo = selectedDay ?? to;
  const effDayCount = selectedDay ? 1 : dayCount;

  const [expenses, dailySpending, categorySpending, dayCategory, overview] =
    await Promise.all([
      getExpenses(effFrom, effTo),
      getSpendingByDay(from, to),
      getSpendingByCategory(effFrom, effTo),
      getSpendingByDayAndCategory(from, to),
      getOverview(effFrom, effTo),
    ]);

  const categoriesByDay: Record<
    string,
    { category: string; total: number }[]
  > = {};
  for (const row of dayCategory) {
    (categoriesByDay[row.date] ??= []).push({
      category: row.category,
      total: row.total,
    });
  }

  const dailyAvg =
    effDayCount > 0 ? Math.round(overview.totalSpent / effDayCount) : 0;
  const topCategory = categorySpending[0]?.category ?? '—';
  const net = overview.totalSpent - overview.totalIncome;
  const heroTotal = overview.totalIncome > 0 ? net : overview.totalSpent;
  const rangeLabel =
    range === 'custom' ? 'Custom range' : RANGE_LABELS[range];

  const clearDayHref = (() => {
    const p = new URLSearchParams();
    p.set('range', range);
    if (range === 'custom') {
      p.set('from', from);
      p.set('to', to);
    }
    return `/dashboard?${p.toString()}`;
  })();

  return (
    <div className="flex min-h-screen flex-col">
      <Page
        formCode="CHN-01"
        pageNumber="1/1"
        tape
        title="Daybook"
        headerMeta={todayStamp()}
        className="flex-1"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-4">
          <nav aria-label="Ledger sections" className="flex items-baseline gap-4">
            <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink">
              Daybook
            </span>
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
            <Link
              href="/settings"
              className="paper-focusable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute hover:text-ink"
            >
              House rules
            </Link>
          </nav>
          <SignOut />
        </div>

        <section
          aria-labelledby="hero-heading"
          className="mb-10 flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <h2
              id="hero-heading"
              className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
            >
              {selectedDay ? 'On this day' : 'On this page'}
            </h2>
            <p className="mt-2 font-serif text-display-hero font-bold leading-none nums-lining-tabular text-ink">
              {formatVND(heroTotal)}
            </p>
            <p className="mt-3 max-w-prose font-serif text-body text-ink-mute">
              {selectedDay ? (
                <>
                  <span className="text-ink">{formatLongDate(selectedDay)}</span>
                  {' · '}
                  <Link
                    href={clearDayHref}
                    className="paper-focusable underline-offset-4 hover:text-ink"
                  >
                    back to the range
                  </Link>
                </>
              ) : (
                <>
                  {rangeLabel} · {formatLongDate(from)} → {formatLongDate(to)}
                </>
              )}
            </p>
            {overview.totalIncome > 0 && (
              <p className="mt-2 font-serif text-caption italic text-ink-mute">
                Before paybacks {formatVND(overview.totalSpent)} · got back{' '}
                <span className="text-stamp-red">
                  ({formatVND(overview.totalIncome)})
                </span>
              </p>
            )}
          </div>
          <DateRangeTabs current={range} from={from} to={to} />
        </section>

        <Summary
          count={overview.count}
          dailyAvg={dailyAvg}
          topCategory={topCategory}
        />

        <section
          aria-labelledby="chart-heading"
          className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-5"
        >
          <div className="lg:col-span-3">
            <h3
              id="chart-heading"
              className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
            >
              Daily spending
            </h3>
            <DailyChart
              data={dailySpending}
              categoriesByDay={categoriesByDay}
              selectedDay={selectedDay}
              range={range}
              rangeFrom={from}
              rangeTo={to}
            />
          </div>
          <div className="lg:col-span-2">
            <h3 className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
              By category
            </h3>
            <CategoryChart data={categorySpending} />
          </div>
        </section>

        <section aria-labelledby="ledger-heading" className="mt-12">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3
              id="ledger-heading"
              className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
            >
              Register · {expenses.length}{' '}
              {expenses.length === 1 ? 'entry' : 'entries'}
            </h3>
            <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
              Click any row to amend · turn the page for more
            </span>
          </div>
          <Ledger expenses={expenses} />
          <div className="mt-8">
            <QuickAdd />
          </div>
        </section>
      </Page>
    </div>
  );
}

function Summary({
  count,
  dailyAvg,
  topCategory,
}: {
  count: number;
  dailyAvg: number;
  topCategory: string;
}) {
  return (
    <section
      aria-label="Page summary"
      className="grid grid-cols-1 gap-4 border-y border-ink/25 py-6 sm:grid-cols-3 sm:gap-6"
    >
      <Figure
        label="Entries"
        value={
          <span className="inline-flex items-center gap-3">
            <span className="font-serif text-title-1 font-bold nums-lining-tabular text-ink">
              {count}
            </span>
            {count > 0 && count <= 40 && (
              <TallyMarks count={count} height={20} />
            )}
          </span>
        }
      />
      <Figure
        label="Daily average"
        value={
          <span className="font-serif text-title-1 font-bold nums-lining-tabular text-ink">
            {formatVND(dailyAvg)}
          </span>
        }
      />
      <Figure
        label="Top line"
        value={
          <span className="inline-flex items-center gap-3">
            <span className="font-hand text-hand text-pen-navy">
              {topCategory}
            </span>
            {topCategory !== '—' && (
              <Stamp
                text="Largest"
                color="red"
                wear={0.65}
                id={`top-${topCategory}`}
                className="text-[8px]"
              />
            )}
          </span>
        }
      />
    </section>
  );
}

function Figure({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
        {label}
      </span>
      {value}
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

function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}
