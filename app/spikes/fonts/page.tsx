const TORTURE_STRINGS = [
  'Phở bò — 45.000 ₫',
  'Cà phê sữa đá — Cộng Cà Phê',
  'Bún chả Đắc Kim',
  'Hoàn tiền từ Mai',
  'Cà phê sữa đá Cộng Cà Phê — chi nhánh quận 1',
  'Bánh mì thịt nguội, bánh cuốn Tây Hồ, chả giò tôm cua',
];

const STACKED_TONES = [
  ['ấ ầ ẩ ẫ ậ', 'a circumflex + 5 tones'],
  ['ằ ắ ẳ ẵ ặ', 'a breve + 5 tones'],
  ['ề ế ể ễ ệ', 'e circumflex + 5 tones'],
  ['ồ ố ổ ỗ ộ', 'o circumflex + 5 tones'],
  ['ờ ớ ở ỡ ợ', 'o horn + 5 tones'],
  ['ừ ứ ử ữ ự', 'u horn + 5 tones'],
  ['ỳ ỷ ỹ ỵ ý', 'y + 4 tones'],
];

const FONTS = [
  {
    label: 'Crimson Pro (serif — PRINTED)',
    role: 'Body, headings, computed values',
    classes: 'font-serif',
    vnSubset: true,
  },
  {
    label: 'Courier Prime (typewriter — LABELS)',
    role: 'Form labels, table headers, system tags',
    classes: 'font-mono uppercase tracking-[0.15em]',
    vnSubset: false,
  },
  {
    label: 'Patrick Hand (handwriting — USER INPUT)',
    role: 'Anything the user authored. THE trust-critical font.',
    classes: 'text-[22px] leading-[1.15]',
    style: { fontFamily: 'var(--font-hand), cursive' },
    vnSubset: true,
  },
  {
    label: 'Caveat (signature — DISPLAY FALLBACK)',
    role: 'Signatures + English-only flourishes (24px+). Spec forbids VN content here — subset is latin-ext only.',
    classes: 'text-[24px]',
    style: { fontFamily: 'var(--font-hand-signature), cursive' },
    vnSubset: false,
  },
  {
    label: 'Archivo Black (stamp — DISPLAY)',
    role: 'Rubber stamps only. Uppercase, inside a border, rotated.',
    classes: 'uppercase tracking-[0.15em]',
    style: { fontFamily: 'var(--font-stamp), sans-serif' },
    vnSubset: false,
  },
  {
    label: 'Homemade Apple (hurried — OPTIONAL)',
    role: 'Reserve slot for "rushed / casual" hand entries',
    classes: 'text-[20px]',
    style: { fontFamily: 'var(--font-hand-hurried), cursive' },
    vnSubset: false,
  },
];

export default function FontsSpike() {
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <header>
        <h1 className="font-serif text-3xl font-bold">S1 · Fonts + Vietnamese diacritics</h1>
        <p className="mt-2 font-serif text-[15px] leading-[1.55] text-[#8a7a5e]">
          Each font is loaded via <code className="font-mono text-[13px]">next/font/google</code> in{' '}
          <code className="font-mono text-[13px]">lib/paper-fonts.ts</code> with the <em>vietnamese</em>{' '}
          subset where supported. Patrick Hand&apos;s stacked-tone rendering is the go/no-go for Phase 1.
        </p>
      </header>

      {FONTS.map((f) => (
        <section key={f.label} className="border-t border-[#2c2418]/20 pt-6">
          <div className="mb-4 flex items-baseline gap-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.15em]">{f.label}</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#8a7a5e]">
              {f.vnSubset ? 'vn subset: yes' : 'vn subset: no'}
            </span>
          </div>
          <p className="mb-4 font-serif text-sm italic text-[#8a7a5e]">{f.role}</p>

          <div className={f.classes} style={f.style}>
            <div className="space-y-2">
              {TORTURE_STRINGS.map((s, i) => (
                <div key={i}>{s}</div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#8a7a5e]">
                Stacked tones — if any of these render as ▯ or stack incorrectly, fallback needed.
              </div>
              {STACKED_TONES.map(([chars, label]) => (
                <div key={label} className="flex items-baseline gap-6">
                  <span>{chars}</span>
                  <span className="font-mono text-[11px] text-[#8a7a5e]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="border-t-2 border-[#2c2418] pt-6">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.15em]">Verdict checklist</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 font-serif text-[15px]">
          <li>Does Patrick Hand render every stacked tone without tofu (▯) or misplaced diacritic?</li>
          <li>Does Caveat render Vietnamese without falling back to a system font?</li>
          <li>Are the strings legible at the specified sizes (Patrick Hand ≥ 14px, Caveat ≥ 18px)?</li>
          <li>Do any fonts show FOUT/FOIT on reload? (should not — <code>display: swap</code>)</li>
        </ul>
      </section>
    </div>
  );
}
