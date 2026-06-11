'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * `<PaperSelect>` — custom paper-styled select primitive.
 *
 * Replaces native `<select>` across the dashboard so the opened menu
 * reads as a typewriter ledger (paper-2 surface, ink border, typewriter
 * options) instead of the host OS's dropdown. Button trigger +
 * absolutely-positioned listbox popover, controlled by `value` /
 * `onChange`.
 *
 * Two visual variants:
 *  - `field-line` (default) — underlined handwritten trigger, matches
 *    the existing form field style in `<QuickAdd>`, `<EntrySlip>`, and
 *    the recurring slip.
 *  - `chip` — bordered pill for filter-style triggers (see the range
 *    picker in the dashboard header).
 *
 * Keyboard: Space/Enter opens, ↑/↓/Home/End move highlight, Enter picks,
 * Esc closes. Click-outside closes. Mobile is not specialized — the
 * same popover renders everywhere, per current scope.
 */
export type PaperSelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type PaperSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: PaperSelectOption[];
  placeholder?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  variant?: 'field-line' | 'chip';
  className?: string;
  /** Optional render override for the trigger's display text. */
  renderTrigger?: (selected: PaperSelectOption | null) => ReactNode;
};

export function PaperSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  variant = 'field-line',
  className,
  renderTrigger,
}: PaperSelectProps) {
  const autoId = useId();
  const triggerId = id ?? `paper-select-${autoId}`;
  const listboxId = `${triggerId}-listbox`;

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === value && !o.disabled),
    ),
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option || option.disabled) return;
      onChange(option.value);
      close();
    },
    [options, onChange, close],
  );

  const moveHighlight = useCallback(
    (direction: 1 | -1) => {
      setHighlight((current) => {
        const n = options.length;
        let next = current;
        for (let i = 0; i < n; i += 1) {
          next = (next + direction + n) % n;
          if (!options[next].disabled) return next;
        }
        return current;
      });
    },
    [options],
  );

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t))
        return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-index="${highlight}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, highlight]);

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      const activeIndex = options.findIndex(
        (o) => o.value === value && !o.disabled,
      );
      setHighlight(
        activeIndex >= 0
          ? activeIndex
          : options.findIndex((o) => !o.disabled),
      );
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveHighlight(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveHighlight(-1);
        break;
      case 'Home':
        e.preventDefault();
        setHighlight(options.findIndex((o) => !o.disabled));
        break;
      case 'End':
        e.preventDefault();
        for (let i = options.length - 1; i >= 0; i -= 1) {
          if (!options[i].disabled) {
            setHighlight(i);
            break;
          }
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(highlight);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  const triggerBase =
    'paper-focusable inline-flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60';
  const triggerVariant =
    variant === 'chip'
      ? 'border border-ink/70 bg-paper-2 px-3 py-1.5 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink hover:bg-paper transition-colors'
      : 'border-0 border-b border-solid border-ink bg-transparent pb-1.5 font-hand text-hand text-pen-navy';

  const triggerLabel = renderTrigger
    ? renderTrigger(selected)
    : selected
      ? selected.label
      : (placeholder ?? '');

  return (
    <div className={`relative ${className ?? ''}`}>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        className={`${triggerBase} ${triggerVariant}`}
      >
        <span className={selected ? '' : 'text-ink-mute'}>{triggerLabel}</span>
        <span
          aria-hidden
          className={`shrink-0 font-typewriter text-[10px] text-ink-mute transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listboxId}-opt-${highlight}`}
          onKeyDown={onListKeyDown}
          className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-auto border border-ink bg-paper-2 py-1 shadow-[2px_3px_0_0_rgba(0,0,0,0.12)] focus:outline-none"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlight;
            return (
              <li
                key={`${option.value}-${index}`}
                id={`${listboxId}-opt-${index}`}
                role="option"
                data-index={index}
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onMouseEnter={() =>
                  !option.disabled && setHighlight(index)
                }
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(index);
                }}
                className={[
                  'cursor-pointer px-3 py-1.5 font-typewriter text-[12px] tracking-[var(--letter-spacing-label-s)]',
                  option.disabled
                    ? 'cursor-not-allowed text-ink-mute/60'
                    : isHighlighted
                      ? 'bg-ink text-paper'
                      : 'text-ink',
                  isSelected && !isHighlighted ? 'font-semibold' : '',
                ].join(' ')}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
