import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { getTrip, sceneImageUrl } from '@/lib/trips';
import { TripMap } from './_trip-map';

export const metadata: Metadata = { title: 'Trip' };

export default async function TripMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getTrip(id);
  if (!result) notFound();
  const { trip, scenes } = result;

  // The page IS the access control for the public hole (DECISION_LOG
  // 2026-06-24): public trips render for anyone; private ones only for the
  // owning session. Everything else is a 404 — never a redirect, which would
  // leak existence.
  const session = await auth();
  const isOwner = session?.user?.id === trip.user_id;
  if (!trip.public && !isOwner) notFound();

  // Resolve image paths to CDN urls server-side (scenes store the path, not
  // the url). The seal only needs id/caption/position/placement + thumb url.
  const mapScenes = scenes.map((s) => ({
    id: s.id,
    caption: s.caption,
    position: s.position,
    map_x: s.map_x,
    map_y: s.map_y,
    url: sceneImageUrl(s.image),
  }));

  return <TripMap trip={trip} scenes={mapScenes} isOwner={isOwner} />;
}
