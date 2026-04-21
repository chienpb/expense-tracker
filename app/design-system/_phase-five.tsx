'use client';

import { useState } from 'react';
import { Page } from '@/app/_components/paper/Page';
import { Stamp } from '@/app/_components/paper/Stamp';
import { MarginNote } from '@/app/_components/paper/MarginNote';
import { Glyph } from '@/app/_components/paper/Glyph';
import { TornCorner } from '@/app/_components/paper/TornCorner';
import { TallyMarks } from '@/app/_components/paper/TallyMarks';
import { tiltFor } from '@/lib/seed-rotation';
import { formatVND } from '@/lib/dashboard/utils';
import { formatPrintedDate } from '@/lib/paper-format';
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
