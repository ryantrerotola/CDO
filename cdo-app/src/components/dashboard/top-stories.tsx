"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink, Bookmark } from "lucide-react";

interface Story {
  id: string;
  title: string;
  source: string;
  summary: string;
  category: string;
  url: string;
  whyItMatters?: string;
}

const sampleStories: Story[] = [
  {
    id: "1",
    title: "The Evolving Role of the Chief Data Officer in 2026",
    source: "Harvard Business Review",
    summary:
      "The CDO role has shifted from data management to strategic business transformation. Modern CDOs must balance technical expertise with business acumen.",
    category: "Leadership",
    url: "#",
    whyItMatters:
      "Understanding where the role is heading helps you prepare for what's expected.",
  },
  {
    id: "2",
    title: "Data Mesh Architecture: A Practical Guide",
    source: "Martin Fowler",
    summary:
      "Data mesh decentralizes data ownership to domain teams while maintaining federated governance.",
    category: "Technical",
    url: "#",
    whyItMatters:
      "Data mesh is a key architectural pattern CDOs are implementing today.",
  },
  {
    id: "3",
    title: "AI Governance Frameworks: A Comparative Analysis",
    source: "NIST",
    summary:
      "Comparison of major AI governance frameworks including NIST AI RMF, EU AI Act, and ISO 42001.",
    category: "AI/ML",
    url: "#",
    whyItMatters:
      "CDOs increasingly own AI governance -- knowing the frameworks is essential.",
  },
];

const categoryColors: Record<string, string> = {
  Leadership: "bg-purple-100 text-purple-800",
  Technical: "bg-blue-100 text-blue-800",
  "AI/ML": "bg-green-100 text-green-800",
  "Data Strategy": "bg-orange-100 text-orange-800",
  "Data Ethics": "bg-red-100 text-red-800",
  "Industry News": "bg-gray-100 text-gray-800",
};

export function TopStories() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-[var(--primary)]" />
          Top Stories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sampleStories.map((story) => (
          <div
            key={story.id}
            className="group border rounded-lg p-4 hover:border-[var(--primary)] transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[story.category] || "bg-gray-100 text-gray-800"}`}
                  >
                    {story.category}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {story.source}
                  </span>
                </div>
                <h4 className="font-medium text-sm leading-snug mb-1">
                  {story.title}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {story.summary}
                </p>
                {story.whyItMatters && (
                  <p className="text-xs text-[var(--primary)] mt-2 italic">
                    CDO Insight: {story.whyItMatters}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-md hover:bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Bookmark className="h-4 w-4" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
