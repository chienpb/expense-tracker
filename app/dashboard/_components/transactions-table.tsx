'use client';

import { useState } from 'react';
import { formatVND } from '@/lib/dashboard/utils';
import type { Expense } from '@/lib/dashboard/queries';

const PAGE_SIZE = 15;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function TransactionsTable({ expenses }: { expenses: Expense[] }) {
  const [shown, setShown] = useState(PAGE_SIZE);

  if (expenses.length === 0) {
    return (
      <div className="rounded-sm border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No transactions for this period
      </div>
    );
  }

  const visible = expenses.slice(0, shown);
  const hasMore = shown < expenses.length;

  return (
    <div className="rounded-sm border border-border bg-card">
      {/* Header */}
      <div className="grid grid-cols-[5rem_2fr_3fr_7rem] border-b border-border px-6 py-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground text-right">Amount</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {visible.map((expense) => (
          <div
            key={expense.id}
            className="grid grid-cols-[5rem_2fr_3fr_7rem] px-6 py-3 hover:bg-muted/50"
          >
            <span className="text-sm tabular-nums text-muted-foreground">
              {formatDate(expense.date)}
            </span>
            <span className="text-sm text-foreground">
              {expense.description}
            </span>
            <span className="text-sm lowercase text-muted-foreground">
              {expense.category}
              {expense.subcategory && ` / ${expense.subcategory}`}
            </span>
            <span className="text-sm font-medium tabular-nums text-foreground text-right">
              {formatVND(expense.amount)}
            </span>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="border-t border-border px-6 py-3">
          <button
            onClick={() => setShown((s) => s + PAGE_SIZE)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Show more ({expenses.length - shown} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
