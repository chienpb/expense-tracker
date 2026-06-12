'use client';

import { useState } from 'react';
import { CarbonSlip } from '@/app/_components/paper/CarbonSlip';
import { CoffeeRing } from '@/app/_components/paper/CoffeeRing';
import { FieldLine } from '@/app/_components/paper/FieldLine';
import { FileTab } from '@/app/_components/paper/FileTab';
import { FoldCrease } from '@/app/_components/paper/FoldCrease';
import { MarginNote } from '@/app/_components/paper/MarginNote';
import { Page } from '@/app/_components/paper/Page';
import { PaperClip } from '@/app/_components/paper/PaperClip';
import { Stamp } from '@/app/_components/paper/Stamp';
import { TapeStrip } from '@/app/_components/paper/TapeStrip';
import { TornCorner } from '@/app/_components/paper/TornCorner';
import { PhaseTitle, Sample, SectionTitle, ThemeFork } from './_parts';

export function PhaseThree() {
  return (
    <>
      <PhaseTitle
        phase="Phase 3 · In progress"
        title="Core paper components — structural"
        description={
          <>
            Everything needed to compose a page that&apos;s recognizably Paper
            Ledger. Each component ships with its full state matrix (default,
            hover, focus, disabled, empty — where applicable) rendered on both
            themes so a regression anywhere is visible in a single scroll.
          </>
        }
      />

      <SectionTitle id="page" number="§4.1">
        &lt;Page&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Root paper surface. Stacks{' '}
        <code className="font-typewriter text-[13px]">{'<PaperGrain>'}</code>,{' '}
        <code className="font-typewriter text-[13px]">{'<RuledLines>'}</code>,
        and{' '}
        <code className="font-typewriter text-[13px]">{'<MarginRule>'}</code>{' '}
        under header / body / footer. Tape strips opt-in; hidden below 640px
        per §3.4.
      </p>
      <ThemeFork id="page-showcase">
        <PageSamples />
      </ThemeFork>

      <SectionTitle id="filetab" number="§4.9">
        &lt;FileTab&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Manila-folder navigation. Active tab blends into the page surface;
        inactive tabs sit behind in{' '}
        <code className="font-typewriter text-[13px]">paper-2</code>. Keyboard
        focus traces a 2px pen-navy outline (§6.2 fallback).
      </p>
      <ThemeFork id="filetab-showcase">
        <FileTabSamples />
      </ThemeFork>

      <SectionTitle id="fieldline" number="§4.2">
        &lt;FieldLine&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Label + slot + 1px ink underline. Three kinds (printed, handwritten,
        stamped) plus disabled and empty states. Handwritten values tilt via{' '}
        <code className="font-typewriter text-[13px]">tiltFor</code>; the same
        label always leans the same way.
      </p>
      <ThemeFork id="fieldline-showcase">
        <FieldLineSamples />
      </ThemeFork>

      <SectionTitle id="stamp" number="§4.4">
        &lt;Stamp&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Archivo Black inside a 2px border, rotated 4–8°,{' '}
        <code className="font-typewriter text-[13px]">url(#stamp-wear)</code>{' '}
        applied. Three colors (red / navy / gold); the `wear` knob dims toward
        an emptier ink pad.
      </p>
      <ThemeFork id="stamp-showcase">
        <StampSamples />
      </ThemeFork>

      <SectionTitle id="tape" number="§4.5 · A5">
        &lt;TapeStrip&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Hand-drawn masking tape in three seeded variants — torn ends,
        crease lines, edge ridges — on the{' '}
        <code className="font-typewriter text-[13px]">highlighter</code>{' '}
        token. Same seed, same tape; the API holds.
      </p>
      <ThemeFork id="tape-showcase">
        <TapeStripSamples />
      </ThemeFork>

      <SectionTitle id="margin-note" number="§4.6">
        &lt;MarginNote&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Patrick Hand by default (Caveat under 24px is forbidden by §2.3 and
        unsafe for Vietnamese). Signature variant available for English-only
        flourishes at 24px+.
      </p>
      <ThemeFork id="margin-note-showcase">
        <MarginNoteSamples />
      </ThemeFork>

      <SectionTitle id="carbon-slip" number="§4.8">
        &lt;CarbonSlip&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Pink-tinted paper bordered in stamp-red, slightly rotated. Perfect
        host for Quick Add forms built from{' '}
        <code className="font-typewriter text-[13px]">{'<FieldLine>'}</code>.
      </p>
      <ThemeFork id="carbon-slip-showcase">
        <CarbonSlipSamples />
      </ThemeFork>

      <SectionTitle id="attachments" number="§4.7 · A4/A6/A7">
        &lt;PaperClip&gt; · &lt;TornCorner&gt; · &lt;FoldCrease&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Assets A6, A7, A4 in their hand-drawn form — a wire gem clip wound
        as one stroke, a fiber-torn corner, a softly bowed fold. Every
        corner supported; redraws swap only the SVG paths.
      </p>
      <ThemeFork id="attachments-showcase">
        <AttachmentSamples />
      </ThemeFork>

      <SectionTitle id="coffee-ring" number="§1 · A2">
        &lt;CoffeeRing&gt;
      </SectionTitle>
      <p className="max-w-prose text-body-l leading-relaxed text-ink">
        Asset A2 — a cup once sat here. Two
        overlapping imperfect rim strokes (with lift-gaps) over a faint
        inner wash, all in the{' '}
        <code className="font-typewriter text-[13px]">coffee-stain</code>{' '}
        token at ~12% opacity. Decorative only; never for data.
      </p>
      <ThemeFork id="coffee-ring-showcase">
        <CoffeeRingSamples />
      </ThemeFork>
    </>
  );
}

/* ==============================================================
 * Page
 * ============================================================ */

function PageSamples() {
  return (
    <div className="space-y-8">
      <Sample label="Default — formCode, title, pageNumber">
        <div className="h-80 border border-ink/20">
          <Page formCode="CHN-01" pageNumber="1/12" title="Daily Ledger">
            <div className="space-y-3">
              <div className="font-serif text-body text-ink">
                <span className="font-typewriter uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                  Opened{' '}
                </span>
                Mon, 20 Apr 2026 · 07:12
              </div>
              <div className="font-hand text-hand text-pen-navy">
                Phở bò — 45.000₫
              </div>
            </div>
          </Page>
        </div>
      </Sample>

      <Sample label="With tape strips (primary page)">
        <div className="h-80 border border-ink/20">
          <Page
            formCode="CHN-DB"
            pageNumber="1/1"
            title="Dashboard"
            tape
            headerMeta="Apr 2026"
          >
            <div className="font-serif text-body text-ink">
              Tape strips render at top corners, hidden below 640px per §3.4.
            </div>
          </Page>
        </div>
      </Sample>

      <Sample label="Custom footer slot">
        <div className="h-64 border border-ink/20">
          <Page
            formCode="CHN-03"
            pageNumber="3"
            title="Monthly summary"
            footer={
              <>
                <span>Settled 30 Apr 2026</span>
                <span className="ml-auto font-serif italic text-caption">
                  (by clerk)
                </span>
              </>
            }
          >
            <div className="font-serif text-body text-ink">
              Footer accepts any printed content — typewriter, serif, or a
              composed stamp.
            </div>
          </Page>
        </div>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * FileTab
 * ============================================================ */

function FileTabSamples() {
  const [activeId, setActiveId] = useState('ledger');
  const tabs = [
    { id: 'ledger', label: 'Ledger' },
    { id: 'recurring', label: 'Recurring' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="space-y-6">
      <Sample label="Default · click to change active">
        <FileTab
          tabs={tabs}
          activeId={activeId}
          onChange={setActiveId}
          aria-label="Design-system demo tabs"
        />
        <div className="border border-t-0 border-ink/40 p-5 font-serif text-body text-ink">
          Active tab:{' '}
          <span className="font-typewriter uppercase tracking-[var(--letter-spacing-label-s)]">
            {activeId}
          </span>
        </div>
      </Sample>

      <Sample label="Long labels · Vietnamese">
        <FileTab
          aria-label="Long-label tabs"
          activeId="chi-phi"
          tabs={[
            { id: 'chi-phi', label: 'Chi phí hàng ngày' },
            { id: 'dinh-ky', label: 'Định kỳ' },
            { id: 'tong-ket', label: 'Tổng kết tháng' },
          ]}
        />
      </Sample>
    </div>
  );
}

/* ==============================================================
 * FieldLine
 * ============================================================ */

function FieldLineSamples() {
  return (
    <div className="space-y-5">
      <Sample label="kind='hand' · default & empty">
        <FieldLine label="Item" value="Phở bò" />
        <div className="mt-4">
          <FieldLine label="Companion" />
        </div>
      </Sample>

      <Sample label="kind='print' · system-authored">
        <FieldLine
          kind="print"
          label="Recorded at"
          value="Mon, 20 Apr 2026 · 07:14"
        />
      </Sample>

      <Sample label="kind='stamped' · with RECORDED">
        <FieldLine
          kind="stamped"
          label="Status"
          value="Entry #0142"
          stamp={{ text: 'Recorded', color: 'red' }}
        />
      </Sample>

      <Sample label="Disabled · dashed underline, ink-faint">
        <FieldLine label="Closed field" value="Cà phê sữa đá" disabled />
      </Sample>

      <Sample label="Vietnamese torture string">
        <FieldLine
          label="Merchant"
          value="Cà phê sữa đá Cộng Cà Phê — chi nhánh quận 1"
        />
      </Sample>
    </div>
  );
}

/* ==============================================================
 * Stamp
 * ============================================================ */

function StampSamples() {
  return (
    <div className="space-y-6">
      <Sample label="Colors — red / navy / gold">
        <div className="flex flex-wrap items-center gap-6">
          <Stamp text="Recorded" color="red" />
          <Stamp text="Draft" color="navy" />
          <Stamp text="Settled" color="gold" id="settled-stamp" />
        </div>
      </Sample>

      <Sample label="With subtext">
        <div className="flex flex-wrap items-center gap-6">
          <Stamp text="Paid" subtext="30 Apr 2026" color="red" />
          <Stamp text="Void" subtext="—" color="red" id="void-stamp" />
        </div>
      </Sample>

      <Sample label="Wear — 0 · 0.3 · 0.6 · 0.9">
        <div className="flex flex-wrap items-center gap-6">
          <Stamp text="Fresh" wear={0} id="wear-0" />
          <Stamp text="Light" wear={0.3} id="wear-03" />
          <Stamp text="Worn" wear={0.6} id="wear-06" />
          <Stamp text="Spent" wear={0.9} id="wear-09" />
        </div>
      </Sample>

      <Sample label="plain — a11y / CI debug view">
        <Stamp text="Recorded" plain />
      </Sample>
    </div>
  );
}

/* ==============================================================
 * TapeStrip
 * ============================================================ */

function TapeStripSamples() {
  return (
    <div className="space-y-8">
      <Sample label="On a simulated page corner">
        <div className="relative h-32 w-full overflow-hidden bg-paper-2">
          <TapeStrip top={-8} left={24} rotation={-3} />
          <TapeStrip top={-8} right={24} rotation={2} />
          <div className="pt-8 px-6 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            Paper taped to the desk.
          </div>
        </div>
      </Sample>

      <Sample label="Rotation sweep">
        <div className="relative flex h-24 items-center justify-around bg-paper-2">
          {[-8, -3, 0, 3, 8].map((angle) => (
            <div key={angle} className="relative h-16 w-24">
              <TapeStrip top="50%" left="50%" rotation={angle} />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 font-typewriter text-[9px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                {angle}°
              </span>
            </div>
          ))}
        </div>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * MarginNote
 * ============================================================ */

function MarginNoteSamples() {
  return (
    <div className="space-y-8">
      <Sample label="Left side · with connector">
        <div
          className="relative min-h-24 bg-paper"
          style={{
            paddingLeft: 'calc(var(--margin-rule-offset-mobile) + 24px)',
          }}
        >
          <MarginNote top={6} connector>
            sửa lại mai
          </MarginNote>
          <div className="py-2 font-serif text-body text-ink">
            Cà phê sữa đá — <span className="font-hand text-pen-navy">62.000₫</span>
          </div>
        </div>
      </Sample>

      <Sample label="Right side · pulled outside body">
        <div className="relative min-h-24 bg-paper pr-24">
          <div className="py-2 font-serif text-body text-ink">
            Bún chả Đắc Kim — <span className="font-hand text-pen-navy">55.000₫</span>
          </div>
          <MarginNote side="right" top={6} connector>
            ngon!
          </MarginNote>
        </div>
      </Sample>

      <Sample label="Inline (flows with text)">
        <p className="font-serif text-body text-ink">
          The ledger-keeper drew a{' '}
          <MarginNote inline>small pencil check</MarginNote> in the margin.
        </p>
      </Sample>

      <Sample label="Signature variant (Caveat 24px+, English only)">
        <div className="flex justify-end pr-6">
          <MarginNote hand="signature" inline>
            — LK
          </MarginNote>
        </div>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * CarbonSlip
 * ============================================================ */

function CarbonSlipSamples() {
  return (
    <div className="space-y-8">
      <Sample label="Bare slip">
        <div className="bg-paper p-6">
          <CarbonSlip>
            <div className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
              Quick Add · CHN-A
            </div>
            <div className="mt-2 font-hand text-hand text-pen-navy">
              Trà đá — 10.000₫
            </div>
          </CarbonSlip>
        </div>
      </Sample>

      <Sample label="With FieldLines inside">
        <div className="bg-paper p-8">
          <CarbonSlip id="quick-add-form">
            <div className="space-y-4">
              <FieldLine label="Item" value="Phở bò" />
              <FieldLine
                kind="print"
                label="Amount"
                value="45.000 ₫"
              />
            </div>
          </CarbonSlip>
        </div>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * Attachments — PaperClip / TornCorner / FoldCrease
 * ============================================================ */

function AttachmentSamples() {
  return (
    <div className="space-y-8">
      <Sample label="PaperClip · all four corners">
        <div className="grid grid-cols-2 gap-4">
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <div
              key={corner}
              className="relative h-28 border border-ink/25 bg-paper p-4"
            >
              <PaperClip corner={corner} />
              <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                {corner}
              </span>
            </div>
          ))}
        </div>
      </Sample>

      <Sample label="TornCorner · all four corners">
        <div className="grid grid-cols-2 gap-4">
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <div
              key={corner}
              className="relative h-28 overflow-hidden border border-ink/25 bg-paper p-4"
            >
              <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                {corner}
              </span>
              <div className="mt-1 font-serif text-caption italic text-ink-mute">
                archived
              </div>
              <TornCorner corner={corner} />
            </div>
          ))}
        </div>
      </Sample>

      <Sample label="FoldCrease · all four corners">
        <div className="grid grid-cols-2 gap-4">
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <div
              key={corner}
              className="relative h-28 overflow-hidden border border-ink/25 bg-paper p-4"
            >
              <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
                {corner}
              </span>
              <div className="mt-1 font-serif text-caption italic text-ink-mute">
                folded
              </div>
              <FoldCrease corner={corner} size={80} />
            </div>
          ))}
        </div>
      </Sample>

      <Sample label="Composed — clip + fold on a single slip">
        <div className="bg-paper p-10">
          <div className="relative mx-auto h-48 w-72 border border-ink/30 bg-paper-2 p-4">
            <PaperClip corner="tl" />
            <FoldCrease corner="br" size={72} />
            <div className="mt-6 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
              Receipt · 20 Apr
            </div>
            <div className="mt-2 font-hand text-hand text-pen-navy">
              Cà phê — 38.000₫
            </div>
          </div>
        </div>
      </Sample>
    </div>
  );
}

/* ==============================================================
 * CoffeeRing
 * ============================================================ */

function CoffeeRingSamples() {
  return (
    <div className="space-y-8">
      <Sample label="On a page corner — default size & opacity, seeded turn">
        <div className="relative h-64 overflow-hidden border border-ink/25 bg-paper p-6">
          <CoffeeRing top={-30} right={-26} seed="coffee-ring-showcase" />
          <div className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
            Monthly summary · Apr 2026
          </div>
          <div className="mt-2 max-w-prose font-serif text-body text-ink">
            The stain sits behind the printed layer and under the reader&apos;s
            notice — decorative only, never for data.
          </div>
        </div>
      </Sample>
    </div>
  );
}
