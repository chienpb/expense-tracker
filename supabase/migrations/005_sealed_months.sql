-- Sealed months — the "Closing the Books" ceremony persists a per-user
-- closed flag per calendar month. Sealing is a snapshot, NOT an edit-lock:
-- the Shortcuts endpoint keeps writing. A later entry in a sealed month
-- makes it render stale/reopened, detected at read time by comparing entry
-- timestamps against `sealed_at` (no triggers — see docs/DECISION_LOG.md
-- 2026-06-22). Re-settling re-seals (upsert bumps `sealed_at`).
CREATE TABLE sealed_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month DATE NOT NULL,            -- first-of-month key, e.g. 2026-06-01
  sealed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);
