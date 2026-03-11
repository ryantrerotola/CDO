# CDO Path - Quick Start Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings > Database**
3. Click **Connection string** and grab both URLs:
   - **Transaction mode** (port 6543) → this is your `DATABASE_URL`
   - **Session mode** (port 5432) → this is your `DIRECT_URL`

## 2. Set Up Locally

```bash
cd cdo-app
npm install
cp .env.example .env
```

Edit `.env` with your Supabase URLs:

```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="any-random-string"
ANTHROPIC_API_KEY="sk-ant-..."
```

Push the schema to Supabase:

```bash
npm run db:push
```

Run locally:

```bash
npm run dev
```

## 3. Deploy to Vercel

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) and click **New Project**
3. Import your GitHub repo, set the **Root Directory** to `cdo-app`
4. Add these **Environment Variables** in the Vercel dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase transaction mode URL |
| `DIRECT_URL` | Your Supabase session mode URL |
| `NEXTAUTH_URL` | Your Vercel domain (e.g. `https://cdo-app.vercel.app`) |
| `NEXTAUTH_SECRET` | A random secret (run `openssl rand -base64 32`) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

5. Click **Deploy**

That's it. Vercel will run `npm run build` which triggers `prisma generate` automatically via the `postinstall` script.

## Pages

| Page | What it does |
|------|-------------|
| `/dashboard` | Daily briefing with top stories, action items, career progress, and trending topics |
| `/goals` | Create and track goals using templates or custom entries (habits, milestones, targets, projects) |
| `/content` | Browse curated articles, books, podcasts filtered by CDO skill categories |
| `/linkedin` | AI-powered LinkedIn post creator — get topic suggestions or write from scratch with voice matching |
| `/progress` | Career timeline, skill radar chart, activity heatmap, and goal stats |
| `/resources` | Library of books, certifications, communities, podcasts, and events |
| `/profile` | Upload your resume for AI gap analysis, set target companies, and rate your skills |

## Key Features

**Resume Analysis** — Upload your resume on the Profile page. AI identifies skill gaps and gives you a CDO Readiness Score with actionable recommendations.

**Target Companies** — Add companies on the Profile page. AI provides tech stack insights and learning recommendations tailored to each company.

**LinkedIn Content** — Go to the LinkedIn page. Either browse AI-suggested topics or type your own. Paste samples of your writing and the AI will match your voice.

## Notes

- AI features require a valid `ANTHROPIC_API_KEY` — everything else works without it
- Content feed ships with 12 pre-seeded items; `/api/content` POST fetches fresh content from RSS feeds
