import type { ReactNode } from 'react';
import { tiltFor } from '@/lib/seed-rotation';

/**
 * `<MarginNote>` — handwritten aside pulled into the page margin (§4.6).
 *
 * Default to Patrick Hand (`font-hand`) rather than Caveat per DECISION_LOG
 * 2026-04-21 "MarginNote defaults to Patrick Hand" — margin notes carry
 * Vietnamese in practice and §2.3 forbids Caveat <24px and for any
 * Vietnamese content. Pass `hand="signature"` for an English-only
 * display flourish (24px+).
 *
 * The connector is a flat 1px ink stroke that extends from the note
 * toward the referenced content. We don't track the target DOM node —
 * that's a Phase 4 concern — so the stroke is a fixed-length signal,
 * not a true arrow.
 */
type MarginNoteProps = {
  children: ReactNode;
  /** Which side of content the note pulls toward. Default `left`. */
  side?: 'left' | 'right';
  /**
   * Absolute `top` offset inside the nearest positioned ancestor.
   * Pass a string for `%`, `rem`, etc. Omit to let the note flow
   * inline (use the `inline` prop below).
   */
  top?: number | string;
  /** Render inline instead of absolutely-positioned. */
  inline?: boolean;
  /** Draw a thin ink connector from the note toward content. */
  connector?: boolean;
  /** Handwriting face. Patrick Hand by default (safe for Vietnamese). */
  hand?: 'primary' | 'signature';
  /** Tilt seed (stable). Defaults to the content if it's a string. */
  id?: string;
  className?: string;
};

export function MarginNote({
  children,
  side = 'left',
  top,
  inline = false,
  connector = false,
  hand = 'primary',
  id,
  className,
}: MarginNoteProps) {
  const seed =
    id ?? (typeof children === 'string' ? children : 'margin-note');
  const tilt = tiltFor(seed, 2);

  const fontClass =
    hand === 'signature'
      ? 'font-hand-signature text-hand-signature'
      : 'font-hand text-hand-s';

  const positionClass = inline
    ? 'relative inline-block'
    : side === 'left'
      ? 'absolute left-0 sm:left-2 sm:max-w-[var(--margin-rule-offset)]'
      : 'absolute right-0 sm:right-2 sm:max-w-[calc(var(--margin-rule-offset)+1rem)]';

  const textAlign = side === 'right' ? 'text-right' : 'text-left';

  // Inline variant must be phrasing content so it can live inside a <p>;
  // block variant stays as <aside> for the complementary-content semantics.
  const Tag = inline ? 'span' : 'aside';

  return (
    <Tag
      data-ledger-tilt
      role={inline ? 'note' : undefined}
      className={`${positionClass} ${textAlign} leading-snug text-pen-navy ${fontClass} ${className ?? ''}`}
      style={{
        top: top !== undefined ? (typeof top === 'number' ? `${top}px` : top) : undefined,
        transform: `rotate(${tilt}deg)`,
        transformOrigin: side === 'right' ? 'top right' : 'top left',
      }}
    >
      {connector && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[0.9em] h-px w-6 bg-pen-navy/70"
          style={{
            [side === 'left' ? 'right' : 'left']: '-1.75rem',
          }}
        />
      )}
      {children}
    </Tag>
  );
}
