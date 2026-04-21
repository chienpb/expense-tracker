'use client';

import { useRouter } from 'next/navigation';
import { RANGE_LABELS, type RangeKey } from '@/lib/dashboard/utils';

/**
 * `<DateRangeTabs>` — paper-tab range picker.
 *
 * Replaces the popover calendar chip from the Swiss dashboard with a
 * flat row of typewriter tabs — one per preset. The current tab fills
 * `ink` / `paper` so it reads as the active surface, the rest sit in
 * `paper-2` with an ink underline. Matches §4.9's file-tab treatment
 * in miniature without claiming to *be* a `<FileTab>`, which is for
 * document-level navigation.
 *
 * Custom ranges — the Swiss popover let users pick arbitrary date
 * windows. That flow is deferred to Phase 5.5 along with the rest of
 * settings; preset ranges cover the daily use cases and keep the
 * Phase 5.4 diff bounded. Dropping the popover also removes the
 * Radix/shadcn dependency from the paper dashboard.
 */
const PRESETS = (Object.keys(RANGE_LABELS) as RangeKey[]).filter(
  (k) => k !== 'custom',
);

type DateRangeTabsProps = {
  current: RangeKey;
  /** Retained for flag-off parity; ignored in Paper until Phase 5.5. */
  from?: string;
  to?: string;
};

export function DateRangeTabs({ current }: DateRangeTabsProps) {
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label="Range"
      className="flex flex-wrap items-center gap-1"
    >
      <span className="mr-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
        Range
      </span>
      {PRESETS.map((key) => {
        const active = key === current;
        return (
          <button
            key={key}
            type="button"
            onClick={() => router.push(`/dashboard?range=${key}`)}
            aria-pressed={active}
            className={`paper-focusable paper-pressable border border-ink/50 px-2.5 py-1 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] transition-colors ${
              active
                ? 'border-ink bg-ink text-paper'
                : 'bg-paper-2 text-ink-mute hover:bg-paper hover:text-ink'
            }`}
          >
            {RANGE_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}
