-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount      INTEGER NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL,
  subcategory TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Generic SQL executor for LLM tool use
-- Returns JSON array for SELECT, row count for DML
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result    jsonb;
  row_count integer;
  stmt_type text;
BEGIN
  stmt_type := upper(trim(regexp_replace(query, '\s+', ' ', 'g')));

  IF stmt_type LIKE 'SELECT%' THEN
    EXECUTE format(
      'SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query
    ) INTO result;
    RETURN COALESCE(result, '[]'::jsonb);
  ELSE
    EXECUTE query;
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RETURN jsonb_build_object('affected_rows', row_count);
  END IF;
END;
$$;
