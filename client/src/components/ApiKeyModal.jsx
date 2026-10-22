import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ApiKeyModal({ value, onSave, onClear, onClose }) {
  const [draft, setDraft] = useState(value || "");
  const [visible, setVisible] = useState(false);

  useEffect(() => setDraft(value || ""), [value]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="api-key-title" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111420] p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><KeyRound size={20} /></div><div><h2 id="api-key-title" className="font-semibold text-white">Gemini API key</h2><p className="mt-1 text-xs text-slate-500">Stored only on this device</p></div></div>
          <button onClick={onClose} aria-label="Close settings" className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"><X size={18} /></button>
        </div>
        <label htmlFor="gemini-api-key" className="mb-2 block text-xs font-medium text-slate-300">Your API key</label>
        <div className="relative">
          <input id="gemini-api-key" type={visible ? "text" : "password"} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Paste your Gemini API key" autoComplete="off" className="w-full rounded-xl border border-white/10 bg-[#090b14] px-3 py-3 pr-11 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50" />
          <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide API key" : "Show API key"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:text-white">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">Use your own quota for hosted chat. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Get a free key from Google AI Studio</a>.</p>
        <div className="mt-6 flex justify-between gap-3"><button onClick={onClear} className="rounded-xl border border-red-400/20 px-4 py-2.5 text-sm text-red-300 hover:bg-red-400/10">Clear key</button><div className="flex gap-2"><button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5">Cancel</button><button onClick={() => onSave(draft)} className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Save key</button></div></div>
      </section>
    </div>
  );
}
