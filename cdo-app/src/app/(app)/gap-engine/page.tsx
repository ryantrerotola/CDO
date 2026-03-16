"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIChat } from "@/components/ai-chat";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Sparkles,
  MessageCircle,
  Briefcase,
  BarChart3,
} from "lucide-react";

interface GapData {
  skillId: string;
  skillName: string;
  clusterId: string;
  clusterName: string;
  marketFrequency: number;
  userProficiency: number;
  proficiencyLevel: string;
  gapScore: number;
  trend: "up" | "down" | "stable";
  frequencyHistory: { period: string; frequency: number }[];
}

interface GapResponse {
  gaps: GapData[];
  topGaps: GapData[];
  narrative: string;
  stats: {
    totalJobs: number;
    lastRefreshed: string | null;
    skillsCovered: number;
  };
}

const profLevelLabels: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  PROFICIENT: "Proficient",
  EXPERT: "Expert",
};

const profLevelColors: Record<string, string> = {
  NOT_STARTED: "text-gray-500",
  IN_PROGRESS: "text-blue-500",
  PROFICIENT: "text-green-500",
  EXPERT: "text-amber-500",
};

const clusterColors: Record<string, string> = {
  "Strategic Leadership": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "Technical Depth": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Organizational Design": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Data Products": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  "Governance & Risk": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "Financial Acumen": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  "Communication & Influence": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-red-500" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-green-500" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
}

function MiniSparkline({ data }: { data: { period: string; frequency: number }[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.frequency), 1);
  const width = 60;
  const height = 20;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.frequency / max) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="inline-block ml-2">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function GapEnginePage() {
  const [data, setData] = useState<GapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [chatGap, setChatGap] = useState<GapData | null>(null);
  const [view, setView] = useState<"gaps" | "all">("gaps");

  useEffect(() => {
    fetchGapData();
  }, []);

  const fetchGapData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gap-engine");
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error("Failed to fetch gap data:", err);
    }
    setLoading(false);
  };

  const [ingestMessage, setIngestMessage] = useState<{ type: "error" | "success" | "info"; text: string } | null>(null);

  const triggerIngestion = async () => {
    setIngesting(true);
    setIngestMessage(null);
    try {
      const res = await fetch("/api/gap-engine/ingest", { method: "POST" });
      const result = await res.json();
      if (!res.ok) {
        setIngestMessage({ type: "error", text: result.error || "Failed to fetch jobs" });
      } else if (result.newCount === 0 && result.message) {
        setIngestMessage({ type: "info", text: result.message });
        await fetchGapData(); // Still refresh — frequencies may have been recalculated
      } else {
        setIngestMessage({ type: "success", text: result.message });
        await fetchGapData();
      }
    } catch (err) {
      console.error("Ingestion failed:", err);
      setIngestMessage({ type: "error", text: "Network error — could not reach the server." });
    }
    setIngesting(false);
  };

  const displayGaps = view === "gaps"
    ? (data?.topGaps || [])
    : (data?.gaps.filter((g) => g.marketFrequency > 0) || []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gap Engine</h1>
          <p className="text-[var(--muted-foreground)]">
            Your skill gaps vs. what the CDO job market demands
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={triggerIngestion}
          disabled={ingesting}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${ingesting ? "animate-spin" : ""}`} />
          {ingesting ? "Refreshing..." : "Refresh Jobs"}
        </Button>
      </div>

      {ingestMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          ingestMessage.type === "error"
            ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
            : ingestMessage.type === "success"
            ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
            : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
        }`}>
          {ingestMessage.text}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 text-[var(--muted-foreground)] animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Analyzing your skill gaps...</p>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="py-4 text-center">
                <Briefcase className="h-5 w-5 mx-auto mb-1 text-[var(--primary)]" />
                <p className="text-2xl font-bold">{data.stats.totalJobs}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Jobs Analyzed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <BarChart3 className="h-5 w-5 mx-auto mb-1 text-[var(--primary)]" />
                <p className="text-2xl font-bold">{data.stats.skillsCovered}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Skills Tracked</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                <p className="text-2xl font-bold">{data.topGaps.length}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Top Gaps</p>
              </CardContent>
            </Card>
          </div>

          {/* Narrative Card */}
          {data.narrative && (
            <Card className="mb-6 border-[var(--primary)] border-opacity-30">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-2">AI Gap Analysis</h3>
                    <p className="text-sm leading-relaxed text-[var(--foreground)]">
                      {data.narrative}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* View toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setView("gaps")}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                view === "gaps"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
              }`}
            >
              Top Gaps ({data.topGaps.length})
            </button>
            <button
              onClick={() => setView("all")}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                view === "all"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
              }`}
            >
              All Skills ({data.gaps.filter((g) => g.marketFrequency > 0).length})
            </button>
          </div>

          {/* Gap Cards */}
          <div className="space-y-3">
            {displayGaps.map((gap) => (
              <Card key={gap.skillId} className="hover:border-[var(--primary)] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-sm">{gap.skillName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${clusterColors[gap.clusterName] || "bg-gray-100 text-gray-800"}`}>
                          {gap.clusterName}
                        </span>
                        <div className="flex items-center gap-1">
                          <TrendIcon trend={gap.trend} />
                          <MiniSparkline data={gap.frequencyHistory} />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[var(--muted-foreground)]">Market Demand</span>
                            <span className="font-medium">{gap.marketFrequency}%</span>
                          </div>
                          <Progress value={gap.marketFrequency} className="h-1.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[var(--muted-foreground)]">Your Level</span>
                            <span className={`font-medium ${profLevelColors[gap.proficiencyLevel]}`}>
                              {profLevelLabels[gap.proficiencyLevel]}
                            </span>
                          </div>
                          <Progress value={(gap.userProficiency / 3) * 100} className="h-1.5" />
                        </div>
                      </div>

                      {gap.gapScore > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Gap Score: {gap.gapScore}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setChatGap(chatGap?.skillId === gap.skillId ? null : gap)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  {chatGap?.skillId === gap.skillId && (
                    <div className="mt-3">
                      <AIChat
                        context={{
                          type: "gap",
                          skillName: gap.skillName,
                          clusterName: gap.clusterName,
                          marketFrequency: gap.marketFrequency,
                          userProficiency: gap.userProficiency,
                          gapScore: gap.gapScore,
                        }}
                        placeholder={`Ask about "${gap.skillName}" — how to close this gap, what to learn, where to start...`}
                        title={`Chat: ${gap.skillName}`}
                        onClose={() => setChatGap(null)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {displayGaps.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                  <h3 className="font-semibold mb-2">No gap data yet</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Click &quot;Refresh Jobs&quot; to fetch CDO job postings and analyze skill gaps.
                  </p>
                  <Button onClick={triggerIngestion} disabled={ingesting}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${ingesting ? "animate-spin" : ""}`} />
                    Fetch Jobs Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Last refreshed */}
          {data.stats.lastRefreshed && (
            <p className="text-xs text-[var(--muted-foreground)] mt-4 text-center">
              Last refreshed: {new Date(data.stats.lastRefreshed).toLocaleDateString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}
