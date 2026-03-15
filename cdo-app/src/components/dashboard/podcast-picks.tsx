"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Headphones,
  Clock,
  Bookmark,
  BookmarkCheck,
  Check,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatDuration, DEFAULT_PODCASTS, type PodcastWithEpisodes } from "@/lib/podcast";

const SWIPE_THRESHOLD = 100;
const MAX_SWIPE = 150;

export function PodcastPicks() {
  const [podcasts, setPodcasts] = useState<PodcastWithEpisodes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savedEpisodes, setSavedEpisodes] = useState<Set<string>>(new Set());
  const [listenedEpisodes, setListenedEpisodes] = useState<Set<string>>(new Set());
  const [dismissedEpisodes, setDismissedEpisodes] = useState<Set<string>>(new Set());
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetch("/api/podcasts")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setPodcasts(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

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

  // Flatten podcasts into a list of episodes with podcast metadata attached
  const allEpisodes = podcasts.flatMap((podcast) =>
    podcast.episodes.map((ep) => ({
      ...ep,
      podcastName: podcast.name,
      gradient: podcast.gradient,
      relevance: podcast.relevance,
      showUrl: podcast.showUrl,
    }))
  );

  // Show one episode per podcast, most recent first
  const seenPodcasts = new Set<string>();
  const topEpisodes = allEpisodes.filter((ep) => {
    if (seenPodcasts.has(ep.podcastName) || dismissedEpisodes.has(ep.id)) return false;
    seenPodcasts.add(ep.podcastName);
    return true;
  });

  // Fallback: show static list with Spotify show links if API not configured
  if (!loading && (error || podcasts.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-[var(--primary)]" />
            Podcast Picks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEFAULT_PODCASTS.map((podcast) => (
            <a
              key={podcast.name}
              href={`https://open.spotify.com/show/${podcast.spotifyShowId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group border rounded-lg p-4 hover:border-[var(--primary)] transition-all block"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${podcast.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">{podcast.name}</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{podcast.relevance}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--primary)] mt-1.5">
                    <ExternalLink className="h-3 w-3" />
                    Open on Spotify
                  </span>
                </div>
              </div>
            </a>
          ))}
          <p className="text-xs text-center text-[var(--muted-foreground)]">
            Add SPOTIFY_CLIENT_ID to see latest episodes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-[var(--primary)]" />
          Podcast Picks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
          </div>
        )}

        {!loading && topEpisodes.map((ep) => {
          const isSaved = savedEpisodes.has(ep.id);
          const isListened = listenedEpisodes.has(ep.id);
          const isSwiping = swipingId === ep.id;
          const swipingRight = isSwiping && swipeOffset > 0;
          const swipingLeft = isSwiping && swipeOffset < 0;
          const duration = formatDuration(ep.durationMs);

          return (
            <div
              key={ep.id}
              className="relative overflow-hidden rounded-lg"
              onTouchStart={(e) => handleTouchStart(e, ep.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
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
                  {ep.image ? (
                    <img
                      src={ep.image}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ep.gradient} flex items-center justify-center flex-shrink-0`}
                    >
                      <Headphones className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-[var(--primary)]">
                        {ep.podcastName}
                      </span>
                      {duration && (
                        <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {duration}
                        </span>
                      )}
                      {isListened && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Listened
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium leading-snug mb-1">
                      {ep.title}
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                      {ep.description}
                    </p>
                    {ep.releaseDate && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {new Date(ep.releaseDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <a
                        href={ep.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#1DB954] text-white hover:bg-[#1ed760] transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Play on Spotify
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

        {!loading && topEpisodes.length === 0 && (
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

        {!loading && topEpisodes.length > 0 && (
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
