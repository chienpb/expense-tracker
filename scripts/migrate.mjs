// Apply a migration .sql file through Supabase's `execute_sql` RPC, using
// the service-role key already in .env.local — no Supabase UI, no DB
// password. The RPC runs any non-SELECT statement (incl. DDL) as
// SECURITY DEFINER; the app-layer DDL guard lives in lib/sql-tool.ts and
// is intentionally bypassed here (this is the migration channel).
//
//   node --env-file=.env.local scripts/migrate.mjs supabase/migrations/005_sealed_months.sql
//   npm run db:migrate -- supabase/migrations/005_sealed_months.sql
//
// ponytail: one statement per file (the `execute_sql` ELSE branch runs the
// whole string as one command). Split multi-statement migrations into
// separate files, or run them one at a time, if that ever bites.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node --env-file=.env.local scripts/migrate.mjs <path.sql>');
  process.exit(1);
}

const sql = readFileSync(file, 'utf8');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const { data, error } = await supabase.rpc('execute_sql', { query: sql });
if (error) {
  console.error(`✗ ${file}\n  ${error.message}`);
  process.exit(1);
}
console.log(`✓ ${file} — ${JSON.stringify(data)}`);
