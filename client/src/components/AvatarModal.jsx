import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Link, RotateCcw, Upload, X } from "lucide-react";
import CharacterAvatar from "./CharacterAvatar";

export default function AvatarModal({ character, customImage, onSave, onReset, onClose }) {
  const fileRef = useRef(null);
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState(customImage || character.imageUrl || character.avatar || "");
  const [urlStatus, setUrlStatus] = useState("");

  useEffect(() => {
    const handleKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function chooseFile(event) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result));
      setUrl("");
      setUrlStatus("");
    };
    reader.readAsDataURL(file);
  }

  function validateUrl(value) {
    setUrl(value);
    setUrlStatus("");
    if (!value.trim()) return;
    try {
      new URL(value);
      const image = new Image();
      image.onload = () => { setPreview(value.trim()); setUrlStatus("valid"); };
      image.onerror = () => setUrlStatus("invalid");
      image.src = value.trim();
    } catch {
      setUrlStatus("invalid");
    }
  }

  function save() {
    if (preview) onSave(preview);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="avatar-title" className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#111420] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile picture</p><h2 id="avatar-title" className="mt-1 text-xl font-bold text-white">{character.name}</h2></div>
          <button onClick={onClose} aria-label="Close profile picture" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>
        <div className="mt-5 flex justify-center">
          <div className="grid h-48 w-48 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-black/20" style={{ color: character.themeColor }}>
            {preview ? <img src={preview} alt={`${character.name} preview`} className="h-full w-full object-cover" onError={() => setPreview("")} /> : <CharacterAvatar character={character} size="lg" />}
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-slate-200">Change Profile Picture</p>
          <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/20 p-4 text-left text-sm text-slate-300 hover:border-violet-400/60 hover:bg-white/[0.04]"><Upload size={18} className="text-violet-300" /><span><strong className="block text-white">Upload an image</strong><small className="text-slate-500">JPG, PNG, WEBP, GIF, or another image format</small></span></button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={chooseFile} />
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3"><Link size={16} className="text-slate-500" /><input value={url} onChange={(event) => validateUrl(event.target.value)} placeholder="Paste a direct image URL" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600" />{urlStatus === "valid" && <Check size={16} className="text-emerald-400" />}{urlStatus === "invalid" && <span className="text-xs text-red-300">Invalid</span>}</div>
        </div>
        <div className="mt-6 flex justify-between gap-3"><button onClick={onReset} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white"><RotateCcw size={14} />Reset to default</button><div className="flex gap-2"><button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button><button onClick={save} disabled={!preview || urlStatus === "invalid"} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black disabled:opacity-40" style={{ background: character.themeColor }}><ImagePlus size={16} />Save</button></div></div>
      </section>
    </div>
  );
}
