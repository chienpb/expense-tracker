import type { Metadata } from 'next';
import Link from 'next/link';
import { format as formatDate } from 'date-fns';
import { auth } from '@/lib/auth-config';
import { Page } from '@/app/_components/paper/Page';
import { formatPrintedDate } from '@/lib/paper-format';
import {
  getSealedMonths,
  getMonthLastEntries,
  monthStatus,
  monthKey,
} from '@/lib/dashboard/sealing';
import { MonthCell } from './_month-cell';

export const metadata: Metadata = {
  title: 'The Year · Ledger',
};

export default async function YearPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const today = new Date();
  const year =
    params.year && /^\d{4}$/.test(params.year)
      ? Number.parseInt(params.year, 10)
      : today.getFullYear();

  const session = await auth();
  const userId = session?.user?.id ?? '';

  const [sealed, lastEntries] = await Promise.all([
    getSealedMonths(userId),
    getMonthLastEntries(),
  ]);

  const currentMonth = monthKey(today);
  const cells = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1);
    const month = monthKey(date);
    const status = monthStatus(month, currentMonth, sealed, lastEntries);
    const sealedAt = sealed.get(month);
    return {
      month,
      label: formatDate(date, 'MMMM'),
      status,
      sealedLabel: sealedAt ? formatPrintedDate(sealedAt) : undefined,
      interactive: month < currentMonth, // past months settle in place
      isCurrent: month === currentMonth,
    };
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Page
        formCode="CHN-03"
        pageNumber={`${year}`}
        tape
        title={`The Year — ${year}`}
        headerMeta={formatPrintedDate(today)}
        className="flex-1"
      >
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <Link
            href="/dashboard"
            className="paper-focusable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute hover:text-ink"
          >
            &larr; Daybook
          </Link>
          <span className="flex items-baseline gap-4 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)]">
            <Link
              href={`/dashboard/year?year=${year - 1}`}
              className="paper-focusable text-ink-mute hover:text-ink"
            >
              &larr; {year - 1}
            </Link>
            <Link
              href={`/dashboard/year?year=${year + 1}`}
              className="paper-focusable text-ink-mute hover:text-ink"
            >
              {year + 1} &rarr;
            </Link>
          </span>
        </div>

        <p className="mb-5 font-serif-italic text-body text-ink-mute">
          The ledger, month by month. Settled months carry the wax seal and the
          date the books were closed.
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cells.map((c) => (
            <MonthCell
              key={c.month}
              month={c.month}
              label={c.label}
              status={c.status}
              sealedLabel={c.sealedLabel}
              interactive={c.interactive}
              isCurrent={c.isCurrent}
            />
          ))}
        </div>
      </Page>
    </div>
  );
}
