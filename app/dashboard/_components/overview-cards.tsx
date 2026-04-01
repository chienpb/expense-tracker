interface OverviewCardsProps {
  count: number;
  dailyAvg: string;
  topCategory: string;
}

export function OverviewCards({ count, dailyAvg, topCategory }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <StatCard label="Transactions" value={String(count)} />
      <StatCard label="Daily Average" value={dailyAvg} tabular />
      <StatCard label="Top Category" value={topCategory} lowercase />
    </div>
  );
}

function StatCard({ label, value, tabular, lowercase }: { label: string; value: string; tabular?: boolean; lowercase?: boolean }) {
  return (
    <div className="rounded-sm border border-border bg-card p-8 shadow-none">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight text-foreground ${tabular ? 'tabular-nums' : ''} ${lowercase ? 'lowercase' : ''}`}>
        {value}
      </p>
    </div>
  );
}
