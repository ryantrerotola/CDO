import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-auth";
import { evaluateScenarioResponse, generateTalkingPoints } from "@/lib/ai";
import { prisma } from "@/lib/db";

/**
 * POST /api/story-lab/scenario
 * Evaluate a scenario response or generate talking points.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { action } = body;

  if (action === "evaluate") {
    const { scenario, slides, timeSpent } = body;
    const result = await evaluateScenarioResponse({
      title: scenario.title,
      prompt: scenario.prompt,
      slides,
      timeSpent,
    });

    // Save submission
    await prisma.slideSubmission.create({
      data: {
        userId,
        slides,
        feedback: result,
        scenarioId: scenario.id,
      },
    });

    return NextResponse.json(result);
  }

  if (action === "talking-points") {
    const { slides } = body;
    const result = await generateTalkingPoints(slides);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
