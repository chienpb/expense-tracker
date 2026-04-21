import { formatVNDShort } from '@/lib/dashboard/utils';

/**
 * `<HandDrawnChart>` — bar / line / area charts drawn as pen strokes
 * (§4.10). Raw SVG rather than Recharts — DECISION_LOG 2026-04-21
 * "Phase 4 · charts ship on raw SVG, not Recharts." The §4.10 palette
 * is trivially small (single bottom axis, no grid, no legend, no
 * tooltip), and applying `filter: url(#hand-wobble)` to Recharts'
 * root SVG blocks event hit-testing.
 *
 * Geometry:
 *   bar   — 1.5px ink stroke + 15% fill, §4.10
 *   line  — 1.5px ink stroke, stroke-linecap round, wobble applied
 *   area  — same as line + 15% fill to the baseline
 *
 * Axes — a single bottom rule, typewriter labels beneath. No y-axis
 * ticks; instead the peak value is printed top-right as a small
 * typewriter caption so the reader can anchor magnitudes.
 *
 * A11y — the chart carries its own `<title>` and summarizes the data
 * as a series in `aria-label`. Consumers should ship a visible
 * caption next to or beneath this component for context.
 */
export type HandDrawnChartDatum = {
  label: string;
  value: number;
};

export type HandDrawnChartAnnotation = {
  /** Index into `data` that this annotation points to. */
  index: number;
  /** Short hand-written text; rendered in Caveat per §4.10. */
  note: string;
};

type HandDrawnChartProps = {
  data: HandDrawnChartDatum[];
  kind: 'bar' | 'line' | 'area';
  /** Ink color. Default `pen-navy`. */
  color?: string;
  /** Intrinsic width. Default 640. Component is responsive via viewBox. */
  width?: number;
  /** Intrinsic height. Default 220. */
  height?: number;
  /** Format the y-peak caption. Default `formatVNDShort`. */
  yFormatter?: (n: number) => string;
  /** Circle + margin-note annotations. */
  annotations?: HandDrawnChartAnnotation[];
  /** Accessible title. Printed visually as the chart caption. */
  title?: string;
  className?: string;
};

const PAD = { top: 20, right: 20, bottom: 36, left: 16 };

export function HandDrawnChart({
  data,
  kind,
  color = 'var(--color-pen-navy)',
  width = 640,
  height = 220,
  yFormatter = formatVNDShort,
  annotations,
  title,
  className,
}: HandDrawnChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={`font-serif italic text-caption text-ink-faint ${className ?? ''}`}
      >
        Nothing on this line yet.
      </div>
    );
  }

  const peak = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const baselineY = PAD.top + innerH;

  const xFor = (i: number) =>
    data.length === 1
      ? PAD.left + innerW / 2
      : PAD.left + (i / (data.length - 1)) * innerW;
  const yFor = (v: number) =>
    baselineY - (Math.max(v, 0) / peak) * innerH;

  const summary =
    title ??
    `${kind} chart · ${data.length} entries · peak ${yFormatter(peak)}`;

  return (
    <figure className={`relative ${className ?? ''}`}>
      <svg
        role="img"
        aria-label={summary}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="xMidYMid meet"
      >
        <title>{summary}</title>

        {/* Peak caption · typewriter, mute */}
        <text
          x={width - PAD.right}
          y={PAD.top - 6}
          textAnchor="end"
          className="font-typewriter"
          style={{
            fontSize: 10,
            fill: 'var(--color-ink-mute)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          peak {yFormatter(peak)}
        </text>

        {/* Data group — every drawn primitive pushed through the wobble
            filter so each run produces a different (but deterministic,
            since the filter seed is fixed) fidget per stroke. */}
        <g style={{ filter: 'url(#hand-wobble)' }}>
          {kind === 'bar' && (
            <Bars data={data} xFor={xFor} baselineY={baselineY} peak={peak} innerH={innerH} color={color} />
          )}
          {kind === 'line' && (
            <Line data={data} xFor={xFor} yFor={yFor} color={color} />
          )}
          {kind === 'area' && (
            <Area data={data} xFor={xFor} yFor={yFor} baselineY={baselineY} color={color} />
          )}
        </g>

        {/* Baseline — the only axis rule. 1.5px, no grid. */}
        <line
          x1={PAD.left}
          y1={baselineY}
          x2={width - PAD.right}
          y2={baselineY}
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ filter: 'url(#hand-wobble)' }}
        />

        {/* Annotations — dashed ellipse + Caveat label. Rendered last
            so they sit above the data strokes. */}
        {annotations?.map((a, i) => {
          const datum = data[a.index];
          if (!datum) return null;
          const cx = xFor(a.index);
          const cy = kind === 'bar' ? yFor(datum.value) - 12 : yFor(datum.value);
          return (
            <g key={`a-${i}`}>
              <ellipse
                cx={cx}
                cy={cy}
                rx={28}
                ry={18}
                fill="none"
                stroke="var(--color-pen-navy)"
                strokeWidth="1"
                strokeDasharray="3 2"
                style={{ filter: 'url(#hand-wobble)' }}
              />
              <line
                x1={cx + 20}
                y1={cy - 14}
                x2={cx + 56}
                y2={cy - 34}
                stroke="var(--color-pen-navy)"
                strokeWidth="0.9"
                strokeLinecap="round"
                style={{ filter: 'url(#hand-wobble)' }}
              />
              <text
                x={cx + 60}
                y={cy - 32}
                className="font-hand-signature"
                style={{ fontSize: 16, fill: 'var(--color-pen-navy)' }}
              >
                {a.note}
              </text>
            </g>
          );
        })}

        {/* X-axis labels · typewriter, mute */}
        {data.map((d, i) => (
          <text
            key={`x-${i}`}
            x={xFor(i)}
            y={baselineY + 16}
            textAnchor="middle"
            className="font-typewriter"
            style={{
              fontSize: 9,
              fill: 'var(--color-ink-mute)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            {d.label}
          </text>
        ))}
      </svg>
    </figure>
  );
}

/* =====================================================================
 * Kind renderers
 * =================================================================== */

function Bars({
  data,
  xFor,
  baselineY,
  peak,
  innerH,
  color,
}: {
  data: HandDrawnChartDatum[];
  xFor: (i: number) => number;
  baselineY: number;
  peak: number;
  innerH: number;
  color: string;
}) {
  // Bandwidth derived from x-slot spacing · leave a 25% gap between
  // bars so they read as distinct strokes rather than a ruled block.
  const slot = data.length === 1 ? 48 : xFor(1) - xFor(0);
  const barW = Math.max(slot * 0.55, 10);

  return (
    <g>
      {data.map((d, i) => {
        const h = (Math.max(d.value, 0) / peak) * innerH;
        const x = xFor(i) - barW / 2;
        const y = baselineY - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        );
      })}
    </g>
  );
}

function Line({
  data,
  xFor,
  yFor,
  color,
}: {
  data: HandDrawnChartDatum[];
  xFor: (i: number) => number;
  yFor: (v: number) => number;
  color: string;
}) {
  const d = data
    .map((datum, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(datum.value)}`)
    .join(' ');

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((datum, i) => (
        <circle
          key={i}
          cx={xFor(i)}
          cy={yFor(datum.value)}
          r="2.5"
          fill={color}
        />
      ))}
    </g>
  );
}

function Area({
  data,
  xFor,
  yFor,
  baselineY,
  color,
}: {
  data: HandDrawnChartDatum[];
  xFor: (i: number) => number;
  yFor: (v: number) => number;
  baselineY: number;
  color: string;
}) {
  const linePath = data
    .map((datum, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(datum.value)}`)
    .join(' ');
  const areaPath = `${linePath} L ${xFor(data.length - 1)} ${baselineY} L ${xFor(0)} ${baselineY} Z`;

  return (
    <g>
      <path d={areaPath} fill={color} fillOpacity={0.15} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}
