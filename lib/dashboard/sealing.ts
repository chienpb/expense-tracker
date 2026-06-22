import { getSupabase } from '@/lib/supabase';

/**
 * "Closing the Books" — sealing reads + status logic (spec:
 * work/closing-the-books). The calendar and dashboard read this directly
 * from server components; only writes go through `POST /api/seal`.
 *
 * Month status is COMPUTED, never stored — no triggers, no write-path
 * hooks, so `/api/log` / `/api/expenses` / the Shortcuts contract stay
 * untouched (spec AC#9). A sealed month whose latest entry landed after
 * `sealed_at` reads as `reopened` (DECISION_LOG 2026-06-22).
 *
 * `expenses` has no `user_id` (single-keeper books), so stale detection
 * compares against ALL entries in the month; `sealed_months` is still
 * keyed by the session user.
 */

export type MonthStatus = 'future' | 'open' | 'sealed' | 'reopened';

export interface SealedMonth {
  /** First-of-month key, `YYYY-MM-01`. */
  month: string;
  /** ISO timestamptz the seal was last stamped. */
  sealedAt: string;
}

/** First-of-month key for a date, in local time: `YYYY-MM-01`. */
export function monthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

/** First-of-month key for the month immediately before `today`. */
export function priorMonthKey(today: Date): string {
  return monthKey(new Date(today.getFullYear(), today.getMonth() - 1, 1));
}

/** Sealed-month rows for one user, keyed `month → sealedAt`. */
export async function getSealedMonths(
  userId: string,
): Promise<Map<string, string>> {
  if (!userId) return new Map();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('sealed_months')
    .select('month, sealed_at')
    .eq('user_id', userId);

  if (error) throw error;
  const map = new Map<string, string>();
  for (const row of (data as { month: string; sealed_at: string }[]) ?? []) {
    map.set(row.month, row.sealed_at);
  }
  return map;
}

/**
 * `month (YYYY-MM-01) → max(created_at)` over every expense, in one
 * query. Powers stale detection: an entry created after a month's
 * `sealed_at` reopens it.
 */
export async function getMonthLastEntries(): Promise<Record<string, string>> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `SELECT to_char(date_trunc('month', date), 'YYYY-MM-DD') as month, MAX(created_at) as last_entry FROM expenses GROUP BY 1`,
  });

  if (error) throw error;
  const map: Record<string, string> = {};
  for (const row of (data as { month: string; last_entry: string }[]) ?? []) {
    map[row.month] = row.last_entry;
  }
  return map;
}

/**
 * Status of a month given the sealed map + last-entry map. `month` and
 * `currentMonth` are both first-of-month keys, so string comparison
 * orders them correctly.
 */
export function monthStatus(
  month: string,
  currentMonth: string,
  sealed: Map<string, string>,
  lastEntries: Record<string, string>,
): MonthStatus {
  if (month > currentMonth) return 'future';
  const sealedAt = sealed.get(month);
  if (!sealedAt) return 'open';
  const last = lastEntries[month];
  if (last && new Date(last) > new Date(sealedAt)) return 'reopened';
  return 'sealed';
}
