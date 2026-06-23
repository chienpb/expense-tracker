-- Monthly Wrapped (spec: work/monthly-wrapped). The Ledger-keeper's
-- one-line verdict for a sealed month, generated once at seal time and
-- stored here. Nullable: a month sealed before this column existed — or
-- one whose generation failed — reads its slip from the deterministic
-- aggregates alone (spec AC#7). The numbers are never stored; only the prose.
ALTER TABLE sealed_months ADD COLUMN IF NOT EXISTS wrapped_text TEXT;
