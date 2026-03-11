# CDO Path - Quick Start Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)
- Anthropic API key (for AI features)

## Setup

```bash
cd cdo-app
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
DATABASE_URL="postgresql://user:password@localhost:5432/cdo_app"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"
ANTHROPIC_API_KEY="sk-ant-..."
```

Push the database schema:

```bash
npm run db:push
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

- AI features (resume analysis, LinkedIn posts, topic suggestions) require a valid `ANTHROPIC_API_KEY`
- The app works without the API key — AI features will show errors but everything else functions normally
- Content feed ships with 12 pre-seeded items; the `/api/content` POST endpoint fetches fresh content from RSS feeds
