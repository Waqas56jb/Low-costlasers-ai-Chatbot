# Low-costlasers-ai-Chatbot

## Deploy on Vercel (single URL — chat + API)

1. **Project root** in Vercel must be this folder (`Low-costlasers-ai-Chatbot`), **not** `frontend` only. If the root is set to `frontend`, `/api/*` will never hit the backend and the bot will not reply.

2. **Environment variables** (Vercel → Project → Settings → Environment Variables):
   - `OPENAI_API_KEY` — required. Without it, `/api/chat` returns `503` with `Chat service
   
    is not configured.`

3. **Frontend API URL**
   - **Vercel Production** (`VERCEL_ENV=production`): leave `VITE_API_BASE_URL` unset → same-origin **`/api/*`** (efficient).
   - **Vercel Preview** (PR/branch URLs like `*-6ss9.vercel.app`): the build sets `VITE_VERCEL_ENV=preview` → the app calls **`https://low-costlasers-ai-chatbot.vercel.app`** automatically so chat works even when preview returns **404** on `/api` (serverless not wired on that URL).
   - **Local `npm run dev`:** defaults to that same production API when unset. [Health check](https://low-costlasers-ai-chatbot.vercel.app/api/health).
   - **Local backend:** `frontend/.env.local` → `VITE_API_BASE_URL=http://localhost:3000` and `cd backend && npm start`.
   - **Override:** set `VITE_API_BASE_URL` on Vercel for any environment if the API lives elsewhere.

4. **Files used by Vercel**
   - `vercel.json` — `installCommand` (root + `frontend` deps), `buildCommand` (`vite build` in `frontend/`), `outputDirectory` → `frontend/dist`, rewrites (API + static files + SPA)
   - `api/index.js` — loads `backend/server.js` for all `/api/*` routes
   - Root `package.json` — API dependencies (Express, OpenAI); `frontend/package.json` — Vite + React

5. **Smoke test after deploy**
   - `GET https://YOUR_DEPLOYMENT.vercel.app/api/health` → JSON `status: online`
   - Send a message in the UI; if it fails, check Vercel **Functions** logs for errors.

### Build fails on install (e.g. exit code 254)

- **Root Directory** in Vercel → Settings → General must be the **repository root** (the folder that contains `package.json`, `vercel.json`, `frontend/`, `api/`, and `backend/`). If Root Directory is set to `frontend` only, installs and API routes will break.
- In Vercel → Settings → **Build & Development**, clear **Install Command** / **Build Command** / **Output Directory** dashboard overrides so **`vercel.json`** is used (`install` → root + frontend, `build` → `frontend` Vite build, output → `frontend/dist`).
- Commit **`package-lock.json`** at the repo root and in `frontend/` so installs are reproducible.

## Local development

- **Frontend only (uses live Vercel API):** `cd frontend && npm install && npm run dev`
- **Full stack local:** Terminal 1: `cd backend && npm install && npm start` · create `frontend/.env.local` with `VITE_API_BASE_URL=http://localhost:3000`, then Terminal 2: `cd frontend && npm install && npm run dev`
