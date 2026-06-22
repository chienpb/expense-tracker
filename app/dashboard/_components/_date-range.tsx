'use client';

import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import {
  PaperSelect,
  type PaperSelectOption,
} from '@/app/_components/paper/PaperSelect';
import { RANGE_LABELS, type RangeKey } from '@/lib/dashboard/utils';

/**
 * `<DateRangeTabs>` — compact range chip.
 *
 * Replaces the original six-pill row with a single paper chip:
 * `LAST 7 DAYS · APR 15–21 ▾`. Click opens a `<PaperSelect>` listbox of
 * presets. The chip keeps the label row on one line and removes the
 * redundancy between overlapping presets ("This week" next to "Last 7
 * days") by pushing them behind the menu instead of competing for a
 * button slot.
 *
 * Custom ranges stay deferred to Phase 5.5 — `custom` is excluded from
 * the preset list. The component retains the `from` / `to` props so the
 * trigger can show the active window; they are not yet editable here.
 */
const PRESET_KEYS = (Object.keys(RANGE_LABELS) as RangeKey[]).filter(
  (k) => k !== 'custom',
);

const PRESET_OPTIONS: PaperSelectOption[] = PRESET_KEYS.map((k) => ({
  value: k,
  label: RANGE_LABELS[k],
}));

type DateRangeTabsProps = {
  current: RangeKey;
  from?: string;
  to?: string;
};

export function DateRangeTabs({ current, from, to }: DateRangeTabsProps) {
  const router = useRouter();
  const window = formatWindow(from, to);

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
        Range
      </span>
      <PaperSelect
        aria-label="Select date range"
        variant="chip"
        value={current}
        onChange={(next) => router.push(`/dashboard?range=${next}`)}
        options={PRESET_OPTIONS}
        className="min-w-0 flex-1 sm:min-w-[15rem] sm:flex-none"
        renderTrigger={(selected) => (
          <span className="inline-flex items-baseline gap-2">
            <span>{selected?.label ?? RANGE_LABELS[current]}</span>
            {window && (
              <span
                className="font-typewriter text-[10px] normal-case tracking-normal text-ink-mute"
                aria-hidden
              >
                · {window}
              </span>
            )}
          </span>
        )}
      />
    </div>
  );
}

function formatWindow(from?: string, to?: string): string | null {
  if (!from || !to) return null;
  try {
    const f = parseISO(from);
    const t = parseISO(to);
    if (from === to) return format(f, 'MMM d');
    if (f.getMonth() === t.getMonth() && f.getFullYear() === t.getFullYear()) {
      return `${format(f, 'MMM d')}–${format(t, 'd')}`;
    }
    return `${format(f, 'MMM d')} – ${format(t, 'MMM d')}`;
  } catch {
    return null;
  }
}
