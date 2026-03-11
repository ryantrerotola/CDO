"use client";

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface Story {
  id: string;
  title: string;
  source: string;
  summary: string;
  category: string;
  url: string;
  whyItMatters?: string;
  fullContent?: string;
}

const sampleStories: Story[] = [
  {
    id: "1",
    title: "The Evolving Role of the Chief Data Officer in 2026",
    source: "Harvard Business Review",
    summary:
      "The CDO role has shifted from data management to strategic business transformation. Modern CDOs must balance technical expertise with business acumen.",
    category: "Leadership",
    url: "https://hbr.org/2026/01/the-evolving-role-of-the-cdo",
    whyItMatters:
      "Understanding where the role is heading helps you prepare for what's expected.",
    fullContent:
      "The Chief Data Officer role has undergone a dramatic transformation over the past decade. Once primarily focused on data management and compliance, today's CDOs are expected to drive strategic business outcomes through data and AI. According to a recent Gartner survey, 80% of CDOs now report directly to the CEO or COO, up from just 40% five years ago.\n\nKey trends shaping the CDO role in 2026:\n\n• AI-First Strategy: CDOs are increasingly responsible for the organization's AI roadmap, from identifying use cases to ensuring responsible deployment.\n\n• Revenue Generation: The focus has shifted from cost optimization to revenue generation through data monetization and data-driven products.\n\n• Cross-Functional Leadership: Successful CDOs operate as enterprise-wide leaders, bridging the gap between technology and business units.\n\n• Talent Development: Building and retaining data talent remains a top priority, with CDOs investing in upskilling programs and creating career paths for data professionals.\n\nThe CDOs who thrive in this new era combine deep technical understanding with strong business acumen and exceptional communication skills.",
  },
  {
    id: "2",
    title: "Data Mesh Architecture: A Practical Guide",
    source: "Martin Fowler",
    summary:
      "Data mesh decentralizes data ownership to domain teams while maintaining federated governance.",
    category: "Technical",
    url: "https://martinfowler.com/articles/data-mesh-guide",
    whyItMatters:
      "Data mesh is a key architectural pattern CDOs are implementing today.",
    fullContent:
      "Data mesh represents a paradigm shift in how organizations manage and own their data. Rather than centralizing all data into a single platform owned by a central team, data mesh distributes ownership to the teams that understand the data best — the domain teams.\n\nThe four pillars of data mesh:\n\n1. Domain Ownership: Each business domain owns and manages its own data, including the pipelines that produce it. This reduces bottlenecks and increases data quality.\n\n2. Data as a Product: Domain teams treat their data as a product, with clear SLAs, documentation, and discoverability. Each data product has a product owner responsible for its quality.\n\n3. Self-Serve Data Platform: A platform team provides the infrastructure and tooling that domain teams need to build, deploy, and monitor their data products without deep infrastructure expertise.\n\n4. Federated Computational Governance: Global policies (security, compliance, interoperability) are defined centrally but enforced computationally through the platform.\n\nOrganizations that have adopted data mesh report 40-60% reduction in time-to-insight and significantly improved data quality scores.",
  },
  {
    id: "3",
    title: "AI Governance Frameworks: A Comparative Analysis",
    source: "NIST",
    summary:
      "Comparison of major AI governance frameworks including NIST AI RMF, EU AI Act, and ISO 42001.",
    category: "AI/ML",
    url: "https://nist.gov/ai-governance-frameworks-comparison",
    whyItMatters:
      "CDOs increasingly own AI governance -- knowing the frameworks is essential.",
    fullContent:
      "As AI adoption accelerates, governance frameworks have become critical for responsible deployment. This analysis compares three major frameworks that CDOs should be familiar with.\n\nNIST AI Risk Management Framework (AI RMF):\n• Voluntary framework organized around four functions: Govern, Map, Measure, Manage\n• Emphasizes organizational culture and stakeholder engagement\n• Most flexible of the three, suitable for organizations at any maturity level\n\nEU AI Act:\n• Mandatory regulation for organizations operating in the EU\n• Risk-based approach: unacceptable, high, limited, and minimal risk categories\n• Requires conformity assessments for high-risk AI systems\n• Imposes fines up to 7% of global annual turnover\n\nISO 42001 (AI Management System):\n• International standard for AI management systems\n• Certifiable, providing third-party validation\n• Covers the entire AI lifecycle from design to decommissioning\n\nFor CDOs, the recommendation is to start with NIST AI RMF as a foundational framework, layer on EU AI Act compliance where required, and pursue ISO 42001 certification for competitive advantage.",
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
  const [savedStories, setSavedStories] = useState<Set<string>>(new Set());
  const [readStories, setReadStories] = useState<Set<string>>(new Set());
  const [dismissedStories, setDismissedStories] = useState<Set<string>>(
    new Set()
  );
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);

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

  const visibleStories = sampleStories.filter(
    (s) => !dismissedStories.has(s.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-[var(--primary)]" />
          Top Stories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleStories.map((story) => {
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
              {/* Swipe-to-dismiss background */}
              <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 flex items-center justify-end pr-4 rounded-lg">
                <span className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1">
                  <X className="h-4 w-4" /> Not interested
                </span>
              </div>

              <div
                className={`group border rounded-lg p-4 transition-all cursor-pointer relative bg-[var(--card)] ${
                  isRead
                    ? "border-[var(--border)] opacity-75"
                    : "hover:border-[var(--primary)]"
                } ${isExpanded ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : ""}`}
                style={
                  isSwiping
                    ? {
                        transform: `translateX(${swipeOffset}px)`,
                        transition: "none",
                      }
                    : { transform: "translateX(0)", transition: "transform 0.3s" }
                }
                onClick={() =>
                  setExpandedStory(isExpanded ? null : story.id)
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[story.category] || "bg-gray-100 text-gray-800"}`}
                      >
                        {story.category}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {story.source}
                      </span>
                      {isRead && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Read
                        </span>
                      )}
                      {isSaved && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          Saved
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm leading-snug mb-1">
                      {story.title}
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {story.summary}
                    </p>
                    {story.whyItMatters && !isExpanded && (
                      <p className="text-xs text-[var(--primary)] mt-2 italic">
                        CDO Insight: {story.whyItMatters}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => toggleSave(e, story.id)}
                      className={`p-1.5 rounded-md hover:bg-[var(--accent)] transition-all ${
                        isSaved
                          ? "text-[var(--primary)] opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      title={isSaved ? "Remove from saved" : "Save for later"}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="h-4 w-4 fill-current" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => toggleRead(e, story.id)}
                      className={`p-1.5 rounded-md hover:bg-[var(--accent)] transition-all ${
                        isRead
                          ? "text-[var(--success)] opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      title={isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {isRead ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => dismissStory(e, story.id)}
                      className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all text-[var(--muted-foreground)] hover:text-red-600"
                      title="Not interested"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded article view */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    {story.whyItMatters && (
                      <p className="text-xs text-[var(--primary)] mb-3 italic font-medium">
                        CDO Insight: {story.whyItMatters}
                      </p>
                    )}
                    <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                      {story.fullContent || story.summary}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
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
                  </div>
                )}

                {/* Expand/collapse indicator */}
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

        {visibleStories.length === 0 && (
          <div className="text-center py-8 text-[var(--muted-foreground)]">
            <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All stories dismissed</p>
            <button
              onClick={() => setDismissedStories(new Set())}
              className="text-xs text-[var(--primary)] mt-2 hover:underline"
            >
              Restore all stories
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
