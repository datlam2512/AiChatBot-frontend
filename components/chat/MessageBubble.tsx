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
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-[1.5rem] bg-neutral-100 px-5 py-3 text-[15px] leading-6 dark:bg-neutral-800">
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
    <div className="flex gap-3 sm:gap-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
        <Sparkles size={15} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <Markdown text={message.content} />
        <button onClick={copy} aria-label={copied ? "Copied response" : "Copy response"} className="mt-3 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200">
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
