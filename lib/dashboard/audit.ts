import { getSupabase } from '@/lib/supabase';
import { formatVND } from '@/lib/dashboard/utils';
import { flagCandidates } from '@/lib/dashboard/detectors.mjs';
import type { AuditStamp } from '@/lib/dashboard/audit-schema';

/**
 * The Rubber-Stamp Auditor (spec: work/rubber-stamp-auditor) — the server side.
 *
 * Generate-once/store/replay, keyed on per-entry state. The audit is driven by
 * the dashboard's streaming route (`app/api/audit/route.ts`): on first view of
 * a month, the client streams the verdicts in (rows stamp one by one); the
 * route persists them on completion. A later view finds nothing unaudited and
 * never opens the stream. Independent of sealing — the live current month is
 * audited too, so a new entry gets stamped on the next view.
 *
 * This module owns the deterministic prep (which entries are unaudited, the
 * candidate flags) and the persist step. The model call lives in the route so
 * its partial output can stream to the client.
 */

interface AuditEntry {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface AuditBatch {
  entries: AuditEntry[];
  /** Per-id candidate flags from the deterministic detectors. */
  candidates: Map<string, { duplicate?: string; anomaly?: string }>;
}

/** First-of-month key one month after `month` (`YYYY-MM-01`). */
function nextMonthKey(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const next = new Date(y, m, 1); // m is 1-based → Date month index = m = month after
  const ny = next.getFullYear();
  const nm = String(next.getMonth() + 1).padStart(2, '0');
  return `${ny}-${nm}-01`;
}

/**
 * The month's still-unaudited entries plus their candidate flags. Returns
 * `null` when nothing is unaudited (the replay path — no model call). Duplicate
 * detection runs over the whole month (a dup of an already-audited entry still
 * flags the new one); the batch is then scoped to the unaudited set.
 */
export async function getUnauditedBatch(month: string): Promise<AuditBatch | null> {
  const supabase = getSupabase();

  const { data: monthData, error: monthErr } = await supabase
    .from('expenses')
    .select('id, amount, category, description, date, audit_verdict')
    .gte('date', month)
    .lt('date', nextMonthKey(month));
  if (monthErr) return null;

  const monthRows = (monthData ?? []) as Array<AuditEntry & { audit_verdict: string | null }>;
  const unaudited = monthRows.filter((r) => r.audit_verdict == null);
  if (unaudited.length === 0) return null;

  // All-time category history for the medians (full-table read).
  // ponytail: full-table category read; add a date floor if the table grows large.
  const { data: allData, error: allErr } = await supabase
    .from('expenses')
    .select('id, amount, category, date');
  if (allErr) return null;
  const allRows = (allData ?? []) as AuditEntry[];

  const allCandidates = flagCandidates(monthRows, allRows);
  const candidates = new Map(unaudited.map((e) => [e.id, allCandidates.get(e.id) ?? {}]));
  return { entries: unaudited, candidates };
}

/**
 * Audit-task block — facts in, one verdict + one-line note per entry out.
 * The candidate flags are given as the clerk's preliminary findings; the clerk
 * confirms, clears, or raises its own. Guardrails mirror `wrapped.ts`
 * verdictTask: no figure of its own, dry 1962-clerical, one line per entry.
 */
export function auditTask(batch: AuditBatch): string {
  const lines = batch.entries.map((e) => {
    const flags = batch.candidates.get(e.id);
    const found = flags
      ? [flags.duplicate, flags.anomaly].filter(Boolean).join('; ') || 'nothing flagged'
      : 'nothing flagged';
    return `id ${e.id} — ${e.description} (${e.category}), ${formatVND(e.amount)}, ${e.date} — preliminary check: ${found}`;
  });

  return `Task: audit each entry below and stamp it APPROVED or SUSPICIOUS, with a one-line margin note in your hand for every entry.

These are the unaudited entries for the month, already counted. The "preliminary check" is a mechanical pass already run for you — treat it as a finding to weigh, not a verdict. Confirm it, clear a false positive, or raise your own concern.

${lines.join('\n')}

For EACH entry, return its \`id\`, a \`verdict\` (APPROVED or SUSPICIOUS), and a one-line \`note\`. On SUSPICIOUS the note is the reason for the hold; on APPROVED it is the brief reason it passed (what places it within the ordinary — e.g. "routine grocery run", "matches the weekly transit pattern"). The note is the clerk's reasoning on file for every entry; never leave it empty.

Hard rules:
- Every entry carries exactly one note. One line — a short clerical observation, not a sentence of prose.
- SUSPICIOUS only when something genuinely warrants a second look (a likely duplicate, an amount out of pattern for its category). When in doubt, APPROVED — the register is mostly ordinary.
- State NO figure of your own. Do not write any amount, percentage, or count — the page already shows the numbers beside your line. Refer to spending in words ("twice the usual for this category", "matches an entry days earlier"), never in digits.
- Forbidden: superlatives, praise or judgement of the keeper, exclamation, rhetorical questions, encouragement.
- Dry, precise, 1962-clerical. No sign-off line — the note stands on its own.`;
}

/**
 * Persist the streamed verdicts. Per-row updates — ponytail: one CASE
 * statement if a month ever holds thousands of entries. Swallows failures;
 * an un-persisted row simply re-audits on the next view.
 */
export async function persistVerdicts(stamps: AuditStamp[]): Promise<void> {
  const supabase = getSupabase();
  await Promise.all(
    stamps.map((s) =>
      supabase
        .from('expenses')
        .update({ audit_verdict: s.verdict, audit_note: s.note?.trim() ?? null })
        .eq('id', s.id),
    ),
  ).catch(() => {});
}
