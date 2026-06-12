import type { ReactNode } from 'react';

/**
 * `<EmphasisUnderline>` — hand-drawn underline strokes (§5, asset A12).
 *
 * The pen-stroke pattern extracted from `RedStringCorrection`'s
 * strikethrough: a gentle quadratic path stretched to the text's
 * bounding box (`preserveAspectRatio="none"`), roughened by
 * `#hand-wobble`. Three weights of emphasis — `single` for a passing
 * mark, `double` for a firm one, `wobbly` for an urgent scribble.
 *
 * Inline by design: wrap the words, not the block. The underline is
 * decorative; if the emphasis is semantic, put the meaning in the text
 * (or wrap in `<em>`/`<strong>` yourself).
 */
type EmphasisUnderlineProps = {
  /** Stroke style. Default `single`. */
  variant?: 'single' | 'double' | 'wobbly';
  /** Ink color. Default `pen-navy`. */
  color?: string;
  /** Override the wobble filter (e.g. disable in a CI snapshot). */
  filter?: string | false;
  className?: string;
  children: ReactNode;
};

/**
 * Strokes in a 100×8 box, stretched to the wrapped text. Each is one
 * pen movement — `single` is the RedStringCorrection stroke verbatim;
 * `double` adds a second, thinner pass drifting against the first;
 * `wobbly` is the same hand moving fast, so the waver tightens.
 */
const STROKES: Record<
  NonNullable<EmphasisUnderlineProps['variant']>,
  readonly { d: string; strokeWidth: number; opacity?: number }[]
> = {
  single: [{ d: 'M 1 4 Q 30 2 55 5 T 99 3', strokeWidth: 1.6 }],
  double: [
    { d: 'M 1 3 Q 30 1 55 4 T 99 2', strokeWidth: 1.6 },
    { d: 'M 2 6 Q 28 7 56 5 T 98 6', strokeWidth: 1.2, opacity: 0.85 },
  ],
  // Explicit Q segments, not chained T — T reflects the previous
  // control point, so a chain of them amplifies until the curve
  // leaves the viewBox and clips.
  wobbly: [
    {
      d: 'M 1 4.2 Q 8 1.4 15 3.8 Q 22 6.8 29 4.4 Q 36 1.2 43 3.6 Q 50 6.4 57 4.2 Q 64 1.6 71 3.6 Q 78 6.8 85 4 Q 92 1.4 99 4.4',
      strokeWidth: 1.6,
    },
  ],
};

export function EmphasisUnderline({
  variant = 'single',
  color = 'var(--color-pen-navy)',
  filter,
  className,
  children,
}: EmphasisUnderlineProps) {
  const appliedFilter =
    filter === false ? undefined : (filter ?? 'url(#hand-wobble)');

  return (
    <span className={`relative inline-block ${className ?? ''}`}>
      {children}
      <svg
        aria-hidden="true"
        role="presentation"
        focusable="false"
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-0 -bottom-[0.12em] h-[0.3em] w-full"
      >
        <g
          fill="none"
          stroke={color}
          strokeLinecap="round"
          style={{ filter: appliedFilter }}
        >
          {STROKES[variant].map((s, i) => (
            <path
              key={i}
              d={s.d}
              strokeWidth={s.strokeWidth}
              opacity={s.opacity}
            />
          ))}
        </g>
      </svg>
    </span>
  );
}
