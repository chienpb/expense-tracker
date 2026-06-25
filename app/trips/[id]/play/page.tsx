import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { getTrip, sceneImageUrl } from '@/lib/trips';
import { formatPrintedDate } from '@/lib/paper-format';
import { Parchment } from '../../_components/Parchment';
import { Stamp } from '@/app/_components/paper/Stamp';
import { Slideshow } from './_slideshow';

export const metadata: Metadata = { title: 'Trip' };

export default async function TripPlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ scene?: string }>;
}) {
  const { id } = await params;
  const result = await getTrip(id);
  if (!result) notFound();
  const { trip, scenes } = result;

  // Same access control as the map cover (DECISION_LOG 2026-06-24): public
  // trips render for anyone; private ones only for the owning session.
  const session = await auth();
  const isOwner = session?.user?.id === trip.user_id;
  if (!trip.public && !isOwner) notFound();

  const slides = scenes.map((s) => ({
    id: s.id,
    url: sceneImageUrl(s.image),
    caption: s.caption,
  }));

  // `?scene=<position>` deep-link from a wax seal → index in position order.
  const { scene } = await searchParams;
  const initial = Math.max(
    0,
    scenes.findIndex((s) => String(s.position) === scene),
  );

  return (
    <Parchment
      title={trip.title}
      subtitle={formatPrintedDate(trip.date)}
      action={
        <div className="flex items-center gap-3">
          {trip.public && <Stamp text="Shared" color="gold" wear={0.4} />}
          <Link
            href={`/trips/${trip.id}`}
            className="paper-focusable border-2 border-[#7a5c33] bg-[#e6d2a4] px-3 py-1.5 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#3a2a14] transition-colors hover:bg-[#dcc488]"
          >
            ◷ Map
          </Link>
        </div>
      }
    >
      {slides.length === 0 ? (
        <p className="font-serif text-[18px] italic text-[#7a5c33]">
          No scenes recorded for this journey yet.
        </p>
      ) : (
        <Slideshow slides={slides} initial={initial} />
      )}
    </Parchment>
  );
}
