"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Filter,
  BookOpen,
  Headphones,
  FileText,
  Video,
  GraduationCap,
  BarChart3,
  MessageSquare,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
} from "lucide-react";

const categories = [
  "All",
  "Data Strategy",
  "AI/ML",
  "Analytics",
  "Data Ethics",
  "Leadership",
  "Industry News",
  "Technical",
];

const contentTypeIcons: Record<string, React.ElementType> = {
  ARTICLE: FileText,
  BOOK: BookOpen,
  PODCAST: Headphones,
  VIDEO: Video,
  COURSE: GraduationCap,
  REPORT: BarChart3,
  INTERVIEW: MessageSquare,
};

const categoryMap: Record<string, string> = {
  DATA_STRATEGY: "Data Strategy",
  AI_ML: "AI/ML",
  ANALYTICS: "Analytics",
  DATA_ETHICS: "Data Ethics",
  LEADERSHIP: "Leadership",
  INDUSTRY_NEWS: "Industry News",
  TECHNICAL: "Technical",
};

function spotifySearchUrl(title: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(title)}`;
}

interface ContentItem {
  id: string;
  title: string;
  url: string;
  source: string;
  author?: string;
  summary?: string;
  category: string;
  contentType: string;
  tags?: string[];
  publishedAt?: string;
}

type ViewFilter = "all" | "saved" | "read" | "unread";

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [readItems, setReadItems] = useState<Set<string>>(new Set());
  const [dismissedItems, setDismissedItems] = useState<Set<string>>(new Set());
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetch("/api/content?limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setContent(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAsReadAndTrack = useCallback((id: string, contentType: string) => {
    setReadItems((prev) => new Set(prev).add(id));
    setDismissedItems((prev) => new Set(prev).add(id));
    fetch("/api/goals/log-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType }),
    }).catch(() => {});
  }, []);

  const filteredContent = content.filter((item) => {
    if (dismissedItems.has(item.id)) return false;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      categoryMap[item.category] === activeCategory;
    const matchesView =
      viewFilter === "all" ||
      (viewFilter === "saved" && savedItems.has(item.id)) ||
      (viewFilter === "read" && readItems.has(item.id)) ||
      (viewFilter === "unread" && !readItems.has(item.id));
    return matchesSearch && matchesCategory && matchesView;
  });

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setReadItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dismissItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDismissedItems((prev) => new Set(prev).add(id));
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipingId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipingId) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (swipingId) {
      if (swipeOffset < -100) {
        setDismissedItems((prev) => new Set(prev).add(swipingId));
      } else if (swipeOffset > 100) {
        const item = content.find((c) => c.id === swipingId);
        if (item) {
          markAsReadAndTrack(swipingId, item.contentType);
        }
      }
    }
    setSwipingId(null);
    setSwipeOffset(0);
  };

  const viewFilters: { key: ViewFilter; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "saved", label: "Saved", count: savedItems.size },
    { key: "read", label: "Read", count: readItems.size },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content Feed</h1>
        <p className="text-[var(--muted-foreground)]">
          Curated articles, books, podcasts, and more for your CDO journey
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View filters */}
        <div className="flex gap-2">
          {viewFilters.map((vf) => (
            <button
              key={vf.key}
              onClick={() => setViewFilter(vf.key)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                viewFilter === vf.key
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--accent)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
              }`}
            >
              {vf.label}
              {vf.count !== undefined && vf.count > 0 && (
                <span className="ml-1">({vf.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dismissed count */}
      {dismissedItems.size > 0 && (
        <div className="mb-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <span>{dismissedItems.size} item(s) hidden</span>
          <button
            onClick={() => setDismissedItems(new Set())}
            className="text-[var(--primary)] hover:underline"
          >
            Restore all
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 text-[var(--muted-foreground)] animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading content...</p>
        </div>
      )}

      {/* Content Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContent.map((item) => {
            const TypeIcon = contentTypeIcons[item.contentType] || FileText;
            const isSaved = savedItems.has(item.id);
            const isRead = readItems.has(item.id);
            const isExpanded = expandedItem === item.id;
            const isSwiping = swipingId === item.id;
            const isPodcast = item.contentType === "PODCAST";
            const swipingRight = isSwiping && swipeOffset > 0;
            const swipingLeft = isSwiping && swipeOffset < 0;

            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-xl"
                onTouchStart={(e) => handleTouchStart(e, item.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Swipe left background: dismiss */}
                <div className={`absolute inset-0 flex items-center justify-end pr-4 rounded-xl transition-colors ${
                  swipingLeft ? "bg-red-100 dark:bg-red-900/30" : "bg-transparent"
                }`}>
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1">
                    <X className="h-4 w-4" /> Dismiss
                  </span>
                </div>

                {/* Swipe right background: mark as read */}
                <div className={`absolute inset-0 flex items-center justify-start pl-4 rounded-xl transition-colors ${
                  swipingRight ? "bg-green-100 dark:bg-green-900/30" : "bg-transparent"
                }`}>
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                    <Check className="h-4 w-4" /> Mark as read
                  </span>
                </div>

                <Card
                  className={`group transition-all cursor-pointer relative ${
                    isRead ? "opacity-70" : "hover:border-[var(--primary)]"
                  } ${isExpanded ? "border-[var(--primary)] ring-1 ring-[var(--primary)] md:col-span-2" : ""}`}
                  style={
                    isSwiping
                      ? { transform: `translateX(${swipeOffset}px)`, transition: "none" }
                      : { transform: "translateX(0)", transition: "transform 0.3s" }
                  }
                  onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <TypeIcon className="h-4 w-4 text-[var(--primary)]" />
                        <span className="text-xs text-[var(--muted-foreground)]">{item.contentType}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">&middot;</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{item.source}</span>
                        {item.publishedAt && (
                          <>
                            <span className="text-xs text-[var(--muted-foreground)]">&middot;</span>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {new Date(item.publishedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                        {isRead && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Read</span>
                        )}
                        {isSaved && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Saved</span>
                        )}
                      </div>
                      <div className="flex gap-1 items-start">
                        <button
                          onClick={(e) => toggleSave(e, item.id)}
                          className={`p-1.5 rounded-md hover:bg-[var(--accent)] transition-all ${isSaved ? "text-[var(--primary)] opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          title={isSaved ? "Remove from saved" : "Save for later"}
                        >
                          {isSaved ? <BookmarkCheck className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={(e) => toggleRead(e, item.id)}
                          className={`p-1.5 rounded-md hover:bg-[var(--accent)] transition-all ${isRead ? "text-[var(--success)] opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          title={isRead ? "Mark as unread" : "Mark as read"}
                        >
                          {isRead ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={(e) => dismissItem(e, item.id)}
                          className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all text-[var(--muted-foreground)] hover:text-red-600"
                          title="Not interested"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm mb-2 leading-snug">{item.title}</h3>
                    {item.author && (
                      <p className="text-xs text-[var(--muted-foreground)] mb-1">by {item.author}</p>
                    )}
                    {item.summary && (
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">{item.summary}</p>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline">{categoryMap[item.category] || item.category}</Badge>
                      {(item.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">{tag}</span>
                      ))}
                    </div>

                    {/* Spotify button — always visible on podcasts */}
                    {isPodcast && (
                      <div className="mt-3">
                        <a
                          href={spotifySearchUrl(item.title)}
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
                      </div>
                    )}

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[var(--border)]">
                        {item.summary && (
                          <p className="text-sm text-[var(--foreground)] leading-relaxed mb-4">{item.summary}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {isPodcast ? "View podcast" : "Read"} at {item.source}
                          </a>
                          <button
                            onClick={(e) => toggleRead(e, item.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)] transition-colors"
                          >
                            {isRead ? (<><EyeOff className="h-3.5 w-3.5" /> Mark unread</>) : (<><Eye className="h-3.5 w-3.5" /> Mark as read</>)}
                          </button>
                          <button
                            onClick={(e) => toggleSave(e, item.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)] transition-colors"
                          >
                            {isSaved ? (<><BookmarkCheck className="h-3.5 w-3.5" /> Saved</>) : (<><Bookmark className="h-3.5 w-3.5" /> Save</>)}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expand hint */}
                    <div className="flex justify-center mt-2">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredContent.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <h3 className="font-semibold mb-2">No content found</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
