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
    relevance: "Connects to today's trending topic",
    gradient: "from-green-500 to-teal-500",
  },
  {
    id: "3",
    podcastName: "Leaders of Analytics",
    episodeTitle: "AI Governance: A CDO's Practical Guide",
    host: "Jeremy Roberts",
    duration: "38 min",
    description:
      "How to build an AI governance program from scratch, covering framework selection, stakeholder buy-in, and risk assessment workflows.",
    url: "https://leadersofanalytics.com",
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
                      href={ep.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
                    >
                      <Play className="h-3 w-3" />
                      Listen
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
