'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import { formatSignedVND, isRefund } from '@/lib/paper-format';
import { tiltFor } from '@/lib/seed-rotation';
import { EraserMarks } from './EraserMarks';
import { RedStringCorrection } from './RedStringCorrection';
import { Stamp, type StampColor } from './Stamp';
import { TornTopEdge } from './TornTopEdge';

/**
 * `<LedgerTable>` — the transactions table (§4.3).
 *
 * Rows are 32px tall so each entry rides exactly one ruled line of
 * the host `<Page>`; no row spans two rules, and total row count ×
 * 32 lines up with the ruled-line count. Columns are pre-styled per
 * §4.3:
 *   date         — Courier Prime, uppercase, mute
 *   time         — Courier Prime, mute
 *   description  — serif OR handwriting per `descriptionKind`
 *   category     — Courier Prime, uppercase, mute
 *   amount       — Crimson Pro, oldstyle-tabular, right-aligned,
 *                  refunds wrapped in stamp-red parentheses
 *
 * State surface (§6):
 *   hover                 — `highlighter` band swipes left→right in 200ms
 *   focus                 — 1.5px pen-navy outline + high-contrast ring
 *   ai-suggested          — row body rendered through `#pencil-stroke`
 *                           and tinted `pencil-gray`
 *   deleted-recently      — red strike across the row + VOID stamp;
 *                           consumers control the 5s fade per §6.11
 *   previousAmount edits  — `<RedStringCorrection>` at the amount cell
 *   loading               — `<EraserMarks>` replaces the tbody
 *   empty                 — Caveat empty-line copy (§6.6)
 *
 * Drill-in (§4.3) is delegated: when `onDrillIn` is set, each row
 * becomes keyboard-activatable (Enter/Space). The consumer mounts a
 * `<PaperClip>`-topped detail card above the page.
 *
 * Mobile (§3.4): below 640px the `<table>` is replaced by a stack of
 * torn-edge receipt cards — one per row, each topped with
 * `<TornTopEdge>`. Same data, same states (interactive / ai-suggested /
 * deleted-recently / edit history / stamp), laid out for a 375px column
 * instead of five squeezed table columns.
 */
export type LedgerRowStatus = 'default' | 'ai-suggested' | 'deleted-recently';

export type LedgerRow = {
  id: string;
  /** Pre-formatted printed date — e.g. `"Mon, 20 Apr 2026"`. */
  date: string;
  /** Pre-formatted 24h time — e.g. `"07:14"`. Optional. */
  time?: string;
  description: ReactNode;
  /** Controls the description column's typography. Default `'hand'`. */
  descriptionKind?: 'print' | 'hand';
  category?: string;
  /** Signed integer VND. Negative = refund (rendered in stamp-red parens). */
  amount: number;
  status?: LedgerRowStatus;
  /** Prior amount for edit history — drives `<RedStringCorrection>`. */
  previousAmount?: number;
  /** Inline stamp (e.g. `RECORDED`, `DRAFT`) rendered in the amount column. */
  stamp?: { text: string; subtext?: string; color?: StampColor };
};

export type LedgerColumn = 'date' | 'time' | 'description' | 'category' | 'amount';

const DEFAULT_COLUMNS: readonly LedgerColumn[] = [
  'date',
  'time',
  'description',
  'category',
  'amount',
];

type LedgerTableProps = {
  rows: LedgerRow[];
  /** Column selection & order. Defaults to all five per §4.3. */
  columns?: readonly LedgerColumn[];
  /** Click / Enter / Space on a row. When set, rows become interactive. */
  onDrillIn?: (row: LedgerRow) => void;
  /** Highlight the currently drilled-in row. */
  activeRowId?: string;
  /** Loading state (§6.5) — replaces body with `<EraserMarks>` rows. */
  loading?: boolean;
  /** Rows to show while `loading=true`. Default 4. */
  skeletonRows?: number;
  /** Copy for the empty state (§6.6). */
  emptyText?: string;
  /** Hide the column header row (mostly useful for nested embeds). */
  hideHeader?: boolean;
  /** Accessible caption. Visually hidden by default. */
  caption?: string;
  className?: string;
};

export function LedgerTable({
  rows,
  columns = DEFAULT_COLUMNS,
  onDrillIn,
  activeRowId,
  loading = false,
  skeletonRows = 4,
  emptyText = 'Nothing on this line yet.',
  hideHeader = false,
  caption,
  className,
}: LedgerTableProps) {
  const interactive = typeof onDrillIn === 'function';
  const colCount = columns.length;

  return (
    <div className={`paper-ledger-table w-full ${className ?? ''}`}>
      {/* Desktop / tablet — the ruled five-column table (≥640px). */}
      <table className="hidden w-full border-collapse nums-oldstyle-tabular sm:table">
        {caption && <caption className="sr-only">{caption}</caption>}

        {!hideHeader && (
          <thead>
            <tr className="border-b border-ink/70 border-t-2 border-t-ink/80 bg-paper-2/60">
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className={`h-8 px-3 text-label font-typewriter font-normal uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute ${
                    col === 'amount' ? 'text-right' : 'text-left'
                  }`}
                >
                  {HEADER_LABEL[col]}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="paper-ledger-row">
                <td colSpan={colCount} className="h-8 px-3 align-middle">
                  <EraserMarks variant="inline" label="Loading row" />
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={colCount}
                className="h-16 px-3 text-center font-hand-signature text-hand-signature text-ink-faint"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <Row
                key={row.id}
                row={row}
                columns={columns}
                interactive={interactive}
                active={row.id === activeRowId}
                onDrillIn={onDrillIn}
              />
            ))
          )}
        </tbody>
      </table>

      {/* Mobile — a stack of torn-edge receipt cards (§3.4, <640px). */}
      <div className="sm:hidden">
        {loading ? (
          <ul className="flex flex-col gap-3" aria-label={caption}>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <li
                key={`skeleton-card-${i}`}
                className="relative mt-2 border border-ink/25 bg-paper-2 px-3 py-3"
              >
                <TornTopEdge background="var(--color-paper-2)" />
                <EraserMarks variant="inline" label="Loading entry" />
              </li>
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <p className="px-1 py-4 text-center font-hand-signature text-hand-signature text-ink-faint">
            {emptyText}
          </p>
        ) : (
          <ul className="flex flex-col gap-3" aria-label={caption}>
            {rows.map((row) => (
              <ReceiptCard
                key={row.id}
                row={row}
                columns={columns}
                interactive={interactive}
                active={row.id === activeRowId}
                onDrillIn={onDrillIn}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * `<ReceiptCard>` — the mobile (<640px) stand-in for a `<LedgerTable>`
 * row. A torn-off receipt: date · time and category printed across the
 * top, the description and amount squared off below. Carries the same
 * state surface as the table `<Row>` — interactive drill-in, the
 * pencil-gray AI tint, the voided strike + fade, edit-history and inline
 * stamp — adapted from `> td` selectors to the card element itself.
 */
function ReceiptCard({
  row,
  columns,
  interactive,
  active,
  onDrillIn,
}: {
  row: LedgerRow;
  columns: readonly LedgerColumn[];
  interactive: boolean;
  active: boolean;
  onDrillIn?: (row: LedgerRow) => void;
}) {
  const status = row.status ?? 'default';
  const refund = isRefund(row.amount);
  const voided = status === 'deleted-recently';
  const ai = status === 'ai-suggested';

  const showDate = columns.includes('date');
  const showTime = columns.includes('time') && !!row.time;
  const showCategory = columns.includes('category') && !!row.category;
  const showDescription = columns.includes('description');
  const showAmount = columns.includes('amount');

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDrillIn?.(row);
    }
  };

  const meta = (
    <div className="flex items-baseline justify-between gap-3 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
      {(showDate || showTime) && (
        <span className="tabular-nums">
          {showDate && row.date}
          {showDate && showTime && ' · '}
          {showTime && row.time}
        </span>
      )}
      {showCategory && <span className="text-right">{row.category}</span>}
    </div>
  );

  return (
    <li className="list-none">
      <div
        data-row-id={row.id}
        data-status={status}
        data-active={active || undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? () => onDrillIn?.(row) : undefined}
        onKeyDown={interactive ? onKeyDown : undefined}
        className={[
          'relative mt-2 border border-ink/25 bg-paper-2 px-3 py-2.5',
          interactive ? 'paper-focusable paper-pressable cursor-pointer' : '',
          active ? 'bg-[color-mix(in_srgb,var(--color-highlighter)_35%,transparent)]' : '',
          ai ? 'paper-pencil' : '',
          voided ? 'paper-row-voided text-ink-faint' : '',
        ].join(' ')}
      >
        <TornTopEdge background="var(--color-paper-2)" />
        {(showDate || showTime || showCategory) && meta}
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          {showDescription ? (
            <span className="min-w-0 [&>span]:whitespace-normal">
              <Description row={row} />
            </span>
          ) : (
            <span />
          )}
          {showAmount && (
            <span className="shrink-0 text-right">
              <Amount row={row} refund={refund} />
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function Row({
  row,
  columns,
  interactive,
  active,
  onDrillIn,
}: {
  row: LedgerRow;
  columns: readonly LedgerColumn[];
  interactive: boolean;
  active: boolean;
  onDrillIn?: (row: LedgerRow) => void;
}) {
  const status = row.status ?? 'default';
  const refund = isRefund(row.amount);

  const onKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDrillIn?.(row);
    }
  };

  return (
    <tr
      data-row-id={row.id}
      data-status={status}
      data-active={active || undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onDrillIn?.(row) : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
      className={[
        'paper-ledger-row group',
        interactive ? 'paper-row-interactive cursor-pointer' : '',
        status === 'ai-suggested' ? 'paper-row-ai' : '',
        status === 'deleted-recently' ? 'paper-row-voided' : '',
      ].join(' ')}
    >
      {columns.map((col) => {
        const alignRight = col === 'amount';
        return (
          <td
            key={col}
            className={`relative h-8 px-3 align-middle text-body ${
              alignRight ? 'text-right' : 'text-left'
            }`}
          >
            <Cell column={col} row={row} refund={refund} />
          </td>
        );
      })}
    </tr>
  );
}

function Cell({
  column,
  row,
  refund,
}: {
  column: LedgerColumn;
  row: LedgerRow;
  refund: boolean;
}) {
  switch (column) {
    case 'date':
      return (
        <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
          {row.date}
        </span>
      );
    case 'time':
      return row.time ? (
        <span className="font-typewriter text-[11px] tabular-nums text-ink-mute">
          {row.time}
        </span>
      ) : (
        <span aria-hidden="true" className="text-ink-faint">
          —
        </span>
      );
    case 'description':
      return <Description row={row} />;
    case 'category':
      return row.category ? (
        <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
          {row.category}
        </span>
      ) : (
        <span aria-hidden="true" className="text-ink-faint">
          —
        </span>
      );
    case 'amount':
      return <Amount row={row} refund={refund} />;
  }
}

function Description({ row }: { row: LedgerRow }) {
  const kind = row.descriptionKind ?? 'hand';
  if (kind === 'print') {
    return (
      <span className="font-serif text-body text-ink">{row.description}</span>
    );
  }
  const tilt = tiltFor(`${row.id}-desc`, 1.2);
  return (
    <span
      data-ledger-tilt
      className="inline-block origin-left font-hand text-hand text-pen-navy"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {row.description}
    </span>
  );
}

function Amount({ row, refund }: { row: LedgerRow; refund: boolean }) {
  const amountClass = `font-serif text-body font-bold nums-oldstyle-tabular ${
    refund ? 'text-stamp-red' : 'text-ink'
  }`;

  const amount = (
    <span className={amountClass}>{formatSignedVND(row.amount)}</span>
  );

  const withHistory =
    row.previousAmount !== undefined ? (
      <RedStringCorrection
        current={amount}
        previous={
          <span className={amountClass}>
            {formatSignedVND(row.previousAmount)}
          </span>
        }
      />
    ) : (
      amount
    );

  if (!row.stamp) return withHistory;

  return (
    <span className="inline-flex items-center justify-end gap-3">
      {withHistory}
      <Stamp
        text={row.stamp.text}
        subtext={row.stamp.subtext}
        color={row.stamp.color ?? 'red'}
        id={`${row.id}-stamp`}
        className="text-[10px]"
      />
    </span>
  );
}

const HEADER_LABEL: Record<LedgerColumn, string> = {
  date: 'Date',
  time: 'Time',
  description: 'Description',
  category: 'Category',
  amount: 'Amount ₫',
};
