import Link from 'next/link';
import { notFound } from 'next/navigation';
import { paperFontVariables } from '@/lib/paper-fonts';

const SPIKES = [
  { slug: 'fonts', label: 'S1 · Fonts + Vietnamese' },
  { slug: 'filter-perf', label: 'S2 · SVG filter perf' },
  { slug: 'rotation', label: 'S3 · Rotation seeding' },
  { slug: 'numerals', label: 'S4 · Numeral alignment' },
  { slug: 'theme', label: 'S5 · Day/Midnight theme' },
  { slug: 'motion', label: 'S6 · Reduce motion/skew' },
];

export default function SpikesLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <div
      className={`${paperFontVariables} min-h-screen`}
      style={{
        background: 'var(--color-paper, #f6efe0)',
        color: 'var(--color-ink, #2c2418)',
      }}
    >
      <header
        className="px-8 py-4"
        style={{ borderBottom: '2px solid var(--color-ink, #2c2418)' }}
      >
        <div className="flex items-baseline gap-4">
          <Link href="/spikes" className="font-mono text-xs uppercase tracking-[0.15em]">
            Paper Ledger · Spikes
          </Link>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.15em]"
            style={{ color: 'var(--color-ink-mute, #8a7a5e)' }}
          >
            Dev-only · Phase 0
          </span>
        </div>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em]">
          {SPIKES.map((s) => (
            <Link
              key={s.slug}
              href={`/spikes/${s.slug}`}
              className="hover:underline"
              style={{ color: 'var(--color-ink, #2c2418)' }}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="px-8 py-8">{children}</main>
    </div>
  );
}
