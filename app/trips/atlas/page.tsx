import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { listTrips } from '@/lib/trips';
import { AtlasBoard } from './_atlas-board';

export const metadata: Metadata = { title: 'Atlas' };

/**
 * The Atlas — owner-only world map (Trips Phase 2). Middleware gates this
 * route to a session (it's excluded from the public `/trips/[id]` hole), but
 * we read defensively. Every placed trip is a marker; unplaced trips wait in
 * the tray. Placement lives in atlas_x/atlas_y; the board persists drags via
 * PATCH /api/trips.
 */
export default async function AtlasPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const trips = await listTrips(userId);

  return <AtlasBoard trips={trips} />;
}
