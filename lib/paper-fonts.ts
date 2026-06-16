import {
  Crimson_Pro,
  Courier_Prime,
  Patrick_Hand,
  Caveat,
  Archivo_Black,
} from 'next/font/google';

/**
 * Paper Ledger font faces. Each is loaded by next/font/google and exposes a
 * CSS custom property on whatever element receives its .variable class.
 *
 * We suffix the variable with `-face` so the raw font-family declaration
 * doesn't collide with the Tailwind utility variable of the same name.
 * globals.css bridges `--font-serif` → `var(--font-serif-face)` inside
 * `@theme inline`, so `font-serif`, `font-hand`, etc. utilities resolve
 * correctly while the `<html>` element carries the face definitions.
 */
// Subsets are pinned to Latin + Vietnamese only (§8.1). latin-ext (Central/
// Eastern-European glyphs) is dropped everywhere — we ship en + vi, and the
// Vietnamese tone block plus the ₫ dong sign (U+20AB) live in the `vietnamese`
// subset, not latin-ext. Weights are trimmed to what the UI actually renders;
// see DECISION_LOG 2026-06-16 "Phase 8 · font subset + weight diet".
// Crimson Pro is a variable font: one file per (style, subset) covers the
// whole 400–700 range, so the weight list only bounds the axis — it costs
// nothing extra. Italic is split into its own `preload: false` face below so
// the (heavy) italic subsets load lazily for the handful of caption/fallback
// callsites instead of bloating every page's eager preload.
export const crimsonPro = Crimson_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '600', '700'],
  style: ['normal'],
  variable: '--font-serif-face',
  display: 'swap',
});

// Italic Crimson — the §9 small-handwriting fallback and a few muted captions.
// `preload: false`: the browser fetches it only when an italic serif glyph
// actually renders (mostly below the fold). Exposed via the `.font-serif-italic`
// utility in globals.css. — DECISION_LOG 2026-06-16.
export const crimsonProItalic = Crimson_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-serif-italic-face',
  display: 'swap',
  preload: false,
});

export const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal'],
  variable: '--font-typewriter-face',
  display: 'swap',
});

export const patrickHand = Patrick_Hand({
  subsets: ['latin', 'vietnamese'],
  weight: ['400'],
  variable: '--font-hand-face',
  display: 'swap',
});

// Caveat ships no Vietnamese subset (confirmed 2026-04-21, DECISION_LOG).
// Use only for English-only display moments — signatures, ornaments. Pinned
// to a single weight: every callsite renders it at the default 400.
export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-hand-signature-face',
  display: 'swap',
});

export const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-stamp-face',
  display: 'swap',
});

// Homemade Apple (`--font-hand-hurried`) is intentionally NOT loaded: no
// production surface consumes the `font-hand-hurried` utility (verified
// 2026-06-16). The token in globals.css falls back to `cursive` so the
// design-system deck still renders something. Reinstate the webfont here if a
// real page ever needs the hurried hand. — DECISION_LOG 2026-06-16.
export const paperFontVariables = [
  crimsonPro.variable,
  crimsonProItalic.variable,
  courierPrime.variable,
  patrickHand.variable,
  caveat.variable,
  archivoBlack.variable,
].join(' ');
