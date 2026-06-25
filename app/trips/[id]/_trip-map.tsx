'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Trip } from '@/lib/trips';
import { formatPrintedDate } from '@/lib/paper-format';
import { Foxing } from '../_components/carto/Foxing';
import { HandPath } from '../_components/carto/HandPath';
import { WaxSeal } from '../_components/carto/WaxSeal';
import { Cartouche } from '../_components/carto/Cartouche';
import { CompassRose } from '../_components/carto/CompassRose';

/**
 * The trip-map cover (Trips Phase 3) — a parchment sheet where the route is
 * inked and every scene is a hand-placed wax seal. A LOUD surface (Trips DS
 * §3): foxing + cartouche + compass rose + route are all welcome here.
 *
 * View is the default for everyone, owner included — seals are links into
 * the slideshow, no tray/upload/drag. The owner enters edit mode explicitly
 * via "Edit map", which mirrors the Atlas verbatim: ONE pointer handler with
 * a ~5px threshold — a tap sails into that scene (`/play?scene=<position>`);
 * a drag places/moves the seal. Drop inside the map → PATCH the fraction;
 * drop outside (over the tray) → PATCH null,null. Positions are fractions of
 * the live map rect, so they stay correct on resize.
 */
const DRAG_THRESHOLD = 5; // px before a tap becomes a drag

type MapScene = {
  id: string;
  caption: string | null;
  position: number;
  map_x: number | null;
  map_y: number | null;
  url: string;
};

export function TripMap({
  trip,
  scenes: initial,
  isOwner,
}: {
  trip: Trip;
  scenes: MapScene[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const [scenes, setScenes] = useState(initial);
  const [route, setRoute] = useState(trip.route);
  const [busy, setBusy] = useState(false);
  // View is the default for everyone, owner included. Editing (drag-place
  // seals, GPX) is an explicit owner-only mode entered via the "Edit map"
  // toggle — so the owner sees their cover exactly as a visitor does first.
  const [editing, setEditing] = useState(false);
  const canEdit = isOwner && editing;
  const [drag, setDrag] = useState<{
    id: string;
    startX: number;
    startY: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const placed = scenes.filter((s) => s.map_x != null && s.map_y != null);
  const tray = scenes.filter((s) => s.map_x == null || s.map_y == null);
  const dateLabel = formatPrintedDate(trip.date);
  const count = scenes.length;
  const sub = `${dateLabel} · ${count} ${count === 1 ? 'scene' : 'scenes'}`;

  /** Persist a placement; optimistic with revert if the PATCH fails. */
  async function persist(id: string, x: number | null, y: number | null) {
    const prev = scenes;
    setScenes((ss) =>
      ss.map((s) => (s.id === id ? { ...s, map_x: x, map_y: y } : s)),
    );
    const res = await fetch('/api/trips/scenes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, map_x: x, map_y: y }),
    });
    if (!res.ok) setScenes(prev); // revert on failure
  }

  function onPointerDown(e: React.PointerEvent, id: string) {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ id, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const moved =
      drag.moved ||
      Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > DRAG_THRESHOLD;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved });
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    const scene = scenes.find((s) => s.id === d.id);
    if (!d.moved) {
      if (scene) router.push(`/trips/${trip.id}/play?scene=${scene.position}`);
      return;
    }
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    if (fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1) {
      persist(d.id, fx, fy); // dropped on the map → place at the fraction
    } else {
      persist(d.id, null, null); // dropped off → back to the tray
    }
  }

  async function onGpx(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setBusy(true);
    const form = new FormData();
    form.append('tripId', trip.id);
    form.append('file', file);
    const res = await fetch('/api/trips/gpx', { method: 'POST', body: form });
    setBusy(false);
    if (res.ok) setRoute((await res.json()).route);
    else alert((await res.json().catch(() => null))?.error ?? 'Could not read that .gpx');
  }

  async function removeRoute() {
    setBusy(true);
    const res = await fetch('/api/trips/gpx', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId: trip.id }),
    });
    setBusy(false);
    if (res.ok) setRoute(null);
  }

  const dragged = drag?.moved ? scenes.find((s) => s.id === drag.id) : null;

  /** Seal + hover caption — shared by the owner (drag) and viewer (link) seals. */
  const sealFace = (s: MapScene) => (
    <>
      <WaxSeal id={s.id} label={s.caption ?? `Scene ${s.position}`} color="gold" glyph={String(s.position)} size={38} />
      {s.caption && (
        <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-sm bg-[var(--trips-land-hi)] px-2 py-0.5 font-hand text-[14px] leading-tight text-[var(--trips-ink)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {s.caption}
        </span>
      )}
    </>
  );

  return (
    <div
      className="min-h-dvh bg-[#d8c096] px-4 py-8 sm:px-8 sm:py-12"
      onPointerMove={canEdit ? onPointerMove : undefined}
      onPointerUp={canEdit ? onPointerUp : undefined}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        {/* The sheet */}
        <div className="relative flex-1">
          <div
            ref={mapRef}
            className="relative w-full overflow-hidden border-2 border-[var(--trips-frame)] bg-[var(--trips-land)]"
            style={{ aspectRatio: '16 / 10', touchAction: 'none' }}
          >
            <Foxing seed={trip.id} intensity={0.5} />

            {/* the inked route (optional), inset from the edges */}
            {route && route.length >= 2 && (
              <div className="pointer-events-none absolute inset-[12%]">
                <HandPath
                  points={route}
                  variant="route"
                  width={100}
                  height={100}
                  label="The recorded route"
                  className="h-full w-full"
                />
              </div>
            )}

            {/* placed scene seals */}
            {placed.map((s) =>
              canEdit ? (
                <button
                  key={s.id}
                  type="button"
                  onPointerDown={(e) => onPointerDown(e, s.id)}
                  aria-label={s.caption ?? `Scene ${s.position}`}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
                  style={{ left: `${s.map_x! * 100}%`, top: `${s.map_y! * 100}%` }}
                >
                  {sealFace(s)}
                </button>
              ) : (
                <Link
                  key={s.id}
                  href={`/trips/${trip.id}/play?scene=${s.position}`}
                  aria-label={s.caption ?? `Scene ${s.position}`}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${s.map_x! * 100}%`, top: `${s.map_y! * 100}%` }}
                >
                  {sealFace(s)}
                </Link>
              ),
            )}

            {/* compass rose — off-center corner, one per map */}
            <div className="pointer-events-none absolute right-3 top-3">
              <CompassRose size={84} />
            </div>

            {/* cartouche — title · date · scene count */}
            <div className="absolute bottom-3 left-3">
              <Cartouche title={trip.title} sub={sub} />
            </div>
          </div>

          {/* play-from-start + edit (owner) */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/trips/${trip.id}/play`}
              className="paper-focusable border-2 border-[var(--trips-frame)] bg-[var(--trips-land)] px-3 py-1.5 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-ink)] transition-colors hover:bg-[var(--trips-land-hi)]"
            >
              Play ▸
            </Link>
            {isOwner && (
              <>
                <Link
                  href={`/trips/${trip.id}/edit`}
                  className="paper-focusable border-2 border-[var(--trips-frame)] bg-[var(--trips-land)] px-3 py-1.5 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-ink)] transition-colors hover:bg-[var(--trips-land-hi)]"
                >
                  Edit ✎
                </Link>
                <button
                  type="button"
                  onClick={() => setEditing((e) => !e)}
                  aria-pressed={editing}
                  className="paper-focusable border-2 border-[var(--trips-frame)] px-3 py-1.5 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-ink)] transition-colors data-[on=false]:bg-[var(--trips-land)] data-[on=false]:hover:bg-[var(--trips-land-hi)] data-[on=true]:bg-[var(--trips-land-hi)] data-[on=true]:font-bold"
                  data-on={editing}
                >
                  {editing ? 'Done' : 'Edit map ✎'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* The tray + route controls — owner, edit mode only */}
        {canEdit && (
          <aside className="w-full shrink-0 border-2 border-[var(--trips-frame)] bg-[var(--trips-land)] p-4 lg:w-64">
            <h2 className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-frame)]">
              The route
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              <label className="paper-focusable inline-flex cursor-pointer items-center justify-center border-2 border-[var(--trips-frame)] bg-[var(--trips-land-hi)] px-3 py-1.5 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-ink)] transition-colors hover:bg-[#dcc488]">
                {route ? 'Replace .gpx' : 'Upload .gpx'}
                <input type="file" accept=".gpx" onChange={onGpx} disabled={busy} className="sr-only" />
              </label>
              {route && (
                <button
                  type="button"
                  onClick={removeRoute}
                  disabled={busy}
                  className="paper-focusable font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-frame)] underline disabled:opacity-40"
                >
                  Remove route
                </button>
              )}
            </div>

            <h2 className="mt-6 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-frame)]">
              Unplaced scenes
            </h2>
            {tray.length === 0 ? (
              <p className="mt-3 font-hand text-[15px] text-[var(--trips-ink)]">
                Every scene is on the map.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-1">
                {tray.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onPointerDown={(e) => onPointerDown(e, s.id)}
                      className="flex w-full cursor-grab touch-none items-center gap-2 rounded-sm px-1 py-1 text-left hover:bg-[var(--trips-land-hi)] active:cursor-grabbing"
                    >
                      <WaxSeal id={s.id} label={s.caption ?? `Scene ${s.position}`} color="gold" glyph={String(s.position)} size={28} />
                      <span className="font-hand text-[16px] leading-tight text-[var(--trips-ink)]">
                        {s.caption ?? `Scene ${s.position}`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>

      {/* the seal following the pointer while dragging */}
      {dragged && drag && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y }}
        >
          <WaxSeal id={dragged.id} label={dragged.caption ?? `Scene ${dragged.position}`} color="gold" glyph={String(dragged.position)} size={38} />
        </div>
      )}
    </div>
  );
}
