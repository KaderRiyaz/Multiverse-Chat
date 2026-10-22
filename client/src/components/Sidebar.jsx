import { useState } from "react";
import { Search, Shield, X } from "lucide-react";
import CharacterAvatar from "./CharacterAvatar";

export default function Sidebar({ characters, activeId, onSelect, onPreview, mobileOpen, onClose }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = characters.filter((character) => {
    const matchesUniverse = filter === "All" || character.universe === filter;
    const matchesSearch = character.name.toLowerCase().includes(search.toLowerCase());
    return matchesUniverse && matchesSearch;
  });

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
          onClick={onClose}
          aria-label="Close character menu"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[290px] flex-col border-r border-white/10 bg-[#0c0e18] transition-transform lg:static lg:z-auto lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Shield size={22} /></div>
            <div>
              <h1 className="font-bold tracking-tight">MULTIVERSE</h1>
              <p className="text-xs text-slate-500">AI CHARACTER CHAT</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 lg:hidden" aria-label="Close menu"><X /></button>
        </div>

        <div className="p-4">
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
            <Search size={17} className="text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a character..." aria-label="Search characters" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600" />
          </label>
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-white/[0.04] p-1">
            {["All", "Marvel", "DC"].map((item) => (
              <button key={item} onClick={() => setFilter(item)} className={`rounded-lg py-2 text-xs font-semibold transition ${filter === item ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}>{item}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
          <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Choose your hero</p>
          {filtered.map((character) => {
            const active = activeId === character.id;
            return (
              <button
                key={character.id}
                onClick={() => { onSelect(character.id); onClose(); }}
                style={{
                  borderColor: active ? `${character.themeColor}99` : "transparent",
                  boxShadow: active ? `0 0 22px ${character.themeColor}20` : "none"
                }}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition hover:bg-white/[0.05] ${active ? "bg-white/[0.06]" : "bg-transparent"}`}
              >
                <CharacterAvatar character={character} onClick={(event) => { event.stopPropagation(); onPreview(character); }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-100">{character.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{character.universe}</p>
                </div>
                {active && <span className="h-2 w-2 rounded-full" style={{ background: character.themeColor, boxShadow: `0 0 10px ${character.themeColor}` }} />}
              </button>
            );
          })}
          {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-500">No characters found.</p>}
        </div>

        <div className="border-t border-white/10 p-4">
          <p className="text-xs leading-5 text-slate-500">Fan-made AI conversations. Not affiliated with Marvel or DC.</p>
        </div>
      </aside>
    </>
  );
}
