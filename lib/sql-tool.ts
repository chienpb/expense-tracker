import { tool } from 'ai';
import { z } from 'zod/v4';
import { getSupabase } from './supabase';

const BLOCKED = /^\s*(CREATE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|COMMENT|RENAME)\b/i;

export function makeExecuteSQLTool(allowedStatements: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[]) {
  const allowPattern = new RegExp(
    `^\\s*(${allowedStatements.join('|')})\\b`,
    'i'
  );

  return tool({
    description: 'Execute a SQL query against the expenses table.',
    inputSchema: z.object({
      sql: z.string().describe('The SQL statement to execute'),
    }),
    execute: async ({ sql }) => {
      if (BLOCKED.test(sql)) {
        return { error: 'DDL statements are not allowed.' };
      }
      if (!allowPattern.test(sql)) {
        return { error: `Only ${allowedStatements.join(', ')} statements are allowed.` };
      }

      const supabase = getSupabase();
      const { data, error } = await supabase.rpc('execute_sql', { query: sql });

      if (error) return { error: error.message };
      return { data };
    },
  });
}
