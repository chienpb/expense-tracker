-- Enable Row-Level Security on project tables
-- The app uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS,
-- so this blocks public/anon access without affecting the app.
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Revoke public access to execute_sql function
REVOKE EXECUTE ON FUNCTION execute_sql(text) FROM public;
REVOKE EXECUTE ON FUNCTION execute_sql(text) FROM anon;
REVOKE EXECUTE ON FUNCTION execute_sql(text) FROM authenticated;
