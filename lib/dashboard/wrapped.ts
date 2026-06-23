import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getSupabase } from '@/lib/supabase';
import { formatVND } from '@/lib/dashboard/utils';
import { ledgerKeeperInstructions } from '@/lib/ledger-keeper-prompt';

/**
 * Monthly Wrapped (spec: work/monthly-wrapped) — the deterministic side.
 *
 * The numbers are computed here in JS, never by the AI and never stored:
 * a single month-scoped aggregation (same reduce pattern as `/api/report`
 * `mode:'full'` — `type !== 'income'` is spent, `=== 'income'` is returned).
 * Only the AI's one-line verdict is persisted (on `sealed_months.wrapped_text`);
 * the bundle is recomputed on every read, so re-reads cost zero tokens.
 *
 * `expenses` has no `user_id` (single-keeper books, see `sealing.ts`), so the
 * entry aggregation is scoped by calendar month only; the seal row read/write
 * is scoped by `user_id` (`getWrappedText`).
 */

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface WrappedBundle {
  /** First-of-month key, `YYYY-MM-01`. */
  month: string;
  /** Sum of non-income entries (VND integer). */
  totalSpent: number;
  /** Sum of income entries — money returned (VND integer). */
  totalIncome: number;
  /** spent − returned: net outflow for the month (VND integer, may be negative). */
  net: number;
  /** Per-category spend, descending. Income excluded. */
  byCategory: CategoryTotal[];
  /** The single largest non-income entry, named. Null if no spending. */
  largest: { description: string; category: string; amount: number } | null;
}

/** First-of-month key one month after `month` (`YYYY-MM-01`). */
function nextMonthKey(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const next = new Date(y, m, 1); // m is 1-based here → Date month index = m = the month after
  const ny = next.getFullYear();
  const nm = String(next.getMonth() + 1).padStart(2, '0');
  return `${ny}-${nm}-01`;
}

/**
 * Aggregate one calendar month's entries into the deterministic bundle.
 * `month` is a first-of-month key (`YYYY-MM-01`). One query, JS reduce.
 */
export async function computeMonthBundle(month: string): Promise<WrappedBundle> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('expenses')
    .select('amount, category, description, type')
    .gte('date', month)
    .lt('date', nextMonthKey(month));

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    amount: number;
    category: string;
    description: string;
    type: string;
  }>;

  let totalSpent = 0;
  let totalIncome = 0;
  const catMap = new Map<string, number>();
  let largest: WrappedBundle['largest'] = null;

  for (const r of rows) {
    if (r.type === 'income') {
      totalIncome += r.amount;
      continue;
    }
    totalSpent += r.amount;
    catMap.set(r.category, (catMap.get(r.category) ?? 0) + r.amount);
    if (!largest || r.amount > largest.amount) {
      largest = { description: r.description, category: r.category, amount: r.amount };
    }
  }

  const byCategory = Array.from(catMap, ([category, amount]) => ({ category, amount })).sort(
    (a, b) => b.amount - a.amount,
  );

  return { month, totalSpent, totalIncome, net: totalSpent - totalIncome, byCategory, largest };
}

/**
 * Verdict task block — the AI's ONLY job (spec): one, at most two, clerical
 * sentences naming the shape of the month, closing `— LK`. The numbers are
 * given as facts; the AI must not emit any figure of its own. gpt-5.4 drifts
 * into milestone/cheerleading exactly here, so the guardrails are explicit.
 */
function verdictTask(bundle: WrappedBundle, label: string): string {
  const facts = [
    `Month: ${label}`,
    `Total spent: ${formatVND(bundle.totalSpent)}`,
    `Total returned (income/refunds): ${formatVND(bundle.totalIncome)}`,
    `Net (spent minus returned): ${formatVND(bundle.net)}`,
    `Spending by category: ${
      bundle.byCategory.length
        ? bundle.byCategory.map((c) => `${c.category} ${formatVND(c.amount)}`).join(', ')
        : 'none'
    }`,
    `Largest single entry: ${
      bundle.largest
        ? `${bundle.largest.description} (${bundle.largest.category}) ${formatVND(bundle.largest.amount)}`
        : 'none'
    }`,
  ].join('\n');

  return `Task: write the Ledger-keeper's closing line for a settled month — the "shape of the month" in one sentence, two at the very most.

These are the books for the month, already counted. Treat them as given fact:
${facts}

Write ONE clerical observation about the shape of this month — what the numbers, taken together, amount to. Then close with \`— LK\` on its own line.

Hard rules:
- One sentence. Two only if the second genuinely earns its place. Never three.
- State NO figure. Do not write any amount, percentage, or count — the page already shows the numbers beside your line. Refer to spending in words ("the month leaned on…", "returns nearly met outlay"), never in digits.
- Forbidden: superlatives (biggest, most, record, ever), praise or judgement of the keeper, "this month you…" recap cadence, rhetorical questions, and any closing uplift or encouragement.
- State a finding about the books, not a verdict on the person. Dry, precise, 1962-clerical.
- Close with \`— LK\` on its own line, nothing after.`;
}

/**
 * Generate the verdict line for a sealed month. One `generateText` call —
 * the bundle is passed as facts (no SQL tool loop; ponytail — the tool loop
 * is the spec's escape hatch, not the default). Throws on failure; the caller
 * (`/api/seal`) catches and stores null so the slip still stands on aggregates.
 */
export async function generateVerdict(bundle: WrappedBundle, label: string): Promise<string> {
  const { text } = await generateText({
    model: openai('gpt-5.4'),
    system: ledgerKeeperInstructions(verdictTask(bundle, label)),
    prompt: `Write the closing line for ${label}.`,
  });
  const verdict = text.trim();
  if (!verdict) throw new Error('empty verdict');
  return verdict;
}

/** The stored verdict for one sealed month, or null. Scoped by `user_id`. */
export async function getWrappedText(userId: string, month: string): Promise<string | null> {
  if (!userId) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('sealed_months')
    .select('wrapped_text')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.wrapped_text as string | null) ?? null;
}
