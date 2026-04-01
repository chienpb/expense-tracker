import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

export function formatVNDShort(amount: number): string {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + 'k';
  }
  return String(amount);
}

export type RangeKey = 'today' | '7d' | 'this_week' | 'this_month' | 'last_month' | '30d';

export function getDateRange(range: RangeKey): { from: string; to: string } {
  const today = new Date();
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

  switch (range) {
    case 'today':
      return { from: fmt(today), to: fmt(today) };
    case '7d':
      return { from: fmt(subDays(today, 6)), to: fmt(today) };
    case 'this_week':
      return { from: fmt(startOfWeek(today, { weekStartsOn: 1 })), to: fmt(endOfWeek(today, { weekStartsOn: 1 })) };
    case 'this_month':
      return { from: fmt(startOfMonth(today)), to: fmt(today) };
    case 'last_month': {
      const lastMonth = subMonths(today, 1);
      return { from: fmt(startOfMonth(lastMonth)), to: fmt(endOfMonth(lastMonth)) };
    }
    case '30d':
      return { from: fmt(subDays(today, 29)), to: fmt(today) };
    default:
      return { from: fmt(subDays(today, 6)), to: fmt(today) };
  }
}

export function getDayCount(from: string, to: string): number {
  return differenceInDays(new Date(to), new Date(from)) + 1;
}

export const RANGE_LABELS: Record<RangeKey, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  this_week: 'This week',
  this_month: 'This month',
  last_month: 'Last month',
  '30d': 'Last 30 days',
};
