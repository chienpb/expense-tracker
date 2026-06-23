'use client';

import { useEffect, useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import { Stamp } from '@/app/_components/paper/Stamp';
import { MarginNote } from '@/app/_components/paper/MarginNote';
import { Glyph } from '@/app/_components/paper/Glyph';
import { PaperSelect, type PaperSelectOption } from '@/app/_components/paper/PaperSelect';
import type { Expense } from '@/lib/dashboard/queries';

/**
 * `<EntrySlip>` — carbon-slip quick-add / edit form for ledger entries.
 *
 * Pink carbon paper, stamp-red border, seeded tilt — matches the login
 * slip and the standing-order slip so "you are filling in an official
 * form" reads across the app. The editable fields mirror the
 * `<FieldLine kind="hand">` visual (typewriter label, Patrick Hand
 * pen-navy value, 1px ink underline); inline styling, consistent with
 * Phase 5.2's `_slip.tsx` (per DECISION_LOG 2026-04-21, `<FieldLine>`
 * is display-only).
 *
 * On success: navy RECORDED stamp thumps and the host refreshes. On
 * failure: red REJECTED stamp lands and a stamp-red margin note
 * explains. Caller owns the network round-trip via `onSubmit`, which
 * returns an error string (rejected) or void (success).
 */
export type EntryValues = {
  description: string;
  amount: number;
  category: string;
  subcategory: string | null;
  type: 'expense' | 'income';
  date: string;
};

type Status = 'idle' | 'saving' | 'recorded' | 'rejected';

type EntrySlipProps = {
  id: string;
  title?: string;
  lede?: string;
  submitLabel?: string;
  submittingLabel?: string;
  recordedLabel?: string;
  initial?: Expense | null;
  /** Return an error string to reject, or void to mark recorded. */
  onSubmit: (values: EntryValues) => Promise<string | void>;
  onCancel?: () => void;
  onRecorded?: () => void;
  /** When set, also renders a "Discard" action that calls this. */
  onDiscard?: () => Promise<string | void>;
  /** Seeded slip tilt. Default 0.4°. */
  tilt?: number;
  /** Reset fields after a successful record (add flow). Default false (edit flow). */
  resetOnRecorded?: boolean;
};

export function EntrySlip({
  id,
  title = 'New entry',
  lede = '',
  submitLabel = 'File the entry',
  submittingLabel = 'Filing the entry…',
  recordedLabel = 'Recorded',
  initial,
  onSubmit,
  onCancel,
  onRecorded,
  onDiscard,
  tilt = 0.4,
  resetOnRecorded = false,
}: EntrySlipProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(
    initial ? String(initial.amount) : '',
  );
  const [category, setCategory] = useState(initial?.category ?? '');
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? '');
  const [type, setType] = useState<'expense' | 'income'>(initial?.type ?? 'expense');
  const [date, setDate] = useState(initial?.date ?? today());
  const [discardBusy, setDiscardBusy] = useState(false);

  const locked = status === 'saving' || status === 'recorded' || discardBusy;
  const categories = Object.keys(CATEGORIES);
  const subcategoriesForCategory =
    category && category in CATEGORIES
      ? (CATEGORIES as Record<string, readonly string[]>)[category]
      : [];

  useEffect(() => {
    if (status !== 'recorded') return;
    const t = setTimeout(() => {
      if (resetOnRecorded) {
        setDescription('');
        setAmount('');
        setCategory('');
        setSubcategory('');
        setType('expense');
        setDate(today());
      }
      setStatus('idle');
      onRecorded?.();
    }, 700);
    return () => clearTimeout(t);
  }, [status, resetOnRecorded, onRecorded]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked) return;
    setError('');
    const parsedAmount = parseInt(amount.replace(/[.,\s]/g, ''), 10);

    if (
      !description.trim() ||
      !Number.isInteger(parsedAmount) ||
      parsedAmount <= 0 ||
      !category ||
      !date
    ) {
      setStatus('rejected');
      setError('Description, amount, category, and date must all be filled in.');
      return;
    }

    setStatus('saving');
    const result = await onSubmit({
      description: description.trim(),
      amount: parsedAmount,
      category,
      subcategory: subcategory.trim() || null,
      type,
      date,
    });

    if (typeof result === 'string' && result) {
      setStatus('rejected');
      setError(result);
      return;
    }

    setStatus('recorded');
  }

  async function handleDiscard() {
    if (!onDiscard || locked) return;
    setError('');
    setDiscardBusy(true);
    const result = await onDiscard();
    if (typeof result === 'string' && result) {
      setDiscardBusy(false);
      setStatus('rejected');
      setError(result);
    }
  }

  return (
    <div
      className="relative isolate"
      data-ledger-tilt
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <form
        onSubmit={handleSubmit}
        aria-labelledby={`${id}-heading`}
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
              Form · {initial ? 'Amend entry' : 'New entry'}
            </p>
            <h3
              id={`${id}-heading`}
              className="mt-1 font-serif text-title-2 font-bold text-ink"
            >
              {title}
            </h3>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={locked}
              className="paper-focusable paper-pressable font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute hover:text-ink disabled:opacity-40"
            >
              Close
            </button>
          )}
        </div>
        {lede && (
          <p className="mt-2 font-serif text-body text-ink-mute">{lede}</p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SlipField
            id={`${id}-description`}
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="e.g. Phở bò — quán Hưng"
            disabled={locked}
            required
            className="sm:col-span-2"
          />
          <SlipField
            id={`${id}-amount`}
            label="Amount (₫)"
            value={amount}
            onChange={setAmount}
            placeholder="120000"
            inputMode="numeric"
            disabled={locked}
            required
          />
          <SlipSelect
            id={`${id}-type`}
            label="Kind"
            value={type}
            onChange={(v) => setType(v === 'income' ? 'income' : 'expense')}
            disabled={locked}
            options={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Got back' },
            ]}
          />
          <SlipSelect
            id={`${id}-category`}
            label="Category"
            value={category}
            onChange={(next) => {
              setCategory(next);
              setSubcategory('');
            }}
            disabled={locked}
            required
            placeholder="— choose —"
            options={categories.map((c) => ({ value: c, label: c }))}
          />
          <SlipSelect
            id={`${id}-subcategory`}
            label="Subcategory"
            value={subcategory}
            onChange={setSubcategory}
            disabled={locked || subcategoriesForCategory.length === 0}
            placeholder={
              subcategoriesForCategory.length === 0 ? 'not applicable' : '— none —'
            }
            options={subcategoriesForCategory.map((s) => ({ value: s, label: s }))}
          />
          <SlipField
            id={`${id}-date`}
            label="Date"
            type="date"
            value={date}
            onChange={setDate}
            disabled={locked}
            required
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={locked}
            className="paper-focusable paper-pressable inline-flex items-center justify-center gap-2 border-2 border-ink bg-paper px-4 py-2.5 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink transition-colors hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Glyph name="pen" size={14} />
            <span>{status === 'saving' ? submittingLabel : submitLabel}</span>
          </button>
          {onDiscard && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={locked}
              className="paper-focusable paper-pressable ml-auto inline-flex items-center gap-2 border border-stamp-red bg-paper px-3 py-2 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-stamp-red transition-colors hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Glyph name="cross" size={12} />
              <span>{discardBusy ? 'Discarding…' : 'Discard'}</span>
            </button>
          )}
        </div>

        <span className="sr-only" aria-live="polite">
          {status === 'recorded' && `${recordedLabel}.`}
          {status === 'rejected' && error}
        </span>

        {status === 'recorded' && (
          <span className="pointer-events-none absolute -top-3 right-5 paper-stamp-thump">
            <Stamp text={recordedLabel} color="navy" wear={0.5} />
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
          <MarginNote inline id={`${id}-error`} className="text-stamp-red">
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
