'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stamp } from '@/app/_components/paper/Stamp';
import type { MonthStatus } from '@/lib/dashboard/sealing';

/**
 * `<MonthCell>` — one month on the year calendar (spec: closing-the-books,
 * AC#5 · AC#6). Pure read-render for sealed / future / current cells;
 * past-open and reopened cells get an in-place re-settle: `POST /api/seal`,
 * the gold seal thumps on the cell, then `router.refresh()` re-reads the
 * status from the DB. No flip — we're already on the calendar.
 *
 * Reduce-motion needs no JS branch here: `.paper-stamp-thump` is disabled
 * under reduced motion by the global CSS, so the cell just snaps sealed.
 */
export function MonthCell({
  month,
  label,
  status,
  sealedLabel,
  interactive,
  isCurrent,
}: {
  month: string;
  label: string;
  status: MonthStatus;
  /** Printed `sealed_at` date, only for sealed/reopened cells. */
  sealedLabel?: string;
  interactive: boolean;
  isCurrent: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [thump, setThump] = useState(false);

  const settle = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    await fetch('/api/seal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month }),
    }).catch(() => {});
    setThump(true);
    window.setTimeout(() => router.refresh(), 600);
  }, [busy, month, router]);

  const base =
    'relative flex min-h-[7.5rem] flex-col justify-between border border-ink/30 px-4 py-3';

  // Sealed (or freshly re-settled): clean gold wax seal + the date.
  if (status === 'sealed' || thump) {
    return (
      <div className={base} data-ledger-tilt>
        <MonthName label={label} />
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className={thump ? 'paper-stamp-thump inline-flex' : 'inline-flex'}>
            <Stamp text="Settled" color="gold" wear={0} id={`seal-${month}`} />
          </span>
          {sealedLabel && (
            <span className="font-typewriter text-[9px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
              {sealedLabel}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Reopened: the books were settled, then reopened. The old gold seal
  // stays visible (§0.3 — corrections are never erased) but is struck
  // through with a red double-rule cancellation. Re-settling re-stamps it.
  if (status === 'reopened') {
    return (
      <button
        type="button"
        onClick={settle}
        disabled={busy}
        className={`${base} paper-focusable paper-pressable text-left hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <MonthName label={label} />
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="relative inline-flex opacity-80">
            <Stamp text="Settled" color="gold" wear={0.35} id={`seal-${month}`} />
            <Cancellation />
          </span>
          <span className="font-hand text-[13px] text-stamp-red">
            reopened · re-settle ▸
          </span>
        </div>
      </button>
    );
  }

  // Open + past: the affordance to settle this month in place.
  if (status === 'open' && interactive) {
    return (
      <button
        type="button"
        onClick={settle}
        disabled={busy}
        className={`${base} paper-focusable paper-pressable text-left hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <MonthName label={label} />
        <span className="mt-2 self-start border-2 border-seal-gold px-2.5 py-1 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-seal-gold">
          {busy ? 'Settling…' : 'Settle ▸'}
        </span>
      </button>
    );
  }

  // Open + current (in progress) or future: plain, no affordance.
  return (
    <div className={base}>
      <MonthName label={label} faint={status === 'future'} />
      <span className="mt-2 font-hand text-[13px] text-ink-faint">
        {isCurrent ? 'in progress' : status === 'future' ? '' : 'open'}
      </span>
    </div>
  );
}

function MonthName({ label, faint }: { label: string; faint?: boolean }) {
  return (
    <span
      className={`font-serif text-body font-semibold ${faint ? 'text-ink-faint' : 'text-ink'}`}
    >
      {label}
    </span>
  );
}

/**
 * The accountant's cancellation: two parallel red rules struck diagonally
 * across a seal to void it (§0.3 — corrections are visible, never erased).
 * Hand-wobbled so the rules read as drawn by a pen, not printed.
 */
function Cancellation() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
    >
      <g
        fill="none"
        stroke="var(--color-stamp-red)"
        strokeLinecap="round"
        style={{ filter: 'url(#hand-wobble)' }}
      >
        {/* A fast pen strike: one confident bold pass and a lighter retrace,
            each bowed, neither parallel, both overshooting the edges the way
            a hand never stops square on the box. */}
        <path d="M -12 40 C 24 31, 70 15, 107 4" strokeWidth={2} />
        <path d="M -10 44 C 30 40, 74 22, 105 14" strokeWidth={1.2} />
      </g>
    </svg>
  );
}
