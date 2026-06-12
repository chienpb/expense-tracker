'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type ToolUIPart } from 'ai';
import { signOut } from 'next-auth/react';
import { PageTurnLink } from '@/app/_components/page-turn-link';
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Streamdown } from 'streamdown';
import { cjk } from '@streamdown/cjk';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import type { ChatUIMessage } from '@/lib/chat-agent';
import { EraserMarks } from '@/app/_components/paper/EraserMarks';
import { Glyph } from '@/app/_components/paper/Glyph';
import { Stamp } from '@/app/_components/paper/Stamp';
import { tiltFor } from '@/lib/seed-rotation';

type ExecuteSQLUIPart = ToolUIPart<{
  executeSQL: {
    input: { sql: string };
    output: { data?: unknown; error?: string };
  };
}>;

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

const streamdownPlugins = { cjk, code, math, mermaid };

/**
 * `<PaperChat>` — Paper Ledger correspondence surface (Phase 5.3).
 *
 * Rebuilds the chat chrome as entries in a running correspondence
 * book. User messages are penned in Patrick Hand (safe for Vietnamese
 * per §2.3) with a slight seeded tilt; the Ledger-keeper's replies
 * are printed in Crimson and close with `— LK` in Caveat once the
 * ink has dried. Tool calls fold out inline as typewritten receipts
 * clipped into the margin of the reply.
 *
 * Streaming, tool calls, and the `/api/chat` transport are untouched
 * from the Swiss version — only the chrome changes. The Ledger-keeper
 * voice (clerical "— LK" sign-off from the model itself) is a Phase 6
 * concern and is not wired here; we just render what the model emits
 * and append the signature in the UI as a typographic flourish.
 *
 * Layout notes
 *   - The compose slip uses `position: sticky` so it rides the bottom
 *     of the viewport as the correspondence grows downward. The
 *     document scrolls — not a bounded conversation — so the "paper"
 *     read holds.
 *   - `scrollIntoView` fires on every new message id change rather
 *     than every stream token, so streaming doesn't jitter the view.
 *     Users mid-scroll upward aren't yanked back.
 */
export function PaperChat() {
  const { messages, sendMessage, status, stop } = useChat<ChatUIMessage>({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastMessageId = messages.at(-1)?.id;

  useEffect(() => {
    if (!lastMessageId) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lastMessageId]);

  const isBusy = status === 'submitted' || status === 'streaming';

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    if (e.nativeEvent.isComposing) return;
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  }

  return (
    <div className="flex flex-col">
      <NavRow />

      {messages.length === 0 ? (
        <EmptyCorrespondence />
      ) : (
        <ol className="mt-2 space-y-10 pb-8" aria-label="Correspondence">
          {messages.map((message, idx) => {
            const isLast = idx === messages.length - 1;
            return message.role === 'user' ? (
              <UserEntry key={message.id} message={message} />
            ) : (
              <AssistantEntry
                key={message.id}
                message={message}
                streaming={isLast && isBusy}
              />
            );
          })}
        </ol>
      )}

      <div ref={bottomRef} aria-hidden="true" />

      <div className="sticky bottom-4 z-20 mt-4">
        <ComposeSlip
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          onStop={stop}
          status={status as ChatStatus}
        />
      </div>
    </div>
  );
}

/**
 * Typewriter nav row — mirrors the Daybook ← link + sign-out pair on
 * `/dashboard/recurring` so the top-of-page chrome stays
 * consistent across migrated routes.
 */
function NavRow() {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4">
      <PageTurnLink
        href="/dashboard"
        className="paper-focusable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute hover:text-ink"
      >
        &larr; Daybook
      </PageTurnLink>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="paper-focusable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute hover:text-ink"
      >
        Close the book
      </button>
    </div>
  );
}

function EmptyCorrespondence() {
  return (
    <div className="mt-4 flex items-start gap-3 pb-8">
      <Glyph name="pen" size={18} className="mt-[2px] text-pencil-gray" />
      <p className="font-hand-signature text-hand-signature text-ink-faint">
        Nothing on this page yet. Ask the Ledger-keeper below.
      </p>
    </div>
  );
}

/**
 * User entry — Patrick Hand pen-navy, seeded tilt, printed typewriter
 * meta above for the date-stamp feel. The whole block is a single
 * `<li>` so screen readers read "You, <time>, <text>" as one unit.
 */
function UserEntry({ message }: { message: ChatUIMessage }) {
  const text = useMemo(() => collectText(message), [message]);
  const tilt = tiltFor(`${message.id}-user`, 1.1);

  return (
    <li className="space-y-2">
      <EntryHeader who="You" id={message.id} />
      <p
        data-ledger-tilt
        className="max-w-prose whitespace-pre-wrap font-hand text-hand leading-snug text-pen-navy"
        style={{ transform: `rotate(${tilt}deg)`, transformOrigin: 'top left' }}
      >
        {text || <span className="text-ink-faint">…</span>}
      </p>
    </li>
  );
}

/**
 * Assistant entry — Crimson serif body, typewriter meta, typewritten
 * tool receipts inline. The `— LK` signature lands once the reply is
 * no longer streaming (§10 · Ledger-keeper). Caveat is safe here
 * because the signature itself is English-only.
 */
function AssistantEntry({
  message,
  streaming,
}: {
  message: ChatUIMessage;
  streaming: boolean;
}) {
  const textParts = message.parts.filter(
    (p): p is Extract<ChatUIMessage['parts'][number], { type: 'text' }> =>
      p.type === 'text',
  );
  const hasAnyContent = message.parts.length > 0;

  return (
    <li className="space-y-3">
      <EntryHeader who="The Ledger-keeper" id={message.id} pencil />
      {!hasAnyContent && streaming && (
        <EraserMarks showLabel labelText="Writing…" />
      )}
      {message.parts.map((part, i) => {
        const key = `${message.id}-${i}`;
        if (part.type === 'text') {
          return (
            <div
              key={key}
              className="max-w-prose font-serif text-body-l leading-relaxed text-ink [&_code]:font-typewriter [&_code]:text-[0.9em] [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-ink/20 [&_pre]:bg-paper-2 [&_pre]:p-3 [&_pre]:font-typewriter [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5"
            >
              <Streamdown plugins={streamdownPlugins}>{part.text}</Streamdown>
            </div>
          );
        }
        if (part.type === 'tool-executeSQL') {
          return <ToolReceipt key={key} part={part as ExecuteSQLUIPart} />;
        }
        return null;
      })}
      {streaming && textParts.length > 0 && (
        <EraserMarks showLabel labelText="Still writing…" />
      )}
      {!streaming && hasAnyContent && <Signature id={message.id} />}
    </li>
  );
}

/**
 * Shared entry header — typewriter who + seeded clock time. The
 * clock is rendered once at mount and memoised by message id so it
 * stays stable across streaming re-renders; `useMemo` reading `new
 * Date()` is enough because the component remounts per id.
 */
function EntryHeader({
  who,
  pencil = false,
}: {
  who: string;
  /** Present so callers don't have to drop the argument; unused here. */
  id?: string;
  pencil?: boolean;
}) {
  // Fresh at mount. The parent keys each entry on `message.id`, so a new
  // message remounts this component and captures its own arrival time;
  // streaming re-renders keep the first clock value stable.
  // oxlint-disable-next-line eslint-plugin-react-hooks(exhaustive-deps)
  const time = useMemo(() => formatClock(new Date()), []);
  return (
    <div className="flex items-baseline gap-3">
      <span
        className={`font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] ${
          pencil ? 'text-pencil-gray' : 'text-ink-mute'
        }`}
      >
        {who} · {time}
      </span>
    </div>
  );
}

function Signature({ id }: { id: string }) {
  const tilt = tiltFor(`${id}-sig`, 1.4);
  return (
    <p
      data-ledger-tilt
      className="pt-1 font-hand-signature text-hand-signature text-pencil-gray"
      style={{ transform: `rotate(${tilt}deg)` }}
      aria-label="Signed the Ledger-keeper"
    >
      — LK
    </p>
  );
}

/**
 * `<ToolReceipt>` — executeSQL tool part rendered as a typewritten
 * receipt clipped into the margin of the Ledger-keeper's reply.
 *
 * States map to stamps in the corner:
 *   input-streaming / input-available  → EraserMarks (still writing)
 *   output-available                   → navy "Filed" stamp
 *   output-error                       → red "Error" stamp
 *
 * Collapsed by default; errors open automatically so the user doesn't
 * have to hunt for them. Uses `<details>` for keyboard-native
 * accessibility without pulling in a radix primitive.
 */
function ToolReceipt({ part }: { part: ExecuteSQLUIPart }) {
  const state = part.state;
  const isError = state === 'output-error';
  const isRunning = state === 'input-streaming' || state === 'input-available';
  const isDone = state === 'output-available';

  const sql =
    part.input && typeof part.input === 'object' && 'sql' in part.input
      ? String((part.input as { sql?: string }).sql ?? '')
      : '';
  const output = part.output
    ? part.output.error
      ? `Error: ${part.output.error}`
      : formatSQLResult(part.output.data)
    : undefined;
  const errorText = part.errorText;

  return (
    <details
      open={isError}
      className="paper-tool-receipt group my-2 ml-0 max-w-prose border border-ink/30 bg-paper-2"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2">
        <span className="flex items-baseline gap-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
          <span className="text-ink">Receipt</span>
          <span aria-hidden="true">·</span>
          <span>executeSQL</span>
        </span>
        <span className="flex items-center gap-3">
          {isRunning && <EraserMarks label="Running the query" />}
          {isDone && (
            <Stamp
              text="Filed"
              color="navy"
              wear={0.6}
              id={`${sql}-filed`}
              className="text-[9px]"
            />
          )}
          {isError && (
            <Stamp
              text="Error"
              color="red"
              wear={0.7}
              id={`${sql}-err`}
              className="text-[9px]"
            />
          )}
          <Glyph
            name="arrow-up-right"
            size={12}
            className="text-ink-mute transition-transform group-[&[open]]:rotate-90"
          />
        </span>
      </summary>
      <div className="space-y-3 border-t border-ink/20 px-3 py-3">
        {sql && (
          <ReceiptLine label="Query">
            <pre className="whitespace-pre-wrap font-typewriter text-[12px] leading-relaxed text-ink">
              {sql}
            </pre>
          </ReceiptLine>
        )}
        {(output || errorText) && (
          <ReceiptLine label={isError || errorText ? 'Error' : 'Result'}>
            <pre
              className={`whitespace-pre-wrap font-typewriter text-[12px] leading-relaxed tabular-nums ${
                isError || errorText ? 'text-stamp-red' : 'text-ink'
              }`}
            >
              {errorText || output}
            </pre>
          </ReceiptLine>
        )}
      </div>
    </details>
  );
}

function ReceiptLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 font-typewriter text-[9px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
        {label}
      </p>
      {children}
    </div>
  );
}

/**
 * `<ComposeSlip>` — the new-entry surface at the bottom of the page.
 * Pink carbon tint to mirror `/login` and `/dashboard/recurring`
 * new-order slips — the "fill this in and hand it back" form that
 * recurs everywhere in the app.
 */
function ComposeSlip({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  onStop,
  status,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onStop: () => void;
  status: ChatStatus;
}) {
  const busy = status === 'submitted' || status === 'streaming';
  const canSend = value.trim().length > 0 && !busy;

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Write the next entry"
      className="relative border px-4 py-4 sm:px-6 sm:py-5"
      style={{
        backgroundColor:
          'color-mix(in srgb, var(--color-stamp-red) 14%, var(--color-paper))',
        borderColor: 'var(--color-stamp-red)',
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
          Form · New correspondence
        </p>
        {busy && (
          <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            <EraserMarks
              showLabel
              labelText={status === 'submitted' ? 'Dispatching…' : 'Writing…'}
            />
          </span>
        )}
      </div>

      <label htmlFor="chat-compose" className="sr-only">
        Write the next entry
      </label>
      <textarea
        id="chat-compose"
        name="message"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Ask or log…"
        className="paper-focusable mt-3 block field-sizing-content max-h-48 min-h-[2.25rem] w-full resize-none border-0 border-b border-solid border-ink bg-transparent pb-1.5 font-hand text-hand text-pen-navy placeholder:text-ink-faint focus:outline-none"
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
          Enter to send · Shift + Enter for a new line
        </span>
        <div className="flex items-center gap-2">
          {busy && (
            <button
              type="button"
              onClick={onStop}
              className="paper-focusable paper-pressable inline-flex items-center gap-2 border border-stamp-red bg-paper px-3 py-1.5 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-stamp-red hover:bg-paper-2"
            >
              <Glyph name="cross" size={12} />
              <span>Stop</span>
            </button>
          )}
          <button
            type="submit"
            disabled={!canSend}
            className="paper-focusable paper-pressable inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-2 font-stamp text-[12px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Glyph name="pen" size={13} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </form>
  );
}

function collectText(message: ChatUIMessage): string {
  return message.parts
    .filter(
      (p): p is Extract<ChatUIMessage['parts'][number], { type: 'text' }> =>
        p.type === 'text',
    )
    .map((p) => p.text)
    .join('');
}

function formatSQLResult(data: unknown): string {
  if (data == null) return '';
  if (Array.isArray(data)) {
    if (data.length === 0) return '(no rows)';
    return JSON.stringify(data, null, 2);
  }
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function formatClock(d: Date): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return '';
  }
}
