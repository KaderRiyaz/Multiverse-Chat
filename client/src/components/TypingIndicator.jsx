export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2" role="status" aria-label="Character is thinking">
      {[0, 1, 2].map((dot) => (
        <span key={dot} className="h-2 w-2 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: `${dot * 150}ms` }} />
      ))}
      <span className="ml-2 text-xs text-slate-500">Thinking...</span>
    </div>
  );
}
