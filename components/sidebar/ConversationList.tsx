"use client";
import { useParams } from "next/navigation";
import { useChat } from "@/lib/chat-context";
import ConversationItem from "./ConversationItem";

const ORDER = ["Today", "Yesterday", "Previous 7 days", "Older"];

function groupLabel(iso: string) {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const day = new Date(iso).setHours(0, 0, 0, 0);
  const diff = Math.round((startOfToday - day) / 86_400_000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return diff <= 7 ? "Previous 7 days" : "Older";
}

export default function ConversationList({ onNavigate }: { onNavigate?: () => void }) {
  const { conversations } = useChat();
  const params = useParams<{ conversationId?: string }>();

  const groups: Record<string, typeof conversations> = {};
  [...conversations]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .forEach((c) => (groups[groupLabel(c.updatedAt)] ??= []).push(c));

  return (
    <>
      {ORDER.filter((l) => groups[l]).map((label) => (
        <section key={label} className="mt-4">
          <h2 className="px-3 pb-1 text-xs font-medium text-neutral-500">{label}</h2>
          <ul className="space-y-0.5">
            {groups[label].map((c) => (
              <ConversationItem key={c.id} conversation={c} active={c.id === params.conversationId} onNavigate={onNavigate} />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
