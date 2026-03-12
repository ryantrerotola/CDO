import RSSParser from "rss-parser";

const parser = new RSSParser();

export const RSS_FEEDS = [
  // Data-specific publications (always on-topic)
  { url: "https://feeds.feedburner.com/kdnuggets-data-mining-analytics", source: "KDnuggets", category: "AI_ML" },
  { url: "https://dataconomy.com/feed/", source: "Dataconomy", category: "DATA_STRATEGY" },
  { url: "https://www.datanami.com/feed/", source: "Datanami", category: "ANALYTICS" },

  // Cloud data platforms (CDO-relevant technical content)
  { url: "https://aws.amazon.com/blogs/big-data/feed/", source: "AWS Big Data", category: "TECHNICAL" },
  { url: "https://cloud.google.com/blog/products/data-analytics/rss", source: "Google Cloud Data", category: "TECHNICAL" },

  // Governance, Ethics & Regulation
  { url: "https://iapp.org/rss/daily-dashboard/", source: "IAPP", category: "DATA_ETHICS" },

  // Leadership & Strategy (filtered for relevance)
  { url: "https://www.mckinsey.com/rss/insights", source: "McKinsey", category: "LEADERSHIP" },
  { url: "https://mitsloan.mit.edu/ideas-made-to-matter/rss.xml", source: "MIT Sloan", category: "LEADERSHIP" },

  // AI/ML news (filtered for data leader relevance)
  { url: "https://blog.google/technology/ai/rss/", source: "Google AI Blog", category: "AI_ML" },
  { url: "https://venturebeat.com/category/ai/feed/", source: "VentureBeat AI", category: "AI_ML" },
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

// Compound phrases that specifically indicate CDO / data leader relevance.
// Single generic words like "data", "AI", "cloud" are intentionally excluded
// because they match electricity bills, proxy servers, weather articles, etc.
const CDO_RELEVANCE_PHRASES = [
  // Data leadership
  "chief data officer", "CDO", "data leader", "data executive", "data officer",
  "data strategy", "data governance", "data management", "data quality",
  "data-driven", "data culture", "data literacy", "data organization",
  // Data architecture & platforms
  "data mesh", "data fabric", "data lakehouse", "data warehouse", "data lake",
  "data platform", "data pipeline", "data engineering", "data infrastructure",
  "data catalog", "data lineage", "metadata management", "master data",
  "data integration", "data architecture", "big data", "data science",
  "data analytics", "data visualization",
  // AI/ML (compound terms only)
  "artificial intelligence", "machine learning", "deep learning", "generative AI",
  "GenAI", "large language model", "LLM", "AI strategy", "AI governance",
  "responsible AI", "AI ethics", "enterprise AI", "AI regulation",
  "natural language processing", "computer vision",
  // Analytics & BI
  "business intelligence", "predictive analytics", "advanced analytics",
  "analytics platform", "analytics strategy",
  // Governance & compliance
  "data privacy", "data protection", "GDPR", "AI Act", "data regulation",
  "data compliance", "data ethics", "algorithmic bias", "algorithmic fairness",
  // Specific platforms (CDOs evaluate these)
  "Databricks", "Snowflake", "dbt", "Apache Spark", "Apache Kafka",
  "Tableau", "Power BI", "Looker",
  // Digital transformation
  "digital transformation", "data transformation", "cloud migration",
];

function isRelevantToCDO(title: string, content: string | undefined): boolean {
  const text = `${title} ${content || ""}`.toLowerCase();
  return CDO_RELEVANCE_PHRASES.some((phrase) => text.includes(phrase.toLowerCase()));
}

// Keyword-based category detection to override feed defaults when the content clearly fits better
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  DATA_STRATEGY: ["data strategy", "data governance", "data management", "data quality", "metadata", "data catalog", "data mesh", "data fabric", "data lakehouse", "CDO", "chief data officer"],
  AI_ML: ["machine learning", "deep learning", "neural network", "LLM", "generative AI", "GenAI", "artificial intelligence", "NLP", "computer vision", "transformer"],
  ANALYTICS: ["analytics", "business intelligence", "dashboard", "visualization", "reporting", "KPI", "metrics", "data-driven"],
  DATA_ETHICS: ["privacy", "GDPR", "compliance", "regulation", "AI Act", "bias", "fairness", "responsible AI", "ethics", "governance framework"],
  LEADERSHIP: ["leadership", "executive", "C-suite", "board", "organizational change", "culture", "talent", "team building", "stakeholder"],
  TECHNICAL: ["architecture", "infrastructure", "pipeline", "ETL", "cloud", "database", "SQL", "API", "microservices", "Kubernetes", "Spark"],
  INDUSTRY_NEWS: ["data startup", "data acquisition", "data partnership", "AI funding", "AI startup"],
};

function detectCategory(title: string, content: string | undefined, feedCategory: string): string {
  const text = `${title} ${content || ""}`.toLowerCase();

  let bestCategory = feedCategory;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => text.includes(kw.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

export async function fetchRSSFeed(
  feedUrl: string,
  source: string,
  defaultCategory: string
): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed.items
      .slice(0, 10) // fetch more, then filter for relevance
      .map((item) => {
        const title = item.title || "Untitled";
        const content = item.contentSnippet || item.content;
        return {
          title,
          url: item.link || feedUrl,
          source,
          author: item.creator || item.author,
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
          content,
          category: detectCategory(title, content, defaultCategory),
        };
      })
      .filter((item) => isRelevantToCDO(item.title, item.content))
      .slice(0, 5);
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

export async function fetchNewsAPI(): Promise<FeedItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  // Run multiple queries for broader coverage
  const queries = [
    "chief data officer",
    "data governance",
    "enterprise AI strategy",
  ];

  const allItems: FeedItem[] = [];

  for (const query of queries) {
    try {
      const res = await fetch(
        `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=en&category=technology,business`
      );
      const data = await res.json();

      if (!data.results) continue;

      const items = data.results.map(
        (item: {
          title: string;
          link: string;
          source_id: string;
          creator?: string[];
          pubDate?: string;
          description?: string;
        }) => {
          const title = item.title;
          const content = item.description;
          return {
            title,
            url: item.link,
            source: item.source_id,
            author: item.creator?.[0],
            publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
            content,
            category: detectCategory(title, content, "INDUSTRY_NEWS"),
          };
        }
      );

      allItems.push(...items.filter((item: FeedItem) => isRelevantToCDO(item.title, item.content)));
    } catch (error) {
      console.error(`Failed to fetch News API for "${query}":`, error);
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return allItems.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
