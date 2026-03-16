import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAuthUserId } from "@/lib/api-auth";
import { NextResponse } from "next/server";

/**
 * POST /api/chat
 * Streaming Claude chat with contextual system message.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { messages, context } = await request.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemMessage = buildSystemMessage(context);

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: systemMessage,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  // Convert to ReadableStream for Next.js streaming response
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta") {
            const delta = event.delta;
            if ("text" in delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`));
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function buildSystemMessage(context?: {
  type?: string;
  skillName?: string;
  clusterName?: string;
  marketFrequency?: number;
  userProficiency?: number;
  gapScore?: number;
}): string {
  let base = `You are a CDO career coach — an expert in helping senior data leaders prepare for Chief Data Officer roles. Be direct, specific, and actionable. Use second person. Keep responses concise (2-4 paragraphs max).`;

  if (context?.type === "gap") {
    base += `\n\nThe user is asking about a skill gap: "${context.skillName}" in the "${context.clusterName}" cluster. This skill appears in ${context.marketFrequency}% of CDO job postings. The user's proficiency is ${context.userProficiency}/3. Help them understand why this matters and what to do about it.`;
  } else if (context?.type === "skill") {
    base += `\n\nThe user is exploring the skill "${context.skillName}" in the "${context.clusterName}" cluster on their Skill Graph. Help them understand what this skill entails at a CDO level and how to develop it.`;
  } else if (context?.type === "story-lab") {
    base += `\n\nThe user is working in Story Lab on executive communication skills. Help them improve their slide design, storytelling, and presentation skills for CDO-level audiences.`;
  }

  return base;
}
