"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Bookmark,
  ExternalLink,
  Filter,
  BookOpen,
  Headphones,
  FileText,
  Video,
  GraduationCap,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { seedContent } from "@/data/seed-content";

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

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  const filteredContent = seedContent.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      categoryMap[item.category] === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSave = (url: string) => {
    setSavedItems((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

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

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContent.map((item) => {
          const TypeIcon = contentTypeIcons[item.contentType] || FileText;
          const isSaved = savedItems.has(item.url);

          return (
            <Card
              key={item.url}
              className="group hover:border-[var(--primary)] transition-colors"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <TypeIcon className="h-4 w-4 text-[var(--primary)]" />
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {item.contentType}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      &middot;
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {item.source}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleSave(item.url)}
                      className={`p-1.5 rounded-md hover:bg-[var(--accent)] ${
                        isSaved ? "text-[var(--primary)]" : ""
                      }`}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                      />
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-[var(--accent)]"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <h3 className="font-semibold text-sm mb-2 leading-snug">
                  {item.title}
                </h3>
                {item.author && (
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">
                    by {item.author}
                  </p>
                )}
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">
                  {item.summary}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">
                    {categoryMap[item.category]}
                  </Badge>
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContent.length === 0 && (
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
