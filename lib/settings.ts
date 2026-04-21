import { cookies } from 'next/headers';

/**
 * Paper Ledger user settings persisted as cookies so the server can
 * apply them as `<html>` data-attributes during SSR. This avoids the
 * flash of "unreduced" motion/skew on first paint that a client-only
 * store would produce.
 *
 * Phase 1.3 wires the cookies into the root layout but does NOT yet
 * ship the `/settings` route — that's Phase 5.5. Components already
 * read from `[data-theme="night"]`, `data-reduce-motion="1"`, etc.,
 * so flipping the cookies by hand (DevTools → Application → Cookies)
 * is enough to exercise every branch during Phases 2–4.
 *
 * `theme` is handled separately by `next-themes`; the value lives in
 * `localStorage` with its own cookie for SSR. We don't duplicate it
 * here.
 */
export type LedgerSettings = {
  reduceMotion: boolean;
  reduceSkew: boolean;
  printHand: boolean;
  showEditHistory: boolean;
};

export const SETTINGS_COOKIE = {
  reduceMotion: 'ledger-reduce-motion',
  reduceSkew: 'ledger-reduce-skew',
  printHand: 'ledger-print-hand',
  showEditHistory: 'ledger-show-edit-history',
} as const;

const DEFAULTS: LedgerSettings = {
  reduceMotion: false,
  reduceSkew: false,
  printHand: false,
  showEditHistory: true,
};

export async function readLedgerSettings(): Promise<LedgerSettings> {
  const store = await cookies();
  return {
    reduceMotion: store.get(SETTINGS_COOKIE.reduceMotion)?.value === '1',
    reduceSkew: store.get(SETTINGS_COOKIE.reduceSkew)?.value === '1',
    printHand: store.get(SETTINGS_COOKIE.printHand)?.value === '1',
    showEditHistory:
      store.get(SETTINGS_COOKIE.showEditHistory)?.value !== '0',
  };
}

export function settingsToHtmlAttrs(settings: LedgerSettings) {
  return {
    'data-reduce-motion': settings.reduceMotion ? '1' : undefined,
    'data-reduce-skew': settings.reduceSkew ? '1' : undefined,
    'data-print-hand': settings.printHand ? '1' : undefined,
    'data-show-edit-history': settings.showEditHistory ? '1' : '0',
  };
}

export const ledgerSettingsDefaults = DEFAULTS;
