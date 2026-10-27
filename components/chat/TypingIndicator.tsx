"use client";

import { useLanguage } from "@/lib/language-context";

export default function TypingIndicator() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-1 px-1 py-2" role="status" aria-label={t("chat.typing")}>
      {[0, 150, 300].map((d) => (
        <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  );
}
