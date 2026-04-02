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

export async function getExpenses(from: string, to: string): Promise<Expense[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSpendingByDay(from: string, to: string): Promise<DailySpending[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `SELECT date::text, COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) as total, COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) as income FROM expenses WHERE date >= '${from}' AND date <= '${to}' GROUP BY date ORDER BY date`,
  });

  if (error) throw error;
  return (data as DailySpending[]) ?? [];
}

export async function getSpendingByCategory(from: string, to: string): Promise<CategorySpending[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `SELECT category, SUM(amount) as total, COUNT(*)::int as count FROM expenses WHERE date >= '${from}' AND date <= '${to}' AND type = 'expense' GROUP BY category ORDER BY total DESC`,
  });

  if (error) throw error;
  return (data as CategorySpending[]) ?? [];
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
