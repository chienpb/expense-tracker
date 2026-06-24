import type { ReactNode } from 'react';

/**
 * `<Parchment>` — Treasure Parchment surface (Trips Phase 1, direction B).
 *
 * A Phase-1-local tan field; NOT the ruled ink-on-cream `<Page>`. It paints
 * the aged-tan ground and inherits the five Paper Ledger fonts already on
 * `<html>` — no global token change (DECISION_LOG 2026-06-24). Straight edges,
 * no drop shadows, per the design system.
 */
export function Parchment({
  title,
  subtitle,
  action,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#d8c096] px-4 py-8 sm:px-8 sm:py-12">
      <main className="mx-auto max-w-5xl border-2 border-[#7a5c33] bg-[#e6d2a4] px-5 py-8 sm:px-10 sm:py-12">
        <header className="mb-8 flex flex-col gap-3 border-b-2 border-[#7a5c33] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-bold leading-[1.05] text-[#3a2a14]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#7a5c33]">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </header>
        {children}
      </main>
    </div>
  );
}
