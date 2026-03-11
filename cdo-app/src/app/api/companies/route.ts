import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCompanyIntelligence } from "@/lib/ai";
import { getAuthUserId } from "@/lib/api-auth";

export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const companies = await prisma.targetCompany.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(companies);
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { name, industry, website } = body;

  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
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
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  // Verify the company belongs to this user
  const existing = await prisma.targetCompany.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  await prisma.targetCompany.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
