import type { ReactNode } from 'react';
import { MarginRule } from './MarginRule';
import { PaperGrain } from './PaperGrain';
import { RuledLines } from './RuledLines';
import { TapeStrip } from './TapeStrip';

/**
 * `<Page>` — the root paper surface (§4.1).
 *
 * Stacks every decoration primitive (grain, ruled lines, margin rule)
 * under a header / body / footer trio. Body content sits to the right
 * of the margin rule; the rule runs unbroken top-to-bottom. Optional
 * tape strips at the top corners mark a primary page (§3.1) and are
 * hidden below 640px per §3.4.
 *
 * Decoration layers are `pointer-events: none` + `aria-hidden` so the
 * container remains a normal flex child — stretchable, scrollable, and
 * free of hit-testing quirks.
 *
 * Contract: all five Paper Ledger fonts must be in scope. The root
 * layout loads them via `paperFontVariables`; pages rendered outside
 * that tree must add the variables themselves.
 */
type PageProps = {
  /** Form code printed top-left, e.g. `"CHN-01"`. Typewriter, §2.2. */
  formCode?: string;
  /** Page number printed top/bottom-right, e.g. `"1/12"`. */
  pageNumber?: string;
  /** Printed title rendered inside the header zone. */
  title?: ReactNode;
  /**
   * Optional header-right slot. Rendered in typewriter at the same size
   * as `formCode` so the top rail reads as one printed band.
   */
  headerMeta?: ReactNode;
  /**
   * Footer slot. Defaults to page number + signature affordance when
   * `pageNumber` is set. Pass `false` to hide the footer entirely.
   */
  footer?: ReactNode | false;
  /** Render decorative tape strips at the top corners (§3.1 · primary pages). */
  tape?: boolean;
  children: ReactNode;
  className?: string;
};

export function Page({
  formCode,
  pageNumber,
  title,
  headerMeta,
  footer,
  tape = false,
  children,
  className,
}: PageProps) {
  const renderFooter = footer !== false && (footer !== undefined || pageNumber);
  const bodyPadLeft =
    'pl-[calc(var(--margin-rule-offset-mobile)+24px)] sm:pl-[calc(var(--margin-rule-offset)+32px)]';
  const headerPadLeft =
    'pl-[calc(var(--margin-rule-offset-mobile)+12px)] sm:pl-[calc(var(--margin-rule-offset)+16px)]';

  return (
    <div
      className={`relative isolate flex min-h-full flex-col overflow-hidden bg-paper text-ink ${className ?? ''}`}
    >
      <PaperGrain />
      <RuledLines />
      <MarginRule />

      {tape && (
        <>
          <TapeStrip
            className="hidden sm:block"
            top={-8}
            left={40}
            width={92}
            rotation={-3}
            seed={`${formCode ?? 'page'}-tape-l`}
          />
          <TapeStrip
            className="hidden sm:block"
            top={-8}
            right={40}
            width={92}
            rotation={2}
            seed={`${formCode ?? 'page'}-tape-r`}
          />
        </>
      )}

      <header
        className={`relative z-10 border-b-2 border-ink ${headerPadLeft} pr-4 pt-5 pb-4 sm:pr-8 sm:pt-6 sm:pb-5`}
      >
        <div className="flex items-baseline gap-4">
          {formCode && (
            <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
              Form {formCode}
            </span>
          )}
          <span className="ml-auto font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            {headerMeta ?? (pageNumber && `Page ${pageNumber}`)}
          </span>
        </div>
        {title !== undefined && (
          <div className="mt-2 font-serif text-title-1 font-bold text-ink">
            {title}
          </div>
        )}
      </header>

      <main className={`relative z-10 flex-1 ${bodyPadLeft} pr-4 py-6 sm:pr-8 sm:py-8`}>
        {children}
      </main>

      {renderFooter && (
        <footer
          className={`relative z-10 border-t border-ink/30 ${bodyPadLeft} pr-4 sm:pr-8 py-2 flex items-center`}
        >
          <div className="flex w-full items-baseline gap-4 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            {footer !== undefined ? (
              footer
            ) : (
              <>
                <span aria-hidden="true" className="h-px w-24 border-b border-ink/40" />
                <span className="font-serif text-caption italic text-ink-mute">
                  (signed)
                </span>
                <span className="ml-auto">Page {pageNumber}</span>
              </>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
