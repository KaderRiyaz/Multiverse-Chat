import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat } from "../lib/api";

const storageKey = (id) => `multiverse-chat:v1:${id}`;

function loadHistory(id, character) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey(id)));
    if (Array.isArray(stored)) {
      const cleaned = stored.flatMap((item) => {
        if (!item || !["user", "assistant"].includes(item.role)) return [];
        const content = typeof item.content === "string"
          ? item.content
          : typeof item.text === "string" ? item.text : "";
        const audioChunks = Array.isArray(item.audioChunks)
          ? item.audioChunks.filter((chunk) => typeof chunk === "string" && chunk.length < 2_000_000)
          : undefined;
        return [{
          id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
          role: item.role,
          content,
          ...(item.failed ? { failed: true, error: typeof item.error === "string" ? item.error : "The response could not be completed." } : {}),
          ...(audioChunks?.length ? { audioChunks, audioMimeType: typeof item.audioMimeType === "string" ? item.audioMimeType : "audio/pcm;rate=24000" } : {})
        }];
      });
      if (cleaned.length) {
        try { localStorage.setItem(storageKey(id), JSON.stringify(cleaned)); } catch { /* storage may be unavailable */ }
        return cleaned;
      }
    }
  } catch {
    // Start a fresh history if storage is invalid or unavailable.
  }
  return [{
    id: `greeting-${id}`,
    role: "assistant",
    content: character.greetingMessage
  }];
}

export function useChat(characters) {
  const [activeId, setActiveId] = useState(characters[0].id);
  const [histories, setHistories] = useState(() =>
    Object.fromEntries(characters.map((c) => [c.id, loadHistory(c.id, c)]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const activeIdRef = useRef(activeId);
  const historiesRef = useRef(histories);
  const loadingRef = useRef(false);
  const saveTimersRef = useRef(new Map());

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const updateHistory = useCallback((id, updater) => {
    setHistories((previous) => {
      const nextHistory = updater(previous[id] ?? []);
      const next = { ...previous, [id]: nextHistory };
      historiesRef.current = next;
      // Streamed tokens can arrive many times per second. Debounce synchronous
      // localStorage writes so they don't block React's rendering of the reply.
      clearTimeout(saveTimersRef.current.get(id));
      saveTimersRef.current.set(id, setTimeout(() => {
        try {
          localStorage.setItem(storageKey(id), JSON.stringify(historiesRef.current[id] ?? []));
        } catch {
          setError("Chat could not be saved in this browser.");
        }
        saveTimersRef.current.delete(id);
      }, 250));
      return next;
    });
  }, []);

  const selectCharacter = useCallback((id) => {
    if (!characters.some((c) => c.id === id)) return;
    setActiveId(id);
    setError("");
  }, [characters]);

  const streamResponse = useCallback(async ({ characterId, message, conversationHistory, assistantMessage }) => {
    loadingRef.current = true;
    setLoading(true);
    setError("");

    const controller = new AbortController();

    try {
      await streamChat({
        characterId,
        message,
        conversationHistory,
        signal: controller.signal,
        onChunk: (chunk) => {
          updateHistory(characterId, (items) =>
            items.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: m.content + chunk, failed: false, error: "" }
                : m
            )
          );
        },
        onAudio: (audio) => {
          updateHistory(characterId, (items) => items.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, audioChunks: [...(m.audioChunks || []), audio.data], audioMimeType: audio.mimeType }
              : m
          ));
        }
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong.");
        updateHistory(characterId, (items) =>
          items.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, failed: true, error: err.message || "The response was interrupted. Please try again." }
              : m
          )
        );
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [updateHistory]);

  const sendMessage = useCallback(async (rawMessage) => {
    const message = rawMessage.trim();
    const characterId = activeIdRef.current;
    if (!message || loadingRef.current) return;
    const previousHistory = historiesRef.current[characterId] ?? [];
    const conversationHistory = previousHistory
      .filter((m) => ["user", "assistant"].includes(m.role))
      .map(({ role, content }) => ({ role, content }));
    const userMessage = { id: crypto.randomUUID(), role: "user", content: message };
    const assistantMessage = { id: crypto.randomUUID(), role: "assistant", content: "" };
    updateHistory(characterId, (items) => [...items, userMessage, assistantMessage]);
    await streamResponse({ characterId, message, conversationHistory, assistantMessage });
  }, [streamResponse, updateHistory]);

  const editMessage = useCallback(async (messageId, rawMessage) => {
    const message = rawMessage.trim();
    const characterId = activeIdRef.current;
    if (!message || loadingRef.current) return;
    const previousHistory = historiesRef.current[characterId] ?? [];
    const messageIndex = previousHistory.findIndex((item) => item.id === messageId && item.role === "user");
    if (messageIndex < 0) return;
    const userMessage = { ...previousHistory[messageIndex], content: message };
    const assistantMessage = { id: crypto.randomUUID(), role: "assistant", content: "" };
    const conversationHistory = previousHistory
      .slice(0, messageIndex)
      .filter((m) => ["user", "assistant"].includes(m.role))
      .map(({ role, content }) => ({ role, content }));
    updateHistory(characterId, (items) => [...items.slice(0, messageIndex), userMessage, assistantMessage]);
    await streamResponse({ characterId, message, conversationHistory, assistantMessage });
  }, [streamResponse, updateHistory]);

  const retryMessage = useCallback(async (assistantId) => {
    const characterId = activeIdRef.current;
    if (loadingRef.current) return;
    const currentHistory = historiesRef.current[characterId] ?? [];
    const assistantIndex = currentHistory.findIndex((item) => item.id === assistantId && item.role === "assistant");
    if (assistantIndex < 1) return;
    const userIndex = assistantIndex - 1;
    const userMessage = currentHistory[userIndex];
    if (!userMessage || userMessage.role !== "user") return;
    const conversationHistory = currentHistory
      .slice(0, userIndex)
      .filter((item) => ["user", "assistant"].includes(item.role))
      .map(({ role, content }) => ({ role, content }));
    const assistantMessage = { ...currentHistory[assistantIndex], content: "", failed: false, error: "" };
    updateHistory(characterId, (items) => items.map((item) => item.id === assistantId ? assistantMessage : item));
    await streamResponse({ characterId, message: userMessage.content, conversationHistory, assistantMessage });
  }, [streamResponse, updateHistory]);

  const clearCurrentChat = useCallback(() => {
    if (loadingRef.current) return;
    const character = characters.find((c) => c.id === activeIdRef.current);
    if (!character) return;
    updateHistory(character.id, () => [{
      id: crypto.randomUUID(),
      role: "assistant",
      content: character.greetingMessage
    }]);
    setError("");
  }, [characters, updateHistory]);

  return {
    activeId,
    histories,
    loading,
    error,
    selectCharacter,
    sendMessage,
    editMessage,
    retryMessage,
    clearCurrentChat
  };
}
