'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

/**
 * `usePageTurn()` — intercepted navigation between the major ledger
 * sections (PAGE_FLIP.md §2 "Integration point", gates per §3).
 *
 * Deliberately weightless: three.js and the orchestrator only load via
 * `import('@/lib/page-flip')` on first hover/focus of a section tab.
 * When any gate fails the click falls through to the plain `<Link>`
 * navigation — the flip is an enhancement, never a dependency.
 */

/** Tab order defines turn direction: higher index = forward = right-to-left. */
const SECTIONS = ['/dashboard', '/dashboard/recurring', '/chat'] as const;

function sectionIndex(path: string | null | undefined): number {
  if (!path) return -1;
  if (path === '/dashboard') return 0;
  if (path.startsWith('/dashboard/recurring')) return 1;
  if (path.startsWith('/chat')) return 2;
  return -1;
}

function gatesPass(): boolean {
  if (typeof window === 'undefined') return false;
  // Reduced motion: system preference OR the /settings override (§3).
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  if (document.documentElement.dataset.reduceMotion === '1') return false;
  // Mobile is a receipt scroll; receipts don't page-turn (§3).
  if (window.innerWidth < 1024) return false;
  return true;
}

export function usePageTurn() {
  const router = useRouter();
  const pathname = usePathname();

  /** True when navigating `pathname → href` should turn the page. */
  const canTurn = useCallback(
    (href: string) => {
      const from = sectionIndex(pathname);
      const to = sectionIndex(href);
      return from >= 0 && to >= 0 && from !== to && gatesPass();
    },
    [pathname],
  );

  /** Hover/focus pre-warm: pulls the lazy chunk + snapshots the page. */
  const prewarmTurn = useCallback(
    (href: string) => {
      if (!canTurn(href)) return;
      import('./index')
        .then((flip) => flip.prewarm(document.body))
        .catch(() => {});
    },
    [canTurn],
  );

  /**
   * Click interception for a section tab/link. Returns without
   * preventing default (plain navigation) whenever a gate fails.
   */
  const handleTurnClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (event.defaultPrevented) return;
      // Modified/middle clicks keep their browser meaning.
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }
      if (!canTurn(href)) return;

      const direction =
        sectionIndex(href) > sectionIndex(pathname) ? 'forward' : 'backward';
      event.preventDefault();
      import('./index')
        .then((flip) =>
          flip.turnPage({
            direction,
            captureEl: document.body,
            navigate: () => router.push(href),
            targetPath: href,
          }),
        )
        .catch(() => {
          // Lazy chunk failed to load — navigation must never break.
          router.push(href);
        });
    },
    [canTurn, pathname, router],
  );

  return { canTurn, prewarmTurn, handleTurnClick };
}

export const PAGE_TURN_SECTIONS = SECTIONS;
