# FarmIQ Deployment Guide

Deploy **frontend** on Vercel and **backend** on Render via GitHub Actions.

## Prerequisites

- GitHub repo connected and pushed
- [Vercel](https://vercel.com) account
- [Render](https://render.com) account

---

## 1. Deploy Backend on Render (do this first)

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect your GitHub repo and select the FarmIQ repository
3. Render will detect `render.yaml` and create the backend service
4. Add **GEMINI_API_KEY** in the service **Environment** tab
5. After the first deploy, copy your **Deploy Hook** URL:
   - Service → **Settings** → **Build & Deploy** → **Deploy Hook**

---

## 2. Deploy Frontend on Vercel

1. Go to [Vercel](https://vercel.com) → **Add New** → **Project**
2. Import your FarmIQ GitHub repo
3. Vercel auto-detects Vite. Use these settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Required**: Add environment variable `VITE_API_URL` = your Render URL (e.g. `https://farmiq-7qet.onrender.com`)

---

## 3. GitHub Actions Secrets

Add these in **GitHub** → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Where to get it | Required for |
|--------|-----------------|--------------|
| `VERCEL_TOKEN` | [Vercel Account Settings → Tokens](https://vercel.com/account/tokens) | Vercel deploy |
| `VERCEL_ORG_ID` | Vercel project → Settings → General | Vercel deploy |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General | Vercel deploy |
| `RENDER_DEPLOY_HOOK_URL` | Render service → Settings → Deploy Hook | Render deploy |

**Optional**: If you skip these secrets, the workflow still runs the build verification. Vercel and Render will auto-deploy when connected to GitHub (you can rely on their native integration instead of the Actions deploy steps).

---

## 4. How It Works

- **On every push/PR**: The workflow runs `npm run build` and verifies the backend starts
- **On push to main**: Deploys to Vercel (if secrets set) and triggers Render deploy (if hook set)
- **API routing**: Frontend calls Render directly using `VITE_API_URL` (CORS enabled on backend)

---

## Environment Variables

| Service | Variable | Notes |
|---------|----------|-------|
| Render | `GEMINI_API_KEY` | Required for Crop Doctor |
| Vercel | `VITE_API_URL` | **Required** — your Render backend URL, e.g. `https://farmiq-7qet.onrender.com` |
| Vercel | `VITE_APP_URL` | Optional — for SEO/canonical URLs (e.g. `https://your-app.vercel.app`) |
