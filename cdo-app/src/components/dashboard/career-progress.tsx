"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function CareerProgress() {
  const { profile, goals } = useAppStore();

  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const totalGoals = goals.length;
  const progressPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const readinessScore = profile.resumeAnalysis?.overallReadiness ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
          Career Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercent} showLabel className="mb-4" />

        <div className="mt-2 text-sm text-[var(--muted-foreground)]">
          {completedGoals} of {totalGoals} goals completed
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[var(--accent)]">
          <p className="text-xs text-[var(--muted-foreground)]">
            CDO Readiness Score
          </p>
          <p className="text-2xl font-bold text-[var(--primary)]">
            {readinessScore}%
          </p>
          {readinessScore === 0 && (
            <p className="text-xs text-[var(--muted-foreground)]">
              Upload your resume to get a readiness score
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
