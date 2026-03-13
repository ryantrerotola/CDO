import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchNewsAPI } from "@/lib/content";

/**
 * POST /api/content/discover
 * Searches for content matching custom user topics.
 * First checks existing DB content, then fetches fresh results from News API.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const topics: string[] = body.topics || [];

  if (topics.length === 0) {
    return NextResponse.json([]);
  }

  // 1. Search existing content in DB for topic matches
  const dbResults = await prisma.content.findMany({
    where: {
      OR: topics.flatMap((topic) => [
        { title: { contains: topic, mode: "insensitive" as const } },
        { summary: { contains: topic, mode: "insensitive" as const } },
      ]),
    },
    orderBy: [{ relevanceScore: "desc" }, { createdAt: "desc" }],
    take: 20,
  });

  // 2. Also fetch fresh results from News API for these topics
  let freshItems = 0;
  if (process.env.NEWS_API_KEY) {
    try {
      // Build topic-specific queries
      const topicQueries = topics.slice(0, 3).map((t) => `"${t}"`);

      for (const query of topicQueries) {
        const res = await fetch(
          `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=en&category=technology,business`
        );
        const data = await res.json();

        if (data.results) {
          for (const item of data.results.slice(0, 5)) {
            try {
              await prisma.content.upsert({
                where: { url: item.link },
                update: {},
                create: {
                  title: item.title,
                  url: item.link,
                  source: item.source_id || "News",
                  author: item.creator?.[0],
                  publishedAt: item.pubDate ? new Date(item.pubDate) : null,
                  summary: item.description?.substring(0, 500),
                  category: "TECHNICAL",
                  contentType: "ARTICLE",
                  relevanceScore: 0.7,
                  tags: topics,
                },
              });
              freshItems++;
            } catch {
              // Skip duplicates
            }
          }
        }
      }
    } catch (error) {
      console.error("Topic discovery News API error:", error);
    }
  }

  // 3. Re-query to include any fresh items we just added
  const finalResults = freshItems > 0
    ? await prisma.content.findMany({
        where: {
          OR: topics.flatMap((topic) => [
            { title: { contains: topic, mode: "insensitive" as const } },
            { summary: { contains: topic, mode: "insensitive" as const } },
          ]),
        },
        orderBy: [{ relevanceScore: "desc" }, { createdAt: "desc" }],
        take: 20,
      })
    : dbResults;

  return NextResponse.json({
    results: finalResults,
    freshItems,
  });
}
