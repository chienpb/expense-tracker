#!/usr/bin/env node
/**
 * SVG → PNG bake for Paper Ledger assets.
 *
 * Hand-drawn assets stay authored as SVG (the source of truth); this
 * script rasterizes any of them to PNG when a raster is cheaper at
 * runtime — e.g. the tileable paper grain (Asset A1), where a baked
 * tile skips the feTurbulence filter cost on every paint.
 *
 * Usage:
 *   pnpm bake:assets                          # bake the default set below
 *   node scripts/bake-assets.mjs in.svg [out.png] [--scale 2]
 *
 * resvg implements SVG 1.1 filters (feTurbulence included), so filter-
 * generated textures bake correctly. PNGs land next to their source
 * unless an output path is given.
 */
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

// Default bake set: [source, output, scale]
const DEFAULTS = [
  ['public/textures/paper-grain.svg', 'public/textures/paper-grain.png', 1],
];

function bake(src, out, scale) {
  // Doc comments in our asset files mention CSS vars (`--color-paper`),
  // and strict XML forbids `--` inside comments. Browsers tolerate it;
  // resvg does not. Strip comments before parsing.
  const svg = readFileSync(src, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: scale },
    background: 'rgba(0,0,0,0)',
  });
  const png = resvg.render().asPng();
  writeFileSync(out, png);
  const kb = (png.length / 1024).toFixed(1);
  console.log(`${basename(src)} → ${out} (${resvg.width * scale}×${resvg.height * scale}, ${kb} KB)`);
  return png.length;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  for (const [src, out, scale] of DEFAULTS) bake(src, out, scale);
} else {
  const scaleIdx = args.indexOf('--scale');
  const scale = scaleIdx !== -1 ? Number(args[scaleIdx + 1]) : 1;
  const positional = args.filter((a, i) => a !== '--scale' && i !== scaleIdx + 1);
  const src = positional[0];
  const out = positional[1] ?? src.replace(/\.svg$/, '.png');
  bake(src, out, scale);
}
