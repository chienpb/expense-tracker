import Link from 'next/link';
import { notFound } from 'next/navigation';
import { paperFontVariables } from '@/lib/paper-fonts';

const SECTIONS = [
  { slug: 'foundation', label: 'Phase 2 · Foundation' },
];

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <div
      className={`${paperFontVariables} min-h-screen bg-paper text-ink`}
    >
      <header className="border-b-2 border-ink px-8 py-4">
        <div className="flex items-baseline gap-4">
          <Link
            href="/design-system"
            className="font-typewriter text-xs uppercase tracking-[0.15em]"
          >
            Paper Ledger · Design System
          </Link>
          <span className="font-typewriter text-[10px] uppercase tracking-[0.15em] text-ink-mute">
            Dev-only · Visual regression deck
          </span>
        </div>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-typewriter text-[10px] uppercase tracking-[0.1em]">
          {SECTIONS.map((s) => (
            <Link key={s.slug} href={`/design-system#${s.slug}`} className="hover:underline">
              {s.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="px-8 py-8">{children}</main>
    </div>
  );
}
