import { auth } from '@/lib/auth-config';
import { createTrip, updateTrip, deleteTrip } from '@/lib/trips';

/**
 * Trip mutations. Auth is the session cookie via `middleware.ts`; we only
 * READ the user id here (not a re-check) and scope every write by it, so a
 * user can only touch their own trips (tenant scoping per `database.md`).
 */
async function userId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function POST(request: Request) {
  const uid = await userId();
  if (!uid) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const title = String(body?.title ?? '').trim();
  const date = String(body?.date ?? '').trim();
  const isPublic = body?.public === true;

  if (!title) return Response.json({ error: 'Title is required' }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Date must be YYYY-MM-DD' }, { status: 400 });
  }

  const trip = await createTrip({ userId: uid, title, date, public: isPublic });
  return Response.json(trip, { status: 201 });
}

export async function PATCH(request: Request) {
  const uid = await userId();
  if (!uid) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const id = String(body?.id ?? '').trim();
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

  const patch: {
    title?: string;
    date?: string;
    public?: boolean;
    atlas_x?: number | null;
    atlas_y?: number | null;
  } = {};
  if (typeof body?.title === 'string') patch.title = body.title.trim();
  if (typeof body?.date === 'string') patch.date = body.date.trim();
  if (typeof body?.public === 'boolean') patch.public = body.public;

  // Atlas placement: both coords together — two finite numbers in [0,1]
  // (placed), or both null (unplaced/back to tray). Anything else is a 400.
  if ('atlas_x' in (body ?? {}) || 'atlas_y' in (body ?? {})) {
    const x = body?.atlas_x;
    const y = body?.atlas_y;
    const bothNull = x === null && y === null;
    const inUnit = (v: unknown): v is number =>
      typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;
    if (!bothNull && !(inUnit(x) && inUnit(y))) {
      return Response.json(
        { error: 'atlas_x/atlas_y must both be numbers in [0,1] or both null' },
        { status: 400 },
      );
    }
    patch.atlas_x = bothNull ? null : (x as number);
    patch.atlas_y = bothNull ? null : (y as number);
  }

  const trip = await updateTrip(id, uid, patch);
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(trip);
}

export async function DELETE(request: Request) {
  const uid = await userId();
  if (!uid) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const id = String(body?.id ?? '').trim();
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

  await deleteTrip(id, uid);
  return Response.json({ ok: true });
}
