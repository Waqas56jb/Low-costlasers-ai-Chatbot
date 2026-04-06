# Low-costlasers-ai-Chatbot

## Deploy on Vercel (single URL — chat + API)

1. **Project root** in Vercel must be this folder (`Low-costlasers-ai-Chatbot`), **not** `frontend` only. If the root is set to `frontend`, `/api/*` will never hit the backend and the bot will not reply.

2. **Environment variables** (Vercel → Project → Settings → Environment Variables):
   - `OPENAI_API_KEY` — required. Without it, `/api/chat` returns `503` with `Chat service is not configured.`

3. **Frontend API URL**
   - **Dev + production** default to **`https://low-costlasers-ai-chatbot.vercel.app`** when `VITE_API_BASE_URL` is unset, so `npm run dev` works without a local backend (same behavior as Postman). See [health](https://low-costlasers-ai-chatbot.vercel.app/api/health).
   - **Local backend:** create `frontend/.env.local` with `VITE_API_BASE_URL=http://localhost:3000` and run `cd backend && npm start`.
   - **Override on Vercel:** set `VITE_API_BASE_URL` (no trailing slash) if the API is on another host or custom domain.
   - **Same-origin relative `/api`:** set `VITE_API_BASE_URL` to your site origin or leave unset on a monorepo deploy where API and UI share one URL (adjust `App.jsx` if you need empty string for relative paths only).

4. **Files used by Vercel**
   - `vercel.json` — build output, rewrites, API function duration
   - `api/index.js` — loads `backend/server.js` for all `/api/*` routes
   - Root `package.json` — installs Express/OpenAI deps so the serverless function can run

5. **Smoke test after deploy**
   - `GET https://YOUR_DEPLOYMENT.vercel.app/api/health` → JSON `status: online`
   - Send a message in the UI; if it fails, check Vercel **Functions** logs for errors.

## Local development

- **Frontend only (uses live Vercel API):** `cd frontend && npm install && npm run dev`
- **Full stack local:** Terminal 1: `cd backend && npm install && npm start` · create `frontend/.env.local` with `VITE_API_BASE_URL=http://localhost:3000`, then Terminal 2: `cd frontend && npm install && npm run dev`
