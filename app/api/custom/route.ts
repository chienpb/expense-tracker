import { ToolLoopAgent } from 'ai';
import { authorize } from '@/lib/auth';
import { makeExecuteSQLTool } from '@/lib/sql-tool';

const agent = new ToolLoopAgent({
  model: 'openai/gpt-5.4',
  tools: {
    executeSQL: makeExecuteSQLTool(['SELECT']),
  },
  instructions: `You are a personal expense analyst. Answer the user's freeform question about their expenses by querying the database.

Table: expenses (id UUID, amount INTEGER in VND, description TEXT, category TEXT, subcategory TEXT, date DATE, created_at TIMESTAMPTZ)

Guidelines:
- Use SELECT queries to retrieve the data you need
- You may run multiple queries to build a complete answer
- Present amounts in readable format (e.g. 25,000đ or 1.5 triệu)
- Be concise and insightful — interpret the data, don't just dump it
- If the question is unanswerable from the data, say so clearly`,
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
      prompt: `Current datetime: ${now}\n\nQuestion: ${text}`,
    });

    return Response.json({ status: 'succeeded', result: result.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ status: 'failed', error: message }, { status: 500 });
  }
}
