# CDO Career Growth Engine — Build Plan

## Codebase Audit Summary

### What Exists Today
- **Tech**: Next.js 16 + Tailwind + shadcn/ui + Prisma/Postgres + NextAuth (credentials) + Anthropic SDK
- **Pages**: Dashboard, Goals, Content Feed, Progress, Profile, LinkedIn Post Generator, Resources
- **DB Models**: User, Goal/GoalEntry, Content/UserContentInteraction, Resume, TargetCompany, TrackedPodcast, CareerMilestone, Account/Session
- **AI (lib/ai.ts)**: Article summarization, resume analysis, goal recommendations, company intelligence, daily insight, LinkedIn post generation — all using claude-sonnet-4-20250514
- **State**: Zustand store for client-side profile/goals, API routes for persistence
- **Skill Assessment**: 6-domain model (technical, dataGovernance, aiMl, businessAcumen, leadership, stakeholderManagement) — stored in User.skillAssessment JSON
- **Auth**: Email/password credentials via NextAuth v5, JWT sessions

### What's Missing (mapped to the 3 pillars)
- **Gap Engine**: No job ingestion, no JD parsing, no skill extraction pipeline, no market-frequency analysis, no gap narratives, no trend tracking
- **Skill Graph**: No React Flow, no taxonomy data model, no node/edge schema, no visual graph, no progressive unlock
- **Story Lab**: Nothing — no modules, no slide editor, no AI feedback, no scenario library, no delivery coaching

### What Can Be Reused
- Auth system (works, just needs invite-code gate)
- Profile page + resume analysis (extends naturally into Gap Engine)
- Existing skill domains (map to the 7-cluster taxonomy with minor expansion)
- AI helper pattern in lib/ai.ts (same pattern for all new Claude calls)
- UI components (Card, Button, Badge, Progress, Input, Dialog)
- Dashboard layout (add new summary widgets)
- Goal system (link goals to Skill Graph nodes)

---

## Taxonomy Mapping

Current 6 domains → New 7 clusters:

| Current Domain | New Cluster(s) |
|---|---|
| technical | Technical Depth |
| dataGovernance | Governance & Risk |
| aiMl | Technical Depth (partial) |
| businessAcumen | Financial Acumen |
| leadership | Strategic Leadership + Organizational Design |
| stakeholderManagement | Communication & Influence |
| — (new) | Data Products |

The new canonical taxonomy (7 clusters, 5 skills each = 35 skills) will be stored as seed data and as a Prisma model for the Skill Graph.

---

## Build Phases

### Phase 0 — Foundation (do first, unblocks everything)

**0a. Skill Taxonomy Data Model**
- New Prisma models: `SkillCluster`, `Skill`, `UserSkillProficiency`
- Seed the 7 clusters × 5 skills from the spec
- Migrate existing 6-domain skillAssessment → new 35-skill proficiency model
- Add `SkillCluster.id` references to Goal, Content, and future Gap data

Files: `prisma/schema.prisma`, `prisma/seed.ts`, `src/data/taxonomy.ts`

**0b. Invite-Only Auth**
- Add `inviteCode` field to signup
- Server-side validation against a list of valid codes (env var or DB table)
- Block public registration

Files: `src/app/(auth)/signup/page.tsx`, `src/app/api/auth/signup/route.ts`

**0c. Install New Dependencies**
- `@xyflow/react` (React Flow v12) for Skill Graph
- Job search API client (Adzuna SDK or fetch wrapper)

---

### Phase 1 — Gap Engine

**1a. Job Ingestion Pipeline**
- New model: `JobPosting` (title, company, location, description, source, sourceId, skills JSON, fetchedAt)
- New model: `JobSkillFrequency` (skillId, frequency %, period, calculatedAt)
- API route: `POST /api/gap-engine/ingest` — fetches CDO/VP Data jobs from Adzuna API
- Cron trigger: `/api/cron/refresh-jobs` (weekly, Vercel cron)
- Deduplication by sourceId

Files: `prisma/schema.prisma`, `src/app/api/gap-engine/ingest/route.ts`, `src/app/api/cron/refresh-jobs/route.ts`

**1b. NLP Skill Extraction**
- New AI function: `extractSkillsFromJD(description: string)` in `src/lib/ai.ts`
- Claude parses JD → returns array of canonical skill IDs from taxonomy
- Store extracted skills in `JobPosting.skills` JSON
- Batch processing: extract on ingest, not on read

**1c. Gap Analysis Engine**
- New AI function: `generateGapNarrative(gaps: GapData[])`
- API route: `GET /api/gap-engine/analysis` — computes user's top gaps
- Algorithm: for each of 35 skills, compute `gapScore = marketFrequency × (5 - userProficiency) / 5`
- Return ranked list, default top 5
- Natural language summary card via Claude

**1d. Gap Engine UI**
- New page: `/gap-engine`
- Top 5 gaps with market frequency %, user proficiency, severity score
- Claude-generated narrative card ("Financial acumen appears in 73%...")
- Each gap links to Skill Graph node
- Trend sparklines (skill frequency over last 4 ingestion periods)
- "Ask about this gap" → contextual Claude chat (streaming)

Files: `src/app/(app)/gap-engine/page.tsx`, `src/components/gap-engine/`

**1e. Contextual Chat**
- Streaming chat component using Claude API with `stream: true`
- Pre-loaded with gap context as system message
- Reusable component (also used in Skill Graph and Story Lab)

Files: `src/components/ai-chat.tsx`, `src/app/api/chat/route.ts`

---

### Phase 2 — Skill Graph

**2a. Graph Data Structure**
- Prisma models for edges: `SkillEdge` (fromSkillId, toSkillId, edgeType: "ADJACENT" | "PREREQUISITE")
- Seed adjacency/prerequisite data for all 35 skills
- User proficiency levels: NOT_STARTED / IN_PROGRESS / PROFICIENT / EXPERT

**2b. React Flow Visualization**
- New page: `/skill-graph`
- Cluster nodes (7) with skill nodes (5 each) arranged radially
- Node visual states: grey (not started), blue (in progress), green (proficient), gold (expert)
- Market frequency ring (width scales with Gap Engine frequency data)
- Gap flag badge on nodes where proficiency low + demand high
- Progressive disclosure: first-time users see top 3 clusters, rest unlock as proficiency grows

**2c. Node Interaction**
- Click node → detail panel (description, behavioral anchors by level, linked resources, market frequency, gap flag)
- "What should I work on next?" button → Claude recommendation based on current graph state + gap data
- Progress log: link to GoalEntry records for this skill
- Time-lapse slider: show graph state changes over time (requires snapshots or computed from GoalEntry dates)

**2d. Export**
- PNG export via `html-to-image` or React Flow's built-in export

Files: `src/app/(app)/skill-graph/page.tsx`, `src/components/skill-graph/`, `src/lib/graph-layout.ts`

---

### Phase 3 — Story Lab

**3a. Module Framework**
- New page: `/story-lab` with tab/module navigation (A–E)
- New models: `StoryLabProgress` (userId, moduleId, lessonId, completedAt), `SlideSubmission` (userId, title, body, chartIntent, feedback JSON, iteration)
- Module completion tracking

**3b. Module A — CDO Communication Framework**
- Interactive lesson component: read → example → practice
- Minto Pyramid content (hardcoded lesson data)
- Before/after deck examples (static content with annotations)
- Practice scenario: user writes a conclusion-first memo, Claude evaluates

**3c. Module B — Deck Anatomy**
- 5 structural templates: insight briefing, strategy proposal, board update, QBR, post-mortem
- Each template: annotated slide-by-slide breakdown
- Layout principles (one idea/slide, assertive titles, chart selection)
- Before/after slide library

**3d. Module C — AI Slide Feedback**
- Simple slide editor: title input, body textarea, chart intent selector
- `POST /api/story-lab/feedback` → Claude evaluates:
  - Is the title assertive?
  - One clear point?
  - Right chart choice?
  - Visual hierarchy?
- Returns specific feedback + revised version
- Back-and-forth iteration (conversation-style)
- Deck mode: string slides together, narrative coherence check

**3e. Module D — Scenario Prompts**
- Scenario library (seed data: budget justification, data breach response, self-serve rollout, etc.)
- Weekly prompt surfaced on dashboard
- Timed mode: 15-minute draft of 3-slide briefing
- Claude evaluates submission

**3f. Module E — Delivery Coaching**
- Script/talking points generator from deck content
- Audio recording via MediaRecorder API
- Send audio → Claude transcription (or Whisper API) → feedback
- Mobile-friendly UI

Files: `src/app/(app)/story-lab/page.tsx`, `src/components/story-lab/`, `src/app/api/story-lab/`, `src/data/story-lab-content.ts`

---

### Phase 4 — Cross-Cutting Features

**4a. CDO Readiness Score**
- Composite score (0–100): weighted average of:
  - Gap closure progress (40%) — how many top gaps have improved
  - Skill Graph progress (30%) — % of skills at PROFICIENT+
  - Story Lab completions (30%) — modules completed
- Display on dashboard and progress page

**4b. Dashboard Enhancement**
- Replace current "Today's Actions" with unified focus card (top 1–2 recommended actions from Gap Engine + Skill Graph + Story Lab)
- Activity log widget
- CDO Readiness Score prominently displayed
- Weekly Story Lab prompt

**4c. AI Learning Plans**
- `POST /api/learning-plan` → Claude generates 30/60/90 day plan
- Inputs: Gap Engine top gaps, Skill Graph state, Story Lab progress
- Output: structured week-by-week plan with specific actions
- Display on a new `/learning-plan` page

**4d. Resource Library Enhancement**
- Index existing resources to skill taxonomy
- Filter resources by skill cluster
- Surface relevant resources on Skill Graph node detail panels

---

### Phase 5 — Navigation & Polish

- Add nav items: Gap Engine, Skill Graph, Story Lab
- Mobile nav updates
- Responsive layouts for all new pages
- Loading states, error boundaries
- Dark mode verification for all new components

---

## Build Order & Dependencies

```
Phase 0 (Foundation)     ← START HERE
  ├── 0a Taxonomy        ← unblocks Phase 1, 2, 4
  ├── 0b Invite auth     ← independent
  └── 0c Dependencies    ← unblocks Phase 2

Phase 1 (Gap Engine)     ← depends on 0a
  ├── 1a Job ingestion   ← first
  ├── 1b Skill extraction← depends on 1a
  ├── 1c Analysis engine ← depends on 1b
  ├── 1d Gap UI          ← depends on 1c
  └── 1e Chat component  ← parallel, reused later

Phase 2 (Skill Graph)    ← depends on 0a, 0c
  ├── 2a Data structure  ← first
  ├── 2b Visualization   ← depends on 2a
  ├── 2c Interaction     ← depends on 2b
  └── 2d Export          ← last

Phase 3 (Story Lab)      ← independent of 1, 2
  ├── 3a Framework       ← first
  ├── 3b Module A        ← sequential
  ├── 3c Module B        ← sequential
  ├── 3d Module C        ← depends on 1e (chat)
  ├── 3e Module D        ← sequential
  └── 3f Module E        ← last (most complex)

Phase 4 (Cross-cutting)  ← depends on 1, 2, 3
Phase 5 (Polish)         ← last
```

## Key Technical Decisions

1. **Job API**: Adzuna (free tier: 250 calls/month, sufficient for weekly refresh of ~50 CDO postings)
2. **Embeddings**: Defer pgvector/Pinecone — start with Claude-based skill extraction (structured output, not semantic search). Add vector search later if needed for JD similarity.
3. **Streaming Chat**: Use Anthropic SDK streaming + ReadableStream in Next.js route handler
4. **React Flow**: @xyflow/react v12, custom nodes for cluster/skill/experience types
5. **Audio**: MediaRecorder API for browser recording, send as blob to API
6. **Cron**: Vercel cron for weekly job refresh (`vercel.json` schedule)

## Estimated New Models (Prisma)

```
SkillCluster     (id, name, description, order)
Skill            (id, clusterId, name, description, anchors JSON, order)
SkillEdge        (id, fromSkillId, toSkillId, edgeType)
UserSkillProficiency (id, userId, skillId, level, updatedAt)
JobPosting       (id, title, company, location, description, source, sourceId, skills JSON, fetchedAt)
JobSkillFrequency (id, skillId, frequency, period, calculatedAt)
StoryLabProgress (id, userId, moduleId, lessonId, completedAt)
SlideSubmission  (id, userId, slides JSON, feedback JSON, iteration, createdAt)
InviteCode       (id, code, usedBy, usedAt, createdAt)
```
