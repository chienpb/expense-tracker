import { auth } from '@/lib/auth-config';
import {
  addScene,
  deleteScene,
  swapScenes,
  updateSceneCaption,
  updateSceneMap,
  uploadSceneImage,
  tripOwner,
  sceneOwner,
} from '@/lib/trips';

/**
 * Scene mutations. Like `/api/trips`, auth is the session cookie; we read the
 * user id and scope every write to scenes whose parent trip the user owns.
 *  - POST   multipart: { tripId, image (File), caption? } → upload + insert
 *  - PATCH  json: { id, caption } OR { id, map_x, map_y } OR { swap: [idA, idB] }
 *  - DELETE json: { id }
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
  const image = form.get('image');
  const caption = String(form.get('caption') ?? '').trim() || null;

  if (!tripId) return Response.json({ error: 'Missing tripId' }, { status: 400 });
  if (!(image instanceof File) || image.size === 0) {
    return Response.json({ error: 'An image is required' }, { status: 400 });
  }
  if ((await tripOwner(tripId)) !== uid) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const path = await uploadSceneImage(tripId, image);
  const scene = await addScene(tripId, path, caption);
  return Response.json(scene, { status: 201 });
}

export async function PATCH(request: Request) {
  const uid = await userId();
  if (!uid) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (Array.isArray(body?.swap)) {
    const [a, b] = body.swap.map((s) => String(s));
    if (!a || !b) return Response.json({ error: 'swap needs two ids' }, { status: 400 });
    if ((await sceneOwner(a)) !== uid || (await sceneOwner(b)) !== uid) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    await swapScenes(a, b);
    return Response.json({ ok: true });
  }

  const id = String(body?.id ?? '').trim();
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
  if ((await sceneOwner(id)) !== uid) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  // Trip-map placement: both coords together — two finite numbers in [0,1]
  // (placed), or both null (back to the tray). Mirrors the atlas_x/atlas_y
  // both-or-null rule in PATCH /api/trips. Coords are floats by design.
  if ('map_x' in (body ?? {}) || 'map_y' in (body ?? {})) {
    const x = body?.map_x;
    const y = body?.map_y;
    const bothNull = x === null && y === null;
    const inUnit = (v: unknown): v is number =>
      typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;
    if (!bothNull && !(inUnit(x) && inUnit(y))) {
      return Response.json(
        { error: 'map_x/map_y must both be numbers in [0,1] or both null' },
        { status: 400 },
      );
    }
    await updateSceneMap(id, bothNull ? null : (x as number), bothNull ? null : (y as number));
    return Response.json({ ok: true });
  }

  const caption = typeof body?.caption === 'string' ? body.caption.trim() || null : null;
  await updateSceneCaption(id, caption);
  return Response.json({ ok: true });
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
  if ((await sceneOwner(id)) !== uid) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  await deleteScene(id);
  return Response.json({ ok: true });
}
