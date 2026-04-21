import type { ReactNode } from 'react';

/**
 * `<RedStringCorrection>` — visible edit history (§4.14 · §6.10).
 *
 * When a user overwrites a value, the prior version stays visible
 * with a stamp-red horizontal strike and the new value is written
 * fresh next to it. This is the whole point of the paper metaphor:
 * edits never happen silently.
 *
 * The strike is drawn as an inline SVG on top of the struck text so
 * it reads as a pen stroke rather than CSS `text-decoration-line`
 * (which dips between descenders — an editor never does that). Chain
 * prior values via the `history` array — latest first, oldest last.
 *
 * A11y: announce the current value to screen readers and mark the
 * history as supplementary so AT users hear "45.000 ₫, previously
 * 42.000 ₫" rather than reading every struck version in sequence.
 * The whole element is rendered as an `<ins>`/`<del>` tree so tools
 * that understand edit semantics (including AX trees) pick it up.
 *
 * Visibility of history is controlled by `data-show-edit-history` on
 * `<html>` (set by `lib/settings.ts`); when the user has hidden it,
 * we render only the current value — the strike tree collapses.
 */
type RedStringCorrectionProps = {
  /** Current value — the one written last. Rendered in the handwriting layer. */
  current: ReactNode;
  /** Prior value. For multiple edits pass via `history`. */
  previous?: ReactNode;
  /** Full edit history, newest first. Takes precedence over `previous`. */
  history?: ReactNode[];
  /**
   * Layout direction. `'before'` places struck values *before* the current
   * value (reading order: old → new), `'after'` reverses (new → old).
   * Default `'before'` — matches how ledger entries grow rightward.
   */
  order?: 'before' | 'after';
  /** Visual size of the strike stroke. Default 1.25px. */
  strikeWidth?: number;
  className?: string;
};

export function RedStringCorrection({
  current,
  previous,
  history,
  order = 'before',
  strikeWidth = 1.25,
  className,
}: RedStringCorrectionProps) {
  const priors = history ?? (previous !== undefined ? [previous] : []);

  // Newest-first input, but we want to render oldest → newest when
  // `order === 'before'` so reading order mirrors the chronology.
  const chain = order === 'before' ? [...priors].reverse() : priors;

  return (
    <span
      className={`paper-correction inline-flex items-baseline gap-2 ${className ?? ''}`}
    >
      {order === 'before' &&
        chain.map((value, i) => (
          <StruckValue
            key={`pre-${i}`}
            value={value}
            strikeWidth={strikeWidth}
          />
        ))}
      <ins className="font-hand text-hand text-pen-navy no-underline">
        {current}
      </ins>
      {order === 'after' &&
        chain.map((value, i) => (
          <StruckValue
            key={`post-${i}`}
            value={value}
            strikeWidth={strikeWidth}
          />
        ))}
    </span>
  );
}

function StruckValue({
  value,
  strikeWidth,
}: {
  value: ReactNode;
  strikeWidth: number;
}) {
  return (
    <del
      className="paper-correction-strike relative font-hand text-hand text-pen-navy/70 no-underline"
      data-ledger-tilt
    >
      {value}
      {/* The pen stroke. Stretched to the del's bounding box via CSS;
          a single gentle quadratic so it reads as one stroke, not a
          ruled underline. `filter: url(#hand-wobble)` gives it the
          jitter of a real pen. */}
      <svg
        aria-hidden="true"
        role="presentation"
        focusable="false"
        viewBox="0 0 100 6"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[0.35em] -translate-y-1/2"
      >
        <path
          d="M 1 3 Q 30 1 55 4 T 99 2"
          fill="none"
          stroke="var(--color-stamp-red)"
          strokeWidth={strikeWidth}
          strokeLinecap="round"
          style={{ filter: 'url(#hand-wobble)' }}
        />
      </svg>
    </del>
  );
}
