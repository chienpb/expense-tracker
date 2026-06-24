'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Create a trip: title / native `<input type=date>` / public toggle →
 * `POST /api/trips`, then `router.refresh()` so the new card appears.
 * Mirrors `<QuickAdd>`'s plain-fetch pattern (no server action).
 */
export function NewTripForm() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today());
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setError('');
    if (!title.trim()) {
      setError('A title is required.');
      return;
    }

    setSaving(true);
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), date, public: isPublic }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'The trip could not be recorded.');
      return;
    }

    setTitle('');
    setDate(today());
    setIsPublic(false);
    startTransition(() => router.refresh());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border-2 border-dashed border-[#7a5c33] bg-[#ecdcb5] px-5 py-5 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1">
        <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#7a5c33]">
          Title
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Đà Lạt, mùa thu"
          disabled={saving}
          className="paper-focusable border-0 border-b border-solid border-[#7a5c33] bg-transparent pb-1 font-hand text-hand text-pen-navy placeholder:text-[#a08a5c] focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#7a5c33]">
          Date
        </span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={saving}
          className="paper-focusable border-0 border-b border-solid border-[#7a5c33] bg-transparent pb-1 font-typewriter text-[14px] text-[#3a2a14] focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2 pb-1">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          disabled={saving}
          className="paper-focusable accent-[#a68a3b]"
        />
        <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#7a5c33]">
          Public
        </span>
      </label>

      <button
        type="submit"
        disabled={saving}
        className="paper-focusable paper-pressable border-2 border-[#7a5c33] bg-[#e6d2a4] px-4 py-2 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#3a2a14] transition-colors hover:bg-[#dcc488] disabled:opacity-60"
      >
        {saving ? 'Recording…' : 'Record trip →'}
      </button>

      {error && (
        <p className="font-hand text-[14px] text-stamp-red sm:basis-full">{error}</p>
      )}
    </form>
  );
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}
