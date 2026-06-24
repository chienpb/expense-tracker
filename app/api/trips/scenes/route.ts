import { auth } from '@/lib/auth-config';
import {
  addScene,
  deleteScene,
  swapScenes,
  updateSceneCaption,
  uploadSceneImage,
  tripOwner,
  sceneOwner,
} from '@/lib/trips';

/**
 * Scene mutations. Like `/api/trips`, auth is the session cookie; we read the
 * user id and scope every write to scenes whose parent trip the user owns.
 *  - POST   multipart: { tripId, image (File), caption? } → upload + insert
 *  - PATCH  json: { id, caption } OR { swap: [idA, idB] }
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
