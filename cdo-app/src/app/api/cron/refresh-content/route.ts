import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchAllFeeds, fetchNewsAPI } from "@/lib/content";

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
          update: {
            title: item.title,
            summary: item.content?.substring(0, 500),
          },
          create: {
            title: item.title,
            url: item.url,
            source: item.source,
            author: item.author,
            publishedAt: item.publishedAt,
            category: item.category as
              | "DATA_STRATEGY"
              | "AI_ML"
              | "ANALYTICS"
              | "DATA_ETHICS"
              | "LEADERSHIP"
              | "INDUSTRY_NEWS"
              | "TECHNICAL",
            contentType: "ARTICLE",
            summary: item.content?.substring(0, 500),
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
    console.error("Cron content refresh failed:", error);
    return NextResponse.json(
      { error: "Failed to refresh content" },
      { status: 500 }
    );
  }
}
