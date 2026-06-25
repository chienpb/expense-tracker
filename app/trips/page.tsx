import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { listTrips } from '@/lib/trips';
import { AtlasBoard } from './_atlas-board';

export const metadata: Metadata = { title: 'Atlas' };

/**
 * The Atlas — the Trips home (Trips Phase 4). Owner-only world map;
 * middleware gates this route to a session (it's excluded from the public
 * `/trips/[id]` hole), but we read defensively. Placement lives in
 * atlas_x/atlas_y; the board persists drags via PATCH /api/trips.
 */
export default async function TripsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const trips = await listTrips(userId);

  return <AtlasBoard trips={trips} />;
}
