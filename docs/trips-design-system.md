# Trips — "Cartographer's Hand" Design System

## A sibling to Paper Ledger, for a world of hand-drawn journey maps

> **One-line soul.** A folded, foxed sheet of rag paper washed in dilute iron-gall ink, where
> the route is inked by a wobbling pen and every place-name is handwritten at a tilt — the warmth
> comes from the hand, not the tan. *Same hand as Paper Ledger, new subject.*

> **Register: brand / experiential.** The hand-drawn world IS the point — atmosphere, immersion,
> "a place you wander back into." (The parent expense app stays `product`; this register is
> Trips-scoped.) Design leads here; it does not merely serve a task.

This system was sharpened by a four-lens design council (cartography historian, anti-slop critic,
SVG/CSS pragmatist, diarist). Its forks were resolved by the owner. See `docs/DECISION_LOG.md`
(2026-06-24) for what was decided and why.

---

## 0. Inheritance — what comes from Paper Ledger unchanged

Trips is a **sibling world, shared hand**. It does NOT restate Paper Ledger; it inherits it.
Read `docs/DESIGN_SYSTEM.md` first. These carry over verbatim:

- **The five fonts** (already global): `Crimson Pro` (serif/printed), `Courier Prime` (typewriter
  labels/meta), `Patrick Hand` (primary handwriting, full Vietnamese diacritics), `Caveat`
  (display handwriting / titles / signatures, 24px+), `Archivo Black` (rubber-stamp display only).
- **The two layers: PRINTED vs WRITTEN.** Printed = the map's pre-drawn structure (coastlines,
  graticule, place-labels the system sets). Written = the traveller's contributions (the route,
  captions, the trip title). The system never fakes the written layer.
- **Nothing floats.** No drop shadows for elevation. Things are taped, pinned, sealed, or folded.
- **No emoji, no lucide/feather icons.** Only stamps, hand-drawn glyphs, wax seals, ornaments.
- **Time leaves marks.** Older trips fox more; today / "you are here" gets the one red mark.
- **The SVG filter library** (`app/_components/paper/_filters.tsx`, mounted once in root layout):
  `#paper-grain`, `#stamp-wear`, `#hand-wobble`, `#ink-bleed`, `#pencil-stroke`. Reuse, don't add.
- **The seed utilities** (`lib/seed-rotation.ts`): `tiltFor(id)` (deterministic ±2°),
  `stampRotationFor(id)` (4–8°). Deterministic = stable across reloads = it feels *placed*.
- **Motion:** physical, "like ink drying" — `cubic-bezier(0.2,0,0,1)`, 180–240ms. No spring,
  no bounce, no shimmer, no spinners. `prefers-reduced-motion` alternative is mandatory.
- **Voice:** clerical, polite, slightly old-fashioned. "Recorded ✓" not "Saved!".

---

## 1. The anti-slop covenant (read before drawing anything)

The treasure-map look — *warm tan + burnt edges + wax seals + a centered compass rose + a dotted
red route + X-marks-the-spot* — is **the** first-order AI default. Every escape route (muted-teal
"vintage nautical", sepia monochrome, topographic-contour) is itself now a cliché. The way out is
not a different reference; it is **committing to specifics no generator reaches for first**:
the iron-gall ink wash, the handwritten WRITTEN layer, and asymmetric *handled* damage.

**The governing test, applied to every element:** *Does this make the user's photo and their own
handwriting feel bigger, or smaller?* Smaller → it's costume. Cut it, or cap it to a loud surface.

**Hard bans (rewrite the element if you're about to do any of these):**

- ❌ **Symmetric edge-burn / scorched curling edges / any full-perimeter vignette or
  `radial-gradient` darkening toward the frame.** This is the #1 generated tell. Replace with
  *asymmetric* foxing blotches + one off-center fold crease + one dog-eared corner.
- ❌ **A flat tan rectangle as a surface.** `#e6d2a4` as a single solid fill is `--parchment` by
  another name. Land is always two-tone + fibered; the Atlas ground is sea, not tan (see §2).
- ❌ **A centered, symmetric, or 3D/bevelled compass rose.** It goes in a corner, hand-wobbled,
  flat two-color, and it has a job. One per map.
- ❌ **An evenly-spaced round-dot route.** Routes are continuous inked strokes with *varied-length*
  dashes, wobble, and pen-pressure taper at the ends.
- ❌ **Glossy gradient "wax" blobs** with a radial highlight (the Discord/Notion sticker look).
  Real wax is matte and darker in the recesses.
- ❌ X-marks-the-spot, skull/crossbones, parrot, treasure chest, knotted-rope borders, footprint
  route icons, teardrop GPS pins, sepia/teal *flat* monochrome washes, drop shadows, emoji.
- ❌ **Per-trip "costume" themes** (a pirate trip vs a snow trip skin). Same hand, different page —
  vary the *seed*, never the vocabulary.

**The inverse test before shipping a surface:** describe it in one sentence the way a competitor's
AI would describe theirs. If the sentence is *"a warm parchment treasure map with burnt edges, a
compass rose and a dotted route,"* it is slop — change it until the sentence is ours (the soul line
at the top).

---

## 2. Color — ink and sea carry the identity, parchment recedes

Defined as `--trips-*` CSS variables (see `app/globals.css`). Warmth enters through **accent +
handwriting + imagery**, never through a warm body fill.

### The ground is decided per surface (resolved fork)

- **Atlas (the loud world map): sea-dominant.** The ground is an *aged, uneven dilute iron-gall
  green-grey wash* — **not** teal, **not** sepia, **not** flat. Trips are wobble-bordered parchment
  **islands** floating on it. This is the single highest-leverage anti-slop move and costs the same
  as drawing a rectangle.
- **Trip maps + quiet reading surfaces: a parchment sheet** — but always foxed/fibered/two-tone,
  never a flat fill.

| Token | Value | Use |
|---|---|---|
| `--trips-sea`       | `#97a08b` | Atlas ground — dilute iron-gall green-grey wash (applied *unevenly*, never flat) |
| `--trips-sea-deep`  | `#6f7a69` | Deeper sea wash, soft asymmetric pooling, fog substrate |
| `--trips-land`      | `#e6d2a4` | Parchment landmass / sheet base (kept from Phase 1 for continuity) |
| `--trips-land-hi`   | `#ecdab0` | Coastal rim — warmer, lighter (land is **two-tone**, never one fill) |
| `--trips-land-lo`   | `#dcc896` | Interior — slightly greener/darker |
| `--trips-ink`       | `#3a2a14` | Coastlines, place-labels, structure — oxidized brown-black iron-gall, **never pure black** |
| `--trips-route`     | `#43321e` | The traveller's route — oxidized iron-gall brown (resolved fork: route is ink, not red) |
| `--trips-stipple`   | `#6b5638` | Coastal feathering / hachure hugging the coast (the strongest authenticity signal) |
| `--trips-rhumb`     | `#8a6d3f` | Faint rhumb lines across the sea — structural, low-opacity, never on a reading surface |
| `--trips-fox`       | `#9a7b46` | Foxing blotches & stains (low alpha, asymmetric placement) |
| `--trips-frame`     | `#7a5c33` | Borders, cartouche strokes (from Phase 1) |
| `--trips-red`       | `#b02a2a` | **Scarce.** "You are here" / today only. (= Paper Ledger `stamp-red`; red always means something) |
| `--trips-gold`      | `#a68a3b` | Wax-seal gold (= `seal-gold`); matte, never glossy |
| `--trips-wax-red`   | `#8c3a2e` | Matte wax red; recesses darker than the rim |

**Red is rationed.** Per Paper Ledger DNA, red marks one thing: the current position / today. The
route is **ink-brown**. Never spend red on a whole route. Contrast: all label/body text on its
ground must hit WCAG AA (≥4.5:1); `--trips-ink` on `--trips-land` and on `--trips-sea` both pass.

---

## 3. Surfaces — LOUD vs QUIET (the decoration budget)

The system's most important job is **rationing decoration**, because a catalog of beautiful parts
is a ratchet that only goes up. Two tiers, enforced by surface:

### LOUD surfaces — theatre allowed
The **Atlas** and a **trip-map cover**. Establishing shots; the user arrived to browse and wander.
Compass rose, cartouche title, terrain glyphs, rhumb lines, foxing, fog — all welcome here.

### QUIET surfaces — theatre forbidden ("the scene is church")
The **scene viewer** and the **trip-detail reading flow**. When a photo + caption is on screen:

- **Hard cap: at most ONE ambient ornament** (a single corner flourish or the page-number
  marginalia). No compass rose, no glyphs, no foxing competing with the photo.
- **The photo is the only full-contrast, full-saturation element on screen.** Decorative SVG
  opacity ≤ 0.6, confined to margins/corners.
- The caption sits in `Patrick Hand` directly beneath the photo, like a real album annotation.
- **Whimsy switches OFF the moment a scene opens.** The Atlas → scene transition should feel like
  the decoration *receding* — the map folds away and you're left with the memory. That receding is
  the thesis of the whole product.

---

## 4. Type roles (mapped onto the inherited fonts)

| Role | Family | Notes |
|---|---|---|
| Trip / Atlas title | `Caveat` | The signature on the map. Tilted, hand-set. |
| Scene caption, the route's annotations | `Patrick Hand` | The WRITTEN layer; the human showing through. VN diacritics. |
| Place-labels on a map (system-set) | `Courier Prime`, uppercase, tracked | PRINTED layer. Curve along coasts where possible. |
| Marginalia / dates / "3 of 11" | `Courier Prime`, pencil-gray | Quiet, factual — the diary's timestamp. |
| Body / printed prose | `Crimson Pro` | (Identity-preserved; on impeccable's reflex-reject list but kept via shared-hand.) |
| Stamps ("SHARED", "RECORDED") | `Archivo Black` | Via `<Stamp>` only. |

---

## 5. Component & primitive library (v1)

The whole world is built from a tiny set of reusable primitives. Build these well; everything else
composes from them. **Assets are authored, never generated** — no procedural coastlines/terrain.

### v1 — codified now (carries phases 2–4)
1. **`<HandPath>`** — the workhorse. A `<path>`/`<polyline>` through **normalized 0–1 points**
   mapped to a viewBox, `filter: url(#hand-wobble)`, `stroke-linecap=round`. Renders routes,
   rhumb lines, coastlines, cartouche underlines, fog-hole edges. Route variant uses varied-length
   dashes + end taper. GPX → points is a parse-normalize-decimate util (`lib/trips-carto.ts`).
2. **`<WaxSeal>`** — the marker primitive. Atlas trip-markers AND trip-map scene-openers are the
   same thing. Matte radial disc (gold or `wax-red`), `#stamp-wear`, seeded rotation via
   `tiltFor(id)`. Three states: **sealed** (intact, unvisited), **broken** (visited — wax cracked),
   **ghost** (private/locked on a public Atlas — shadow impression only).
3. **`<Cartouche>`** — a bordered title plate (strapwork brackets, `#hand-wobble` border). **One per
   surface**, allowed only on Atlas title and trip-map cover. Forbidden in lists / scene captions.
4. **`<CompassRose>`** — one committed self-contained SVG. 16-point portolan wind-rose: alternating
   filled/hollow points, fleur on North, flat two-color, hand-wobbled. Off-center, one per map.
5. **`<Parchment>` / `<Sea>`** — the surfaces. `<Parchment>` upgraded from Phase 1: two-tone land +
   tiled `paper-grain` fiber + asymmetric foxing + one fold crease. `<Sea>` = uneven iron-gall wash
   ground with optional faint rhumb lines, hosting island shapes.
6. **Terrain glyph sprite** — a `<symbol>` sheet (mirrors `public/glyphs.svg`), consumed via
   `<use href>`. v1 ships **3 glyphs**: mountain (overlapping humps, one shaded flank), tree
   (lollipop cluster), wave (parallel wavy lines). 1px stroke, flat/no fill, hand-wobbled.
7. **Utils** (`lib/trips-carto.ts`): `normalize(points)` → 0–1, `decimate(points, n)`, reuse
   `tiltFor(id)` for hand-placement jitter.

### Specced now, built later
- **Fog-of-war** (Phase 4): **one** SVG `<mask>` — a fogged rect (dark parchment-burn overlay)
  minus soft-edged `<circle>` holes punched at each placed marker's normalized position. Revealed =
  hole. Data-driven by existing markers; recomputed only when trips change, never per frame.
  Do NOT build tile-based or polygon-union fog. The v1 contract is exactly this sentence.

### Deferred — gold-plating (do not build in v1)
- Sea monsters / marginalia creatures — Phase 4 only, grown one at a time, Atlas-only, aria-hidden.
- Bespoke 3D "sail-into-trip" page-flip motion — use a 200ms crossfade (reduced-motion: instant).
- Graticules, scale bars, distance dividers, latitude rings — they pull toward fidelity and fight
  "fantasy over fidelity."
- Multiple cartouche styles, decorative frame borders — one cartouche, no frame.

---

## 6. Fog-of-war & the Atlas — remembering, not achievement-hunting

The soul-critical rule. An Atlas that "fills in" is one decision away from a completion meter, and a
completion meter is poison for a diary that might hold a grief trip or a goodbye ride.

- **No counts, no percentages, no "regions remaining," no badges, no streaks.** The Atlas never says
  "12 of ? trips." The unrevealed area is *uncharted* — framed as mystery and rest, never a to-do.
- **Reveal is a side effect of recording**, never a reward for an action. No confetti, no
  "unlocked!", no stamp-thump fanfare. The new marker simply *is there* next visit, the way an album
  simply has another page. Quiet > triumphant.
- **Never surface what's missing.** The system must never nag toward filling a gap.
- Framing copy: *"the world you've wandered,"* not territory conquered.

---

## 7. Public / private — an emotional move, not a toggle

Keep the language: **"a story to share" / "a page of the diary."** Privacy is the default; sharing
is a deliberate, generous act. The wax **"SHARED"** stamp reads as *something the user chose to do*,
not a publish button. Private trips on a public Atlas appear as **ghost seals** (shadow only) or are
hidden entirely — never as a teasing locked icon.

---

## 8. Intimacy moves — what makes it *theirs*, not a template

- Handwriting (`Patrick Hand` captions, `Caveat` titles) is the strongest "made by a person" signal
  and it is free. Lean on it harder than on any drawn asset.
- **Deterministic per-scene tilt** (seeded from scene id, ±2° via `tiltFor`): photos taped into an
  album at slightly-off angles by a real hand. WRITTEN layer only — never on PRINTED chrome.
- **Per-trip seed variation:** vary tilt pattern, glyph placement, foxing shape per trip so no two
  maps are identical — but never the vocabulary.
- Dated marginalia in `Courier Prime` / pencil-gray ("recorded 24 Jun 2026", "3 of 11"): the diary's
  whisper-quiet timestamp.

---

## 9. Preview

A live gallery of every token and primitive renders at **`/spikes/trips`** (dev reference, session-
gated, following the repo's existing `app/spikes/*` convention — a literal `/trips/_preview` can't
route, since Next treats `_`-prefixed folders as private and `/trips/<x>` collides with the public
`[id]` hole). Update it when the system changes — it is the visual contract.

---

*Created 2026-06-24 · v1.0 · sibling to Paper Ledger v1.0. Record exceptions in `docs/DECISION_LOG.md`.*
