import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCompanyIntelligence } from "@/lib/ai";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const companies = await prisma.targetCompany.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(companies);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, name, industry, website } = body;

  if (!userId || !name) {
    return NextResponse.json(
      { error: "userId and name are required" },
      { status: 400 }
    );
  }

  // Get AI-powered company intelligence
  let intelligence;
  try {
    intelligence = await getCompanyIntelligence(name, industry);
  } catch {
    intelligence = {
      techStack: [],
      dataMaturity: "unknown",
      cdoInfo: "",
      learningRecommendations: [],
    };
  }

  const company = await prisma.targetCompany.create({
    data: {
      userId,
      name,
      industry,
      website,
      techStack: intelligence.techStack,
      cdoName: intelligence.cdoInfo || null,
      cdoBackground: intelligence.cdoInfo,
    },
  });

  return NextResponse.json({ company, intelligence });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.targetCompany.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
