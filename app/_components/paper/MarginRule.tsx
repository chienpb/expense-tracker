/**
 * The single pink vertical margin rule — 1px `rule-pink` at 60px from
 * the left edge on desktop, 36px on mobile (§3.1 · §3.4).
 *
 * Exactly one per page. Nothing crosses it except headers and
 * decorative elements (tape strips). Sits inside a `position: relative`
 * surface; stretches the full height of its container.
 *
 * The offset is driven by the `--margin-rule-offset` /
 * `--margin-rule-offset-mobile` CSS variables in `globals.css` so the
 * whole system shifts with one token change.
 */
type MarginRuleProps = {
  className?: string;
};

export function MarginRule({ className }: MarginRuleProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none absolute top-0 bottom-0 w-px bg-rule-pink left-[var(--margin-rule-offset-mobile)] sm:left-[var(--margin-rule-offset)] ${className ?? ''}`}
    />
  );
}
