// Spotify Web API — fetches real podcast episodes with direct Spotify links.
// Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET env vars.
// Free tier, Client Credentials flow (no user login needed).

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  // Reuse token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    console.error(`Spotify token error: ${res.status}`);
    return null;
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  spotifyUrl: string;
  description: string;
  releaseDate: string;
  durationMs: number;
  image: string;
}

// Podcasts we track — identified by their Spotify show ID for direct lookups.
export const TRACKED_PODCASTS = [
  {
    name: "The Data Chief",
    spotifyShowId: "1RrOJch1xDOkgiM8jbVMil",
    gradient: "from-purple-500 to-blue-500",
    relevance: "CDO career paths and executive leadership",
  },
  {
    name: "Data Engineering Podcast",
    spotifyShowId: "2iMsqFLsHkSAMoOiPUeF4l",
    gradient: "from-green-500 to-teal-500",
    relevance: "Technical data platform knowledge",
  },
  {
    name: "Leaders of Analytics",
    spotifyShowId: "4nBJGBJHMjqd43pMFjkFgH",
    gradient: "from-orange-500 to-red-500",
    relevance: "Analytics leadership and AI strategy",
  },
  {
    name: "The Analytics Power Hour",
    spotifyShowId: "56uru4EQ5lFzRSbgQ79mor",
    gradient: "from-blue-500 to-indigo-500",
    relevance: "Analytics career growth and industry trends",
  },
  {
    name: "Data Skeptic",
    spotifyShowId: "1BZN7LfJJMaeiStp0Elqkj",
    gradient: "from-pink-500 to-rose-500",
    relevance: "ML concepts for data leaders",
  },
];

export interface PodcastWithEpisodes {
  name: string;
  gradient: string;
  relevance: string;
  showUrl: string;
  episodes: PodcastEpisode[];
}

async function fetchShowEpisodes(
  token: string,
  showId: string,
  limit: number = 3
): Promise<PodcastEpisode[]> {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/shows/${showId}/episodes?market=US&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      console.error(`Spotify episodes error for ${showId}: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) return [];

    return data.items.map((ep: Record<string, unknown>) => ({
      id: ep.id as string,
      title: (ep.name as string) || "Untitled Episode",
      spotifyUrl: ((ep.external_urls as Record<string, string>)?.spotify) || `https://open.spotify.com/episode/${ep.id}`,
      description: ((ep.description as string) || "").slice(0, 300),
      releaseDate: (ep.release_date as string) || "",
      durationMs: (ep.duration_ms as number) || 0,
      image: ((ep.images as Array<{ url: string }>)?.[0]?.url) || "",
    }));
  } catch (error) {
    console.error(`Failed to fetch episodes for show ${showId}:`, error);
    return [];
  }
}

export async function fetchAllPodcastEpisodes(): Promise<PodcastWithEpisodes[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const results = await Promise.allSettled(
    TRACKED_PODCASTS.map(async (podcast) => {
      const episodes = await fetchShowEpisodes(token, podcast.spotifyShowId, 3);
      return {
        name: podcast.name,
        gradient: podcast.gradient,
        relevance: podcast.relevance,
        showUrl: `https://open.spotify.com/show/${podcast.spotifyShowId}`,
        episodes,
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<PodcastWithEpisodes> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((p) => p.episodes.length > 0);
}

export function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return "";
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}
