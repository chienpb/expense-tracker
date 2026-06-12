import {
  CanvasTexture,
  ColorManagement,
  OrthographicCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { LeafTheme } from './leaf';

/**
 * Overlay + renderer lifecycle (PAGE_FLIP.md §2).
 *
 * A fixed, pointer-events-none, transparent canvas over the whole
 * viewport; an orthographic camera mapped 1:1 to CSS pixels (a page on
 * a desk seen from above). Everything is created per turn and disposed
 * after — no WebGL context survives between navigations.
 *
 * The whole pipeline runs in gamma (sRGB) space with color management
 * off: the captured texture is drawn back exactly as sampled, which is
 * what makes the flat leaf pixel-identical to the DOM beneath it.
 */
ColorManagement.enabled = false;

export interface FlipOverlay {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: OrthographicCamera;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  render(): void;
  dispose(): void;
}

export function createOverlay(onContextLost: () => void): FlipOverlay {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText =
    'position:fixed;inset:0;z-index:9999;pointer-events:none;';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);

  // Throws when WebGL is unavailable — caller catches and falls back.
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);

  const lostHandler = (e: Event) => {
    e.preventDefault();
    onContextLost();
  };
  canvas.addEventListener('webglcontextlost', lostHandler);

  // y-up page coords: x ∈ [0, w], y ∈ [0, h] bottom→top.
  const camera = new OrthographicCamera(0, width, height, 0, -4000, 4000);
  const scene = new Scene();

  let mounted = false;

  return {
    renderer,
    scene,
    camera,
    canvas,
    width,
    height,
    render() {
      renderer.render(scene, camera);
      if (!mounted) {
        // First frame is drawn before the overlay enters the DOM so a
        // blank canvas never flashes over the page.
        document.body.appendChild(container);
        mounted = true;
      }
    },
    dispose() {
      canvas.removeEventListener('webglcontextlost', lostHandler);
      renderer.dispose();
      renderer.forceContextLoss();
      container.remove();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Theme — sampled live from the CSS custom properties (§4)            */
/* ------------------------------------------------------------------ */

function cssColorToVec3(raw: string, fallback: string): Vector3 {
  const value = raw.trim() || fallback;
  // Tokens are plain hex in globals.css; parse without three's color
  // management so values stay in gamma space.
  const hex = value.replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return cssColorToVec3(fallback, fallback);
  return new Vector3(
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  );
}

export function readLeafTheme(): LeafTheme {
  const style = getComputedStyle(document.documentElement);
  const get = (prop: string, fallback: string) =>
    cssColorToVec3(style.getPropertyValue(prop), fallback);
  const night = document.documentElement.dataset.theme === 'night';

  return {
    paper: get('--color-paper', night ? '#1a1410' : '#f6efe0'),
    ruleBlue: get('--color-rule-blue', night ? '#3a4a5a' : '#a8c3d9'),
    rulePink: get('--color-rule-pink', night ? '#5a3a3a' : '#d89090'),
    ink: get('--color-ink', night ? '#e8dcc4' : '#2c2418'),
    // Concave-side shadow tint: daylight-neutral by day, lamp-warm on
    // Midnight (§1.4 "the lamp, not daylight").
    shadowTint: night
      ? new Vector3(0.86, 0.74, 0.58)
      : new Vector3(0.8, 0.78, 0.75),
    marginX: window.innerWidth < 640 ? 36 : 60,
  };
}

/* ------------------------------------------------------------------ */
/* Grain texture — paper-grain.svg rasterized once (§1.6)              */
/* ------------------------------------------------------------------ */

let grainTexture: CanvasTexture | null = null;
let grainPromise: Promise<CanvasTexture> | null = null;

export function loadGrainTexture(): Promise<CanvasTexture> {
  if (grainTexture) return Promise.resolve(grainTexture);
  if (grainPromise) return grainPromise;

  grainPromise = new Promise<CanvasTexture>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const tile = document.createElement('canvas');
      tile.width = 200;
      tile.height = 200;
      const ctx = tile.getContext('2d');
      if (!ctx) {
        reject(new Error('2d context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, 200, 200);
      grainTexture = new CanvasTexture(tile);
      resolve(grainTexture);
    };
    img.onerror = () => reject(new Error('grain texture failed to load'));
    img.src = '/textures/paper-grain.svg';
  }).catch((err) => {
    grainPromise = null;
    throw err;
  });
  return grainPromise;
}
