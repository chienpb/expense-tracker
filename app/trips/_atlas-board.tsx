'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Trip } from '@/lib/trips';
import { WaxSeal } from './_components/carto/WaxSeal';
import { NewTripForm } from './_components/NewTripForm';

/**
 * The Atlas board — the Trips home (Trips Phase 4). One world map
 * (`/trips-atlas.jpg`) full-screen inside a thin
 * parchment frame; each placed trip is a gold `<WaxSeal>` at its [0,1]
 * atlas_x/atlas_y.
 *
 * View is the default: placed seals are plain `<Link>`s into the trip, no
 * drag, no popover. Editing is an explicit gesture via the corner "Edit ✎"
 * toggle — mirroring the trip-map (commit edd2a65). In edit mode seals become
 * draggable and a corner popover opens with the unplaced trips + a create
 * form.
 *
 * Drag is ONE pointer handler with a ~5px threshold: a tap that never crosses
 * it sails into the trip; a drag places/moves the seal. Drop inside the map →
 * PATCH the fraction; drop over the popover → PATCH null,null (the popover IS
 * the un-place affordance). Positions are fractions of the live map rect, so
 * they stay correct on resize. Red stays rationed for "you are here"; markers
 * are gold.
 */
const DRAG_THRESHOLD = 5; // px before a tap becomes a drag
const ZOOM_MIN = 1; // fit — the whole map fills the frame
const ZOOM_MAX = 6;

type Camera = { z: number; panX: number; panY: number };

const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

/** Clamp pan so the scaled map edge can never cross into the frame interior. */
function clampPan(panX: number, panY: number, z: number, rect: DOMRect): [number, number] {
  const minX = rect.width * (1 - z); // at z=1 this is 0 → pan forced to 0
  const minY = rect.height * (1 - z);
  return [Math.min(0, Math.max(minX, panX)), Math.min(0, Math.max(minY, panY))];
}

/** Zoom to a new level keeping the frame point (px,py) pinned under the cursor. */
function applyZoom(cam: Camera, newZ: number, px: number, py: number, rect: DOMRect): Camera {
  const z = clampZoom(newZ);
  const lx = (px - cam.panX) / cam.z; // the layer point currently under (px,py)
  const ly = (py - cam.panY) / cam.z;
  const [panX, panY] = clampPan(px - z * lx, py - z * ly, z, rect);
  return { z, panX, panY };
}

export function AtlasBoard({ trips: initial }: { trips: Trip[] }) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [trips, setTrips] = useState(initial);
  // View-only camera (pan/zoom). Never persisted, never touches the PATCH payload.
  const [cam, setCam] = useState<Camera>({ z: 1, panX: 0, panY: 0 });
  // Active pointers for pan (1) / pinch (2), keyed by pointerId → client coords.
  const ptrs = useRef<Map<number, { x: number; y: number }>>(new Map());
  // View is the default; editing (drag-place seals + create) is an explicit
  // mode so the Atlas reads as a finished thing first.
  const [editing, setEditing] = useState(false);
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
    e.stopPropagation(); // pressing a seal must never start a camera pan
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
    // Dropped over the popover → un-place (the popover IS the un-place tray).
    const pop = popoverRef.current?.getBoundingClientRect();
    if (pop && e.clientX >= pop.left && e.clientX <= pop.right && e.clientY >= pop.top && e.clientY <= pop.bottom) {
      persist(d.id, null, null);
      return;
    }
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Invert the camera: screen → frame → layer fraction.
    const fx = (e.clientX - rect.left - cam.panX) / (rect.width * cam.z);
    const fy = (e.clientY - rect.top - cam.panY) / (rect.height * cam.z);
    if (fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1) {
      persist(d.id, fx, fy); // dropped on the map → place at the fraction
    } else {
      persist(d.id, null, null); // dropped off the map → un-place
    }
  }

  // --- Camera gestures: drag-to-pan (1 pointer), pinch-to-zoom (2 pointers).
  // These live on the camera layer; seals stopPropagation so they never start a
  // pan. Move/up no-op when no pointer is tracked, leaving the edit-mode seal
  // drag (its own capture + outer move/up) untouched.
  function onCamPointerDown(e: React.PointerEvent) {
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onCamPointerMove(e: React.PointerEvent) {
    const prev = ptrs.current.get(e.pointerId);
    if (!prev) return; // no gesture in flight
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (ptrs.current.size >= 2) {
      // Pinch: scale by the distance ratio toward the two-finger midpoint.
      const pts = [...ptrs.current.entries()];
      const [, p1] = pts[0];
      const [, p2] = pts[1];
      const before = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [, q1] = [...ptrs.current.entries()][0];
      const [, q2] = [...ptrs.current.entries()][1];
      const after = Math.hypot(q1.x - q2.x, q1.y - q2.y);
      if (before > 0) {
        const mx = (q1.x + q2.x) / 2 - rect.left;
        const my = (q1.y + q2.y) / 2 - rect.top;
        setCam((c) => applyZoom(c, c.z * (after / before), mx, my, rect));
      }
      return;
    }

    // Pan: translate by the pointer delta, clamped.
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setCam((c) => {
      const [panX, panY] = clampPan(c.panX + dx, c.panY + dy, c.z, rect);
      return { ...c, panX, panY };
    });
  }

  function onCamPointerUp(e: React.PointerEvent) {
    ptrs.current.delete(e.pointerId);
  }

  // Wheel/trackpad zoom-to-cursor. Attached natively so preventDefault() works
  // (React's onWheel can be passive). Mac trackpad pinch arrives as ctrlKey+wheel.
  useEffect(() => {
    const frame = mapRef.current;
    if (!frame) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = frame.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      // Clamp the per-event delta so a mouse wheel's big jumps stay tame, then
      // a higher sensitivity makes the trackpad's tiny deltas actually move.
      const d = Math.max(-33, Math.min(33, e.deltaY));
      setCam((c) => applyZoom(c, c.z * Math.exp(-d * 0.006), px, py, rect));
    };
    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => frame.removeEventListener('wheel', onWheel);
  }, []);

  const dragged = drag?.moved ? trips.find((t) => t.id === drag.id) : null;
  const camMoved = cam.z !== 1 || cam.panX !== 0 || cam.panY !== 0;

  /** Seal + hover label — shared by the view (link) and edit (drag) seals. */
  const sealFace = (t: Trip) => (
    <>
      <WaxSeal id={t.id} label={t.title} color="gold" size={40} />
      <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-sm bg-[var(--trips-land-hi)] px-2 py-0.5 font-hand text-[14px] leading-tight text-[var(--trips-ink)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {t.title}
      </span>
    </>
  );

  return (
    <div
      className="relative h-dvh w-full bg-[#d8c096] p-2 sm:p-3"
      onPointerMove={editing ? onPointerMove : undefined}
      onPointerUp={editing ? onPointerUp : undefined}
    >
      <div
        ref={mapRef}
        className="relative h-full w-full overflow-hidden border-2 border-[var(--trips-frame)]"
        style={{ touchAction: 'none' }}
      >
        {/* Camera layer — pan/zoom transform; seals counter-scale to stay
            pixel-constant. Chrome below stays a sibling, screen-fixed. */}
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            transform: `translate(${cam.panX}px, ${cam.panY}px) scale(${cam.z})`,
            transformOrigin: '0 0',
            // ponytail: keep the map on its own GPU layer so pan/zoom is a
            // cheap composite, not a repaint.
            willChange: 'transform',
          }}
          onPointerDown={onCamPointerDown}
          onPointerMove={onCamPointerMove}
          onPointerUp={onCamPointerUp}
          onPointerCancel={onCamPointerUp}
        >
          {/* The Azgaar map is the ground — opaque, object-cover. No <Sea>
              wash beneath it (it covered it anyway, and Sea's rhumb SVG
              hydration-mismatched on every load).
              Pre-rasterized to JPEG (4× intrinsic) on purpose: the source SVG
              carries a heavy "dingy" filter that Firefox re-rasterizes at every
              intermediate zoom scale → janky zoom. A flat bitmap GPU-scales
              smoothly in both browsers. Regen recipe in DECISION_LOG (2026-06-25). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/trips-atlas.jpg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
            draggable={false}
          />

          {placed.map((t) =>
            editing ? (
              <button
                key={t.id}
                type="button"
                onPointerDown={(e) => onPointerDown(e, t.id)}
                aria-label={t.title}
                className="group absolute cursor-grab touch-none active:cursor-grabbing"
                style={{
                  left: `${t.atlas_x! * 100}%`,
                  top: `${t.atlas_y! * 100}%`,
                  transform: `translate(-50%, -50%) scale(${1 / cam.z})`,
                }}
              >
                {sealFace(t)}
              </button>
            ) : (
              <Link
                key={t.id}
                href={`/trips/${t.id}`}
                aria-label={t.title}
                onPointerDown={(e) => e.stopPropagation()}
                className="group absolute"
                style={{
                  left: `${t.atlas_x! * 100}%`,
                  top: `${t.atlas_y! * 100}%`,
                  transform: `translate(-50%, -50%) scale(${1 / cam.z})`,
                }}
              >
                {sealFace(t)}
              </Link>
            ),
          )}
        </div>

        {/* Edit toggle — corner affordance, mirrors the trip-map's data-on button */}
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          aria-pressed={editing}
          className="paper-focusable absolute right-4 top-4 border-2 border-[var(--trips-frame)] px-3 py-1.5 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-ink)] transition-colors data-[on=false]:bg-[var(--trips-land)] data-[on=false]:hover:bg-[var(--trips-land-hi)] data-[on=true]:bg-[var(--trips-land-hi)] data-[on=true]:font-bold"
          data-on={editing}
        >
          {editing ? 'Done' : 'Edit ✎'}
        </button>

        {/* Fit — reset the camera to 1× centered. Top-left so it clears Edit
            (top-right) and the popover (bottom-right). Hidden at the fit view
            so the default Atlas reads finished. */}
        {camMoved && (
          <button
            type="button"
            onClick={() => setCam({ z: 1, panX: 0, panY: 0 })}
            className="paper-focusable absolute left-4 top-4 border-2 border-[var(--trips-frame)] bg-[var(--trips-land)] px-3 py-1.5 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-ink)] transition-colors hover:bg-[var(--trips-land-hi)]"
          >
            Fit
          </button>
        )}

        {/* The edit popover — drag a journey onto the map to place it; drop a
            placed seal back here to un-place. Rendered only in edit mode. */}
        {editing && (
          <div
            ref={popoverRef}
            className="absolute bottom-4 right-4 max-h-[70%] w-72 overflow-y-auto border-2 border-[var(--trips-frame)] bg-[var(--trips-land)] p-4"
          >
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

            <h2 className="mt-6 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-frame)]">
              New journey
            </h2>
            <div className="mt-3">
              <NewTripForm />
            </div>
          </div>
        )}
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
