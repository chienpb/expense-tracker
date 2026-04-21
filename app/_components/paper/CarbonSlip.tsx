import type { HTMLAttributes, ReactNode } from 'react';
import { tiltFor } from '@/lib/seed-rotation';

/**
 * `<CarbonSlip>` — a torn-off pink carbon-copy slip (§4.8).
 *
 * Background = pink-tinted paper surfaced via `color-mix` so both Day
 * and Midnight stay in-palette without a dedicated token. Border is
 * `stamp-red` at 1px. Slight rotation keeps it from reading as a
 * rectangular card; seed by `id` so the same slip always leans the
 * same way.
 *
 * Used for Quick Add forms and for any "the user fills in this and
 * hands it back" micro-surface. Not a replacement for `<Page>` — a
 * slip *sits on top* of a page, not alongside it.
 *
 * Not a form by default — wrap in `<form>` externally when you need
 * submit semantics. Keeps the slip presentational and avoids fighting
 * TypeScript's element-type narrowing.
 */
type CarbonSlipProps = {
  children: ReactNode;
  /** Tilt seed. Default `"carbon-slip"`. Set explicitly when many slips share a view. */
  id?: string;
  /** Override the seeded rotation (degrees). */
  rotation?: number;
} & Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'style'>;

export function CarbonSlip({
  children,
  id = 'carbon-slip',
  rotation,
  className,
  ...rest
}: CarbonSlipProps) {
  const angle = rotation ?? tiltFor(id, 1.5);

  return (
    <div
      data-ledger-tilt
      className={`relative border p-5 ${className ?? ''}`}
      style={{
        backgroundColor:
          'color-mix(in srgb, var(--color-stamp-red) 14%, var(--color-paper))',
        borderColor: 'var(--color-stamp-red)',
        transform: `rotate(${angle}deg)`,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
