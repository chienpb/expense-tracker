'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { PaperTagSelect } from './PaperTagSelect';

/**
 * `<FileTab>` — manila-folder navigation (§4.9).
 *
 * Renders a horizontal strip of tabs that sit *above* the page body.
 * The active tab fills with `paper` (matching the body underneath) and
 * drops its bottom border so the tab and the page read as one sheet.
 * Inactive tabs fill with `paper-2` and keep a bottom border so they
 * visibly sit "behind."
 *
 * The component is a router-agnostic `tablist`. If a tab carries an
 * `href` it renders as a `next/link`; otherwise as a button that calls
 * `onChange(id)`. Keyboard: ← / → move focus between tabs, Home/End
 * jump to the ends, Enter/Space activate (Link navigates natively).
 *
 * Mobile (§3.4): below 640px the strip can't fit at 375px, so it
 * collapses to a `<PaperTagSelect>` paper tag. `href` tabs navigate via
 * the router on change; otherwise `onChange(id)` fires, matching the
 * desktop contract. `label` is coerced to a string for the select, so
 * tab labels should stay text on routes that rely on the mobile collapse.
 */
export type FileTabItem = {
  id: string;
  label: ReactNode;
  href?: string;
};

type FileTabProps = {
  tabs: FileTabItem[];
  activeId: string;
  onChange?: (id: string) => void;
  'aria-label': string;
  className?: string;
};

export function FileTab({
  tabs,
  activeId,
  onChange,
  'aria-label': ariaLabel,
  className,
}: FileTabProps) {
  const router = useRouter();

  function handleSelect(id: string) {
    const tab = tabs.find((t) => t.id === id);
    if (tab?.href) {
      router.push(tab.href);
    } else {
      onChange?.(id);
    }
  }

  return (
    <>
      {/* Mobile — collapsed paper tag (<640px). */}
      <PaperTagSelect
        aria-label={ariaLabel}
        value={activeId}
        onChange={handleSelect}
        options={tabs.map((t) => ({ value: t.id, label: String(t.label) }))}
        className={`sm:hidden ${className ?? ''}`}
      />

      {/* Desktop / tablet — the manila tab strip (≥640px). */}
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={`relative hidden items-end gap-1 border-b-2 border-ink sm:flex ${className ?? ''}`}
      >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const shared = [
          'group relative -mb-[2px] inline-flex items-end px-5 pt-2.5 pb-2 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)]',
          'border border-b-0 transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pen-navy',
          active
            ? 'z-10 border-ink bg-paper text-ink border-b-paper'
            : 'border-ink/40 bg-paper-2 text-ink-mute hover:text-ink',
        ].join(' ');

        if (tab.href) {
          return (
            <Link
              key={tab.id}
              href={tab.href}
              role="tab"
              aria-selected={active}
              aria-current={active ? 'page' : undefined}
              tabIndex={active ? 0 : -1}
              className={shared}
              style={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
            >
              {tab.label}
            </Link>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange?.(tab.id)}
            className={shared}
            style={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
          >
            {tab.label}
          </button>
        );
      })}
      </div>
    </>
  );
}
