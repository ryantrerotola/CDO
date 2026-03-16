import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchCDOJobs } from "@/lib/jobs";
import { extractSkillsFromJD } from "@/lib/ai";

/**
 * POST /api/gap-engine/ingest
 * Fetches CDO job postings from Adzuna, extracts skills, and stores them.
 * Called by the weekly cron job or manually.
 */
export async function POST() {
  try {
    const jobs = await fetchCDOJobs();

    if (jobs.length === 0) {
      return NextResponse.json({ message: "No jobs fetched", count: 0 });
    }

    let newCount = 0;
    let extractedCount = 0;

    for (const job of jobs) {
      // Skip if already ingested
      const existing = await prisma.jobPosting.findUnique({
        where: { sourceId: job.sourceId },
      });
      if (existing) continue;

      // Extract skills from JD using Claude
      let skills: string[] = [];
      try {
        skills = await extractSkillsFromJD(job.description);
        extractedCount++;
      } catch (err) {
        console.error(`Skill extraction failed for ${job.sourceId}:`, err);
      }

      await prisma.jobPosting.create({
        data: {
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description.slice(0, 10000), // cap at 10K chars
          url: job.url,
          source: "adzuna",
          sourceId: job.sourceId,
          skills,
          salary: job.salary,
        },
      });

      newCount++;
    }

    // Recalculate skill frequencies
    await recalculateFrequencies();

    return NextResponse.json({
      message: `Ingested ${newCount} new jobs, extracted skills for ${extractedCount}`,
      totalFetched: jobs.length,
      newCount,
      extractedCount,
    });
  } catch (error) {
    console.error("Job ingestion error:", error);
    return NextResponse.json(
      { error: "Job ingestion failed" },
      { status: 500 }
    );
  }
}

async function recalculateFrequencies() {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Get all jobs from this period
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const jobs = await prisma.jobPosting.findMany({
    where: { fetchedAt: { gte: startOfMonth } },
    select: { skills: true },
  });

  if (jobs.length === 0) return;

  // Count skill mentions
  const skillCounts = new Map<string, number>();
  for (const job of jobs) {
    const skills = (job.skills as string[]) || [];
    for (const skill of skills) {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    }
  }

  // Get all skills from DB
  const allSkills = await prisma.skill.findMany({ select: { id: true, name: true } });
  const nameToId = new Map(allSkills.map((s) => [s.name, s.id]));

  // Upsert frequencies
  for (const [skillName, count] of skillCounts) {
    const skillId = nameToId.get(skillName);
    if (!skillId) continue;

    const frequency = Math.round((count / jobs.length) * 100);

    await prisma.jobSkillFrequency.upsert({
      where: { skillId_period: { skillId, period } },
      update: { frequency, jobCount: count, calculatedAt: now },
      create: { skillId, frequency, period, jobCount: count },
    });
  }
}
