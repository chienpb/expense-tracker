'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Reveals `text` one character at a time — the pen "writing" the verdict on
 * first seal. The full string is already client-side (no streaming); this is
 * pure unveil. Reduced motion / re-reads pass `animate={false}` and get the
 * whole string at once. ~19ms/char ≈ a quick hand.
 *
 * A nib sprite tracks the insertion point: each tick we measure the caret with
 * a collapsed Range over the revealed text and park the nib there; CSS bobs it.
 * ponytail: Range-rect caret, good enough for a one-shot reveal; if wrapping
 * jitters the nib, measure per-line instead.
 */
export function Typewriter({
  text,
  animate,
  className,
}: {
  text: string;
  animate: boolean;
  className?: string;
}) {
  const [n, setN] = useState(animate ? 0 : text.length);
  const boxRef = useRef<HTMLParagraphElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [nib, setNib] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!animate) return;
    const id = window.setInterval(() => {
      setN((c) => {
        if (c >= text.length) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 19);
    return () => window.clearInterval(id);
  }, [text, animate]);

  // Park the nib at the caret after each character paints.
  useLayoutEffect(() => {
    if (!animate || n === 0 || n >= text.length) {
      if (n >= text.length) setNib(null); // lift the pen when done
      return;
    }
    const node = textRef.current?.firstChild;
    const box = boxRef.current;
    if (!node || !box) return;
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, n);
    range.collapse(false); // caret at the end of what's written
    const r = range.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    setNib({ x: r.left - b.left, y: r.top - b.top });
  }, [n, animate, text]);

  return (
    <p ref={boxRef} className={`relative grid ${className ?? ''}`}>
      {/* Reserve the final size up front (we know the whole string) so the
          box holds steady while the pen fills it — no reflow mid-write. */}
      <span aria-hidden="true" className="invisible [grid-area:1/1]">
        {text}
      </span>
      <span ref={textRef} className="[grid-area:1/1]">
        {text.slice(0, n)}
      </span>
      {nib && (
        <span
          aria-hidden="true"
          className="paper-nib"
          style={{ left: nib.x, top: nib.y }}
        >
          {/* Fountain nib: tine tip at (0,0) pointing down-left, body sweeping
             up-right toward the barrel — central slit, breather hole, shoulders.
             The slit/hole are cut in paper color so the nib reads at ~22px. */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M0.7 21.3 C2.6 15.2 4.8 10.6 8 6.9 C10.4 4.1 13.1 2 15.8 0.95 C17.1 0.45 18.6 0.7 18.95 1.85 C19.35 3.15 18.9 4.9 17.7 7 C15.2 11.4 9.6 16.4 0.7 21.3 Z"
              fill="var(--color-pen-navy, #1f3a5f)"
            />
            <circle cx="13.2" cy="5.7" r="1.35" fill="var(--color-paper, #f6efe0)" />
            <path
              d="M12.15 6.85 L0.95 20.85"
              stroke="var(--color-paper, #f6efe0)"
              strokeWidth="0.85"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
    </p>
  );
}
