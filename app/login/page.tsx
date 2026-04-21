import type { Metadata } from 'next';
import { Page } from '@/app/_components/paper/Page';
import { LoginForm } from './_form';

export const metadata: Metadata = {
  title: 'Sign the register · Ledger',
};

export default function LoginPage() {
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
