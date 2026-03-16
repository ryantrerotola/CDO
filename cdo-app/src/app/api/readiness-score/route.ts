import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

/**
 * GET /api/readiness-score
 * Composite CDO Readiness Score (0-100):
 * - Gap closure (40%): % of skills at PROFICIENT+
 * - Skill graph progress (30%): average proficiency across all skills
 * - Story Lab completions (30%): modules completed
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

  // Weighted composite
  const composite = Math.round(
    gapClosureScore * 0.4 +
    skillGraphScore * 0.3 +
    storyLabScore * 0.3
  );

  return NextResponse.json({
    score: Math.min(composite, 100),
    breakdown: {
      gapClosure: { score: gapClosureScore, weight: 40, proficientCount: proficientPlusCount, totalSkills },
      skillGraph: { score: skillGraphScore, weight: 30, avgProficiency: Math.round(avgProficiency * 100) / 100 },
      storyLab: { score: storyLabScore, weight: 30, completedModules: uniqueModules.size, totalModules },
    },
  });
}
