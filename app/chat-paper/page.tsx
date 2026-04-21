import type { Metadata } from 'next';
import { Page } from '@/app/_components/paper/Page';
import { PaperChat } from './_chat';

export const metadata: Metadata = {
  title: 'Correspondence · Ledger',
};

/**
 * `/chat-paper` — Paper Ledger chat surface (Phase 5.3).
 *
 * Parity route alongside `/chat` so the Swiss and Paper chromes can
 * be compared visually until the `NEXT_PUBLIC_PAPER_UI` flag flips.
 * Per the roadmap, Phase 5.3 rebuilds *chrome only* — streaming, tool
 * calls, and `useChat` wiring route through `/api/chat` exactly as
 * they did before. The voice pass (Ledger-keeper persona, `— LK`
 * system prompt) is Phase 6 work; this phase just lets the user
 * messages arrive in Patrick Hand and the replies land in Crimson.
 *
 * Middleware does not whitelist this path — chat requires auth on
 * either chrome. Dashboard's redirect-to-login flow already covers it.
 */
export default function ChatPaperPage() {
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
