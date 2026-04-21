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
