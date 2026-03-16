import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";
import { generateLearningPlan } from "@/lib/ai";

/**
 * GET /api/learning-plan
 * Retrieve the user's most recent saved learning plan.
 */
export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const saved = await prisma.learningPlan.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  if (!saved) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    id: saved.id,
    plan: saved.plan,
    completedActions: saved.completedActions || [],
    createdAt: saved.createdAt,
  });
}

/**
 * POST /api/learning-plan
 * Generate a 30/60/90 day learning plan using Claude and save it.
 */
export async function POST() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  // Gather context
  const proficiencies = await prisma.userSkillProficiency.findMany({
    where: { userId },
    include: { skill: { include: { cluster: true, jobFrequencies: { orderBy: { period: "desc" }, take: 1 } } } },
  });

  const levelScore: Record<string, number> = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    PROFICIENT: 2,
    EXPERT: 3,
  };

  // Top gaps
  const allSkills = await prisma.skill.findMany({
    include: { cluster: true, jobFrequencies: { orderBy: { period: "desc" }, take: 1 } },
  });

  const profMap = new Map(proficiencies.map((p) => [p.skillId, p.level]));

  const gaps = allSkills.map((skill) => {
    const level = profMap.get(skill.id) || "NOT_STARTED";
    const freq = skill.jobFrequencies[0]?.frequency || 0;
    const profNum = levelScore[level] || 0;
    return {
      skillName: skill.name,
      clusterName: skill.cluster.name,
      marketFrequency: freq,
      userProficiency: profNum,
      gapScore: freq > 0 ? Math.round(freq * (3 - profNum) / 3) : 0,
    };
  }).sort((a, b) => b.gapScore - a.gapScore);

  const topGaps = gaps.filter((g) => g.gapScore > 0).slice(0, 5);

  // Story Lab progress
  const storyLabProgress = await prisma.storyLabProgress.findMany({
    where: { userId },
    select: { moduleId: true },
  });
  const completedModules = [...new Set(storyLabProgress.map((p) => p.moduleId))];

  // Active goals
  const goals = await prisma.goal.findMany({
    where: { userId, status: "ACTIVE" },
    select: { title: true },
    take: 10,
  });

  // Readiness score
  const totalSkills = allSkills.length;
  const proficientCount = proficiencies.filter(
    (p) => p.level === "PROFICIENT" || p.level === "EXPERT"
  ).length;
  const readinessScore = totalSkills > 0
    ? Math.round((proficientCount / totalSkills) * 100)
    : 0;

  try {
    const plan = await generateLearningPlan({
      topGaps,
      completedModules,
      activeGoals: goals.map((g) => g.title),
      readinessScore,
    });

    // Save to database
    const saved = await prisma.learningPlan.create({
      data: {
        userId,
        plan: plan as unknown as Record<string, unknown>,
        completedActions: [],
      },
    });

    return NextResponse.json({
      id: saved.id,
      plan: saved.plan,
      completedActions: [],
      createdAt: saved.createdAt,
    });
  } catch (error) {
    console.error("Learning plan generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate learning plan" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/learning-plan
 * Update completed actions for a saved learning plan.
 */
export async function PATCH(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id, completedActions } = await request.json();

  if (!id || !Array.isArray(completedActions)) {
    return NextResponse.json({ error: "id and completedActions required" }, { status: 400 });
  }

  const plan = await prisma.learningPlan.findFirst({
    where: { id, userId },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const updated = await prisma.learningPlan.update({
    where: { id },
    data: { completedActions },
  });

  return NextResponse.json({ id: updated.id, completedActions: updated.completedActions });
}
