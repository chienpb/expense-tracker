import type { Metadata } from 'next';
import Link from 'next/link';
import { format as formatDate } from 'date-fns';
import {
  getExpenses,
  getSpendingByDay,
  getSpendingByCategory,
  getSpendingByDayAndCategory,
  getOverview,
  getPriorRangeTotal,
  getTopPaybackCounterpart,
  getPeakDayCategory,
} from '@/lib/dashboard/queries';
import { groupCategoriesForTally } from '@/lib/dashboard/categories';
import {
  getDateRange,
  getDayCount,
  formatVND,
  type RangeKey,
  RANGE_LABELS,
} from '@/lib/dashboard/utils';
import { Page } from '@/app/_components/paper/Page';
import { Stamp } from '@/app/_components/paper/Stamp';
import { SummaryBox } from '@/app/_components/paper/SummaryBox';
import { MarginNote } from '@/app/_components/paper/MarginNote';
import { formatPrintedDate } from '@/lib/paper-format';
import { DateRangeTabs } from './_components/_date-range';
import { DailyChart } from './_components/_daily-chart';
import { Ledger } from './_components/_ledger';
import { QuickAdd } from './_components/_quick-add';
import { Masthead } from './_components/_masthead';

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

  const [
    expenses,
    dailySpending,
    categorySpending,
    dayCategory,
    overview,
    priorTotal,
    topPayback,
    peak,
  ] = await Promise.all([
    getExpenses(effFrom, effTo),
    getSpendingByDay(from, to),
    getSpendingByCategory(effFrom, effTo),
    getSpendingByDayAndCategory(from, to),
    getOverview(effFrom, effTo),
    getPriorRangeTotal(effFrom, effTo),
    getTopPaybackCounterpart(effFrom, effTo),
    getPeakDayCategory(from, to),
  ]);

  const categoriesByDay: Record<string, { category: string; total: number }[]> = {};
  for (const row of dayCategory) {
    (categoriesByDay[row.date] ??= []).push({
      category: row.category,
      total: row.total,
    });
  }

  const dailyAvg =
    effDayCount > 0 ? Math.round(overview.totalSpent / effDayCount) : 0;
  const topCategoryRow = categorySpending[0];
  const topCategoryShare =
    topCategoryRow && overview.totalSpent > 0
      ? Math.round((topCategoryRow.total / overview.totalSpent) * 100)
      : 0;
  const net = overview.totalSpent - overview.totalIncome;
  const hasPaybacks = overview.totalIncome > 0;
  const heroTotal = hasPaybacks ? net : overview.totalSpent;

  const tallyRows = groupCategoriesForTally(categorySpending, 5);
  const tallyMax = tallyRows.reduce((m, r) => Math.max(m, r.tallyCount), 0);

  const today = new Date();
  const stampText = formatDate(today, 'MMM · dd · yyyy').toUpperCase();

  const title = renderTitle(range, from, to, selectedDay);
  const counterpartName = topPayback ? extractCounterpart(topPayback.description) : null;
  const deltaNote = renderDelta(overview.totalSpent, priorTotal, range);

  return (
    <div className="flex min-h-screen flex-col">
      <Page
        tape
        className="flex-1"
        footer={
          <>
            <span>Pg. {pageNumber(today)} / 52</span>
            <span className="mx-auto font-serif text-caption italic text-ink-mute">
              — balanced ✓
            </span>
            <span className="ml-auto">Initials ___</span>
          </>
        }
        header={
          <div className="flex items-start gap-6">
            <div className="min-w-0 flex-1">
              <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                Sổ Thu Chi · Personal Expenses · Form CHN-01
              </p>
              <h1 className="mt-2 font-serif text-title-1 font-bold text-ink">
                {title.main}
                {title.suffix && (
                  <span className="ml-2 font-hand text-[28px] font-normal text-pen-navy">
                    {title.suffix}
                  </span>
                )}
              </h1>
            </div>
            <div className="relative shrink-0">
              <Masthead />
              <div className="pointer-events-none absolute -top-1 right-8 z-20">
                <Stamp text={stampText} color="red" wear={0.7} id="today-stamp" />
              </div>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-12">
          {/* LEFT COLUMN */}
          <div className="flex min-w-0 flex-col gap-10">
            <section aria-labelledby="hero-heading" className="relative">
              <h2
                id="hero-heading"
                className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
              >
                Line A. —{' '}
                {selectedDay
                  ? 'Total spent, this day'
                  : `Total spent, ${rangeWord(range)} to date`}
              </h2>
              <p className="mt-3 font-serif text-display-hero font-bold leading-none nums-lining-tabular text-ink">
                <span className="align-middle">{formatVND(heroTotal)}</span>
                {counterpartName && hasPaybacks && (
                  <MarginNote
                    inline
                    side="right"
                    className="ml-4 align-middle text-[22px]"
                  >
                    net, after {counterpartName} paid me back 👍
                  </MarginNote>
                )}
              </p>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-2 font-typewriter text-[11px] text-ink-mute">
                {hasPaybacks && (
                  <>
                    <FieldFigure label="gross" value={formatVND(overview.totalSpent)} />
                    <FieldFigure
                      label="returned"
                      value={`-${formatVND(overview.totalIncome)}`}
                      valueClassName="text-stamp-red"
                    />
                  </>
                )}
                {deltaNote && (
                  <span
                    data-ledger-tilt
                    className="inline-block font-hand text-[17px] text-pen-navy"
                    style={{ transform: 'rotate(-1.2deg)' }}
                  >
                    {deltaNote}
                  </span>
                )}
              </div>
            </section>

            <section aria-labelledby="chart-heading">
              <h3
                id="chart-heading"
                className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
              >
                Fig. 1 — Daily
              </h3>
              <DailyChart
                data={dailySpending}
                categoriesByDay={categoriesByDay}
                selectedDay={selectedDay}
                range={range}
                rangeFrom={from}
                rangeTo={to}
              />
              {peak && (
                <p className="mt-2 font-hand text-[14px] text-pen-navy">
                  peak: {formatPrintedDate(peak.date)} · {peak.category}
                </p>
              )}
            </section>

            <section aria-labelledby="ledger-heading">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h3
                  id="ledger-heading"
                  className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
                >
                  Register · {expenses.length}{' '}
                  {expenses.length === 1 ? 'entry' : 'entries'}
                </h3>
                <DateRangeTabs current={range} from={from} to={to} />
              </div>
              <Ledger expenses={expenses} />
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="flex min-w-0 flex-col gap-8 lg:-ml-6 lg:border-l-2 lg:border-dashed lg:border-ink/80 lg:pl-6">
            <div className="grid grid-cols-3 gap-3">
              <SummaryBox label="Entries" value={overview.count} />
              <SummaryBox label="Daily avg" value={formatVND(dailyAvg)} />
              <SummaryBox
                label="Top cat."
                value={
                  topCategoryRow ? (
                    <span>
                      {topCategoryRow.category}{' '}
                      <span className="font-typewriter text-[12px] text-ink-mute">
                        {topCategoryShare}%
                      </span>
                    </span>
                  ) : (
                    '—'
                  )
                }
              />
            </div>

            <section aria-labelledby="tally-heading">
              <h3
                id="tally-heading"
                className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
              >
                Line B. — By category
              </h3>
              <ul className="flex flex-col gap-2">
                {tallyRows.length === 0 && (
                  <li className="font-serif text-body italic text-ink-mute">
                    No entries in this range.
                  </li>
                )}
                {tallyRows.map((row) => (
                  <li
                    key={row.category}
                    className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-dotted border-ink/25 pb-1.5"
                  >
                    <span className="truncate font-serif text-body text-ink">
                      {row.displayName}
                    </span>
                    <SlashTally count={row.tallyCount} max={tallyMax} />
                    <span className="justify-self-end font-serif text-body font-semibold nums-lining-tabular text-ink">
                      {formatVND(row.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="lg:sticky lg:top-8">
              <QuickAdd />
            </div>
          </aside>
        </div>
      </Page>
    </div>
  );
}

function pageNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  const day = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
  return (day % 52) + 1;
}

function SlashTally({ count, max }: { count: number; max: number }) {
  if (count <= 0 || max <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="min-w-0 overflow-hidden whitespace-nowrap font-hand text-[22px] leading-none tracking-[0.05em] text-pen-navy"
    >
      {'/'.repeat(count)}
    </span>
  );
}

function FieldFigure({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="uppercase tracking-[var(--letter-spacing-label-s)]">
        {label}:
      </span>
      <span
        className={`font-serif text-[14px] font-bold nums-lining-tabular text-ink ${valueClassName ?? ''}`}
      >
        {value}
      </span>
    </span>
  );
}

function renderTitle(
  range: RangeKey,
  from: string,
  to: string,
  selectedDay?: string,
): { main: string; suffix?: string } {
  if (selectedDay) {
    return { main: 'Daily Ledger', suffix: `— ${formatPrintedDate(selectedDay)}` };
  }
  const fromDate = new Date(from + 'T00:00:00');
  const toDate = new Date(to + 'T00:00:00');
  switch (range) {
    case 'today':
      return { main: 'Daily Ledger', suffix: `— today, ${formatDate(fromDate, 'MMM d')}` };
    case 'this_week':
    case '7d':
      return { main: 'Daily Ledger', suffix: `— week of ${formatDate(fromDate, 'MMM d')}` };
    case 'this_month':
      return { main: 'Daily Ledger', suffix: `— ${formatDate(fromDate, 'MMMM yyyy')}` };
    case 'last_month':
      return { main: 'Daily Ledger', suffix: `— ${formatDate(fromDate, 'MMMM yyyy')}` };
    case '30d':
      return { main: 'Daily Ledger', suffix: '— last 30 days' };
    case 'custom':
      return {
        main: 'Daily Ledger',
        suffix: `— ${formatDate(fromDate, 'MMM d')} → ${formatDate(toDate, 'MMM d')}`,
      };
    default:
      return { main: 'Daily Ledger', suffix: `— ${RANGE_LABELS[range]}` };
  }
}

function rangeWord(range: RangeKey): string {
  switch (range) {
    case 'today':
      return 'day';
    case 'this_week':
    case '7d':
      return 'week';
    case 'this_month':
    case 'last_month':
      return 'month';
    case '30d':
      return '30 days';
    default:
      return 'range';
  }
}

function renderDelta(
  current: number,
  prior: number,
  range: RangeKey,
): string | null {
  if (prior <= 0 || current <= 0) return null;
  const unit = deltaUnit(range);
  const diff = current - prior;
  const pct = Math.abs(diff) / prior;
  if (pct < 0.03) return `↔ about the same as last ${unit}`;
  const arrow = diff > 0 ? '↑' : '↓';
  const direction = diff > 0 ? 'over' : 'under';
  if (pct < 0.12) return `${arrow} a bit ${direction} last ${unit}`;
  if (pct < 0.3) return `${arrow} ${direction} last ${unit}`;
  return `${arrow} well ${direction} last ${unit}`;
}

function deltaUnit(range: RangeKey): string {
  switch (range) {
    case 'today':
      return 'day';
    case 'this_week':
    case '7d':
      return 'wk';
    case 'this_month':
    case 'last_month':
      return 'mo';
    case '30d':
      return '30d';
    default:
      return 'time';
  }
}

/**
 * Heuristic: pull a probable counterpart name out of an income row's
 * description (`"Mai paid me back"` → `"Mai"`, `"Lunch w/ Mai (split)"`
 * → `"Mai"`). Falls back to null for descriptions that don't look like
 * a name, so the hero's handwritten margin note stays empty rather
 * than rendering nonsense.
 */
function extractCounterpart(description: string): string | null {
  const withMatch = description.match(/\bw\/?\s+([A-ZÀ-Ỹ][\p{L}]+)/u);
  if (withMatch) return withMatch[1];
  const paidMatch = description.match(/\b([A-ZÀ-Ỹ][\p{L}]+)\s+(paid|sent|gave|returned|refunded|settled)\b/u);
  if (paidMatch) return paidMatch[1];
  const leadMatch = description.match(/^([A-ZÀ-Ỹ][\p{L}]+)\b/u);
  if (leadMatch && leadMatch[1].length >= 2 && leadMatch[1].length <= 20) return leadMatch[1];
  return null;
}
