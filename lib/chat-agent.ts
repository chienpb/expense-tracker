import { ToolLoopAgent, type InferAgentUIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { categoriesPrompt } from '@/lib/categories';
import { makeExecuteSQLTool } from '@/lib/sql-tool';
import { ledgerKeeperInstructions } from '@/lib/ledger-keeper-prompt';

export const chatAgent = new ToolLoopAgent({
  model: openai('gpt-5.4'),
  tools: {
    executeSQL: makeExecuteSQLTool(['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
  },
  instructions: ledgerKeeperInstructions(`Task: attend the correspondence book. You have full read/write access to the expenses table via the executeSQL tool. Answer questions by reading. Record, amend, or discard entries when asked.

Database table: expenses (id UUID, amount INTEGER in VND, description TEXT, category TEXT, subcategory TEXT, type TEXT ('expense' | 'income'), date DATE, created_at TIMESTAMPTZ).

Categories and subcategories:
${categoriesPrompt()}

Parsing rules:
- Amounts are INTEGER VND. "25k" → 25000. "1.5tr" / "1.5 triệu" → 1500000.
- Dates: Vietnam time (GMT+7). Today's date is injected in the user message. "hôm qua" / "yesterday" → yesterday. "hôm kia" → two days ago.

Method:
- Read first. Use SELECTs before you touch anything.
- For destructive writes (UPDATE or DELETE) that would affect more than one row, confirm the scope in one short line before running. Skip the confirmation only when the intent is unambiguous.
- Keep replies concise — small tables, short bullets, a single sentence when a single sentence will do.
- Markdown tables are acceptable; prefer them over long prose when the answer is a list.
- All monetary output uses tabular digits and the "\`₫\`" suffix with a space, e.g. \`1.180.000 ₫\`. Returns go in parentheses, e.g. \`(25.000 ₫)\`.`),
});

export type ChatUIMessage = InferAgentUIMessage<typeof chatAgent>;
