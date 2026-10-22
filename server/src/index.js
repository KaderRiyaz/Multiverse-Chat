import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import chatRouter from "./routes/chat.js";

const app = express();
const port = Number(process.env.PORT || 3001);

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing from server/.env");
}

app.disable("x-powered-by");
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
}));
app.use(express.json({ limit: "32kb" }));

app.use("/api", rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", chatRouter);

app.use((err, _req, res, _next) => {
  console.error("Server error:", err.message);
  if (res.headersSent) return;
  res.status(500).json({ error: "An unexpected server error occurred." });
});

app.listen(port, () => {
  console.log(`Multiverse Chat API running on http://localhost:${port}`);
});
