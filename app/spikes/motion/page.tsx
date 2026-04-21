'use client';

import { useEffect, useState } from 'react';
import { tiltFor } from '@/lib/seed-rotation';

const ENTRIES = [
  { id: 'm-1', text: 'Phở bò — 45.000 ₫' },
  { id: 'm-2', text: 'Cà phê sữa đá — 25.000 ₫' },
  { id: 'm-3', text: 'Bún chả Đắc Kim — 60.000 ₫' },
  { id: 'm-4', text: 'Grab về nhà — 38.000 ₫' },
  { id: 'm-5', text: 'Bánh mì thịt nguội — 30.000 ₫' },
];

export default function MotionSpike() {
  const [reduceSkew, setReduceSkew] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [systemReducesMotion, setSystemReducesMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReducesMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setSystemReducesMotion(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (reduceSkew) root.setAttribute('data-reduce-skew', '1');
    else root.removeAttribute('data-reduce-skew');
    if (reduceMotion) root.setAttribute('data-reduce-motion', '1');
    else root.removeAttribute('data-reduce-motion');
    return () => {
      root.removeAttribute('data-reduce-skew');
      root.removeAttribute('data-reduce-motion');
    };
  }, [reduceSkew, reduceMotion]);

  const effectiveReduceMotion = reduceMotion || systemReducesMotion;

  return (
    <>
      <style>{`
        /* Every tilted element opts in by using var(--tilt). */
        .paper-tilted { transform: rotate(var(--tilt, 0deg)); }
        html[data-reduce-skew="1"] .paper-tilted { transform: rotate(0deg) !important; }

        @keyframes paper-eraser-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        .paper-eraser-pulse {
          animation: paper-eraser-pulse 1s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .paper-eraser-pulse { animation: none; opacity: 0.5; }
        }
        html[data-reduce-motion="1"] .paper-eraser-pulse { animation: none; opacity: 0.5; }

        @keyframes paper-stamp-thump {
          0% { transform: scale(1.4) rotate(-6deg); }
          100% { transform: scale(1) rotate(-6deg); }
        }
        .paper-stamp-thump {
          animation: paper-stamp-thump 60ms cubic-bezier(0.2, 0.0, 0, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .paper-stamp-thump { animation: none; transform: scale(1) rotate(0deg); }
        }
        html[data-reduce-motion="1"] .paper-stamp-thump {
          animation: none; transform: scale(1) rotate(0deg);
        }
      `}</style>

      <div className="mx-auto max-w-4xl">
        <header className="mb-6 font-serif">
          <h1 className="text-3xl font-bold">S6 · Reduce motion / reduce skew</h1>
          <p className="mt-2 text-[15px] leading-[1.55] text-[#8a7a5e]">
            Two axes: system <code className="font-mono text-[13px]">prefers-reduced-motion</code>{' '}
            (OS-level), and user-override{' '}
            <code className="font-mono text-[13px]">data-reduce-skew</code> +{' '}
            <code className="font-mono text-[13px]">data-reduce-motion</code> on{' '}
            <code className="font-mono text-[13px]">&lt;html&gt;</code>. Either one collapses skew to
            0° and disables filter-based animations.
          </p>
        </header>

        <section className="mb-6 rounded-sm border border-[#2c2418]/30 bg-white/60 p-4">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em]">Controls</div>
          <div className="flex flex-wrap gap-4 font-serif text-[14px]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reduceSkew}
                onChange={(e) => setReduceSkew(e.target.checked)}
              />
              User override: reduce skew
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
              />
              User override: reduce motion
            </label>
            <div className="flex items-center gap-2 text-[#8a7a5e]">
              System prefers-reduced-motion:{' '}
              <code className="font-mono">{String(systemReducesMotion)}</code>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em]">
            Tilted rows — should collapse to 0° when reduce-skew active
          </div>
          <div className="space-y-4 bg-[#f6efe0] p-6">
            {ENTRIES.map((entry) => {
              const deg = tiltFor(entry.id);
              return (
                <div
                  key={entry.id}
                  className="paper-tilted flex items-baseline justify-between"
                  style={{ ['--tilt' as string]: `${deg}deg` }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-hand), cursive',
                      fontSize: 22,
                      color: '#1f3a5f',
                    }}
                  >
                    {entry.text}
                  </span>
                  <span className="font-mono text-[11px] text-[#8a7a5e]">
                    seed tilt: {deg}° · rendered: {reduceSkew ? '0°' : `${deg}°`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em]">
            Eraser-pulse (loading state) — should freeze when reduce-motion active
          </div>
          <div className="flex items-center gap-4 bg-[#f6efe0] p-6">
            <div
              className="paper-eraser-pulse"
              style={{
                width: 120,
                height: 24,
                background: '#d89090',
                borderRadius: 4,
              }}
            />
            <span className="font-serif text-[14px] italic text-[#8a7a5e]">
              {effectiveReduceMotion ? 'frozen (reduce-motion)' : 'pulsing (1s ease-in-out)'}
            </span>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em]">
            Stamp thump — should land instantly (no animation) when reduce-motion active
          </div>
          <div className="flex gap-4 bg-[#f6efe0] p-6">
            <button
              onClick={(e) => {
                const stamp = e.currentTarget.nextElementSibling as HTMLElement;
                stamp.classList.remove('paper-stamp-thump');
                void stamp.offsetWidth;
                stamp.classList.add('paper-stamp-thump');
              }}
              className="border border-[#2c2418] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
            >
              re-stamp
            </button>
            <div
              className="paper-stamp-thump inline-block border-2 border-[#b02a2a] px-3 py-1"
              style={{
                fontFamily: 'var(--font-stamp), sans-serif',
                color: '#b02a2a',
                letterSpacing: '0.15em',
                fontSize: 14,
              }}
            >
              RECORDED
            </div>
          </div>
        </section>

        <section className="border-t-2 border-[#2c2418] pt-6 font-serif">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em]">Verdict checklist</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-[15px]">
            <li>Checking &quot;reduce skew&quot; flattens every tilted row to 0° immediately.</li>
            <li>
              Checking &quot;reduce motion&quot; freezes the eraser pulse and removes the stamp-thump
              animation.
            </li>
            <li>
              Enabling <em>System Preferences → Accessibility → Display → Reduce motion</em> on
              macOS does the same thing without the user override.
            </li>
            <li>
              Decision for Phase 1: store the two user-overrides in a settings cookie and write them
              to <code className="font-mono text-[13px]">&lt;html&gt;</code> from the server.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
