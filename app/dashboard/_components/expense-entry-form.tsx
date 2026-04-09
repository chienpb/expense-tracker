'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';

type ExpenseType = 'expense' | 'income';

export interface ExpenseEntryValues {
  description: string;
  amount: number;
  category: string;
  subcategory: string | null;
  type: ExpenseType;
  date: string;
}

interface ExpenseEntryFormProps {
  initialValues?: Partial<ExpenseEntryValues>;
  onSubmit: (values: ExpenseEntryValues) => Promise<string | void> | string | void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel: string;
  submittingLabel: string;
  resetOnSuccess?: boolean;
}

interface FormState {
  description: string;
  amount: string;
  category: string;
  subcategory: string;
  type: ExpenseType;
  date: string;
}

function getInitialState(initialValues?: Partial<ExpenseEntryValues>): FormState {
  return {
    description: initialValues?.description ?? '',
    amount: initialValues?.amount ? String(initialValues.amount) : '',
    category: initialValues?.category ?? '',
    subcategory: initialValues?.subcategory ?? '',
    type: initialValues?.type ?? 'expense',
    date: initialValues?.date ?? new Date().toISOString().split('T')[0],
  };
}

export function ExpenseEntryForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel,
  submittingLabel,
  resetOnSuccess = false,
}: ExpenseEntryFormProps) {
  const [form, setForm] = useState<FormState>(() => getInitialState(initialValues));
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const amount = Number.parseInt(form.amount.replace(/[^\d]/g, ''), 10);
    if (!form.description.trim() || !form.category || !form.date || !Number.isInteger(amount) || amount <= 0) {
      setError('Description, amount, category, and date are required');
      return;
    }

    const result = await onSubmit({
      description: form.description.trim(),
      amount,
      category: form.category,
      subcategory: form.subcategory.trim() || null,
      type: form.type,
      date: form.date,
    });

    if (typeof result === 'string' && result) {
      setError(result);
      return;
    }

    if (resetOnSuccess) {
      setForm(getInitialState());
      setError('');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <input
          value={form.description}
          onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
          placeholder="Description"
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        <input
          value={form.amount}
          onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))}
          placeholder="Amount (VND)"
          inputMode="numeric"
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground tabular-nums placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        <select
          value={form.category}
          onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="" disabled>
            Category
          </option>
          {Object.keys(CATEGORIES).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          value={form.subcategory}
          onChange={(e) => setForm((current) => ({ ...current, subcategory: e.target.value }))}
          placeholder="Subcategory (optional)"
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        <select
          value={form.type}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              type: e.target.value === 'income' ? 'income' : 'expense',
            }))
          }
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          value={form.date}
          onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
          type="date"
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-sm bg-foreground px-4 text-sm font-medium uppercase tracking-wide text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? submittingLabel : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="h-10 rounded-sm border border-border px-4 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm" style={{ color: 'hsl(0 72% 51%)' }}>
          {error}
        </p>
      )}
    </form>
  );
}
