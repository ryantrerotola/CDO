import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: { entries: true, subGoals: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, title, description, type, frequency, targetValue, deadline, parentGoalId } = body;

  if (!userId || !title || !type) {
    return NextResponse.json(
      { error: "userId, title, and type are required" },
      { status: 400 }
    );
  }

  const goal = await prisma.goal.create({
    data: {
      userId,
      title,
      description,
      type,
      frequency: frequency || "ONCE",
      targetValue: targetValue || 1,
      deadline: deadline ? new Date(deadline) : null,
      parentGoalId,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  if (updates.deadline) {
    updates.deadline = new Date(updates.deadline);
  }

  const goal = await prisma.goal.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json(goal);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
