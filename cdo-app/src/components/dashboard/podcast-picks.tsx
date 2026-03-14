"use client";

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Headphones,
  Clock,
  Bookmark,
  BookmarkCheck,
  Check,
  X,
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

function spotifyEpisodeSearchUrl(podcastName: string, episodeTitle: string): string {
  // Use "show episode" format and strip noise so Spotify finds the right result
  const cleaned = `${podcastName} ${episodeTitle}`
    .replace(/[:\-–—|]/g, " ")
    .replace(/\b(episode|ep\.?|#\d+)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return `https://open.spotify.com/search/${encodeURIComponent(cleaned)}/episodes`;
}

const SWIPE_THRESHOLD = 100;
const MAX_SWIPE = 150;

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
    host: "Jonas Christensen",
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
  const [listenedEpisodes, setListenedEpisodes] = useState<Set<string>>(new Set());
  const [dismissedEpisodes, setDismissedEpisodes] = useState<Set<string>>(new Set());
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);

  const toggleSave = (id: string) => {
    setSavedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markListened = (id: string) => {
    setListenedEpisodes((prev) => new Set(prev).add(id));
    // Track for goal progress
    fetch("/api/goals/log-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "PODCAST" }),
    })
      .then(() => window.dispatchEvent(new CustomEvent("goal-progress")))
      .catch(() => {});
  };

  const dismissEpisode = (id: string) => {
    setDismissedEpisodes((prev) => new Set(prev).add(id));
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipingId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipingId) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setSwipeOffset(Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff)));
  };

  const handleTouchEnd = () => {
    if (swipingId) {
      if (swipeOffset < -SWIPE_THRESHOLD) {
        dismissEpisode(swipingId);
      } else if (swipeOffset > SWIPE_THRESHOLD) {
        markListened(swipingId);
      }
    }
    setSwipingId(null);
    setSwipeOffset(0);
  };

  const visibleEpisodes = recommendedEpisodes.filter(
    (ep) => !dismissedEpisodes.has(ep.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-[var(--primary)]" />
          Podcast Picks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleEpisodes.map((ep) => {
          const isSaved = savedEpisodes.has(ep.id);
          const isListened = listenedEpisodes.has(ep.id);
          const isSwiping = swipingId === ep.id;
          const swipingRight = isSwiping && swipeOffset > 0;
          const swipingLeft = isSwiping && swipeOffset < 0;

          return (
            <div
              key={ep.id}
              className="relative overflow-hidden rounded-lg"
              onTouchStart={(e) => handleTouchStart(e, ep.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Single swipe background — only show the active direction */}
              {isSwiping && (
                <div className={`absolute inset-0 flex items-center rounded-lg transition-colors ${
                  swipingLeft
                    ? "justify-end pr-4 bg-red-100 dark:bg-red-900/30"
                    : swipingRight
                      ? "justify-start pl-4 bg-green-100 dark:bg-green-900/30"
                      : ""
                }`}>
                  {swipingLeft && (
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1">
                      <X className="h-4 w-4" /> Not interested
                    </span>
                  )}
                  {swipingRight && (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                      <Check className="h-4 w-4" /> Listened
                    </span>
                  )}
                </div>
              )}

              <div
                className={`group border rounded-lg p-4 transition-all relative bg-[var(--card)] ${
                  isListened ? "border-[var(--border)] opacity-75" : "hover:border-[var(--primary)]"
                }`}
                style={
                  isSwiping
                    ? { transform: `translateX(${swipeOffset}px)`, transition: "none" }
                    : { transform: "translateX(0)", transition: "transform 0.3s" }
                }
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
                      {isListened && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Listened
                        </span>
                      )}
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
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <a
                        href={spotifyEpisodeSearchUrl(ep.podcastName, ep.episodeTitle)}
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
                      {!isListened && (
                        <button
                          onClick={() => markListened(ep.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300 transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          Listened
                        </button>
                      )}
                      <button
                        onClick={() => dismissEpisode(ep.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                        Not interested
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {visibleEpisodes.length === 0 && (
          <div className="text-center py-6 text-[var(--muted-foreground)]">
            <Headphones className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All podcasts dismissed</p>
            <button
              onClick={() => setDismissedEpisodes(new Set())}
              className="text-xs text-[var(--primary)] mt-2 hover:underline"
            >
              Restore all
            </button>
          </div>
        )}

        {visibleEpisodes.length > 0 && (
          <a
            href="/resources"
            className="block text-center text-xs text-[var(--primary)] hover:underline mt-2"
          >
            View all podcasts in Resources
          </a>
        )}
      </CardContent>
    </Card>
  );
}
