import { PrismaClient } from "@prisma/client";
import { seedContent } from "../src/data/seed-content";
import { TAXONOMY } from "../src/data/taxonomy";

const prisma = new PrismaClient();

async function main() {
  // ── Seed Content ────────────────────────────────────────────
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

  // ── Seed Skill Taxonomy ─────────────────────────────────────
  console.log("Seeding skill taxonomy...");

  for (let ci = 0; ci < TAXONOMY.length; ci++) {
    const cluster = TAXONOMY[ci];
    const dbCluster = await prisma.skillCluster.upsert({
      where: { name: cluster.name },
      update: { description: cluster.description, order: ci },
      create: { name: cluster.name, description: cluster.description, order: ci },
    });

    for (let si = 0; si < cluster.skills.length; si++) {
      const skill = cluster.skills[si];
      await prisma.skill.upsert({
        where: { name: skill.name },
        update: {
          description: skill.description,
          anchors: skill.anchors,
          order: si,
          clusterId: dbCluster.id,
        },
        create: {
          name: skill.name,
          description: skill.description,
          anchors: skill.anchors,
          order: si,
          clusterId: dbCluster.id,
        },
      });
    }
  }

  console.log(`Seeded ${TAXONOMY.length} clusters, ${TAXONOMY.reduce((s, c) => s + c.skills.length, 0)} skills.`);

  // ── Seed Invite Codes ──────────────────────────────────────
  console.log("Seeding invite codes...");

  const inviteCodes = ["CDO-ALPHA-2026", "CDO-BETA-2026", "CDO-GAMMA-2026", "CDO-DELTA-2026", "CDO-EPSILON-2026"];
  for (const code of inviteCodes) {
    await prisma.inviteCode.upsert({
      where: { code },
      update: {},
      create: { code },
    });
  }

  console.log(`Seeded ${inviteCodes.length} invite codes.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
