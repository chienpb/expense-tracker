'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';
import { CarbonSlip } from '@/app/_components/paper/CarbonSlip';
import { PaperClip } from '@/app/_components/paper/PaperClip';
import { PaperSelect, type PaperSelectOption } from '@/app/_components/paper/PaperSelect';
import { Stamp } from '@/app/_components/paper/Stamp';

/**
 * `<QuickAdd>` — pinned right-column carbon slip (§4.8 · DASHBOARD_REDESIGN C9).
 *
 * Three handwritten field-lines (`amount`, `category`, `desc.`) plus a
 * single `RECORD →` button. Date defaults to today, `type` defaults to
 * `expense`, subcategory stays null. The six-field amend flow still
 * lives in `<EntrySlip>` — this slip is the clerk's shortcut, not a
 * replacement for it.
 *
 * Field-lines use a 1px ink underline with typewriter label-LEFT +
 * handwritten value on the line, matching the mockup and the pattern
 * already established in `<EntrySlip>`.
 */
type Status = 'idle' | 'saving' | 'recorded' | 'rejected';

export function QuickAdd() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const locked = status === 'saving' || status === 'recorded';
  const categories = Object.keys(CATEGORIES);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked) return;
    setError('');
    const parsedAmount = parseInt(amount.replace(/[.,\s]/g, ''), 10);
    if (
      !description.trim() ||
      !Number.isInteger(parsedAmount) ||
      parsedAmount <= 0 ||
      !category
    ) {
      setStatus('rejected');
      setError('Amount, category, and description must all be filled.');
      return;
    }

    setStatus('saving');
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: description.trim(),
        amount: parsedAmount,
        category,
        subcategory: null,
        type: 'expense',
        date: today(),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus('rejected');
      setError(data.error ?? 'The clerk could not file this entry.');
      return;
    }

    setStatus('recorded');
    setAmount('');
    setCategory('');
    setDescription('');
    startTransition(() => router.refresh());
    setTimeout(() => setStatus('idle'), 900);
  }

  return (
    <div className="relative isolate">
      <PaperClip corner="tl" size={46} />
      <CarbonSlip id="quick-add" aria-labelledby="quick-add-heading">
        <form onSubmit={handleSubmit} className="relative">
          <div className="mb-4">
            <p
              id="quick-add-heading"
              className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-stamp-red"
            >
              Form CHN-01-A · Quick entry
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <SlipLine
              id="qa-amount"
              label="amount"
              value={amount}
              onChange={setAmount}
              placeholder="120.000 ₫"
              inputMode="numeric"
              disabled={locked}
            />
            <SlipSelectLine
              id="qa-category"
              label="category"
              value={category}
              onChange={setCategory}
              disabled={locked}
              placeholder="— choose —"
              options={categories.map((c) => ({ value: c, label: c }))}
            />
            <SlipLine
              id="qa-description"
              label="desc."
              value={description}
              onChange={setDescription}
              placeholder="Phở Thìn — dinner"
              disabled={locked}
            />
          </div>

          <button
            type="submit"
            disabled={locked}
            className="paper-focusable paper-pressable mt-5 inline-flex w-full items-center justify-center gap-2 border-2 border-ink bg-paper px-4 py-2.5 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink transition-colors hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{status === 'saving' ? 'Filing…' : 'Record →'}</span>
          </button>

          <span className="sr-only" aria-live="polite">
            {status === 'recorded' && 'Recorded.'}
            {status === 'rejected' && error}
          </span>

          {status === 'recorded' && (
            <span className="pointer-events-none absolute -top-4 right-2 paper-stamp-thump">
              <Stamp text="Recorded" color="navy" wear={0.5} />
            </span>
          )}

          {status === 'rejected' && (
            <p className="mt-3 font-hand text-[14px] text-stamp-red">{error}</p>
          )}
        </form>
      </CarbonSlip>
    </div>
  );
}

type SlipLineProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric';
  disabled?: boolean;
};

function SlipLine({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  disabled,
}: SlipLineProps) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-baseline gap-3">
      <label
        htmlFor={id}
        className="font-typewriter text-[11px] lowercase tracking-[var(--letter-spacing-label-s)] text-stamp-red"
      >
        {label}:
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        disabled={disabled}
        className="paper-focusable w-full border-0 border-b border-solid border-ink bg-transparent pb-1 font-hand text-hand text-pen-navy placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

function SlipSelectLine({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: PaperSelectOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-baseline gap-3">
      <label
        htmlFor={id}
        className="font-typewriter text-[11px] lowercase tracking-[var(--letter-spacing-label-s)] text-stamp-red"
      >
        {label}:
      </label>
      <PaperSelect
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}
