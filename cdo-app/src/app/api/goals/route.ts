import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: { entries: true, subGoals: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { title, description, type, frequency, targetValue, deadline, parentGoalId } = body;

  if (!title || !type) {
    return NextResponse.json(
      { error: "title and type are required" },
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
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const existing = await prisma.goal.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
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
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const existing = await prisma.goal.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
