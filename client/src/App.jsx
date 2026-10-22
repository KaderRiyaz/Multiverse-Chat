import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { characters } from "./data/characters";
import { useChat } from "./hooks/useChat";
import AvatarModal from "./components/AvatarModal";

const avatarStorageKey = "multiverse-chat:custom-avatars:v1";

function loadCustomAvatars() {
  try {
    const stored = JSON.parse(localStorage.getItem(avatarStorageKey));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [customAvatars, setCustomAvatars] = useState(loadCustomAvatars);
  const [avatarCharacter, setAvatarCharacter] = useState(null);
  const { activeId, histories, loading, error, selectCharacter, sendMessage, clearCurrentChat } = useChat(characters);

  const displayCharacters = useMemo(
    () => characters.map((character) => ({ ...character, imageUrl: customAvatars[character.id] || character.imageUrl })),
    [customAvatars]
  );

  const activeCharacter = useMemo(
    () => displayCharacters.find((c) => c.id === activeId) ?? displayCharacters[0],
    [activeId, displayCharacters]
  );

  function saveAvatar(image) {
    const next = { ...customAvatars, [avatarCharacter.id]: image };
    setCustomAvatars(next);
    localStorage.setItem(avatarStorageKey, JSON.stringify(next));
    setAvatarCharacter(null);
  }

  function resetAvatar() {
    const next = { ...customAvatars };
    delete next[avatarCharacter.id];
    setCustomAvatars(next);
    localStorage.setItem(avatarStorageKey, JSON.stringify(next));
    setAvatarCharacter(null);
  }

  return (
    <div className="app-shell flex h-dvh overflow-hidden bg-[#090b14] text-slate-100">
      <Sidebar characters={displayCharacters} activeId={activeId} onSelect={selectCharacter} onPreview={setAvatarCharacter} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <ChatWindow key={activeCharacter.id} character={activeCharacter} messages={histories[activeCharacter.id] ?? []} loading={loading} error={error} onSend={sendMessage} onClear={clearCurrentChat} onMenu={() => setMobileOpen(true)} onPreview={setAvatarCharacter} />
      {avatarCharacter && <AvatarModal character={avatarCharacter} customImage={customAvatars[avatarCharacter.id]} onSave={saveAvatar} onReset={resetAvatar} onClose={() => setAvatarCharacter(null)} />}
    </div>
  );
}
