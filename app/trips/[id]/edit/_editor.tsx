'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Trip editor — upload scenes, edit captions, reorder (up/down swap), delete
 * scenes, toggle public, delete the trip. Every mutation is a plain `fetch`
 * to `/api/trips*` + `router.refresh()`; the client never tracks `position`
 * (swap is by id pair, the server reorders). No DnD (DECISION_LOG 2026-06-24).
 */
type Scene = { id: string; url: string; caption: string | null };
type Trip = { id: string; title: string; date: string; public: boolean };

export function TripEditor({ trip, scenes }: { trip: Trip; scenes: Scene[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = () => startTransition(() => router.refresh());

  async function send(
    url: string,
    method: string,
    body: BodyInit | null,
    headers?: HeadersInit,
  ): Promise<boolean> {
    setBusy(true);
    setError('');
    const res = await fetch(url, { method, body, headers });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'The clerk could not file this change.');
      return false;
    }
    return true;
  }

  async function uploadScene(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set('tripId', trip.id);
    if (!(fd.get('image') instanceof File) || (fd.get('image') as File).size === 0) {
      setError('Choose an image first.');
      return;
    }
    if (await send('/api/trips/scenes', 'POST', fd)) {
      form.reset();
      refresh();
    }
  }

  async function saveCaption(id: string, caption: string) {
    if (await send(
      '/api/trips/scenes',
      'PATCH',
      JSON.stringify({ id, caption }),
      { 'Content-Type': 'application/json' },
    )) refresh();
  }

  async function swap(a: string, b: string) {
    if (await send(
      '/api/trips/scenes',
      'PATCH',
      JSON.stringify({ swap: [a, b] }),
      { 'Content-Type': 'application/json' },
    )) refresh();
  }

  async function removeScene(id: string) {
    if (await send(
      '/api/trips/scenes',
      'DELETE',
      JSON.stringify({ id }),
      { 'Content-Type': 'application/json' },
    )) refresh();
  }

  async function saveTrip(patch: { title?: string; date?: string; public?: boolean }) {
    if (await send(
      '/api/trips',
      'PATCH',
      JSON.stringify({ id: trip.id, ...patch }),
      { 'Content-Type': 'application/json' },
    )) refresh();
  }

  async function deleteTrip() {
    if (!confirm('Delete this trip and all its scenes? This cannot be undone.')) return;
    if (await send(
      '/api/trips',
      'DELETE',
      JSON.stringify({ id: trip.id }),
      { 'Content-Type': 'application/json' },
    )) {
      router.push('/trips');
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Title & date — server re-renders the Parchment heading on save */}
      <div className="flex flex-col gap-3">
        <DraftField
          label="Title"
          type="text"
          initial={trip.title}
          disabled={busy}
          onSave={(v) => saveTrip({ title: v })}
        />
        <DraftField
          label="Date"
          type="date"
          initial={trip.date}
          disabled={busy}
          onSave={(v) => saveTrip({ date: v })}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={trip.public}
            disabled={busy}
            onChange={(e) => saveTrip({ public: e.target.checked })}
            className="paper-focusable accent-[#a68a3b]"
          />
          <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#7a5c33]">
            Public — anyone with the link can view
          </span>
        </label>
        <Link
          href={`/trips/${trip.id}`}
          className="paper-focusable font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#7a5c33] underline"
        >
          ☞ View trip
        </Link>
      </div>

      {error && <p className="font-hand text-[16px] text-stamp-red">{error}</p>}

      {/* Add a scene */}
      <form
        onSubmit={uploadScene}
        className="flex flex-col gap-3 border-2 border-dashed border-[#7a5c33] bg-[#ecdcb5] px-5 py-5"
      >
        <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#7a5c33]">
          Add a scene
        </p>
        <input
          type="file"
          name="image"
          accept="image/*"
          disabled={busy}
          className="paper-focusable font-typewriter text-[12px] text-[#3a2a14]"
        />
        <input
          type="text"
          name="caption"
          placeholder="A caption for this scene…"
          disabled={busy}
          className="paper-focusable border-0 border-b border-solid border-[#7a5c33] bg-transparent pb-1 font-hand text-hand text-pen-navy placeholder:text-[#a08a5c] focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="paper-focusable paper-pressable self-start border-2 border-[#7a5c33] bg-[#e6d2a4] px-4 py-2 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#3a2a14] transition-colors hover:bg-[#dcc488] disabled:opacity-60"
        >
          {busy ? 'Working…' : 'Add scene →'}
        </button>
      </form>

      {/* Scenes */}
      {scenes.length === 0 ? (
        <p className="font-serif text-[18px] italic text-[#7a5c33]">
          No scenes yet. Add the first one above.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {scenes.map((s, n) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 border-2 border-[#7a5c33] bg-[#ecdcb5] px-4 py-4 sm:flex-row sm:items-start"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.url}
                alt={s.caption ?? `Scene ${n + 1}`}
                className="h-28 w-40 shrink-0 border-2 border-[#7a5c33] object-cover"
              />
              <div className="flex flex-1 flex-col gap-3">
                <CaptionField
                  initial={s.caption ?? ''}
                  disabled={busy}
                  onSave={(v) => saveCaption(s.id, v)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || n === 0}
                    onClick={() => swap(s.id, scenes[n - 1].id)}
                    className="paper-focusable border border-[#7a5c33] px-2 py-1 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-[#3a2a14] disabled:opacity-30"
                  >
                    ↑ Up
                  </button>
                  <button
                    type="button"
                    disabled={busy || n === scenes.length - 1}
                    onClick={() => swap(s.id, scenes[n + 1].id)}
                    className="paper-focusable border border-[#7a5c33] px-2 py-1 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-[#3a2a14] disabled:opacity-30"
                  >
                    ↓ Down
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeScene(s.id)}
                    className="paper-focusable ml-auto border border-stamp-red px-2 py-1 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-stamp-red disabled:opacity-30"
                  >
                    × Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t-2 border-dashed border-[#7a5c33] pt-5">
        <button
          type="button"
          disabled={busy}
          onClick={deleteTrip}
          className="paper-focusable border-2 border-stamp-red px-4 py-2 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-stamp-red transition-colors hover:bg-stamp-red/10 disabled:opacity-60"
        >
          × Delete trip
        </button>
      </div>
    </div>
  );
}

/** Labelled trip field (title/date) — local draft, saves on the button or
 *  Enter. Empty is never saved (both columns are NOT NULL). */
function DraftField({
  label,
  type,
  initial,
  disabled,
  onSave,
}: {
  label: string;
  type: 'text' | 'date';
  initial: string;
  disabled: boolean;
  onSave: (v: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const dirty = value !== initial && value.trim() !== '';
  return (
    <div className="flex items-end gap-2">
      <span className="w-12 shrink-0 pb-1 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#7a5c33]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && dirty) onSave(value);
        }}
        className="paper-focusable w-full border-0 border-b border-solid border-[#7a5c33] bg-transparent pb-1 font-hand text-hand text-pen-navy focus:outline-none"
      />
      <button
        type="button"
        disabled={disabled || !dirty}
        onClick={() => onSave(value)}
        className="paper-focusable shrink-0 border border-[#7a5c33] px-2 py-1 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-[#3a2a14] disabled:opacity-30"
      >
        Save
      </button>
    </div>
  );
}

/** Caption editor — local draft, saves on the button (or Enter). */
function CaptionField({
  initial,
  disabled,
  onSave,
}: {
  initial: string;
  disabled: boolean;
  onSave: (v: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const dirty = value !== initial;
  return (
    <div className="flex items-end gap-2">
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && dirty) onSave(value);
        }}
        placeholder="A caption for this scene…"
        className="paper-focusable w-full border-0 border-b border-solid border-[#7a5c33] bg-transparent pb-1 font-hand text-hand text-pen-navy placeholder:text-[#a08a5c] focus:outline-none"
      />
      <button
        type="button"
        disabled={disabled || !dirty}
        onClick={() => onSave(value)}
        className="paper-focusable shrink-0 border border-[#7a5c33] px-2 py-1 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-[#3a2a14] disabled:opacity-30"
      >
        Save
      </button>
    </div>
  );
}
