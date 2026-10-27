"use client";
import { useParams } from "next/navigation";
import { useChat } from "@/lib/chat-context";
import { useLanguage } from "@/lib/language-context";
import ConversationItem from "./ConversationItem";

const ORDER = [
  "conversation.today",
  "conversation.yesterday",
  "conversation.previous7Days",
  "conversation.older",
] as const;

type GroupKey = (typeof ORDER)[number];

function groupLabel(iso: string): GroupKey {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const day = new Date(iso).setHours(0, 0, 0, 0);
  const diff = Math.round((startOfToday - day) / 86_400_000);
  if (diff <= 0) return "conversation.today";
  if (diff === 1) return "conversation.yesterday";
  return diff <= 7 ? "conversation.previous7Days" : "conversation.older";
}

export default function ConversationList({ onNavigate }: { onNavigate?: () => void }) {
  const { conversations } = useChat();
  const { t } = useLanguage();
  const params = useParams<{ conversationId?: string }>();

  const groups: Partial<Record<GroupKey, typeof conversations>> = {};
  [...conversations]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .forEach((c) => (groups[groupLabel(c.updatedAt)] ??= []).push(c));

  return (
    <>
      {ORDER.filter((l) => groups[l]).map((label) => (
        <section key={label} className="mt-4">
          <h2 className="px-3 pb-1 text-xs font-medium text-neutral-500">{t(label)}</h2>
          <ul className="space-y-0.5">
            {groups[label]?.map((c) => (
              <ConversationItem key={c.id} conversation={c} active={String(c.id) === params.conversationId} onNavigate={onNavigate} />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
