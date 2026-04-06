# Low-costlasers-ai-Chatbot

## Deploy on Vercel (single URL — chat + API)

1. **Project root** in Vercel must be this folder (`Low-costlasers-ai-Chatbot`), **not** `frontend` only. If the root is set to `frontend`, `/api/*` will never hit the backend and the bot will not reply.

2. **Environment variables** (Vercel → Project → Settings → Environment Variables):
   - `OPENAI_API_KEY` — required. Without it, `/api/chat` returns `503` with `Chat service is not configured.`

3. **Frontend API URL**
   - Same deployment: leave `VITE_API_BASE_URL` unset (or empty). The app calls `/api/chat` on the same origin.
   - Separate frontend project: set `VITE_API_BASE_URL` at build time to your API origin (no trailing slash), e.g. `https://your-api.vercel.app`.

4. **Files used by Vercel**
   - `vercel.json` — build output, rewrites, API function duration
   - `api/index.js` — loads `backend/server.js` for all `/api/*` routes
   - Root `package.json` — installs Express/OpenAI deps so the serverless function can run

5. **Smoke test after deploy**
   - `GET https://YOUR_DEPLOYMENT.vercel.app/api/health` → JSON `status: online`
   - Send a message in the UI; if it fails, check Vercel **Functions** logs for errors.

## Local development

- Terminal 1: `cd backend && npm install && npm start` (default port 3000)
- Terminal 2: `cd frontend && npm install && npm run dev` (Vite proxies `/api` to localhost:3000)
