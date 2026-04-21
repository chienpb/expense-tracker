const MAX_TILT_DEG = 2;

function hash32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function tiltFor(id: string, maxDeg: number = MAX_TILT_DEG): number {
  if (!id) return 0;
  const h = hash32(id);
  const normalized = (h / 0xffffffff) * 2 - 1;
  return Math.round(normalized * maxDeg * 100) / 100;
}

export function tiltStyleFor(id: string, maxDeg?: number): { transform: string } {
  return { transform: `rotate(${tiltFor(id, maxDeg)}deg)` };
}

/**
 * Stamp rotation seed — deterministically returns a value whose
 * magnitude sits in `[minDeg, maxDeg]` with a random sign. Matches
 * §2.4: "always rotated 4–8deg." Unlike `tiltFor`, the sign is the
 * only randomness — we never output a value closer to 0° than
 * `minDeg`, so stamps always look slammed-on, never neutral.
 */
export function stampRotationFor(
  id: string,
  minDeg = 4,
  maxDeg = 8,
): number {
  if (!id) return minDeg;
  const h = hash32(id);
  const sign = h & 1 ? 1 : -1;
  const spread = maxDeg - minDeg;
  const magnitude = minDeg + ((h >>> 1) % (spread * 100)) / 100;
  return Math.round(sign * magnitude * 100) / 100;
}
