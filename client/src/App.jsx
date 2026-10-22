import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { characters } from "./data/characters";
import { useChat } from "./hooks/useChat";

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeId, histories, loading, error, selectCharacter, sendMessage, clearCurrentChat } = useChat(characters);

  const activeCharacter = useMemo(
    () => characters.find((c) => c.id === activeId) ?? characters[0],
    [activeId]
  );

  return (
    <div className="app-shell flex h-dvh overflow-hidden bg-[#090b14] text-slate-100">
      <Sidebar characters={characters} activeId={activeId} onSelect={selectCharacter} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <ChatWindow key={activeCharacter.id} character={activeCharacter} messages={histories[activeCharacter.id] ?? []} loading={loading} error={error} onSend={sendMessage} onClear={clearCurrentChat} onMenu={() => setMobileOpen(true)} />
    </div>
  );
}
