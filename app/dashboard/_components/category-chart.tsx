'use client';

import { formatVND } from '@/lib/dashboard/utils';
import type { CategorySpending } from '@/lib/dashboard/queries';

interface Props {
  data: CategorySpending[];
}

export function CategoryChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-sm border border-border bg-card text-sm text-muted-foreground">
        No data for this period
      </div>
    );
  }

  const maxTotal = data[0]?.total ?? 0;

  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <div className="space-y-3">
        {data.map((entry, i) => {
          const pct = maxTotal > 0 ? (entry.total / maxTotal) * 100 : 0;
          const isTop = i === 0;

          return (
            <div key={entry.category}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm lowercase text-foreground">{entry.category}</span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {formatVND(entry.total)}
                </span>
              </div>
              <div className="h-2 w-full bg-muted">
                <div
                  className="h-full transition-none"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isTop ? 'hsl(0 72% 51%)' : 'hsl(0 0% 45%)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
