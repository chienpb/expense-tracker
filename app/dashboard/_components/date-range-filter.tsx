'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { RANGE_LABELS, type RangeKey } from '@/lib/dashboard/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';

const PRESETS = Object.entries(RANGE_LABELS).filter(([k]) => k !== 'custom') as [RangeKey, string][];

function formatLabel(range: RangeKey, from: string, to: string): string {
  if (range === 'custom') {
    const f = new Date(from + 'T00:00:00');
    const t = new Date(to + 'T00:00:00');
    return `${format(f, 'd MMM')} – ${format(t, 'd MMM')}`;
  }
  return RANGE_LABELS[range];
}

export function DateRangeFilter({ current, from, to }: { current: RangeKey; from: string; to: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    current === 'custom' ? { from: new Date(from + 'T00:00:00'), to: new Date(to + 'T00:00:00') } : undefined
  );

  function selectPreset(key: RangeKey) {
    setCustomRange(undefined);
    setOpen(false);
    router.push(`/dashboard?range=${key}`);
  }

  function applyCustom() {
    if (!customRange?.from || !customRange?.to) return;
    setOpen(false);
    const f = format(customRange.from, 'yyyy-MM-dd');
    const t = format(customRange.to, 'yyyy-MM-dd');
    router.push(`/dashboard?range=custom&from=${f}&to=${t}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="border-b-2 border-transparent px-1 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground aria-expanded:border-foreground aria-expanded:text-foreground">
          {formatLabel(current, from, to)}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto rounded-sm border border-border bg-card p-0 shadow-none animate-none data-open:animate-none data-closed:animate-none"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Presets */}
          <div className="flex flex-col border-b border-border p-2 sm:border-b-0 sm:border-r">
            {PRESETS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => selectPreset(key)}
                className={`px-3 py-1.5 text-left text-sm ${
                  key === current
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <div className="p-2">
            <Calendar
              mode="range"
              selected={customRange}
              onSelect={setCustomRange}
              numberOfMonths={1}
              disabled={{ after: new Date() }}
              defaultMonth={customRange?.from ?? new Date()}
            />
            <div className="flex items-center justify-end gap-3 border-t border-border px-2 pt-2">
              <button
                onClick={() => { setCustomRange(undefined); setOpen(false); }}
                className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={applyCustom}
                disabled={!customRange?.from || !customRange?.to}
                className="px-2 py-1 text-sm font-medium text-foreground disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
