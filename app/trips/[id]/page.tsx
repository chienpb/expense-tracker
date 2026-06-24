import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { getTrip, sceneImageUrl } from '@/lib/trips';
import { formatPrintedDate } from '@/lib/paper-format';
import { Parchment } from '../_components/Parchment';
import { Stamp } from '@/app/_components/paper/Stamp';
import { Slideshow } from './_slideshow';

export const metadata: Metadata = { title: 'Trip' };

export default async function TripViewerPage({
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

  const slides = scenes.map((s) => ({
    id: s.id,
    url: sceneImageUrl(s.image),
    caption: s.caption,
  }));

  return (
    <Parchment
      title={trip.title}
      subtitle={formatPrintedDate(trip.date)}
      action={
        <div className="flex items-center gap-3">
          {trip.public && <Stamp text="Shared" color="gold" wear={0.4} />}
          {isOwner && (
            <Link
              href={`/trips/${trip.id}/edit`}
              className="paper-focusable border-2 border-[#7a5c33] bg-[#e6d2a4] px-3 py-1.5 font-stamp text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#3a2a14] transition-colors hover:bg-[#dcc488]"
            >
              Edit ✎
            </Link>
          )}
        </div>
      }
    >
      {slides.length === 0 ? (
        <p className="font-serif text-[18px] italic text-[#7a5c33]">
          No scenes recorded for this journey yet.
        </p>
      ) : (
        <Slideshow slides={slides} />
      )}
    </Parchment>
  );
}
