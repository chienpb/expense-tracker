import type { CategorySpending } from './queries';

/**
 * Short display names for the tally list in the right column of
 * `/dashboard`. Keeps rows scannable inside the narrow summary
 * column — e.g. `Bills & Utilities` -> `Bills`, `Transport` -> `Transit`.
 *
 * Values not listed here fall through to the raw category name.
 */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'Food & Drink': 'Food & Drink',
  Transport: 'Transit',
  Shopping: 'Shopping',
  'Bills & Utilities': 'Bills',
  Entertainment: 'Entertainment',
  'Personal Care': 'Personal Care',
  Health: 'Health',
  Travel: 'Travel',
  Other: 'Other',
};

export function displayCategoryName(name: string): string {
  return CATEGORY_DISPLAY_NAMES[name] ?? name;
}

export interface TallyRow {
  category: string;
  displayName: string;
  total: number;
  share: number;
  tallyCount: number;
}

/**
 * Roll a sorted `CategorySpending[]` into at most `topN + 1` rows:
 * the top `topN` categories verbatim, plus an aggregate `Other` bucket
 * for everything else. Keeps the tally list (`LINE B.`) legible at the
 * narrow right-column width regardless of how many raw categories the
 * range happens to touch.
 *
 * `tallyCount` = round(share × 10), clamped to [0, 10]. Documented in
 * `docs/DECISION_LOG.md` under "Dashboard tally density".
 */
export function groupCategoriesForTally(
  rows: CategorySpending[],
  topN = 5,
): TallyRow[] {
  const total = rows.reduce((acc, r) => acc + r.total, 0);
  if (total <= 0) return [];

  const head = rows.slice(0, topN);
  const tail = rows.slice(topN);
  const tailTotal = tail.reduce((acc, r) => acc + r.total, 0);

  const out: TallyRow[] = head.map((r) => {
    const share = r.total / total;
    return {
      category: r.category,
      displayName: displayCategoryName(r.category),
      total: r.total,
      share,
      tallyCount: Math.max(0, Math.min(10, Math.round(share * 10))),
    };
  });

  if (tailTotal > 0) {
    const share = tailTotal / total;
    out.push({
      category: 'Other',
      displayName: 'Other',
      total: tailTotal,
      share,
      tallyCount: Math.max(0, Math.min(10, Math.round(share * 10))),
    });
  }

  return out;
}
