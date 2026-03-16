import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/readiness-score
 * Composite CDO Readiness Score (0-100):
 * - Resume strength (25%): AI-assessed readiness from uploaded resume
 * - Gap closure (25%): % of skills at PROFICIENT+
 * - Skill graph progress (25%): average proficiency across all skills
 * - Story Lab completions (25%): modules completed
 */
export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  // Skill proficiencies
  const totalSkills = await prisma.skill.count();
  const proficiencies = await prisma.userSkillProficiency.findMany({
    where: { userId },
  });

  const levelScore: Record<string, number> = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    PROFICIENT: 2,
    EXPERT: 3,
  };

  const proficientPlusCount = proficiencies.filter(
    (p) => p.level === "PROFICIENT" || p.level === "EXPERT"
  ).length;

  const avgProficiency =
    proficiencies.length > 0
      ? proficiencies.reduce((sum, p) => sum + (levelScore[p.level] || 0), 0) /
        (totalSkills || 1)
      : 0;

  // Gap closure: % of all skills at proficient or higher
  const gapClosureScore = totalSkills > 0
    ? Math.round((proficientPlusCount / totalSkills) * 100)
    : 0;

  // Skill graph progress: average proficiency level (0-3) normalized to 0-100
  const skillGraphScore = Math.round((avgProficiency / 3) * 100);

  // Story Lab: count unique module completions
  const storyLabProgress = await prisma.storyLabProgress.findMany({
    where: { userId },
    select: { moduleId: true },
  });
  const uniqueModules = new Set(storyLabProgress.map((p) => p.moduleId));
  const totalModules = 5;
  const storyLabScore = Math.round((uniqueModules.size / totalModules) * 100);

  // Resume: get the most recent resume analysis
  const latestResume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    select: { recommendations: true, skillsFound: true },
  });

  let resumeScore = 0;
  let resumeSkillCount = 0;
  let resumeReadiness = "";
  if (latestResume) {
    const recs = latestResume.recommendations as Record<string, unknown> | null;
    const skills = latestResume.skillsFound as unknown[] | null;
    resumeSkillCount = Array.isArray(skills) ? skills.length : 0;

    if (recs?.overallReadiness != null) {
      const rawReadiness = recs.overallReadiness;

      // The AI returns overallReadiness as a number 0-100
      if (typeof rawReadiness === "number") {
        resumeScore = Math.min(Math.max(Math.round(rawReadiness), 0), 100);
        resumeReadiness = `${resumeScore}`;
      } else {
        // Fallback: try parsing as number first
        const parsed = Number(rawReadiness);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          resumeScore = Math.round(parsed);
          resumeReadiness = `${resumeScore}`;
        } else {
          // Text-based readiness (legacy)
          const readiness = String(rawReadiness).toLowerCase();
          resumeReadiness = readiness;
          if (readiness.includes("strong") || readiness.includes("high") || readiness.includes("ready")) {
            resumeScore = 80;
          } else if (readiness.includes("moderate") || readiness.includes("developing") || readiness.includes("growing")) {
            resumeScore = 55;
          } else if (readiness.includes("early") || readiness.includes("emerging") || readiness.includes("beginning")) {
            resumeScore = 30;
          } else {
            resumeScore = Math.min(Math.round((resumeSkillCount / 20) * 100), 100);
          }
        }
      }
    } else {
      // No readiness field — use skill count as proxy
      resumeScore = Math.min(Math.round((resumeSkillCount / 20) * 100), 100);
    }
  }

  // Weighted composite (4 pillars, 25% each)
  const composite = Math.round(
    resumeScore * 0.25 +
    gapClosureScore * 0.25 +
    skillGraphScore * 0.25 +
    storyLabScore * 0.25
  );

  return NextResponse.json({
    score: Math.min(composite, 100) || 0,
    breakdown: {
      resume: {
        score: resumeScore,
        weight: 25,
        hasResume: !!latestResume,
        skillCount: resumeSkillCount,
        readiness: resumeReadiness,
      },
      gapClosure: { score: gapClosureScore, weight: 25, proficientCount: proficientPlusCount, totalSkills },
      skillGraph: { score: skillGraphScore, weight: 25, avgProficiency: Math.round(avgProficiency * 100) / 100 },
      storyLab: { score: storyLabScore, weight: 25, completedModules: uniqueModules.size, totalModules },
    },
  });
}
