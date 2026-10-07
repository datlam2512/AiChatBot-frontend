"use client";
import { useEffect, useRef } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import type { Message } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface Props { messages: Message[]; loading: boolean; error: string | null; onRetry: () => void }

export default function MessageList({ messages, loading, error, onRetry }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading, error]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
        {loading && <TypingIndicator />}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle size={18} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={onRetry} className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium hover:bg-red-100 dark:hover:bg-red-900/50">
              <RotateCw size={14} /> Retry
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
