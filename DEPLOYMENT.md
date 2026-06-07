# Deploying HireWave to Vercel

This is a React + TanStack Start app backed by Lovable Cloud (Supabase).

## 1. Push your code to GitHub

Create a new GitHub repo and push this project.

## 2. Import the repo on Vercel

- Go to <https://vercel.com/new>
- Import your repository
- Framework Preset: **Other**
- Build Command: `vite build`
- Output Directory: `.output/public` (TanStack Start default)
- Install Command: `bun install`

## 3. Set environment variables

In Vercel → Project → Settings → Environment Variables, add the following
(values are in your `.env`):

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://gysgyuzsachjoqtkpizp.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (from `.env`) |
| `VITE_SUPABASE_PROJECT_ID` | `gysgyuzsachjoqtkpizp` |
| `SUPABASE_URL` | same as VITE_SUPABASE_URL |
| `SUPABASE_PUBLISHABLE_KEY` | same as VITE_SUPABASE_PUBLISHABLE_KEY |

## 4. Adapter

This project's build defaults target the edge. If a Vercel build fails for
SSR adapter reasons, set the environment variable `NITRO_PRESET=vercel` in
Vercel project settings, then redeploy.

## 5. Deploy

Click **Deploy**. Subsequent pushes to `main` auto-deploy.
