import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fetchAllFeeds, fetchNewsAPI } from "@/lib/content";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const contentType = request.nextUrl.searchParams.get("type");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const topics = request.nextUrl.searchParams.get("topics"); // comma-separated

  const where: Prisma.ContentWhereInput = {};
  if (category && category !== "All") {
    where.category = category as Prisma.EnumContentCategoryFilter;
  }
  if (contentType) {
    where.contentType = contentType as Prisma.EnumContentTypeFilter;
  }

  // If user has custom topics, boost matching content by fetching in two passes
  if (topics) {
    const topicList = topics.split(",").map((t) => t.trim()).filter(Boolean);

    if (topicList.length > 0) {
      // First: get topic-matching content
      const topicFilter: Prisma.ContentWhereInput = {
        ...where,
        OR: topicList.flatMap((topic) => [
          { title: { contains: topic, mode: "insensitive" as Prisma.QueryMode } },
          { summary: { contains: topic, mode: "insensitive" as Prisma.QueryMode } },
        ]),
      };

      const [topicContent, generalContent] = await Promise.all([
        prisma.content.findMany({
          where: topicFilter,
          orderBy: [{ relevanceScore: "desc" }, { createdAt: "desc" }],
          take: limit,
        }),
        prisma.content.findMany({
          where,
          orderBy: [{ relevanceScore: "desc" }, { createdAt: "desc" }],
          take: limit,
        }),
      ]);

      // Merge: topic matches first, then general (deduped)
      const seenIds = new Set(topicContent.map((c) => c.id));
      const merged = [
        ...topicContent,
        ...generalContent.filter((c) => !seenIds.has(c.id)),
      ].slice(0, limit);

      return NextResponse.json(merged);
    }
  }

  // Default: no topic filtering
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
