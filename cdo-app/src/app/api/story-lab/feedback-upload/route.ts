import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { evaluateSlideImage, evaluateSlideText } from "@/lib/ai";
import type { VisualSlideFeedback } from "@/lib/ai";

/**
 * Extract text from PPTX slides.
 * PPTX is a ZIP of XML files — each slide is in ppt/slide/slideN.xml.
 */
async function extractPptxSlides(buffer: Buffer): Promise<{ slideNumber: number; text: string }[]> {
  // Dynamic import to avoid bundling issues
  const { Readable } = await import("stream");
  const { createInflate } = await import("zlib");

  // Parse ZIP file manually (PPTX is a ZIP)
  const slides: { slideNumber: number; text: string }[] = [];

  // Use unzipper or parse manually — let's use the built-in approach
  // We'll use a lightweight ZIP parsing approach
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);

  // Find all slide XML files
  const slideFiles: { num: number; file: JSZip.JSZipObject }[] = [];
  zip.forEach((path, file) => {
    const match = path.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (match) {
      slideFiles.push({ num: parseInt(match[1]), file });
    }
  });

  // Sort by slide number
  slideFiles.sort((a, b) => a.num - b.num);

  for (const { num, file } of slideFiles) {
    const xml = await file.async("string");
    // Extract text from XML — get all <a:t> elements
    const textParts: string[] = [];
    const regex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      textParts.push(match[1]);
    }
    const slideText = textParts.join(" ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");

    if (slideText.trim()) {
      slides.push({ slideNumber: num, text: slideText.trim() });
    }
  }

  return slides;
}

/**
 * POST /api/story-lab/feedback-upload
 * Upload slide images or PPTX files for AI feedback.
 * Accepts multipart form data with:
 * - files: image(s) or .pptx file
 * - context: optional context string
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const context = formData.get("context") as string | null;

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
  }

  try {
    const results: {
      type: "image" | "pptx";
      fileName: string;
      feedbacks: VisualSlideFeedback[];
    }[] = [];

    for (const file of files) {
      const name = file.name.toLowerCase();
      const buffer = Buffer.from(await file.arrayBuffer());

      if (name.endsWith(".pptx")) {
        // Extract slides from PPTX and evaluate text
        const slideTexts = await extractPptxSlides(buffer);

        if (slideTexts.length === 0) {
          return NextResponse.json(
            { error: `No text content found in ${file.name}. The file may be empty or contain only images.` },
            { status: 400 }
          );
        }

        const feedbacks = await evaluateSlideText(slideTexts);
        results.push({ type: "pptx", fileName: file.name, feedbacks });
      } else if (
        name.endsWith(".png") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".gif") ||
        name.endsWith(".webp")
      ) {
        // Image — use vision API
        const base64 = buffer.toString("base64");
        const ext = name.split(".").pop()!;
        const mediaTypeMap: Record<string, "image/png" | "image/jpeg" | "image/gif" | "image/webp"> = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          gif: "image/gif",
          webp: "image/webp",
        };
        const mediaType = mediaTypeMap[ext] || "image/png";
        const feedback = await evaluateSlideImage(base64, mediaType, context || undefined);
        results.push({ type: "image", fileName: file.name, feedbacks: [feedback] });
      } else {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.name}. Upload .pptx, .png, .jpg, or .webp files.` },
          { status: 400 }
        );
      }
    }

    // Flatten all feedbacks for storage
    const allFeedbacks = results.flatMap((r) => r.feedbacks);

    // Save submission
    const submission = await prisma.slideSubmission.create({
      data: {
        userId,
        slides: results.map((r) => ({
          type: r.type,
          fileName: r.fileName,
          slideCount: r.feedbacks.length,
        })) as unknown as Prisma.InputJsonValue,
        feedback: JSON.parse(JSON.stringify(allFeedbacks)) as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      id: submission.id,
      results,
    });
  } catch (error) {
    console.error("Slide upload feedback error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate uploaded slides" },
      { status: 500 }
    );
  }
}
