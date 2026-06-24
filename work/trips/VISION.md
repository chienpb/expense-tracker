# Trips — Vision

> A place to record hikes, solo rides, and journeys — as fantasy maps you can wander back into.
> Lives at `/trips` inside the expense app. Same Paper Ledger soul, different world.

_Created 2026-06-24._

## What it is

A personal cartographer's journal. Every trip becomes a hand-drawn treasure map; every map
is a story you can step into, scene by scene. All trips together form one fantasy **Atlas** of
where you've been.

Two nested maps:
- **The Atlas** — a whimsical world map. Each trip is a marker. Click one to sail in.
- **The Trip** — its own parchment map (route from GPS, or hand-placed checkpoints), where
  wax seals open the story.

## Core philosophy

1. **Story first, map second.** The point is the journey, not the GPS trace. A trip with no
   route but a good story still works. The slideshow of scenes — image + caption, told in
   sequence — is the soul. Maps are the frame around it.
2. **Hand-drawn everything.** Almost every asset is illustrated, not generated-generic. We
   build a hand-drawn asset library slowly over time — glyphs, seals, terrain, flourishes,
   compass roses. The app should feel made by a person, not a renderer.
3. **Fantasy over fidelity.** Whimsical placement, not real coordinates. Markers are placed by
   hand to *loosely* echo the real world while keeping the freedom to make it beautiful. Truth
   is the story; the map is theatre.
4. **Mine, then maybe theirs.** Every trip toggles public/private. Private trips are a personal
   diary. Public trips are stories to share. The Atlas others see hides what's private.
5. **A world that grows.** The Atlas reveals over time (fog of war) as trips accumulate. The
   asset library grows. The app is a long, slow, personal project — built to be lived in.
6. **Paper Ledger continuity.** Inherits the existing design system, type, and texture. Same
   hand, new subject.

## What it is NOT

- Not a fitness tracker. No pace graphs, training plans, leaderboards, or social feed.
- Not a real-map app. We are not rebuilding Google Maps in sepia.
- Not auto-magic. Manual photo upload, manual placement, manual storytelling — by design.
  The effort is the point; this is a journal, not a sync target.

## Decisions locked

- `/trips` section inside the existing expense app (shared Paper Ledger system).
- Whimsical, hand-placed Atlas markers (loosely real, fully flexible).
- Hand-drawn asset library, grown incrementally.
- GPX upload for routes (no Strava OAuth) — and routes are optional per trip.
- Scenes (image + caption, sequenced) are the storytelling primitive, shared by viewer and map.

## Open questions (resolve when speccing)

- Trip-map art engine: `rough.js`-stylized real route vs purely hand-placed checkpoints — or both.
- How much of the parchment/terrain is procedural vs hand-drawn assets.
- Atlas reveal mechanic (fog of war) — Phase 4, shape it then.

---
_Roadmap: `work/trips/ROADMAP.md` (next). Build phases get their own `/spec` + `/plan`._
