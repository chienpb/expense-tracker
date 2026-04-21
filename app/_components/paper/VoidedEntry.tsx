import type { ReactNode } from 'react';
import { Stamp } from './Stamp';

/**
 * `<VoidedEntry>` — deleted-recently wrapper (§6.11).
 *
 * Paints its children with a stamp-red strike line and floats a VOID
 * stamp over the top-right corner. The whole element uses the
 * `paper-row-voided` keyframe (5s total, fades to zero at the tail)
 * so it acts as a short-lived confirmation before disappearing. The
 * consumer controls unmount after the animation fires `onExpire`.
 *
 * Outside of table rows (which use the class via `data-status`),
 * this wrapper is how we void a freestanding card or slip.
 */
type VoidedEntryProps = {
  children: ReactNode;
  /** Called ~5s after mount when the fade completes. */
  onExpire?: () => void;
  /** Stamp text. Default `'Void'`. */
  stampText?: string;
  className?: string;
};

export function VoidedEntry({
  children,
  onExpire,
  stampText = 'Void',
  className,
}: VoidedEntryProps) {
  return (
    <div
      className={`paper-row-voided relative ${className ?? ''}`}
      onAnimationEnd={(e) => {
        // The row fades via the `paper-void-fade` keyframe on itself.
        // Filter by animation name so nested element animations don't
        // spuriously fire the expire callback.
        if (e.animationName.includes('paper-void-fade')) onExpire?.();
      }}
    >
      {children}
      <span className="pointer-events-none absolute -top-2 right-2 z-10">
        <Stamp text={stampText} color="red" wear={0.75} />
      </span>
    </div>
  );
}
