# HealthMate Deployment Guide

Deploy **backend first**, then **frontend** (frontend needs the backend URL).

## Prerequisites

- GitHub repo: [github.com/isjustabhi/healthmate](https://github.com/isjustabhi/healthmate)
- Supabase project with `schema.sql` already run
- Google Gemini API key

---

## Step 1: Deploy backend (Railway)

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select `isjustabhi/healthmate`
3. Open the service → **Settings**:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start` (default from `railway.toml`)
4. **Variables** → add:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` (or leave Railway's `PORT` if injected) |
| `DATABASE_URL` | Session pooler URI from Supabase Connect (encode `@` as `%40`) |
| `JWT_SECRET` | Strong random string (32+ chars) |
| `GOOGLE_API_KEY` | Your Gemini API key |
| `FRONTEND_URL` | `https://YOUR-APP.vercel.app` (update after Vercel deploy) |

5. **Settings → Networking → Generate Domain**  
   Copy the URL, e.g. `https://healthmate-production.up.railway.app`

6. Test: `https://YOUR-RAILWAY-URL/api/health-check` → should return `{"status":"ok",...}`

---

## Step 2: Deploy frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `healthmate`
2. **Root Directory:** `frontend`
3. **Environment Variables:**

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Your Railway URL (no trailing slash), e.g. `https://healthmate-production.up.railway.app` |
| `NEXT_PUBLIC_APP_NAME` | `HealthMate` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nvkianzrscbupzqmabid.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | From Supabase dashboard |

4. **Deploy**

5. Copy your Vercel URL, e.g. `https://healthmate.vercel.app`

---

## Step 3: Link frontend ↔ backend

1. Railway → backend service → **Variables**
2. Set `FRONTEND_URL` to your Vercel URL (exact, no trailing slash)
3. Redeploy backend (Railway usually auto-redeploys on variable change)

---

## Step 4: Verify production

- [ ] `https://YOUR-RAILWAY-URL/api/health-check` → OK
- [ ] `https://YOUR-VERCEL-URL` → landing page loads
- [ ] Sign up / login works
- [ ] Log metrics + symptom checker (needs `GOOGLE_API_KEY`)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | `FRONTEND_URL` on Railway must match Vercel URL exactly |
| DB connection fails | Use **pooler** `DATABASE_URL`, not `db.*` direct host; URL-encode password |
| 404 on Railway root | Normal for `/`; use `/api/health-check` |
| Auth works locally, not prod | Redeploy both; check `NEXT_PUBLIC_API_URL` at Vercel build time |

---

## Optional: custom domains

- Vercel: Project → Settings → Domains
- Railway: Service → Settings → Custom Domain
