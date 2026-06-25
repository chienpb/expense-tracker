import { auth } from '@/lib/auth-config';
import { tripOwner, updateTrip } from '@/lib/trips';
import { parseGpx, normalize, decimate } from '@/lib/trips-carto';

/**
 * The trip's route (Phase 3). Auth is the session cookie via `middleware.ts`;
 * we only READ the user id and scope by `tripOwner`.
 *  - POST   multipart: { tripId, file (.gpx) } → parse → normalize → decimate
 *           to ~120 points → store as `trips.route`. Re-upload replaces.
 *  - DELETE json: { tripId } → route: null (remove the route).
 *
 * The GPX is decoration projected by its own bounding box, never geography
 * (Trips DS — fantasy over fidelity).
 */
async function userId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function POST(request: Request) {
  const uid = await userId();
  if (!uid) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

  const form = await request.formData();
  const tripId = String(form.get('tripId') ?? '').trim();
  const file = form.get('file');

  if (!tripId) return Response.json({ error: 'Missing tripId' }, { status: 400 });
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: 'A .gpx file is required' }, { status: 400 });
  }
  if ((await tripOwner(tripId)) !== uid) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const route = decimate(normalize(parseGpx(await file.text())), 120);
  // A track needs at least two points to ink a line; validate finite [0,1].
  const ok =
    route.length >= 2 &&
    route.every(
      (p) =>
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        p.x >= 0 &&
        p.x <= 1 &&
        p.y >= 0 &&
        p.y <= 1,
    );
  if (!ok) {
    return Response.json(
      { error: 'No usable track found in that .gpx' },
      { status: 400 },
    );
  }

  const trip = await updateTrip(tripId, uid, { route });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ route: trip.route });
}

export async function DELETE(request: Request) {
  const uid = await userId();
  if (!uid) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const tripId = String(body?.tripId ?? '').trim();
  if (!tripId) return Response.json({ error: 'Missing tripId' }, { status: 400 });
  if ((await tripOwner(tripId)) !== uid) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  await updateTrip(tripId, uid, { route: null });
  return Response.json({ ok: true });
}
