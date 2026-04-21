import type { ReactNode } from 'react';

/**
 * `<SummaryBox>` — pre-printed form-field box (§4.2 adjacent).
 *
 * A 1px ink border on `paper-2` fill, typewriter label top-left,
 * serif value below. Sized for the right column of the `/dashboard`
 * spread so a row of three boxes reads as one band of form fields.
 *
 * Value is a `ReactNode` so callers can mix a primary number with a
 * small suffix (e.g. `Food 43%`) without the box dictating typography.
 */
type SummaryBoxProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function SummaryBox({ label, value, className }: SummaryBoxProps) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-2 border border-ink/70 bg-paper-2 px-4 py-3 ${className ?? ''}`}
    >
      <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
        {label}
      </span>
      <span className="font-serif text-[22px] font-bold leading-none nums-lining-tabular text-ink">
        {value}
      </span>
    </div>
  );
}
