import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { listTrips } from '@/lib/trips';
import { Parchment } from './_components/Parchment';
import { TripCard } from './_components/TripCard';
import { NewTripForm } from './_components/NewTripForm';

export const metadata: Metadata = { title: 'Trips' };

export default async function TripsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  // Middleware already gates this route, but read defensively.
  if (!userId) redirect('/login');

  const trips = await listTrips(userId);

  return (
    <Parchment
      title="Trips"
      subtitle="A chest of recorded journeys"
      action={
        <Link
          href="/trips/atlas"
          className="self-start border-2 border-[#7a5c33] bg-[#ecdab0] px-4 py-2 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#3a2a14] hover:bg-[#e6d2a4]"
        >
          Open the Atlas →
        </Link>
      }
    >
      <NewTripForm />

      {trips.length === 0 ? (
        <p className="mt-8 font-serif text-[18px] italic text-[#7a5c33]">
          No journeys recorded yet. Begin one above.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <li key={trip.id}>
              <TripCard trip={trip} />
            </li>
          ))}
        </ul>
      )}
    </Parchment>
  );
}
