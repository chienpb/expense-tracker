'use client';

import { useState } from 'react';

/**
 * The scene slideshow — one image + caption at a time, with prev/next and a
 * filmstrip. Stops cleanly at the ends (no wrap, per plan/DECISION_LOG).
 * Plain `<img>` — no `next/image` (DECISION_LOG 2026-06-24).
 */
type Slide = { id: string; url: string; caption: string | null };

export function Slideshow({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const current = slides[i];
  const atStart = i === 0;
  const atEnd = i === slides.length - 1;

  return (
    <div className="flex flex-col gap-5">
      <figure className="flex flex-col gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.caption ?? `Scene ${i + 1}`}
          className="max-h-[70vh] w-full border-2 border-[#7a5c33] bg-[#ecdcb5] object-contain"
        />
        <figcaption className="min-h-[2rem] font-hand text-[20px] leading-snug text-pen-navy">
          {current.caption}
        </figcaption>
      </figure>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={atStart}
          className="paper-focusable paper-pressable border-2 border-[#7a5c33] bg-[#e6d2a4] px-4 py-2 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#3a2a14] transition-colors hover:bg-[#dcc488] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#7a5c33]">
          {i + 1} / {slides.length}
        </span>
        <button
          type="button"
          onClick={() => setI((n) => Math.min(slides.length - 1, n + 1))}
          disabled={atEnd}
          className="paper-focusable paper-pressable border-2 border-[#7a5c33] bg-[#e6d2a4] px-4 py-2 font-stamp text-[13px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#3a2a14] transition-colors hover:bg-[#dcc488] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      {slides.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {slides.map((s, n) => (
            <li key={s.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setI(n)}
                aria-label={`Scene ${n + 1}`}
                aria-current={n === i}
                className={`paper-focusable block border-2 ${
                  n === i ? 'border-[#a68a3b]' : 'border-[#7a5c33]/40'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.url}
                  alt=""
                  className="h-16 w-20 bg-[#ecdcb5] object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
