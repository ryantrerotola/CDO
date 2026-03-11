import { NextRequest, NextResponse } from "next/server";
import { suggestLinkedInTopics, generateLinkedInPost } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === "suggest") {
    const { currentRole, industry, skills, targetCompanies, recentGoals } =
      body;
    try {
      const topics = await suggestLinkedInTopics({
        currentRole,
        industry,
        skills,
        targetCompanies,
        recentGoals,
      });
      return NextResponse.json({ topics });
    } catch (error) {
      console.error("Topic suggestion failed:", error);
      return NextResponse.json(
        { error: "Failed to generate topic suggestions" },
        { status: 500 }
      );
    }
  }

  if (action === "generate") {
    const { topic, angle, tone, length, currentRole, industry, sampleWriting } =
      body;

    if (!topic) {
      return NextResponse.json(
        { error: "topic is required" },
        { status: 400 }
      );
    }

    try {
      const result = await generateLinkedInPost({
        topic,
        angle,
        tone: tone || "professional-casual",
        length: length || "medium",
        currentRole,
        industry,
        sampleWriting,
      });
      return NextResponse.json(result);
    } catch (error) {
      console.error("Post generation failed:", error);
      return NextResponse.json(
        { error: "Failed to generate post" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
