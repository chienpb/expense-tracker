'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { LedgerTable, type LedgerRow } from '@/app/_components/paper/LedgerTable';
import { PaperClip } from '@/app/_components/paper/PaperClip';
import { formatPrintedTime } from '@/lib/paper-format';
import type { Expense } from '@/lib/dashboard/queries';
import { auditSchema } from '@/lib/dashboard/audit-schema';
import { EntrySlip, type EntryValues } from './_entry-slip';

/**
 * `<Ledger>` — Phase 5.4 transactions table + drill-in editor.
 *
 * The table maps the server-component `Expense[]` into `<LedgerTable>`
 * rows. Income (refunds, paybacks) ride as negative integers so
 * `formatSignedVND` wraps them in parentheses (§4.3); the ledger does
 * the sign-flip inline so the DB shape stays positive-only per invariant.
 *
 * Drill-in opens an amendment slip above the ruled body with a
 * `<PaperClip>` at the top-right corner — the "pinned" affordance the
 * spec calls for on a detail card (§4.7). Amend submits PATCH
 * /api/expenses; Discard submits DELETE. A native `confirm()` still
 * guards the destructive path — Phase 6 replaces it with a stamped
 * dialog.
 *
 * Pagination sticks to the Swiss default (15 rows, click "Show more").
 * Rows past the first page are the same `<LedgerTable>` DOM; the
 * button re-renders with a higher `shown` count.
 */
const PAGE_SIZE = 15;

export function Ledger({
  expenses,
  auditMonth,
}: {
  expenses: Expense[];
  /** First-of-month key (`YYYY-MM-01`) to stream audit verdicts for, or undefined. */
  auditMonth?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [shown, setShown] = useState(PAGE_SIZE);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Rubber-Stamp Auditor: stream the verdicts in for an unaudited month. The
  // route returns `{ stamps: [...] }` as it generates, so rows stamp one by
  // one. Persisted verdicts (the replay path) come down on `expense` already;
  // streamed verdicts take precedence while the run is live.
  const { object, submit } = useObject({ api: '/api/audit', schema: auditSchema });
  const submittedRef = useRef(false);
  const unauditedCount = auditMonth
    ? expenses.filter((e) => e.audit_verdict == null).length
    : 0;

  useEffect(() => {
    if (auditMonth && unauditedCount > 0 && !submittedRef.current) {
      submittedRef.current = true;
      submit({ month: auditMonth });
    }
  }, [auditMonth, unauditedCount, submit]);

  const streamed = new Map<string, { verdict?: 'APPROVED' | 'SUSPICIOUS'; note?: string | null }>();
  for (const s of object?.stamps ?? []) {
    if (s?.id) streamed.set(s.id, { verdict: s.verdict, note: s.note });
  }

  const visible = expenses.slice(0, shown);
  const hasMore = shown < expenses.length;
  const editing = expenses.find((e) => e.id === editingId) ?? null;

  const rows: LedgerRow[] = visible.map((expense) => {
    // ponytail: no re-audit on edit; stale verdict accepted (DECISION_LOG 2026-06-23).
    const live = streamed.get(expense.id);
    const verdict = live?.verdict ?? expense.audit_verdict ?? null;
    const note = live?.note ?? expense.audit_note ?? undefined;
    const suspicious = verdict === 'SUSPICIOUS';
    return {
      id: expense.id,
      date: formatLedgerDate(expense.date),
      time: formatPrintedTime(expense.created_at),
      description: expense.description,
      category: subcategoryLabel(expense),
      amount:
        expense.type === 'income' ? -Math.abs(expense.amount) : expense.amount,
      // Only SUSPICIOUS gets a stamp + note + arrow. APPROVED is the silent
      // default — a column of "APPROVED" stamps is noise, not signal.
      ...(suspicious && {
        stamp: { text: 'SUSPICIOUS', color: 'red' as const },
        note,
      }),
    };
  });

  async function handleEdit(values: EntryValues): Promise<string | void> {
    if (!editing) return;
    const res = await fetch('/api/expenses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, ...values }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return data.error ?? 'The clerk could not amend this entry.';
    }
  }

  async function handleDiscard(): Promise<string | void> {
    if (!editing) return;
    if (!window.confirm('Discard this entry from the ledger?')) {
      return 'Discard cancelled.';
    }
    const res = await fetch('/api/expenses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return data.error ?? 'The clerk could not discard this entry.';
    }
    setEditingId(null);
    startTransition(() => router.refresh());
  }

  function handleRecorded() {
    setEditingId(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      {editing && (
        <div className="relative">
          <PaperClip corner="tr" size={44} />
          <EntrySlip
            id={`edit-${editing.id}`}
            title="Amend this entry"
            submitLabel="Save amendment"
            submittingLabel="Filing the amendment…"
            recordedLabel="Amended"
            initial={editing}
            onSubmit={handleEdit}
            onDiscard={handleDiscard}
            onCancel={() => setEditingId(null)}
            onRecorded={handleRecorded}
            tilt={-0.3}
          />
        </div>
      )}

      <LedgerTable
        rows={rows}
        columns={['date', 'description', 'category', 'amount']}
        onDrillIn={(row) => setEditingId(row.id)}
        activeRowId={editingId ?? undefined}
        emptyText="No entries on this page. File one below."
        caption="Expense entries for the selected range"
      />

      {hasMore && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShown((s) => s + PAGE_SIZE)}
            className="paper-focusable paper-pressable font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute hover:text-ink"
          >
            Turn the page · {expenses.length - shown} more
          </button>
        </div>
      )}
    </div>
  );
}

function subcategoryLabel(expense: Expense): string {
  if (!expense.subcategory) return expense.category;
  return `${expense.category} · ${expense.subcategory}`;
}

const LEDGER_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
});

function formatLedgerDate(dateStr: string | Date): string {
  const d =
    typeof dateStr === 'string'
      ? new Date(dateStr.length === 10 ? dateStr + 'T00:00:00Z' : dateStr)
      : dateStr;
  // "20 Apr" → "Apr 20" to match the mock
  const parts = LEDGER_DATE_FORMATTER.formatToParts(d);
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  return `${month} ${Number(day)}`;
}
