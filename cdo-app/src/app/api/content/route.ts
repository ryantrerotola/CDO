import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchAllFeeds, fetchNewsAPI } from "@/lib/content";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const contentType = request.nextUrl.searchParams.get("type");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");

  const where: Record<string, string> = {};
  if (category && category !== "All") {
    where.category = category;
  }
  if (contentType) {
    where.contentType = contentType;
  }

  // Prioritize curated content (relevanceScore 1.0) over live feed articles (0.5)
  const content = await prisma.content.findMany({
    where,
    orderBy: [
      { relevanceScore: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });

  return NextResponse.json(content);
}

// Trigger content refresh (fetch from RSS + News API)
export async function POST() {
  try {
    const [rssItems, newsItems] = await Promise.all([
      fetchAllFeeds(),
      fetchNewsAPI(),
    ]);

    const allItems = [...rssItems, ...newsItems];
    let created = 0;

    for (const item of allItems) {
      try {
        await prisma.content.upsert({
          where: { url: item.url },
          update: {},
          create: {
            title: item.title,
            url: item.url,
            source: item.source,
            author: item.author,
            publishedAt: item.publishedAt,
            category: item.category as "DATA_STRATEGY" | "AI_ML" | "ANALYTICS" | "DATA_ETHICS" | "LEADERSHIP" | "INDUSTRY_NEWS" | "TECHNICAL",
            contentType: "ARTICLE",
            summary: item.content?.substring(0, 500),
            relevanceScore: 0.5,
          },
        });
        created++;
      } catch {
        // Skip duplicates or invalid entries
      }
    }

    return NextResponse.json({
      message: `Refreshed content: ${created} new items`,
      total: allItems.length,
      created,
    });
  } catch (error) {
    console.error("Content refresh failed:", error);
    return NextResponse.json(
      { error: "Failed to refresh content" },
      { status: 500 }
    );
  }
}
