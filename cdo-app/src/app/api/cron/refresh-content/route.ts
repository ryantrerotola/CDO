import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchAllFeeds, fetchNewsAPI, fetchBraveSearch } from "@/lib/content";
import { seedContent } from "@/data/seed-content";

// Derive seed URLs dynamically so they stay in sync with seed-content.ts
const SEED_URLS = seedContent.map((item) => item.url);

// Content older than this gets purged (keeps a healthy rolling backlog)
const RETENTION_DAYS = 14;

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
    // Step 1: Purge content older than RETENTION_DAYS (preserve seed content)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    const deleted = await prisma.content.deleteMany({
      where: {
        url: { notIn: SEED_URLS },
        relevanceScore: { lt: 1.0 },
        createdAt: { lt: cutoffDate },
      },
    });

    // Step 2: Fetch fresh, relevance-filtered content from all sources
    const [rssItems, newsItems, braveItems] = await Promise.all([
      fetchAllFeeds(),
      fetchNewsAPI(),
      fetchBraveSearch(),
    ]);

    const allItems = [...rssItems, ...newsItems, ...braveItems];

    // Deduplicate across sources by URL
    const seenUrls = new Set<string>();
    const uniqueItems = allItems.filter((item) => {
      if (seenUrls.has(item.url)) return false;
      seenUrls.add(item.url);
      return true;
    });

    let created = 0;

    for (const item of uniqueItems) {
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
            contentType: (item.contentType || "ARTICLE") as "ARTICLE" | "PODCAST" | "VIDEO" | "BOOK" | "COURSE" | "REPORT" | "INTERVIEW",
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
      message: `Purged ${deleted.count} stale articles (>${RETENTION_DAYS}d), added ${created} new items`,
      sources: {
        rss: rssItems.length,
        newsApi: newsItems.length,
        braveSearch: braveItems.length,
      },
      total: uniqueItems.length,
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
