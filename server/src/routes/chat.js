import { Router } from "express";
import OpenAI from "openai";
import { characters } from "../characters.js";

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_MESSAGE_LENGTH = 4000;

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

  const messages = [
    { role: "system", content: character.systemInstruction },
    ...history,
    { role: "user", content: message.trim() }
  ];

  const controller = new AbortController();
  req.on("aborted", () => controller.abort());

  try {
    const stream = await openai.chat.completions.create(
      {
        model: "gemini-3.8-flash",
        messages,
        stream: true,
        temperature: 0.8,
        max_tokens: 700
      },
      { signal: controller.signal }
    );

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    for await (const chunk of stream) {
      if (controller.signal.aborted || res.destroyed) break;
      const content = chunk.choices[0]?.delta?.content;
      if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }

    if (!controller.signal.aborted && !res.destroyed) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (error) {
    if (controller.signal.aborted || res.destroyed) return;
    console.error("Chat streaming error:", error.message);

    if (!res.headersSent) {
      return res.status(502).json({
        error: "The character could not respond. Please try again."
      });
    }

    res.write(`data: ${JSON.stringify({
      error: "The response was interrupted. Please try again."
    })}\n\n`);
    res.end();
  }
});

export default router;
