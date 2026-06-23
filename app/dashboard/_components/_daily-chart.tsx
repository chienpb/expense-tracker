'use client';

import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { formatVND, formatVNDShort } from '@/lib/dashboard/utils';
import type { DailySpending } from '@/lib/dashboard/queries';
import type { RangeKey } from '@/lib/dashboard/utils';

/**
 * `<DailyChart>` — per-day spending bars on the daybook hero.
 *
 * Built on top of `<HandDrawnChart kind="bar">`'s geometry but rendered
 * inline so we can:
 *  1. Make every bar a keyboard-activatable hit target (the Swiss chart
 *     used Recharts' onClick — fine visually, poor for a11y).
 *  2. Re-stack income on top of spend with a different fill so refunds
 *     read as "negative over positive" at a glance.
 *  3. Mark the selected day with a pen-navy outline + a Caveat margin
 *     note so the ruled page keeps its register rhythm.
 *
 * Click/Enter/Space on a bar navigates to `/dashboard?…&day=YYYY-MM-DD`;
 * clicking the selected day again clears the drill-in. Search-param
 * construction matches `/dashboard/_components/spending-chart.tsx` so
 * the flag-off Swiss behavior and the flag-on Paper behavior are URL-
 * compatible.
 *
 * The raw SVG is pushed through `#hand-wobble` for the pen-drawn look
 * per the Phase 4 decision to avoid Recharts on ink-drawn charts
 * (DECISION_LOG 2026-04-21).
 */
type DailyChartProps = {
  data: DailySpending[];
  categoriesByDay: Record<string, { category: string; total: number }[]>;
  selectedDay?: string;
  range: RangeKey;
  rangeFrom: string;
  rangeTo: string;
};

const PAD = { top: 32, right: 20, bottom: 36, left: 20 };
const WIDTH = 640;
const HEIGHT = 200;
const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function DailyChart({
  data,
  categoriesByDay,
  selectedDay,
  range,
  rangeFrom,
  rangeTo,
}: DailyChartProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="border border-ink/20 bg-paper-2 px-5 py-10 font-hand-signature text-hand-signature text-ink-faint">
        Nothing on this line yet for the range you picked.
      </div>
    );
  }

  function buildHref(day?: string) {
    const p = new URLSearchParams();
    p.set('range', range);
    if (range === 'custom') {
      p.set('from', rangeFrom);
      p.set('to', rangeTo);
    }
    if (day) p.set('day', day);
    return `/dashboard?${p.toString()}`;
  }

  function handleSelect(day: string) {
    router.push(buildHref(day === selectedDay ? undefined : day));
  }

  // Cap the axis at the 90th percentile of daily totals so everyday bars stay
  // readable; outlier days (rent, big purchases) clamp to the ceiling and get a
  // torn-top marker + their true value label. ponytail: p90 is a fine heuristic,
  // swap for a configurable knob only if someone asks.
  const peak = Math.max(percentile(data.map((d) => d.total + d.income), 0.9), 1);
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const baselineY = PAD.top + innerH;

  const xFor = (i: number) =>
    data.length === 1
      ? PAD.left + innerW / 2
      : PAD.left + (i / (data.length - 1)) * innerW;
  const slot = data.length === 1 ? 48 : xFor(1) - xFor(0);
  const barW = Math.max(Math.min(slot * 0.55, 32), 12);

  const selectedTotal =
    selectedDay && data.find((d) => d.date === selectedDay)?.total;

  const useWeekdayLabels =
    (range === '7d' || range === 'this_week') && data.length <= 7;

  // ponytail: ~44px per label in viewBox units → thin labels so they never
  // overlap. Bump the divisor if labels still touch on very long fonts.
  const labelStep = Math.max(1, Math.ceil(data.length / (innerW / 44)));

  return (
    <figure className="flex flex-col gap-3">
      <div className="relative border border-ink/30 bg-white/40">
        <span
          className="absolute -top-2 left-4 bg-paper px-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
          aria-hidden="true"
        >
          Fig. 1 — Daily
        </span>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height={HEIGHT}
        role="img"
        aria-label={`Daily spending · ${data.length} days · peak ${formatVND(peak)}`}
        className="block"
        preserveAspectRatio="xMidYMid meet"
      >
        <title>Daily spending — click a bar to drill into that day</title>

        <g style={{ filter: 'url(#hand-wobble)' }}>
          {data.map((d, i) => {
            const x = xFor(i) - barW / 2;
            // Clamp the stack top to the chart ceiling so outliers don't blow
            // out the everyday bars; the value label still shows the truth.
            const spendY = Math.max(baselineY - (d.total / peak) * innerH, PAD.top);
            const totalH = baselineY - spendY;
            const incomeY = Math.max(spendY - (d.income / peak) * innerH, PAD.top);
            const incomeH = spendY - incomeY;
            const clipped = d.total + d.income > peak;
            const isSelected = d.date === selectedDay;
            const isDimmed = !!selectedDay && !isSelected;
            const fillOpacity = isDimmed ? 0.08 : 0.22;
            const strokeOpacity = isDimmed ? 0.35 : 1;
            const topY = Math.min(spendY, incomeY);
            const labelY = topY - 8;
            return (
              <g key={d.date}>
                {(d.total > 0 || d.income > 0) && !isDimmed && (
                  <text
                    x={xFor(i)}
                    y={labelY}
                    textAnchor="middle"
                    className="font-hand"
                    style={{
                      fontSize: 14,
                      fill: 'var(--color-pen-navy)',
                    }}
                  >
                    {formatVNDShort(d.total + d.income)}
                  </text>
                )}
                {/* Fills. Clamped bars drop the top stroke (the red zigzag is
                    the top edge); the navy sides are drawn as a path below. */}
                {d.total > 0 && (
                  <rect
                    x={x}
                    y={spendY}
                    width={barW}
                    height={totalH}
                    fill="var(--color-pen-navy)"
                    fillOpacity={fillOpacity}
                    stroke={clipped ? 'none' : 'var(--color-pen-navy)'}
                    strokeWidth={isSelected ? 2 : 1.4}
                    strokeOpacity={strokeOpacity}
                    strokeLinejoin="round"
                  />
                )}
                {d.income > 0 && (
                  <rect
                    x={x}
                    y={incomeY}
                    width={barW}
                    height={incomeH}
                    fill="var(--color-stamp-red)"
                    fillOpacity={fillOpacity}
                    stroke={clipped ? 'none' : 'var(--color-stamp-red)'}
                    strokeWidth="1.4"
                    strokeOpacity={strokeOpacity}
                    strokeLinejoin="round"
                  />
                )}
                {clipped && (
                  <>
                    <path
                      d={`M ${x} ${baselineY} L ${x} ${topY} M ${x + barW} ${baselineY} L ${x + barW} ${topY}`}
                      fill="none"
                      stroke="var(--color-pen-navy)"
                      strokeWidth="1.4"
                      strokeOpacity={strokeOpacity}
                      strokeLinecap="round"
                    />
                    <path
                      d={zigzagTop(x, topY, barW)}
                      fill="none"
                      stroke="var(--color-stamp-red)"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* Baseline — the only rule */}
        <line
          x1={PAD.left}
          y1={baselineY}
          x2={WIDTH - PAD.right}
          y2={baselineY}
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ filter: 'url(#hand-wobble)' }}
        />

        {/* X-axis labels — thinned so they never overlap (always keep last) */}
        {data.map((d, i) => {
          if (i % labelStep !== 0 && i !== data.length - 1) return null;
          return (
          <text
            key={`x-${i}`}
            x={xFor(i)}
            y={baselineY + 18}
            textAnchor="middle"
            className="font-typewriter"
            style={{
              fontSize: 10,
              fill: 'var(--color-ink-mute)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {useWeekdayLabels ? weekdayLabel(d.date) : shortDate(d.date)}
          </text>
          );
        })}

        {/* Hit targets — transparent rects so the whole slot is clickable,
            not just the drawn bar. */}
        {data.map((d, i) => {
          const x = xFor(i) - slot / 2;
          const label = `${formatDateLabel(d.date)} · ${formatVND(d.total)}${d.income > 0 ? ` · back ${formatVND(d.income)}` : ''}`;
          const onClick = (e: MouseEvent) => {
            e.stopPropagation();
            handleSelect(d.date);
          };
          return (
            <g key={`hit-${d.date}`} role="button" aria-label={label} tabIndex={0}
               onClick={onClick}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   handleSelect(d.date);
                 }
               }}
               style={{ cursor: 'pointer', outline: 'none' }}
            >
              <rect
                x={x}
                y={PAD.top}
                width={slot}
                height={innerH}
                fill="transparent"
                className="paper-focusable"
              />
            </g>
          );
        })}
      </svg>
      </div>

      {selectedDay && (
        <p className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
          Drilled · {formatDateLabel(selectedDay)}
          {typeof selectedTotal === 'number' ? ` · ${formatVND(selectedTotal)}` : ''}
        </p>
      )}

      {selectedDay && (
        <DailyBreakdown
          day={selectedDay}
          categories={categoriesByDay[selectedDay] ?? []}
        />
      )}
    </figure>
  );
}

function DailyBreakdown({
  day,
  categories,
}: {
  day: string;
  categories: { category: string; total: number }[];
}) {
  const top = categories.slice(0, 5);
  const rest = categories.slice(5).reduce((s, c) => s + c.total, 0);
  const total = categories.reduce((s, c) => s + c.total, 0);

  if (categories.length === 0) {
    return (
      <div className="border border-ink/20 bg-paper-2 px-4 py-3 font-hand-signature text-hand-signature text-ink-faint">
        No entries on {formatDateLabel(day)}.
      </div>
    );
  }

  return (
    <div className="border border-ink/30 bg-paper-2 px-4 py-3">
      <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
        {formatDateLabel(day)} · {formatVND(total)}
      </p>
      <ul className="mt-2 space-y-1">
        {top.map((c) => (
          <li
            key={c.category}
            className="flex items-baseline justify-between gap-6 font-serif text-body nums-oldstyle-tabular text-ink"
          >
            <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
              {c.category}
            </span>
            <span>{formatVND(c.total)}</span>
          </li>
        ))}
        {rest > 0 && (
          <li className="flex items-baseline justify-between gap-6 font-serif text-body nums-oldstyle-tabular text-ink-mute">
            <span className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)]">
              Other lines
            </span>
            <span>{formatVND(rest)}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

/** Red zigzag cap for off-scale bars — a triangle wave across the bar top. */
function zigzagTop(x: number, y: number, w: number): string {
  const teeth = Math.max(3, Math.round(w / 5));
  const seg = w / (teeth * 2);
  const amp = 3;
  let d = `M ${x} ${y}`;
  for (let k = 1; k <= teeth * 2; k++) {
    d += ` L ${x + seg * k} ${k % 2 === 1 ? y - amp : y}`;
  }
  return d;
}

/** Linear-interpolated percentile (p in 0..1). Empty → 0. */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  return `${day} ${month}`;
}

function weekdayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const idx = (date.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  return WEEKDAY_LABELS[idx];
}
