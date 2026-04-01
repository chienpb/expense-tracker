import { getSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  // Vercel cron sends this header to authenticate
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  // Fetch all active recurring expenses due today or earlier
  const { data: due, error: fetchErr } = await supabase.rpc('execute_sql', {
    query: `SELECT * FROM recurring_expenses WHERE active = true AND next_due <= '${today}'`,
  });

  if (fetchErr) {
    return Response.json({ error: fetchErr.message }, { status: 500 });
  }

  if (!due || due.length === 0) {
    return Response.json({ status: 'ok', logged: 0 });
  }

  let logged = 0;

  for (const row of due) {
    // Insert into expenses
    const { error: insertErr } = await supabase.rpc('execute_sql', {
      query: `INSERT INTO expenses (amount, description, category, subcategory, date) VALUES (${row.amount}, '${row.description.replace(/'/g, "''")}', '${row.category}', ${row.subcategory ? `'${row.subcategory}'` : 'NULL'}, '${today}')`,
    });

    if (insertErr) continue;

    // Advance next_due
    let nextDueExpr: string;
    switch (row.frequency) {
      case 'daily':
        nextDueExpr = `'${today}'::date + INTERVAL '1 day'`;
        break;
      case 'weekly':
        nextDueExpr = `'${today}'::date + INTERVAL '1 week'`;
        break;
      case 'monthly':
        nextDueExpr = `'${today}'::date + INTERVAL '1 month'`;
        break;
      case 'yearly':
        nextDueExpr = `'${today}'::date + INTERVAL '1 year'`;
        break;
      default:
        nextDueExpr = `'${today}'::date + INTERVAL '1 month'`;
    }

    await supabase.rpc('execute_sql', {
      query: `UPDATE recurring_expenses SET next_due = ${nextDueExpr} WHERE id = '${row.id}'`,
    });

    logged++;
  }

  return Response.json({ status: 'ok', logged });
}
