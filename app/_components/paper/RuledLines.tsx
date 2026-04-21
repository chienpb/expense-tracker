/**
 * Horizontal notebook ruled lines — 1px `rule-blue` every 32px,
 * anchored to a 12px top offset per §3.1. Expected to sit inside a
 * `position: relative` surface (typically the future `<Page>`).
 *
 * Even-empty-space rule: the lines continue through empty areas of
 * the page — that's what makes the surface recognisably "paper."
 */
type RuledLinesProps = {
  /** Top offset of the first rule line. Defaults to 12px per §3.1. */
  offset?: number | string;
  className?: string;
};

export function RuledLines({ offset = 12, className }: RuledLinesProps) {
  const offsetValue = typeof offset === 'number' ? `${offset}px` : offset;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none absolute inset-0 ${className ?? ''}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, var(--color-rule-blue) 0, var(--color-rule-blue) 1px, transparent 1px, transparent var(--rule-spacing))',
        backgroundPosition: `0 ${offsetValue}`,
      }}
    />
  );
}
