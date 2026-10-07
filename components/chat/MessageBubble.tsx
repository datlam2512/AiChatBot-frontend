"use client";
import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import type { Message } from "@/types/chat";
import Markdown from "./Markdown";

export default function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl bg-neutral-100 px-4 py-2.5 text-[15px] dark:bg-neutral-800">
          {message.content}
        </div>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700">
        <Sparkles size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <Markdown text={message.content} />
        <button onClick={copy} className="mt-2 flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
