'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useRouter } from 'next/navigation';
import { formatVNDShort, formatVND } from '@/lib/dashboard/utils';
import type { DailySpending } from '@/lib/dashboard/queries';

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

interface DayCategory { category: string; total: number }

interface Props {
  data: DailySpending[];
  categoriesByDay: Record<string, DayCategory[]>;
  selectedDay?: string;
  range: string;
  rangeFrom: string;
  rangeTo: string;
}

export function SpendingChart({ data, categoriesByDay, selectedDay, range, rangeFrom, rangeTo }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderTooltip({ active, payload }: { active?: boolean; payload?: readonly any[] }) {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload as DailySpending;
    const cats = categoriesByDay[row.date] ?? [];
    const top = cats.slice(0, 5);
    const rest = cats.slice(5).reduce((s, c) => s + c.total, 0);

    return (
      <div className="min-w-[200px] rounded-sm border border-border bg-card p-3 text-xs shadow-none">
        <div className="mb-2 text-muted-foreground">{formatDateLabel(row.date)}</div>
        <div className="mb-2 flex items-baseline justify-between gap-4 border-b border-border pb-2">
          <span className="uppercase tracking-wide text-muted-foreground">Spent</span>
          <span className="tabular-nums text-foreground">{formatVND(row.total)}</span>
        </div>
        {row.income > 0 && (
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="uppercase tracking-wide text-muted-foreground">Got back</span>
            <span className="tabular-nums text-green-600 dark:text-green-400">{formatVND(row.income)}</span>
          </div>
        )}
        {top.length > 0 ? (
          <div className="space-y-1">
            {top.map((c) => (
              <div key={c.category} className="flex items-baseline justify-between gap-4">
                <span className="lowercase text-foreground">{c.category}</span>
                <span className="tabular-nums text-muted-foreground">{formatVND(c.total)}</span>
              </div>
            ))}
            {rest > 0 && (
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-muted-foreground">others</span>
                <span className="tabular-nums text-muted-foreground">{formatVND(rest)}</span>
              </div>
            )}
          </div>
        ) : (
          row.total === 0 && <div className="text-muted-foreground">No expenses</div>
        )}
      </div>
    );
  }

  const router = useRouter();

  function buildHref(day?: string) {
    const p = new URLSearchParams();
    p.set('range', range);
    if (range === 'custom') { p.set('from', rangeFrom); p.set('to', rangeTo); }
    if (day) p.set('day', day);
    return `/dashboard?${p.toString()}`;
  }

  function handleClick(payload: { date?: string } | undefined) {
    const date = payload?.date;
    if (!date) return;
    router.push(buildHref(date === selectedDay ? undefined : date));
  }

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-sm border border-border bg-card text-sm text-muted-foreground">
        No data for this period
      </div>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.total));

  const chartData = data.map(d => ({
    ...d,
    expenseFill:
      d.date === selectedDay
        ? 'var(--foreground)'
        : selectedDay
        ? 'var(--muted)'
        : d.total === maxTotal
        ? 'hsl(0 72% 51%)'
        : 'var(--muted-foreground)',
  }));

  return (
    <div className="h-72 rounded-sm border border-border bg-card p-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fontSize: 11, fill: 'hsl(0 0% 45%)' }}
            axisLine={{ stroke: 'hsl(0 0% 88%)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatVNDShort}
            tick={{ fontSize: 11, fill: 'hsl(0 0% 45%)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
            content={renderTooltip}
          />
          <Bar
            dataKey="total"
            stackId="a"
            maxBarSize={40}
            radius={0}
            fill="hsl(0 0% 72%)"
            style={{ cursor: 'pointer' }}
            onClick={(payload) => handleClick(payload as { date?: string })}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              return (
                <rect x={x} y={y} width={width} height={height} fill={payload.expenseFill} />
              );
            }}
          />
          <Bar
            dataKey="income"
            stackId="a"
            maxBarSize={40}
            radius={0}
            fill="hsl(142 71% 45%)"
            style={{ cursor: 'pointer' }}
            onClick={(payload) => handleClick(payload as { date?: string })}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
