export async function streamChat({
  characterId,
  message,
  conversationHistory,
  onChunk,
  signal
}) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream"
    },
    body: JSON.stringify({ characterId, message, conversationHistory }),
    signal
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
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
        if (parsed.error) throw new Error(parsed.error);
        if (typeof parsed.content === "string") onChunk(parsed.content);
      }

      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }
}
