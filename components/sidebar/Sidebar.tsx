"use client";
import Link from "next/link";
import { FileText, Plus, Sparkles } from "lucide-react";
import ConversationList from "./ConversationList";

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 pb-2 pt-4 text-sm font-semibold">
        <Sparkles size={18} /> AI Chat
      </div>
      <div className="px-3 py-2">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800">
          <Plus size={16} /> New chat
        </Link>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <ConversationList onNavigate={onNavigate} />
      </nav>
      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        <Link
          href="/documents"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
        >
          <FileText size={16} />
          Quản lý tài liệu
        </Link>
      </div>
    </div>
  );
}
