import type { Metadata } from 'next';
import { PAPER_UI_ENABLED } from '@/lib/paper-ui-flag';
import { Page } from '@/app/_components/paper/Page';
import { LoginForm as PaperLoginForm } from '@/app/login-paper/_form';
import { SwissLoginForm } from './_swiss';

export const metadata: Metadata = {
  title: PAPER_UI_ENABLED ? 'Sign the register · Ledger' : 'Sign in · Ledger',
};

/**
 * `/login` — delegates to Paper Ledger or Swiss based on the Phase 5
 * feature flag. The Swiss form is preserved verbatim (just extracted
 * into `_swiss.tsx`) so rolling back is a one-env-var change, not a
 * git revert.
 *
 * Once Phase 9 deletes Swiss, drop `_swiss.tsx` + the branch here and
 * inline the Paper composition from `/login-paper`.
 */
export default function LoginPage() {
  if (!PAPER_UI_ENABLED) {
    return <SwissLoginForm />;
  }

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
          <PaperLoginForm />
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
