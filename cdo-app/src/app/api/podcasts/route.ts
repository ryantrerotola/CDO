import { NextResponse } from "next/server";
import { fetchAllPodcastEpisodes } from "@/lib/podcast";

export async function GET() {
  try {
    const podcasts = await fetchAllPodcastEpisodes();

    return NextResponse.json(podcasts, {
      headers: {
        // Cache for 2 hours — episodes don't change that often
        "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Failed to fetch podcast episodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch podcast episodes" },
      { status: 500 }
    );
  }
}
