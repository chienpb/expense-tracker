export default function FilterPerfSpike() {
  return (
    <div className="mx-auto max-w-4xl font-serif">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">S2 · SVG filter performance</h1>
        <p className="mt-2 text-[15px] leading-[1.55] text-[#8a7a5e]">
          Two full-viewport surfaces with <code className="font-mono text-[13px]">#paper-grain</code>{' '}
          applied — one via <code className="font-mono text-[13px]">filter: url(#paper-grain)</code>{' '}
          on the surface directly (slow path), one via a small pre-filtered SVG tiled with CSS
          background-repeat (fast path).
        </p>

        <div className="mt-4 rounded-sm border border-[#2c2418]/30 bg-white/60 p-4 font-mono text-[12px]">
          <div className="mb-2 uppercase tracking-[0.15em]">How to measure</div>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Open DevTools &gt; Performance. Record while scrolling each surface.</li>
            <li>
              Also throttle CPU to 4× slowdown (simulates mid-tier Android) and repeat.
            </li>
            <li>
              Acceptable: sustained ≥ 50 fps on scroll, no long tasks &gt; 50ms tied to filter.
            </li>
            <li>Capture a screenshot of the perf panel + paste verdict into DECISION_LOG.md.</li>
          </ol>
        </div>
      </header>

      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id="paper-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.17
                      0 0 0 0 0.14
                      0 0 0 0 0.09
                      0 0 0 0.06 0"
            />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <filter id="paper-grain-tile" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.17
                      0 0 0 0 0.14
                      0 0 0 0 0.09
                      0 0 0 0.06 0"
            />
          </filter>
        </defs>
        <symbol id="grain-tile" viewBox="0 0 128 128">
          <rect width="128" height="128" fill="#f6efe0" filter="url(#paper-grain-tile)" />
        </symbol>
      </svg>

      <section className="mb-10">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em]">
          A. Slow path — filter applied to entire surface
        </div>
        <div
          className="h-[900px] w-full border border-[#2c2418]/40"
          style={{ filter: 'url(#paper-grain)', background: '#f6efe0' }}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="border-b border-[#a8c3d9]"
              style={{ height: '32px' }}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em]">
          B. Fast path — pre-filtered 128×128 SVG tile, CSS-repeated
        </div>
        <div
          className="h-[900px] w-full border border-[#2c2418]/40"
          style={{
            backgroundColor: '#f6efe0',
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.17  0 0 0 0 0.14  0 0 0 0 0.09  0 0 0 0.06 0'/></filter><rect width='128' height='128' fill='%23f6efe0' filter='url(%23g)'/></svg>\")",
            backgroundRepeat: 'repeat',
          }}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="border-b border-[#a8c3d9]"
              style={{ height: '32px' }}
            />
          ))}
        </div>
      </section>

      <section className="border-t-2 border-[#2c2418] pt-6">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.15em]">Verdict checklist</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-[15px]">
          <li>Fast path (B) should feel indistinguishable from A, at a fraction of the cost.</li>
          <li>
            If A drops below ~50 fps on 4× throttle, §7.6 wins: always ship path B, reserve path A
            for small decorative elements only.
          </li>
          <li>Record the verdict + screenshot in DECISION_LOG.md.</li>
        </ul>
      </section>
    </div>
  );
}
