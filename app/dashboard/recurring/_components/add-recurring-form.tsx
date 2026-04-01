'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';

const FREQUENCIES = ['monthly', 'weekly', 'yearly', 'daily'] as const;

export function AddRecurringForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const description = (form.get('description') as string).trim();
    const amountRaw = (form.get('amount') as string).trim();
    const category = form.get('category') as string;
    const frequency = form.get('frequency') as string;
    const next_due = form.get('next_due') as string;

    const amount = parseInt(amountRaw.replace(/[,.\s]/g, ''), 10);
    if (!description || isNaN(amount) || !category || !frequency || !next_due) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description, category, frequency, next_due }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to add');
      setLoading(false);
      return;
    }

    e.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  const today = new Date().toISOString().split('T')[0];
  const categories = Object.keys(CATEGORIES);

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-border bg-card p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <input
          name="description"
          placeholder="Description (e.g. Netflix)"
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        <input
          name="amount"
          placeholder="Amount (VND)"
          inputMode="numeric"
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground tabular-nums placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        <select
          name="category"
          defaultValue=""
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="" disabled>
            Category
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          name="frequency"
          defaultValue="monthly"
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          {FREQUENCIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <input
          name="next_due"
          type="date"
          defaultValue={today}
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-sm bg-foreground text-sm font-medium uppercase tracking-wide text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm" style={{ color: 'hsl(0 72% 51%)' }}>
          {error}
        </p>
      )}
    </form>
  );
}
