import { PaperClip } from '@/app/_components/paper/PaperClip';
import { Typewriter } from '@/app/_components/paper/Typewriter';
import { formatVND } from '@/lib/dashboard/utils';
import { formatSignedVND } from '@/lib/paper-format';
import type { WrappedBundle } from '@/lib/dashboard/wrapped';

/**
 * `<MonthSlip>` — the Monthly Wrapped insert (spec: work/monthly-wrapped).
 *
 * One tilted loose-leaf paper-clipped on top: the Ledger-keeper's penned
 * verdict (Caveat, foregrounded) over the quiet computed aggregates. This is
 * the SINGLE render path — first-seal (`reveal`), re-read (flat), and
 * reduced-motion (flat) all mount this. `reveal` adds the ink-wipe to the
 * verdict; reduced-motion neutralises both the wipe and the tilt via global
 * CSS (`.paper-ink-reveal`, `[data-ledger-tilt]`), so no JS branch here.
 *
 * If `verdict` is null (generation failed/stalled), the slip stands on the
 * aggregates alone, signed `— LK` — a complete statement, never a spinner.
 */
export function MonthSlip({
  bundle,
  verdict,
  label,
  reveal = false,
  className,
}: {
  bundle: WrappedBundle;
  verdict: string | null;
  label: string;
  /** First-seal only: wipe the verdict on as ink. */
  reveal?: boolean;
  className?: string;
}) {
  return (
    <article
      data-ledger-tilt
      style={{ transform: 'rotate(-1.2deg)' }}
      className={`relative w-full max-w-[30rem] border border-ink/30 bg-paper-2 px-8 py-7 ${className ?? ''}`}
    >
      <PaperClip corner="tr" />

      <p className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
        The books, settled — {label}
      </p>

      {/* The verdict — handwritten, foregrounded. Null → the aggregates carry
          the statement and the slip is signed below instead. */}
      {verdict ? (
        <Typewriter
          text={verdict}
          animate={reveal}
          className="mt-4 whitespace-pre-line font-hand-signature text-hand-signature leading-snug text-pen-navy"
        />
      ) : null}

      {/* Quiet aggregates. Computed values → serif/ink (§2.1); labels →
          typewriter (§2.2). Returns in parentheses (§4.3). */}
      <dl className="mt-6 flex flex-col gap-2 border-t border-ink/15 pt-4 font-serif text-ink [font-variant-numeric:tabular-nums_oldstyle-nums]">
        <Figure label="Spent" value={formatVND(bundle.totalSpent)} />
        <Figure label="Returned" value={`(${formatVND(bundle.totalIncome)})`} />
        <Figure label="Net" value={formatSignedVND(bundle.net)} strong />
      </dl>

      {bundle.largest && (
        <p className="mt-4 font-serif text-[13px] italic text-ink-mute">
          Largest entry: {bundle.largest.description} ({bundle.largest.category}) —{' '}
          <span className="not-italic">{formatVND(bundle.largest.amount)}</span>
        </p>
      )}

      {bundle.byCategory.length > 0 && (
        <p className="mt-1 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-faint">
          {bundle.byCategory
            .slice(0, 4)
            .map((c) => `${c.category} ${formatVND(c.amount)}`)
            .join('  ·  ')}
        </p>
      )}

      {/* Signature only when the AI line is absent — otherwise the verdict
          already closes with `— LK`. */}
      {!verdict && (
        <p className="mt-4 text-right font-hand-signature text-hand-signature text-pencil-gray">
          — LK
        </p>
      )}
    </article>
  );
}

function Figure({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
        {label}
      </dt>
      <dd className={strong ? 'text-[18px] font-semibold' : 'text-[15px]'}>{value}</dd>
    </div>
  );
}
