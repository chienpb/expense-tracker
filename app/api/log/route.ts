import { ToolLoopAgent } from 'ai';
import { authorize } from '@/lib/auth';
import { categoriesPrompt } from '@/lib/categories';
import { makeExecuteSQLTool } from '@/lib/sql-tool';

const agent = new ToolLoopAgent({
  model: 'openai/gpt-5.4',
  tools: {
    executeSQL: makeExecuteSQLTool(['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
  },
  instructions: `You are an expense logging assistant. Your job is to parse plain-text expense entries (in Vietnamese or English) and persist them to the database using the executeSQL tool.

Database table: expenses (id UUID, amount INTEGER in VND, description TEXT, category TEXT, subcategory TEXT, date DATE, created_at TIMESTAMPTZ)

Categories and subcategories:
${categoriesPrompt()}

Amount parsing rules:
- "25k" or "25K" → 25000
- "1.5tr" or "1.5 triệu" → 1500000
- "150,000" or "150000" → 150000
- Always store as INTEGER (no decimals)

Date rules:
- Default date is today unless specified
- "hôm qua" / "yesterday" → yesterday's date
- "hôm kia" → 2 days ago
- Specific dates like "3/4" → interpret as day/month of current year
- Current datetime is injected in the user message

Intent detection:
- New expense → INSERT into expenses
- Correction / update → UPDATE the most recent matching expense
- Backdated entry ("forgot to add...") → INSERT with the specified past date
- Delete → DELETE the matching expense

Multiple items: if the input contains multiple expenses (e.g. "bún bò 25k + nước 10k"), insert each as a separate row.

On ambiguity or parse failure: do NOT call the tool. Just respond with "Failed: <short reason>".
On success: respond with "Succeeded".`,
});

export async function POST(request: Request) {
  if (!authorize(request)) {
    return Response.json({ status: 'failed', error: 'Unauthorized' }, { status: 401 });
  }

  let text: string;
  try {
    const body = await request.json();
    text = body.text;
    if (!text) throw new Error('missing text');
  } catch {
    return Response.json({ status: 'failed', error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const now = new Date().toISOString();
    const result = await agent.generate({
      prompt: `Current datetime: ${now}\n\nExpense entry: ${text}`,
    });

    const response = result.text.trim().toLowerCase();
    if (response.startsWith('failed')) {
      return Response.json({ status: 'failed', error: result.text });
    }
    return Response.json({ status: 'succeeded' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ status: 'failed', error: message }, { status: 500 });
  }
}
