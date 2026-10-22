import { Check, Copy, Pencil, Send, User, X } from "lucide-react";
import { useState } from "react";
import TypingIndicator from "./TypingIndicator";
import CharacterAvatar from "./CharacterAvatar";

export default function MessageBubble({ message, character, streaming, onEdit }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function saveEdit() {
    if (!draft.trim() || !onEdit) return;
    onEdit(message.id, draft);
    setEditing(false);
  }

  return (
    <div className={`group animate-fade-in flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {isUser ? (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "#ffffff12", color: "#e2e8f0" }}><User size={17} /></div>
      ) : <CharacterAvatar character={character} size="sm" />}
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "text-right" : ""}`}>
        <p className="mb-1.5 text-[11px] font-semibold text-slate-500">{isUser ? "YOU" : character.name.toUpperCase()}</p>
        {editing ? (
          <div className="rounded-2xl rounded-tr-sm border border-white/10 bg-[#121522] p-3">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus rows={3} className="w-full resize-y bg-transparent text-sm leading-6 text-white outline-none" />
            <div className="mt-2 flex justify-end gap-2"><button onClick={() => { setDraft(message.content); setEditing(false); }} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-white/10"><X size={13} />Cancel</button><button onClick={saveEdit} disabled={!draft.trim()} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-black disabled:opacity-40" style={{ background: character.themeColor }}><Send size={13} />Save & Submit</button></div>
          </div>
        ) : <div className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 ${isUser ? "rounded-tr-sm bg-white/[0.09] text-slate-100" : "rounded-tl-sm border border-white/[0.06] bg-[#121522] text-slate-200"}`} style={!isUser ? { borderLeftColor: `${character.themeColor}70`, borderLeftWidth: 2 } : undefined}>
          {message.content || (streaming ? <TypingIndicator /> : <span className="text-slate-400">No response received.</span>)}
          {streaming && message.content && <span className="ml-1 inline-block h-4 w-1 animate-pulse align-middle" style={{ background: character.themeColor }} />}
        </div>}
        {!editing && message.content && <div className={`mt-1 flex gap-1 opacity-0 transition group-hover:opacity-100 ${isUser ? "justify-end" : "justify-start"}`}><button onClick={copyMessage} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-slate-500 hover:bg-white/10 hover:text-slate-200" title="Copy message">{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied" : "Copy"}</button>{isUser && <button onClick={() => { setDraft(message.content); setEditing(true); }} disabled={streaming} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-slate-500 hover:bg-white/10 hover:text-slate-200 disabled:opacity-40" title="Edit message"><Pencil size={12} />Edit</button>}</div>}
        </div>
      </div>
  );
}
