import type { ReactNode } from 'react';
import { stampRotationFor } from '@/lib/seed-rotation';

/**
 * `<Stamp>` — rubber stamp impression (§4.4 · §2.4).
 *
 * Archivo Black inside a 2px border, rotated 4–8°, pushed through
 * `url(#stamp-wear)` for the broken-ink look. The `wear` knob fades
 * the stamp toward a spent ink pad (higher wear → lower opacity); at
 * `wear=0` we skip the filter entirely for a clean ceremonial stamp
 * (wax-seal annual accents, §2.4-adjacent usage).
 *
 * The stamp is meaningful — it encodes state (RECORDED, DUE, PAID,
 * VOID). `text` is lifted into the a11y tree as the accessible name;
 * the filter and rotation are presentation-only.
 */
export type StampColor = 'red' | 'navy' | 'gold';

type StampProps = {
  text: string;
  subtext?: string;
  color?: StampColor;
  /** Rotation in degrees. Omitted → seeded from `id` (or `text`) in 4–8°. */
  rotation?: number;
  /** 0–1 · ink-pad exhaustion. Default 0.6. */
  wear?: number;
  /** Seed for deterministic rotation. Defaults to `text`. */
  id?: string;
  /** Render the text content (no filter, no rotation) for a11y. Useful in CI. */
  plain?: boolean;
  className?: string;
  children?: ReactNode;
};

const COLOR_MAP: Record<StampColor, { text: string; border: string }> = {
  red: { text: 'text-stamp-red', border: 'border-stamp-red' },
  navy: { text: 'text-pen-navy', border: 'border-pen-navy' },
  gold: { text: 'text-seal-gold', border: 'border-seal-gold' },
};

export function Stamp({
  text,
  subtext,
  color = 'red',
  rotation,
  wear = 0.6,
  id,
  plain = false,
  className,
  children,
}: StampProps) {
  const angle = rotation ?? stampRotationFor(id ?? text);
  const palette = COLOR_MAP[color];
  const ariaLabel = subtext ? `${text} ${subtext}` : text;
  // Higher wear → lower opacity. Cap at 0.65 so the stamp always
  // reads cleanly even on a "spent" ink pad.
  const opacity = plain ? 1 : Math.max(0.65, 1 - wear * 0.35);

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      data-ledger-tilt
      className={`inline-flex flex-col items-center border-2 px-3 py-1 font-stamp uppercase leading-none tracking-[var(--letter-spacing-label-s)] ${palette.border} ${palette.text} ${className ?? ''}`}
      style={{
        transform: plain ? undefined : `rotate(${angle}deg)`,
        filter: plain || wear === 0 ? undefined : 'url(#stamp-wear)',
        opacity,
      }}
    >
      <span aria-hidden="true" className="text-[13px]">
        {text}
      </span>
      {subtext && (
        <span
          aria-hidden="true"
          className="mt-0.5 text-[9px] tracking-[var(--letter-spacing-label-m)]"
        >
          {subtext}
        </span>
      )}
      {children}
    </span>
  );
}
