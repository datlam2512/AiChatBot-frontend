"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, Trash2, X } from "lucide-react";
import { useChat } from "@/lib/chat-context";
import { useLanguage } from "@/lib/language-context";
import type { Conversation } from "@/types/chat";

export default function ConversationItem({ conversation, active, onNavigate }: { conversation: Conversation; active: boolean; onNavigate?: () => void }) {
  const { deleteConversation, status } = useChat();
  const { t } = useLanguage();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = Boolean(status[String(conversation.id)]?.loading);

  const handleDelete = async () => {
    if (deleting || busy) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteConversation(conversation.id);
      if (active) router.push("/chat");
      onNavigate?.();
      setConfirmOpen(false);
    } catch (deleteError) {
      console.error(t("conversation.deleteErrorLog"), deleteError);
      setError(t("conversation.deleteFailed"));
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li className="group">
      <div className="flex items-center gap-1">
        <Link
          href={`/chat/${conversation.id}`}
          onClick={onNavigate}
          className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-sm transition ${
            active ? "bg-neutral-200 font-medium dark:bg-neutral-800" : "text-neutral-700 hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
          }`}
        >
          {conversation.title}
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={deleting || busy}
          aria-label={`${t("conversation.delete")}: ${conversation.title}`}
          title={busy ? t("conversation.waitUntilDone") : t("conversation.delete")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 opacity-100 transition hover:bg-red-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 disabled:cursor-wait disabled:opacity-60 dark:hover:bg-red-950/50 dark:hover:text-red-400"
        >
          {deleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setConfirmOpen(false);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${conversation.id}`}
            aria-describedby={`delete-description-${conversation.id}`}
            className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <Trash2 size={19} />
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                aria-label={t("conversation.closeConfirmation")}
                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>
            <h2
              id={`delete-title-${conversation.id}`}
              className="mt-4 text-lg font-semibold"
            >
              {t("conversation.deleteTitle")}
            </h2>
            <p
              id={`delete-description-${conversation.id}`}
              className="mt-2 break-words text-sm leading-6 text-neutral-500 dark:text-neutral-400"
            >
              {t("conversation.deleteDescription", { title: conversation.title })}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                {t("conversation.cancel")}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting || busy}
                className="inline-flex min-w-24 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && <LoaderCircle size={16} className="animate-spin" />}
                {deleting
                  ? t("conversation.deleting")
                  : t("conversation.deleteButton")}
              </button>
            </div>
          </section>
        </div>
      )}
      {error && (
        <p role="alert" className="px-3 pb-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </li>
  );
}
