import { Router } from "express";
import { characters } from "../characters.js";

const router = Router();
const GEMINI_MODEL = "gemini-3.8-live";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_MESSAGE_LENGTH = 4000;
function setSseHeaders(res) {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
}

async function decodeWebSocketMessage(data) {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data.toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
  }
  if (data && typeof data.arrayBuffer === "function") {
    return Buffer.from(await data.arrayBuffer()).toString("utf8");
  }
  return String(data);
}

async function streamLiveChat({ character, history, message, res, signal, apiKey }) {
  const endpoint = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";
  const socket = new WebSocket(`${endpoint}?key=${encodeURIComponent(apiKey)}`);
  let finished = false;
  let requestText = "";

  const close = () => {
    if (socket.readyState < WebSocket.CLOSING) socket.close();
  };
  signal.addEventListener("abort", close, { once: true });

  try {
    await new Promise((resolve, reject) => {
      let settled = false;
      const timeout = setTimeout(() => {
        rejectOnce(new Error("Gemini Live response timed out after 45 seconds."));
        close();
      }, 45_000);
      const rejectOnce = (error) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          reject(error);
        }
      };

      socket.addEventListener("open", () => {
        console.log(`[Live] WebSocket opened (${GEMINI_MODEL})`);
        socket.send(JSON.stringify({
          setup: {
            model: `models/${GEMINI_MODEL}`,
            generationConfig: {
              responseModalities: ["AUDIO"],
              temperature: 0.8,
              maxOutputTokens: 700
            },
            outputAudioTranscription: {},
            systemInstruction: { parts: [{ text: character.systemInstruction }] }
          }
        }));
        console.log("[Live] Setup message sent");
      });

      socket.addEventListener("message", async (event) => {
        let payload;
        try {
          payload = JSON.parse(await decodeWebSocketMessage(event.data));
        } catch {
          console.error("[Live] Could not decode WebSocket message");
          return;
        }
        if (payload.error) {
          console.error("[Live] API error:", JSON.stringify(payload.error));
          rejectOnce(new Error(payload.error.message || "Gemini Live session failed."));
          return;
        }
        if (payload.setupComplete) {
          console.log("[Live] Setup acknowledged");
          const turns = [
            ...history.map(({ role, content }) => ({
              role: role === "assistant" ? "model" : "user",
              parts: [{ text: content }]
            })),
            { role: "user", parts: [{ text: message }] }
          ];
          socket.send(JSON.stringify({ clientContent: { turns, turnComplete: true } }));
          console.log("[Live] Conversation sent");
          return;
        }
        const serverContent = payload.serverContent;
        const text = serverContent?.outputTranscription?.text
          ?? serverContent?.modelTurn?.parts?.map((part) => part.text || "").join("");
        if (typeof text === "string" && text) {
          const delta = text.startsWith(requestText) ? text.slice(requestText.length) : text;
          requestText = text.startsWith(requestText) ? text : `${requestText}${text}`;
          if (delta) res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
        if (serverContent?.turnComplete) {
          finished = true;
          settled = true;
          clearTimeout(timeout);
          console.log("[Live] Turn complete");
          resolve();
        }
      });

      socket.addEventListener("error", (event) => {
        console.error("[Live] WebSocket error:", event?.message || "unknown error");
        rejectOnce(new Error("Gemini Live connection failed."));
      });
      socket.addEventListener("close", (event) => {
        console.log(`[Live] WebSocket closed code=${event.code} reason=${event.reason || "none"}`);
        if (!finished && !settled) {
          const reason = event.reason ? ` (${event.reason})` : "";
          rejectOnce(new Error(`Gemini Live connection closed early${reason}.`));
        }
      });
    });
  } finally {
    close();
    signal.removeEventListener("abort", close);
  }
}

router.post("/chat", async (req, res) => {
  const { characterId, message, conversationHistory } = req.body ?? {};

  if (
    typeof characterId !== "string" ||
    typeof message !== "string" ||
    !message.trim() ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return res.status(400).json({
      error: "Provide a characterId and a message up to 4000 characters."
    });
  }

  const character = characters.find((item) => item.id === characterId);
  if (!character) {
    return res.status(400).json({ error: "Unknown character." });
  }

  if (conversationHistory !== undefined && !Array.isArray(conversationHistory)) {
    return res.status(400).json({ error: "conversationHistory must be an array." });
  }

  const history = (conversationHistory ?? [])
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((item) =>
      item &&
      ["user", "assistant"].includes(item.role) &&
      typeof item.content === "string" &&
      item.content.length <= MAX_HISTORY_MESSAGE_LENGTH
    )
    .map(({ role, content }) => ({ role, content }));

  // const apiKey = req.get("x-gemini-api-key")?.trim() || process.env.GEMINI_API_KEY?.trim();
  const apiKey = req.get("x-gemini-api-key")?.trim();
  if (!apiKey) {
    return res.status(400).json({
      code: "API_KEY_REQUIRED",
      error: "Add a Gemini API key in Settings before starting a chat."
    });
  }

  const controller = new AbortController();
  req.on("aborted", () => controller.abort());

  try {
    setSseHeaders(res);
    await streamLiveChat({ character, history, message: message.trim(), res, signal: controller.signal, apiKey });
    if (!res.destroyed && !controller.signal.aborted) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (error) {
    if (controller.signal.aborted || res.destroyed) return;
    console.error("Chat streaming error:", error.message);

    if (!res.headersSent) {
      return res.status(502).json({
        error: "Gemini Live could not complete the response. Please try again."
      });
    }
    const keyError = /api key|api_key|unauthenticated|permission denied|invalid argument/i.test(error.message);
    res.write(`data: ${JSON.stringify({
      code: keyError ? "INVALID_API_KEY" : "CHAT_ERROR",
      error: keyError ? "That Gemini API key was rejected. Open Settings and replace it." : "The response was interrupted. Please try again."
    })}\n\n`);
    res.end();
  }
});

export default router;
