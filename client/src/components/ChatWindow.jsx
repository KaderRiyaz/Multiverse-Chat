import { useEffect, useRef, useState } from "react";
import { ArrowUp, Menu, RotateCcw, Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";
import StarterPrompts from "./StarterPrompts";
import CharacterAvatar from "./CharacterAvatar";

export default function ChatWindow({ character, messages, loading, error, onSend, onClear, onMenu, onPreview }) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    // Smooth scrolling on every streamed token starts overlapping animations
    // and can make rendering feel sluggish while the reply is arriving.
    bottomRef.current?.scrollIntoView({ behavior: loading ? "auto" : "smooth" });
  }, [messages, loading]);

  function submit(value = draft) {
    if (loading || !value.trim()) return;
    onSend(value);
    setDraft("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    submit();
  }

  const showStarters = messages.length <= 1 && !loading && !error;

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onMenu} aria-label="Open character selector" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"><Menu size={21} /></button>
          <CharacterAvatar character={character} onClick={() => onPreview(character)} />
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-white">{character.name}</h2>
            <p className="mt-1 text-xs text-slate-500">{character.universe} universe · AI persona</p>
          </div>
        </div>
        <button onClick={onClear} disabled={loading} className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-slate-400 transition hover:text-white disabled:opacity-40" title="Clear this character's conversation">
          <RotateCcw size={14} /><span className="hidden sm:inline">New chat</span>
        </button>
      </header>

      <div className="chat-scroll flex-1 overflow-y-auto px-4 py-7 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-7">
          <div className="mb-9 pt-5 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 animate-float place-items-center rounded-2xl border" style={{ color: character.themeColor, borderColor: `${character.themeColor}55`, background: `${character.themeColor}12`, boxShadow: `0 0 40px ${character.themeColor}12` }}><Sparkles size={28} /></div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: character.themeColor }}>ENTER THE MULTIVERSE</p>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Chat with {character.name}</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Ask about their world, explore comic lore, or talk about life.</p>
          </div>

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              character={character}
              streaming={loading && index === messages.length - 1 && message.role === "assistant"}
            />
          ))}

          {showStarters && <StarterPrompts prompts={character.starterPrompts} onSelect={submit} disabled={loading} color={character.themeColor} />}

          {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3 text-sm text-red-300">{error}</div>}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="shrink-0 border-t border-white/[0.07] bg-[#090b14]/80 px-4 pb-4 pt-4 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="flex items-end gap-3 rounded-2xl border border-white/10 bg-[#111420] p-2 transition focus-within:border-white/20" style={{ boxShadow: `0 0 24px ${character.themeColor}08` }}>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder={`Message ${character.name}...`} aria-label="Your message" maxLength={4000} rows={1} className="max-h-36 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm leading-5 text-white outline-none placeholder:text-slate-600" />
            <button type="submit" disabled={loading || !draft.trim()} aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-black transition disabled:cursor-not-allowed disabled:opacity-30" style={{ background: character.themeColor }}><ArrowUp size={19} /></button>
          </form>
          <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-slate-600"><span>Enter to send · Shift + Enter for a new line</span><span>{draft.length}/4000</span></div>
          <p className="mt-2 text-center text-[10px] text-slate-600">AI-generated fan experience. Responses may contain lore inaccuracies.</p>
        </div>
      </footer>
    </main>
  );
}
