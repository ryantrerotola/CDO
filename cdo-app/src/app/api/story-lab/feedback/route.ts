import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { evaluateSlide, evaluateDeckCoherence } from "@/lib/ai";

/**
 * POST /api/story-lab/feedback
 * Evaluate a single slide or a full deck.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { slides, scenarioId } = body;

  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return NextResponse.json({ error: "slides array required" }, { status: 400 });
  }

  try {
    // Evaluate each slide individually
    const slideFeedbacks = [];
    for (const slide of slides) {
      const feedback = await evaluateSlide(slide);
      slideFeedbacks.push(feedback);
    }

    // If multiple slides, also check deck coherence
    let deckFeedback = null;
    if (slides.length > 1) {
      deckFeedback = await evaluateDeckCoherence(slides);
    }

    // Save submission
    const submission = await prisma.slideSubmission.create({
      data: {
        userId,
        slides,
        feedback: JSON.parse(JSON.stringify({ slideFeedbacks, deckFeedback })) as Prisma.InputJsonValue,
        scenarioId,
      },
    });

    return NextResponse.json({
      id: submission.id,
      slideFeedbacks,
      deckFeedback,
    });
  } catch (error) {
    console.error("Slide feedback error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate slides" },
      { status: 500 }
    );
  }
}
