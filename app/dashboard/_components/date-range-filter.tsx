'use client';

import { useRouter } from 'next/navigation';
import { RANGE_LABELS, type RangeKey } from '@/lib/dashboard/utils';

export function DateRangeFilter({ current }: { current: RangeKey }) {
  const router = useRouter();

  return (
    <div className="flex gap-1">
      {Object.entries(RANGE_LABELS).map(([key, label]) => (
        <button
          key={key}
          onClick={() => router.push(`/dashboard?range=${key}`)}
          className={`px-3 py-1.5 text-xs uppercase tracking-wide transition-none ${
            key === current
              ? 'border-b-2 border-foreground text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
