import { formatVND } from '@/lib/dashboard/utils';
import { tiltFor } from '@/lib/seed-rotation';
import type { CategorySpending } from '@/lib/dashboard/queries';

/**
 * `<CategoryChart>` — ranked horizontal strokes, one category per row.
 *
 * The Swiss dashboard uses a horizontal-bar list here and the form
 * reads well at any width, so the Paper port keeps the layout and just
 * swaps the drawing primitive. Each row is a pen-navy rectangle pushed
 * through `#hand-wobble` so the edges feel drawn, not rendered. The
 * top-ranked row swaps to `stamp-red` (the same "the biggest line
 * stands out" signal the Swiss chart ships).
 *
 * Category labels carry a seeded tilt so the ranked list keeps the
 * ledger's handwritten-in-a-hurry feel; amounts stay typeset in
 * oldstyle-tabular so the column lines up.
 *
 * No hit targets — categories don't drill into a filtered view yet.
 * That's deferred to the settings pass in Phase 5.5; bar rows stay
 * static until then.
 */
type CategoryChartProps = {
  data: CategorySpending[];
};

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="border border-ink/20 bg-paper-2 px-5 py-10 font-hand-signature text-hand-signature text-ink-faint">
        Nothing charged to a category yet.
      </div>
    );
  }

  const peak = data[0]?.total ?? 0;

  return (
    <ol className="flex list-none flex-col gap-3 border border-ink/15 bg-paper p-5">
      {data.map((entry, i) => {
        const pct = peak > 0 ? (entry.total / peak) * 100 : 0;
        const isTop = i === 0;
        const color = isTop ? 'var(--color-stamp-red)' : 'var(--color-pen-navy)';
        const tilt = tiltFor(`cat-${entry.category}`, 0.8);

        return (
          <li key={entry.category} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-4">
              <span
                data-ledger-tilt
                className="inline-block origin-left font-hand text-hand text-pen-navy"
                style={{ transform: `rotate(${tilt}deg)` }}
              >
                {entry.category}
              </span>
              <span className="font-serif text-body nums-oldstyle-tabular text-ink">
                {formatVND(entry.total)}
              </span>
            </div>
            <svg
              aria-hidden="true"
              role="presentation"
              focusable="false"
              viewBox="0 0 400 10"
              preserveAspectRatio="none"
              width="100%"
              height={10}
              style={{ filter: 'url(#hand-wobble)' }}
            >
              <rect
                x={0}
                y={2}
                width={(pct / 100) * 400}
                height={6}
                fill={color}
                fillOpacity={0.22}
                stroke={color}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sr-only">
              {entry.category} · {formatVND(entry.total)} across {entry.count}{' '}
              {entry.count === 1 ? 'entry' : 'entries'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
