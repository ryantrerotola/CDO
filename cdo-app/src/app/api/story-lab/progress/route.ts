import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

/**
 * GET /api/story-lab/progress
 * Returns user's Story Lab completion status.
 */
export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const progress = await prisma.storyLabProgress.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
  });

  const submissions = await prisma.slideSubmission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ progress, submissions });
}

/**
 * POST /api/story-lab/progress
 * Mark a lesson as completed.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { moduleId, lessonId } = await request.json();

  if (!moduleId || !lessonId) {
    return NextResponse.json({ error: "moduleId and lessonId required" }, { status: 400 });
  }

  const record = await prisma.storyLabProgress.upsert({
    where: { userId_moduleId_lessonId: { userId, moduleId, lessonId } },
    update: { completedAt: new Date() },
    create: { userId, moduleId, lessonId },
  });

  return NextResponse.json(record);
}
