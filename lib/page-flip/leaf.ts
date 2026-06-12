import {
  CanvasTexture,
  DoubleSide,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';
import { tiltFor } from '@/lib/seed-rotation';

/**
 * The leaf — geometry, curl timeline, and shaders (PAGE_FLIP.md §1, §2).
 *
 * The page is a high-segment plane deformed in the vertex shader around
 * a moving, tilted curl axis (a line in page space). Points beyond the
 * axis wrap around a cylinder of radius R; past half a turn they lie
 * flat, mirrored, hovering at 2R. With the orthographic top-down camera
 * the 3D shows through xy foreshortening, shading, and the back-face
 * reveal — exactly how a real page-curl reads.
 *
 * Page coordinates: x ∈ [0, W] left→right, y ∈ [0, H] bottom→top (y-up,
 * matching the ortho camera in renderer.ts).
 */

export interface CurlState {
  /** Point on the curl axis (page coords). */
  axis: Vector2;
  /** Unit normal pointing into the curled (lifted) region. */
  normal: Vector2;
  radius: number;
  /** 0..1 — fades the contact shadow in/out at the ends of the turn. */
  shadowFade: number;
}

export interface LeafTheme {
  paper: Vector3;
  ruleBlue: Vector3;
  rulePink: Vector3;
  ink: Vector3;
  /** Warm shadow tint — lamp-toned on Midnight (§4 + quality bar #4). */
  shadowTint: Vector3;
  marginX: number;
}

/* ------------------------------------------------------------------ */
/* Curl timeline                                                       */
/* ------------------------------------------------------------------ */

/** Piecewise-linear keyframe lerp on [0,1]. */
function track(stops: [number, number][], t: number): number {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, v0] = stops[i - 1];
      const [t1, v1] = stops[i];
      const f = (t - t0) / (t1 - t0);
      // smooth each segment so keyframes don't read as kinks
      const s = f * f * (3 - 2 * f);
      return v0 + (v1 - v0) * s;
    }
  }
  return stops[stops.length - 1][1];
}

/**
 * Curl parameters at eased progress `t` for a forward (right-to-left)
 * turn on a `w`×`h` page. `seedKey` deterministically tilts the axis
 * (§1.8 — the Daybook→Recurring turn bends the same way every time).
 * `swayPhase` (radians) adds the sub-degree mid-turn hold sway.
 */
export function curlAt(
  t: number,
  w: number,
  h: number,
  seedKey: string,
  swayPhase = 0,
): CurlState {
  // Radius: loose at the peel, tightens past vertical, relaxes as the
  // page lays down, then collapses so the settle ends flat (§1.2).
  const radius =
    w *
    track(
      [
        [0.0, 0.18],
        [0.5, 0.085],
        [0.85, 0.13],
        [1.0, 0.035],
      ],
      t,
    );

  // Axis tilt: steep at first so the curl propagates diagonally from
  // the bottom-outside corner (§1.1), easing to a small seeded tilt.
  const seededDeg = tiltFor(seedKey, 3); // [-3°, +3°], stable per route
  const tiltDeg =
    track(
      [
        [0.0, -38],
        [0.35, seededDeg],
        [1.0, seededDeg],
      ],
      t,
    ) +
    Math.sin(swayPhase) * 0.4; // hold sway: sub-degree, ~1s period

  // Axis travel along the bottom edge: from just past the right edge
  // (corner barely lifting) to far enough left that the whole mirrored
  // leaf is offscreen at t=1.
  const endRadius = w * 0.035;
  const endX = -(Math.PI * endRadius + 0.08 * w);
  const ax =
    track(
      [
        [0.0, 1.005],
        [0.18, 0.88],
        [1.0, endX / w],
      ],
      t,
    ) *
      w +
    Math.sin(swayPhase) * 0.004 * w;

  const phi = (tiltDeg * Math.PI) / 180;
  // normal points right-ish (into the curled region); negative tilt
  // dips it toward the bottom corner.
  const normal = new Vector2(Math.cos(phi), Math.sin(phi));

  const shadowFade =
    track(
      [
        [0.0, 0.0],
        [0.08, 1.0],
        [0.88, 1.0],
        [1.0, 0.0],
      ],
      t,
    ) * 1.0;

  return { axis: new Vector2(ax, 0), normal, radius, shadowFade };
}

/** Mirror a forward curl across the vertical centerline for backward turns. */
export function mirrorCurl(state: CurlState, w: number): CurlState {
  return {
    axis: new Vector2(w - state.axis.x, state.axis.y),
    normal: new Vector2(-state.normal.x, state.normal.y),
    radius: state.radius,
    shadowFade: state.shadowFade,
  };
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const LEAF_VERTEX = /* glsl */ `
  uniform vec2 uAxisA;
  uniform vec2 uAxisN;
  uniform float uRadius;

  varying vec2 vUv;
  varying vec3 vNormal3;
  varying float vDeform;

  const float PI = 3.14159265358979;

  void main() {
    vUv = uv;
    vec3 p = position;
    vec3 n = vec3(0.0, 0.0, 1.0);
    float deform = 0.0;

    float s = dot(p.xy - uAxisA, uAxisN);
    if (s > 0.0) {
      float theta = s / uRadius;
      vec2 base = p.xy - uAxisN * s;
      if (theta < PI) {
        p.xy = base + uAxisN * (sin(theta) * uRadius);
        p.z = (1.0 - cos(theta)) * uRadius;
        n = vec3(-uAxisN * sin(theta), cos(theta));
        deform = theta / PI;
      } else {
        p.xy = base - uAxisN * (s - PI * uRadius);
        p.z = 2.0 * uRadius;
        n = vec3(0.0, 0.0, -1.0);
        deform = 1.0;
      }
    }

    vNormal3 = n;
    vDeform = deform;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const LEAF_FRAGMENT = /* glsl */ `
  uniform sampler2D uTexFront;
  uniform sampler2D uGrain;
  uniform vec2 uPageSize;
  uniform vec3 uPaper;
  uniform vec3 uRuleBlue;
  uniform vec3 uRulePink;
  uniform vec3 uShadowTint;
  uniform float uMarginX;

  varying vec2 vUv;
  varying vec3 vNormal3;
  varying float vDeform;

  // Fixed, top-left-ish, matte (§1.4). No specular term exists here.
  const vec3 LIGHT = vec3(-0.35, 0.45, 0.82);

  void main() {
    vec3 light = normalize(LIGHT);
    vec3 n = normalize(vNormal3);
    if (!gl_FrontFacing) n = -n;

    vec3 color;
    float grainMask;

    if (gl_FrontFacing) {
      color = texture2D(uTexFront, vUv).rgb;
      // Grain ramps in with deformation so the flat leaf at t=0 stays
      // pixel-identical to the DOM it covers (§2 step 2).
      grainMask = clamp(vDeform * 3.0, 0.0, 1.0);
    } else {
      // Back of the leaf: same ruled paper, drawn in the sheet's own
      // uv space — the geometry flip provides the horizontal mirror.
      color = uPaper;

      vec2 px = vUv * uPageSize;
      float yFromTop = uPageSize.y - px.y;
      // rule-blue horizontals: every 32px, anchored 12px from the top
      float rulePos = yFromTop - 12.0;
      float ruleDist = abs(rulePos - 32.0 * floor(rulePos / 32.0 + 0.5));
      float rule = (1.0 - smoothstep(0.4, 1.1, ruleDist)) * step(0.0, rulePos);
      color = mix(color, uRuleBlue, rule * 0.85);

      // rule-pink margin rule at uMarginX from the sheet's left edge
      float marginDist = abs(px.x - uMarginX);
      float margin = 1.0 - smoothstep(0.4, 1.1, marginDist);
      color = mix(color, uRulePink, margin * 0.9);

      // Ink bleed-through: the front texture, softly blurred, ~7%.
      // Same-uv sampling reads horizontally mirrored once the sheet
      // has turned — which is exactly right (§1.3).
      vec2 o = vec2(1.6) / uPageSize;
      vec3 ghost = texture2D(uTexFront, vUv).rgb * 0.2;
      ghost += texture2D(uTexFront, vUv + vec2( o.x,  o.y)).rgb * 0.2;
      ghost += texture2D(uTexFront, vUv + vec2(-o.x,  o.y)).rgb * 0.2;
      ghost += texture2D(uTexFront, vUv + vec2( o.x, -o.y)).rgb * 0.2;
      ghost += texture2D(uTexFront, vUv + vec2(-o.x, -o.y)).rgb * 0.2;
      color = mix(color, ghost, 0.07);

      grainMask = 1.0;
    }

    // Paper grain (§1.6) — the leaf must not be smoother than the page.
    vec4 grain = texture2D(uGrain, vUv * uPageSize / 200.0);
    color = mix(color, grain.rgb, grain.a * 0.06 * grainMask);

    // Matte lambert-ish shading, exactly 1.0 on the flat sheet so the
    // start frame matches the DOM. Concave darkens (warm-tinted),
    // convex lightens very slightly (§1.4).
    float lit = dot(n, light) - light.z;
    float darken = clamp(-lit, 0.0, 1.0) * 0.5;
    float lighten = clamp(lit, 0.0, 1.0) * 0.06;
    color = mix(color, color * uShadowTint, darken);
    color *= 1.0 + lighten;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const SHADOW_VERTEX = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHADOW_FRAGMENT = /* glsl */ `
  uniform vec2 uAxisA;
  uniform vec2 uAxisN;
  uniform float uRadius;
  uniform float uFade;
  uniform vec3 uInk;

  varying vec2 vPos;

  void main() {
    float s = dot(vPos - uAxisA, uAxisN);
    // Soft curl-shaped band just beyond the curl line — the lifted
    // sheet's contact shadow sweeping the page below (§1.5).
    float a = smoothstep(-uRadius * 0.4, uRadius * 0.6, s) *
              (1.0 - smoothstep(uRadius * 1.8, uRadius * 4.0, s));
    gl_FragColor = vec4(uInk, a * 0.13 * uFade);
  }
`;

/* ------------------------------------------------------------------ */
/* Mesh builders                                                       */
/* ------------------------------------------------------------------ */

export interface LeafScene {
  leaf: Mesh<PlaneGeometry, ShaderMaterial>;
  shadow: Mesh<PlaneGeometry, ShaderMaterial>;
  applyCurl(state: CurlState): void;
  dispose(): void;
}

export function buildLeafScene(
  w: number,
  h: number,
  frontTexture: CanvasTexture,
  grainTexture: CanvasTexture,
  theme: LeafTheme,
): LeafScene {
  frontTexture.minFilter = LinearFilter;
  frontTexture.magFilter = LinearFilter;
  frontTexture.generateMipmaps = false;
  grainTexture.wrapS = RepeatWrapping;
  grainTexture.wrapT = RepeatWrapping;

  // ≥48×64 segments per §1.2; bending travels along x, so x gets more.
  const leafGeometry = new PlaneGeometry(w, h, 96, 64);
  leafGeometry.translate(w / 2, h / 2, 0);

  const leafMaterial = new ShaderMaterial({
    vertexShader: LEAF_VERTEX,
    fragmentShader: LEAF_FRAGMENT,
    side: DoubleSide,
    uniforms: {
      uTexFront: { value: frontTexture },
      uGrain: { value: grainTexture },
      uPageSize: { value: new Vector2(w, h) },
      uPaper: { value: theme.paper },
      uRuleBlue: { value: theme.ruleBlue },
      uRulePink: { value: theme.rulePink },
      uShadowTint: { value: theme.shadowTint },
      uMarginX: { value: theme.marginX },
      uAxisA: { value: new Vector2(w * 2, 0) },
      uAxisN: { value: new Vector2(1, 0) },
      uRadius: { value: w * 0.18 },
    },
  });
  const leaf = new Mesh(leafGeometry, leafMaterial);

  const shadowGeometry = new PlaneGeometry(w, h, 1, 1);
  shadowGeometry.translate(w / 2, h / 2, -8);
  const shadowMaterial = new ShaderMaterial({
    vertexShader: SHADOW_VERTEX,
    fragmentShader: SHADOW_FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uAxisA: { value: new Vector2(w * 2, 0) },
      uAxisN: { value: new Vector2(1, 0) },
      uRadius: { value: w * 0.18 },
      uFade: { value: 0 },
      uInk: { value: theme.ink },
    },
  });
  const shadow = new Mesh(shadowGeometry, shadowMaterial);

  function applyCurl(state: CurlState) {
    leafMaterial.uniforms.uAxisA.value.copy(state.axis);
    leafMaterial.uniforms.uAxisN.value.copy(state.normal);
    leafMaterial.uniforms.uRadius.value = state.radius;
    shadowMaterial.uniforms.uAxisA.value.copy(state.axis);
    shadowMaterial.uniforms.uAxisN.value.copy(state.normal);
    shadowMaterial.uniforms.uRadius.value = state.radius;
    shadowMaterial.uniforms.uFade.value = state.shadowFade;
  }

  function dispose() {
    leafGeometry.dispose();
    shadowGeometry.dispose();
    leafMaterial.dispose();
    shadowMaterial.dispose();
    frontTexture.dispose();
    // grain texture is cached module-wide; owner disposes it on teardown
  }

  return { leaf, shadow, applyCurl, dispose };
}
