import type { Metadata } from 'next';
import { PAPER_UI_ENABLED } from '@/lib/paper-ui-flag';
import ChatPaperPage from '@/app/chat-paper/page';
import { SwissChatPage } from './_swiss';

export const metadata: Metadata = {
  title: PAPER_UI_ENABLED ? 'Correspondence · Ledger' : 'Chat · Expense Tracker',
};

/**
 * `/chat` — Phase 5.3 flag gate. `NEXT_PUBLIC_PAPER_UI=1` renders the
 * Paper Ledger composition from `/chat-paper`; anything else keeps
 * the Swiss fallback live. Rollback is a one-env-var change. Phase 9
 * collapses this file into the Paper branch.
 */
export default function ChatPage() {
  if (!PAPER_UI_ENABLED) {
    return <SwissChatPage />;
  }
  return <ChatPaperPage />;
}
