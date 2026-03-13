import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchAllFeeds, fetchNewsAPI } from "@/lib/content";

// All seed content URLs — never purged during refresh
const SEED_URLS = [
  "https://hbr.org/2026/01/the-evolving-role-of-the-cdo",
  "https://martinfowler.com/articles/data-mesh-guide",
  "https://mckinsey.com/data-driven-culture-2026",
  "https://iapp.org/eu-ai-act-data-leaders",
  "https://amazon.com/chief-data-officers-playbook",
  "https://amazon.com/data-strategy-bernard-marr",
  "https://amazon.com/competing-analytics-davenport",
  "https://amazon.com/data-governance-john-ladley",
  "https://thoughtspot.com/data-chief/leading-transformation",
  "https://nist.gov/ai-governance-frameworks-comparison",
  "https://towardsdatascience.com/snowflake-vs-databricks-2026",
  "https://dama.org/cdmp-study-guide",
];

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
    // Step 1: Purge old non-seed articles so stale/irrelevant content doesn't linger
    const deleted = await prisma.content.deleteMany({
      where: {
        url: { notIn: SEED_URLS },
        contentType: "ARTICLE",
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
