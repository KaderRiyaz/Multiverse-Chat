import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { characters } from "./data/characters";
import { useChat } from "./hooks/useChat";
import AvatarModal from "./components/AvatarModal";
import ApiKeyModal from "./components/ApiKeyModal";
import ChatErrorBoundary from "./components/ChatErrorBoundary";

const avatarStorageKey = "multiverse-chat:custom-avatars:v1";
const apiKeyStorageKey = "multiverse-chat:gemini-api-key";

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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(apiKeyStorageKey) || "");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { activeId, histories, loading, error, selectCharacter, sendMessage, editMessage, retryMessage, clearCurrentChat } = useChat(characters);

  useEffect(() => {
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener("gemini-api-key-required", openSettings);
    return () => window.removeEventListener("gemini-api-key-required", openSettings);
  }, []);

  function saveApiKey(value) {
    const next = value.trim();
    if (next) localStorage.setItem(apiKeyStorageKey, next);
    else localStorage.removeItem(apiKeyStorageKey);
    setApiKey(next);
    setSettingsOpen(false);
  }

  function clearApiKey() {
    localStorage.removeItem(apiKeyStorageKey);
    setApiKey("");
  }

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
      <ChatErrorBoundary key={activeCharacter.id} onReset={clearCurrentChat}><ChatWindow character={activeCharacter} messages={histories[activeCharacter.id] ?? []} loading={loading} error={error} onSend={sendMessage} onEdit={editMessage} onRetry={retryMessage} onClear={clearCurrentChat} onMenu={() => setMobileOpen(true)} onPreview={setAvatarCharacter} onOpenSettings={() => setSettingsOpen(true)} /></ChatErrorBoundary>
      {avatarCharacter && <AvatarModal character={avatarCharacter} customImage={customAvatars[avatarCharacter.id]} onSave={saveAvatar} onReset={resetAvatar} onClose={() => setAvatarCharacter(null)} />}
      {settingsOpen && <ApiKeyModal value={apiKey} onSave={saveApiKey} onClear={clearApiKey} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
