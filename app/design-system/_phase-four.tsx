'use client';

import { useState } from 'react';
import { EmptyLine } from '@/app/_components/paper/EmptyLine';
import { EraserMarks } from '@/app/_components/paper/EraserMarks';
import { FieldLine } from '@/app/_components/paper/FieldLine';
import { HandDrawnChart } from '@/app/_components/paper/HandDrawnChart';
import { InkBlot } from '@/app/_components/paper/InkBlot';
import {
  LedgerTable,
  type LedgerRow,
} from '@/app/_components/paper/LedgerTable';
import { MarginNote } from '@/app/_components/paper/MarginNote';
import { PaperClip } from '@/app/_components/paper/PaperClip';
import { PencilNote } from '@/app/_components/paper/PencilNote';
import { RedStringCorrection } from '@/app/_components/paper/RedStringCorrection';
import { Stamp } from '@/app/_components/paper/Stamp';
import { TallyMarks } from '@/app/_components/paper/TallyMarks';
import { VoidedEntry } from '@/app/_components/paper/VoidedEntry';
import { PhaseTitle, Sample, SectionTitle, ThemeFork } from './_parts';

export function PhaseFour() {
  return (
    <>
      <PhaseTitle
        phase="Phase 4 · In progress"
        title="Core paper components — data & state"
        description={
          <>
            Tables, charts, tallies, blots, eraser pulses, and red-string
            corrections. Plus the full §6 state matrix — hover, focus,
            pressed, disabled, loading, empty, error, success, AI-suggested,
            edited, deleted-recently — rendered component-by-component so
            every surface is visible at once.
          </>
        }
      />

      <SectionTitle id="ledger-table" number="§4.3">
        &lt;LedgerTable&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        32px rows locked to the ruled lines. Highlighter sweeps on hover,
        hand-traced focus outline, AI-suggested rows filter through{' '}
        <code className="font-typewriter text-[13px]">#pencil-stroke</code>,
        edits surface via{' '}
        <code className="font-typewriter text-[13px]">{'<RedStringCorrection>'}</code>{' '}
        in the amount cell, and deleted rows fade over 5s with a VOID strike.
      </p>
      <ThemeFork id="ledger-table-showcase">
        <LedgerTableSamples />
      </ThemeFork>

      <SectionTitle id="hand-drawn-chart" number="§4.10">
        &lt;HandDrawnChart&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Bar, line, and area variants — raw SVG pushed through{' '}
        <code className="font-typewriter text-[13px]">#hand-wobble</code> so
        every stroke reads as a pen, not a plot. Dashed annotation ellipses +
        Caveat labels per spec. No grid, a single 1.5px baseline.
      </p>
      <ThemeFork id="hand-drawn-chart-showcase">
        <HandDrawnChartSamples />
      </ThemeFork>

      <SectionTitle id="tally-marks" number="§4.11">
        &lt;TallyMarks&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Hand-drawn IIII-and-slash groups. SVG strokes rather than Caveat text
        — the crossbar is impossible to typeset — but the spec&apos;s intent
        (pen-navy, hand-drawn) holds.
      </p>
      <ThemeFork id="tally-marks-showcase">
        <TallyMarksSamples />
      </ThemeFork>

      <SectionTitle id="ink-blot" number="§4.12 · A3">
        &lt;InkBlot&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Coded{' '}
        <code className="font-typewriter text-[13px]">feTurbulence</code>
        {' '}placeholder for Asset A3. The error-state marker per §6.7; real
        meaning lives in the adjacent margin note.
      </p>
      <ThemeFork id="ink-blot-showcase">
        <InkBlotSamples />
      </ThemeFork>

      <SectionTitle id="eraser-marks" number="§4.13">
        &lt;EraserMarks&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Replaces every spinner per §11. Two variants — inline phrasing and an
        absolute overlay. Pulses at 1s period; flattens when the reader
        prefers reduced motion.
      </p>
      <ThemeFork id="eraser-marks-showcase">
        <EraserMarksSamples />
      </ThemeFork>

      <SectionTitle id="red-string" number="§4.14">
        &lt;RedStringCorrection&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Edit history made visible. The pen stroke is an inline SVG path pushed
        through{' '}
        <code className="font-typewriter text-[13px]">#hand-wobble</code> so
        it reads as a pen slash rather than CSS text-decoration. Toggleable
        via the{' '}
        <code className="font-typewriter text-[13px]">data-show-edit-history</code>{' '}
        setting.
      </p>
      <ThemeFork id="red-string-showcase">
        <RedStringSamples />
      </ThemeFork>

      <SectionTitle id="states" number="§6">
        State matrix
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Every state from §6 rendered in isolation. The same motions also
        apply inside{' '}
        <code className="font-typewriter text-[13px]">{'<LedgerTable>'}</code>{' '}
        above, but here they&apos;re easier to inspect on their own.
      </p>
      <ThemeFork id="states-showcase">
        <StateMatrix />
      </ThemeFork>

      <SectionTitle id="dashboard-prototype" number="§4.3 · §4.10">
        Dashboard prototype
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        A composition of every Phase 4 primitive on a page with tape strips,
        a paper-clipped detail card, and a hand-drawn area chart. Not wired
        to real data — it&apos;s the stand-in Phase 5 will replace with the
        real{' '}
        <code className="font-typewriter text-[13px]">/dashboard</code>.
      </p>
      <ThemeFork id="dashboard-prototype-showcase">
        <DashboardPrototype />
      </ThemeFork>
    </>
  );
}

/* ==============================================================
 * LedgerTable
 * ============================================================ */

const SAMPLE_ROWS: LedgerRow[] = [
  {
    id: 'r-001',
    date: 'Mon, 20 Apr 2026',
    time: '07:12',
    description: 'Phở bò',
    category: 'food',
    amount: 45000,
  },
  {
    id: 'r-002',
    date: 'Mon, 20 Apr 2026',
    time: '09:48',
    description: 'Cà phê sữa đá Cộng Cà Phê',
    category: 'coffee',
    amount: 62000,
  },
  {
    id: 'r-003',
    date: 'Mon, 20 Apr 2026',
    time: '12:30',
    description: 'Bún chả Đắc Kim',
    category: 'food',
    amount: 55000,
    previousAmount: 58000,
  },
  {
    id: 'r-004',
    date: 'Mon, 20 Apr 2026',
    time: '14:05',
    description: 'Hoàn tiền từ Mai',
    category: 'refund',
    amount: -120000,
  },
  {
    id: 'r-005',
    date: 'Mon, 20 Apr 2026',
    time: '18:20',
    description: 'Grab về nhà',
    category: 'transport',
    amount: 38000,
    stamp: { text: 'Recorded', color: 'red' },
  },
];

function LedgerTableSamples() {
  const [active, setActive] = useState<string | undefined>();
  const [rows, setRows] = useState(SAMPLE_ROWS);
  const activeRow = rows.find((r) => r.id === active);

  return (
    <div className="space-y-6">
      <Sample label="Default · full column set · click a row to drill in">
        <div className="relative bg-paper p-4">
          <LedgerTable
            rows={rows}
            activeRowId={active}
            onDrillIn={(r) => setActive((prev) => (prev === r.id ? undefined : r.id))}
            caption="Demo ledger rows"
          />
          {activeRow && (
            <div className="mt-6 paper-slide-in">
              <div className="relative mx-auto max-w-md border border-ink/40 bg-paper-2 p-5">
                <PaperClip corner="tl" />
                <div className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                  Detail · Entry {activeRow.id}
                </div>
                <div className="mt-3 space-y-3">
                  <FieldLine label="Description" value={activeRow.description} />
                  <FieldLine
                    kind="print"
                    label="When"
                    value={`${activeRow.date} · ${activeRow.time ?? '—'}`}
                  />
                  <FieldLine
                    kind="print"
                    label="Category"
                    value={activeRow.category ?? '—'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Sample>

      <Sample label="Loading (§6.5) · eraser-marks skeleton rows">
        <div className="bg-paper p-4">
          <LedgerTable
            rows={[]}
            loading
            skeletonRows={3}
            caption="Loading demo"
          />
        </div>
      </Sample>

      <Sample label="Empty (§6.6)">
        <div className="bg-paper p-4">
          <LedgerTable rows={[]} caption="Empty demo" />
        </div>
      </Sample>

      <Sample label="AI-suggested & deleted-recently statuses">
        <div className="bg-paper p-4">
          <LedgerTable
            rows={[
              {
                id: 'r-ai',
                date: 'Tue, 21 Apr 2026',
                time: '08:10',
                description: 'Breakfast at Cộng (AI)',
                category: 'food',
                amount: 48000,
                status: 'ai-suggested',
              },
              {
                id: 'r-void',
                date: 'Tue, 21 Apr 2026',
                time: '09:02',
                description: 'Duplicate entry',
                category: 'misc',
                amount: 60000,
                status: 'deleted-recently',
                stamp: { text: 'Void', color: 'red' },
              },
              ...SAMPLE_ROWS.slice(0, 2),
            ]}
            caption="State demo"
          />
        </div>
        <button
          type="button"
          onClick={() => setRows([...SAMPLE_ROWS].reverse())}
          className="mt-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute underline"
        >
          (click to shuffle row order — verifies seeded tilt stability)
        </button>
      </Sample>

      <Sample label="No header · compact embed">
        <div className="bg-paper p-4">
          <LedgerTable
            rows={SAMPLE_ROWS.slice(0, 3)}
            hideHeader
            columns={['description', 'category', 'amount']}
            caption="Compact demo"
          />
        </div>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * HandDrawnChart
 * ============================================================ */

const WEEK_DATA = [
  { label: 'Mon', value: 180_000 },
  { label: 'Tue', value: 220_000 },
  { label: 'Wed', value: 95_000 },
  { label: 'Thu', value: 340_000 },
  { label: 'Fri', value: 410_000 },
  { label: 'Sat', value: 625_000 },
  { label: 'Sun', value: 180_000 },
];

function HandDrawnChartSamples() {
  return (
    <div className="space-y-8">
      <Sample label="Bar — daily spend last week">
        <div className="bg-paper p-4">
          <HandDrawnChart data={WEEK_DATA} kind="bar" />
        </div>
      </Sample>

      <Sample label="Line — with annotation">
        <div className="bg-paper p-4">
          <HandDrawnChart
            data={WEEK_DATA}
            kind="line"
            annotations={[{ index: 5, note: 'Cộng + Grab!' }]}
          />
        </div>
      </Sample>

      <Sample label="Area">
        <div className="bg-paper p-4">
          <HandDrawnChart data={WEEK_DATA} kind="area" />
        </div>
      </Sample>

      <Sample label="Empty state">
        <div className="bg-paper p-4">
          <HandDrawnChart data={[]} kind="bar" />
        </div>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * TallyMarks
 * ============================================================ */

function TallyMarksSamples() {
  return (
    <div className="space-y-6">
      <Sample label="Count sweep — 1, 3, 5, 7, 12, 17">
        <div className="flex flex-wrap items-end gap-8 bg-paper p-4">
          {[1, 3, 5, 7, 12, 17].map((n) => (
            <div key={n} className="space-y-1">
              <TallyMarks count={n} />
              <div className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                {n}
              </div>
            </div>
          ))}
        </div>
      </Sample>

      <Sample label="Group size 4 · categories breakdown">
        <div className="bg-paper p-4">
          <TallyMarks count={11} groupSize={4} />
        </div>
      </Sample>

      <Sample label="Color override (stamp-red for overdue)">
        <div className="bg-paper p-4">
          <TallyMarks count={6} color="var(--color-stamp-red)" />
        </div>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * InkBlot
 * ============================================================ */

function InkBlotSamples() {
  return (
    <div className="space-y-6">
      <Sample label="Default navy blot">
        <div className="flex items-center gap-4 bg-paper p-4">
          <InkBlot />
          <InkBlot seed="blot-b" />
          <InkBlot seed="blot-c" size={36} />
        </div>
      </Sample>

      <Sample label="Error marker next to a failed field (§6.7)">
        <div className="relative bg-paper p-4">
          <div className="flex items-baseline gap-3">
            <InkBlot color="var(--color-stamp-red)" seed="error-row" />
            <div className="flex-1 border-b border-stamp-red pb-1 font-hand text-hand text-pen-navy">
              —
            </div>
          </div>
          <MarginNote top={48} side="right" connector>
            phải nhập số
          </MarginNote>
        </div>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * EraserMarks
 * ============================================================ */

function EraserMarksSamples() {
  return (
    <div className="space-y-6">
      <Sample label="Inline — replacing an amount mid-save">
        <div className="bg-paper p-4">
          <div className="flex items-baseline gap-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            Total
            <EraserMarks showLabel labelText="writing…" />
          </div>
        </div>
      </Sample>

      <Sample label="Overlay — covering a busy card">
        <div className="relative h-24 bg-paper p-6">
          <div className="font-hand text-hand text-pen-navy">Entry #0142 · Phở bò</div>
          <EraserMarks variant="overlay" label="Saving entry" />
        </div>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * RedStringCorrection
 * ============================================================ */

function RedStringSamples() {
  return (
    <div className="space-y-5 bg-paper p-4">
      <Sample label="One edit">
        <RedStringCorrection current="55.000 ₫" previous="58.000 ₫" />
      </Sample>

      <Sample label="Chain of edits — old → new">
        <RedStringCorrection
          current="55.000 ₫"
          history={['58.000 ₫', '60.000 ₫']}
        />
      </Sample>

      <Sample label="Inline with handwriting">
        <p className="font-hand text-hand text-pen-navy">
          <RedStringCorrection current="Phở bò" previous="Phở gà" />
          {' '}
          — chợ sáng
        </p>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * State matrix
 * ============================================================ */

function StateMatrix() {
  const [accepted, setAccepted] = useState(false);
  return (
    <div className="space-y-6 bg-paper p-4">
      <Sample label="§6.1 Hover / §6.2 Focus — interactive row">
        <div className="border border-ink/20">
          <table className="w-full border-collapse">
            <tbody>
              <tr
                className="paper-row-interactive border-b border-rule-blue/60"
                tabIndex={0}
                role="button"
              >
                <td className="h-8 px-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                  hover / focus me
                </td>
                <td className="h-8 px-3 text-right font-serif font-bold nums-oldstyle-tabular text-ink">
                  45.000 ₫
                </td>
              </tr>
              <tr
                className="paper-row-interactive border-b border-rule-blue/60"
                tabIndex={0}
                role="button"
              >
                <td className="h-8 px-3 font-hand text-hand text-pen-navy">
                  Cà phê — chi nhánh quận 1
                </td>
                <td className="h-8 px-3 text-right font-serif font-bold nums-oldstyle-tabular text-ink">
                  62.000 ₫
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Sample>

      <Sample label="§6.3 Pressed — paper-pressable utility">
        <button
          type="button"
          className="paper-pressable paper-focusable border border-ink bg-paper px-4 py-2 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink"
        >
          Press me
        </button>
      </Sample>

      <Sample label="§6.4 Disabled — dashed underline, ink-faint">
        <FieldLine label="Closed field" value="Cà phê sữa đá" disabled />
      </Sample>

      <Sample label="§6.5 Loading — EraserMarks">
        <EraserMarks showLabel labelText="recording…" />
      </Sample>

      <Sample label="§6.6 Empty — EmptyLine">
        <EmptyLine />
      </Sample>

      <Sample label="§6.7 Error — InkBlot + stamp-red underline + margin note">
        <div className="relative">
          <div className="flex items-baseline gap-3">
            <InkBlot color="var(--color-stamp-red)" />
            <div className="flex-1 border-b border-stamp-red pb-1 font-hand text-hand text-ink-faint">
              abc
            </div>
          </div>
          <div className="mt-1 font-hand text-hand-s text-stamp-red">
            chưa phải số
          </div>
        </div>
      </Sample>

      <Sample label="§6.8 Success — ✓ stamp (with thump animation)">
        <div className="paper-stamp-thump inline-block">
          <Stamp text="Recorded" subtext="✓ 20 Apr" color="red" />
        </div>
      </Sample>

      <Sample label="§6.9 AI suggestion — PencilNote · click to accept">
        <button
          type="button"
          onClick={() => setAccepted((a) => !a)}
          className="paper-focusable inline-flex items-baseline gap-2"
        >
          <PencilNote accepted={accepted}>Có thể là Phở bò — 45.000₫</PencilNote>
          <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            ({accepted ? 'committed' : 'click to accept'})
          </span>
        </button>
      </Sample>

      <Sample label="§6.10 Edited — RedStringCorrection">
        <RedStringCorrection current="55.000 ₫" previous="58.000 ₫" />
      </Sample>

      <Sample label="§6.11 Deleted-recently — VoidedEntry (5s fade)">
        <VoidedEntry>
          <div className="border border-ink/30 bg-paper-2 p-4">
            <div className="font-hand text-hand text-pen-navy">
              Duplicate · 60.000 ₫
            </div>
          </div>
        </VoidedEntry>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * Dashboard prototype (composition)
 * ============================================================ */

const WEEK_TOTAL = WEEK_DATA.reduce((s, d) => s + d.value, 0);

function DashboardPrototype() {
  return (
    <div className="space-y-6 bg-paper p-2">
      <div className="border border-ink/25">
        <div className="px-6 pt-6 pb-3 border-b-2 border-ink">
          <div className="flex items-baseline gap-4 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            <span>Form CHN-DB</span>
            <span className="ml-auto">Week 16 · Apr 2026</span>
          </div>
          <h3 className="mt-2 font-serif text-title-1 font-bold text-ink">
            This week
          </h3>
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
              Daily outflow
            </div>
            <HandDrawnChart
              data={WEEK_DATA}
              kind="area"
              annotations={[{ index: 5, note: 'Cộng + Grab!' }]}
            />
            <LedgerTable
              rows={SAMPLE_ROWS.slice(0, 3)}
              caption="Today's entries"
            />
          </div>

          <aside className="space-y-5">
            <div>
              <div className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                Week total
              </div>
              <div className="mt-1 font-serif text-title-1 font-bold nums-lining-tabular text-ink">
                {new Intl.NumberFormat('vi-VN').format(WEEK_TOTAL)} ₫
              </div>
            </div>

            <div>
              <div className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                Entries this week
              </div>
              <div className="mt-2">
                <TallyMarks count={17} />
              </div>
            </div>

            <div className="relative border border-ink/30 bg-paper-2 p-4">
              <PaperClip corner="tl" />
              <div className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                Ledger-keeper
              </div>
              <p className="mt-2 font-serif text-body leading-relaxed text-ink">
                Three refunds this week, all from Mai. The Saturday total
                (Cộng + Grab) is 54% above your weekly median.
              </p>
              <div className="mt-3 text-right font-hand-signature text-hand-signature text-pencil-gray">
                — LK
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
