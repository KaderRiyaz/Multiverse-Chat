import { ArrowUpRight, Sparkles } from "lucide-react";

export default function StarterPrompts({ prompts, onSelect, disabled, color }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-slate-500"><Sparkles size={14} style={{ color }} /> NOT SURE WHERE TO START?</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {prompts.map((prompt) => (
          <button key={prompt} disabled={disabled} onClick={() => onSelect(prompt)} className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-left text-sm text-slate-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-50">
            <span>{prompt}</span>
            <ArrowUpRight size={15} className="shrink-0 opacity-40 transition group-hover:opacity-100" style={{ color }} />
          </button>
        ))}
      </div>
    </div>
  );
}
