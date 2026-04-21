import type { Metadata } from 'next';
import { Page } from '@/app/_components/paper/Page';
import { LoginForm } from './_form';

export const metadata: Metadata = {
  title: 'Sign the register · Ledger',
};

/**
 * `/login-paper` — Paper Ledger login surface (Phase 5.1).
 *
 * Lives as a side route alongside the Swiss `/login` so parity can be
 * verified visually before the `NEXT_PUBLIC_PAPER_UI` flag flips. Once
 * `/login` delegates here behind the flag, this route stays reachable
 * in dev as the visual-regression entry point; remove in Phase 9.
 *
 * Middleware (`middleware.ts`) whitelists this path as public, mirroring
 * `/login` — otherwise a logged-out user would be redirected back to
 * `/login` before ever seeing the paper version.
 */
export default function LoginPaperPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Page
        formCode="CHN-LOG"
        pageNumber="1/1"
        tape
        title="Daily Register"
        headerMeta={todayStamp()}
        className="flex-1"
      >
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-8">
          <LoginForm />
        </div>
      </Page>
    </div>
  );
}

function todayStamp(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}
