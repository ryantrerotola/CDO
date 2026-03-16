/**
 * Adzuna Job API client for fetching CDO/VP Data job postings.
 * Free tier: 250 calls/month. We use ~4 calls/week (paginated).
 */

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || "";
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || "";
const BASE_URL = "https://api.adzuna.com/v1/api/jobs";

interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  created: string;
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

export interface NormalizedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  sourceId: string;
  salary: string | null;
}

const SEARCH_QUERIES = [
  "Chief Data Officer",
  "VP Data",
  "Vice President Data",
  "Head of Data",
  "SVP Data",
  "CDO Data",
];

export async function fetchCDOJobs(country = "us", maxPages = 2): Promise<NormalizedJob[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.warn("Adzuna API credentials not configured, skipping job fetch");
    return [];
  }

  const allJobs: NormalizedJob[] = [];
  const seenIds = new Set<string>();

  for (const query of SEARCH_QUERIES) {
    for (let page = 1; page <= maxPages; page++) {
      try {
        const params = new URLSearchParams({
          app_id: ADZUNA_APP_ID,
          app_key: ADZUNA_APP_KEY,
          results_per_page: "20",
          what: query,
          content_type: "application/json",
        });

        const res = await fetch(
          `${BASE_URL}/${country}/search/${page}?${params}`,
          { next: { revalidate: 0 } }
        );

        if (!res.ok) {
          console.error(`Adzuna API error: ${res.status} for query "${query}"`);
          break;
        }

        const data: AdzunaResponse = await res.json();

        for (const job of data.results) {
          const id = String(job.id);
          if (seenIds.has(id)) continue;
          seenIds.add(id);

          allJobs.push({
            title: job.title,
            company: job.company?.display_name || "Unknown",
            location: job.location?.display_name || "Remote",
            description: job.description,
            url: job.redirect_url,
            sourceId: `adzuna-${id}`,
            salary:
              job.salary_min && job.salary_max
                ? `$${Math.round(job.salary_min / 1000)}K - $${Math.round(job.salary_max / 1000)}K`
                : null,
          });
        }

        if (data.results.length < 20) break; // no more pages
      } catch (err) {
        console.error(`Error fetching Adzuna jobs for "${query}":`, err);
        break;
      }
    }
  }

  return allJobs;
}
