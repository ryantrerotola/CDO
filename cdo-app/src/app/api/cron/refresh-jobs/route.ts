import { NextResponse } from "next/server";

/**
 * GET /api/cron/refresh-jobs
 * Vercel cron endpoint — triggers weekly job ingestion.
 * Configure in vercel.json: { "crons": [{ "path": "/api/cron/refresh-jobs", "schedule": "0 6 * * 1" }] }
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Call the ingestion endpoint internally
    const baseUrl = process.env.NEXTAUTH_URL || "https://cdo-ochre.vercel.app";
    const res = await fetch(`${baseUrl}/api/gap-engine/ingest`, {
      method: "POST",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Cron job refresh failed:", error);
    return NextResponse.json(
      { error: "Cron job refresh failed" },
      { status: 500 }
    );
  }
}
