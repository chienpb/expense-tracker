import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { getTrip, sceneImageUrl } from '@/lib/trips';
import { Parchment } from '../../_components/Parchment';
import { TripEditor } from './_editor';

export const metadata: Metadata = { title: 'Edit trip' };

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const result = await getTrip(id);
  // Owner-only — anyone else (or a missing trip) gets a 404, never a redirect.
  if (!result || result.trip.user_id !== userId) notFound();
  const { trip, scenes } = result;

  return (
    <Parchment title={trip.title} subtitle="Editing">
      <TripEditor
        trip={{ id: trip.id, title: trip.title, date: trip.date, public: trip.public }}
        scenes={scenes.map((s) => ({
          id: s.id,
          url: sceneImageUrl(s.image),
          caption: s.caption,
        }))}
      />
    </Parchment>
  );
}
