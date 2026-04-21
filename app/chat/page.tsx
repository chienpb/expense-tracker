import type { Metadata } from 'next';
import { Page } from '@/app/_components/paper/Page';
import { formatPrintedDate } from '@/lib/paper-format';
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
        headerMeta={formatPrintedDate(new Date())}
        className="flex-1"
      >
        <PaperChat />
      </Page>
    </div>
  );
}
