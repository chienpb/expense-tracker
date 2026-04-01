-- Recurring expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount      INTEGER NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL,
  subcategory TEXT,
  frequency   TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_due    DATE NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);
