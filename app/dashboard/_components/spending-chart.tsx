'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatVNDShort, formatVND } from '@/lib/dashboard/utils';
import type { DailySpending } from '@/lib/dashboard/queries';

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

interface Props {
  data: DailySpending[];
}

export function SpendingChart({ data }: Props) {
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
    fill: d.total === maxTotal ? 'hsl(0 72% 51%)' : 'hsl(0 0% 72%)',
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
            cursor={false}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [formatVND(Number(value)), 'Spent']}
            labelFormatter={(label: any) => formatDateLabel(String(label))}
            contentStyle={{
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              fontSize: '13px',
            }}
            labelStyle={{ color: 'var(--muted-foreground)' }}
            itemStyle={{ color: 'var(--foreground)' }}
          />
          <Bar
            dataKey="total"
            maxBarSize={40}
            radius={0}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fill="hsl(0 0% 72%)"
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={payload.fill}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
