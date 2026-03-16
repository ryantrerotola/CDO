import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

/**
 * GET /api/skill-graph
 * Returns all clusters, skills, edges, user proficiencies, and market frequencies.
 */
export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const clusters = await prisma.skillCluster.findMany({
    include: {
      skills: {
        include: {
          proficiencies: { where: { userId } },
          jobFrequencies: { orderBy: { period: "desc" }, take: 1 },
          edgesFrom: true,
          edgesTo: true,
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  const result = clusters.map((cluster) => ({
    id: cluster.id,
    name: cluster.name,
    description: cluster.description,
    order: cluster.order,
    skills: cluster.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      anchors: skill.anchors,
      order: skill.order,
      proficiency: skill.proficiencies[0]?.level || "NOT_STARTED",
      marketFrequency: skill.jobFrequencies[0]?.frequency || 0,
      edges: [
        ...skill.edgesFrom.map((e) => ({ target: e.toSkillId, type: e.edgeType })),
        ...skill.edgesTo.map((e) => ({ target: e.fromSkillId, type: e.edgeType })),
      ],
    })),
  }));

  return NextResponse.json(result);
}

/**
 * PATCH /api/skill-graph
 * Update a user's skill proficiency.
 */
export async function PATCH(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { skillId, level } = await request.json();

  if (!skillId || !level) {
    return NextResponse.json({ error: "skillId and level required" }, { status: 400 });
  }

  const valid = ["NOT_STARTED", "IN_PROGRESS", "PROFICIENT", "EXPERT"];
  if (!valid.includes(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }

  const proficiency = await prisma.userSkillProficiency.upsert({
    where: { userId_skillId: { userId, skillId } },
    update: { level },
    create: { userId, skillId, level },
  });

  return NextResponse.json(proficiency);
}
