import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

/**
 * GET /api/content-interactions?action=DISMISSED
 * Returns content IDs the user has interacted with (filtered by action).
 */
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const action = request.nextUrl.searchParams.get("action") || "DISMISSED";

  const interactions = await prisma.userContentInteraction.findMany({
    where: { userId, action: action as "READ" | "SAVED" | "DISMISSED" | "SHARED" },
    select: { contentId: true },
  });

  return NextResponse.json(interactions.map((i) => i.contentId));
}

/**
 * POST /api/content-interactions
 * Body: { contentId: string, action: "READ" | "SAVED" | "DISMISSED" | "SHARED" }
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { contentId, action } = await request.json();

  if (!contentId || !action) {
    return NextResponse.json({ error: "contentId and action required" }, { status: 400 });
  }

  try {
    const interaction = await prisma.userContentInteraction.upsert({
      where: {
        userId_contentId_action: { userId, contentId, action },
      },
      update: { timestamp: new Date() },
      create: { userId, contentId, action },
    });

    return NextResponse.json(interaction);
  } catch (error) {
    console.error("Failed to save content interaction:", error);
    return NextResponse.json(
      { error: "Failed to save interaction" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/content-interactions
 * Body: { contentId: string, action: "DISMISSED" }
 * Removes a specific interaction (e.g. un-dismiss).
 */
export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { contentId, action } = await request.json();

  await prisma.userContentInteraction.deleteMany({
    where: { userId, contentId, action },
  });

  return NextResponse.json({ ok: true });
}
