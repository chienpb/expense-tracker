-- Rubber-Stamp Auditor (spec: work/rubber-stamp-auditor). Per-entry audit
-- verdict + the keeper's one-line margin note, generated once on first
-- month-view and replayed for free thereafter (mirrors wrapped_text). Both
-- nullable: a null verdict = unaudited (the row renders un-stamped). No
-- separate audit table — one keeper, no per-user scoping (DECISION_LOG
-- 2026-06-23).
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS audit_verdict TEXT,
  ADD COLUMN IF NOT EXISTS audit_note TEXT;
