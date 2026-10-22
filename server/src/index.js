import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import chatRouter from "./routes/chat.js";

const app = express();
const port = Number(process.env.PORT || 3001);

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set; clients must provide a key in Settings.");
}

app.disable("x-powered-by");
const configuredOrigins = (process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes("*") || configuredOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin is not allowed"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "x-gemini-api-key"],
  optionsSuccessStatus: 204
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

if (!process.env.VERCEL) {
  app.listen(port, "127.0.0.1", () => {
    console.log(`Multiverse Chat API running on http://127.0.0.1:${port}`);
  });
}

export default app;
