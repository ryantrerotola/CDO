import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeResume } from "@/lib/ai";
import { getAuthUserId } from "@/lib/api-auth";

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // For .txt and other text-based formats, read as UTF-8
  return buffer.toString("utf-8");
}

function looksLikeBinaryGarbage(text: string): boolean {
  // Count non-printable characters (excluding common whitespace)
  const nonPrintable = text.slice(0, 2000).split("").filter((c) => {
    const code = c.charCodeAt(0);
    return code < 32 && code !== 9 && code !== 10 && code !== 13;
  }).length;
  return nonPrintable > text.slice(0, 2000).length * 0.1;
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "file is required" },
      { status: 400 }
    );
  }

  let text: string;
  try {
    text = await extractText(file);
  } catch (error) {
    console.error("Failed to extract text from file:", error);
    return NextResponse.json(
      { error: "Could not read the uploaded file. Please try a PDF or TXT file." },
      { status: 400 }
    );
  }

  if (!text.trim() || looksLikeBinaryGarbage(text)) {
    return NextResponse.json(
      { error: "Could not extract readable text from your file. Please upload a PDF, DOCX, or plain text (.txt) file." },
      { status: 400 }
    );
  }

  let analysis;
  try {
    analysis = await analyzeResume(text);
  } catch (error) {
    console.error("Resume analysis failed:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }

  try {
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName: file.name,
        fileUrl: `/uploads/${file.name}`,
        parsedData: { text: text.substring(0, 10000) },
        skillsFound: JSON.parse(JSON.stringify(analysis.skills)),
        gapAnalysis: JSON.parse(JSON.stringify(analysis.gaps)),
        recommendations: JSON.parse(JSON.stringify({
          suggestedSkillAssessment: analysis.suggestedSkillAssessment,
          overallReadiness: analysis.overallReadiness,
          experience: analysis.experience,
          education: analysis.education,
          certifications: analysis.certifications,
        })),
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        skillAssessment: JSON.parse(JSON.stringify(analysis.suggestedSkillAssessment)),
      },
    });

    return NextResponse.json({
      resume,
      analysis,
    });
  } catch (error) {
    console.error("Failed to save resume to database:", error);
    // Still return the analysis even if DB save fails
    return NextResponse.json({
      resume: null,
      analysis,
      warning: "Analysis completed but failed to save to database. Your results are shown below.",
    });
  }
}

export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    take: 1,
  });

  return NextResponse.json(resumes[0] || null);
}
