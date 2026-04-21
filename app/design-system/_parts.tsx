/**
 * Shared primitives for the `/design-system` visual regression deck.
 *
 * Each phase-N module composes its own showcase out of these. Keep
 * them presentational and framework-agnostic — no data fetching, no
 * per-component knowledge. When a new surface is needed (e.g. a wide
 * two-column sample), add it here rather than inlining per-phase.
 */

export function SectionTitle({
  number,
  id,
  children,
}: {
  number?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      id={id}
      className="mt-10 mb-3 flex items-baseline gap-3 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute"
    >
      {number && <span className="text-ink">{number}</span>}
      <span>{children}</span>
    </h3>
  );
}

export function ThemeFork({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="mt-4 grid gap-4 md:grid-cols-2">
      <ThemePanel theme="day" label="Day — Daybook">
        {children}
      </ThemePanel>
      <ThemePanel theme="night" label="Night — Midnight Ledger">
        {children}
      </ThemePanel>
    </div>
  );
}

export function ThemePanel({
  theme,
  label,
  children,
}: {
  theme: 'day' | 'night';
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div data-theme={theme} className="bg-paper text-ink">
      <div className="border-b border-ink/20 px-4 py-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
        {label}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function SampleLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-ink-mute">
      {children}
    </div>
  );
}

export function Sample({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <SampleLabel>{label}</SampleLabel>
      {children}
    </div>
  );
}

export function PhaseTitle({
  phase,
  title,
  description,
}: {
  phase: string;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <section className="mt-16 first:mt-0">
      <div className="flex items-baseline gap-4 border-b-2 border-ink pb-2">
        <span className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-ink-mute">
          {phase}
        </span>
        <h2 className="font-serif text-title-1 font-bold text-ink">{title}</h2>
      </div>
      <p className="mt-3 max-w-prose text-body-l leading-relaxed text-ink">
        {description}
      </p>
    </section>
  );
}
