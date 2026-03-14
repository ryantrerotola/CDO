import crypto from "crypto";

// Podcast Index API — free, open index of podcasts with episode-level data.
// Get credentials at https://api.podcastindex.org
// Requires PODCAST_INDEX_KEY and PODCAST_INDEX_SECRET env vars.

function getAuthHeaders() {
  const apiKey = process.env.PODCAST_INDEX_KEY;
  const apiSecret = process.env.PODCAST_INDEX_SECRET;
  if (!apiKey || !apiSecret) return null;

  const ts = Math.floor(Date.now() / 1000);
  const hash = crypto
    .createHash("sha1")
    .update(apiKey + apiSecret + ts)
    .digest("hex");

  return {
    "User-Agent": "CDOCareerGrowthApp/1.0",
    "X-Auth-Key": apiKey,
    "X-Auth-Date": ts.toString(),
    "Authorization": hash,
  };
}

export interface PodcastEpisode {
  id: number;
  title: string;
  link: string;
  description: string;
  datePublished: number;
  datePublishedPretty: string;
  duration: number;
  enclosureUrl: string;
  feedTitle: string;
  feedImage: string;
  image: string;
}

// Podcasts we track — identified by their RSS feed URL so Podcast Index
// can look up episodes directly without fuzzy search.
export const TRACKED_PODCASTS = [
  {
    name: "The Data Chief",
    feedUrl: "https://feeds.simplecast.com/PK_MbMKg",
    gradient: "from-purple-500 to-blue-500",
    relevance: "CDO career paths and executive leadership",
  },
  {
    name: "Data Engineering Podcast",
    feedUrl: "https://www.dataengineeringpodcast.com/feed/ogg/",
    gradient: "from-green-500 to-teal-500",
    relevance: "Technical data platform knowledge",
  },
  {
    name: "Leaders of Analytics",
    feedUrl: "https://feeds.buzzsprout.com/1546007.rss",
    gradient: "from-orange-500 to-red-500",
    relevance: "Analytics leadership and AI strategy",
  },
  {
    name: "The Analytics Power Hour",
    feedUrl: "https://feeds.simplecast.com/sVH_gOT0",
    gradient: "from-blue-500 to-indigo-500",
    relevance: "Analytics career growth and industry trends",
  },
  {
    name: "Data Skeptic",
    feedUrl: "https://dataskeptic.libsyn.com/rss",
    gradient: "from-pink-500 to-rose-500",
    relevance: "ML concepts for data leaders",
  },
];

export interface PodcastWithEpisodes {
  name: string;
  gradient: string;
  relevance: string;
  episodes: PodcastEpisode[];
}

export async function fetchEpisodesForPodcast(
  feedUrl: string,
  max: number = 3
): Promise<PodcastEpisode[]> {
  const headers = getAuthHeaders();
  if (!headers) return [];

  try {
    const url = `https://api.podcastindex.org/api/1.0/episodes/byfeedurl?url=${encodeURIComponent(feedUrl)}&max=${max}&fulltext`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      console.error(`Podcast Index API error for ${feedUrl}: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) return [];

    return data.items.map((item: Record<string, unknown>) => ({
      id: item.id,
      title: item.title || "Untitled Episode",
      link: item.link || "",
      description: (item.description as string || "").replace(/<[^>]*>/g, "").slice(0, 300),
      datePublished: item.datePublished,
      datePublishedPretty: item.datePublishedPretty || "",
      duration: item.duration || 0,
      enclosureUrl: item.enclosureUrl || "",
      feedTitle: item.feedTitle || "",
      feedImage: item.feedImage || "",
      image: (item.image as string) || (item.feedImage as string) || "",
    }));
  } catch (error) {
    console.error(`Failed to fetch episodes for ${feedUrl}:`, error);
    return [];
  }
}

export async function fetchAllPodcastEpisodes(): Promise<PodcastWithEpisodes[]> {
  const results = await Promise.allSettled(
    TRACKED_PODCASTS.map(async (podcast) => {
      const episodes = await fetchEpisodesForPodcast(podcast.feedUrl, 3);
      return {
        name: podcast.name,
        gradient: podcast.gradient,
        relevance: podcast.relevance,
        episodes,
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<PodcastWithEpisodes> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((p) => p.episodes.length > 0);
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}
