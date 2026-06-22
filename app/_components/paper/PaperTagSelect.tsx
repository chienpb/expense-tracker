'use client';

import type { ChangeEvent } from 'react';

/**
 * `<PaperTagSelect>` — a native `<select>` dressed as a manila file tag.
 *
 * The mobile (§3.4) stand-in for the `<FileTab>` strip and the dashboard
 * masthead: below 640px a row of tabs can't fit at 375px, so the tablist
 * collapses to this single tag. It is a real `<select>` so the platform
 * picker (and its built-in a11y) does the heavy lifting; only the closed
 * trigger is styled — `paper-2` fill, ink border, typewriter caps, with a
 * pencil chevron and a clipped top-left corner so it reads as a tag, not
 * an OS dropdown.
 */
export type PaperTagOption = {
  value: string;
  label: string;
};

type PaperTagSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: PaperTagOption[];
  'aria-label': string;
  className?: string;
};

export function PaperTagSelect({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  className,
}: PaperTagSelectProps) {
  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    onChange(e.target.value);
  }

  return (
    <span className={`relative inline-flex ${className ?? ''}`}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={handleChange}
        className="paper-focusable w-full appearance-none border border-ink bg-paper-2 py-1.5 pl-3 pr-9 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink"
        style={{
          // Clip the top-left corner so the closed control reads as a
          // paper file tag rather than a rounded OS select.
          clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Pencil chevron — decorative; the native control owns the affordance. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-typewriter text-[10px] text-ink-mute"
      >
        ▾
      </span>
    </span>
  );
}
