import { ToolLoopAgent } from 'ai';
import { openai } from '@ai-sdk/openai';
import { authorize } from '@/lib/auth';
import { makeExecuteSQLTool } from '@/lib/sql-tool';
import { getSupabase } from '@/lib/supabase';

type Range = 'yesterday' | 'last_week' | 'last_month';
type Mode = 'summary' | 'full';

function dateFilter(range: Range): string {
  switch (range) {
    case 'yesterday':
      return `date = CURRENT_DATE - INTERVAL '1 day'`;
    case 'last_week':
      return `date >= CURRENT_DATE - INTERVAL '7 days'`;
    case 'last_month':
      return `date >= CURRENT_DATE - INTERVAL '30 days'`;
  }
}

const summaryAgent = new ToolLoopAgent({
  model: openai('gpt-5.4'),
  tools: {
    executeSQL: makeExecuteSQLTool(['SELECT']),
  },
  instructions: `You are an expense analysis assistant. Use the executeSQL tool to query the expenses table and produce a concise, insightful plain-text summary.

Table: expenses (id UUID, amount INTEGER in VND, description TEXT, category TEXT, subcategory TEXT, type TEXT ('expense' or 'income'), date DATE)

The "type" column distinguishes spending from money received. Include both in your analysis — show total spent, total income, and net spending.

Guidelines:
- Run whatever SELECT queries you need to gather meaningful data
- Aggregate by category, find largest expenses, compare patterns
- Present amounts in readable format (e.g. 25,000đ or 1.5 triệu)
- Write in a friendly, human-readable style — not just raw numbers
- Keep the report under 300 words`,
});

export async function POST(request: Request) {
  if (!authorize(request)) {
    return Response.json({ status: 'failed', error: 'Unauthorized' }, { status: 401 });
  }

  let range: Range, mode: Mode;
  try {
    const body = await request.json();
    range = body.range;
    mode = body.mode;
    if (!['yesterday', 'last_week', 'last_month'].includes(range)) throw new Error('invalid range');
    if (!['summary', 'full'].includes(mode)) throw new Error('invalid mode');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return Response.json({ status: 'failed', error: message }, { status: 400 });
  }

  try {
    if (mode === 'full') {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('expenses')
        .select('date, amount, category, subcategory, description, type')
        .filter('date', 'gte', rangeStartDate(range))
        .order('date', { ascending: false });

      if (error) throw new Error(error.message);

      const rows = (data ?? []) as Array<{
        date: string;
        amount: number;
        category: string;
        subcategory: string | null;
        description: string;
        type: string;
      }>;

      if (rows.length === 0) {
        return Response.json({ status: 'succeeded', report: 'No expenses found for this period.' });
      }

      const totalSpent = rows.filter(r => r.type !== 'income').reduce((s, r) => s + r.amount, 0);
      const totalIncome = rows.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);

      const lines = [
        `Date        Amount        Category          Description`,
        `----------  ------------  ----------------  ---------------------`,
        ...rows.map(r => {
          const prefix = r.type === 'income' ? '+' : ' ';
          return `${r.date}  ${(prefix + formatAmount(r.amount)).padStart(12)}  ${(r.category).padEnd(16)}  ${r.description}`;
        }),
        ``,
        `Spent: ${formatAmount(totalSpent)}  |  Income: ${formatAmount(totalIncome)}  |  Net: ${formatAmount(totalSpent - totalIncome)}  (${rows.length} items)`,
      ];

      return Response.json({ status: 'succeeded', report: lines.join('\n') });
    }

    // summary mode
    const now = new Date().toISOString();
    const result = await summaryAgent.generate({
      prompt: `Current datetime: ${now}\nRange: ${range}\nDate filter SQL: WHERE ${dateFilter(range)}\n\nPlease analyze my expenses for this period and give me an insightful summary.`,
    });

    return Response.json({ status: 'succeeded', report: result.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ status: 'failed', error: message }, { status: 500 });
  }
}

function rangeStartDate(range: Range): string {
  const d = new Date();
  if (range === 'yesterday') d.setDate(d.getDate() - 1);
  else if (range === 'last_week') d.setDate(d.getDate() - 7);
  else if (range === 'last_month') d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

function formatAmount(n: number): string {
  return n.toLocaleString('vi-VN') + 'đ';
}
