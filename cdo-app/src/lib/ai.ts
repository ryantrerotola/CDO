import Anthropic from "@anthropic-ai/sdk";
import type { ResumeAnalysis, SkillAssessment } from "@/types";

const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

function parseJsonResponse(text: string): unknown {
  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const cleaned = fenceMatch ? fenceMatch[1] : text.trim();
  return JSON.parse(cleaned);
}

export async function summarizeArticle(
  title: string,
  content: string
): Promise<{ summary: string; category: string; whyItMatters: string }> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Analyze this article for someone aspiring to become a Chief Data Officer.

Title: ${title}
Content: ${content}

Respond in JSON with:
- "summary": 2-3 sentence summary
- "category": one of DATA_STRATEGY, AI_ML, ANALYTICS, DATA_ETHICS, LEADERSHIP, INDUSTRY_NEWS, TECHNICAL
- "whyItMatters": one sentence explaining why this matters for a CDO career path`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return parseJsonResponse(text) as { summary: string; category: string; whyItMatters: string };
}

export async function analyzeResume(
  resumeText: string
): Promise<ResumeAnalysis> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `Analyze this resume for someone who wants to become a Chief Data Officer.
Identify their current skills, experience, education, and certifications.
Then perform a gap analysis against typical CDO requirements.

Resume:
${resumeText}

Respond in JSON matching this structure:
{
  "skills": ["skill1", "skill2"],
  "experience": [{"title": "...", "company": "...", "duration": "...", "relevance": "high|medium|low"}],
  "education": [{"degree": "...", "institution": "...", "year": "..."}],
  "certifications": ["cert1"],
  "gaps": [{"area": "...", "importance": "critical|important|nice-to-have", "recommendation": "..."}],
  "overallReadiness": 65,
  "suggestedSkillAssessment": {
    "technical": 7,
    "dataGovernance": 4,
    "aiMl": 6,
    "businessAcumen": 5,
    "leadership": 3,
    "stakeholderManagement": 4
  },
  "strengthsSummary": "...",
  "needsWorkSummary": "...",
  "missingSummary": "..."
}

IMPORTANT fields:
- "strengthsSummary": Write 2-3 sentences in second person ("You have...") explaining what this person is doing well and why it positions them for a CDO role. Connect their experience, skills, and education into a coherent narrative. Be specific — reference their actual roles, companies, and skills.
- "needsWorkSummary": Write 2-3 sentences in second person explaining the areas that need development. Tie them together — e.g., if they need both governance and stakeholder management, explain how those connect. Be encouraging but honest.
- "missingSummary": Write 2-3 sentences in second person about critical gaps that must be addressed. Explain why these are blocking and what the path forward looks like. If there are no critical gaps, write a brief encouraging note.

The suggestedSkillAssessment values should be 1-10 based on what the resume demonstrates.
The overallReadiness should be 0-100 representing how ready they are for a CDO role.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return parseJsonResponse(text) as ResumeAnalysis;
}

export async function getCompanyIntelligence(
  companyName: string,
  industry?: string
): Promise<{
  techStack: string[];
  dataMaturity: string;
  cdoInfo: string;
  learningRecommendations: string[];
}> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Provide intelligence about ${companyName}${industry ? ` (${industry} industry)` : ""} relevant to someone aspiring to be their Chief Data Officer.

Respond in JSON:
{
  "techStack": ["tools and platforms they likely use"],
  "dataMaturity": "early|developing|advanced|leader",
  "cdoInfo": "Brief info about their current data leadership",
  "learningRecommendations": ["specific skills or knowledge to develop for this company"]
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return parseJsonResponse(text) as { techStack: string[]; dataMaturity: string; cdoInfo: string; learningRecommendations: string[] };
}

export async function generateDailyInsight(
  skills: SkillAssessment,
  goals: string[],
  recentContent: string[]
): Promise<{ insight: string; recommendation: string }> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `As a CDO career coach, provide a daily insight for someone with these skills (1-10 scale):
${JSON.stringify(skills)}

Their active goals: ${goals.join(", ")}
Recent content they've read: ${recentContent.join(", ")}

Respond in JSON:
{
  "insight": "One actionable insight for today (1-2 sentences)",
  "recommendation": "One specific thing they should do today"
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return parseJsonResponse(text) as { insight: string; recommendation: string };
}

export async function suggestLinkedInTopics(context: {
  currentRole?: string;
  industry?: string;
  skills?: SkillAssessment;
  targetCompanies?: string[];
  recentGoals?: string[];
}): Promise<
  { title: string; angle: string; hook: string; category: string }[]
> {
  const client = getClient();

  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `Suggest 6 LinkedIn post topics for a data leader aspiring to become a CDO.

Their context:
- Current role: ${context.currentRole || "Data leader"}
- Industry: ${context.industry || "Technology"}
- Strong skills: ${context.skills ? Object.entries(context.skills).filter(([, v]) => v >= 7).map(([k]) => k).join(", ") || "various" : "various"}
- Target companies: ${context.targetCompanies?.join(", ") || "Fortune 500"}
- Active goals: ${context.recentGoals?.join(", ") || "CDO career growth"}

Suggest a mix of:
- Thought leadership (share an opinion or insight)
- Lessons learned (from experience)
- Industry commentary (react to a trend)
- How-to / tactical advice
- Personal career reflection
- Contrarian / debate-starting take

Respond in JSON array:
[{
  "title": "Short topic title",
  "angle": "The specific angle or argument to make (1 sentence)",
  "hook": "A compelling opening line for the post",
  "category": "thought-leadership|lessons-learned|industry-commentary|how-to|career-reflection|contrarian"
}]`,
      },
    ],
  });

  const body = msg.content[0].type === "text" ? msg.content[0].text : "";
  return parseJsonResponse(body) as { title: string; angle: string; hook: string; category: string }[];
}

export async function generateLinkedInPost(params: {
  topic: string;
  angle?: string;
  tone: string;
  length: string;
  currentRole?: string;
  industry?: string;
  sampleWriting?: string;
}): Promise<{ post: string; hashtags: string[]; tips: string[] }> {
  const client = getClient();

  const styleInstruction = params.sampleWriting
    ? `The user has provided a sample of their writing style. Match their voice, sentence structure, vocabulary level, and personality:

SAMPLE WRITING:
"""
${params.sampleWriting}
"""

Write the post to sound like THEM, not like a generic AI. Match their level of formality, use of jargon, sentence length patterns, and overall personality.`
    : `Write in a ${params.tone} tone that feels authentic and human.`;

  const lengthGuide: Record<string, string> = {
    short: "3-5 sentences. Punchy and concise.",
    medium: "6-10 sentences. Solid insight with some detail.",
    long: "12-18 sentences. Deep dive with examples and a clear narrative arc.",
  };

  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Write a LinkedIn post for a ${params.currentRole || "data leader"} in ${params.industry || "technology"}.

TOPIC: ${params.topic}
${params.angle ? `ANGLE: ${params.angle}` : ""}

STYLE INSTRUCTIONS:
${styleInstruction}

LENGTH: ${lengthGuide[params.length] || lengthGuide.medium}

GUIDELINES:
- Start with a hook that stops the scroll (no "I'm excited to share...")
- Use line breaks between paragraphs for readability
- Include a personal insight or experience angle
- End with a question or call-to-action to drive engagement
- No emojis overload (1-2 max if any)
- Sound like a real human, not a corporate bot
- Focus on data leadership, CDO topics, or career growth

Respond in JSON:
{
  "post": "The full LinkedIn post text with line breaks as \\n",
  "hashtags": ["3-5 relevant hashtags without the # symbol"],
  "tips": ["2-3 tips for making this post perform well"]
}`,
      },
    ],
  });

  const result = msg.content[0].type === "text" ? msg.content[0].text : "";
  return parseJsonResponse(result) as { post: string; hashtags: string[]; tips: string[] };
}
