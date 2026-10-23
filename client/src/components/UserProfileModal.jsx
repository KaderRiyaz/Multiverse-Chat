import { useState } from "react";
import { Link2, RotateCcw, Upload, X } from "lucide-react";

export default function UserProfileModal({ user, avatar, onSaveAvatar, onResetAvatar, onClose }) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState(avatar || user?.photoURL || "");
  const [urlError, setUrlError] = useState("");

  function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPreview(String(reader.result)); setUrl(""); };
    reader.readAsDataURL(file);
  }

  function useUrl() {
    setUrlError("");
    const image = new Image();
    image.onload = () => setPreview(url.trim());
    image.onerror = () => setUrlError("That image URL could not be loaded.");
    image.src = url.trim();
  }

  function save() { onSaveAvatar(preview); onClose(); }
  function reset() { onResetAvatar(); setPreview(user?.photoURL || ""); setUrl(""); }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111420] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold text-white">Profile &amp; settings</h2><p className="mt-1 text-sm text-slate-500">{user?.email || user?.phoneNumber || "Signed-in account"}</p></div><button onClick={onClose} aria-label="Close profile" className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"><X size={18} /></button></div><div className="mt-6 flex flex-col items-center"><div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-cyan-300/30 bg-cyan-400/10 text-3xl font-bold text-cyan-200">{preview ? <img src={preview} alt="Profile preview" className="h-full w-full object-cover" /> : (user?.displayName || user?.phoneNumber || "U").slice(0, 1).toUpperCase()}</div><p className="mt-3 font-medium text-white">{user?.displayName || "Your profile"}</p></div><div className="mt-6 space-y-3"><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-3 text-sm text-slate-300 hover:bg-white/5"><Upload size={16} />Upload image<input type="file" accept="image/*" onChange={upload} className="hidden" /></label><div className="flex gap-2"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste direct image URL" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090b14] px-3 py-3 text-sm text-white outline-none" /><button onClick={useUrl} disabled={!url.trim()} className="rounded-xl border border-white/10 px-3 text-slate-300 disabled:opacity-40"><Link2 size={16} /></button></div>{urlError && <p className="text-xs text-red-300">{urlError}</p>}</div><div className="mt-6 flex justify-between gap-2"><button onClick={reset} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-400 hover:text-white"><RotateCcw size={14} />Reset avatar</button><button onClick={save} className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950">Save changes</button></div></section></div>;
}
