import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedContent = [
  {
    title: "The Evolving Role of the Chief Data Officer in 2026",
    url: "https://hbr.org/2026/01/the-evolving-role-of-the-cdo",
    source: "Harvard Business Review",
    author: "Thomas Davenport",
    summary:
      "The CDO role has shifted from data management to strategic business transformation. Modern CDOs must balance technical expertise with business acumen, leading AI initiatives while ensuring data governance.",
    category: "LEADERSHIP" as const,
    contentType: "ARTICLE" as const,
    tags: ["CDO role", "leadership", "strategy"],
  },
  {
    title: "Data Mesh Architecture: A Practical Guide",
    url: "https://martinfowler.com/articles/data-mesh-guide",
    source: "Martin Fowler",
    author: "Zhamak Dehghani",
    summary:
      "Data mesh decentralizes data ownership to domain teams while maintaining federated governance. This guide covers the four principles: domain ownership, data as a product, self-serve platform, and federated governance.",
    category: "TECHNICAL" as const,
    contentType: "ARTICLE" as const,
    tags: ["data mesh", "architecture", "governance"],
  },
  {
    title: "Building a Data-Driven Culture: Lessons from Fortune 500 CDOs",
    url: "https://mckinsey.com/data-driven-culture-2026",
    source: "McKinsey Digital",
    summary:
      "Interviews with 50 Fortune 500 CDOs reveal that culture change is the biggest challenge. Successful CDOs invest 60% of their time in people and process, not technology.",
    category: "LEADERSHIP" as const,
    contentType: "ARTICLE" as const,
    tags: ["culture", "change management", "leadership"],
  },
  {
    title: "The EU AI Act: What Data Leaders Need to Know",
    url: "https://iapp.org/eu-ai-act-data-leaders",
    source: "IAPP",
    summary:
      "The EU AI Act creates new obligations for organizations using AI systems. CDOs must ensure data quality, maintain documentation, and implement risk assessments for high-risk AI applications.",
    category: "DATA_ETHICS" as const,
    contentType: "ARTICLE" as const,
    tags: ["AI Act", "regulation", "compliance", "EU"],
  },
  {
    title: "Chief Data Officer's Playbook",
    url: "https://amazon.com/chief-data-officers-playbook",
    source: "Book",
    author: "Caroline Carruthers & Peter Jackson",
    summary:
      "The definitive guide to the CDO role covering data strategy, governance frameworks, stakeholder management, and building high-performing data teams.",
    category: "DATA_STRATEGY" as const,
    contentType: "BOOK" as const,
    tags: ["CDO", "strategy", "governance", "must-read"],
  },
  {
    title: "AI Governance Frameworks: A Comparative Analysis",
    url: "https://nist.gov/ai-governance-frameworks-comparison",
    source: "NIST",
    summary:
      "Comparison of major AI governance frameworks including NIST AI RMF, EU AI Act, and ISO 42001. Practical guidance for CDOs implementing responsible AI programs.",
    category: "AI_ML" as const,
    contentType: "ARTICLE" as const,
    tags: ["AI governance", "NIST", "frameworks", "responsible AI"],
  },
  {
    title: "Snowflake vs Databricks: The Modern Data Platform Decision",
    url: "https://towardsdatascience.com/snowflake-vs-databricks-2026",
    source: "Towards Data Science",
    summary:
      "A technical comparison of the two dominant data platforms. Covers lakehouse architecture, cost models, governance features, and when to choose each platform.",
    category: "TECHNICAL" as const,
    contentType: "ARTICLE" as const,
    tags: ["Snowflake", "Databricks", "data platform", "lakehouse"],
  },
  {
    title: "Data Governance: How to Design, Deploy and Sustain",
    url: "https://amazon.com/data-governance-john-ladley",
    source: "Book",
    author: "John Ladley",
    summary:
      "Practical handbook for implementing enterprise data governance programs. Covers organizational design, stewardship models, metrics, and sustaining governance over time.",
    category: "DATA_STRATEGY" as const,
    contentType: "BOOK" as const,
    tags: ["governance", "implementation", "stewardship"],
  },
];

async function main() {
  console.log("Seeding content...");

  for (const item of seedContent) {
    await prisma.content.upsert({
      where: { url: item.url },
      update: {},
      create: {
        title: item.title,
        url: item.url,
        source: item.source,
        author: item.author,
        summary: item.summary,
        category: item.category,
        contentType: item.contentType,
        tags: item.tags,
      },
    });
  }

  console.log(`Seeded ${seedContent.length} content items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
