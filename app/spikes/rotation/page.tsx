import { tiltFor } from '@/lib/seed-rotation';

const ENTRIES = [
  { id: '7b9d-1', text: 'Phở bò — 45.000 ₫' },
  { id: '7b9d-2', text: 'Cà phê sữa đá — 25.000 ₫' },
  { id: '7b9d-3', text: 'Bún chả Đắc Kim — 60.000 ₫' },
  { id: '7b9d-4', text: 'Hoàn tiền từ Mai — (200.000 ₫)' },
  { id: '7b9d-5', text: 'Grab về nhà — 38.000 ₫' },
  { id: '7b9d-6', text: 'Bánh mì thịt nguội — 30.000 ₫' },
  { id: '7b9d-7', text: 'Cà phê sữa đá Cộng — 29.000 ₫' },
  { id: '7b9d-8', text: 'Vé xem phim — 120.000 ₫' },
  { id: '7b9d-9', text: 'Sách Nguyễn Nhật Ánh — 85.000 ₫' },
  { id: '7b9d-10', text: 'Trà sữa Phúc Long — 55.000 ₫' },
];

export default function RotationSpike() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 font-serif">
        <h1 className="text-3xl font-bold">S3 · Deterministic rotation seeding</h1>
        <p className="mt-2 text-[15px] leading-[1.55] text-[#8a7a5e]">
          Each row&apos;s tilt is a pure function of its id. If this page produces a React hydration
          warning in the console, or if the tilts visibly jump after hydration, the hash is not stable
          and we need a different approach (e.g. server-computed tilts in the data layer).
        </p>
      </header>

      <section className="mb-8">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em]">
          Rendered rows — tilt shown per entry
        </div>
        <div className="space-y-4 bg-[#f6efe0] p-6">
          {ENTRIES.map((entry) => {
            const deg = tiltFor(entry.id);
            return (
              <div
                key={entry.id}
                className="flex items-baseline justify-between"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-hand), cursive',
                    fontSize: 22,
                    color: '#1f3a5f',
                  }}
                >
                  {entry.text}
                </span>
                <span className="font-mono text-[11px] text-[#8a7a5e]">
                  id={entry.id} · {deg}°
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em]">
          Invariant check — same id must always return the same tilt
        </div>
        <pre className="overflow-x-auto rounded-sm border border-[#2c2418]/30 bg-white/60 p-4 font-mono text-[12px]">
          {ENTRIES.map((e) => `tiltFor("${e.id}") = ${tiltFor(e.id)}°`).join('\n')}
        </pre>
        <p className="mt-3 font-serif text-[14px] italic text-[#8a7a5e]">
          Reload this page a few times. The numbers above must never change, and the visible tilts
          must match them. If React throws a hydration warning in the console, the function is not
          SSR-safe.
        </p>
      </section>

      <section className="border-t-2 border-[#2c2418] pt-6 font-serif">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.15em]">Verdict checklist</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-[15px]">
          <li>No hydration warnings in the browser console.</li>
          <li>Reloading 5× produces identical tilts across all rows.</li>
          <li>Tilts are distributed across the full [-2°, +2°] range (not all clustered at 0).</li>
        </ul>
      </section>
    </div>
  );
}
