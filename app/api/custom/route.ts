import { ToolLoopAgent } from 'ai';
import { openai } from '@ai-sdk/openai';
import { makeExecuteSQLTool } from '@/lib/sql-tool';
import { ledgerKeeperInstructions } from '@/lib/ledger-keeper-prompt';

const agent = new ToolLoopAgent({
  model: openai('gpt-5.4'),
  tools: {
    executeSQL: makeExecuteSQLTool(['SELECT']),
  },
  instructions: ledgerKeeperInstructions(`Task: answer a freeform question about the books. Pull whatever you need from the expenses table with SELECT queries.

Table: expenses (id UUID, amount INTEGER in VND, description TEXT, category TEXT, subcategory TEXT, type TEXT ('expense' or 'income'), date DATE, created_at TIMESTAMPTZ).

\`type = 'expense'\` is money going out. \`type = 'income'\` is money coming back — paybacks, refunds, settled dinners. Consider both when the question concerns net outlay.

Method:
- You may run multiple SELECTs to build the answer.
- Interpret the data — a figure by itself is not an answer. Note the category, the cadence, the outlier if there is one.
- Present amounts as \`1.180.000 ₫\`. Returns go in parentheses, \`(25.000 ₫)\`.
- If the books do not support an answer, say so plainly.
- Close with \`— LK\` on its own line.`),
});

export async function POST(request: Request) {
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
      prompt: `Current datetime: ${now}\n\nQuestion: ${text}`,
    });

    return Response.json({ status: 'succeeded', result: result.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ status: 'failed', error: message }, { status: 500 });
  }
}
