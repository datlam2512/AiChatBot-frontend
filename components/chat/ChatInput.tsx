"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

export default function ChatInput({ onSend, sending }: { onSend: (text: string) => void; sending: boolean }) {
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
    <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-neutral-300 bg-white p-2 pl-4 shadow-sm transition focus-within:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-neutral-500">
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
          placeholder="Message..."
          className="max-h-[200px] flex-1 resize-none bg-transparent py-2 text-base outline-none placeholder:text-neutral-400"
        />
        <button
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition disabled:opacity-30 dark:bg-white dark:text-neutral-900"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
        </button>
      </div>
    </div>
  );
}
