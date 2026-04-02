-- Add type column to distinguish expenses from income
ALTER TABLE expenses ADD COLUMN type TEXT NOT NULL DEFAULT 'expense';
ALTER TABLE expenses ADD CONSTRAINT expenses_type_check CHECK (type IN ('expense', 'income'));
