import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

/**
 * POST /api/goals/log-read
 * Finds the user's "Read industry articles" (or similar reading/listening) goal
 * and increments its currentValue by 1, creating a GoalEntry.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const contentType: string = body.contentType || "ARTICLE";

  // Find the best matching active habit goal for reading/listening
  const titleFilters: Prisma.GoalWhereInput[] = [
    { title: { contains: "article", mode: "insensitive" as Prisma.QueryMode } },
    { title: { contains: "read", mode: "insensitive" as Prisma.QueryMode } },
  ];
  if (contentType === "PODCAST") {
    titleFilters.push({ title: { contains: "podcast", mode: "insensitive" as Prisma.QueryMode } });
  }

  const readingGoal = await prisma.goal.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      type: "HABIT",
      OR: titleFilters,
    },
  });

  if (!readingGoal) {
    return NextResponse.json({ matched: false, message: "No matching goal found" });
  }

  // Create a goal entry and increment currentValue
  await prisma.$transaction([
    prisma.goalEntry.create({
      data: {
        goalId: readingGoal.id,
        value: 1,
        notes: contentType === "PODCAST" ? "Listened to podcast" : "Read article",
      },
    }),
    prisma.goal.update({
      where: { id: readingGoal.id },
      data: { currentValue: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({
    matched: true,
    goalId: readingGoal.id,
    goalTitle: readingGoal.title,
    newValue: readingGoal.currentValue + 1,
  });
}
