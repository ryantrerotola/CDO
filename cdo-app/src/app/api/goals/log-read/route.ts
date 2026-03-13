import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

/**
 * POST /api/goals/log-read
 * Either increments a specific goal (by goalId) or auto-matches a reading/listening goal.
 * Creates a GoalEntry and increments currentValue by 1.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const contentType: string = body.contentType || "ARTICLE";
  const goalId: string | undefined = body.goalId;

  let goal;

  if (goalId) {
    // Direct goal increment (e.g. from Today's Actions manual check-off)
    goal = await prisma.goal.findFirst({
      where: { id: goalId, userId, status: "ACTIVE" },
    });
  } else {
    // Auto-match: find the best matching active habit goal for reading/listening
    const titleFilters: Prisma.GoalWhereInput[] = [
      { title: { contains: "article", mode: "insensitive" as Prisma.QueryMode } },
      { title: { contains: "read", mode: "insensitive" as Prisma.QueryMode } },
    ];
    if (contentType === "PODCAST") {
      titleFilters.push({ title: { contains: "podcast", mode: "insensitive" as Prisma.QueryMode } });
    }

    goal = await prisma.goal.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        type: "HABIT",
        OR: titleFilters,
      },
    });
  }

  if (!goal) {
    return NextResponse.json({ matched: false, message: "No matching goal found" });
  }

  const notes =
    contentType === "MANUAL"
      ? "Manually completed"
      : contentType === "PODCAST"
        ? "Listened to podcast"
        : "Read article";

  // Create a goal entry and increment currentValue
  await prisma.$transaction([
    prisma.goalEntry.create({
      data: {
        goalId: goal.id,
        value: 1,
        notes,
      },
    }),
    prisma.goal.update({
      where: { id: goal.id },
      data: { currentValue: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({
    matched: true,
    goalId: goal.id,
    goalTitle: goal.title,
    newValue: goal.currentValue + 1,
  });
}
