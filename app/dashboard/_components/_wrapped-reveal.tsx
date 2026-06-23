'use client';

import { useEffect, useRef } from 'react';
import { Stamp } from '@/app/_components/paper/Stamp';
import { MonthSlip } from '@/app/_components/paper/MonthSlip';
import type { WrappedBundle } from '@/lib/dashboard/wrapped';

/**
 * `<WrappedReveal>` — the live-seal beat of Monthly Wrapped (spec:
 * work/monthly-wrapped). Plays once, in the seam `_settle-books.tsx` left
 * open between the seal-thump and the page-turn to `/dashboard/year`.
 *
 * The gold "Settled" wax fractures into two halves that part and fall away
 * (clip-path crack + `#stamp-wear`), the slip lifts from under it, the verdict
 * wipes on as ink, the aggregates settle below — then `onDone()` continues the
 * existing flip. One crack, one lift, one verdict, then stop (spec: the
 * fracture is the risk; resist physics/particles/multi-fold).
 *
 * This only mounts on the motion path; `_settle-books.tsx` short-circuits to a
 * plain push under reduced motion, where the `?slip` surface is the read path.
 * The reduced-motion guard here is belt-and-braces for reduce-skew/standalone.
 */

// The crack: a jagged vertical seam down the middle of the seal box. The two
// halves clip to complementary sides and meet along the same zigzag.
const CLIP_LEFT = 'polygon(0 0, 52% 0, 45% 25%, 55% 50%, 44% 75%, 51% 100%, 0 100%)';
const CLIP_RIGHT = 'polygon(52% 0, 100% 0, 100% 100%, 51% 100%, 44% 75%, 55% 50%, 45% 25%)';

function motionReduced(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (document.documentElement.dataset.reduceMotion === '1') return true;
  return false;
}

export function WrappedReveal({
  bundle,
  verdict,
  label,
  onDone,
}: {
  bundle: WrappedBundle;
  verdict: string | null;
  label: string;
  onDone: () => void;
}) {
  const reduced = motionReduced();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The reveal sits at the bottom of a long dashboard, often below the
    // fold — pin the page to its end so the slip rests against the bottom and
    // the fracture isn't missed. Size is fixed up front (MonthSlip reserves
    // the verdict height), so one end-aligned scroll holds steady as it writes.
    ref.current?.scrollIntoView({ block: 'end', behavior: reduced ? 'auto' : 'smooth' });
    // Motion path: the slip is the payoff — let it rest and let the keeper
    // turn the page themselves via the dashboard's "The year" link. Reduced
    // motion skips the ceremony, so auto-advance after a short beat to match.
    if (!reduced) return;
    const t = window.setTimeout(onDone, 1800);
    return () => window.clearTimeout(t);
  }, [onDone, reduced]);

  return (
    <div ref={ref} className="relative flex flex-col items-center gap-4 py-6">
      <div className="paper-slide-in">
        <MonthSlip bundle={bundle} verdict={verdict} label={label} reveal={!reduced} />
      </div>

      {!reduced && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative">
            {/* Right half sits in flow and sizes the box; left half overlays
                it. Identical stamps (rotation 0) so they form one seal before
                the crack parts them. `#stamp-wear` gives the broken-ink edge. */}
            <span
              className="paper-seal-fracture-r inline-flex"
              style={{ clipPath: CLIP_RIGHT, filter: 'url(#stamp-wear)' }}
            >
              <Stamp text="Settled" subtext={label} color="gold" wear={0} rotation={0} />
            </span>
            <span
              className="paper-seal-fracture-l absolute inset-0 inline-flex"
              style={{ clipPath: CLIP_LEFT, filter: 'url(#stamp-wear)' }}
            >
              <Stamp text="Settled" subtext={label} color="gold" wear={0} rotation={0} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
