import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      resumes: { orderBy: { uploadedAt: "desc" }, take: 1 },
      targetCompanies: true,
      careerMilestones: { orderBy: { order: "asc" } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const updates = await request.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
  });

  return NextResponse.json(user);
}
