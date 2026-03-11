"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

interface TrendingSource {
  name: string;
  url: string;
  description: string;
}

const trendingSources: TrendingSource[] = [
  {
    name: "McKinsey",
    url: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/designing-data-governance-that-delivers-value",
    description:
      "Designing data governance that delivers value — McKinsey Digital",
  },
  {
    name: "HBR",
    url: "https://hbr.org/2025/03/how-to-build-a-data-product-organization",
    description:
      "How to Build a Data Product Organization — Harvard Business Review",
  },
  {
    name: "Gartner",
    url: "https://www.gartner.com/en/articles/data-and-analytics-trends",
    description:
      "Top Data and Analytics Trends — Gartner Research",
  },
];

export function TrendingTopic() {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Card className="border-l-4 border-l-[var(--warning)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[var(--warning)]" />
            Trending in Data Leadership
          </CardTitle>
          <button
            onClick={() => setSaved(!saved)}
            className={`p-1.5 rounded-md hover:bg-[var(--accent)] transition-colors ${
              saved ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
            }`}
            title={saved ? "Remove from saved" : "Save this topic"}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 fill-current" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <h4
          className="font-semibold mb-2 cursor-pointer hover:text-[var(--primary)] transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          Data Products: The New Operating Model for Data Teams
        </h4>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          Leading organizations are shifting from project-based data delivery to
          a product-oriented model. CDOs who adopt this approach report 40%
          faster time-to-insight and significantly higher stakeholder
          satisfaction. Key pillars include treating datasets as products with
          SLAs, assigning product managers to data domains, and measuring
          adoption metrics.
        </p>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3">
              The data products operating model represents a fundamental shift in
              how organizations deliver value from data. Instead of treating data
              requests as one-off projects, teams build reusable data products
              with clear ownership, SLAs, and measurable adoption metrics.
            </p>
            <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3">
              Key implementation steps for CDOs:
            </p>
            <ul className="text-sm text-[var(--foreground)] leading-relaxed space-y-1.5 ml-4 mb-3 list-disc">
              <li>
                Identify 3-5 high-value data domains to pilot the product model
              </li>
              <li>
                Assign product managers and define clear data product contracts
              </li>
              <li>
                Establish quality SLAs and monitor data freshness, completeness,
                and accuracy
              </li>
              <li>
                Track adoption metrics: active users, queries, downstream
                dependencies
              </li>
              <li>
                Create a data product marketplace for discoverability across the
                org
              </li>
            </ul>
          </div>
        )}

        {/* Source links */}
        <div className="mt-4">
          <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
            Sources & further reading:
          </p>
          <div className="space-y-2">
            {trendingSources.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--accent)] transition-colors group"
              >
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--secondary)] font-medium">
                  {source.name}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] flex-1 truncate">
                  {source.description}
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-xs font-medium text-[var(--primary)] hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Read more about this topic
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}
