"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, Flame, Target, RefreshCw } from "lucide-react";
import { periodProgress, periodLabel, goalStreak } from "@/lib/utils";

interface GoalEntry {
  id: string;
  date: string;
  value: number;
}

interface Goal {
  id: string;
  title: string;
  type: string;
  frequency: string;
  targetValue: number;
  currentValue: number;
  status: string;
  entries: GoalEntry[];
  parentGoalId: string | null;
}

type Freq = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONCE";

/** Pick the goals most relevant as "today's actions" */
function pickDailyActions(goals: Goal[]): Goal[] {
  const active = goals.filter((g) => g.status === "ACTIVE" && !g.parentGoalId);

  // Daily habits first, then weekly, then other actionable goals
  const daily = active.filter((g) => g.frequency === "DAILY");
  const weekly = active.filter((g) => g.frequency === "WEEKLY");
  const other = active.filter(
    (g) => g.frequency !== "DAILY" && g.frequency !== "WEEKLY"
  );

  // Combine: daily first, then weekly, then others — cap at 5
  return [...daily, ...weekly, ...other].slice(0, 5);
}

export function TodaysActions() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(() => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGoals(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchGoals();

    // Listen for goal updates from other components (e.g. marking articles as read)
    const handleGoalUpdate = () => fetchGoals();
    window.addEventListener("goal-progress", handleGoalUpdate);
    return () => window.removeEventListener("goal-progress", handleGoalUpdate);
  }, [fetchGoals]);

  const toggleComplete = async (goal: Goal) => {
    const progress = periodProgress(goal.entries, goal.frequency as Freq);
    if (progress >= goal.targetValue) return; // Already done this period

    try {
      await fetch("/api/goals/log-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: "MANUAL", goalId: goal.id }),
      });
      window.dispatchEvent(new CustomEvent("goal-progress"));
      fetchGoals();
    } catch {
      // Silently fail
    }
  };

  const actions = pickDailyActions(goals);
  const completedCount = actions.filter(
    (g) => periodProgress(g.entries, g.frequency as Freq) >= g.targetValue
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[var(--primary)]" />
            Today&apos;s Actions
          </CardTitle>
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium">
              {completedCount}/{actions.length}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <div className="text-center py-6">
            <RefreshCw className="h-5 w-5 mx-auto mb-2 text-[var(--muted-foreground)] animate-spin" />
            <p className="text-xs text-[var(--muted-foreground)]">Loading goals...</p>
          </div>
        )}

        {!loading && actions.length === 0 && (
          <div className="text-center py-6 text-[var(--muted-foreground)]">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active goals yet.</p>
            <a
              href="/goals"
              className="text-xs text-[var(--primary)] hover:underline mt-1 inline-block"
            >
              Set up your goals
            </a>
          </div>
        )}

        {!loading &&
          actions.map((goal) => {
            const freq = goal.frequency as Freq;
            const progress = periodProgress(goal.entries, freq);
            const target = goal.targetValue;
            const isComplete = progress >= target;
            const streak = freq !== "ONCE"
              ? goalStreak(goal.entries, freq, target)
              : 0;
            const label = periodLabel(freq);

            return (
              <button
                key={goal.id}
                onClick={() => toggleComplete(goal)}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[var(--accent)] transition-colors text-left"
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-[var(--success)] flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-[var(--muted-foreground)] flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${isComplete ? "line-through text-[var(--muted-foreground)]" : ""}`}
                  >
                    {goal.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {progress}/{target} {label}
                    </p>
                    {streak > 0 && (
                      <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-0.5">
                        <Flame className="h-3 w-3" />
                        {streak}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                  {goal.type}
                </span>
              </button>
            );
          })}
      </CardContent>
    </Card>
  );
}
