# Multiverse Chat

A React + Vite + Tailwind CSS frontend and Express backend for streaming AI conversations with six superhero-inspired personas.

## Requirements

- Node.js 20+ recommended
- npm
- A Gemini API key with API access configured

## Quick start (VS Code)

1. Extract this ZIP and open the `multiverse-chat` folder in VS Code.
2. In the integrated terminal, run:

   ```bash
   npm install
   npm run install:all
   ```

3. Copy `server/.env.example` to `server/.env` and set your key:

   ```dotenv
   GEMINI_API_KEY=your_gemini_api_key
   PORT=3001
   CLIENT_ORIGIN=http://localhost:5173
   ```

4. Start frontend and backend together from the project root:

   ```bash
   npm run dev
   ```

5. Open http://localhost:5173. Health check: http://localhost:3001/api/health

You can also run each app separately:
- Backend: `cd server && npm run dev`
- Frontend: `cd client && npm run dev`

## Features

- Marvel/DC filters and character search
- Six character-inspired personas
- Streaming responses using Server-Sent Events
- Separate chat history per character in browser localStorage
- Responsive dark UI and starter prompts
- Server-side persona configuration and API key

## Notes

- The characters and their conversations are unofficial fan-made AI interpretations, not affiliated with Marvel or DC.
- Character images are placeholders using icons; no copyrighted artwork is bundled.
- Chat history is stored in the current browser profile, not synced to an account.
- The server validates input and applies a basic per-process IP rate limit. Add authentication, stronger quotas, monitoring, and persistent storage before public deployment.
