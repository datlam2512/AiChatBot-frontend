"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={`inline-flex items-center gap-1 rounded-xl border border-neutral-200/80 bg-white/90 p-1 shadow-sm shadow-neutral-900/5 dark:border-neutral-700/80 dark:bg-neutral-900/90 dark:shadow-black/10 ${
        compact ? "shrink-0" : "gap-1.5 rounded-2xl p-1.5"
      }`}
    >
      <span
        className={`flex items-center justify-center text-neutral-500 dark:text-neutral-400 ${
          compact ? "h-7 w-7" : "h-8 w-8 rounded-xl"
        }`}
      >
        <Languages size={compact ? 15 : 16} aria-hidden="true" />
      </span>
      <span
        className={`h-5 w-px bg-neutral-200 dark:bg-neutral-700 ${
          compact ? "mr-0.5" : "mr-1"
        }`}
      />
      <button
        type="button"
        aria-label={t("language.english")}
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
        className={`rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${
          compact ? "min-w-9 px-2.5 py-1.5" : "min-w-12 rounded-xl px-3 py-2"
        } ${
          language === "en"
            ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        aria-label={t("language.vietnamese")}
        aria-pressed={language === "vi"}
        onClick={() => setLanguage("vi")}
        className={`rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${
          compact ? "min-w-9 px-2.5 py-1.5" : "min-w-12 rounded-xl px-3 py-2"
        } ${
          language === "vi"
            ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        }`}
      >
        VI
      </button>
    </div>
  );
}
