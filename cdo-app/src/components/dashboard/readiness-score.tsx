"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gauge, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ReadinessData {
  score: number;
  breakdown: {
    gapClosure: { score: number; weight: number; proficientCount: number; totalSkills: number };
    skillGraph: { score: number; weight: number; avgProficiency: number };
    storyLab: { score: number; weight: number; completedModules: number; totalModules: number };
  };
}

export function ReadinessScore() {
  const [data, setData] = useState<ReadinessData | null>(null);

  useEffect(() => {
    fetch("/api/readiness-score")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const score = data?.score ?? 0;
  const color =
    score >= 70 ? "var(--success)" : score >= 40 ? "#f59e0b" : "var(--destructive)";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-5 w-5 text-[var(--primary)]" />
          CDO Readiness
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Score circle */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="var(--secondary)"
                strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeDasharray={`${score * 0.975} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-lg font-bold"
              style={{ color }}
            >
              {score}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">Composite Score</p>
            {data && (
              <div className="space-y-1">
                <BreakdownBar label="Gap Closure" value={data.breakdown.gapClosure.score} weight={40} />
                <BreakdownBar label="Skill Graph" value={data.breakdown.skillGraph.score} weight={30} />
                <BreakdownBar label="Story Lab" value={data.breakdown.storyLab.score} weight={30} />
              </div>
            )}
          </div>
        </div>

        <Link
          href="/skill-graph"
          className="flex items-center justify-between text-xs text-[var(--primary)] hover:underline"
        >
          View Skill Graph
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

function BreakdownBar({ label, value, weight }: { label: string; value: number; weight: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[var(--muted-foreground)] w-16 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--secondary)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] text-[var(--muted-foreground)] w-8 text-right">{value}%</span>
    </div>
  );
}
