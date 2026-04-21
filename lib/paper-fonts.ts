import {
  Crimson_Pro,
  Courier_Prime,
  Patrick_Hand,
  Caveat,
  Archivo_Black,
  Homemade_Apple,
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
export const crimsonPro = Crimson_Pro({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif-face',
  display: 'swap',
});

export const courierPrime = Courier_Prime({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  style: ['normal'],
  variable: '--font-typewriter-face',
  display: 'swap',
});

export const patrickHand = Patrick_Hand({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400'],
  variable: '--font-hand-face',
  display: 'swap',
});

// Caveat ships no Vietnamese subset (confirmed 2026-04-21, DECISION_LOG).
// Use only for English-only display moments — signatures, ornaments.
export const caveat = Caveat({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-hand-signature-face',
  display: 'swap',
});

export const archivoBlack = Archivo_Black({
  subsets: ['latin', 'latin-ext'],
  weight: ['400'],
  variable: '--font-stamp-face',
  display: 'swap',
});

export const homemadeApple = Homemade_Apple({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-hand-hurried-face',
  display: 'swap',
});

export const paperFontVariables = [
  crimsonPro.variable,
  courierPrime.variable,
  patrickHand.variable,
  caveat.variable,
  archivoBlack.variable,
  homemadeApple.variable,
].join(' ');
