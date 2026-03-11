import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeResume } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const userId = formData.get("userId") as string | null;

  if (!file || !userId) {
    return NextResponse.json(
      { error: "file and userId are required" },
      { status: 400 }
    );
  }

  // Read file content as text
  const text = await file.text();

  // Analyze resume with Claude AI
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

  // Store resume and analysis in database
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

  // Update user's skill assessment based on resume analysis
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

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    take: 1,
  });

  return NextResponse.json(resumes[0] || null);
}
