import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchAllFeeds, fetchNewsAPI } from "@/lib/content";
import { seedContent } from "@/data/seed-content";

// Derive seed URLs dynamically so they stay in sync with seed-content.ts
const SEED_URLS = seedContent.map((item) => item.url);

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
    // Step 1: Purge old non-seed live feed articles
    const deleted = await prisma.content.deleteMany({
      where: {
        url: { notIn: SEED_URLS },
        relevanceScore: { lt: 1.0 },
      },
    });

    // Step 2: Fetch fresh, relevance-filtered content
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
            relevanceScore: 0.5,
          },
        });
        created++;
      } catch {
        // Skip duplicates or invalid entries
      }
    }

    return NextResponse.json({
      message: `Purged ${deleted.count} old articles, added ${created} new items`,
      total: allItems.length,
      created,
      purged: deleted.count,
    });
  } catch (error) {
    console.error("Cron content refresh failed:", error);
    return NextResponse.json(
      { error: "Failed to refresh content" },
      { status: 500 }
    );
  }
}
