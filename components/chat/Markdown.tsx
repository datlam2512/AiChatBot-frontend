"use client";
// Intentionally tiny Markdown renderer: code fences, headings, lists, **bold**, `inline code`.
// Swap for react-markdown later if you need more.
import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((p, i) => {
    if (p.length > 2 && p.startsWith("`") && p.endsWith("`"))
      return <code key={i} className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-neutral-800">{p.slice(1, -1)}</code>;
    if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    return p;
  });
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 text-neutral-100 dark:border-neutral-700">
      <div className="flex items-center justify-between bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300">
        <span>{lang || "code"}</span>
        <button onClick={copy} className="flex items-center gap-1 hover:text-white">
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? t("chat.copied") : t("chat.copyCode")}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed"><code className="font-mono">{code}</code></pre>
    </div>
  );
}

function TextBlock({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const s = { para: [] as string[], list: null as { ordered: boolean; items: string[] } | null };
  const flushPara = () => {
    if (s.para.length) out.push(<p key={out.length}>{inline(s.para.join(" "))}</p>);
    s.para = [];
  };
  const flushList = () => {
    if (s.list) {
      const cls = (s.list.ordered ? "list-decimal" : "list-disc") + " space-y-1 pl-6";
      const items = s.list.items.map((t, i) => <li key={i}>{inline(t)}</li>);
      out.push(s.list.ordered ? <ol key={out.length} className={cls}>{items}</ol> : <ul key={out.length} className={cls}>{items}</ul>);
    }
    s.list = null;
  };
  for (const line of text.split("\n")) {
    const h = line.match(/^#{1,3}\s+(.*)/);
    const li = line.match(/^\s*([-*]|\d+\.)\s+(.*)/);
    if (h) { flushPara(); flushList(); out.push(<h3 key={out.length} className="text-base font-semibold">{inline(h[1])}</h3>); }
    else if (li) {
      flushPara();
      const ordered = /\d/.test(li[1]);
      if (s.list && s.list.ordered !== ordered) flushList();
      if (!s.list) s.list = { ordered, items: [] };
      s.list.items.push(li[2]);
    } else if (!line.trim()) { flushPara(); flushList(); }
    else { flushList(); s.para.push(line); }
  }
  flushPara(); flushList();
  return <>{out}</>;
}

export default function Markdown({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /```(\w*)\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(<TextBlock key={parts.length} text={text.slice(last, m.index)} />);
    parts.push(<CodeBlock key={parts.length} lang={m[1]} code={m[2].replace(/\n$/, "")} />);
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(<TextBlock key={parts.length} text={text.slice(last)} />);
  return <div className="space-y-3 break-words text-[15px] leading-7">{parts}</div>;
}
