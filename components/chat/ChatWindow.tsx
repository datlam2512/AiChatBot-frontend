"use client";
import { useRouter } from "next/navigation";
import { useChat } from "@/lib/chat-context";
import MessageList from "./MessageList";
import PdfUpload from "@/components/chat/PdfUpload";
import ChatInput from "./ChatInput";
import { useEffect, useState } from "react";
import {
  Code2,
  Compass,
  FileSearch,
  Lightbulb,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const SUGGESTIONS = [
  { text: "chat.suggestion.python", detail: "chat.suggestion.pythonDetail", icon: Code2 },
  { text: "chat.suggestion.api", detail: "chat.suggestion.apiDetail", icon: Compass },
  { text: "chat.suggestion.llm", detail: "chat.suggestion.llmDetail", icon: Lightbulb },
  { text: "chat.suggestion.rag", detail: "chat.suggestion.ragDetail", icon: FileSearch },
] as const;

export default function ChatWindow({
  conversationId,
}: {
  conversationId?: string;
}) {
  const { messages, status, sendMessage, retry, loadMessages } = useChat();
  const { t } = useLanguage();
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

  const loading = st?.loading ?? (numericId !== null && !st?.error);

  const handleSend = async (text: string) => {
    if (creating || loading) return;

    if (conversationId && numericId === null) {
      setSendError(t("chat.invalidConversation"));
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
      setSendError(t("chat.sendFailed"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {list.length === 0 && (loading || creating) ? (
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 text-center"
        >
          <LoaderCircle
            size={28}
            className="animate-spin text-neutral-500 dark:text-neutral-400"
          />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {creating ? t("chat.starting") : t("chat.loading")}
          </p>
        </div>
      ) : list.length === 0 && !st?.error ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            <Sparkles size={22} strokeWidth={1.7} />
          </div>
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("chat.welcome")}
          </h2>
          <p className="mb-8 mt-3 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {t("chat.welcomeDescription")}
          </p>
          <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {SUGGESTIONS.map(({ text, detail, icon: Icon }) => (
              <button
                key={text}
                onClick={() => handleSend(t(text))}
                disabled={creating || loading}
                className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-white dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:bg-neutral-700">
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{t(text)}</span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">{t(detail)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <MessageList
          messages={list}
          loading={loading}
          error={st?.error ?? null}
          onRetry={() => {
            if (numericId === null) return;
            if (list.length === 0) loadMessages(numericId);
            else retry(numericId);
          }}
        />
      )}

      <div className="shrink-0 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 dark:bg-neutral-950 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          {sendError && (
            <p role="alert" className="mb-2 text-center text-sm text-red-600 dark:text-red-400">
              {sendError}
            </p>
          )}
          <ChatInput
            onSend={(text) => {
              void handleSend(text);
            }}
            sending={loading || creating}
            leadingAction={<PdfUpload />}
          />
          <p className="mt-3 text-center text-[11px] text-neutral-400">
            {t("chat.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}
