/** Runnable self-check for trips-carto. `node lib/trips-carto.check.ts` */
import assert from 'node:assert/strict';
import { normalize, decimate, toPath } from './trips-carto.ts';

// normalize maps the bounding box onto 0–1
assert.deepEqual(normalize([{ x: 10, y: 20 }, { x: 30, y: 60 }]), [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
]);

// decimate hits the target count and keeps the endpoints
const pts = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: i }));
const d = decimate(pts, 50);
assert.equal(d.length, 50);
assert.deepEqual(d[0], pts[0]);
assert.deepEqual(d[49], pts[999]);

// toPath emits M then L commands
assert.equal(toPath([{ x: 0, y: 0 }, { x: 1, y: 1 }], 100), 'M 0.00 0.00 L 100.00 100.00');

console.log('trips-carto: all checks passed');
