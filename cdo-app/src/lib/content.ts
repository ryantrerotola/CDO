import RSSParser from "rss-parser";

const parser = new RSSParser();

export const RSS_FEEDS = [
  // Data-specific publications (inherently on-topic, light filtering only)
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

// ── Relevance filtering ──────────────────────────────────────────────
//
// Two tiers:
// 1. TITLE phrases — if ANY of these appear in the title, the article is accepted.
//    These are highly specific to CDO/data leadership topics.
// 2. BODY phrases — checked against title + description together, but require
//    at least 2 matches to accept (single hit in body text is too noisy).
//
// "CDO" is excluded as a standalone match because it collides with
// Collateralized Debt Obligation in finance contexts.

const TITLE_PHRASES = [
  // If any of these appear in the headline, it's almost certainly relevant
  "chief data officer", "data officer", "data leader",
  "data strategy", "data governance", "data management", "data quality",
  "data mesh", "data fabric", "data lakehouse", "data warehouse", "data lake",
  "data platform", "data pipeline", "data engineering", "data catalog",
  "data lineage", "metadata management", "master data", "data architecture",
  "data-driven", "data culture", "data literacy",
  "data privacy", "data protection", "data regulation", "data compliance",
  "data ethics", "data transformation",
  "AI governance", "AI strategy", "AI regulation", "responsible AI", "AI ethics",
  "enterprise AI", "AI Act",
  "generative AI", "GenAI", "large language model",
  "machine learning", "deep learning", "artificial intelligence",
  "business intelligence", "predictive analytics", "analytics strategy",
  "digital transformation",
  "Databricks", "Snowflake", "dbt",
];

const BODY_PHRASES = [
  // Broader set — needs ≥2 matches against title+body combined
  ...TITLE_PHRASES,
  "big data", "data science", "data analytics", "data visualization",
  "data infrastructure", "data integration",
  "LLM", "natural language processing", "computer vision",
  "advanced analytics", "analytics platform",
  "GDPR", "algorithmic bias", "algorithmic fairness",
  "Apache Spark", "Apache Kafka", "Tableau", "Power BI", "Looker",
  "cloud migration", "ETL", "ELT",
  "data warehouse", "data modeling",
];

// Topics that are never relevant to a CDO — reject if title matches
const REJECT_TITLE_PHRASES = [
  "stock price", "stock market", "shares fell", "shares rose",
  "cryptocurrency", "bitcoin", "forex", "trading",
  "electricity bill", "electricity amendment",
  "recipe", "weather forecast", "sports score",
];

function isRelevantToCDO(title: string, content: string | undefined, strict: boolean): boolean {
  const titleLower = title.toLowerCase();
  const fullText = `${title} ${content || ""}`.toLowerCase();

  // Hard reject: title contains off-topic phrases
  if (REJECT_TITLE_PHRASES.some((p) => titleLower.includes(p))) {
    return false;
  }

  // Check 1: Title contains a highly specific CDO phrase → accept
  if (TITLE_PHRASES.some((p) => titleLower.includes(p.toLowerCase()))) {
    return true;
  }

  // Check 2: Body/description contains ≥2 CDO phrases → accept
  // (In strict mode for News API, require ≥3 because sources are noisier)
  const threshold = strict ? 3 : 2;
  const bodyHits = BODY_PHRASES.filter((p) => fullText.includes(p.toLowerCase())).length;
  return bodyHits >= threshold;
}

// ── Source quality filter for News API ────────────────────────────────
// newsdata.io returns articles from random blogs and tabloids.
// Only accept results from publications a CDO would actually read.
const TRUSTED_NEWS_SOURCES = new Set([
  // Major tech/business publications
  "techcrunch", "venturebeat", "zdnet", "wired", "arstechnica",
  "theverge", "thenewstack", "infoworld", "computerworld",
  "informationweek", "cio", "forbes", "fortune", "bloomberg",
  "businessinsider", "hbr", "mit_technology_review", "reuters",
  "wsj", "ft", "economist",
  // Data-specific publications
  "datanami", "kdnuggets", "dataconomy", "analyticsinsight",
  "towardsdatascience", "dataversity", "tdag", "dbta",
  "insidebigdata", "smartdatacollective",
  // AI/ML publications
  "openai", "google_ai_blog", "deepmind", "theaijournal",
  // Governance & privacy
  "iapp", "darkreading", "csoonline",
]);

function isTrustedSource(sourceId: string): boolean {
  // newsdata.io source_id is lowercase, underscore-separated
  const normalized = sourceId.toLowerCase().replace(/[\s-]/g, "_");
  return TRUSTED_NEWS_SOURCES.has(normalized);
}

// ── Category detection ───────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  DATA_STRATEGY: ["data strategy", "data governance", "data management", "data quality", "metadata", "data catalog", "data mesh", "data fabric", "data lakehouse", "chief data officer"],
  AI_ML: ["machine learning", "deep learning", "neural network", "LLM", "generative AI", "GenAI", "artificial intelligence", "NLP", "computer vision", "transformer"],
  ANALYTICS: ["analytics", "business intelligence", "dashboard", "visualization", "reporting", "KPI", "metrics", "data-driven"],
  DATA_ETHICS: ["privacy", "GDPR", "compliance", "regulation", "AI Act", "bias", "fairness", "responsible AI", "ethics", "governance framework"],
  LEADERSHIP: ["leadership", "executive", "C-suite", "board", "organizational change", "culture", "talent", "team building", "stakeholder"],
  TECHNICAL: ["architecture", "infrastructure", "pipeline", "ETL", "database", "SQL", "Spark", "data platform", "lakehouse"],
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

// ── RSS fetching ─────────────────────────────────────────────────────
export async function fetchRSSFeed(
  feedUrl: string,
  source: string,
  defaultCategory: string
): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed.items
      .slice(0, 10)
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
      .filter((item) => isRelevantToCDO(item.title, item.content, false))
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

// ── News API (newsdata.io) ───────────────────────────────────────────
export async function fetchNewsAPI(): Promise<FeedItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  // Highly specific queries — quoted phrases to avoid loose matching
  const queries = [
    '"chief data officer"',
    '"data governance" OR "data strategy"',
    '"AI governance" OR "responsible AI"',
  ];

  const allItems: FeedItem[] = [];

  for (const query of queries) {
    try {
      const res = await fetch(
        `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=en&category=technology,business`
      );
      const data = await res.json();

      if (!data.results) continue;

      const items = data.results
        .filter(
          (item: { source_id: string }) => isTrustedSource(item.source_id)
        )
        .map(
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

      // Strict filtering for News API results (noisier than RSS)
      allItems.push(...items.filter((item: FeedItem) => isRelevantToCDO(item.title, item.content, true)));
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
