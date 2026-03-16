import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";
import { generateGapNarrative } from "@/lib/ai";

/**
 * GET /api/gap-engine
 * Returns the user's gap analysis: top gaps, frequencies, and narrative.
 */
export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  // Get user's skill proficiencies
  const proficiencies = await prisma.userSkillProficiency.findMany({
    where: { userId },
    include: { skill: { include: { cluster: true } } },
  });

  // Get all skills with latest frequencies
  const skills = await prisma.skill.findMany({
    include: {
      cluster: true,
      jobFrequencies: {
        orderBy: { period: "desc" },
        take: 6, // last 6 periods for trend
      },
    },
  });

  const profMap = new Map(proficiencies.map((p) => [p.skillId, p.level]));

  const levelToNum: Record<string, number> = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    PROFICIENT: 2,
    EXPERT: 3,
  };

  // Compute gap scores
  const gaps = skills.map((skill) => {
    const level = profMap.get(skill.id) || "NOT_STARTED";
    const profNum = levelToNum[level] ?? 0;
    const latestFreq = skill.jobFrequencies[0]?.frequency || 0;

    // Gap score: high frequency + low proficiency = high gap
    const gapScore = latestFreq > 0
      ? Math.round(latestFreq * (3 - profNum) / 3)
      : 0;

    // Trend: compare last 3 periods
    const freqs = skill.jobFrequencies.map((f) => f.frequency);
    let trend: "up" | "down" | "stable" = "stable";
    if (freqs.length >= 2) {
      const recent = freqs.slice(0, Math.min(3, freqs.length));
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const older = freqs.slice(Math.min(3, freqs.length));
      if (older.length > 0) {
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        if (avg > olderAvg + 5) trend = "up";
        else if (avg < olderAvg - 5) trend = "down";
      }
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      clusterId: skill.cluster.id,
      clusterName: skill.cluster.name,
      marketFrequency: latestFreq,
      userProficiency: profNum,
      proficiencyLevel: level,
      gapScore,
      trend,
      frequencyHistory: skill.jobFrequencies.map((f) => ({
        period: f.period,
        frequency: f.frequency,
      })).reverse(),
    };
  });

  // Sort by gap score descending
  gaps.sort((a, b) => b.gapScore - a.gapScore);

  // Generate narrative for top 5 gaps
  const topGaps = gaps.filter((g) => g.gapScore > 0).slice(0, 5);
  let narrative = "";
  if (topGaps.length > 0) {
    try {
      narrative = await generateGapNarrative(topGaps);
    } catch (err) {
      console.error("Gap narrative generation failed:", err);
      narrative = "Unable to generate gap analysis narrative at this time.";
    }
  }

  // Job stats
  const totalJobs = await prisma.jobPosting.count();
  const latestJob = await prisma.jobPosting.findFirst({
    orderBy: { fetchedAt: "desc" },
    select: { fetchedAt: true },
  });

  return NextResponse.json({
    gaps,
    topGaps,
    narrative,
    stats: {
      totalJobs,
      lastRefreshed: latestJob?.fetchedAt || null,
      skillsCovered: gaps.filter((g) => g.marketFrequency > 0).length,
    },
  });
}
