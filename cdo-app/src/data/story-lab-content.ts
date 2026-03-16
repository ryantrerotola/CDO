/**
 * Story Lab static content — lessons, scenarios, and templates.
 */

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string; // markdown
  example?: { before: string; after: string };
}

export interface Scenario {
  id: string;
  title: string;
  prompt: string;
  context: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  slidesRequired: number;
  timeLimitMinutes: number;
}

export interface DeckTemplate {
  id: string;
  name: string;
  purpose: string;
  slides: { title: string; guidance: string }[];
}

// ── Module A: CDO Communication Framework ───────────────────────────

export const MODULE_A_LESSONS: Lesson[] = [
  {
    id: "a1",
    moduleId: "A",
    title: "The Minto Pyramid Principle",
    content: `**Lead with the conclusion.** Executives don't read bottom-up — they read top-down.

The Minto Pyramid structures communication in three layers:
1. **Situation** — What's the context? (1 sentence)
2. **Complication** — What changed or went wrong? (1 sentence)
3. **Resolution** — What should we do? (Your recommendation)

Then support your resolution with grouped, logical arguments.

**The CDO version:** Every data initiative pitch should open with the business outcome, not the technical architecture.`,
    example: {
      before: `"We've been evaluating several data platforms including Snowflake, Databricks, and BigQuery. Each has different pricing models, feature sets, and integration capabilities. Our current warehouse is reaching capacity and performance is degrading. The team has conducted a 6-week evaluation..."`,
      after: `"We should migrate to Snowflake by Q3 to cut query costs 40% and unblock the self-serve analytics initiative. Here's why and how."`,
    },
  },
  {
    id: "a2",
    moduleId: "A",
    title: "The So-What Test",
    content: `Every slide, every paragraph, every data point must pass the **So-What Test**.

If someone reads your content and says "So what?" — you've failed.

**How to apply it:**
- After writing a slide title, ask: "So what does this mean for the business?"
- After showing a chart, ask: "So what action should we take?"
- After presenting a finding, ask: "So what's the implication?"

**The fix:** Add the implication directly. Don't make the audience do the thinking.`,
    example: {
      before: `"Data quality scores improved from 72% to 89%."`,
      after: `"Data quality improved to 89%, reducing downstream report errors by 60% and saving Finance 12 hours/week in manual reconciliation."`,
    },
  },
  {
    id: "a3",
    moduleId: "A",
    title: "Audience-First Framing",
    content: `**Different audiences need different frames:**

| Audience | They care about | Frame your message as |
|----------|----------------|----------------------|
| CEO | Revenue, growth, competitive advantage | "This drives $X revenue / reduces risk by Y%" |
| CFO | Cost, ROI, efficiency | "This saves $X / payback in Y months" |
| Board | Risk, compliance, strategic direction | "This mitigates X risk / positions us for Y" |
| CTO | Architecture, scalability, integration | "This reduces tech debt / enables X capability" |
| Business VP | Their KPIs, their team's pain | "This gives your team X / reduces Y hours of manual work" |

**CDO trap:** Presenting to the CFO about "data mesh architecture" when they want to hear "30% reduction in analytics infrastructure cost."`,
  },
];

// ── Module D: Scenario Prompts ──────────────────────────────────────

export const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    title: "Budget Justification",
    prompt: "The CFO has asked you to justify a $2M increase in the data platform budget for next year. You have 3 slides to make the case. Focus on ROI, not features.",
    context: "Your current platform costs $3M/year. You need $5M to migrate to a modern lakehouse architecture, hire 2 data engineers, and implement a data catalog.",
    difficulty: "intermediate",
    slidesRequired: 3,
    timeLimitMinutes: 15,
  },
  {
    id: "s2",
    title: "Data Breach Response",
    prompt: "A data breach exposed 50,000 customer records. The board wants an emergency briefing in 3 slides: what happened, what we're doing, and how we prevent it.",
    context: "The breach was caused by a misconfigured S3 bucket. No financial data was exposed, but names and email addresses were. You discovered it 48 hours ago via your data monitoring tools.",
    difficulty: "advanced",
    slidesRequired: 3,
    timeLimitMinutes: 15,
  },
  {
    id: "s3",
    title: "Self-Serve Analytics Rollout",
    prompt: "Present a proposal to the executive team for a self-serve analytics platform. Address the business case, the approach, and the timeline.",
    context: "Currently, the data team handles ~200 ad-hoc report requests per month, with an average 5-day turnaround. Business users are frustrated. You want to implement a governed self-serve layer.",
    difficulty: "beginner",
    slidesRequired: 3,
    timeLimitMinutes: 15,
  },
  {
    id: "s4",
    title: "AI Strategy Proposal",
    prompt: "The CEO wants to understand your AI strategy. Create a 3-slide briefing covering: the opportunity, the approach, and the guardrails.",
    context: "Your company is a mid-size financial services firm. Competitors are adopting AI for fraud detection and customer personalization. You have good data foundations but no production ML models yet.",
    difficulty: "intermediate",
    slidesRequired: 3,
    timeLimitMinutes: 15,
  },
  {
    id: "s5",
    title: "Data Team Restructuring",
    prompt: "You're proposing a shift from a centralized data team to a hub-and-spoke model. Present the case to the COO in 3 slides.",
    context: "Current team of 25 is centralized under you. Business units complain about slow turnaround. You want to embed data partners in each BU while maintaining central governance and platform teams.",
    difficulty: "advanced",
    slidesRequired: 3,
    timeLimitMinutes: 15,
  },
  {
    id: "s6",
    title: "Quarterly Business Review",
    prompt: "Present a QBR for the data organization. Cover: what we delivered, what's blocked, and what's next.",
    context: "Last quarter: launched data catalog (60% adoption), migrated 3 data pipelines to Airflow, hired 2 analytics engineers. Blocked: data quality initiative delayed by vendor contract issues. Next: self-serve analytics pilot.",
    difficulty: "beginner",
    slidesRequired: 3,
    timeLimitMinutes: 15,
  },
];

// ── Module B: Deck Templates ────────────────────────────────────────

export const DECK_TEMPLATES: DeckTemplate[] = [
  {
    id: "t1",
    name: "Insight Briefing",
    purpose: "Share a key finding or data insight with executives",
    slides: [
      { title: "The Insight (assertive title)", guidance: "State the conclusion upfront. One sentence that tells them what they need to know." },
      { title: "The Evidence", guidance: "Supporting data — 1-2 charts max. Choose the chart that best proves your point." },
      { title: "The Implication", guidance: "What should we do about this? Clear recommendation with next steps." },
    ],
  },
  {
    id: "t2",
    name: "Strategy Proposal",
    purpose: "Propose a new data initiative or strategic direction",
    slides: [
      { title: "The Opportunity", guidance: "What's the business problem or opportunity? Frame in business terms, not data terms." },
      { title: "The Approach", guidance: "Your recommended solution — what, how, who. Keep it high-level." },
      { title: "The Investment & Return", guidance: "What it costs, what we get back, and when. ROI in terms the CFO understands." },
      { title: "The Ask", guidance: "Exactly what you need: budget, headcount, timeline, executive sponsorship." },
    ],
  },
  {
    id: "t3",
    name: "Board Update",
    purpose: "Quarterly data strategy update for the board of directors",
    slides: [
      { title: "Executive Summary", guidance: "3 bullets max: biggest win, biggest risk, one ask. Board members skim." },
      { title: "Progress Against Strategy", guidance: "Traffic light status for each strategic initiative. Green/yellow/red, no gray." },
      { title: "Risk & Compliance", guidance: "Data privacy, AI governance, regulatory updates. What the board needs to know." },
      { title: "Forward Look", guidance: "Next quarter priorities and any decisions needed from the board." },
    ],
  },
  {
    id: "t4",
    name: "QBR (Quarterly Business Review)",
    purpose: "Review data team performance and plan ahead",
    slides: [
      { title: "What We Delivered", guidance: "Top 3-5 outcomes, framed as business impact not technical output." },
      { title: "What's Blocked", guidance: "Honest about obstacles. Don't hide problems — present them with proposed solutions." },
      { title: "What's Next", guidance: "Next quarter priorities, aligned to business goals. Show the connection." },
    ],
  },
  {
    id: "t5",
    name: "Initiative Post-Mortem",
    purpose: "Review a completed initiative — what worked, what didn't",
    slides: [
      { title: "What We Set Out To Do", guidance: "Original goals and success criteria. Were they clear?" },
      { title: "What Actually Happened", guidance: "Results vs. expectations. Be honest about both wins and misses." },
      { title: "Lessons Learned", guidance: "3 specific, actionable lessons. Not platitudes — things we'll do differently." },
    ],
  },
];

export const MODULE_IDS = ["A", "B", "C", "D", "E"] as const;
export const MODULE_NAMES: Record<string, string> = {
  A: "Communication Framework",
  B: "Deck Anatomy",
  C: "AI Slide Feedback",
  D: "Scenario Prompts",
  E: "Delivery Coaching",
};
