import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat } from "../lib/api";

const storageKey = (id) => `multiverse-chat:v1:${id}`;

function loadHistory(id, character) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey(id)));
    if (
      Array.isArray(stored) &&
      stored.every((m) =>
        m &&
        ["user", "assistant"].includes(m.role) &&
        typeof m.content === "string"
      )
    ) {
      return stored;
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

  const sendMessage = useCallback(async (rawMessage) => {
    const message = rawMessage.trim();
    const characterId = activeIdRef.current;
    if (!message || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError("");

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message
    };
    const assistantMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: ""
    };

    const previousHistory = historiesRef.current[characterId] ?? [];
    const conversationHistory = previousHistory
      .filter((m) => ["user", "assistant"].includes(m.role))
      .map(({ role, content }) => ({ role, content }));

    updateHistory(characterId, (items) => [
      ...items,
      userMessage,
      assistantMessage
    ]);

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
                ? { ...m, content: m.content + chunk }
                : m
            )
          );
        }
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong.");
        updateHistory(characterId, (items) =>
          items.map((m) =>
            m.id === assistantMessage.id && !m.content
              ? { ...m, content: "I couldn't complete that response. Please try again." }
              : m
          )
        );
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [updateHistory]);

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
    clearCurrentChat
  };
}
