'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Stamp } from '@/app/_components/paper/Stamp';
import { MarginNote } from '@/app/_components/paper/MarginNote';
import { Glyph } from '@/app/_components/paper/Glyph';

/**
 * `<LoginForm>` — Paper Ledger login (Phase 5.1).
 *
 * Composition: a carbon slip holds two ruled fields and a pressed-paper
 * submit button. Submission runs through next-auth's credentials
 * provider exactly as the Swiss page did — only the chrome changes.
 *
 * States (§6):
 *   idle      — fresh slip; the submit button sits quiet.
 *   checking  — button locks, copy swaps to the clerical wait string.
 *   recorded  — navy `RECORDED` stamp thumps in; after 700ms we hand off
 *               to `/dashboard`. The redirect is delayed so the stamp is
 *               visible — the metaphor needs the beat.
 *   rejected  — red `REJECTED` stamp thumps in, password clears, a
 *               stamp-red margin note tells the user what happened.
 *
 * Accessibility
 *   - `aria-live="polite"` announces success/rejection text for SR users.
 *   - The decorative stamps carry an accessible name via `<Stamp>`'s
 *     `role="img"` + `aria-label`, so AT users hear "Recorded" / "Rejected"
 *     without the pencil-cross glyphs that are `aria-hidden`.
 *   - Inputs keep `type="email"` / `type="password"` so the browser does
 *     the right thing with autofill, caps-lock warnings, etc.
 */
type Status = 'idle' | 'checking' | 'recorded' | 'rejected';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'checking' || status === 'recorded') return;
    setStatus('checking');
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setStatus('rejected');
      setError('Name or seal does not match the register.');
      setPassword('');
      return;
    }

    setStatus('recorded');
    // Hold the stamp on-screen long enough to be seen (§8 — 180–240ms
    // for the thump itself; we wait the thump + a short dry). Keep well
    // under the 1s ceiling or users start poking the button again.
    setTimeout(() => router.push('/dashboard'), 700);
  }

  const locked = status === 'checking' || status === 'recorded';

  return (
    <div
      className="relative isolate mx-auto w-full max-w-md"
      data-ledger-tilt
      style={{
        // A shallow tilt on the whole slip; the inner CarbonSlip tilts
        // on top via its own seed. Together they give the "pinned at
        // an angle" feel without either rotation reading as extreme.
        transform: 'rotate(0.6deg)',
      }}
    >
      {/* Pink carbon-tinted slip, derived from stamp-red + paper via
          color-mix so both Day and Midnight stay in-palette. Same
          recipe as <CarbonSlip>, inlined here because we need a
          larger, deliberate padding than the primitive's default and
          we want to own the aria-landmark (the form) directly. */}
      <form
        onSubmit={handleSubmit}
        aria-labelledby="login-heading"
        className="relative border px-6 py-7 sm:px-8 sm:py-8"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--color-stamp-red) 14%, var(--color-paper))',
          borderColor: 'var(--color-stamp-red)',
        }}
      >
        {/* Form meta — typewriter, tracked. Sits above the heading as a
            printed banner so the slip reads as an official form, not
            just a card with a title. */}
        <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
          Form · Entry Pass
        </p>
        <h1
          id="login-heading"
          className="mt-1 font-serif text-title-1 font-bold text-ink"
        >
          Sign the register
        </h1>
        <p className="mt-2 font-serif text-body text-ink-mute">
          Your name and seal — for the day&apos;s books.
        </p>

        <div className="mt-6 space-y-5">
          <Field
            id="email"
            label="Name"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            autoFocus
            required
            disabled={locked}
          />
          <Field
            id="password"
            label="Seal"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
            disabled={locked}
          />
        </div>

        <button
          type="submit"
          disabled={locked}
          className="paper-focusable paper-pressable mt-7 inline-flex w-full items-center justify-center gap-2 border-2 border-ink bg-paper px-4 py-2.5 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink transition-colors hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Glyph name="pen" size={14} />
          <span>{status === 'checking' ? 'Checking the register…' : 'Sign in'}</span>
        </button>

        {/* Announce status changes for SR users. The stamps themselves
            carry their own aria-label, but the margin-note copy is
            visual-only, so this live region ensures parity. */}
        <span className="sr-only" aria-live="polite">
          {status === 'recorded' && 'Recorded. Opening the ledger.'}
          {status === 'rejected' && error}
        </span>

        {/* Stamps overlay the slip's top-right corner. We render both
            conditionally — at most one is ever on-screen. Pointer
            events off so they don't block the button tap area. */}
        {status === 'recorded' && (
          <span className="pointer-events-none absolute -top-3 right-4 paper-stamp-thump">
            <Stamp text="Recorded" subtext={todayLabel()} color="navy" wear={0.5} />
          </span>
        )}
        {status === 'rejected' && (
          <span className="pointer-events-none absolute -top-3 right-4 paper-stamp-thump">
            <Stamp text="Rejected" color="red" wear={0.75} />
          </span>
        )}
      </form>

      {status === 'rejected' && (
        <div className="mt-4 pl-2">
          <MarginNote inline id="login-error" className="text-stamp-red">
            {error}
          </MarginNote>
        </div>
      )}
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type: 'email' | 'password';
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  disabled?: boolean;
};

/**
 * A ruled text field that matches `<FieldLine kind="hand">` visually —
 * typewriter label above, Patrick Hand pen-navy input, 1px ink underline.
 * Not built on top of `<FieldLine>` because that component is display-only
 * (§4.2 notes the editable sibling is a Phase 4 concern); we ship the
 * editable form here since the roadmap did not land it separately.
 */
function Field({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  autoFocus,
  required,
  disabled,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required={required}
        disabled={disabled}
        className="paper-focusable w-full border-0 border-b border-solid border-ink bg-transparent pb-1.5 font-hand text-hand text-pen-navy placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

function todayLabel(): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return '';
  }
}
