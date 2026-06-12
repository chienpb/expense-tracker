'use client';

import { useEffect, useRef, useState } from 'react';
import type { TurnDebug, TurnDirection } from '@/lib/page-flip';

/**
 * Spike S7 — WebGL page flip (docs/PAGE_FLIP.md §5 step 1).
 *
 * Proves, before any real integration:
 *  (a) `html-to-image` faithfully captures our fonts + the
 *      `#hand-wobble`-filtered SVG content (capture preview below),
 *  (b) the curl shader reads as paper (screen-recording sign-off),
 *  (c) capture cost on a dashboard-sized DOM (timings below).
 *
 * Two hard-coded fake ledger pages stand in for routes; `isReady`
 * overrides the orchestrator's pathname polling so the spike can also
 * exercise the slow-route mid-turn hold. Kept after integration as the
 * shader's visual-regression surface (deleted in Phase 11).
 */

const FAKE_ROWS = [
  ['07:40', 'Cà phê sữa đá — Cộng Cà Phê', 'COFFEE', '45.000 ₫'],
  ['12:15', 'Bún chả Đắc Kim', 'FOOD', '85.000 ₫'],
  ['15:02', 'Grab về nhà', 'TRANSPORT', '62.000 ₫'],
  ['19:30', 'Phở bò tái — quán quen', 'FOOD', '70.000 ₫'],
  ['21:11', 'Hoàn tiền từ Mai', 'PAYBACK', '(120.000 ₫)'],
] as const;

function FakeDaybook() {
  return (
    <section className="relative min-h-[70vh] border-2 border-ink bg-paper p-8">
      <header className="mb-6 border-b-2 border-ink pb-3">
        <span className="font-typewriter text-[10px] uppercase tracking-[0.2em] text-ink-mute">
          Form CHN-01 · Page 16/52
        </span>
        <h2 className="font-serif text-[40px] font-bold leading-tight">
          Daily Ledger <span className="font-hand text-[30px] text-pen-navy">— tháng sáu</span>
        </h2>
      </header>
      <p className="mb-2 font-serif text-display-hero font-bold leading-none nums-lining-tabular">
        1.180.000 ₫
      </p>
      <p className="mb-6 font-hand text-[20px] text-pen-navy" style={{ transform: 'rotate(-1.2deg)' }}>
        tuần này hơi nhiều cà phê đấy nhé…
      </p>
      <table className="w-full font-serif text-[14px]">
        <tbody>
          {FAKE_ROWS.map(([time, desc, cat, amount]) => (
            <tr key={time} className="h-8 border-b border-rule-blue/60">
              <td className="w-16 font-typewriter text-[10px] uppercase text-ink-mute">{time}</td>
              <td className="font-hand text-[17px] text-pen-navy">{desc}</td>
              <td className="w-28 font-typewriter text-[10px] uppercase text-ink-mute">{cat}</td>
              <td className="w-32 text-right font-bold nums-oldstyle-tabular">{amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* hand-wobble-filtered chart — the capture-fidelity risk case */}
      <svg
        viewBox="0 0 420 120"
        className="mt-8 w-[420px] max-w-full"
        aria-label="Fake weekly spend chart"
      >
        <g filter="url(#hand-wobble)" fill="none" stroke="var(--color-pen-navy)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 110 L410 110" stroke="var(--color-ink)" />
          <path d="M10 95 C 70 60, 120 88, 170 70 S 290 30, 350 52 S 400 40, 410 44" />
          <ellipse cx="290" cy="34" rx="26" ry="14" strokeDasharray="3 2" />
        </g>
        <text x="290" y="18" textAnchor="middle" className="font-hand-signature" fontSize="13" fill="var(--color-pen-navy)">
          peak!
        </text>
      </svg>
    </section>
  );
}

function FakeStandingOrders() {
  return (
    <section className="relative min-h-[70vh] border-2 border-ink bg-paper p-8">
      <header className="mb-6 border-b-2 border-ink pb-3">
        <span className="font-typewriter text-[10px] uppercase tracking-[0.2em] text-ink-mute">
          Form CHN-02 · Page 1/1
        </span>
        <h2 className="font-serif text-[40px] font-bold leading-tight">Standing Orders</h2>
      </header>
      <p className="mb-6 font-serif text-display-hero font-bold leading-none nums-lining-tabular">
        2.350.000 ₫
      </p>
      <ul className="space-y-3 font-serif text-[15px]">
        <li className="flex justify-between border-b border-rule-blue/60 pb-1">
          <span className="font-hand text-[18px] text-pen-navy">Tiền nhà — chuyển khoản</span>
          <span className="font-bold">1.800.000 ₫ / tháng</span>
        </li>
        <li className="flex justify-between border-b border-rule-blue/60 pb-1">
          <span className="font-hand text-[18px] text-pen-navy">Internet FPT</span>
          <span className="font-bold">220.000 ₫ / tháng</span>
        </li>
        <li className="flex justify-between border-b border-rule-blue/60 pb-1">
          <span className="font-hand text-[18px] text-pen-navy">Spotify gia đình</span>
          <span className="font-bold">79.000 ₫ / tháng</span>
        </li>
      </ul>
      <p className="mt-10 font-serif text-caption italic text-ink-mute">
        Kept on rotation — settle the books at month&rsquo;s end. ❧
      </p>
    </section>
  );
}

export default function PageFlipSpike() {
  const [page, setPage] = useState<'a' | 'b'>('a');
  const [slowRoute, setSlowRoute] = useState(false);
  const [busy, setBusy] = useState(false);
  const [debug, setDebug] = useState<TurnDebug | null>(null);
  const [leakReport, setLeakReport] = useState<string | null>(null);
  const [captureMs, setCaptureMs] = useState<number | null>(null);
  const readyRef = useRef(true);
  const previewRef = useRef<HTMLDivElement>(null);

  // "Route paint" stand-in: ready once React commits the new fake page
  // (the orchestrator adds its own settle frames), or after 2.5s when
  // simulating a slow route to exercise the mid-turn hold.
  useEffect(() => {
    if (slowRoute) {
      const id = setTimeout(() => {
        readyRef.current = true;
      }, 2500);
      return () => clearTimeout(id);
    }
    readyRef.current = true;
  }, [page, slowRoute]);

  async function turn(direction: TurnDirection) {
    if (busy) return;
    setBusy(true);
    setDebug(null);
    const flip = await import('@/lib/page-flip');
    const next = page === 'a' ? 'b' : 'a';
    readyRef.current = false;
    await flip.turnPage({
      direction,
      captureEl: document.body,
      navigate: () => setPage(next),
      targetPath: `/spikes/page-flip#${next}`,
      isReady: () => readyRef.current,
    });
    setDebug(flip.getLastTurnDebug());
    setBusy(false);
  }

  async function leakCheck() {
    if (busy) return;
    setBusy(true);
    const flip = await import('@/lib/page-flip');
    const counts: string[] = [];
    let current = page;
    for (let i = 0; i < 10; i++) {
      const next = current === 'a' ? 'b' : 'a';
      readyRef.current = true;
      await flip.turnPage({
        direction: i % 2 === 0 ? 'forward' : 'backward',
        captureEl: document.body,
        navigate: () => setPage(next),
        targetPath: `/spikes/page-flip#${next}-${i}`,
        isReady: () => true,
      });
      const d = flip.getLastTurnDebug();
      counts.push(
        `#${i + 1} geom:${d?.rendererInfo.geometries} tex:${d?.rendererInfo.textures} prog:${d?.rendererInfo.programs}`,
      );
      current = next;
    }
    setLeakReport(counts.join('  ·  '));
    setBusy(false);
  }

  async function captureFidelity() {
    if (busy) return;
    setBusy(true);
    const { capturePage } = await import('@/lib/page-flip/capture');
    const result = await capturePage(document.body);
    setCaptureMs(result.durationMs);
    const host = previewRef.current;
    if (host) {
      host.replaceChildren(result.canvas);
      result.canvas.style.cssText =
        'width:100%;height:auto;border:1px solid var(--color-ink);display:block;';
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => turn('forward')} disabled={busy} className="border border-ink px-4 py-1.5 font-typewriter text-[11px] uppercase tracking-[0.15em] disabled:opacity-40">
          Turn forward →
        </button>
        <button type="button" onClick={() => turn('backward')} disabled={busy} className="border border-ink px-4 py-1.5 font-typewriter text-[11px] uppercase tracking-[0.15em] disabled:opacity-40">
          ← Turn backward
        </button>
        <label className="flex items-center gap-2 font-typewriter text-[11px] uppercase tracking-[0.1em]">
          <input
            type="checkbox"
            checked={slowRoute}
            onChange={(e) => setSlowRoute(e.target.checked)}
          />
          Simulate slow route (2.5s hold)
        </label>
        <button type="button" onClick={leakCheck} disabled={busy} className="border border-ink px-4 py-1.5 font-typewriter text-[11px] uppercase tracking-[0.15em] disabled:opacity-40">
          10-flip leak check
        </button>
        <button type="button" onClick={captureFidelity} disabled={busy} className="border border-ink px-4 py-1.5 font-typewriter text-[11px] uppercase tracking-[0.15em] disabled:opacity-40">
          Capture fidelity check
        </button>
      </div>

      <div className="mb-6 min-h-[2.5rem] font-typewriter text-[11px] uppercase tracking-[0.08em] text-ink-mute">
        {debug && (
          <p>
            capture {debug.captureMs.toFixed(0)}ms · turn {debug.turnMs.toFixed(0)}ms
            {debug.heldMs > 0 && ` (held ${debug.heldMs.toFixed(0)}ms)`} · post-turn
            geom:{debug.rendererInfo.geometries} tex:{debug.rendererInfo.textures}{' '}
            prog:{debug.rendererInfo.programs}
          </p>
        )}
        {leakReport && <p className="mt-1">{leakReport}</p>}
        {captureMs !== null && (
          <p className="mt-1">last capture: {captureMs.toFixed(0)}ms — compare preview below against the live page</p>
        )}
      </div>

      {page === 'a' ? <FakeDaybook /> : <FakeStandingOrders />}

      <div className="mt-10">
        <h3 className="mb-2 font-typewriter text-[11px] uppercase tracking-[0.15em] text-ink-mute">
          Capture preview (html-to-image output)
        </h3>
        <div ref={previewRef} />
      </div>
    </div>
  );
}
