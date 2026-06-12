import { toCanvas } from 'html-to-image';

/**
 * DOM → canvas capture for the page-flip leaf (PAGE_FLIP.md §2).
 *
 * Captures the *visible viewport* of the page root: the clone is
 * shifted by the current scroll offset so the texture matches exactly
 * what the user sees — the flat leaf at turn start must be
 * pixel-identical to the DOM it covers.
 *
 * Pre-warm contract: `prewarmCapture()` runs on tab hover/focus so the
 * click → turn latency is near zero. The cached capture is invalidated
 * on scroll, resize, any DOM mutation under the captured element, and
 * a short TTL — cheap approximations of "the page changed".
 */

export interface PageCapture {
  canvas: HTMLCanvasElement;
  /** CSS-pixel size of the captured viewport. */
  width: number;
  height: number;
  pixelRatio: number;
  /** How long the capture took — drives the 1× degradation rule. */
  durationMs: number;
}

const CACHE_TTL_MS = 10_000;

/** PAGE_FLIP.md §2: if capture is slow, drop to 1× — the leaf is moving,
 * nobody can read a turning page. Remembered across captures. */
let lastCaptureMs = 0;

let cached: PageCapture | null = null;
let cachedAt = 0;
let invalidators: (() => void)[] = [];
let inFlight: Promise<PageCapture> | null = null;

function dropCache() {
  cached = null;
  inFlight = null;
  for (const off of invalidators) off();
  invalidators = [];
}

function watchForInvalidation(el: HTMLElement) {
  const onScroll = () => dropCache();
  const onResize = () => dropCache();
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('resize', onResize, { passive: true });
  const observer = new MutationObserver(() => dropCache());
  observer.observe(el, { childList: true, characterData: true, subtree: true });
  invalidators = [
    () => window.removeEventListener('scroll', onScroll, { capture: true }),
    () => window.removeEventListener('resize', onResize),
    () => observer.disconnect(),
  ];
}

/**
 * Inline-resolve `var()` references inside background-image values
 * before capture. html-to-image clones the subtree into an SVG
 * `foreignObject` where root-level custom properties don't exist;
 * browsers that keep `var()` unresolved in the computed value (stable
 * Safari) then drop the var — for `RuledLines` that collapses the
 * repeating-gradient's period and the whole layer rasterizes as solid
 * `rule-blue` (the "blue page" mid-turn). Substituting the literal
 * values is pixel-identical, so doing it on the live DOM is invisible;
 * the originals are restored right after serialization.
 */
function inlineVarBackgrounds(root: HTMLElement): () => void {
  const touched: { node: HTMLElement; original: string }[] = [];
  const nodes = [root, ...root.querySelectorAll<HTMLElement>('*')];
  for (const node of nodes) {
    const computed = getComputedStyle(node);
    const value = computed.backgroundImage;
    if (value === 'none' || !value.includes('var(')) continue;
    const resolved = value.replace(
      /var\((--[\w-]+)(?:\s*,\s*([^)]*))?\)/g,
      (_, name: string, fallback?: string) =>
        computed.getPropertyValue(name).trim() || fallback?.trim() || '',
    );
    touched.push({ node, original: node.style.backgroundImage });
    node.style.backgroundImage = resolved;
  }
  return () => {
    for (const { node, original } of touched) {
      node.style.backgroundImage = original;
    }
  };
}

async function captureNow(
  el: HTMLElement,
  extraOptions?: Record<string, unknown>,
): Promise<PageCapture> {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio =
    lastCaptureMs > 150 ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const paper =
    getComputedStyle(document.documentElement)
      .getPropertyValue('--color-paper')
      .trim() || '#f6efe0';

  const started = performance.now();
  const restoreBackgrounds = inlineVarBackgrounds(el);
  let canvas: HTMLCanvasElement;
  try {
    canvas = await toCanvas(el, {
      width,
      height,
      pixelRatio,
      backgroundColor: paper,
      style: {
        transform: `translate(${-window.scrollX}px, ${-window.scrollY}px)`,
        transformOrigin: 'top left',
      },
      ...extraOptions,
    });
  } finally {
    restoreBackgrounds();
  }
  const durationMs = performance.now() - started;
  lastCaptureMs = durationMs;

  return { canvas, width, height, pixelRatio, durationMs };
}

/** Capture `el`, reusing a fresh pre-warmed capture when available. */
export async function capturePage(el: HTMLElement): Promise<PageCapture> {
  if (cached) {
    const hit = cached;
    const fresh = performance.now() - cachedAt < CACHE_TTL_MS;
    dropCache();
    if (fresh) return hit;
  }
  if (inFlight) return inFlight;
  return captureNow(el);
}

/** Fire-and-forget pre-warm; safe to call repeatedly (hover + focus). */
export function prewarmCapture(el: HTMLElement): void {
  if (inFlight) return;
  if (cached) {
    if (performance.now() - cachedAt < CACHE_TTL_MS) return;
    dropCache();
  }
  inFlight = captureNow(el)
    .then((capture) => {
      cached = capture;
      cachedAt = performance.now();
      inFlight = null;
      watchForInvalidation(el);
      return capture;
    })
    .catch(() => {
      // Pre-warm is best-effort; the real capture will surface errors.
      inFlight = null;
      return Promise.reject(new Error('prewarm failed'));
    });
  // Swallow the rejection we just created for callers who don't await.
  inFlight.catch(() => {});
}

export function getLastCaptureMs(): number {
  return lastCaptureMs;
}

declare global {
  interface Window {
    __pageFlipCapture?: (
      el?: HTMLElement,
      extraOptions?: Record<string, unknown>,
    ) => Promise<PageCapture>;
  }
}
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Dev-only escape hatch for inspecting capture output in the console.
  window.__pageFlipCapture = (el?: HTMLElement, extraOptions?) =>
    captureNow(el ?? document.body, extraOptions);
}
