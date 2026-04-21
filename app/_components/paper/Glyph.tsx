import type { SVGProps } from 'react';

/**
 * Stable ids exposed by `public/glyphs.svg`. Adding a new glyph means
 * editing that file AND this union — keep them in sync so consumers
 * can't point at a missing symbol.
 */
export const GLYPH_NAMES = [
  'leaf',
  'star',
  'hand-pointing',
  'pen',
  'check',
  'cross',
  'arrow-right',
  'arrow-up-right',
  'dagger',
  'double-dagger',
  'pilcrow',
  'section',
] as const;

export type GlyphName = (typeof GLYPH_NAMES)[number];

type GlyphProps = {
  name: GlyphName;
  /** Size in px or any CSS length. Defaults to 1em so glyphs flow with text. */
  size?: number | string;
  /**
   * Provide an accessible name to lift the glyph into the a11y tree.
   * Omit (the default) to mark it purely decorative per §9 — any real
   * meaning must then live in adjacent text.
   */
  title?: string;
  className?: string;
} & Omit<SVGProps<SVGSVGElement>, 'children' | 'className'>;

/**
 * Resolves to `<svg><use href="/glyphs.svg#glyph-<name>" /></svg>`.
 * Colour inherits from `currentColor`; size defaults to `1em`.
 *
 * Swap contract: when Chien ships real hand-drawn paths (Asset A8),
 * we replace the `<symbol>` bodies in `public/glyphs.svg`. This
 * component stays untouched.
 */
export function Glyph({
  name,
  size = '1em',
  title,
  className,
  ...rest
}: GlyphProps) {
  const decorative = title === undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
      {...rest}
    >
      {!decorative && <title>{title}</title>}
      <use href={`/glyphs.svg#glyph-${name}`} />
    </svg>
  );
}
