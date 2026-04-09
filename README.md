# Intugine SEO Library — Next.js App

Programmatic SEO app serving `intugine.com/library/*` via Framer Multi Site rewrite.

## Stack
- Next.js 15 (App Router, SSG + ISR)
- Tailwind CSS
- Deployed on Vercel
- Content pulled from Base44 Command Center DB

## URL Structure
- `/library` → index of all resources
- `/library/[slug]` → individual SEO page

## Setup

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
Create `.env.local`:
```
BASE44_API_KEY=<get from Rey>
```

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Vercel
- Connect GitHub repo `reymrinal/intuginewebsite` to Vercel
- Add env var `BASE44_API_KEY` in Vercel dashboard
- Deploy — done

### 5. Framer Multi Site Rule
In Framer dashboard → intugine.com domain → Multi Site tab:
- Path: `/library/*`
- Type: External
- Target: `https://intuginewebsite.vercel.app/library/*`
- Publish

## Content Updates
Pages are fetched from Base44 with ISR (1 hour cache).
To force immediate update: trigger a Vercel redeploy webhook (Rey handles this automatically when pages hit `reviewed` status).
