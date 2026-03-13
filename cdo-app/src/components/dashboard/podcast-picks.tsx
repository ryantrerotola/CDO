"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Headphones,
  Play,
  ExternalLink,
  Clock,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

interface PodcastEpisode {
  id: string;
  podcastName: string;
  episodeTitle: string;
  host: string;
  duration: string;
  description: string;
  url: string;
  spotifyUrl: string;
  relevance: string;
  gradient: string;
}

const recommendedEpisodes: PodcastEpisode[] = [
  {
    id: "1",
    podcastName: "The Data Chief",
    episodeTitle: "From VP Analytics to CDO: What Changes",
    host: "ThoughtSpot",
    duration: "42 min",
    description:
      "A Fortune 500 CDO shares the biggest surprises in transitioning from VP Analytics to the C-suite, including board communication and org design.",
    url: "https://thoughtspot.com/data-chief",
    spotifyUrl: "https://open.spotify.com/show/7hJCWLsVaoqR7YTkWoyoOI",
    relevance: "Directly relevant to your career path",
    gradient: "from-purple-500 to-blue-500",
  },
  {
    id: "2",
    podcastName: "Data Engineering Podcast",
    episodeTitle: "Building a Data Products Operating Model",
    host: "Tobias Macey",
    duration: "55 min",
    description:
      "Deep dive into implementing the data products approach — from identifying domains to measuring adoption and setting SLAs.",
    url: "https://www.dataengineeringpodcast.com",
    spotifyUrl: "https://open.spotify.com/show/2iLvljRGVVIGlJshT5vNDS",
    relevance: "Connects to today's trending topic",
    gradient: "from-green-500 to-teal-500",
  },
  {
    id: "3",
    podcastName: "Leaders of Analytics",
    episodeTitle: "AI Governance: A CDO's Practical Guide",
    host: "Jonas Christensen",
    duration: "38 min",
    description:
      "How to build an AI governance program from scratch, covering framework selection, stakeholder buy-in, and risk assessment workflows.",
    url: "https://leadersofanalytics.com",
    spotifyUrl: "https://open.spotify.com/show/4TMA1ASzWil1Y6y7hbwpWJ",
    relevance: "Builds on your AI/ML skill development",
    gradient: "from-orange-500 to-red-500",
  },
];

export function PodcastPicks() {
  const [savedEpisodes, setSavedEpisodes] = useState<Set<string>>(new Set());
  const [playingId, setPlayingId] = useState<string | null>(null);

  const toggleSave = (id: string) => {
    setSavedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-[var(--primary)]" />
          Podcast Picks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendedEpisodes.map((ep) => {
          const isSaved = savedEpisodes.has(ep.id);
          return (
            <div
              key={ep.id}
              className="group border rounded-lg p-4 hover:border-[var(--primary)] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ep.gradient} flex items-center justify-center flex-shrink-0`}
                >
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-[var(--primary)]">
                      {ep.podcastName}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {ep.duration}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium leading-snug mb-1">
                    {ep.episodeTitle}
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {ep.description}
                  </p>
                  <p className="text-xs text-[var(--primary)] mt-1.5 italic">
                    {ep.relevance}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={ep.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#1DB954] text-white hover:bg-[#1ed760] transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                      </svg>
                      Listen on Spotify
                    </a>
                    <button
                      onClick={() => toggleSave(ep.id)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        isSaved
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="h-3 w-3" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-3 w-3" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <a
          href="/resources"
          className="block text-center text-xs text-[var(--primary)] hover:underline mt-2"
        >
          View all podcasts in Resources
        </a>
      </CardContent>
    </Card>
  );
}
