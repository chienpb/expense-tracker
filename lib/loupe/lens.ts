import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';

/**
 * The lens — a full-viewport quad whose fragment shader paints *only*
 * inside the loupe radius (the-loupe spec, AC: refraction + brass rim +
 * rim aberration). Outside the radius the fragment is discarded, so the
 * real DOM shows through untouched — the same "paint inside only" trick
 * the page-turn leaf uses.
 *
 * Page coordinates match `renderer.ts`: x ∈ [0,w] left→right, y ∈ [0,h]
 * bottom→top (y-up), so a CanvasTexture (flipY) samples at `pageCoord /
 * size` exactly as the flat page-flip leaf does.
 */

// Center magnification ≈ 1/CENTER_BULGE. 0.5 ⇒ ~2× — enough to make the
// 6px fine-print legible without showing so many rows it turns to mush.
const LENS_VERTEX = /* glsl */ `
  varying vec2 vPage;
  void main() {
    vPage = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LENS_FRAGMENT = /* glsl */ `
  uniform sampler2D uBase;
  uniform sampler2D uFine;
  uniform vec2 uMouse;
  uniform vec2 uPageSize;
  uniform vec2 uScroll;
  uniform float uRadius;
  uniform vec3 uBrass;

  varying vec2 vPage;

  const float CENTER_BULGE = 0.62;

  void main() {
    vec2 d = vPage - uMouse;
    float dist = length(d);
    if (dist > uRadius) discard;

    float rr = dist / uRadius;             // 0 center → 1 rim
    vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);

    // Spherical refraction: pull the sample toward the center, hardest at
    // the middle, easing to no shift at the rim — a curved magnification,
    // not a flat zoom.
    float bulge = mix(CENTER_BULGE, 1.0, rr * rr);
    vec2 sampleP = uMouse + d * bulge;
    // Slide the (stale) capture by the scroll delta since it was taken, so
    // during a scroll the glass tracks the page on the GPU instead of
    // waiting for an async recapture. y-up: scrolling down (uScroll.y>0)
    // moves capture content downward in page space. Reset to 0 on recapture.
    sampleP += vec2(uScroll.x, -uScroll.y);
    vec2 uv = sampleP / uPageSize;

    // Chromatic aberration: split R/B along the radius, strongest at the
    // rim where a real glass disperses most.
    float ca = 0.010 * rr * rr;
    float r = texture2D(uBase, uv + dir * ca).r;
    float g = texture2D(uBase, uv).g;
    float b = texture2D(uBase, uv - dir * ca).b;
    vec3 base = vec3(r, g, b);

    // The provenance fine-print, composited at the same magnified UV so it
    // rides the rows it belongs to and only ever shows inside the glass.
    vec4 fine = texture2D(uFine, uv);
    base = mix(base, fine.rgb, fine.a);

    // Brass rim ring (seal-gold) with a bright inner glint and a thin dark
    // contour at the very edge — glass seated in metal.
    float rim = smoothstep(0.86, 0.95, rr) * (1.0 - smoothstep(0.98, 1.0, rr));
    float edge = smoothstep(0.97, 1.0, rr);
    vec3 col = mix(base, uBrass, rim * 0.9);
    col = mix(col, uBrass * 0.45, edge);

    // Faint inner vignette so the glass reads as curved, not a flat decal.
    col *= 1.0 - smoothstep(0.55, 0.95, rr) * 0.12;

    // Soft 1px disc edge.
    float alpha = 1.0 - smoothstep(uRadius - 1.0, uRadius, dist);
    gl_FragColor = vec4(col, alpha);
  }
`;

export interface LensScene {
  mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  setMouse(x: number, y: number): void;
  /** Page-space scroll delta since the current capture was taken. */
  setScroll(dx: number, dy: number): void;
  /** Swap textures after a scroll/resize recapture. Disposes the old ones. */
  setTextures(base: CanvasTexture, fine: CanvasTexture): void;
  dispose(): void;
}

function prep(tex: CanvasTexture): CanvasTexture {
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

export function buildLensScene(
  w: number,
  h: number,
  baseTex: CanvasTexture,
  fineTex: CanvasTexture,
  brass: Vector3,
  radius: number,
): LensScene {
  prep(baseTex);
  prep(fineTex);

  const geometry = new PlaneGeometry(w, h, 1, 1);
  geometry.translate(w / 2, h / 2, 0);

  const material = new ShaderMaterial({
    vertexShader: LENS_VERTEX,
    fragmentShader: LENS_FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uBase: { value: baseTex },
      uFine: { value: fineTex },
      uMouse: { value: new Vector2(w / 2, h / 2) },
      uPageSize: { value: new Vector2(w, h) },
      uScroll: { value: new Vector2(0, 0) },
      uRadius: { value: radius },
      uBrass: { value: brass },
    },
  });

  const mesh = new Mesh(geometry, material);

  return {
    mesh,
    setMouse(x, y) {
      material.uniforms.uMouse.value.set(x, y);
    },
    setScroll(dx, dy) {
      material.uniforms.uScroll.value.set(dx, dy);
    },
    setTextures(base, fine) {
      const oldBase = material.uniforms.uBase.value as CanvasTexture;
      const oldFine = material.uniforms.uFine.value as CanvasTexture;
      material.uniforms.uBase.value = prep(base);
      material.uniforms.uFine.value = prep(fine);
      material.uniforms.uScroll.value.set(0, 0);
      oldBase.dispose();
      oldFine.dispose();
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      (material.uniforms.uBase.value as CanvasTexture).dispose();
      (material.uniforms.uFine.value as CanvasTexture).dispose();
    },
  };
}
