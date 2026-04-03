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
      {/* Header — desktop only */}
      <div className="hidden border-b border-border px-6 py-3 sm:grid sm:grid-cols-[5rem_2fr_3fr_7rem]">
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
            className="px-4 py-3 hover:bg-muted/50 sm:grid sm:grid-cols-[5rem_2fr_3fr_7rem] sm:px-6"
          >
            {/* Mobile layout */}
            <div className="flex items-baseline justify-between sm:hidden">
              <div>
                <span className="text-sm text-foreground">{expense.description}</span>
                <span className="ml-2 text-xs lowercase text-muted-foreground">
                  {expense.category}
                  {expense.subcategory && ` / ${expense.subcategory}`}
                </span>
              </div>
              <span className={`shrink-0 text-sm font-medium tabular-nums ${expense.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                {expense.type === 'income' ? '+' : ''}{formatVND(expense.amount)}
              </span>
            </div>
            <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground sm:hidden">
              {formatDate(expense.date)}
            </span>

            {/* Desktop layout */}
            <span className="hidden text-sm tabular-nums text-muted-foreground sm:block">
              {formatDate(expense.date)}
            </span>
            <span className="hidden text-sm text-foreground sm:block">
              {expense.description}
            </span>
            <span className="hidden text-sm lowercase text-muted-foreground sm:block">
              {expense.category}
              {expense.subcategory && ` / ${expense.subcategory}`}
            </span>
            <span className={`hidden text-sm font-medium tabular-nums text-right sm:block ${expense.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
              {expense.type === 'income' ? '+' : ''}{formatVND(expense.amount)}
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
