'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Trip } from '@/lib/trips';
import { Sea } from '../_components/carto/Sea';
import { Cartouche } from '../_components/carto/Cartouche';
import { WaxSeal } from '../_components/carto/WaxSeal';

/**
 * The Atlas board (Trips Phase 2). One world map (`/trips-atlas.svg`) on the
 * `<Sea>` ground; each placed trip is a gold `<WaxSeal>` at its [0,1]
 * atlas_x/atlas_y. Unplaced trips wait in the tray.
 *
 * Interaction is ONE pointer handler with a ~5px threshold (Trips DS / spec):
 * a tap that never crosses it navigates into the trip; a drag places/moves
 * the seal. Drop inside the map → PATCH the fraction; drop outside (over the
 * tray) → PATCH null,null (the tray IS the un-place affordance — no button).
 * Positions are fractions of the live map rect, so they stay correct on
 * resize. Red stays rationed for "you are here"; markers are gold.
 */
const DRAG_THRESHOLD = 5; // px before a tap becomes a drag

export function AtlasBoard({ trips: initial }: { trips: Trip[] }) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const [trips, setTrips] = useState(initial);
  // The in-flight drag: which trip, where it started, where the pointer is.
  const [drag, setDrag] = useState<{
    id: string;
    startX: number;
    startY: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const placed = trips.filter((t) => t.atlas_x != null && t.atlas_y != null);
  const tray = trips.filter((t) => t.atlas_x == null || t.atlas_y == null);

  /** Persist a placement; optimistic with revert if the PATCH fails. */
  async function persist(id: string, x: number | null, y: number | null) {
    const prev = trips;
    setTrips((ts) =>
      ts.map((t) => (t.id === id ? { ...t, atlas_x: x, atlas_y: y } : t)),
    );
    const res = await fetch('/api/trips', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, atlas_x: x, atlas_y: y }),
    });
    if (!res.ok) setTrips(prev); // revert on failure
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
    if (!d.moved) {
      router.push(`/trips/${d.id}`); // a tap: sail into the trip
      return;
    }
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    if (fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1) {
      persist(d.id, fx, fy); // dropped on the map → place at the fraction
    } else {
      persist(d.id, null, null); // dropped off the map → back to the tray
    }
  }

  const dragged = drag?.moved ? trips.find((t) => t.id === drag.id) : null;

  return (
    <div
      className="min-h-dvh bg-[#d8c096] px-4 py-8 sm:px-8 sm:py-12"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        {/* The world */}
        <div className="relative flex-1">
          <div
            ref={mapRef}
            className="relative w-full overflow-hidden border-2 border-[var(--trips-frame)]"
            style={{ aspectRatio: '16 / 10', touchAction: 'none' }}
          >
            <Sea className="absolute inset-0 h-full w-full">
              {/* terrain only — title/markers are React overlays */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/trips-atlas.svg"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full select-none"
                draggable={false}
              />
            </Sea>

            {placed.map((t) => (
              <button
                key={t.id}
                type="button"
                onPointerDown={(e) => onPointerDown(e, t.id)}
                aria-label={t.title}
                className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
                style={{ left: `${t.atlas_x! * 100}%`, top: `${t.atlas_y! * 100}%` }}
              >
                <WaxSeal id={t.id} label={t.title} color="gold" size={40} />
                <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-sm bg-[var(--trips-land-hi)] px-2 py-0.5 font-hand text-[14px] leading-tight text-[var(--trips-ink)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {t.title}
                </span>
              </button>
            ))}

            <div className="pointer-events-none absolute left-4 top-4">
              <Cartouche title="The Atlas" sub="The world you've wandered" />
            </div>
          </div>
        </div>

        {/* The tray — drag onto the map to place; drop here to un-place */}
        <aside className="w-full shrink-0 border-2 border-[var(--trips-frame)] bg-[var(--trips-land)] p-4 lg:w-64">
          <h2 className="font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-frame)]">
            Unplaced journeys
          </h2>
          {tray.length === 0 ? (
            <p className="mt-3 font-hand text-[15px] text-[var(--trips-ink)]">
              Every journey is on the map.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1">
              {tray.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onPointerDown={(e) => onPointerDown(e, t.id)}
                    className="flex w-full items-center gap-2 rounded-sm px-1 py-1 text-left cursor-grab touch-none hover:bg-[var(--trips-land-hi)] active:cursor-grabbing"
                  >
                    <WaxSeal id={t.id} label={t.title} color="gold" size={28} />
                    <span className="font-hand text-[16px] leading-tight text-[var(--trips-ink)]">
                      {t.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {/* the seal following the pointer while dragging */}
      {dragged && drag && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y }}
        >
          <WaxSeal id={dragged.id} label={dragged.title} color="gold" size={40} />
        </div>
      )}
    </div>
  );
}
