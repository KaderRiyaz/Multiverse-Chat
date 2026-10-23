import { useEffect, useState } from "react";
import { Phone, UserRound, X } from "lucide-react";
import { sendPhoneOtp, signInWithGoogle } from "../lib/auth";

export default function AuthModal({ onClose, required = false }) {
  const [mode, setMode] = useState("signin");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("+91");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!secondsLeft) return undefined;
    const timer = setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  async function google() {
    setBusy(true); setError("");
    try { await signInWithGoogle(); onClose(); } catch (err) { setError(err.message || "Google sign-in failed."); } finally { setBusy(false); }
  }

  async function sendCode(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { setConfirmation(await sendPhoneOtp(`${country}${phone.replace(/\D/g, "")}`, "recaptcha-container")); setSecondsLeft(30); } catch (err) { setError(err.message || "Could not send OTP."); } finally { setBusy(false); }
  }

  function changePhone() { setConfirmation(null); setOtp(""); setSecondsLeft(0); setError(""); }

  async function verify(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { const result = await confirmation.confirm(otp); if (mode === "signup" && (name.trim() || avatar)) await result.user.updateProfile({ displayName: name.trim() || undefined, photoURL: avatar || undefined }); onClose(); } catch (err) { setError(err.message || "Invalid OTP."); } finally { setBusy(false); }
  }

  return <div className={`fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm ${required ? "bg-[#090b14]" : "bg-black/70"}`} onMouseDown={(event) => !required && event.target === event.currentTarget && onClose()}><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111420] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold text-white">{confirmation ? "Verify your phone" : mode === "signup" ? "Create your account" : "Welcome back"}</h2><p className="mt-1 text-sm text-slate-500">{confirmation ? `Enter the 6-digit code sent to ${country}${phone}` : "Sign in to keep your chats and settings synced."}</p></div>{!required && <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"><X size={18} /></button>}</div>{!confirmation && <><div className="mt-5 flex rounded-xl bg-black/20 p-1"><button onClick={() => setMode("signin")} className={`flex-1 rounded-lg py-2 text-sm ${mode === "signin" ? "bg-white/10 text-white" : "text-slate-500"}`}>Sign in</button><button onClick={() => setMode("signup")} className={`flex-1 rounded-lg py-2 text-sm ${mode === "signup" ? "bg-white/10 text-white" : "text-slate-500"}`}>Create account</button></div><button onClick={google} disabled={busy} className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"><span className="text-lg font-bold">G</span>Continue with Google</button><div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-slate-600"><span className="h-px flex-1 bg-white/10" />or phone<span className="h-px flex-1 bg-white/10" /></div>{mode === "signup" && <><label className="mb-3 block"><span className="mb-1 block text-xs text-slate-400">Display name</span><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#090b14] px-3 py-3 text-sm text-white outline-none" placeholder="Your name" /></label><label className="mb-3 block"><span className="mb-1 block text-xs text-slate-400">Optional avatar</span><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setAvatar(String(reader.result)); reader.readAsDataURL(file); }} className="block w-full text-xs text-slate-500" /></label></>}<form onSubmit={sendCode}><label className="block"><span className="mb-1 block text-xs text-slate-400">Mobile number</span><div className="flex gap-2"><select aria-label="Country code" value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-xl border border-white/10 bg-[#090b14] px-2 text-sm text-white"><option>+91</option><option>+1</option><option>+44</option><option>+61</option></select><input required value={phone} onChange={(e) => setPhone(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090b14] px-3 py-3 text-sm text-white outline-none" placeholder="98765 43210" /></div></label><button disabled={busy || !phone.trim()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40"><Phone size={16} />Send OTP</button></form></>}{confirmation && <form onSubmit={verify}><label className="block text-xs text-slate-400">6-digit verification code<input autoFocus required minLength={6} maxLength={6} inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} onPaste={(e) => { const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (text) { e.preventDefault(); setOtp(text); } }} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b14] px-3 py-3 text-center text-xl tracking-[0.5em] text-white outline-none" placeholder="••••••" /></label><button disabled={busy || otp.length !== 6} className="mt-4 w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40">Verify &amp; Continue</button><div className="mt-4 flex items-center justify-between text-xs"><button type="button" onClick={changePhone} className="text-slate-400 hover:text-white">Change phone number</button><button type="button" onClick={sendCode} disabled={busy || secondsLeft > 0} className="text-cyan-300 disabled:text-slate-600">{secondsLeft ? `Resend in ${secondsLeft}s` : "Resend OTP"}</button></div></form>}<div id="recaptcha-container" />{error && <p className="mt-3 rounded-lg bg-red-400/10 p-3 text-xs text-red-300">{error}</p>}</section></div>;
}
