'use client';

import { useState } from 'react';
import { Page } from '@/app/_components/paper/Page';
import { Stamp } from '@/app/_components/paper/Stamp';
import { MarginNote } from '@/app/_components/paper/MarginNote';
import { Glyph } from '@/app/_components/paper/Glyph';
import { TornCorner } from '@/app/_components/paper/TornCorner';
import { TallyMarks } from '@/app/_components/paper/TallyMarks';
import { EraserMarks } from '@/app/_components/paper/EraserMarks';
import { LedgerTable, type LedgerRow } from '@/app/_components/paper/LedgerTable';
import { PaperClip } from '@/app/_components/paper/PaperClip';
import { HandDrawnChart } from '@/app/_components/paper/HandDrawnChart';
import { tiltFor } from '@/lib/seed-rotation';
import { formatVND, formatVNDShort } from '@/lib/dashboard/utils';
import { formatPrintedDate, formatPrintedTime } from '@/lib/paper-format';
import { PhaseTitle, Sample, SectionTitle, ThemeFork } from './_parts';

/**
 * Phase 5 — page migration deck. Starts with `/login`; adds one section
 * per route as the migration lands.
 *
 * The login sample is static: it mirrors the live `/login-paper` chrome
 * without running `signIn()`, and includes a state switcher so the
 * `idle` / `checking` / `recorded` / `rejected` states can be visually
 * regressed side-by-side on both themes.
 */
export function PhaseFive() {
  return (
    <>
      <PhaseTitle
        phase="Phase 5 · In progress"
        title="Page migration"
        description={
          <>
            Each migrated page ships behind{' '}
            <code className="font-typewriter text-[13px]">NEXT_PUBLIC_PAPER_UI=1</code>{' '}
            and keeps a side route (e.g.{' '}
            <code className="font-typewriter text-[13px]">/login-paper</code>) for
            parity review. Dev-only flag flip — restart the server to pick it up.
          </>
        }
      />

      <SectionTitle id="login" number="§5.1">
        /login
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Entry pass on pink carbon paper. Labels are{' '}
        <em>Name</em> / <em>Seal</em> in the Ledger-keeper voice; the stamp
        thumps on submit and the page navigates once the ink has time to
        dry (700 ms). On failure, a red REJECTED stamp lands and a
        stamp-red margin note explains.
      </p>
      <ThemeFork id="login-showcase">
        <LoginStates />
      </ThemeFork>

      <SectionTitle id="recurring" number="§5.2">
        /dashboard/recurring
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Standing orders — the things that come around on rotation. Active
        orders sit on the ruled register with a navy{' '}
        <strong>ACTIVE</strong> stamp; paused orders are pulled out into a
        set-aside stack, each on a small receipt with a torn corner and a
        red <strong>PAUSED</strong> stamp (§4.7). New orders are filed on
        the same pink carbon slip as <code className="font-typewriter text-[13px]">/login</code>,
        so the official-form feel carries across the app.
      </p>
      <ThemeFork id="recurring-showcase">
        <RecurringStates />
      </ThemeFork>

      <SectionTitle id="chat" number="§5.3">
        /chat
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Correspondence with the Ledger-keeper. The user writes in Patrick
        Hand pen-navy (safe for Vietnamese); the Ledger-keeper replies in
        printed Crimson and signs off with <em>— LK</em> in Caveat once
        the ink has dried. Tool calls fold out as typewritten receipts
        clipped into the margin of the reply. The compose slip is the
        same pink carbon form that stamps entries on <code className="font-typewriter text-[13px]">/login</code>{' '}
        and <code className="font-typewriter text-[13px]">/dashboard/recurring</code>.
      </p>
      <ThemeFork id="chat-showcase">
        <ChatStates />
      </ThemeFork>

      <SectionTitle id="dashboard" number="§5.4">
        /dashboard
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        The daybook — where the week&apos;s spending lands. Hero amount
        in oldstyle-lining figures, three summary figures with a{' '}
        <strong>LARGEST</strong> stamp on the biggest category, a
        pen-drawn bar chart with per-day drill-in, a ranked category
        strip, and a <code className="font-typewriter text-[13px]">&lt;LedgerTable&gt;</code>{' '}
        of entries. Click any row to amend on a paper-clipped carbon
        slip; file a new entry on the same slip at the foot of the
        register.
      </p>
      <ThemeFork id="dashboard-showcase">
        <DashboardStates />
      </ThemeFork>
    </>
  );
}

type Demo = 'idle' | 'checking' | 'recorded' | 'rejected';

function LoginStates() {
  const [demo, setDemo] = useState<Demo>('idle');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)]">
        {(['idle', 'checking', 'recorded', 'rejected'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDemo(d)}
            className={`paper-focusable paper-pressable border border-ink px-3 py-1 ${
              demo === d ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-paper-2'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <Sample label={`/login · ${demo}`}>
        <div className="flex min-h-[640px]">
          <Page
            formCode="CHN-LOG"
            pageNumber="1/1"
            tape
            title="Daily Register"
            headerMeta="Mon, 20 Apr 2026"
            className="flex-1"
          >
            <div className="flex items-center justify-center py-6">
              <LoginStub state={demo} />
            </div>
          </Page>
        </div>
      </Sample>
    </div>
  );
}

function LoginStub({ state }: { state: Demo }) {
  const locked = state === 'checking' || state === 'recorded';
  return (
    <div
      className="relative isolate mx-auto w-full max-w-md"
      data-ledger-tilt
      style={{ transform: 'rotate(0.6deg)' }}
    >
      <div
        className="relative border px-6 py-7 sm:px-8 sm:py-8"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--color-stamp-red) 14%, var(--color-paper))',
          borderColor: 'var(--color-stamp-red)',
        }}
      >
        <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
          Form · Entry Pass
        </p>
        <h1 className="mt-1 font-serif text-title-1 font-bold text-ink">
          Sign the register
        </h1>
        <p className="mt-2 font-serif text-body text-ink-mute">
          Your name and seal — for the day&apos;s books.
        </p>

        <div className="mt-6 space-y-5">
          <StubField label="Name" value="chien@flodesk.com" />
          <StubField label="Seal" value={state === 'rejected' ? '' : '••••••••'} />
        </div>

        <div
          className={`mt-7 inline-flex w-full items-center justify-center gap-2 border-2 border-ink bg-paper px-4 py-2.5 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink ${
            locked ? 'opacity-60' : ''
          }`}
        >
          <Glyph name="pen" size={14} />
          <span>{state === 'checking' ? 'Checking the register…' : 'Sign in'}</span>
        </div>

        {state === 'recorded' && (
          <span className="pointer-events-none absolute -top-3 right-4">
            <Stamp text="Recorded" subtext="Mon, 20 Apr" color="navy" wear={0.5} />
          </span>
        )}
        {state === 'rejected' && (
          <span className="pointer-events-none absolute -top-3 right-4">
            <Stamp text="Rejected" color="red" wear={0.75} />
          </span>
        )}
      </div>

      {state === 'rejected' && (
        <div className="mt-4 pl-2">
          <MarginNote inline id="login-error-demo" className="text-stamp-red">
            Name or seal does not match the register.
          </MarginNote>
        </div>
      )}
    </div>
  );
}

function StubField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
        {label}
      </span>
      <div className="min-h-[1.75rem] border-b border-solid border-ink pb-1.5">
        <span className="font-hand text-hand text-pen-navy">{value}</span>
      </div>
    </div>
  );
}

/**
 * Phase 5.2 — `/dashboard/recurring` visual regression.
 *
 * Four sample states cover the register end-to-end: the populated view
 * (active + paused), an all-paused view (every order set aside), an
 * empty view (EmptyLine copy + tally fallback), and the new-order slip
 * in its `rejected` state so the red stamp + margin note are visible
 * together. Data is static; no fetches.
 */
type RecurringDemo = 'populated' | 'all-paused' | 'empty' | 'slip-rejected';

const RECURRING_SAMPLE: {
  id: string;
  description: string;
  category: string;
  subcategory?: string;
  frequency: 'monthly' | 'weekly' | 'yearly' | 'daily';
  amount: number;
  next_due: string;
  active: boolean;
}[] = [
  {
    id: 'r-netflix',
    description: 'Netflix — Cinema tại nhà',
    category: 'Entertainment',
    subcategory: 'streaming',
    frequency: 'monthly',
    amount: 260000,
    next_due: '2026-05-01',
    active: true,
  },
  {
    id: 'r-internet',
    description: 'Viettel — Internet cáp quang',
    category: 'Bills & Utilities',
    subcategory: 'internet',
    frequency: 'monthly',
    amount: 220000,
    next_due: '2026-04-28',
    active: true,
  },
  {
    id: 'r-gym',
    description: 'California Fitness',
    category: 'Health',
    subcategory: 'gym',
    frequency: 'yearly',
    amount: 7200000,
    next_due: '2026-11-03',
    active: true,
  },
  {
    id: 'r-spotify',
    description: 'Spotify — Premium Family',
    category: 'Entertainment',
    subcategory: 'streaming',
    frequency: 'monthly',
    amount: 149000,
    next_due: '2026-05-12',
    active: false,
  },
  {
    id: 'r-cloud',
    description: 'iCloud 200 GB',
    category: 'Bills & Utilities',
    subcategory: 'phone',
    frequency: 'monthly',
    amount: 25000,
    next_due: '2026-05-18',
    active: false,
  },
];

function RecurringStates() {
  const [demo, setDemo] = useState<RecurringDemo>('populated');

  const all = RECURRING_SAMPLE;
  const items =
    demo === 'empty'
      ? []
      : demo === 'all-paused'
        ? all.map((i) => ({ ...i, active: false }))
        : all;
  const activeCount = items.filter((i) => i.active).length;
  const monthlyTotal = items
    .filter((i) => i.active)
    .reduce((sum, i) => sum + monthlySampleAmount(i), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)]">
        {(['populated', 'all-paused', 'empty', 'slip-rejected'] as const).map(
          (d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDemo(d)}
              className={`paper-focusable paper-pressable border border-ink px-3 py-1 ${
                demo === d
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-ink hover:bg-paper-2'
              }`}
            >
              {d}
            </button>
          ),
        )}
      </div>

      <Sample label={`/dashboard/recurring · ${demo}`}>
        <div className="flex min-h-[720px]">
          <Page
            formCode="CHN-02"
            pageNumber="1/1"
            tape
            title="Standing Orders"
            headerMeta="Mon, 20 Apr 2026"
            className="flex-1"
          >
            <section className="mb-8">
              <h2 className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                Per month, on the books
              </h2>
              <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-3">
                <p className="font-serif text-display-hero font-bold leading-none nums-lining-tabular text-ink">
                  {formatVND(monthlyTotal)}
                </p>
                {activeCount > 0 ? (
                  <p className="flex items-center gap-3 font-serif text-body text-ink-mute">
                    <span>across</span>
                    <TallyMarks count={activeCount} height={22} />
                    <span>
                      active {activeCount === 1 ? 'order' : 'orders'}
                    </span>
                  </p>
                ) : (
                  <p className="font-hand-signature text-hand-signature text-ink-faint">
                    No standing orders on the books.
                  </p>
                )}
              </div>
            </section>

            {demo === 'empty' ? (
              <div className="font-hand-signature text-hand-signature text-ink-faint">
                Nothing standing yet. Add one below.
              </div>
            ) : (
              <RegisterStub items={items} />
            )}

            <section className="mt-10">
              <h2 className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                New standing order
              </h2>
              <NewOrderSlipStub rejected={demo === 'slip-rejected'} />
            </section>
          </Page>
        </div>
      </Sample>
    </div>
  );
}

function RegisterStub({ items }: { items: typeof RECURRING_SAMPLE }) {
  const active = items.filter((i) => i.active);
  const paused = items.filter((i) => !i.active);

  return (
    <div className="space-y-10">
      {active.length > 0 ? (
        <div className="paper-ledger-table w-full overflow-x-auto">
          <table className="w-full border-collapse nums-oldstyle-tabular">
            <thead>
              <tr className="border-b border-ink/70">
                <StubHeader>Description</StubHeader>
                <StubHeader>Category</StubHeader>
                <StubHeader>Cycle</StubHeader>
                <StubHeader align="right">Amount ₫</StubHeader>
                <StubHeader align="right">Next</StubHeader>
                <StubHeader align="right" srOnly>
                  Actions
                </StubHeader>
              </tr>
            </thead>
            <tbody>
              {active.map((item) => {
                const tilt = tiltFor(`${item.id}-desc`, 1.2);
                return (
                  <tr
                    key={item.id}
                    className="paper-ledger-row border-b border-rule-blue/60"
                  >
                    <td className="h-8 px-3 align-middle text-body">
                      <span
                        data-ledger-tilt
                        className="inline-block origin-left font-hand text-hand text-pen-navy"
                        style={{ transform: `rotate(${tilt}deg)` }}
                      >
                        {item.description}
                      </span>
                    </td>
                    <td className="h-8 px-3 align-middle font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                      {item.category}
                      {item.subcategory && ` · ${item.subcategory}`}
                    </td>
                    <td className="h-8 px-3 align-middle font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                      {item.frequency}
                    </td>
                    <td className="h-8 px-3 align-middle text-right font-serif text-body font-bold nums-oldstyle-tabular text-ink">
                      {formatVND(item.amount)}
                    </td>
                    <td className="h-8 px-3 align-middle text-right font-typewriter text-[11px] tabular-nums text-ink-mute">
                      {formatPrintedDate(item.next_due)}
                    </td>
                    <td className="h-8 px-3 align-middle text-right">
                      <span className="inline-flex items-center justify-end gap-3">
                        <Stamp
                          text="Active"
                          color="navy"
                          wear={0.5}
                          id={`${item.id}-stamp`}
                          className="text-[9px]"
                        />
                        <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                          Pause
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="font-hand-signature text-hand-signature text-ink-faint">
          Every order is set aside.
        </div>
      )}

      {paused.length > 0 && (
        <div>
          <h3 className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
            Set aside · {paused.length} paused
          </h3>
          <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {paused.map((item) => {
              const tilt = tiltFor(`${item.id}-receipt`, 0.9);
              return (
                <li key={item.id} className="list-none">
                  <div
                    className="relative border border-ink/30 bg-paper-2 p-4 pr-10"
                    data-ledger-tilt
                    style={{ transform: `rotate(${tilt}deg)` }}
                  >
                    <TornCorner
                      corner="tr"
                      size={40}
                      background="var(--color-paper-2)"
                      edgeColor="var(--color-ink-mute)"
                    />
                    <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                      {item.category}
                      {item.subcategory && ` · ${item.subcategory}`}
                    </span>
                    <p className="mt-1 font-hand text-hand text-ink-faint">
                      {item.description}
                    </p>
                    <p className="font-serif text-body nums-oldstyle-tabular text-ink-faint">
                      {formatVND(item.amount)}{' '}
                      <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)]">
                        · {item.frequency}
                      </span>
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <Stamp
                        text="Paused"
                        color="red"
                        wear={0.7}
                        id={`${item.id}-paused-stamp`}
                        className="text-[9px]"
                      />
                      <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                        Put back
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function NewOrderSlipStub({ rejected }: { rejected: boolean }) {
  return (
    <div
      className="relative isolate"
      data-ledger-tilt
      style={{ transform: 'rotate(0.5deg)' }}
    >
      <div
        className="relative border px-5 py-6 sm:px-7 sm:py-7"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--color-stamp-red) 14%, var(--color-paper))',
          borderColor: 'var(--color-stamp-red)',
        }}
      >
        <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
          Form · Standing order
        </p>
        <p className="mt-1 font-serif text-body text-ink-mute">
          Fill every line. The clerk will file it at the end of the day.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StubField label="Description" value="Netflix — Cinema tại nhà" />
          <StubField label="Amount (₫)" value={rejected ? '' : '260000'} />
          <StubField label="Category" value="Entertainment" />
          <StubField label="Cycle" value="monthly" />
          <StubField label="First due" value="2026-05-01" />
        </div>

        <div className="mt-6 inline-flex w-full items-center justify-center gap-2 border-2 border-ink bg-paper px-4 py-2.5 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink sm:w-auto">
          <Glyph name="pen" size={14} />
          <span>File the order</span>
        </div>

        {rejected && (
          <span className="pointer-events-none absolute -top-3 right-5">
            <Stamp text="Rejected" color="red" wear={0.75} />
          </span>
        )}
      </div>

      {rejected && (
        <div className="mt-3 pl-2">
          <MarginNote
            inline
            id="recurring-error-demo"
            className="text-stamp-red"
          >
            Every line must be filled in.
          </MarginNote>
        </div>
      )}
    </div>
  );
}

function StubHeader({
  children,
  align = 'left',
  srOnly,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  srOnly?: boolean;
}) {
  return (
    <th
      scope="col"
      className={`h-8 px-3 text-label font-typewriter font-normal uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {srOnly ? <span className="sr-only">{children}</span> : children}
    </th>
  );
}

function monthlySampleAmount(item: (typeof RECURRING_SAMPLE)[number]): number {
  switch (item.frequency) {
    case 'daily':
      return Math.round(item.amount * 30);
    case 'weekly':
      return Math.round((item.amount * 365) / 7 / 12);
    case 'yearly':
      return Math.round(item.amount / 12);
    default:
      return item.amount;
  }
}

/**
 * Phase 5.3 — `/chat` visual regression.
 *
 * Four states cover the correspondence end-to-end: empty (ask-the-
 * Ledger-keeper prompt), a plain exchange (user question, printed
 * reply with signature), a reply that calls executeSQL and folds out
 * a receipt, and a mid-stream state showing EraserMarks + the stop
 * button in the compose slip. Data is static; no `/api/chat` traffic.
 */
type ChatDemo = 'empty' | 'exchange' | 'tool-call' | 'streaming';

function ChatStates() {
  const [demo, setDemo] = useState<ChatDemo>('exchange');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)]">
        {(['empty', 'exchange', 'tool-call', 'streaming'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDemo(d)}
            className={`paper-focusable paper-pressable border border-ink px-3 py-1 ${
              demo === d
                ? 'bg-ink text-paper'
                : 'bg-paper text-ink hover:bg-paper-2'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <Sample label={`/chat · ${demo}`}>
        <div className="flex min-h-[720px]">
          <Page
            formCode="CHN-CHAT"
            pageNumber="∞"
            tape
            title="Correspondence"
            headerMeta="Mon, 20 Apr 2026"
            className="flex-1"
          >
            <ChatStub state={demo} />
          </Page>
        </div>
      </Sample>
    </div>
  );
}

function ChatStub({ state }: { state: ChatDemo }) {
  const showExchange = state !== 'empty';
  const showTool = state === 'tool-call';
  const showStreaming = state === 'streaming';

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
          &larr; Daybook
        </span>
        <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
          Close the book
        </span>
      </div>

      {state === 'empty' ? (
        <div className="flex items-start gap-3 pb-6">
          <Glyph name="pen" size={18} className="mt-[2px] text-pencil-gray" />
          <p className="font-hand-signature text-hand-signature text-ink-faint">
            Nothing on this page yet. Ask the Ledger-keeper below.
          </p>
        </div>
      ) : (
        <ol className="mt-2 space-y-10 pb-4">
          <StubUserEntry
            id="demo-user-1"
            time="14:32"
            text="Tuần này tôi đã tiêu bao nhiêu cho Phở bò và Cà phê sữa đá?"
          />
          {showExchange && !showStreaming && (
            <StubAssistantEntry
              id="demo-ai-1"
              time="14:33"
              body={
                <>
                  <p>
                    On this page, the entries for <em>Phở bò</em> and{' '}
                    <em>Cà phê sữa đá</em> between Mon, 14 Apr and Sun, 20 Apr:
                  </p>
                  <ul>
                    <li>Phở bò — 310.000 ₫ across 4 entries</li>
                    <li>Cà phê sữa đá — 148.000 ₫ across 6 entries</li>
                  </ul>
                  <p>
                    Settled total on these two lines: <strong>458.000 ₫</strong>.
                  </p>
                </>
              }
              tool={showTool ? 'done' : undefined}
              signed
            />
          )}
          {showStreaming && (
            <StubAssistantEntry
              id="demo-ai-stream"
              time="14:33"
              body={
                <p>
                  Looking through this week&apos;s entries now — one moment
                  while I
                </p>
              }
              tool="running"
              streaming
            />
          )}
        </ol>
      )}

      <div className="mt-6">
        <StubComposeSlip streaming={showStreaming} />
      </div>
    </div>
  );
}

function StubUserEntry({
  id,
  time,
  text,
}: {
  id: string;
  time: string;
  text: string;
}) {
  const tilt = tiltFor(`${id}-user`, 1.1);
  return (
    <li className="space-y-2">
      <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
        You · {time}
      </span>
      <p
        data-ledger-tilt
        className="max-w-prose whitespace-pre-wrap font-hand text-hand leading-snug text-pen-navy"
        style={{ transform: `rotate(${tilt}deg)`, transformOrigin: 'top left' }}
      >
        {text}
      </p>
    </li>
  );
}

function StubAssistantEntry({
  id,
  time,
  body,
  tool,
  signed,
  streaming,
}: {
  id: string;
  time: string;
  body: React.ReactNode;
  tool?: 'running' | 'done' | 'error';
  signed?: boolean;
  streaming?: boolean;
}) {
  const sigTilt = tiltFor(`${id}-sig`, 1.4);
  return (
    <li className="space-y-3">
      <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-pencil-gray">
        The Ledger-keeper · {time}
      </span>
      <div className="max-w-prose font-serif text-body-l leading-relaxed text-ink [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
        {body}
      </div>
      {tool && <StubToolReceipt state={tool} />}
      {streaming && <EraserMarks showLabel labelText="Still writing…" />}
      {signed && (
        <p
          data-ledger-tilt
          className="pt-1 font-hand-signature text-hand-signature text-pencil-gray"
          style={{ transform: `rotate(${sigTilt}deg)` }}
          aria-label="Signed the Ledger-keeper"
        >
          — LK
        </p>
      )}
    </li>
  );
}

function StubToolReceipt({ state }: { state: 'running' | 'done' | 'error' }) {
  return (
    <details
      open={state === 'error' || state === 'running'}
      className="paper-tool-receipt group my-2 max-w-prose border border-ink/30 bg-paper-2"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2">
        <span className="flex items-baseline gap-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
          <span className="text-ink">Receipt</span>
          <span aria-hidden="true">·</span>
          <span>executeSQL</span>
        </span>
        <span className="flex items-center gap-3">
          {state === 'running' && <EraserMarks label="Running the query" />}
          {state === 'done' && (
            <Stamp
              text="Filed"
              color="navy"
              wear={0.6}
              id="demo-filed"
              className="text-[9px]"
            />
          )}
          {state === 'error' && (
            <Stamp
              text="Error"
              color="red"
              wear={0.7}
              id="demo-err"
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
        <div>
          <p className="mb-1 font-typewriter text-[9px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
            Query
          </p>
          <pre className="whitespace-pre-wrap font-typewriter text-[12px] leading-relaxed text-ink">
            {`SELECT description, SUM(amount) AS total, COUNT(*) AS n
FROM expenses
WHERE date >= '2026-04-14' AND date <= '2026-04-20'
  AND description ILIKE ANY (ARRAY['%Phở bò%', '%Cà phê%'])
GROUP BY description;`}
          </pre>
        </div>
        {state !== 'running' && (
          <div>
            <p className="mb-1 font-typewriter text-[9px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
              {state === 'error' ? 'Error' : 'Result'}
            </p>
            <pre
              className={`whitespace-pre-wrap font-typewriter text-[12px] leading-relaxed tabular-nums ${
                state === 'error' ? 'text-stamp-red' : 'text-ink'
              }`}
            >
              {state === 'error'
                ? 'relation "expenses" does not exist'
                : '[\n  { "description": "Phở bò", "total": 310000, "n": 4 },\n  { "description": "Cà phê sữa đá", "total": 148000, "n": 6 }\n]'}
            </pre>
          </div>
        )}
      </div>
    </details>
  );
}

function StubComposeSlip({ streaming }: { streaming: boolean }) {
  return (
    <form
      aria-label="Write the next entry"
      onSubmit={(e) => e.preventDefault()}
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
        {streaming && (
          <EraserMarks showLabel labelText="Writing…" />
        )}
      </div>
      <div className="mt-3 border-b border-solid border-ink pb-1.5 font-hand text-hand text-pen-navy">
        {streaming ? 'Phở bò tuần trước…' : 'Ask or log…'}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
          Enter to send · Shift + Enter for a new line
        </span>
        <div className="flex items-center gap-2">
          {streaming && (
            <span className="inline-flex items-center gap-2 border border-stamp-red bg-paper px-3 py-1.5 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-stamp-red">
              <Glyph name="cross" size={12} />
              <span>Stop</span>
            </span>
          )}
          <span
            className={`inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-2 font-stamp text-[12px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink ${
              streaming ? 'opacity-60' : ''
            }`}
          >
            <Glyph name="pen" size={13} />
            <span>Send</span>
          </span>
        </div>
      </div>
    </form>
  );
}

/**
 * Phase 5.4 — `/dashboard` visual regression.
 *
 * Four states cover the daybook end-to-end: populated (the daily bars,
 * ranked categories, ledger rows, and collapsed quick-add), empty
 * (range with no entries), drilled-day (one bar selected with its
 * category breakdown shown underneath), and amend-slip (row drill-in
 * into the paper-clipped edit slip). Data is static; no fetches.
 */
type DashboardDemo = 'populated' | 'empty' | 'drilled-day' | 'amend-slip';

const DASHBOARD_SAMPLE_DAILY = [
  { date: '2026-04-14', total: 215000, income: 0 },
  { date: '2026-04-15', total: 482000, income: 0 },
  { date: '2026-04-16', total: 96000, income: 120000 },
  { date: '2026-04-17', total: 310000, income: 0 },
  { date: '2026-04-18', total: 720000, income: 0 },
  { date: '2026-04-19', total: 148000, income: 0 },
  { date: '2026-04-20', total: 262000, income: 0 },
];

const DASHBOARD_SAMPLE_CATEGORIES = [
  { category: 'Food & Drink', total: 1180000, count: 14 },
  { category: 'Transport', total: 560000, count: 9 },
  { category: 'Entertainment', total: 260000, count: 3 },
  { category: 'Bills & Utilities', total: 245000, count: 2 },
  { category: 'Shopping', total: 90000, count: 1 },
];

const DASHBOARD_SAMPLE_ROWS: LedgerRow[] = [
  {
    id: 'd-1',
    date: formatPrintedDate('2026-04-20'),
    time: formatPrintedTime('2026-04-20T07:14:00'),
    description: 'Phở bò — quán Hưng',
    category: 'Food & Drink · restaurant',
    amount: 85000,
  },
  {
    id: 'd-2',
    date: formatPrintedDate('2026-04-20'),
    time: formatPrintedTime('2026-04-20T09:02:00'),
    description: 'Cà phê sữa đá — Cộng Cà Phê',
    category: 'Food & Drink · coffee',
    amount: 35000,
  },
  {
    id: 'd-3',
    date: formatPrintedDate('2026-04-19'),
    time: formatPrintedTime('2026-04-19T18:44:00'),
    description: 'Grab — Q1 → Thảo Điền',
    category: 'Transport · grab',
    amount: 142000,
  },
  {
    id: 'd-4',
    date: formatPrintedDate('2026-04-16'),
    time: formatPrintedTime('2026-04-16T12:01:00'),
    description: 'Hoàn tiền từ Mai',
    category: 'Income · payback',
    amount: -120000,
  },
];

function DashboardStates() {
  const [demo, setDemo] = useState<DashboardDemo>('populated');

  const empty = demo === 'empty';
  const selectedDay = demo === 'drilled-day' ? '2026-04-18' : undefined;
  const showSlip = demo === 'amend-slip';

  const daily = empty
    ? []
    : DASHBOARD_SAMPLE_DAILY.map((d) => ({ ...d }));
  const categories = empty ? [] : DASHBOARD_SAMPLE_CATEGORIES;
  const rows = empty ? [] : DASHBOARD_SAMPLE_ROWS;
  const count = rows.length;
  const totalSpent = daily.reduce((s, d) => s + d.total, 0);
  const totalIncome = daily.reduce((s, d) => s + d.income, 0);
  const heroTotal = selectedDay
    ? daily.find((d) => d.date === selectedDay)?.total ?? 0
    : totalSpent - totalIncome;
  const dailyAvg =
    empty || daily.length === 0 ? 0 : Math.round(totalSpent / daily.length);
  const topCategory = categories[0]?.category ?? '—';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)]">
        {(['populated', 'empty', 'drilled-day', 'amend-slip'] as const).map(
          (d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDemo(d)}
              className={`paper-focusable paper-pressable border border-ink px-3 py-1 ${
                demo === d
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-ink hover:bg-paper-2'
              }`}
            >
              {d}
            </button>
          ),
        )}
      </div>

      <Sample label={`/dashboard · ${demo}`}>
        <div className="flex min-h-[820px]">
          <Page
            formCode="CHN-01"
            pageNumber="1/1"
            tape
            title="Daybook"
            headerMeta="Mon, 20 Apr 2026"
            className="flex-1"
          >
            <nav
              aria-label="Ledger sections"
              className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-4"
            >
              <div className="flex items-baseline gap-4 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)]">
                <span className="text-ink">Daybook</span>
                <span className="text-ink-mute">Standing orders</span>
                <span className="text-ink-mute">Correspondence</span>
              </div>
              <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                Close the book
              </span>
            </nav>

            <section className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <h4 className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                  {selectedDay ? 'On this day' : 'On this page'}
                </h4>
                <p className="mt-2 font-serif text-display-hero font-bold leading-none nums-lining-tabular text-ink">
                  {formatVND(heroTotal)}
                </p>
                <p className="mt-3 font-serif text-body text-ink-mute">
                  {selectedDay
                    ? `${selectedDay} · drilled in`
                    : empty
                      ? 'Last 7 days · no entries filed'
                      : 'Last 7 days · 14 Apr → 20 Apr 2026'}
                </p>
                {!empty && totalIncome > 0 && (
                  <p className="mt-2 font-serif text-caption italic text-ink-mute">
                    Before paybacks {formatVND(totalSpent)} · got back{' '}
                    <span className="text-stamp-red">
                      ({formatVND(totalIncome)})
                    </span>
                  </p>
                )}
              </div>
              <div
                role="group"
                aria-label="Range"
                className="flex flex-wrap items-center gap-1"
              >
                <span className="mr-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                  Range
                </span>
                {['Today', 'Last 7 days', 'This week', 'This month'].map(
                  (label, i) => (
                    <span
                      key={label}
                      className={`border border-ink/50 px-2.5 py-1 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] ${
                        i === 1
                          ? 'border-ink bg-ink text-paper'
                          : 'bg-paper-2 text-ink-mute'
                      }`}
                    >
                      {label}
                    </span>
                  ),
                )}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 border-y border-ink/25 py-6 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <span className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                  Entries
                </span>
                <span className="inline-flex items-center gap-3">
                  <span className="font-serif text-title-1 font-bold nums-lining-tabular text-ink">
                    {count}
                  </span>
                  {count > 0 && (
                    <TallyMarks count={count} height={20} />
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                  Daily average
                </span>
                <span className="font-serif text-title-1 font-bold nums-lining-tabular text-ink">
                  {formatVND(dailyAvg)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                  Top line
                </span>
                <span className="inline-flex items-center gap-3">
                  <span className="font-hand text-hand text-pen-navy">
                    {topCategory}
                  </span>
                  {topCategory !== '—' && (
                    <Stamp
                      text="Largest"
                      color="red"
                      wear={0.65}
                      id={`demo-top-${topCategory}`}
                      className="text-[8px]"
                    />
                  )}
                </span>
              </div>
            </section>

            <section className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <h4 className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                  Daily spending
                </h4>
                {daily.length === 0 ? (
                  <div className="border border-ink/20 bg-paper-2 px-5 py-10 font-hand-signature text-hand-signature text-ink-faint">
                    Nothing on this line yet for the range you picked.
                  </div>
                ) : (
                  <HandDrawnChart
                    kind="bar"
                    data={daily.map((d) => ({
                      label: d.date.slice(5).replace('-', '/'),
                      value: d.total,
                    }))}
                    annotations={
                      selectedDay
                        ? [
                            {
                              index: daily.findIndex(
                                (d) => d.date === selectedDay,
                              ),
                              note: 'drilled',
                            },
                          ]
                        : undefined
                    }
                    yFormatter={formatVNDShort}
                    title="Daily spending · 7 days"
                  />
                )}
                {selectedDay && (
                  <div className="mt-3 border border-ink/30 bg-paper-2 px-4 py-3">
                    <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                      {selectedDay} · {formatVND(720000)}
                    </p>
                    <ul className="mt-2 space-y-1">
                      <li className="flex items-baseline justify-between gap-6 font-serif text-body nums-oldstyle-tabular text-ink">
                        <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                          Food & Drink
                        </span>
                        <span>{formatVND(420000)}</span>
                      </li>
                      <li className="flex items-baseline justify-between gap-6 font-serif text-body nums-oldstyle-tabular text-ink">
                        <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                          Transport
                        </span>
                        <span>{formatVND(300000)}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="lg:col-span-2">
                <h4 className="mb-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                  By category
                </h4>
                {categories.length === 0 ? (
                  <div className="border border-ink/20 bg-paper-2 px-5 py-10 font-hand-signature text-hand-signature text-ink-faint">
                    Nothing charged to a category yet.
                  </div>
                ) : (
                  <ol className="flex list-none flex-col gap-3 border border-ink/15 bg-paper p-5">
                    {categories.map((entry, i) => {
                      const peak = categories[0]?.total ?? 0;
                      const pct = peak > 0 ? (entry.total / peak) * 100 : 0;
                      const isTop = i === 0;
                      const color = isTop
                        ? 'var(--color-stamp-red)'
                        : 'var(--color-pen-navy)';
                      const tilt = tiltFor(`demo-cat-${entry.category}`, 0.8);
                      return (
                        <li
                          key={entry.category}
                          className="flex flex-col gap-1"
                        >
                          <div className="flex items-baseline justify-between gap-4">
                            <span
                              data-ledger-tilt
                              className="inline-block origin-left font-hand text-hand text-pen-navy"
                              style={{ transform: `rotate(${tilt}deg)` }}
                            >
                              {entry.category}
                            </span>
                            <span className="font-serif text-body nums-oldstyle-tabular text-ink">
                              {formatVND(entry.total)}
                            </span>
                          </div>
                          <svg
                            aria-hidden="true"
                            role="presentation"
                            focusable="false"
                            viewBox="0 0 400 10"
                            preserveAspectRatio="none"
                            width="100%"
                            height={10}
                            style={{ filter: 'url(#hand-wobble)' }}
                          >
                            <rect
                              x={0}
                              y={2}
                              width={(pct / 100) * 400}
                              height={6}
                              fill={color}
                              fillOpacity={0.22}
                              stroke={color}
                              strokeWidth="1.4"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </section>

            <section className="mt-12">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h4 className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
                  Register · {rows.length}{' '}
                  {rows.length === 1 ? 'entry' : 'entries'}
                </h4>
                <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                  Click any row to amend · turn the page for more
                </span>
              </div>
              {showSlip && (
                <div className="relative mb-6">
                  <PaperClip corner="tr" size={44} />
                  <DashboardAmendSlipStub />
                </div>
              )}
              <LedgerTable
                rows={rows}
                activeRowId={showSlip ? 'd-1' : undefined}
                emptyText="No entries on this page. File one below."
              />
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-ink/20 pt-4">
                <p className="font-hand-signature text-hand-signature text-ink-mute">
                  Missed something? File it on a new line.
                </p>
                <span className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-2 font-stamp text-[12px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink">
                  <Glyph name="pen" size={13} />
                  <span>File a new entry</span>
                </span>
              </div>
            </section>
          </Page>
        </div>
      </Sample>
    </div>
  );
}

function DashboardAmendSlipStub() {
  return (
    <div
      className="relative isolate"
      data-ledger-tilt
      style={{ transform: 'rotate(-0.3deg)' }}
    >
      <div
        className="relative border px-5 py-6 sm:px-7 sm:py-7"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--color-stamp-red) 14%, var(--color-paper))',
          borderColor: 'var(--color-stamp-red)',
        }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
              Form · Amend entry
            </p>
            <h3 className="mt-1 font-serif text-title-2 font-bold text-ink">
              Amend this entry
            </h3>
          </div>
          <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            Close
          </span>
        </div>
        <p className="mt-2 font-serif text-body text-ink-mute">
          Correct any line. The change is recorded on the books.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StubField label="Description" value="Phở bò — quán Hưng" />
          <StubField label="Amount (₫)" value="85000" />
          <StubField label="Kind" value="Expense" />
          <StubField label="Category" value="Food & Drink" />
          <StubField label="Subcategory" value="restaurant" />
          <StubField label="Date" value="2026-04-20" />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-2.5 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink">
            <Glyph name="pen" size={14} />
            <span>Save amendment</span>
          </span>
          <span className="ml-auto inline-flex items-center gap-2 border border-stamp-red bg-paper px-3 py-2 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-stamp-red">
            <Glyph name="cross" size={12} />
            <span>Discard</span>
          </span>
        </div>
      </div>
    </div>
  );
}
