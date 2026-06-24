'use client';

import { useEffect, useState } from 'react';
import type { Expense } from '@/lib/dashboard/queries';

/**
 * `<Loupe>` — the resting brass magnifying glass in the ledger margin
 * (the-loupe spec). Drawn-on-the-page `seal-gold` glyph, no drop shadow,
 * not a floating chip (§0.5). Clicking it picks up the loupe: a WebGL
 * lens (lazy-loaded) attaches to the cursor and reveals each row's
 * provenance fine-print. Click-down or Esc sets it back.
 *
 * Desktop fine-pointer + WebGL only — on touch, no-WebGL, or reduce-motion
 * the glyph never renders and the page behaves exactly as today (reusing
 * the page-turn's `<1024px` + reduce-motion gate, plus `pointer:fine` and
 * a WebGL probe). At rest nothing is imported or captured — zero cost.
 */
export function Loupe({ expenses }: { expenses: Expense[] }) {
  const [enabled, setEnabled] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.documentElement.dataset.reduceMotion === '1') return;
    if (window.innerWidth < 1024) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl2') && !probe.getContext('webgl')) return;
    setEnabled(true);
  }, []);

  if (!enabled) return null;

  function handlePickUp() {
    if (held) return;
    setHeld(true);
    import('@/lib/loupe')
      .then((m) =>
        m.pickUp({
          captureEl: document.body,
          root: document.body,
          expenses,
          onDown: () => setHeld(false),
        }),
      )
      .catch(() => setHeld(false));
  }

  return (
    <button
      type="button"
      aria-hidden="true"
      tabIndex={-1}
      onClick={handlePickUp}
      title="Read the fine print"
      className="absolute -top-1 left-0 -translate-x-[calc(100%+0.5rem)] hidden text-seal-gold transition-opacity lg:block"
      style={{ opacity: held ? 0.3 : 1 }}
    >
      <LoupeGlyph />
    </button>
  );
}

/** Hand-drawn brass loupe — thin strokes, no fill, no shadow. */
function LoupeGlyph() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="6" strokeWidth="0.6" opacity="0.5" />
      <line x1="17.7" y1="17.7" x2="26" y2="26" strokeWidth="2" />
    </svg>
  );
}
