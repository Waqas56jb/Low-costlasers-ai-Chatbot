# Low-costlasers-ai-Chatbot

## Deploy on Vercel (single URL — chat + API)

1. **Project root** in Vercel must be this folder (`Low-costlasers-ai-Chatbot`), **not** `frontend` only. If the root is set to `frontend`, `/api/*` will never hit the backend and the bot will not reply.

2. **Environment variables** (Vercel → Project → Settings → Environment Variables):
   - `OPENAI_API_KEY` — required. Without it, `/api/chat` returns `503` with `Chat service is not configured.`

3. **Frontend API URL**
   - Production builds default to **`https://low-costlasers-ai-chatbot.vercel.app`** (see `frontend/src/App.jsx`) so chat hits the live API even when `VITE_API_BASE_URL` is not set (e.g. [health check](https://low-costlasers-ai-chatbot.vercel.app/api/health)).
   - **Override:** set `VITE_API_BASE_URL` in Vercel (no trailing slash) if the API lives on another host or you use a custom domain.
   - **Same-origin only:** set `VITE_API_BASE_URL` to empty in Vercel so the app uses relative `/api/*` on whatever domain serves the UI.

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
