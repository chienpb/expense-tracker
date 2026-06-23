// @ts-check
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

/**
 * Rubber-Stamp Auditor — the deterministic side (spec: work/rubber-stamp-auditor).
 *
 * Pure JS, no DB, no AI: given a month's entries (plus all-time category
 * history for the medians), it produces *candidate* flags. The AI judge in
 * `audit.ts` takes these as facts and may clear a false positive or raise its
 * own. Lives as `.mjs` so the assert self-check runs with zero new deps:
 * `node lib/dashboard/detectors.mjs` (npm script `test:audit`).
 *
 * Amounts are VND integers throughout — the median rounds with `Math.round`.
 */

/**
 * @typedef {{ id: string, amount: number, category: string, date: string }} Entry
 */

/**
 * Whole-day distance between two `YYYY-MM-DD` dates.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function dayGap(a, b) {
  const ms = Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`);
  return Math.abs(Math.round(ms / 86_400_000));
}

/**
 * Likely duplicates: an entry shares `category` + `amount` with another
 * entry within ±`windowDays` (self excluded). Returns the flagged ids.
 * @param {Entry[]} entries
 * @param {number} [windowDays]
 * @returns {Set<string>}
 */
export function findDuplicates(entries, windowDays = 3) {
  const flagged = new Set();
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      if (
        a.category === b.category &&
        a.amount === b.amount &&
        dayGap(a.date, b.date) <= windowDays
      ) {
        flagged.add(a.id);
        flagged.add(b.id);
      }
    }
  }
  return flagged;
}

/**
 * All-time median spend per category, as an integer (VND invariant).
 * @param {Entry[]} allEntries
 * @returns {Map<string, { median: number, count: number }>}
 */
export function computeMedians(allEntries) {
  /** @type {Map<string, number[]>} */
  const byCat = new Map();
  for (const e of allEntries) {
    const list = byCat.get(e.category) ?? [];
    list.push(e.amount);
    byCat.set(e.category, list);
  }
  const out = new Map();
  for (const [cat, amounts] of byCat) {
    amounts.sort((x, y) => x - y);
    const mid = Math.floor(amounts.length / 2);
    const median =
      amounts.length % 2 === 0
        ? Math.round((amounts[mid - 1] + amounts[mid]) / 2)
        : amounts[mid];
    out.set(cat, { median, count: amounts.length });
  }
  return out;
}

/**
 * Amount anomalies: `amount > k × category median`, but only for categories
 * with ≥`minSamples` history (a thin category can't set a norm). Returns the
 * flagged ids.
 * @param {Entry[]} entries
 * @param {Map<string, { median: number, count: number }>} medians
 * @param {number} [k]
 * @param {number} [minSamples]
 * @returns {Set<string>}
 */
export function findAnomalies(entries, medians, k = 3, minSamples = 4) {
  const flagged = new Set();
  for (const e of entries) {
    const stat = medians.get(e.category);
    if (!stat || stat.count < minSamples || stat.median <= 0) continue;
    if (e.amount > k * stat.median) flagged.add(e.id);
  }
  return flagged;
}

/**
 * Run both detectors and fold them into a per-id reason map. Only flagged
 * ids appear; each carries a human-readable reason the AI judge reads as fact.
 * @param {Entry[]} monthEntries  the (unaudited) entries to flag
 * @param {Entry[]} allEntries    all-time history for the medians
 * @param {{ windowDays?: number, k?: number, minSamples?: number }} [opts]
 * @returns {Map<string, { duplicate?: string, anomaly?: string }>}
 */
export function flagCandidates(monthEntries, allEntries, opts = {}) {
  const { windowDays = 3, k = 3, minSamples = 4 } = opts;
  const dups = findDuplicates(monthEntries, windowDays);
  const medians = computeMedians(allEntries);
  const anomalies = findAnomalies(monthEntries, medians, k, minSamples);

  const out = new Map();
  for (const e of monthEntries) {
    /** @type {{ duplicate?: string, anomaly?: string }} */
    const reasons = {};
    if (dups.has(e.id)) {
      reasons.duplicate = `same category and amount as another entry within ${windowDays} days`;
    }
    if (anomalies.has(e.id)) {
      const stat = medians.get(e.category);
      reasons.anomaly = `more than ${k}× the usual ${e.category} entry (category median over ${stat?.count ?? 0} entries)`;
    }
    if (reasons.duplicate || reasons.anomaly) out.set(e.id, reasons);
  }
  return out;
}

/** Assert-based self-check — `node lib/dashboard/detectors.mjs`. */
function demo() {
  // A true duplicate pair (same category+amount, 2 days apart) flags both.
  const dupPair = [
    { id: 'a', amount: 50_000, category: 'coffee', date: '2026-06-01' },
    { id: 'b', amount: 50_000, category: 'coffee', date: '2026-06-03' },
    { id: 'c', amount: 50_000, category: 'coffee', date: '2026-06-20' }, // out of window
  ];
  const dups = findDuplicates(dupPair, 3);
  assert(dups.has('a') && dups.has('b'), 'dup pair within window flags both');
  assert(!dups.has('c'), 'out-of-window same amount does not flag');

  // Within-norm entry does not flag; a 3×+ outlier above a ≥4-sample median does.
  const history = [
    { id: 'h1', amount: 100_000, category: 'food', date: '2026-05-01' },
    { id: 'h2', amount: 120_000, category: 'food', date: '2026-05-02' },
    { id: 'h3', amount: 90_000, category: 'food', date: '2026-05-03' },
    { id: 'h4', amount: 110_000, category: 'food', date: '2026-05-04' },
  ];
  const medians = computeMedians(history);
  assert.equal(medians.get('food')?.median, 105_000, 'even-count median rounds to integer');

  const probe = [
    { id: 'normal', amount: 130_000, category: 'food', date: '2026-06-01' },
    { id: 'huge', amount: 400_000, category: 'food', date: '2026-06-02' }, // > 3× 105k
  ];
  const anomalies = findAnomalies(probe, medians, 3, 4);
  assert(!anomalies.has('normal'), 'within-norm entry does not flag');
  assert(anomalies.has('huge'), 'entry above 3× a ≥4-sample median flags');

  // A thin category (one historical sample) can't set a norm → no anomaly.
  const thinMedians = computeMedians([
    { id: 't1', amount: 10_000, category: 'rare', date: '2026-05-01' },
  ]);
  const thinProbe = [{ id: 'outlier', amount: 999_000, category: 'rare', date: '2026-06-01' }];
  assert(
    !findAnomalies(thinProbe, thinMedians, 3, 4).has('outlier'),
    'thin-category outlier does not flag',
  );

  console.log('detectors.mjs — all assertions passed');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) demo();
