import { getSupabase } from './supabase';
import type { Pt } from './trips-carto';

/**
 * Trips data access (Phase 1 — Scenes). All access goes through the
 * service-role client; there is no RLS, so EVERY query that touches a
 * specific user's trips is scoped by `user_id` here (tenant scoping per
 * `database.md`, not an auth re-check — auth lives in `middleware.ts`).
 *
 * Storage: a single PUBLIC bucket `trips`. `scenes.image` stores the object
 * PATH (`${tripId}/${uuid}.${ext}`), never the full URL — `sceneImageUrl`
 * resolves it at render time so the path survives a bucket move. Public vs.
 * private is trip metadata, not CDN secrecy (DECISION_LOG 2026-06-24).
 */
export type Trip = {
  id: string;
  user_id: string;
  title: string;
  date: string;
  public: boolean;
  /** Atlas placement: normalized [0,1] fractions of the map, or null = unplaced. */
  atlas_x: number | null;
  atlas_y: number | null;
  /** Decimated route: ~120 normalized [0,1] {x,y} points, or null = no route. */
  route: Pt[] | null;
  created_at: string;
};

export type Scene = {
  id: string;
  trip_id: string;
  image: string;
  caption: string | null;
  position: number;
  /** Trip-map placement: normalized [0,1] fractions, or null = in the tray. */
  map_x: number | null;
  map_y: number | null;
  created_at: string;
};

const BUCKET = 'trips';

export async function listTrips(userId: string): Promise<Trip[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Trip + its scenes (position order). `null` if the trip doesn't exist. */
export async function getTrip(
  id: string,
): Promise<{ trip: Trip; scenes: Scene[] } | null> {
  const supabase = getSupabase();
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!trip) return null;

  const { data: scenes, error: sceneErr } = await supabase
    .from('scenes')
    .select('*')
    .eq('trip_id', id)
    .order('position', { ascending: true });
  if (sceneErr) throw new Error(sceneErr.message);

  return { trip, scenes: scenes ?? [] };
}

export async function createTrip(input: {
  userId: string;
  title: string;
  date: string;
  public: boolean;
}): Promise<Trip> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: input.userId,
      title: input.title,
      date: input.date,
      public: input.public,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/** Scoped by `user_id` — a write only lands on the caller's own trip. */
export async function updateTrip(
  id: string,
  userId: string,
  patch: Partial<
    Pick<Trip, 'title' | 'date' | 'public' | 'atlas_x' | 'atlas_y' | 'route'>
  >,
): Promise<Trip | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('trips')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTrip(id: string, userId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

/** Adds a scene at the end (position = current max + 1). */
export async function addScene(
  tripId: string,
  image: string,
  caption: string | null,
): Promise<Scene> {
  const supabase = getSupabase();
  const { data: last, error: maxErr } = await supabase
    .from('scenes')
    .select('position')
    .eq('trip_id', tripId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxErr) throw new Error(maxErr.message);
  const position = (last?.position ?? 0) + 1;

  const { data, error } = await supabase
    .from('scenes')
    .insert({ trip_id: tripId, image, caption, position })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Trip-map placement: both fractions together (placed) or both null (back to
 * the tray). Scoped by the `sceneOwner` gate in the route, like the caption
 * write — the integer invariant is money-only, so these stay floats.
 */
export async function updateSceneMap(
  id: string,
  x: number | null,
  y: number | null,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('scenes')
    .update({ map_x: x, map_y: y })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateSceneCaption(
  id: string,
  caption: string | null,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('scenes')
    .update({ caption })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

/** Swaps the `position` of two scenes (two UPDATEs). */
export async function swapScenes(a: string, b: string): Promise<void> {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from('scenes')
    .select('id, position')
    .in('id', [a, b]);
  if (error) throw new Error(error.message);
  if (!rows || rows.length !== 2) throw new Error('scenes not found');

  const [first, second] = rows;
  const { error: e1 } = await supabase
    .from('scenes')
    .update({ position: second.position })
    .eq('id', first.id);
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await supabase
    .from('scenes')
    .update({ position: first.position })
    .eq('id', second.id);
  if (e2) throw new Error(e2.message);
}

export async function deleteScene(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('scenes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Uploads an image to `${tripId}/${uuid}.${ext}`, returns the object path. */
export async function uploadSceneImage(
  tripId: string,
  file: File,
): Promise<string> {
  const supabase = getSupabase();
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${tripId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });
  if (error) throw new Error(error.message);
  return path;
}

/** Public CDN URL for a stored object path. */
export function sceneImageUrl(path: string): string {
  const supabase = getSupabase();
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Owner id of the trip a scene belongs to, or null if the scene is gone. */
export async function sceneOwner(sceneId: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('scenes')
    .select('trips(user_id)')
    .eq('id', sceneId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  // `trips` is the joined parent row.
  const trip = (data as { trips?: { user_id?: string } } | null)?.trips;
  return trip?.user_id ?? null;
}

/** Returns the trip's owner id, or null if it doesn't exist. */
export async function tripOwner(id: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('trips')
    .select('user_id')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.user_id ?? null;
}
