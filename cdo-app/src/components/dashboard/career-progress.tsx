"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, ChevronRight } from "lucide-react";

const milestones = [
  { label: "Current Role", completed: true },
  { label: "Senior Manager", completed: true },
  { label: "Director of Data", completed: false, current: true },
  { label: "VP of Data", completed: false },
  { label: "CDO", completed: false },
];

export function CareerProgress() {
  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = (completedCount / (milestones.length - 1)) * 100;

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

        <div className="flex items-center justify-between">
          {milestones.map((milestone, i) => (
            <div key={milestone.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    milestone.completed
                      ? "bg-[var(--success)]"
                      : milestone.current
                        ? "bg-[var(--primary)] ring-4 ring-[var(--primary)]/20"
                        : "bg-[var(--muted)]"
                  }`}
                />
                <span
                  className={`text-xs mt-1.5 text-center max-w-[70px] leading-tight ${
                    milestone.current
                      ? "font-semibold text-[var(--primary)]"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {milestone.label}
                </span>
              </div>
              {i < milestones.length - 1 && (
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] mx-1" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[var(--accent)]">
          <p className="text-xs text-[var(--muted-foreground)]">
            CDO Readiness Score
          </p>
          <p className="text-2xl font-bold text-[var(--primary)]">62%</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            +5% from last month
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
