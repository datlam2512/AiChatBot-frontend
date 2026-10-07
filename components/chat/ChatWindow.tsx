"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/lib/chat-context";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const SUGGESTIONS = ["Explain Python", "What is an API?", "How does an LLM work?", "Explain RAG"];

export default function ChatWindow({ conversationId }: { conversationId?: string }) {
  const { messages, status, sendMessage, retry, loadMessages } = useChat();
  const router = useRouter();

  useEffect(() => {
    if (conversationId) loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  const list = conversationId ? messages[conversationId] ?? [] : [];
  const st = conversationId ? status[conversationId] : undefined;
  const loading = !!st?.loading;

  const handleSend = (text: string) => {
    const id = sendMessage(conversationId ?? null, text);
    if (!conversationId) router.push(`/chat/${id}`);
  };

  return (
    <div className="flex h-full flex-col">
      {list.length === 0 && !loading ? (
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-semibold">How can I help you today?</h2>
          <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => handleSend(s)} className="rounded-2xl border border-neutral-200 px-4 py-3 text-left text-sm transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800">
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <MessageList
          messages={list}
          loading={loading}
          error={st?.error ?? null}
          onRetry={() => conversationId && retry(conversationId)}
        />
      )}
      <ChatInput onSend={handleSend} sending={loading} />
    </div>
  );
}
