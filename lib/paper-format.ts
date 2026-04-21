import { formatVND } from '@/lib/dashboard/utils';

/**
 * Paper Ledger formatting helpers — §10 of `DESIGN_SYSTEM.md`.
 *
 * `formatVND` from `lib/dashboard/utils.ts` stays the canonical VND
 * renderer. These helpers layer the ledger metaphor on top: refunds
 * read in parentheses (§4.3), dates are printed in the 1962-clerical
 * long form, times in 24h.
 *
 * Integers only (see `CLAUDE.md` invariants). Negative values are
 * treated as refunds/reversals and are meant to be rendered in
 * stamp-red — the component consuming `formatSignedVND` decides the
 * color, this helper only controls the shape.
 */

/**
 * Format a signed VND integer as a ledger amount string. Refunds —
 * any negative value — come back wrapped in parentheses, matching
 * the accounting convention used in §4.3 ("refunds in stamp-red
 * parentheses"). Positive values format identically to `formatVND`.
 */
export function formatSignedVND(amount: number): string {
  if (amount < 0) return `(${formatVND(Math.abs(amount))})`;
  return formatVND(amount);
}

/** Is this amount a refund (rendered in stamp-red)? */
export function isRefund(amount: number): boolean {
  return amount < 0;
}

const PRINTED_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/**
 * Printed long-form date, §10: `"Mon, 20 Apr 2026"`. For user-written
 * dates, let the user write them — this formatter is PRINT layer only.
 */
export function formatPrintedDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // `en-GB` renders as "Mon, 20 Apr 2026" with the settings above.
  return PRINTED_DATE_FORMATTER.format(d);
}

const PRINTED_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** 24h clock time, e.g. `"07:14"`. */
export function formatPrintedTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return PRINTED_TIME_FORMATTER.format(d);
}
