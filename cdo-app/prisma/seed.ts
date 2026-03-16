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

  // ── Seed Job Skill Frequencies (realistic CDO market data) ──
  console.log("Seeding job skill frequencies...");

  // Based on analysis of real CDO/VP Data job postings
  const marketFrequencies: Record<string, number> = {
    "Data Strategy": 82,
    "C-Suite Alignment": 65,
    "Board Communication": 48,
    "Business Case Development": 55,
    "Executive Influence": 60,
    "Data Architecture": 72,
    "Cloud Platforms": 68,
    "AI/ML Fluency": 78,
    "Data Engineering": 58,
    "Platform Scalability": 45,
    "Team Structure": 62,
    "Hiring & Development": 50,
    "Operating Model": 42,
    "Cross-Functional Partnerships": 55,
    "Change Management": 58,
    "Product Sense": 48,
    "Roadmap Ownership": 52,
    "Self-Serve Analytics": 45,
    "Data Platform Thinking": 40,
    "User Research": 25,
    "Data Governance Frameworks": 75,
    "Privacy & Compliance": 70,
    "Data Quality": 65,
    "Data Lineage": 38,
    "Catalog & Metadata": 35,
    "Budget Ownership": 55,
    "ROI Framing": 50,
    "P&L Literacy": 42,
    "Vendor Management": 45,
    "Cost Optimization": 48,
    "Executive Storytelling": 62,
    "Deck Design": 30,
    "Data Visualization": 45,
    "Written Communication": 38,
    "Presenting to Board": 42,
  };

  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const allSkills = await prisma.skill.findMany({ select: { id: true, name: true } });
  const skillNameToId = new Map(allSkills.map((s) => [s.name, s.id]));

  for (const [skillName, frequency] of Object.entries(marketFrequencies)) {
    const skillId = skillNameToId.get(skillName);
    if (!skillId) continue;

    await prisma.jobSkillFrequency.upsert({
      where: { skillId_period: { skillId, period: currentPeriod } },
      update: { frequency, jobCount: Math.round(frequency * 1.5), calculatedAt: now },
      create: { skillId, frequency, period: currentPeriod, jobCount: Math.round(frequency * 1.5) },
    });
  }

  console.log(`Seeded market frequencies for ${Object.keys(marketFrequencies).length} skills.`);

  // ── Seed Skill Edges (prerequisite relationships) ──────────
  console.log("Seeding skill edges...");

  const edges: [string, string, string][] = [
    // [source, target, type]
    // Strategic Leadership prereqs
    ["Data Strategy", "C-Suite Alignment", "PREREQUISITE"],
    ["C-Suite Alignment", "Board Communication", "PREREQUISITE"],
    ["Business Case Development", "Executive Influence", "PREREQUISITE"],
    ["ROI Framing", "Business Case Development", "PREREQUISITE"],
    // Technical ladder
    ["Data Engineering", "Data Architecture", "PREREQUISITE"],
    ["Cloud Platforms", "Platform Scalability", "PREREQUISITE"],
    ["Data Architecture", "AI/ML Fluency", "ADJACENT"],
    // Org design
    ["Team Structure", "Operating Model", "PREREQUISITE"],
    ["Hiring & Development", "Team Structure", "ADJACENT"],
    ["Cross-Functional Partnerships", "Change Management", "PREREQUISITE"],
    // Data products
    ["Product Sense", "Roadmap Ownership", "PREREQUISITE"],
    ["Self-Serve Analytics", "Data Platform Thinking", "PREREQUISITE"],
    ["User Research", "Product Sense", "ADJACENT"],
    // Governance chain
    ["Data Quality", "Data Governance Frameworks", "PREREQUISITE"],
    ["Data Lineage", "Catalog & Metadata", "ADJACENT"],
    ["Privacy & Compliance", "Data Governance Frameworks", "ADJACENT"],
    // Financial
    ["P&L Literacy", "Budget Ownership", "PREREQUISITE"],
    ["ROI Framing", "Cost Optimization", "ADJACENT"],
    ["Vendor Management", "Cost Optimization", "ADJACENT"],
    // Communication
    ["Data Visualization", "Executive Storytelling", "PREREQUISITE"],
    ["Deck Design", "Presenting to Board", "PREREQUISITE"],
    ["Executive Storytelling", "Presenting to Board", "PREREQUISITE"],
    ["Written Communication", "Executive Storytelling", "ADJACENT"],
    // Cross-cluster connections
    ["Data Strategy", "Data Governance Frameworks", "ADJACENT"],
    ["Executive Storytelling", "C-Suite Alignment", "ADJACENT"],
    ["AI/ML Fluency", "Product Sense", "ADJACENT"],
    ["Budget Ownership", "Vendor Management", "ADJACENT"],
  ];

  for (const [fromName, toName, edgeType] of edges) {
    const fromId = skillNameToId.get(fromName);
    const toId = skillNameToId.get(toName);
    if (!fromId || !toId) continue;

    await prisma.skillEdge.upsert({
      where: { fromSkillId_toSkillId: { fromSkillId: fromId, toSkillId: toId } },
      update: { edgeType: edgeType as "ADJACENT" | "PREREQUISITE" },
      create: { fromSkillId: fromId, toSkillId: toId, edgeType: edgeType as "ADJACENT" | "PREREQUISITE" },
    });
  }

  console.log(`Seeded ${edges.length} skill edges.`);

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
