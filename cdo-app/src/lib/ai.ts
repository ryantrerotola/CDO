import Anthropic from "@anthropic-ai/sdk";
import type { ResumeAnalysis, SkillAssessment } from "@/types";

const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

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
  return JSON.parse(text);
}

export async function analyzeResume(
  resumeText: string
): Promise<ResumeAnalysis> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
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
  }
}

The suggestedSkillAssessment values should be 1-10 based on what the resume demonstrates.
The overallReadiness should be 0-100 representing how ready they are for a CDO role.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return JSON.parse(text);
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
  return JSON.parse(text);
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
  return JSON.parse(text);
}
