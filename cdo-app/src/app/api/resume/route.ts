import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeResume } from "@/lib/ai";
import { getAuthUserId } from "@/lib/api-auth";

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

  const text = await file.text();

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
