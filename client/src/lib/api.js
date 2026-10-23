const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = configuredApiBaseUrl ? configuredApiBaseUrl.replace(/\/$/, "") : "";

export async function streamChat({
  characterId,
  message,
  conversationHistory,
  onChunk,
  onAudio,
  signal
}) {
  const customKey = localStorage.getItem("multiverse-chat:gemini-api-key")?.trim();
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(customKey ? { "x-gemini-api-key": customKey } : {})
    },
    body: JSON.stringify({ characterId, message, conversationHistory }),
    signal
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if ([400, 401, 403].includes(response.status) || data.code === "API_KEY_REQUIRED" || data.code === "INVALID_API_KEY") {
      window.dispatchEvent(new CustomEvent("gemini-api-key-required"));
    }
    throw new Error(data.error || "Unable to connect to the chat server.");
  }
  if (!response.body) throw new Error("Streaming is not supported by this connection.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const line = event.split("\n").find((part) => part.startsWith("data: "));
        if (!line) continue;
        const payload = line.slice(6);
        if (payload === "[DONE]") return;

        let parsed;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }
        if (parsed.code === "API_KEY_REQUIRED" || parsed.code === "INVALID_API_KEY") {
          window.dispatchEvent(new CustomEvent("gemini-api-key-required"));
        }
        if (parsed.error) throw new Error(parsed.error);
        if (typeof parsed.content === "string") onChunk(parsed.content);
        if (parsed.audio?.data && onAudio) onAudio(parsed.audio);
      }

      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function checkApiHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) throw new Error("Chat server health check failed.");
  return response.json();
}
