import type { ReactNode } from 'react';
import { Glyph } from './Glyph';

/**
 * `<EmptyLine>` — empty-state primitive (§6.6).
 *
 * Prints "Nothing on this line yet." in the handwriting signature
 * face and drops a pencil-gray `✎` glyph in the margin as an invite
 * to write. Used wherever a list / table / field is empty and the
 * paper metaphor calls for something warmer than a blank pane.
 *
 * A11y: text is real text — screen readers read the copy. The margin
 * glyph is decorative.
 */
type EmptyLineProps = {
  /** Override the default copy. */
  children?: ReactNode;
  /** Hide the margin glyph (rare — only in very tight layouts). */
  hideGlyph?: boolean;
  className?: string;
};

export function EmptyLine({
  children = 'Nothing on this line yet.',
  hideGlyph = false,
  className,
}: EmptyLineProps) {
  return (
    <div
      className={`flex items-baseline gap-3 font-hand-signature text-hand-signature text-ink-faint ${className ?? ''}`}
    >
      {!hideGlyph && (
        <Glyph
          name="pen"
          size={18}
          className="shrink-0 text-pencil-gray"
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </div>
  );
}
