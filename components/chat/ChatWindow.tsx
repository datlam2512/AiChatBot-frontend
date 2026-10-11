"use client";
import { useRouter } from "next/navigation";
import { useChat } from "@/lib/chat-context";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useEffect, useState } from "react";
const SUGGESTIONS = [
  "Explain Python",
  "What is an API?",
  "How does an LLM work?",
  "Explain RAG",
];

export default function ChatWindow({
  conversationId,
}: {
  conversationId?: string;
}) {
  const { messages, status, sendMessage, retry, loadMessages } = useChat();
  const router = useRouter();
  const parsedId = conversationId ? Number(conversationId) : null;

  const numericId =
    parsedId !== null && Number.isSafeInteger(parsedId) && parsedId > 0
      ? parsedId
      : null;

  const [creating, setCreating] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  useEffect(() => {
    if (numericId !== null) {
      loadMessages(numericId);
    }
  }, [numericId, loadMessages]);
  const key = numericId !== null ? String(numericId) : null;

  const list = key !== null ? (messages[key] ?? []) : [];
  const st = key !== null ? status[key] : undefined;

  const loading = !!st?.loading;

  const handleSend = async (text: string) => {
    if (creating || loading) return;

    if (conversationId && numericId === null) {
      setSendError("Invalid conversation ID");
      return;
    }

    setCreating(true);
    setSendError(null);

    try {
      const id = await sendMessage(numericId, text);

      if (!conversationId) {
        router.push(`/chat/${id}`);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setSendError("Failed to create conversation. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {list.length === 0 && !loading ? (
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            How can I help you today?
          </h2>
          <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="rounded-2xl border border-neutral-200 px-4 py-3 text-left text-sm transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
              >
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
          onRetry={() => {}}
        />
      )}
      <ChatInput
        onSend={(text) => {
          void handleSend(text);
        }}
        sending={loading || creating}
      />
    </div>
  );
}
