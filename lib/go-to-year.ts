import type { useRouter } from 'next/navigation';

type Router = ReturnType<typeof useRouter>;

function motionReduced(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (document.documentElement.dataset.reduceMotion === '1') return true;
  return false;
}

/**
 * Navigate to the year calendar. On a desk-sized viewport with motion on, the
 * page-turn rig flips there (§3, PAGE_FLIP); otherwise a plain push. Shared by
 * the dashboard footer link and the Settle ceremony so there's one year-nav
 * behaviour, not two.
 */
export function goToYear(router: Router): void {
  if (!motionReduced() && window.innerWidth >= 1024) {
    import('@/lib/page-flip')
      .then((flip) =>
        flip.turnPage({
          direction: 'forward',
          captureEl: document.body,
          navigate: () => router.push('/dashboard/year'),
          targetPath: '/dashboard/year',
        }),
      )
      .catch(() => router.push('/dashboard/year'));
  } else {
    router.push('/dashboard/year');
  }
}
