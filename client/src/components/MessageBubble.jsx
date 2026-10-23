import { Check, Copy, Pencil, Play, Pause, RefreshCw, Send, User, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TypingIndicator from "./TypingIndicator";
import CharacterAvatar from "./CharacterAvatar";

function pcmUrl(chunks, mimeType = "audio/pcm;rate=24000") {
  if (!chunks?.length) return "";
  try {
    const raw = Uint8Array.from(atob(chunks.join("")), (char) => char.charCodeAt(0));
    const sampleRate = Number(mimeType.match(/rate=(\d+)/)?.[1] || 24000);
    const buffer = new ArrayBuffer(44 + raw.length);
    const view = new DataView(buffer);
    const write = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
    write(0, "RIFF"); view.setUint32(4, 36 + raw.length, true); write(8, "WAVE"); write(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, "data"); view.setUint32(40, raw.length, true); new Uint8Array(buffer, 44).set(raw);
    return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  } catch {
    return "";
  }
}

export default function MessageBubble({ message, character, streaming, onEdit, onRetry, canRegenerate, autoPlay }) {
  const isUser = message.role === "user";
  const messageText = typeof message.content === "string" ? message.content : "";
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(messageText);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    if (!message.audioChunks?.length) return undefined;
    const nextUrl = pcmUrl(message.audioChunks, message.audioMimeType);
    setAudioUrl(nextUrl);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = nextUrl;
      setPlaying(false);
    }
    return () => URL.revokeObjectURL(nextUrl);
  }, [message.audioChunks, message.audioMimeType]);

  useEffect(() => {
    if (!audioUrl || !autoPlay || streaming) return;
    if (!audioRef.current) audioRef.current = new Audio(audioUrl);
    else audioRef.current.src = audioUrl;
    audioRef.current.onended = () => setPlaying(false);
    audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
  }, [audioUrl, autoPlay, streaming]);

  function toggleAudio() {
    if (!audioUrl) return;
    if (!audioRef.current) audioRef.current = new Audio(audioUrl);
    if (audioRef.current.src !== audioUrl) audioRef.current.src = audioUrl;
    audioRef.current.onended = () => setPlaying(false);
    if (playing) audioRef.current.pause(); else audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    setPlaying((current) => !current);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(messageText);
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
          {message.failed ? <>{messageText && <div className="mb-2 text-slate-200">{messageText}</div>}<div className="text-red-300">{message.error || "The response could not be completed."}</div>{onRetry && <button onClick={() => onRetry(message.id)} className="mt-3 flex items-center gap-2 rounded-lg bg-red-400/15 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-400/25"><RefreshCw size={13} />Retry</button>}</> : messageText || (streaming ? <TypingIndicator /> : <span className="text-slate-400">No response received.</span>)}
          {streaming && messageText && <span className="ml-1 inline-block h-4 w-1 animate-pulse align-middle" style={{ background: character.themeColor }} />}
        </div>}
        {!editing && messageText && <div className={`mt-1 flex gap-1 opacity-0 transition group-hover:opacity-100 ${isUser ? "justify-end" : "justify-start"}`}><button onClick={copyMessage} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-slate-500 hover:bg-white/10 hover:text-slate-200" title="Copy message">{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied" : "Copy"}</button>{!isUser && audioUrl && <button onClick={toggleAudio} disabled={streaming} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-slate-500 hover:bg-white/10 hover:text-slate-200 disabled:opacity-40" title="Play character voice">{playing ? <Pause size={12} /> : <Play size={12} />}Voice</button>}{!isUser && canRegenerate && <button onClick={() => onRetry?.(message.id)} disabled={streaming} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-slate-500 hover:bg-white/10 hover:text-slate-200 disabled:opacity-40" title="Regenerate response"><RefreshCw size={12} />Retry</button>}{isUser && <button onClick={() => { setDraft(messageText); setEditing(true); }} disabled={streaming} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-slate-500 hover:bg-white/10 hover:text-slate-200 disabled:opacity-40" title="Edit message"><Pencil size={12} />Edit</button>}</div>}
        </div>
      </div>
  );
}
