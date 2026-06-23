import { getSupabase } from '@/lib/supabase';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  subcategory: string | null;
  type: 'expense' | 'income';
  date: string;
  created_at: string;
  /** Rubber-Stamp Auditor verdict; null = unaudited. `select('*')` returns it. */
  audit_verdict: 'APPROVED' | 'SUSPICIOUS' | null;
  /** Auditor's one-line margin note; null = unaudited. */
  audit_note: string | null;
}

export interface DailySpending {
  date: string;
  total: number;
  income: number;
}

export interface CategorySpending {
  category: string;
  total: number;
  count: number;
}

export async function getExpenses(
  from: string,
  to: string,
  opts?: { limit?: number; offset?: number },
): Promise<Expense[]> {
  const supabase = getSupabase();
  let q = supabase
    .from('expenses')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (opts?.limit != null) {
    const offset = opts.offset ?? 0;
    q = q.range(offset, offset + opts.limit - 1);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getExpenseCount(from: string, to: string): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true })
    .gte('date', from)
    .lte('date', to);

  if (error) throw error;
  return count ?? 0;
}

export async function getSpendingByDay(from: string, to: string): Promise<DailySpending[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `SELECT date::text, COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) as total, COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) as income FROM expenses WHERE date >= '${from}' AND date <= '${to}' GROUP BY date ORDER BY date`,
  });

  if (error) throw error;
  return (data as DailySpending[]) ?? [];
}

export interface DayCategorySpending {
  date: string;
  category: string;
  total: number;
}

export async function getSpendingByDayAndCategory(from: string, to: string): Promise<DayCategorySpending[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `SELECT date::text, category, SUM(amount) as total FROM expenses WHERE date >= '${from}' AND date <= '${to}' AND type = 'expense' GROUP BY date, category ORDER BY date, total DESC`,
  });

  if (error) throw error;
  return (data as DayCategorySpending[]) ?? [];
}

export async function getSpendingByCategory(from: string, to: string): Promise<CategorySpending[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `SELECT category, SUM(amount) as total, COUNT(*)::int as count FROM expenses WHERE date >= '${from}' AND date <= '${to}' AND type = 'expense' GROUP BY category ORDER BY total DESC`,
  });

  if (error) throw error;
  return (data as CategorySpending[]) ?? [];
}

/**
 * Prior equivalent range total (expense only). For a range `[from, to]`
 * spanning N days, returns the spend sum over the N days immediately
 * preceding `from`. Powers the hero's week-over-week delta note.
 */
export async function getPriorRangeTotal(from: string, to: string): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `SELECT COALESCE(SUM(amount), 0)::bigint as total FROM expenses WHERE type = 'expense' AND date >= ('${from}'::date - ('${to}'::date - '${from}'::date + 1)) AND date < '${from}'::date`,
  });

  if (error) throw error;
  const row = (data as { total: number }[])?.[0];
  return row?.total ?? 0;
}

/**
 * The single highest-spend day in range, plus the dominant category on
 * that day. Powers the dashed-ellipse chart annotation
 * (`ouch — {category}`). Returns null when range is empty.
 */
export async function getPeakDayCategory(
  from: string,
  to: string,
): Promise<{ date: string; total: number; category: string; categoryTotal: number } | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `WITH day_totals AS (SELECT date, SUM(amount)::bigint as total FROM expenses WHERE type = 'expense' AND date >= '${from}' AND date <= '${to}' GROUP BY date), peak AS (SELECT date, total FROM day_totals ORDER BY total DESC LIMIT 1), peak_cat AS (SELECT category, SUM(amount)::bigint as cat_total FROM expenses WHERE type = 'expense' AND date = (SELECT date FROM peak) GROUP BY category ORDER BY cat_total DESC LIMIT 1) SELECT (SELECT date::text FROM peak) as date, (SELECT total FROM peak) as total, (SELECT category FROM peak_cat) as category, (SELECT cat_total FROM peak_cat) as category_total`,
  });

  if (error) throw error;
  const row = (data as { date: string | null; total: number | null; category: string | null; category_total: number | null }[])?.[0];
  if (!row?.date || row.total == null || !row.category) return null;
  return {
    date: row.date,
    total: row.total,
    category: row.category,
    categoryTotal: row.category_total ?? 0,
  };
}

/**
 * The largest single income row in range — used to derive the hero's
 * handwritten margin note (`"net, after {who} paid me back"`). The
 * counterpart name is inferred from the description; callers should
 * truncate / sanitize before rendering.
 */
export async function getTopPaybackCounterpart(
  from: string,
  to: string,
): Promise<{ description: string; amount: number; date: string } | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('expenses')
    .select('description, amount, date')
    .eq('type', 'income')
    .gte('date', from)
    .lte('date', to)
    .order('amount', { ascending: false })
    .limit(1);

  if (error) throw error;
  const row = (data as { description: string; amount: number; date: string }[])?.[0];
  return row ?? null;
}

export async function getOverview(from: string, to: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `SELECT COUNT(*)::int as count, COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0)::bigint as total_spent, COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0)::bigint as total_income FROM expenses WHERE date >= '${from}' AND date <= '${to}'`,
  });

  if (error) throw error;
  const row = (data as { count: number; total_spent: number; total_income: number }[])?.[0];
  return { count: row?.count ?? 0, totalSpent: row?.total_spent ?? 0, totalIncome: row?.total_income ?? 0 };
}
