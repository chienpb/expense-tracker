import { CanvasTexture, Vector3 } from 'three';
import { capturePage } from '@/lib/page-flip/capture';
import { createOverlay } from '@/lib/page-flip/renderer';
import type { Expense } from '@/lib/dashboard/queries';
import { buildFinePrint } from './fineprint';
import { buildLensScene, type LensScene } from './lens';

/**
 * The Loupe orchestrator (the-loupe spec §scope).
 *
 * `pickUp()` captures the base page + builds the hidden provenance texture
 * once, mounts a `pointer-events-none` WebGL overlay (reusing the
 * page-flip rig), and runs a rAF loop that tracks the cursor. `setDown()`
 * tears the whole thing down — no WebGL context survives at rest.
 *
 * Statically imports three.js; callers reach it via `import('@/lib/loupe')`
 * so zero three.js bytes land in the ledger's initial JS.
 */

const RADIUS = 80; // glass radius in CSS px

export interface PickUpOptions {
  /** Page root to snapshot for the refracted base layer. */
  captureEl: HTMLElement;
  /** Root to scan for `[data-row-id]` rows when drawing fine-print. */
  root: HTMLElement;
  expenses: Expense[];
  /** Called when the loupe is set back down (Esc / click-down / context loss). */
  onDown?: () => void;
}

function readBrass(): Vector3 {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-seal-gold')
    .trim();
  const hex = (raw || '#a68a3b').replace('#', '');
  const full =
    hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return new Vector3(0.65, 0.54, 0.23);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

interface Active {
  setDown: () => void;
}

let active: Active | null = null;

export function isHeld(): boolean {
  return active !== null;
}

export async function pickUp(opts: PickUpOptions): Promise<void> {
  if (active) return;

  const byId = new Map(opts.expenses.map((e) => [e.id, e]));

  // 1. CAPTURE — base page + provenance, in the same frame so they align.
  let baseTex: CanvasTexture;
  let fineTex: CanvasTexture;
  try {
    const capture = await capturePage(opts.captureEl);
    baseTex = new CanvasTexture(capture.canvas);
    fineTex = new CanvasTexture(buildFinePrint(opts.root, byId));
  } catch {
    opts.onDown?.();
    return;
  }

  // 2. OVERLAY — throws if WebGL is unavailable; bail without a fallback.
  let overlay: ReturnType<typeof createOverlay>;
  let contextLost = false;
  try {
    overlay = createOverlay(() => {
      contextLost = true;
    });
  } catch {
    baseTex.dispose();
    fineTex.dispose();
    opts.onDown?.();
    return;
  }

  const { width: w, height: h } = overlay;
  const lens: LensScene = buildLensScene(w, h, baseTex, fineTex, readBrass(), RADIUS);
  overlay.scene.add(lens.mesh);

  // Track the cursor in page coords (y-up). Start centered.
  let mx = w / 2;
  let my = h / 2;
  let dirty = false; // scroll/resize settled → recapture textures
  let recapturing = false;
  // Scroll position the current capture was taken at. While scrolling we
  // slide the texture by (now − origin) on the GPU; recapture only once
  // the scroll settles, then reset the delta to 0.
  let capScrollX = window.scrollX;
  let capScrollY = window.scrollY;
  let settleTimer = 0;

  const onMove = (e: MouseEvent) => {
    mx = e.clientX;
    my = window.innerHeight - e.clientY;
  };
  // mousedown anywhere sets the loupe back down. The pick-up click's own
  // mousedown already fired before this listener was added, so it doesn't
  // self-trigger.
  const onDownClick = () => setDown();
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setDown();
  };
  const onScroll = () => {
    // The slide itself is applied per-frame in frame() so it stays glued to
    // the painted scroll position; the event only schedules the recapture.
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      dirty = true;
    }, 120);
  };
  const onResize = () => {
    dirty = true;
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mousedown', onDownClick, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('resize', onResize, { passive: true });

  let raf = 0;

  async function recapture() {
    recapturing = true;
    dirty = false;
    const sx = window.scrollX;
    const sy = window.scrollY;
    try {
      const capture = await capturePage(opts.captureEl);
      lens.setTextures(
        new CanvasTexture(capture.canvas),
        new CanvasTexture(buildFinePrint(opts.root, byId)),
      );
      // The new texture was taken at (sx, sy); rebase the slide so any
      // scroll during the async capture is still tracked exactly.
      capScrollX = sx;
      capScrollY = sy;
      lens.setScroll(window.scrollX - sx, window.scrollY - sy);
    } catch {
      // Keep the stale texture; the next scroll re-tries.
    } finally {
      recapturing = false;
    }
  }

  const frame = () => {
    if (contextLost) {
      setDown();
      return;
    }
    if (dirty && !recapturing) void recapture();
    lens.setScroll(window.scrollX - capScrollX, window.scrollY - capScrollY);
    lens.setMouse(mx, my);
    overlay.render();
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  function setDown() {
    if (!active) return;
    active = null;
    cancelAnimationFrame(raf);
    clearTimeout(settleTimer);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mousedown', onDownClick);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', onScroll, { capture: true });
    window.removeEventListener('resize', onResize);
    lens.dispose();
    overlay.dispose();
    opts.onDown?.();
  }

  active = { setDown };
}

export function setDown(): void {
  active?.setDown();
}
