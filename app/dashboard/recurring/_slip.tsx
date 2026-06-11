'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';
import { Stamp } from '@/app/_components/paper/Stamp';
import { MarginNote } from '@/app/_components/paper/MarginNote';
import { Glyph } from '@/app/_components/paper/Glyph';
import { PaperSelect, type PaperSelectOption } from '@/app/_components/paper/PaperSelect';

/**
 * `<NewStandingOrderSlip>` — carbon-slip Quick-Add form (§4.8).
 *
 * Pink carbon paper, stamp-red border, slight tilt — matches the
 * `/login` slip so the Paper Ledger "you are filling in an
 * official form" affordance reads across the app. On submit a navy
 * RECORDED stamp thumps and the server refreshes. On failure a red
 * REJECTED stamp lands and a stamp-red margin note explains.
 *
 * The editable fields mirror `<FieldLine kind="hand">` visuals
 * (typewriter label, Patrick Hand pen-navy value, 1px ink underline);
 * rebuilt inline because `<FieldLine>` is display-only per §4.2 and
 * the Phase 5 decision log (2026-04-21 · /login slip) already
 * established the pattern.
 */
type Status = 'idle' | 'saving' | 'recorded' | 'rejected';

const FREQUENCIES = ['monthly', 'weekly', 'yearly', 'daily'] as const;

export function NewStandingOrderSlip() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>('monthly');
  const [nextDue, setNextDue] = useState(() => today());

  const locked = status === 'saving' || status === 'recorded';
  const categories = Object.keys(CATEGORIES);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked) return;
    setStatus('saving');
    setError('');

    const parsedAmount = parseInt(amount.replace(/[.,\s]/g, ''), 10);
    if (
      !description.trim() ||
      isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      !category ||
      !frequency ||
      !nextDue
    ) {
      setStatus('rejected');
      setError('Every line must be filled in.');
      return;
    }

    const res = await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parsedAmount,
        description: description.trim(),
        category,
        frequency,
        next_due: nextDue,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus('rejected');
      setError(data.error ?? 'The clerk could not file this order.');
      return;
    }

    setStatus('recorded');
    // Hold the stamp on-screen long enough to register (§8 — thump is
    // 180ms, a short dry after keeps the confirmation visible without
    // stretching past the 1s ceiling).
    setTimeout(() => {
      setDescription('');
      setAmount('');
      setCategory('');
      setFrequency('monthly');
      setNextDue(today());
      setStatus('idle');
      router.refresh();
    }, 700);
  }

  return (
    <div
      className="relative isolate"
      data-ledger-tilt
      style={{ transform: 'rotate(0.5deg)' }}
    >
      <form
        onSubmit={handleSubmit}
        aria-labelledby="new-order-heading"
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
          <SlipField
            id="so-description"
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="e.g. Netflix"
            disabled={locked}
            required
            className="sm:col-span-2"
          />
          <SlipField
            id="so-amount"
            label="Amount (₫)"
            value={amount}
            onChange={setAmount}
            placeholder="180000"
            inputMode="numeric"
            disabled={locked}
            required
          />
          <SlipSelect
            id="so-category"
            label="Category"
            value={category}
            onChange={setCategory}
            disabled={locked}
            required
            placeholder="— choose —"
            options={categories.map((c) => ({ value: c, label: c }))}
          />
          <SlipSelect
            id="so-frequency"
            label="Cycle"
            value={frequency}
            onChange={(v) => setFrequency(v as (typeof FREQUENCIES)[number])}
            disabled={locked}
            options={FREQUENCIES.map((f) => ({ value: f, label: f }))}
          />
          <SlipField
            id="so-next-due"
            label="First due"
            type="date"
            value={nextDue}
            onChange={setNextDue}
            disabled={locked}
            required
          />
        </div>

        <button
          type="submit"
          disabled={locked}
          className="paper-focusable paper-pressable mt-6 inline-flex w-full items-center justify-center gap-2 border-2 border-ink bg-paper px-4 py-2.5 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink transition-colors hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Glyph name="pen" size={14} />
          <span>{status === 'saving' ? 'Filing the order…' : 'File the order'}</span>
        </button>

        <span className="sr-only" aria-live="polite">
          {status === 'recorded' && 'Recorded.'}
          {status === 'rejected' && error}
        </span>

        {status === 'recorded' && (
          <span className="pointer-events-none absolute -top-3 right-5 paper-stamp-thump">
            <Stamp text="Recorded" color="navy" wear={0.5} />
          </span>
        )}
        {status === 'rejected' && (
          <span className="pointer-events-none absolute -top-3 right-5 paper-stamp-thump">
            <Stamp text="Rejected" color="red" wear={0.75} />
          </span>
        )}
      </form>

      {status === 'rejected' && (
        <div className="mt-3 pl-2">
          <MarginNote inline id="new-order-error" className="text-stamp-red">
            {error}
          </MarginNote>
        </div>
      )}
    </div>
  );
}

type SlipFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'date';
  placeholder?: string;
  inputMode?: 'text' | 'numeric';
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

function SlipField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  inputMode,
  disabled,
  required,
  className,
}: SlipFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
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
        placeholder={placeholder}
        inputMode={inputMode}
        disabled={disabled}
        required={required}
        className="paper-focusable w-full border-0 border-b border-solid border-ink bg-transparent pb-1.5 font-hand text-hand text-pen-navy placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

function SlipSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: PaperSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute"
      >
        {label}
      </label>
      <PaperSelect
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}
