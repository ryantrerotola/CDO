import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";
import { generateGoalRecommendations } from "@/lib/ai";
import type { SkillAssessment } from "@/types";

const defaultSkills: SkillAssessment = {
  technical: 5,
  dataGovernance: 5,
  aiMl: 5,
  businessAcumen: 5,
  leadership: 5,
  stakeholderManagement: 5,
};

export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    // Fetch user's skill assessment + latest resume gaps + existing goals
    const [user, resume, goals] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { skillAssessment: true },
      }),
      prisma.resume.findFirst({
        where: { userId },
        orderBy: { uploadedAt: "desc" },
        select: { gapAnalysis: true },
      }),
      prisma.goal.findMany({
        where: { userId, status: "ACTIVE" },
        select: { title: true },
      }),
    ]);

    const skills = (user?.skillAssessment as unknown as SkillAssessment) || defaultSkills;
    const gaps = (resume?.gapAnalysis as unknown as { area: string; importance: string; recommendation: string }[]) || [];
    const existingGoalTitles = goals.map((g) => g.title);

    const recommendations = await generateGoalRecommendations(
      skills,
      gaps,
      existingGoalTitles
    );

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Failed to generate goal recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
