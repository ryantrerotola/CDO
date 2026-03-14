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

// SpotifyButton removed — dynamic podcast content links to its original source URL instead

function persistInteraction(contentId: string, action: "DISMISSED" | "READ") {
  fetch("/api/content-interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentId, action }),
  })
    .then((r) => { if (!r.ok) console.error("content-interaction failed:", r.status); })
    .catch((e) => console.error("content-interaction error:", e));
}

export function TopStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedStories, setSavedStories] = useState<Set<string>>(new Set());
  const [readStories, setReadStories] = useState<Set<string>>(new Set());
  const [dismissedStories, setDismissedStories] = useState<Set<string>>(new Set());
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    // Load content and persisted interactions in parallel
    Promise.all([
      fetch(`/api/content?limit=${FETCH_COUNT}`).then((r) => r.json()),
      fetch("/api/content-interactions?action=DISMISSED").then((r) => r.json()).catch(() => []),
      fetch("/api/content-interactions?action=READ").then((r) => r.json()).catch(() => []),
    ])
      .then(([data, dismissed, read]) => {
        if (Array.isArray(data)) setStories(data);
        if (Array.isArray(dismissed) && dismissed.length > 0) setDismissedStories(new Set(dismissed));
        if (Array.isArray(read) && read.length > 0) setReadStories(new Set(read));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAsReadAndTrack = useCallback((id: string, contentType: string) => {
    setReadStories((prev) => new Set(prev).add(id));
    persistInteraction(id, "READ");
    fetch("/api/goals/log-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType }),
    })
      .then(() => window.dispatchEvent(new CustomEvent("goal-progress")))
      .catch(() => {});
  }, []);

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedStories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRead = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const story = stories.find((s) => s.id === id);
    if (story && !readStories.has(id)) {
      markAsReadAndTrack(id, story.contentType);
    }
  };

  const dismissStory = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissedStories((prev) => new Set(prev).add(id));
    persistInteraction(id, "DISMISSED");
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
        persistInteraction(swipingId, "DISMISSED");
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

  // Show DISPLAY_COUNT unread items from the pool, skipping dismissed and read
  const visibleStories = stories
    .filter((s) => !dismissedStories.has(s.id) && !readStories.has(s.id))
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

                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group border rounded-lg p-4 transition-all cursor-pointer relative bg-[var(--card)] block ${
                    isRead ? "border-[var(--border)] opacity-75" : "hover:border-[var(--primary)]"
                  }`}
                  style={
                    isSwiping
                      ? { transform: `translateX(${swipeOffset}px)`, transition: "none" }
                      : { transform: "translateX(0)", transition: "transform 0.3s" }
                  }
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

                  <div className="flex items-center gap-1 mt-2 text-xs text-[var(--primary)]">
                    <ExternalLink className="h-3 w-3" />
                    {isPodcast ? `Listen at ${story.source}` : `Read at ${story.source}`}
                  </div>
                </a>
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
