import type { ReactNode } from 'react';

/**
 * `<PencilNote>` — AI-suggested (uncommitted) text (§6.9).
 *
 * Renders its children in `pencil-gray` with the `#pencil-stroke`
 * filter so the suggestion reads as graphite rather than ink. The
 * metaphor: "the AI is penciling this in; commit it to keep it." On
 * accept, flip `accepted={true}` — the component animates from
 * pencil-gray to pen-navy and drops the filter (220ms, §8 easing).
 *
 * Prefer this over ad-hoc `text-pencil-gray` spans so the filter
 * and the transition stay consistent.
 */
type PencilNoteProps = {
  children: ReactNode;
  /** Has the suggestion been committed to ink? */
  accepted?: boolean;
  /** Tag name. Default `'span'` (phrasing). Pass `'div'` for block. */
  as?: 'span' | 'div';
  className?: string;
};

export function PencilNote({
  children,
  accepted = false,
  as = 'span',
  className,
}: PencilNoteProps) {
  const Tag = as;
  return (
    <Tag
      className={`${accepted ? 'paper-pencil-accepted' : 'paper-pencil'} font-hand text-hand ${className ?? ''}`}
    >
      {children}
    </Tag>
  );
}
