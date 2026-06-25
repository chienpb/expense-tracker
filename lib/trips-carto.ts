/**
 * Trips cartography helpers — see docs/trips-design-system.md §5.
 *
 * Everything spatial is expressed in NORMALIZED 0–1 coordinates so the
 * map asset can be re-sized or re-arted without moving anything (matches
 * the atlas_x/atlas_y storage decision). Components map 0–1 → viewBox.
 */

export type Pt = { x: number; y: number };

/** Scale a set of points to fit 0–1 by their own bounding box. */
export function normalize(points: Pt[]): Pt[] {
  if (points.length === 0) return [];
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX || 1;
  const h = Math.max(...ys) - minY || 1;
  return points.map((p) => ({ x: (p.x - minX) / w, y: (p.y - minY) / h }));
}

/**
 * Reduce a dense track to ~`target` points by even stride. A GPX route
 * has thousands of points; a hand-inked line wants ~80–150.
 * ponytail: even-stride decimation, not Douglas–Peucker. Swap in DP if a
 * route ever loses a meaningful switchback.
 */
export function decimate(points: Pt[], target = 120): Pt[] {
  if (points.length <= target) return points;
  const stride = (points.length - 1) / (target - 1);
  const out: Pt[] = [];
  for (let i = 0; i < target; i++) out.push(points[Math.round(i * stride)]);
  return out;
}

/**
 * Parse `<trkpt lat="" lon="">` out of a GPX file into raw map points:
 * `x = lon` (east → right), `y = -lat` (north → up, since SVG y grows down).
 * The result is RAW — feed it through `normalize` then `decimate`. Finite
 * pairs only; malformed points are dropped.
 *
 * ponytail: regex trkpt scan; swap to an XML parser only if a real export
 * breaks it. (Attribute order varies — match lat/lon independently.)
 */
export function parseGpx(xml: string): Pt[] {
  const out: Pt[] = [];
  const tags = xml.match(/<trkpt\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const lat = Number(tag.match(/\blat\s*=\s*["']([^"']+)["']/i)?.[1]);
    const lon = Number(tag.match(/\blon\s*=\s*["']([^"']+)["']/i)?.[1]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      out.push({ x: lon, y: -lat });
    }
  }
  return out;
}

/** Normalized points → an SVG path `d` in a `size`×`size` viewBox. */
export function toPath(points: Pt[], size = 100): string {
  if (points.length === 0) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x * size).toFixed(2)} ${(p.y * size).toFixed(2)}`)
    .join(' ');
}

// Self-check: `node lib/trips-carto.ts` (Node strips the types). Runs only as
// a direct entry — bundled by Next, import.meta.main is falsy and this is dead.
if ((import.meta as { main?: boolean }).main) {
  const gpx = `<gpx><trk><trkseg>
    <trkpt lat="11.50" lon="104.90"></trkpt>
    <trkpt lon="104.95" lat="11.60" />
    <trkpt lat="bad" lon="105.0"/>
  </trkseg></trk></gpx>`;
  const raw = parseGpx(gpx);
  // two valid points (the bad lat is dropped); y = -lat, x = lon
  console.assert(raw.length === 2, 'expected 2 valid trkpts, got', raw.length);
  console.assert(raw[0].x === 104.9 && raw[0].y === -11.5, 'lon→x, -lat→y');
  const norm = normalize(raw);
  console.assert(
    norm.every((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1),
    'normalize → [0,1]',
  );
  console.assert(decimate(Array(5000).fill({ x: 0, y: 0 }), 120).length === 120, 'decimate → 120');
  console.log('trips-carto self-check ok');
}
