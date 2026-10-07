import Link from "next/link";
import type { Conversation } from "@/types/chat";

export default function ConversationItem({ conversation, active, onNavigate }: { conversation: Conversation; active: boolean; onNavigate?: () => void }) {
  return (
    <li>
      <Link
        href={`/chat/${conversation.id}`}
        onClick={onNavigate}
        className={`block truncate rounded-lg px-3 py-2 text-sm transition ${
          active ? "bg-neutral-200 font-medium dark:bg-neutral-800" : "text-neutral-700 hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
        }`}
      >
        {conversation.title}
      </Link>
    </li>
  );
}
