'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatVND } from '@/lib/dashboard/utils';
import type { Expense } from '@/lib/dashboard/queries';
import { ExpenseEntryForm, type ExpenseEntryValues } from './expense-entry-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PAGE_SIZE = 15;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function TransactionsTable({ expenses }: { expenses: Expense[] }) {
  const router = useRouter();
  const [shown, setShown] = useState(PAGE_SIZE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="rounded-sm border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No transactions for this period
      </div>
    );
  }

  const visible = expenses.slice(0, shown);
  const hasMore = shown < expenses.length;
  const editingExpense = expenses.find((expense) => expense.id === editingId) ?? null;

  async function saveExpense(id: string, values: ExpenseEntryValues) {
    setLoadingId(id);

    const res = await fetch('/api/expenses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...values }),
    });

    if (!res.ok) {
      const data = await res.json();
      setLoadingId(null);
      return data.error ?? 'Failed to update entry';
    }

    setEditingId(null);
    router.refresh();
    setLoadingId(null);
  }

  async function deleteExpense(id: string) {
    if (!window.confirm('Delete this entry?')) {
      return;
    }

    setLoadingId(id);

    const res = await fetch('/api/expenses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      const data = await res.json();
      window.alert(data.error ?? 'Failed to delete entry');
      setLoadingId(null);
      return;
    }

    if (editingId === id) {
      setEditingId(null);
    }

    router.refresh();
    setLoadingId(null);
  }

  return (
    <div className="rounded-sm border border-border bg-card">
      <div className="hidden border-b border-border px-6 py-3 sm:grid sm:grid-cols-[5rem_2fr_3fr_7rem]">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground text-right">Amount</span>
      </div>

      <div className="divide-y divide-border">
        {visible.map((expense) => (
          <div
            key={expense.id}
            role="button"
            tabIndex={0}
            onClick={() => setEditingId(expense.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setEditingId(expense.id);
              }
            }}
            className={`cursor-pointer px-4 py-3 hover:bg-muted/50 sm:grid sm:grid-cols-[5rem_2fr_3fr_7rem] sm:items-center sm:px-6 ${
              loadingId === expense.id ? 'pointer-events-none opacity-50' : ''
            }`}
          >
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
            <div className="mt-1 flex items-center justify-between sm:hidden">
              <span className="block text-xs tabular-nums text-muted-foreground">
                {formatDate(expense.date)}
              </span>
            </div>

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

      <Dialog open={Boolean(editingExpense)} onOpenChange={(open) => (!open ? setEditingId(null) : undefined)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-2xl rounded-sm border border-border bg-card p-6 shadow-none"
        >
          <DialogHeader className="gap-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Edit Entry
                </DialogTitle>
              </div>
              {editingExpense && (
                <button
                  type="button"
                  onClick={() => deleteExpense(editingExpense.id)}
                  disabled={loadingId === editingExpense.id}
                  className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </DialogHeader>
          {editingExpense && (
            <ExpenseEntryForm
              key={editingExpense.id}
              initialValues={editingExpense}
              onSubmit={(values) => saveExpense(editingExpense.id, values)}
              onCancel={() => setEditingId(null)}
              loading={loadingId === editingExpense.id}
              submitLabel="Save changes"
              submittingLabel="Saving..."
            />
          )}
        </DialogContent>
      </Dialog>

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
