import type { ReactNode } from 'react';
import { tiltFor } from '@/lib/seed-rotation';
import { Stamp, type StampColor } from './Stamp';

/**
 * `<FieldLine>` — the fundamental label-above-slot row (§4.2).
 *
 * Three rendering kinds, all sharing the same 1px black underline:
 *
 *   print   — system-authored: Crimson Pro, `ink`, body size.
 *   hand    — user-authored:   Patrick Hand, `pen-navy`, 1.3–1.5×,
 *             tilted deterministically via `tiltFor(id)`.
 *   stamped — confirmed value: print renderer + inline `<Stamp>`.
 *
 * Empty state prints the Caveat fallback ("Nothing on this line yet.")
 * in `ink-faint`; disabled state dashes the underline, fades the
 * label, and suppresses the empty copy (an inert row shouldn't
 * invite input). The component is display-only — Phase 4 ships the
 * editable sibling.
 */
export type FieldLineKind = 'hand' | 'print' | 'stamped';

type FieldLineProps = {
  label: string;
  value?: ReactNode;
  kind?: FieldLineKind;
  /** For `kind="stamped"` — passed straight through to `<Stamp>`. */
  stamp?: {
    text: string;
    subtext?: string;
    color?: StampColor;
    wear?: number;
  };
  /**
   * Tilt seed for `kind="hand"`. Defaults to `label` so the same
   * field always leans the same way across SSR/CSR.
   */
  id?: string;
  disabled?: boolean;
  /** Override the empty-state copy. Default: "Nothing on this line yet." */
  emptyText?: string;
  className?: string;
};

export function FieldLine({
  label,
  value,
  kind = 'hand',
  stamp,
  id,
  disabled = false,
  emptyText = 'Nothing on this line yet.',
  className,
}: FieldLineProps) {
  const isEmpty = value === undefined || value === null || value === '';
  const seed = id ?? label;
  const tilt = kind === 'hand' && !disabled ? tiltFor(seed, 1.5) : 0;

  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span
        className={`font-typewriter text-label uppercase tracking-[var(--letter-spacing-label-s)] ${
          disabled ? 'text-ink-faint' : 'text-ink-mute'
        }`}
      >
        {label}
      </span>

      <div
        className={`relative flex min-h-[1.75rem] items-baseline gap-3 pb-1 border-b ${
          disabled
            ? 'border-dashed border-ink-faint'
            : 'border-solid border-ink'
        }`}
      >
        {isEmpty ? (
          !disabled && (
            <span className="font-hand-signature text-hand-s text-ink-faint">
              {emptyText}
            </span>
          )
        ) : (
          <FieldValue
            kind={kind}
            disabled={disabled}
            tilt={tilt}
            seed={seed}
          >
            {value}
          </FieldValue>
        )}

        {kind === 'stamped' && stamp && !isEmpty && (
          <span className="ml-auto self-center">
            <Stamp
              text={stamp.text}
              subtext={stamp.subtext}
              color={stamp.color}
              wear={stamp.wear}
              id={`${seed}-stamp`}
              className="text-[11px]"
            />
          </span>
        )}
      </div>
    </div>
  );
}

function FieldValue({
  kind,
  disabled,
  tilt,
  seed,
  children,
}: {
  kind: FieldLineKind;
  disabled: boolean;
  tilt: number;
  seed: string;
  children: ReactNode;
}) {
  if (kind === 'hand') {
    return (
      <span
        data-ledger-tilt
        style={{ transform: `rotate(${tilt}deg)` }}
        className={`inline-block origin-left font-hand text-hand ${
          disabled ? 'text-ink-faint' : 'text-pen-navy'
        }`}
      >
        {children}
      </span>
    );
  }
  // `print` and the non-stamp portion of `stamped`.
  void seed;
  return (
    <span
      className={`font-serif text-body ${
        disabled ? 'text-ink-faint' : 'text-ink'
      }`}
    >
      {children}
    </span>
  );
}
