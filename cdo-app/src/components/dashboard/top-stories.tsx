"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Headphones,
  Check,
} from "lucide-react";

interface Story {
  id: string;
  title: string;
  source: string;
  summary?: string;
  category: string;
  contentType: string;
  url: string;
  publishedAt?: string;
}

const DISPLAY_COUNT = 5;
const FETCH_COUNT = 25;
const SWIPE_THRESHOLD = 100;
const MAX_SWIPE = 150;

const categoryColors: Record<string, string> = {
  LEADERSHIP: "bg-purple-100 text-purple-800",
  TECHNICAL: "bg-blue-100 text-blue-800",
  AI_ML: "bg-green-100 text-green-800",
  DATA_STRATEGY: "bg-orange-100 text-orange-800",
  DATA_ETHICS: "bg-red-100 text-red-800",
  INDUSTRY_NEWS: "bg-gray-100 text-gray-800",
  ANALYTICS: "bg-teal-100 text-teal-800",
};

const categoryLabels: Record<string, string> = {
  LEADERSHIP: "Leadership",
  TECHNICAL: "Technical",
  AI_ML: "AI/ML",
  DATA_STRATEGY: "Data Strategy",
  DATA_ETHICS: "Data Ethics",
  INDUSTRY_NEWS: "Industry News",
  ANALYTICS: "Analytics",
};

function SpotifyButton({ title }: { title: string }) {
  return (
    <a
      href={`https://open.spotify.com/search/${encodeURIComponent(title)}/episodes`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1DB954] text-white hover:bg-[#1ed760] transition-colors"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
      Listen on Spotify
    </a>
  );
}

function persistDismiss(contentId: string) {
  fetch("/api/content-interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentId, action: "DISMISSED" }),
  }).catch(() => {});
}

export function TopStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedStories, setSavedStories] = useState<Set<string>>(new Set());
  const [readStories, setReadStories] = useState<Set<string>>(new Set());
  const [dismissedStories, setDismissedStories] = useState<Set<string>>(new Set());
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetch(`/api/content?limit=${FETCH_COUNT}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStories(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAsReadAndTrack = useCallback((id: string, contentType: string) => {
    setReadStories((prev) => new Set(prev).add(id));
    setDismissedStories((prev) => new Set(prev).add(id));
    persistDismiss(id);
    fetch("/api/goals/log-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType }),
    })
      .then(() => window.dispatchEvent(new CustomEvent("goal-progress")))
      .catch(() => {});
  }, []);

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedStories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const story = stories.find((s) => s.id === id);
    if (story && !readStories.has(id)) {
      markAsReadAndTrack(id, story.contentType);
    }
  };

  const dismissStory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDismissedStories((prev) => new Set(prev).add(id));
    persistDismiss(id);
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipingId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipingId) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    // Clamp the offset to prevent over-swiping
    setSwipeOffset(Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff)));
  };

  const handleTouchEnd = () => {
    if (swipingId) {
      if (swipeOffset < -SWIPE_THRESHOLD) {
        setDismissedStories((prev) => new Set(prev).add(swipingId));
        persistDismiss(swipingId);
      } else if (swipeOffset > SWIPE_THRESHOLD) {
        const story = stories.find((s) => s.id === swipingId);
        if (story) {
          markAsReadAndTrack(swipingId, story.contentType);
        }
      }
    }
    setSwipingId(null);
    setSwipeOffset(0);
  };

  // Show DISPLAY_COUNT items from the pool, skipping dismissed ones
  const visibleStories = stories
    .filter((s) => !dismissedStories.has(s.id))
    .slice(0, DISPLAY_COUNT);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--primary)]" />
          Recommended Reading
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 mx-auto mb-2 text-[var(--muted-foreground)] animate-spin" />
            <p className="text-xs text-[var(--muted-foreground)]">Loading stories...</p>
          </div>
        )}

        {!loading &&
          visibleStories.map((story) => {
            const isSaved = savedStories.has(story.id);
            const isRead = readStories.has(story.id);
            const isExpanded = expandedStory === story.id;
            const isSwiping = swipingId === story.id;
            const isPodcast = story.contentType === "PODCAST";
            const swipingRight = isSwiping && swipeOffset > 0;
            const swipingLeft = isSwiping && swipeOffset < 0;

            return (
              <div
                key={story.id}
                className="relative overflow-hidden rounded-lg"
                onTouchStart={(e) => handleTouchStart(e, story.id)}
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
                        <Check className="h-4 w-4" /> Mark as read
                      </span>
                    )}
                  </div>
                )}

                <div
                  className={`group border rounded-lg p-4 transition-all cursor-pointer relative bg-[var(--card)] ${
                    isRead ? "border-[var(--border)] opacity-75" : "hover:border-[var(--primary)]"
                  } ${isExpanded ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : ""}`}
                  style={
                    isSwiping
                      ? { transform: `translateX(${swipeOffset}px)`, transition: "none" }
                      : { transform: "translateX(0)", transition: "transform 0.3s" }
                  }
                  onClick={() => setExpandedStory(isExpanded ? null : story.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[story.category] || "bg-gray-100 text-gray-800"}`}>
                          {categoryLabels[story.category] || story.category}
                        </span>
                        {isPodcast && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
                            <Headphones className="h-3 w-3" /> Podcast
                          </span>
                        )}
                        <span className="text-xs text-[var(--muted-foreground)]">{story.source}</span>
                        {story.publishedAt && (
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {new Date(story.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                        {isRead && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Read</span>
                        )}
                      </div>
                      <h4 className="font-medium text-sm leading-snug mb-1">{story.title}</h4>
                      {story.summary && (
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{story.summary}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={(e) => toggleSave(e, story.id)}
                        className={`p-1.5 rounded-md hover:bg-[var(--accent)] transition-all ${isSaved ? "text-[var(--primary)] opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      >
                        {isSaved ? <BookmarkCheck className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={(e) => toggleRead(e, story.id)}
                        className={`p-1.5 rounded-md hover:bg-[var(--accent)] transition-all ${isRead ? "text-[var(--success)] opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      >
                        {isRead ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={(e) => dismissStory(e, story.id)}
                        className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all text-[var(--muted-foreground)] hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Spotify button — always visible on podcasts, no expand needed */}
                  {isPodcast && (
                    <div className="mt-3">
                      <SpotifyButton title={story.title} />
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-3 flex-wrap">
                      <a
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {isPodcast ? "View podcast" : "Read full article"} at {story.source}
                      </a>
                    </div>
                  )}

                  <div className="flex justify-center mt-2">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {!loading && visibleStories.length === 0 && (
          <div className="text-center py-8 text-[var(--muted-foreground)]">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {stories.length === 0
                ? "No content yet. New recommendations appear daily."
                : "All items dismissed"}
            </p>
            {dismissedStories.size > 0 && (
              <button
                onClick={() => setDismissedStories(new Set())}
                className="text-xs text-[var(--primary)] mt-2 hover:underline"
              >
                Restore all stories
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
