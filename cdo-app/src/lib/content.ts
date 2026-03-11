import RSSParser from "rss-parser";

const parser = new RSSParser();

export const RSS_FEEDS = [
  {
    url: "https://hbr.org/feed",
    source: "Harvard Business Review",
    category: "LEADERSHIP",
  },
  {
    url: "https://towardsdatascience.com/feed",
    source: "Towards Data Science",
    category: "TECHNICAL",
  },
  {
    url: "https://feeds.feedburner.com/kdnuggets-data-mining-analytics",
    source: "KDnuggets",
    category: "AI_ML",
  },
  {
    url: "https://www.mckinsey.com/rss/insights",
    source: "McKinsey",
    category: "DATA_STRATEGY",
  },
];

export interface FeedItem {
  title: string;
  url: string;
  source: string;
  author?: string;
  publishedAt?: Date;
  content?: string;
  category: string;
}

export async function fetchRSSFeed(
  feedUrl: string,
  source: string,
  category: string
): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed.items.slice(0, 10).map((item) => ({
      title: item.title || "Untitled",
      url: item.link || feedUrl,
      source,
      author: item.creator || item.author,
      publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
      content: item.contentSnippet || item.content,
      category,
    }));
  } catch (error) {
    console.error(`Failed to fetch RSS feed from ${feedUrl}:`, error);
    return [];
  }
}

export async function fetchAllFeeds(): Promise<FeedItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchRSSFeed(feed.url, feed.source, feed.category))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<FeedItem[]> => r.status === "fulfilled"
    )
    .flatMap((r) => r.value);
}

export async function fetchNewsAPI(query: string = "chief data officer"): Promise<FeedItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=en&category=technology,business`
    );
    const data = await res.json();

    if (!data.results) return [];

    return data.results.map(
      (item: {
        title: string;
        link: string;
        source_id: string;
        creator?: string[];
        pubDate?: string;
        description?: string;
      }) => ({
        title: item.title,
        url: item.link,
        source: item.source_id,
        author: item.creator?.[0],
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        content: item.description,
        category: "INDUSTRY_NEWS",
      })
    );
  } catch (error) {
    console.error("Failed to fetch from News API:", error);
    return [];
  }
}
