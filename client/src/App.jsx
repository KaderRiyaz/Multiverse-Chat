import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { characters } from "./data/characters";
import { useChat } from "./hooks/useChat";
import AvatarModal from "./components/AvatarModal";
import ApiKeyModal from "./components/ApiKeyModal";
import ChatErrorBoundary from "./components/ChatErrorBoundary";
import AuthModal from "./components/AuthModal";
import { logout, useAuth } from "./lib/auth";
import UserProfileModal from "./components/UserProfileModal";

const storageScope = (user) => user?.uid || "guest";
const avatarStorageKey = (scope) => `multiverse-chat:${scope}:custom-avatars:v1`;
const apiKeyStorageKey = (scope) => `multiverse-chat:${scope}:gemini-api-key`;

function loadCustomAvatars(scope) {
  try {
    const stored = JSON.parse(localStorage.getItem(avatarStorageKey(scope)));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, ready } = useAuth();
  const scope = storageScope(user);
  const [customAvatars, setCustomAvatars] = useState(() => loadCustomAvatars(scope));
  const [avatarCharacter, setAvatarCharacter] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(apiKeyStorageKey(scope)) || "");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem(`multiverse-chat:${scope}:profile-avatar`) || "");
  const { activeId, histories, loading, error, selectCharacter, sendMessage, editMessage, retryMessage, clearCurrentChat } = useChat(characters, scope);

  useEffect(() => {
    localStorage.setItem("multiverse-chat:active-user", scope);
    setCustomAvatars(loadCustomAvatars(scope));
    setApiKey(localStorage.getItem(apiKeyStorageKey(scope)) || "");
    setUserAvatar(localStorage.getItem(`multiverse-chat:${scope}:profile-avatar`) || "");
  }, [scope]);

  useEffect(() => {
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener("gemini-api-key-required", openSettings);
    return () => window.removeEventListener("gemini-api-key-required", openSettings);
  }, []);

  function saveApiKey(value) {
    const next = value.trim();
    if (next) localStorage.setItem(apiKeyStorageKey(scope), next);
    else localStorage.removeItem(apiKeyStorageKey(scope));
    setApiKey(next);
    setSettingsOpen(false);
  }

  function clearApiKey() {
    localStorage.removeItem(apiKeyStorageKey(scope));
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

  if (!ready) {
    return <div className="grid h-dvh place-items-center bg-[#090b14] text-cyan-300"><div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" aria-label="Checking session" /></div>;
  }
  if (!user) return <AuthModal required onClose={() => {}} />;

  function saveAvatar(image) {
    const next = { ...customAvatars, [avatarCharacter.id]: image };
    setCustomAvatars(next);
    localStorage.setItem(avatarStorageKey(scope), JSON.stringify(next));
    setAvatarCharacter(null);
  }

  function resetAvatar() {
    const next = { ...customAvatars };
    delete next[avatarCharacter.id];
    setCustomAvatars(next);
    localStorage.setItem(avatarStorageKey(scope), JSON.stringify(next));
    setAvatarCharacter(null);
  }

  return (
    <div className="app-shell flex h-dvh overflow-hidden bg-[#090b14] text-slate-100">
      <Sidebar characters={displayCharacters} activeId={activeId} onSelect={selectCharacter} onPreview={setAvatarCharacter} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <ChatErrorBoundary key={activeCharacter.id} onReset={clearCurrentChat}><ChatWindow user={user} userAvatar={userAvatar} onAuth={() => setAuthOpen(true)} onProfile={() => setProfileOpen(true)} onLogout={logout} character={activeCharacter} messages={histories[activeCharacter.id] ?? []} loading={loading} error={error} onSend={sendMessage} onEdit={editMessage} onRetry={retryMessage} onClear={clearCurrentChat} onMenu={() => setMobileOpen(true)} onPreview={setAvatarCharacter} onOpenSettings={() => setSettingsOpen(true)} /></ChatErrorBoundary>
      {avatarCharacter && <AvatarModal character={avatarCharacter} customImage={customAvatars[avatarCharacter.id]} onSave={saveAvatar} onReset={resetAvatar} onClose={() => setAvatarCharacter(null)} />}
      {settingsOpen && <ApiKeyModal value={apiKey} onSave={saveApiKey} onClear={clearApiKey} onClose={() => setSettingsOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {profileOpen && <UserProfileModal user={user} avatar={userAvatar} onSaveAvatar={(image) => { setUserAvatar(image); localStorage.setItem(`multiverse-chat:${scope}:profile-avatar`, image); }} onResetAvatar={() => { setUserAvatar(""); localStorage.removeItem(`multiverse-chat:${scope}:profile-avatar`); }} onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
