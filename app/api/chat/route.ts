import { convertToModelMessages, type ModelMessage, type UIMessage } from 'ai';
import { chatAgent, type ChatUIMessage } from '@/lib/chat-agent';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { messages }: { messages: ChatUIMessage[] } = await request.json();

  const now = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date());

  const modelMessages: ModelMessage[] = [
    { role: 'system', content: `Current datetime (GMT+7): ${now}` },
    ...(await convertToModelMessages(messages as UIMessage[], { tools: chatAgent.tools })),
  ];

  const result = await chatAgent.stream({ messages: modelMessages });

  return result.toUIMessageStreamResponse({ originalMessages: messages });
}
