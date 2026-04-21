import Link from 'next/link';
import { notFound } from 'next/navigation';
import { paperFontVariables } from '@/lib/paper-fonts';

const SECTIONS = [
  { slug: 'filters', label: 'P2 · Filters' },
  { slug: 'glyphs', label: 'P2 · Glyphs' },
  { slug: 'decoration', label: 'P2 · Decoration' },
  { slug: 'page', label: 'P3 · Page' },
  { slug: 'filetab', label: 'P3 · FileTab' },
  { slug: 'fieldline', label: 'P3 · FieldLine' },
  { slug: 'stamp', label: 'P3 · Stamp' },
  { slug: 'tape', label: 'P3 · Tape' },
  { slug: 'margin-note', label: 'P3 · MarginNote' },
  { slug: 'carbon-slip', label: 'P3 · CarbonSlip' },
  { slug: 'attachments', label: 'P3 · Attachments' },
  { slug: 'ledger-table', label: 'P4 · LedgerTable' },
  { slug: 'hand-drawn-chart', label: 'P4 · HandDrawnChart' },
  { slug: 'tally-marks', label: 'P4 · TallyMarks' },
  { slug: 'ink-blot', label: 'P4 · InkBlot' },
  { slug: 'eraser-marks', label: 'P4 · EraserMarks' },
  { slug: 'red-string', label: 'P4 · RedStringCorrection' },
  { slug: 'states', label: 'P4 · States' },
  { slug: 'dashboard-prototype', label: 'P4 · Dashboard prototype' },
  { slug: 'login', label: 'P5 · /login' },
  { slug: 'recurring', label: 'P5 · /recurring' },
  { slug: 'chat', label: 'P5 · /chat' },
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
