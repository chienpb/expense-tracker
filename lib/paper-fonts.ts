import {
  Crimson_Pro,
  Courier_Prime,
  Patrick_Hand,
  Caveat,
  Archivo_Black,
  Homemade_Apple,
} from 'next/font/google';

export const crimsonPro = Crimson_Pro({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const courierPrime = Courier_Prime({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  style: ['normal'],
  variable: '--font-typewriter',
  display: 'swap',
});

export const patrickHand = Patrick_Hand({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400'],
  variable: '--font-hand',
  display: 'swap',
});

export const caveat = Caveat({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-hand-signature',
  display: 'swap',
});

export const archivoBlack = Archivo_Black({
  subsets: ['latin', 'latin-ext'],
  weight: ['400'],
  variable: '--font-stamp',
  display: 'swap',
});

export const homemadeApple = Homemade_Apple({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-hand-hurried',
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
