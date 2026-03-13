import { PrismaClient } from "@prisma/client";
import { seedContent } from "../src/data/seed-content";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding content...");

  for (const item of seedContent) {
    await prisma.content.upsert({
      where: { url: item.url },
      update: {
        title: item.title,
        summary: item.summary,
        relevanceScore: 1.0,
        tags: item.tags,
      },
      create: {
        title: item.title,
        url: item.url,
        source: item.source,
        author: item.author,
        summary: item.summary,
        category: item.category,
        contentType: item.contentType,
        relevanceScore: 1.0,
        tags: item.tags,
      },
    });
  }

  console.log(`Seeded ${seedContent.length} content items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
