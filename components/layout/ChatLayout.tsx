"use client";
import { useState, type ReactNode } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { LoaderCircle, Menu, X } from "lucide-react";
import Sidebar from "@/components/sidebar/Sidebar";
import { useChat } from "@/lib/chat-context";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";

export default function ChatLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const params = useParams<{ conversationId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { token, ready } = useAuth();
  const { conversations } = useChat();
  const { t } = useLanguage();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (ready && !token && !isAuthPage) router.replace("/login");
  }, [ready, token, isAuthPage, router]);

  if (isAuthPage) return <>{children}</>;

  if (!ready || !token) {
    return (
      <div className="flex h-dvh items-center justify-center bg-neutral-50 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <LoaderCircle size={20} className="animate-spin" />
          <span>{t("layout.checkingSession")}</span>
        </div>
      </div>
    );
  }
  const title =
    pathname === "/documents"
      ? t("layout.documents")
      : conversations.find((c) => String(c.id) === params.conversationId)?.title ??
        t("layout.newChat");

  return (
    <div className="flex h-dvh bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <aside className="hidden w-72 shrink-0 border-r border-neutral-200 bg-neutral-50 md:block dark:border-neutral-800 dark:bg-neutral-950">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-neutral-50 shadow-xl dark:bg-neutral-950">
            <button onClick={() => setOpen(false)} aria-label={t("nav.closeMenu")} className="absolute right-2 top-3 rounded-lg p-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800">
              <X size={18} />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-3 dark:border-neutral-800 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setOpen(true)} aria-label={t("nav.openMenu")} className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:hidden dark:text-neutral-300 dark:hover:bg-neutral-800">
              <Menu size={20} />
            </button>
            <h1 className="truncate text-sm font-medium">{title}</h1>
          </div>
          <LanguageSwitcher compact />
        </header>
        <main className="min-h-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
