'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type { LedgerSettings } from '@/lib/settings';
import { Stamp } from '@/app/_components/paper/Stamp';
import { Glyph } from '@/app/_components/paper/Glyph';
import { setLedgerSetting } from './_actions';

/**
 * `<SettingsForm>` — Paper Ledger settings surface (Phase 5.5).
 *
 * Five knobs per §1.3:
 *   • Theme           — Day / Midnight / System (via `next-themes`).
 *   • Reduce motion   — disables §8 animations system-wide.
 *   • Reduce skew     — collapses every `tiltFor()` rotation to 0°.
 *   • Printed hand    — swaps Patrick Hand for Crimson so Vietnamese
 *                       tones sit on the baseline (§2.3, §9).
 *   • Show edit hist. — hides `<RedStringCorrection>` strikes when off.
 *
 * Each toggle is a ruled row with a typewriter label on the left and
 * a pair of buttons on the right acting as a segmented control. Click
 * → server action writes the cookie → `router.refresh()` re-reads the
 * root layout so `<html>` picks up the new attribute without a flash.
 *
 * A navy `SAVED` stamp thumps in for ~1.2s after each change so the
 * user sees a ledger-native confirmation rather than a toast.
 */
type Props = {
  initial: LedgerSettings;
};

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState(0);

  function flip<K extends keyof LedgerSettings>(
    key: K,
    value: LedgerSettings[K],
  ) {
    if (settings[key] === value) return;
    setSettings((s) => ({ ...s, [key]: value }));
    startTransition(async () => {
      await setLedgerSetting(key, value);
      router.refresh();
      setSavedAt(Date.now());
    });
  }

  return (
    <div className="relative space-y-10">
      <ThemeRow />

      <Row
        label="Reduce motion"
        helper="Hold every animation still. Ink-drying transitions stop fading in."
        value={settings.reduceMotion}
        onChange={(v) => flip('reduceMotion', v)}
        onLabel="Hold"
        offLabel="Let it breathe"
      />

      <Row
        label="Reduce skew"
        helper="Pin every tilted field, stamp, and margin note flat. Good for dyslexic reading."
        value={settings.reduceSkew}
        onChange={(v) => flip('reduceSkew', v)}
        onLabel="Flat"
        offLabel="At an angle"
      />

      <Row
        label="Use printed font for handwritten content"
        helper="Swap Patrick Hand for Crimson — Vietnamese tones sit on the baseline."
        value={settings.printHand}
        onChange={(v) => flip('printHand', v)}
        onLabel="Printed"
        offLabel="Hand-written"
      />

      <Row
        label="Show edit history"
        helper="Keep the red-string strikes visible on amended entries. Off hides the audit trail."
        value={settings.showEditHistory}
        onChange={(v) => flip('showEditHistory', v)}
        onLabel="Show"
        offLabel="Hide"
      />

      {/* Saved stamp — remounts on `savedAt` change so the thump keyframe
          replays. `key` on the wrapper + a short window keeps it from
          lingering as dead chrome. */}
      {savedAt > 0 && (
        <span
          key={savedAt}
          className="pointer-events-none absolute -top-4 right-2 paper-stamp-thump sm:right-8"
          aria-hidden="true"
        >
          <Stamp text="Saved" color="navy" wear={0.5} id={`saved-${savedAt}`} />
        </span>
      )}
      <span className="sr-only" aria-live="polite">
        {pending ? 'Saving setting.' : savedAt > 0 ? 'Setting saved.' : ''}
      </span>
    </div>
  );
}

function ThemeRow() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  // `theme` can be `"system"`; the resolved theme tells us what the
  // browser is actually painting so we can show a helper string.
  const current = theme ?? 'system';

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-10">
      <div className="flex-1">
        <h2 className="font-serif text-title-2 font-bold text-ink">Theme</h2>
        <p className="mt-1 font-serif text-body text-ink-mute">
          The ledger keeps two books — one for daylight, one for the lamp.
          System follows whatever your device is doing right now
          {resolvedTheme ? (
            <>
              {' '}
              (<span className="text-ink">{resolvedTheme === 'dark' ? 'Midnight' : 'Day'}</span>)
            </>
          ) : null}
          .
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label="Theme"
        className="flex flex-wrap gap-2"
      >
        <ThemeButton
          label="Day"
          value="light"
          current={current}
          onSelect={setTheme}
        />
        <ThemeButton
          label="Midnight"
          value="dark"
          current={current}
          onSelect={setTheme}
        />
        <ThemeButton
          label="System"
          value="system"
          current={current}
          onSelect={setTheme}
        />
      </div>
    </section>
  );
}

function ThemeButton({
  label,
  value,
  current,
  onSelect,
}: {
  label: string;
  value: string;
  current: string;
  onSelect: (v: string) => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onSelect(value)}
      className={`paper-focusable paper-pressable inline-flex items-center gap-2 border-2 px-4 py-2 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] transition-colors ${
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-ink/60 bg-paper text-ink hover:bg-paper-2'
      }`}
    >
      {active && <Glyph name="check" size={12} />}
      <span>{label}</span>
    </button>
  );
}

type RowProps = {
  label: string;
  helper: string;
  value: boolean;
  onChange: (v: boolean) => void;
  onLabel: string;
  offLabel: string;
};

function Row({ label, helper, value, onChange, onLabel, offLabel }: RowProps) {
  const groupId = `setting-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-10">
      <div className="flex-1">
        <h2 id={groupId} className="font-serif text-title-2 font-bold text-ink">
          {label}
        </h2>
        <p className="mt-1 font-serif text-body text-ink-mute">{helper}</p>
      </div>
      <div
        role="radiogroup"
        aria-labelledby={groupId}
        className="flex flex-wrap gap-2"
      >
        <ToggleButton
          active={value}
          label={onLabel}
          onClick={() => onChange(true)}
        />
        <ToggleButton
          active={!value}
          label={offLabel}
          onClick={() => onChange(false)}
        />
      </div>
    </section>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`paper-focusable paper-pressable inline-flex items-center gap-2 border-2 px-4 py-2 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] transition-colors ${
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-ink/60 bg-paper text-ink hover:bg-paper-2'
      }`}
    >
      {active && <Glyph name="check" size={12} />}
      <span>{label}</span>
    </button>
  );
}

