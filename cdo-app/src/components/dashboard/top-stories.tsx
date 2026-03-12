"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Newspaper,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

interface Story {
  id: string;
  title: string;
  source: string;
  summary?: string;
  category: string;
  url: string;
  publishedAt?: string;
}

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
    fetch("/api/content?limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStories(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
    setReadStories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dismissStory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDismissedStories((prev) => new Set(prev).add(id));
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipingId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipingId) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    if (diff < 0) setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (swipingId && swipeOffset < -100) {
      setDismissedStories((prev) => new Set(prev).add(swipingId));
    }
    setSwipingId(null);
    setSwipeOffset(0);
  };

  const visibleStories = stories.filter((s) => !dismissedStories.has(s.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-[var(--primary)]" />
          Top Stories
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

            return (
              <div
                key={story.id}
                className="relative overflow-hidden rounded-lg"
                onTouchStart={(e) => handleTouchStart(e, story.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 flex items-center justify-end pr-4 rounded-lg">
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1">
                    <X className="h-4 w-4" /> Not interested
                  </span>
                </div>

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

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                      <a
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Read full article at {story.source}
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
            <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {stories.length === 0
                ? "No stories yet. Content refreshes daily at 7am UTC."
                : "All stories dismissed"}
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
