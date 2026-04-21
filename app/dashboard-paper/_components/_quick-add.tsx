'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Glyph } from '@/app/_components/paper/Glyph';
import { EntrySlip, type EntryValues } from './_entry-slip';

/**
 * `<QuickAdd>` — the daybook's "new entry" affordance.
 *
 * Collapsed state: a typewriter-tagged call-out inviting the user to
 * file something new. Expanded state: the shared `<EntrySlip>` on pink
 * carbon paper. Same pattern as `/dashboard/recurring-paper`'s slip;
 * staying consistent keeps "filling in an official form" legible.
 *
 * Not a modal. The slip stays inline at the bottom of the ledger
 * section so the page never loses its ruled rhythm. The user has to
 * scroll, not dismiss a scrim, to get back to the register.
 */
export function QuickAdd() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  async function handleSubmit(values: EntryValues): Promise<string | void> {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return data.error ?? 'The clerk could not file this entry.';
    }
    startTransition(() => router.refresh());
  }

  if (!open) {
    return (
      <div className="flex items-center justify-between gap-4 border-t border-ink/20 pt-4">
        <p className="font-hand-signature text-hand-signature text-ink-mute">
          Missed something? File it on a new line.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="paper-focusable paper-pressable inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-2 font-stamp text-[12px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink transition-colors hover:bg-paper-2"
        >
          <Glyph name="pen" size={13} />
          <span>File a new entry</span>
        </button>
      </div>
    );
  }

  return (
    <EntrySlip
      id="quick-add"
      title="File a new entry"
      lede="A few lines for the clerk. Description, amount, and a category will do."
      submitLabel="File the entry"
      submittingLabel="Filing the entry…"
      recordedLabel="Recorded"
      resetOnRecorded
      onSubmit={handleSubmit}
      onCancel={() => setOpen(false)}
      onRecorded={() => setOpen(false)}
    />
  );
}
