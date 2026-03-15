import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchAllPodcastEpisodes, getTrackedPodcasts } from "@/lib/podcast";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // If logged in, use their tracked podcasts; otherwise use defaults
    const podcasts = userId ? await getTrackedPodcasts(userId) : undefined;
    const episodes = await fetchAllPodcastEpisodes(podcasts);

    return NextResponse.json(episodes, {
      headers: {
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
