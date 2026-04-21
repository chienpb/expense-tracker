const ROWS = [
  { label: 'Phở bò', amount: 45_000 },
  { label: 'Cà phê sữa đá Cộng', amount: 29_000 },
  { label: 'Bún chả Đắc Kim', amount: 60_000 },
  { label: 'Vé xem phim', amount: 120_000 },
  { label: 'Thuê nhà', amount: 11_800_000 },
  { label: 'Tổng thu tháng 4', amount: 24_560_000 },
  { label: 'Hoàn tiền từ Mai', amount: -200_000 },
];

const VND = new Intl.NumberFormat('vi-VN', {
  style: 'decimal',
  maximumFractionDigits: 0,
});

function formatVND(n: number): string {
  const absolute = VND.format(Math.abs(n));
  return n < 0 ? `(${absolute} ₫)` : `${absolute} ₫`;
}

const VARIANTS = [
  { label: '(default)', css: '' },
  { label: 'oldstyle-nums', css: 'oldstyle-nums' },
  { label: 'tabular-nums', css: 'tabular-nums' },
  { label: 'oldstyle-nums tabular-nums', css: 'oldstyle-nums tabular-nums' },
  { label: 'lining-nums tabular-nums', css: 'lining-nums tabular-nums' },
];

export default function NumeralsSpike() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 font-serif">
        <h1 className="text-3xl font-bold">S4 · Numeral alignment</h1>
        <p className="mt-2 text-[15px] leading-[1.55] text-[#8a7a5e]">
          Crimson Pro renders VND amounts with VN dotted grouping (locale <code>vi-VN</code>). Each
          column uses a different <code>font-variant-numeric</code>. The winning combo for body
          tables is <code>oldstyle-nums tabular-nums</code> (§2.1): numerals feel hand-set but
          columns still line up.
        </p>
      </header>

      <section className="mb-10">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em]">
          Serif (Crimson Pro)
        </div>
        <div className="grid grid-cols-5 gap-8 font-serif text-[16px]" style={{ fontFamily: 'var(--font-serif), serif' }}>
          {VARIANTS.map((v) => (
            <div key={v.label}>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#8a7a5e]">
                {v.label}
              </div>
              <ul className="space-y-1" style={{ fontVariantNumeric: v.css }}>
                {ROWS.map((r) => (
                  <li key={r.label} className="flex justify-between gap-4">
                    <span className="truncate text-[#2c2418]/80">{r.label}</span>
                    <span className="shrink-0 text-right">{formatVND(r.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em]">
          Hero numerals — lining-nums tabular-nums (§2.5)
        </div>
        <div
          className="font-serif"
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: 'clamp(56px, 8vw, 96px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 0.95,
            fontVariantNumeric: 'lining-nums tabular-nums',
          }}
        >
          24.560.000 ₫
        </div>
      </section>

      <section className="border-t-2 border-[#2c2418] pt-6 font-serif">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.15em]">Verdict checklist</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-[15px]">
          <li>
            Columns with <code>tabular-nums</code> align perfectly (compare against the default column).
          </li>
          <li>
            <code>oldstyle-nums</code> visibly changes digit height (e.g. &quot;4&quot; descends, &quot;0&quot; sits smaller).
            If it doesn&apos;t, Crimson Pro&apos;s OpenType feature isn&apos;t firing.
          </li>
          <li>
            Negative amounts render in stamp-red parens (styling comes later; just confirm format works).
          </li>
          <li>Hero numeral dominates, reads crisp at 96px, no blurring on retina.</li>
        </ul>
      </section>
    </div>
  );
}
