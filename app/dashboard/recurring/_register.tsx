'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatVND } from '@/lib/dashboard/utils';
import { formatPrintedDate } from '@/lib/paper-format';
import { tiltFor } from '@/lib/seed-rotation';
import { Stamp } from '@/app/_components/paper/Stamp';
import { TornCorner } from '@/app/_components/paper/TornCorner';
import { TornTopEdge } from '@/app/_components/paper/TornTopEdge';
import { EmptyLine } from '@/app/_components/paper/EmptyLine';
import { EraserMarks } from '@/app/_components/paper/EraserMarks';
import type { RecurringExpense } from './page';

/**
 * `<StandingOrderRegister>` — Phase 5.2 register for recurring expenses.
 *
 * Active orders sit on the ruled body as a `LedgerTable`-shaped
 * table: 32px rows, typewriter labels, oldstyle-tabular amounts, the
 * shared highlighter hover via `.paper-row-interactive`. Each row ends
 * with a navy ACTIVE stamp.
 *
 * Paused orders are pulled out into a "set aside" stack — each item on
 * its own small receipt with a torn corner (§4.7) and a red PAUSED
 * stamp. The torn corner is the visual affordance the roadmap asks
 * for on archived items; "paused" is the nearest concept in this
 * schema, so paused doubles as set-aside here.
 *
 * Actions (pause/resume, discard) hit `/api/recurring` and refresh the
 * server component. No optimistic state — the register is small and
 * a single Supabase round-trip is well under the §8 motion budget.
 */
const FREQ_LABEL: Record<string, string> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
};

export function StandingOrderRegister({
  items,
}: {
  items: RecurringExpense[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function togglePause(id: string, currentlyActive: boolean) {
    setBusyId(id);
    await fetch('/api/recurring', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !currentlyActive }),
    });
    startTransition(() => router.refresh());
    setBusyId(null);
  }

  async function discard(id: string) {
    setBusyId(id);
    await fetch('/api/recurring', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    startTransition(() => router.refresh());
    setBusyId(null);
  }

  if (items.length === 0) {
    return (
      <EmptyLine>Nothing standing yet. Add one below.</EmptyLine>
    );
  }

  const active = items.filter((i) => i.active);
  const paused = items.filter((i) => !i.active);

  return (
    <div className="space-y-10">
      <ActiveTable
        items={active}
        busyId={busyId}
        onPause={togglePause}
        onDiscard={discard}
      />
      {paused.length > 0 && (
        <PausedStack
          items={paused}
          busyId={busyId}
          onResume={togglePause}
          onDiscard={discard}
        />
      )}
    </div>
  );
}

type ActionProps = {
  busyId: string | null;
  onPause?: (id: string, active: boolean) => void;
  onResume?: (id: string, active: boolean) => void;
  onDiscard: (id: string) => void;
};

function ActiveTable({
  items,
  busyId,
  onPause,
  onDiscard,
}: { items: RecurringExpense[] } & ActionProps) {
  if (items.length === 0) {
    return (
      <EmptyLine>Every order is set aside.</EmptyLine>
    );
  }
  return (
    <>
    {/* Mobile — torn-edge receipt cards (§3.4, <640px). */}
    <ul className="flex list-none flex-col gap-3 p-0 sm:hidden">
      {items.map((item) => (
        <li key={item.id} className="list-none">
          <ActiveCard
            item={item}
            busy={busyId === item.id}
            onPause={onPause!}
            onDiscard={onDiscard}
          />
        </li>
      ))}
    </ul>
    {/* Desktop / tablet — the ruled six-column table (≥640px). */}
    <div className="paper-ledger-table hidden w-full overflow-x-auto sm:block">
      <table className="w-full border-collapse nums-oldstyle-tabular">
        <caption className="sr-only">Active standing orders</caption>
        <thead>
          <tr className="border-b border-ink/70">
            <HeaderCell>Description</HeaderCell>
            <HeaderCell>Category</HeaderCell>
            <HeaderCell>Cycle</HeaderCell>
            <HeaderCell align="right">Amount ₫</HeaderCell>
            <HeaderCell align="right">Next</HeaderCell>
            <HeaderCell align="right" srOnly>
              Actions
            </HeaderCell>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <ActiveRow
              key={item.id}
              item={item}
              busy={busyId === item.id}
              onPause={onPause!}
              onDiscard={onDiscard}
            />
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

/**
 * `<ActiveCard>` — mobile (<640px) receipt-card form of an active
 * standing order. The six table columns fold into a torn-topped card:
 * category · cycle across the top, description and amount squared off
 * below, then the next-due date with the ACTIVE stamp and the
 * pause / discard actions.
 */
function ActiveCard({
  item,
  busy,
  onPause,
  onDiscard,
}: {
  item: RecurringExpense;
  busy: boolean;
  onPause: (id: string, active: boolean) => void;
  onDiscard: (id: string) => void;
}) {
  const descTilt = tiltFor(`${item.id}-desc`, 1.2);
  return (
    <div
      className="relative mt-2 border border-ink/25 bg-paper-2 px-3 py-2.5"
      data-busy={busy || undefined}
    >
      <TornTopEdge background="var(--color-paper-2)" />
      <div className="flex items-baseline justify-between gap-3 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
        <span>
          {item.category}
          {item.subcategory && ` · ${item.subcategory}`}
        </span>
        <span>{FREQ_LABEL[item.frequency] ?? item.frequency}</span>
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        {busy ? (
          <EraserMarks variant="inline" label="Updating order" />
        ) : (
          <span
            data-ledger-tilt
            className="inline-block origin-left font-hand text-hand text-pen-navy"
            style={{ transform: `rotate(${descTilt}deg)` }}
          >
            {item.description}
          </span>
        )}
        <span className="shrink-0 font-serif text-body font-bold nums-oldstyle-tabular text-ink">
          {formatVND(item.amount)}
        </span>
      </div>
      <div className="mt-3 space-y-2 border-t border-ink/15 pt-2">
        <div className="flex items-center gap-3">
          <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            Next {formatPrintedDate(item.next_due)}
          </span>
          <Stamp
            text="Active"
            color="navy"
            wear={0.5}
            id={`${item.id}-active-stamp-m`}
            className="ml-auto text-[9px]"
          />
        </div>
        <div className="flex items-center gap-4">
          <TextAction
            label="Pause"
            onClick={() => onPause(item.id, item.active)}
            disabled={busy}
          />
          <TextAction
            label="Discard"
            tone="danger"
            onClick={() => onDiscard(item.id)}
            disabled={busy}
          />
        </div>
      </div>
    </div>
  );
}

function ActiveRow({
  item,
  busy,
  onPause,
  onDiscard,
}: {
  item: RecurringExpense;
  busy: boolean;
  onPause: (id: string, active: boolean) => void;
  onDiscard: (id: string) => void;
}) {
  const descTilt = tiltFor(`${item.id}-desc`, 1.2);
  return (
    <tr
      className="paper-ledger-row border-b border-rule-blue/60"
      data-busy={busy || undefined}
    >
      <td className="relative h-8 px-3 align-middle text-body">
        {busy ? (
          <EraserMarks variant="inline" label="Updating order" />
        ) : (
          <span
            data-ledger-tilt
            className="inline-block origin-left font-hand text-hand text-pen-navy"
            style={{ transform: `rotate(${descTilt}deg)` }}
          >
            {item.description}
          </span>
        )}
      </td>
      <td className="h-8 px-3 align-middle">
        <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
          {item.category}
          {item.subcategory && ` · ${item.subcategory}`}
        </span>
      </td>
      <td className="h-8 px-3 align-middle">
        <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
          {FREQ_LABEL[item.frequency] ?? item.frequency}
        </span>
      </td>
      <td className="h-8 px-3 align-middle text-right">
        <span className="font-serif text-body font-bold nums-oldstyle-tabular text-ink">
          {formatVND(item.amount)}
        </span>
      </td>
      <td className="h-8 px-3 align-middle text-right">
        <span className="font-typewriter text-[11px] tabular-nums text-ink-mute">
          {formatPrintedDate(item.next_due)}
        </span>
      </td>
      <td className="h-8 px-3 align-middle text-right">
        <div className="inline-flex items-center justify-end gap-3">
          <Stamp
            text="Active"
            color="navy"
            wear={0.5}
            id={`${item.id}-active-stamp`}
            className="text-[9px]"
          />
          <TextAction
            label="Pause"
            onClick={() => onPause(item.id, item.active)}
            disabled={busy}
          />
          <TextAction
            label="Discard"
            tone="danger"
            onClick={() => onDiscard(item.id)}
            disabled={busy}
          />
        </div>
      </td>
    </tr>
  );
}

function PausedStack({
  items,
  busyId,
  onResume,
  onDiscard,
}: { items: RecurringExpense[] } & ActionProps) {
  return (
    <div>
      <h3 className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
        Set aside · {items.length} paused
      </h3>
      <ul
        className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item) => (
          <li key={item.id} className="list-none">
            <PausedReceipt
              item={item}
              busy={busyId === item.id}
              onResume={onResume!}
              onDiscard={onDiscard}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PausedReceipt({
  item,
  busy,
  onResume,
  onDiscard,
}: {
  item: RecurringExpense;
  busy: boolean;
  onResume: (id: string, active: boolean) => void;
  onDiscard: (id: string) => void;
}) {
  const tilt = tiltFor(`${item.id}-receipt`, 0.9);
  return (
    <div
      className="relative border border-ink/30 bg-paper-2 p-4 pr-10"
      data-ledger-tilt
      style={{ transform: `rotate(${tilt}deg)` }}
      data-busy={busy || undefined}
    >
      <TornCorner
        corner="tr"
        size={40}
        background="var(--color-paper-2)"
        edgeColor="var(--color-ink-mute)"
      />
      <div className="flex flex-col gap-1">
        <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
          {item.category}
          {item.subcategory && ` · ${item.subcategory}`}
        </span>
        <p className="font-hand text-hand text-ink-faint">{item.description}</p>
        <p className="font-serif text-body nums-oldstyle-tabular text-ink-faint">
          {formatVND(item.amount)}{' '}
          <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)]">
            · {FREQ_LABEL[item.frequency] ?? item.frequency}
          </span>
        </p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Stamp
          text="Paused"
          color="red"
          wear={0.7}
          id={`${item.id}-paused-stamp`}
          className="text-[9px]"
        />
        <TextAction
          label="Put back"
          onClick={() => onResume(item.id, item.active)}
          disabled={busy}
        />
        <TextAction
          label="Discard"
          tone="danger"
          onClick={() => onDiscard(item.id)}
          disabled={busy}
          className="ml-auto"
        />
      </div>
    </div>
  );
}

function HeaderCell({
  children,
  align = 'left',
  srOnly = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  srOnly?: boolean;
}) {
  return (
    <th
      scope="col"
      className={`h-8 px-3 text-label font-typewriter font-normal uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {srOnly ? <span className="sr-only">{children}</span> : children}
    </th>
  );
}

function TextAction({
  label,
  onClick,
  disabled,
  tone = 'default',
  className,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  className?: string;
}) {
  const colorClass =
    tone === 'danger'
      ? 'text-ink-mute hover:text-stamp-red'
      : 'text-ink-mute hover:text-pen-navy';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`paper-focusable paper-pressable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${colorClass} ${className ?? ''}`}
    >
      {label}
    </button>
  );
}
