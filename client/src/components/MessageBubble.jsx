import { Bot, User } from "lucide-react";
import TypingIndicator from "./TypingIndicator";

export default function MessageBubble({ message, character, streaming }) {
  const isUser = message.role === "user";

  return (
    <div className={`animate-fade-in flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={isUser ? { background: "#ffffff12", color: "#e2e8f0" } : { background: `${character.themeColor}18`, color: character.themeColor }}>
        {isUser ? <User size={17} /> : <Bot size={18} />}
      </div>
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "text-right" : ""}`}>
        <p className="mb-1.5 text-[11px] font-semibold text-slate-500">{isUser ? "YOU" : character.name.toUpperCase()}</p>
        <div className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 ${isUser ? "rounded-tr-sm bg-white/[0.09] text-slate-100" : "rounded-tl-sm border border-white/[0.06] bg-[#121522] text-slate-200"}`} style={!isUser ? { borderLeftColor: `${character.themeColor}70`, borderLeftWidth: 2 } : undefined}>
          {message.content || (streaming ? <TypingIndicator /> : <span className="text-slate-400">No response received.</span>)}
          {streaming && message.content && <span className="ml-1 inline-block h-4 w-1 animate-pulse align-middle" style={{ background: character.themeColor }} />}
        </div>
      </div>
    </div>
  );
}
