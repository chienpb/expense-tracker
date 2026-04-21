'use client';

import { useState } from 'react';
import { Page } from '@/app/_components/paper/Page';
import { Stamp } from '@/app/_components/paper/Stamp';
import { MarginNote } from '@/app/_components/paper/MarginNote';
import { Glyph } from '@/app/_components/paper/Glyph';
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
