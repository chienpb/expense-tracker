'use client';

import { useRouter } from 'next/navigation';
import { goToYear } from '@/lib/go-to-year';

/** The dashboard's single "to the year" control — flips the page (or pushes). */
export function YearLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <button type="button" onClick={() => goToYear(router)} className={className}>
      {children}
    </button>
  );
}
