import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchCDOJobs, type NormalizedJob } from "@/lib/jobs";
import { extractSkillsFromJD } from "@/lib/ai";

/**
 * POST /api/gap-engine/ingest
 * Fetches CDO job postings from Adzuna, extracts skills, and stores them.
 * Called by the weekly cron job or manually.
 */
export const maxDuration = 60; // Allow up to 60s for Vercel

export async function POST() {
  try {
    // Check API credentials
    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
      return NextResponse.json(
        { error: "Adzuna API credentials not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to your .env file." },
        { status: 500 }
      );
    }

    let jobs: NormalizedJob[];
    try {
      jobs = await fetchCDOJobs();
    } catch (err) {
      console.error("Adzuna API call failed:", err);
      return NextResponse.json(
        { error: `Adzuna API call failed: ${err instanceof Error ? err.message : "Unknown error"}. Check your ADZUNA_APP_ID and ADZUNA_APP_KEY.` },
        { status: 500 }
      );
    }

    if (jobs.length === 0) {
      return NextResponse.json({
        message: "No jobs returned from Adzuna. This may be a rate limit or credential issue.",
        count: 0,
      });
    }

    // Filter to only new jobs
    const existingIds = new Set(
      (await prisma.jobPosting.findMany({
        where: { sourceId: { in: jobs.map((j) => j.sourceId) } },
        select: { sourceId: true },
      })).map((j) => j.sourceId)
    );

    const newJobs = jobs.filter((j) => !existingIds.has(j.sourceId));

    if (newJobs.length === 0) {
      // Still recalculate frequencies in case they're stale
      await recalculateFrequencies();
      return NextResponse.json({
        message: `All ${jobs.length} jobs already ingested. Frequencies recalculated.`,
        totalFetched: jobs.length,
        newCount: 0,
      });
    }

    // Process jobs in batches of 5 to avoid timeouts
    let extractedCount = 0;
    const BATCH_SIZE = 5;

    for (let i = 0; i < newJobs.length; i += BATCH_SIZE) {
      const batch = newJobs.slice(i, i + BATCH_SIZE);

      // Extract skills in parallel for the batch
      const results = await Promise.allSettled(
        batch.map(async (job) => {
          let skills: string[] = [];
          try {
            skills = await extractSkillsFromJD(job.description);
            extractedCount++;
          } catch (err) {
            console.error(`Skill extraction failed for ${job.sourceId}:`, err);
          }
          return { job, skills };
        })
      );

      // Save the batch
      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        const { job, skills } = result.value;

        await prisma.jobPosting.create({
          data: {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description.slice(0, 10000),
            url: job.url,
            source: "adzuna",
            sourceId: job.sourceId,
            skills,
            salary: job.salary,
          },
        });
      }
    }

    // Recalculate skill frequencies
    await recalculateFrequencies();

    return NextResponse.json({
      message: `Ingested ${newJobs.length} new jobs, extracted skills for ${extractedCount}`,
      totalFetched: jobs.length,
      newCount: newJobs.length,
      extractedCount,
    });
  } catch (error) {
    console.error("Job ingestion error:", error);
    return NextResponse.json(
      { error: `Job ingestion failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

async function recalculateFrequencies() {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Get all jobs from the last 90 days (broader window for more data)
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const jobs = await prisma.jobPosting.findMany({
    where: { fetchedAt: { gte: cutoff } },
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
