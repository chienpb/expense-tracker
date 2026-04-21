import type { Metadata } from 'next';
import { Page } from '@/app/_components/paper/Page';
import { PaperChat } from './_chat';

export const metadata: Metadata = {
  title: 'Correspondence · Ledger',
};

/**
 * `/chat` — Paper Ledger correspondence surface. Chrome only — streaming,
 * tool calls, and `useChat` wiring route through `/api/chat` unchanged.
 * The Ledger-keeper voice pass (`— LK` system prompt) is Phase 6 work.
 */
export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Page
        formCode="CHN-CHAT"
        pageNumber="∞"
        tape
        title="Correspondence"
        headerMeta={todayStamp()}
        className="flex-1"
      >
        <PaperChat />
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
