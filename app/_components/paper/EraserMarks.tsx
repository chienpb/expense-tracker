import type { ReactNode } from 'react';

/**
 * `<EraserMarks>` — loading / saving overlay (§4.13 · §6.5).
 *
 * Pinkish-gray smudge that pulses softly — the metaphor is "we're
 * rubbing this out / writing this in." Replaces every spinner,
 * skeleton, and shimmer (§11). The smudge is two blurred tinted
 * ellipses plus a thin streak stroke on top, tiled via SVG so it
 * scales without jagging.
 *
 * Two layouts:
 *   inline    — phrasing content, swaps in for a short running value
 *               (e.g. "Saving…" in place of an amount). Defaults to
 *               ~3em wide; size comes from the surrounding font.
 *   overlay   — absolutely positioned over a parent, `inset: 0`. Use
 *               when the whole row/card is busy.
 *
 * Animation respects §8 (ink-drying easing, 1s period for the pulse).
 * `prefers-reduced-motion` pauses the animation — the smudge stays
 * visible, just no longer pulses. Never blocks hit testing.
 */
type EraserMarksProps = {
  /** Layout mode. Default `'inline'`. */
  variant?: 'inline' | 'overlay';
  /** Label read by AT. Default `'Loading'`. */
  label?: string;
  /** Show label text visually (sets `aria-label` off). Default false. */
  showLabel?: boolean;
  /** Label text when `showLabel` is true. Default `'Writing…'`. */
  labelText?: ReactNode;
  className?: string;
};

export function EraserMarks({
  variant = 'inline',
  label = 'Loading',
  showLabel = false,
  labelText = 'Writing…',
  className,
}: EraserMarksProps) {
  const wrapper =
    variant === 'overlay'
      ? 'pointer-events-none absolute inset-0 flex items-center justify-center'
      : 'relative inline-flex items-center gap-2 align-middle';

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={showLabel ? undefined : label}
      className={`${wrapper} ${className ?? ''}`}
    >
      <Smudge />
      {showLabel && (
        <span className="font-serif text-caption italic text-ink-mute">
          {labelText}
        </span>
      )}
    </span>
  );
}

/**
 * The smudge itself — a tiny SVG that fills its container. Hosted
 * alone so the markup above can stay readable, and so the overlay
 * variant can stretch it without flex-affecting the parent.
 */
function Smudge() {
  return (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className="paper-eraser-pulse h-[1em] min-w-[3em] w-full"
    >
      {/* Two overlapping tinted smudges give the rub its uneven edge.
          `mix-blend-multiply` is avoided here — blends read as gradients
          on some mobile Safaris; plain low-alpha fill is safer. */}
      <ellipse cx="32" cy="12" rx="26" ry="7" fill="var(--color-stamp-red-fade)" opacity="0.18" />
      <ellipse cx="68" cy="12" rx="28" ry="6" fill="var(--color-pencil-gray)" opacity="0.22" />
      {/* A single streak stroke on top for the "someone rubbed an
          eraser across this" read. */}
      <path
        d="M 6 13 Q 30 9, 52 14 T 94 11"
        fill="none"
        stroke="var(--color-pencil-gray)"
        strokeOpacity="0.35"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
