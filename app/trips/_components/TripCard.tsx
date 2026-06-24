import Link from 'next/link';
import { Stamp } from '@/app/_components/paper/Stamp';
import { formatPrintedDate } from '@/lib/paper-format';
import type { Trip } from '@/lib/trips';

/**
 * One trip in the owner's list — a parchment card linking into the viewer.
 * Public trips wear a gold `SHARED` wax stamp; private ones a dashed muted
 * mark (DECISION_LOG 2026-06-24 — public/private is metadata, shown honestly).
 */
export function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="paper-focusable group relative flex flex-col gap-2 border-2 border-[#7a5c33] bg-[#ecdcb5] px-5 py-4 transition-colors hover:bg-[#e6d2a4]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif text-[22px] font-semibold leading-tight text-[#3a2a14]">
          {trip.title}
        </h2>
        {trip.public ? (
          <Stamp text="Shared" color="gold" wear={0.4} />
        ) : (
          <span className="shrink-0 border border-dashed border-[#9a8156] px-2 py-0.5 font-typewriter text-[9px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#9a8156]">
            Private
          </span>
        )}
      </div>
      <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-[#7a5c33]">
        {formatPrintedDate(trip.date)}
      </p>
    </Link>
  );
}
