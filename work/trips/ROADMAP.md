# Trips — Roadmap

> Build order for the vision in `VISION.md`. One rule above all: **soul first, frame later.**
> Each phase ships standalone and is usable before the next exists. Later phases are
> independently skippable — nothing forces you to build the Atlas before you want it.

_Created 2026-06-24._

## The spine

A trip is a sequence of **scenes** (image + caption). That's the soul. Everything
else — Atlas, parchment maps, routes, fog of war — is theatre around it. So we build
the soul as a complete, lovable thing first, then wrap frames around it one at a time.

## Phases

### Phase 1 — Scenes (the soul)
A trip = `{ title, date, public, scenes[] }`; a scene = `{ image, caption, order }`.
- `/trips` — list of your trips (cards, newest first).
- `/trips/[id]` — the scene slideshow: image + caption, told in sequence.
- Create a trip, upload images, write captions, reorder scenes, toggle public/private.
- Paper Ledger styling throughout. No map anywhere yet.

**Done when:** you can record a real trip and the slideshow feels good to wander back into.
If it doesn't, stop — no frame saves a hollow soul.

→ spec next: `/spec trips-p1-scenes`

### Phase 2 — The Atlas (the frame)
The whimsical world map. Each Phase-1 trip becomes a hand-placed marker; click to sail
into its slideshow. Public Atlas hides private trips.
- Hand-placed markers (loosely real, fully flexible) — no real coordinates.
- One starter map asset; library grows from here.

### Phase 3 — Trip maps + routes
Each trip gets its own parchment map. GPX upload for routes (optional per trip — a trip
with no route still works). Wax seals on the map open scenes.

### Phase 4 — A world that grows
Fog-of-war reveal as trips accumulate. Deeper hand-drawn asset library (terrain, seals,
compass roses, flourishes). Long, slow, lived-in.

## Open questions — deferred, not pending

None block Phase 1. Resolve each inside its own phase's `/spec`:

- **Trip-map art engine** (rough.js-stylized route vs hand-placed checkpoints vs both) → Phase 3.
- **Procedural vs hand-drawn parchment/terrain** → Phase 3.
- **Atlas reveal mechanic** → Phase 4.

## Conventions
- One `work/trips-p<n>-<slug>/` folder per phase, per `work/README.md`. (This roadmap and
  VISION are the only things that live in `work/trips/` itself.)
- Non-trivial trade-offs → `docs/DECISION_LOG.md`, not here.
</content>
</invoke>
