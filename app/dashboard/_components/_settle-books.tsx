'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stamp } from '@/app/_components/paper/Stamp';
import { Glyph } from '@/app/_components/paper/Glyph';
import { WrappedReveal } from './_wrapped-reveal';
import { goToYear as goToYearShared } from '@/lib/go-to-year';
import type { WrappedBundle } from '@/lib/dashboard/wrapped';

/**
 * `<SettleBooks>` — the headline "Closing the Books" ceremony
 * (spec: closing-the-books, AC#2 · AC#7).
 *
 * Activate → a pen draws a rule-off under the register → a gold wax seal
 * thumps down → the page flips to the year calendar with the month
 * sealed. Reduce-motion flattens the whole thing: POST, then a plain
 * push to a static sealed state.
 *
 * One endpoint, two surfaces: this cinematic runs for the auto-surfaced
 * prior month on the dashboard; re-settling a stale month happens
 * in-place on a calendar cell (`<MonthCell>`). Both call `POST /api/seal`.
 */
type Phase = 'idle' | 'ruling' | 'sealing' | 'wrapped';

/** `POST /api/seal`'s response, consumed by the Wrapped reveal. */
type SealResult = {
  month: string;
  sealed_at: string;
  wrapped_text: string | null;
  bundle: WrappedBundle;
};

const RULE_MS = 360; // pen draws the rule-off (matches .paper-rule-off)
const SEAL_MS = 460; // thump (180ms) + a beat to register before the flip

function motionReduced(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (document.documentElement.dataset.reduceMotion === '1') return true;
  return false;
}

export function SettleBooks({ month, label }: { month: string; label: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [wrapped, setWrapped] = useState<SealResult | null>(null);

  const postSeal = useCallback(async (): Promise<SealResult | null> => {
    return fetch('/api/seal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month }),
    })
      .then((r) => (r.ok ? (r.json() as Promise<SealResult>) : null))
      .catch(() => null);
  }, [month]);

  const goToYear = useCallback(() => goToYearShared(router), [router]);

  const settle = useCallback(async () => {
    if (phase !== 'idle') return;

    // Reduce-motion: skip the ceremony entirely → static sealed state.
    if (motionReduced()) {
      await postSeal();
      router.push('/dashboard/year');
      return;
    }

    setPhase('ruling');
    window.setTimeout(() => {
      setPhase('sealing');
      window.setTimeout(async () => {
        const result = await postSeal();
        // seam: Monthly Wrapped plays here, between the seal-thump and the
        // flip to the year calendar — a clean insert, replacing neither. If
        // the seal returned its bundle, the wax fractures and the slip is
        // revealed; `onDone` then continues the flip. No bundle (a seal
        // hiccup) → flip straight through.
        if (result?.bundle) {
          setWrapped(result);
          setPhase('wrapped');
        } else {
          goToYear();
        }
      }, SEAL_MS);
    }, RULE_MS);
  }, [phase, postSeal, goToYear, router]);

  return (
    <div
      data-ledger-tilt
      className="relative flex flex-col gap-3"
      style={{ transform: 'rotate(-0.4deg)' }}
    >
      {/* The rule-off the clerk draws under the last entry. */}
      {phase !== 'idle' && (
        <svg
          aria-hidden="true"
          focusable="false"
          width="100%"
          height="10"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          className="block"
        >
          <line
            x1="0.5"
            y1="5"
            x2="99.5"
            y2="5"
            pathLength={1}
            stroke="var(--color-ink)"
            strokeWidth={1.6}
            strokeLinecap="round"
            className="paper-rule-off"
            style={{ ['--rule-length' as string]: 1, filter: 'url(#hand-wobble)' }}
          />
        </svg>
      )}

      {phase === 'idle' ? (
        <button
          type="button"
          onClick={settle}
          className="paper-focusable paper-pressable inline-flex items-center gap-2 self-start border-2 border-seal-gold px-4 py-2 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-seal-gold transition-colors hover:bg-paper-2"
        >
          <Glyph name="pen" size={14} />
          <span>Settle the books — {label}</span>
        </button>
      ) : phase === 'wrapped' && wrapped ? (
        <div aria-live="polite">
          <WrappedReveal
            bundle={wrapped.bundle}
            verdict={wrapped.wrapped_text}
            label={label}
            onDone={goToYear}
          />
        </div>
      ) : (
        <div className="relative flex h-12 items-center" aria-live="polite">
          {phase === 'sealing' && (
            <span className="paper-stamp-thump inline-flex">
              <Stamp text="Settled" subtext={label} color="gold" wear={0} />
            </span>
          )}
          <span className="sr-only">Settling the books for {label}.</span>
        </div>
      )}
    </div>
  );
}
