export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2" role="status" aria-label="Assistant is typing">
      {[0, 150, 300].map((d) => (
        <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  );
}
