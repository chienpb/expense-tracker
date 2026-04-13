'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type ToolUIPart } from 'ai';
import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import type { ChatUIMessage } from '@/lib/chat-agent';

type ExecuteSQLUIPart = ToolUIPart<{
  executeSQL: {
    input: { sql: string };
    output: { data?: unknown; error?: string };
  };
}>;

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, stop } = useChat<ChatUIMessage>({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    sendMessage({ text: message.text });
    setInput('');
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Chat
        </p>
        <nav className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </button>
        </nav>
      </header>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-[760px] px-4 py-6 sm:px-6">
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, i) => {
                  const key = `${message.id}-${i}`;
                  if (part.type === 'text') {
                    return <MessageResponse key={key}>{part.text}</MessageResponse>;
                  }
                  if (part.type === 'tool-executeSQL') {
                    const tool = part as ExecuteSQLUIPart;
                    const output = tool.output
                      ? tool.output.error
                        ? `Error: ${tool.output.error}`
                        : formatSQLResult(tool.output.data)
                      : undefined;
                    return (
                      <Tool
                        key={key}
                        defaultOpen={tool.state === 'output-error'}
                      >
                        <ToolHeader type="tool-executeSQL" state={tool.state} />
                        <ToolContent>
                          <ToolInput input={tool.input} />
                          <ToolOutput
                            output={
                              output ? (
                                <pre className="whitespace-pre-wrap font-mono text-xs tabular-nums">
                                  {output}
                                </pre>
                              ) : undefined
                            }
                            errorText={tool.errorText}
                          />
                        </ToolContent>
                      </Tool>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="bg-background">
        <div className="mx-auto w-full max-w-[760px] px-4 py-3 sm:px-6">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                placeholder="Ask or log…"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                {(status === 'submitted' || status === 'streaming') && (
                  <button
                    type="button"
                    onClick={() => stop()}
                    className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  >
                    Stop
                  </button>
                )}
              </PromptInputTools>
              <PromptInputSubmit status={status} disabled={!input.trim()} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

function formatSQLResult(data: unknown): string {
  if (data == null) return '';
  if (Array.isArray(data)) {
    if (data.length === 0) return '(no rows)';
    return JSON.stringify(data, null, 2);
  }
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}
