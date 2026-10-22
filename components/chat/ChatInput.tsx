"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export default function ChatInput({
  onSend,
  sending,
  leadingAction,
}: {
  onSend: (text: string) => void;
  sending: boolean;
  leadingAction?: ReactNode;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !sending;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="w-full">
      <div className="rounded-[1.75rem] border border-neutral-300 bg-white px-3 pb-2 pt-3 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.24)] transition focus-within:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-neutral-500">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Message AI Chat"
          aria-label="Message"
          className="block max-h-[200px] w-full resize-none bg-transparent px-2 py-1 text-[15px] leading-6 outline-none placeholder:text-neutral-400"
        />
        <div className="mt-1 flex items-center justify-between">
          {leadingAction}
          <button
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
