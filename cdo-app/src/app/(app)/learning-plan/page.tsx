"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  RefreshCw,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface WeekPlan {
  week: number;
  focus: string;
  actions: string[];
}

interface LearningPlan {
  thirtyDay: WeekPlan[];
  sixtyDay: WeekPlan[];
  ninetyDay: WeekPlan[];
}

const PHASES = [
  { key: "thirtyDay" as const, label: "30-Day Sprint", range: "Weeks 1-4", color: "var(--primary)" },
  { key: "sixtyDay" as const, label: "60-Day Build", range: "Weeks 5-8", color: "#10b981" },
  { key: "ninetyDay" as const, label: "90-Day Mastery", range: "Weeks 9-12", color: "#f59e0b" },
];

export default function LearningPlanPage() {
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>("thirtyDay");
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/learning-plan", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();
      setPlan(data);
      setExpandedPhase("thirtyDay");
    } catch {
      setError("Failed to generate learning plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (key: string) => {
    setCompletedActions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const getPhaseProgress = (weeks: WeekPlan[]) => {
    const total = weeks.reduce((sum, w) => sum + w.actions.length, 0);
    const done = weeks.reduce(
      (sum, w) =>
        sum + w.actions.filter((_, ai) => completedActions.has(`${w.week}-${ai}`)).length,
      0
    );
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-[var(--primary)]" />
          Learning Plan
        </h1>
        <p className="text-[var(--muted-foreground)]">
          AI-generated 30/60/90 day roadmap based on your skill gaps and goals
        </p>
      </div>

      {!plan && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-[var(--primary)] opacity-60" />
            <h2 className="text-lg font-semibold mb-2">Generate Your Learning Plan</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
              Claude will analyze your skill gaps, Story Lab progress, active goals, and readiness
              score to create a personalized 30/60/90 day plan.
            </p>
            <button
              onClick={generate}
              className="px-6 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:opacity-90 transition-opacity"
            >
              Generate Plan
            </button>
            {error && (
              <p className="text-sm text-red-500 mt-4">{error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 text-[var(--primary)] animate-spin" />
            <p className="text-sm text-[var(--muted-foreground)]">
              Analyzing your profile and generating a personalized plan...
            </p>
          </CardContent>
        </Card>
      )}

      {plan && !loading && (
        <div className="space-y-4">
          {/* Phase overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {PHASES.map((phase) => {
              const weeks = plan[phase.key];
              const progress = getPhaseProgress(weeks);
              return (
                <button
                  key={phase.key}
                  onClick={() => setExpandedPhase(phase.key)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    expandedPhase === phase.key
                      ? "border-[var(--primary)] bg-[var(--accent)]"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      {phase.range}
                    </span>
                    <span className="text-xs font-bold" style={{ color: phase.color }}>
                      {progress}%
                    </span>
                  </div>
                  <p className="font-semibold text-sm">{phase.label}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--secondary)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progress}%`, backgroundColor: phase.color }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expanded phase detail */}
          {PHASES.map((phase) => {
            if (expandedPhase !== phase.key) return null;
            const weeks = plan[phase.key];
            return (
              <div key={phase.key} className="space-y-4">
                {weeks.map((week) => (
                  <Card key={week.week}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-4 w-4" style={{ color: phase.color }} />
                        Week {week.week}: {week.focus}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {week.actions.map((action, ai) => {
                          const actionKey = `${week.week}-${ai}`;
                          const done = completedActions.has(actionKey);
                          return (
                            <button
                              key={ai}
                              onClick={() => toggleAction(actionKey)}
                              className="flex items-start gap-3 w-full p-2 rounded-lg hover:bg-[var(--accent)] transition-colors text-left"
                            >
                              <CheckCircle2
                                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                                  done
                                    ? "text-[var(--success)]"
                                    : "text-[var(--muted-foreground)] opacity-30"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  done ? "line-through text-[var(--muted-foreground)]" : ""
                                }`}
                              >
                                {action}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}

          {/* Regenerate button */}
          <div className="text-center pt-4">
            <button
              onClick={generate}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
