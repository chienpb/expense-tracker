import { CanvasTexture } from 'three';
import { capturePage, prewarmCapture } from './capture';
import { buildLeafScene, curlAt, mirrorCurl } from './leaf';
import { createOverlay, loadGrainTexture, readLeafTheme } from './renderer';

/**
 * Page-flip orchestrator (PAGE_FLIP.md §2).
 *
 * `turnPage()` runs the capture → overlay → navigate → turn → cleanup
 * sequence. This module statically imports three.js — callers must
 * reach it through `import('@/lib/page-flip')` (the hook does) so zero
 * three.js bytes land in any route's initial JS.
 */

export type TurnDirection = 'forward' | 'backward';

export interface TurnPageOptions {
  direction: TurnDirection;
  /** Page root to snapshot — the front of the leaf. */
  captureEl: HTMLElement;
  /** Performs the actual navigation (router.push). */
  navigate: () => void;
  /** Destination path — drives paint detection and the curl seed. */
  targetPath: string;
  /**
   * Override for "has the destination painted?" — used by the spike,
   * which swaps fake pages without touching the router. Defaults to
   * polling `location.pathname` against `targetPath`.
   */
  isReady?: () => boolean;
}

export interface TurnDebug {
  captureMs: number;
  turnMs: number;
  heldMs: number;
  rendererInfo: { geometries: number; textures: number; programs: number };
}

const DURATION_MS = 400; // §1.7 — the one sanctioned long duration
const HOLD_AT = 0.55; // eased progress of the mid-air hold (~60° leaf)
const PAINT_TIMEOUT_MS = 4000; // §2 — finish the turn regardless
const SETTLE_FRAMES = 2; // rAFs after route commit ≈ first paint

/** cubic-bezier(0.2, 0, 0, 1) — fast in, gentle settle; ink drying. */
function inkDryingEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const x1 = 0.2;
  const x2 = 0;
  // solve bezier x(u) = t for u by Newton iteration
  let u = t;
  for (let i = 0; i < 6; i++) {
    const mu = 1 - u;
    const x = 3 * mu * mu * u * x1 + 3 * mu * u * u * x2 + u * u * u;
    const dx =
      3 * mu * mu * x1 + 6 * mu * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(dx) < 1e-6) break;
    u -= (x - t) / dx;
    u = Math.min(1, Math.max(0, u));
  }
  const mu = 1 - u;
  // y1 = 0, y2 = 1
  return 3 * mu * u * u + u * u * u;
}

let activeTurn: {
  retarget: (targetPath: string, navigate: () => void) => void;
} | null = null;

let lastTurnDebug: TurnDebug | null = null;

export function getLastTurnDebug(): TurnDebug | null {
  return lastTurnDebug;
}

export function isTurning(): boolean {
  return activeTurn !== null;
}

/**
 * Pre-warm on tab hover/focus: grain texture + DOM capture. Importing
 * this module at all already pulled the three.js chunk in.
 */
export function prewarm(captureEl: HTMLElement): void {
  loadGrainTexture().catch(() => {});
  prewarmCapture(captureEl);
}

/**
 * Fallback chain step 2 (§2): the original Phase 8.2 plan — a subtle
 * 400ms CSS rotateY entrance on the incoming page. Used when capture
 * or WebGL fails; gates (reduced motion etc.) were already checked by
 * the caller.
 */
function cssFallbackTurn(
  direction: TurnDirection,
  navigate: () => void,
  reason?: unknown,
) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[page-flip] falling back to CSS rotateY:', reason);
  }
  navigate();
  const html = document.documentElement;
  html.dataset.pageFlip = direction;
  window.setTimeout(() => {
    if (html.dataset.pageFlip === direction) delete html.dataset.pageFlip;
  }, DURATION_MS + 80);
}

export async function turnPage(opts: TurnPageOptions): Promise<void> {
  // A turn is already running: don't queue another leaf — let the
  // current turn finish while navigation moves to the latest target.
  if (activeTurn) {
    activeTurn.retarget(opts.targetPath, opts.navigate);
    return;
  }

  // 1. CAPTURE
  let capture;
  let grain: CanvasTexture;
  try {
    [capture, grain] = await Promise.all([
      capturePage(opts.captureEl),
      loadGrainTexture(),
    ]);
  } catch (err) {
    cssFallbackTurn(opts.direction, opts.navigate, err);
    return;
  }

  // 2. OVERLAY
  let overlay;
  let contextLost = false;
  try {
    overlay = createOverlay(() => {
      contextLost = true;
    });
  } catch (err) {
    cssFallbackTurn(opts.direction, opts.navigate, err);
    return;
  }

  const { width: w, height: h } = overlay;
  const theme = readLeafTheme();
  if (process.env.NODE_ENV === 'development') {
    (window as unknown as { __pageFlipLastCanvas?: HTMLCanvasElement })
      .__pageFlipLastCanvas = capture.canvas;
  }
  const frontTexture = new CanvasTexture(capture.canvas);
  const leafScene = buildLeafScene(w, h, frontTexture, grain, theme);
  overlay.scene.add(leafScene.shadow);
  overlay.scene.add(leafScene.leaf);

  const applyProgress = (eased: number, swayPhase = 0) => {
    let state = curlAt(eased, w, h, opts.targetPath, swayPhase);
    if (opts.direction === 'backward') state = mirrorCurl(state, w);
    leafScene.applyCurl(state);
    overlay.render();
  };

  // Draw the flat leaf before navigating — pixel-identical cover.
  try {
    applyProgress(0);
  } catch (err) {
    leafScene.dispose();
    overlay.dispose();
    cssFallbackTurn(opts.direction, opts.navigate, err);
    return;
  }

  // 3. NAVIGATE — the new route renders under the overlay.
  let targetPath = opts.targetPath;
  opts.navigate();
  const navStarted = performance.now();

  const defaultReady = () => window.location.pathname === targetPath;
  const isCommitted = opts.isReady ?? defaultReady;
  // Dev-only: `window.__pageFlipForceHold = true` freezes the turn at the
  // mid-air hold (ignoring the paint signal and timeout) so the curl can
  // be inspected. Clear the flag to let the turn finish.
  const forceHold = () =>
    process.env.NODE_ENV === 'development' &&
    (window as unknown as { __pageFlipForceHold?: boolean })
      .__pageFlipForceHold === true;

  // 4. TURN
  await new Promise<void>((resolve) => {
    let startTime: number | null = null;
    let holdStarted: number | null = null;
    let heldTotal = 0;
    let settleFrames = 0;

    activeTurn = {
      retarget(nextPath, navigate) {
        targetPath = nextPath;
        navigate();
      },
    };

    const finish = () => {
      const info = overlay.renderer.info;
      lastTurnDebug = {
        captureMs: capture.durationMs,
        turnMs: performance.now() - navStarted,
        heldMs: heldTotal,
        rendererInfo: {
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          programs: info.programs?.length ?? 0,
        },
      };
      leafScene.dispose();
      overlay.dispose();
      activeTurn = null;
      resolve();
    };

    const frame = (now: number) => {
      if (contextLost) {
        // §3: snap to completed state — navigation already happened.
        finish();
        return;
      }
      if (startTime === null) startTime = now;

      // Route-paint tracking: commit, then a couple of settle frames.
      const painted =
        !forceHold() &&
        (settleFrames >= SETTLE_FRAMES ||
          now - navStarted > PAINT_TIMEOUT_MS);
      if (!painted && isCommitted()) settleFrames += 1;

      const elapsed = now - startTime - heldTotal;
      const eased = inkDryingEase(elapsed / DURATION_MS);

      if (eased >= HOLD_AT && !painted) {
        // Slow route: hold mid-turn with a slow sub-degree sway (§2).
        if (holdStarted === null) holdStarted = now;
        const swayPhase = ((now - holdStarted) / 1000) * Math.PI * 2;
        applyProgress(HOLD_AT, swayPhase);
        requestAnimationFrame(frame);
        return;
      }
      if (holdStarted !== null) {
        heldTotal += now - holdStarted;
        holdStarted = null;
        requestAnimationFrame(frame);
        return;
      }

      applyProgress(Math.min(eased, 1));
      if (elapsed >= DURATION_MS) {
        finish();
        return;
      }
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  });
}
