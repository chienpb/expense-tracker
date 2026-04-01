'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatVND } from '@/lib/dashboard/utils';
import type { RecurringExpense } from '../page';

const FREQ_LABEL: Record<string, string> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function RecurringTable({ items }: { items: RecurringExpense[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No subscriptions yet
      </div>
    );
  }

  async function toggleActive(id: string, active: boolean) {
    setLoading(id);
    await fetch('/api/recurring', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !active }),
    });
    router.refresh();
    setLoading(null);
  }

  async function deleteItem(id: string) {
    setLoading(id);
    await fetch('/api/recurring', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="rounded-sm border border-border bg-card">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_5rem_6rem_5rem_3rem] border-b border-border px-6 py-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cycle</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground text-right">Amount</span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground text-right">Next</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div
            key={item.id}
            className={`grid grid-cols-[2fr_1fr_5rem_6rem_5rem_3rem] items-center px-6 py-3 hover:bg-muted/50 ${
              !item.active ? 'opacity-40' : ''
            } ${loading === item.id ? 'pointer-events-none opacity-50' : ''}`}
          >
            <span className="text-sm text-foreground">{item.description}</span>
            <span className="text-sm lowercase text-muted-foreground">
              {item.category}
              {item.subcategory && ` / ${item.subcategory}`}
            </span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {FREQ_LABEL[item.frequency] ?? item.frequency}
            </span>
            <span className="text-sm font-medium tabular-nums text-foreground text-right">
              {formatVND(item.amount)}
            </span>
            <span className="text-sm tabular-nums text-muted-foreground text-right">
              {formatDate(item.next_due)}
            </span>
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => toggleActive(item.id, item.active)}
                className="h-7 w-7 rounded-sm text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                title={item.active ? 'Pause' : 'Resume'}
              >
                {item.active ? '⏸' : '▶'}
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="h-7 w-7 rounded-sm text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Delete"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
