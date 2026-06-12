'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { usePageTurn } from '@/lib/page-flip/use-page-turn';

/**
 * `<PageTurnLink>` — a `next/link` whose navigation turns the page when
 * it points at another major ledger section (PAGE_FLIP.md §2). Used by
 * the masthead tabs and the "← Daybook" back-links on Standing Orders
 * and Correspondence. Outside the section set, or when any §3 gate
 * fails, it behaves exactly like a plain `<Link>`.
 */
export function PageTurnLink({
  href,
  onClick,
  onMouseEnter,
  onFocus,
  ...rest
}: ComponentProps<typeof Link> & { href: string }) {
  const { prewarmTurn, handleTurnClick } = usePageTurn();

  return (
    <Link
      href={href}
      onMouseEnter={(e) => {
        prewarmTurn(href);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        prewarmTurn(href);
        onFocus?.(e);
      }}
      onClick={(e) => {
        onClick?.(e);
        handleTurnClick(e, href);
      }}
      {...rest}
    />
  );
}
