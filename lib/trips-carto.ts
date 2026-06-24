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

/** Normalized points → an SVG path `d` in a `size`×`size` viewBox. */
export function toPath(points: Pt[], size = 100): string {
  if (points.length === 0) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x * size).toFixed(2)} ${(p.y * size).toFixed(2)}`)
    .join(' ');
}
