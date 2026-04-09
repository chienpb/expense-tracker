'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExpenseEntryForm, type ExpenseEntryValues } from './expense-entry-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AddExpenseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(values: ExpenseEntryValues) {
    setLoading(true);

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      setLoading(false);
      return data.error ?? 'Failed to add entry';
    }

    router.refresh();
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (!loading ? setOpen(next) : undefined)}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="h-9 rounded-sm border border-border px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          Add entry
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl rounded-sm border border-border bg-card p-6 shadow-none"
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Add Entry
          </DialogTitle>
        </DialogHeader>
        <ExpenseEntryForm
          key={open ? 'open' : 'closed'}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Add entry"
          submittingLabel="Adding..."
          resetOnSuccess
        />
      </DialogContent>
    </Dialog>
  );
}
