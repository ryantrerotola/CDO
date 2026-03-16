"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, Textarea } from "@/components/ui/input";
import {
  Plus,
  Target,
  Flame,
  CheckCircle2,
  Trash2,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { goalTemplates } from "@/data/seed-content";
import { useAppStore } from "@/lib/store";
import { getProgressPercentage, periodProgress, periodLabel, goalStreak } from "@/lib/utils";

interface SubGoalRec {
  title: string;
  description: string;
  type: "MILESTONE" | "HABIT" | "TARGET" | "PROJECT";
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONCE";
  targetValue: number;
  order: number;
}

interface GoalRecommendation {
  title: string;
  description: string;
  type: "MILESTONE" | "HABIT" | "TARGET" | "PROJECT";
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONCE";
  targetValue: number;
  skillArea: string;
  whyThisMatters: string;
  subGoals: SubGoalRec[];
  howToAchieve: string[];
}

const skillAreaLabels: Record<string, string> = {
  technical: "Technical Skills",
  dataGovernance: "Data Governance",
  aiMl: "AI/ML",
  businessAcumen: "Business Acumen",
  leadership: "Leadership",
  stakeholderManagement: "Stakeholder Mgmt",
};

const skillAreaColors: Record<string, string> = {
  technical: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  dataGovernance: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  aiMl: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  businessAcumen: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  leadership: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  stakeholderManagement: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
};

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, removeGoal, logGoalEntry, profile } =
    useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState("");
  const [expandedRec, setExpandedRec] = useState<number | null>(null);
  const [addedRecs, setAddedRecs] = useState<Set<string>>(new Set());
  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    type: "MILESTONE" | "HABIT" | "TARGET" | "PROJECT";
    frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONCE";
    targetValue: number;
    deadline: string;
  }>({
    title: "",
    description: "",
    type: "HABIT",
    frequency: "DAILY",
    targetValue: 1,
    deadline: "",
  });

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    setRecsError("");
    try {
      const res = await fetch("/api/goals/recommendations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecommendations(data);
        setExpandedRec(0);
      }
    } catch {
      setRecsError("Couldn't generate recommendations. Make sure you've uploaded your resume first.");
    }
    setLoadingRecs(false);
  };

  // Auto-fetch recommendations if user has a resume analysis
  useEffect(() => {
    if (profile.resumeAnalysis && recommendations.length === 0 && !loadingRecs) {
      fetchRecommendations();
    }
  }, [profile.resumeAnalysis]);

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) return;
    addGoal({
      id: Date.now().toString(),
      ...newGoal,
      currentValue: 0,
      status: "ACTIVE",
      streak: 0,
      entries: [],
    });
    setNewGoal({
      title: "",
      description: "",
      type: "HABIT",
      frequency: "DAILY",
      targetValue: 1,
      deadline: "",
    });
    setShowCreate(false);
  };

  const handleUseTemplate = (template: (typeof goalTemplates)[0]) => {
    addGoal({
      id: Date.now().toString(),
      title: template.title,
      description: template.description,
      type: template.type,
      frequency: template.frequency,
      targetValue: template.targetValue,
      currentValue: 0,
      status: "ACTIVE",
      streak: 0,
      entries: [],
    });
    setShowTemplates(false);
  };

  const handleAddRecommendation = async (rec: GoalRecommendation) => {
    // Create the parent goal via API so it persists
    try {
      const parentRes = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rec.title,
          description: rec.description,
          type: rec.type,
          frequency: rec.frequency,
          targetValue: rec.targetValue,
        }),
      });
      const parentData = await parentRes.json();
      const parentId = parentData.id;

      // Add to local store
      addGoal({
        id: parentId,
        title: rec.title,
        description: rec.description,
        type: rec.type,
        frequency: rec.frequency,
        targetValue: rec.targetValue,
        currentValue: 0,
        status: "ACTIVE",
        streak: 0,
        entries: [],
      });

      // Create sub-goals
      for (const sub of rec.subGoals) {
        const subRes = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: sub.title,
            description: sub.description,
            type: sub.type,
            frequency: sub.frequency,
            targetValue: sub.targetValue,
            parentGoalId: parentId,
          }),
        });
        const subData = await subRes.json();

        addGoal({
          id: subData.id,
          title: sub.title,
          description: sub.description,
          type: sub.type,
          frequency: sub.frequency,
          targetValue: sub.targetValue,
          currentValue: 0,
          status: "ACTIVE",
          streak: 0,
          entries: [],
        });
      }

      setAddedRecs((prev) => new Set(prev).add(rec.title));
    } catch (error) {
      console.error("Failed to add recommendation:", error);
    }
  };

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Goals & Habits</h1>
          <p className="text-[var(--muted-foreground)]">
            Track your progress toward becoming a CDO
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowTemplates(!showTemplates);
              setShowCreate(false);
            }}
          >
            Templates
          </Button>
          <Button
            onClick={() => {
              setShowCreate(!showCreate);
              setShowTemplates(false);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* AI-Powered Goal Recommendations */}
      {(recommendations.length > 0 || loadingRecs || profile.resumeAnalysis) && (
        <Card className="mb-6 border-[var(--primary)] border-opacity-30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                Recommended For You
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchRecommendations}
                disabled={loadingRecs}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loadingRecs ? "animate-spin" : ""}`} />
                {loadingRecs ? "Analyzing..." : "Refresh"}
              </Button>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              AI-generated goals based on your skill gaps and resume analysis
            </p>
          </CardHeader>
          <CardContent>
            {loadingRecs && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-3 text-[var(--primary)] animate-spin" />
                <p className="font-medium text-sm">Analyzing your skill gaps...</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Generating personalized goals with incremental sub-goals
                </p>
              </div>
            )}

            {recsError && (
              <div className="text-center py-6">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-sm text-[var(--muted-foreground)]">{recsError}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={fetchRecommendations}>
                  Try Again
                </Button>
              </div>
            )}

            {!loadingRecs && !recsError && recommendations.length > 0 && (
              <div className="space-y-4">
                {recommendations.map((rec, idx) => {
                  const isExpanded = expandedRec === idx;
                  const isAdded = addedRecs.has(rec.title);

                  return (
                    <div
                      key={idx}
                      className={`border rounded-xl transition-all ${
                        isExpanded ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : "hover:border-[var(--primary)]"
                      }`}
                    >
                      {/* Header — always visible */}
                      <button
                        className="w-full text-left p-4"
                        onClick={() => setExpandedRec(isExpanded ? null : idx)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${skillAreaColors[rec.skillArea] || "bg-gray-100 text-gray-800"}`}>
                                {skillAreaLabels[rec.skillArea] || rec.skillArea}
                              </span>
                              <Badge variant="outline">{rec.type}</Badge>
                              {isAdded && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Added
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-sm mb-1">{rec.title}</h3>
                            <p className="text-xs text-[var(--muted-foreground)]">{rec.description}</p>
                          </div>
                          <div className="flex-shrink-0 pt-1">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-[var(--muted-foreground)]" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)]" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-4">
                          {/* Why this matters */}
                          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                            <h4 className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1 flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Why This Matters
                            </h4>
                            <p className="text-xs text-orange-900 dark:text-orange-100 leading-relaxed">
                              {rec.whyThisMatters}
                            </p>
                          </div>

                          {/* Sub-goals */}
                          <div>
                            <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                              Incremental Steps ({rec.subGoals.length})
                            </h4>
                            <div className="space-y-2">
                              {rec.subGoals
                                .sort((a, b) => a.order - b.order)
                                .map((sub, subIdx) => (
                                  <div
                                    key={subIdx}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-[var(--accent)]"
                                  >
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-xs font-bold">
                                      {sub.order}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-medium text-sm">{sub.title}</span>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                          {sub.type}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-[var(--muted-foreground)]">
                                        {sub.description}
                                      </p>
                                    </div>
                                    {subIdx < rec.subGoals.length - 1 && (
                                      <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] flex-shrink-0 mt-1 hidden sm:block" />
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* How to achieve */}
                          <div>
                            <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2 flex items-center gap-1">
                              <Lightbulb className="h-3.5 w-3.5" />
                              How to Achieve This
                            </h4>
                            <ul className="space-y-1.5">
                              {rec.howToAchieve.map((tip, tipIdx) => (
                                <li key={tipIdx} className="text-xs text-[var(--foreground)] flex items-start gap-2">
                                  <span className="text-[var(--primary)] mt-0.5">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Add button */}
                          {!isAdded ? (
                            <Button
                              className="w-full"
                              onClick={() => handleAddRecommendation(rec)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Goal with {rec.subGoals.length} Sub-Goals
                            </Button>
                          ) : (
                            <div className="text-center py-2">
                              <span className="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                                Added to your goals
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingRecs && !recsError && recommendations.length === 0 && !profile.resumeAnalysis && (
              <div className="text-center py-6">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                <p className="text-sm text-[var(--muted-foreground)]">
                  Upload your resume on the Profile page to get AI-powered goal recommendations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Picker */}
      {showTemplates && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>CDO Goal Templates</CardTitle>
              <button onClick={() => setShowTemplates(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalTemplates.map((template) => (
                <button
                  key={template.title}
                  onClick={() => handleUseTemplate(template)}
                  className="text-left p-4 rounded-lg border hover:border-[var(--primary)] hover:bg-[var(--accent)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {template.title}
                    </span>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-[var(--primary)]">
                      {template.frequency} &middot; Target: {template.targetValue}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Goal Form */}
      {showCreate && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New Goal</CardTitle>
              <button onClick={() => setShowCreate(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                placeholder="e.g., Network with data leaders"
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Description
              </label>
              <Textarea
                placeholder="What does this goal help you achieve?"
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select
                  value={newGoal.type}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, type: e.target.value as typeof newGoal.type })
                  }
                >
                  <option value="HABIT">Habit</option>
                  <option value="TARGET">Target</option>
                  <option value="MILESTONE">Milestone</option>
                  <option value="PROJECT">Project</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Frequency
                </label>
                <Select
                  value={newGoal.frequency}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, frequency: e.target.value as typeof newGoal.frequency })
                  }
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="ONCE">One-time</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target</label>
                <Input
                  type="number"
                  min="1"
                  value={newGoal.targetValue}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      targetValue: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Deadline
                </label>
                <Input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, deadline: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateGoal}>Create Goal</Button>
          </CardFooter>
        </Card>
      )}

      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Active Goals ({activeGoals.length})
        </h2>

        {activeGoals.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
              <h3 className="font-semibold mb-2">No goals yet</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Set your first goal to start tracking your CDO career progress
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setShowTemplates(true)}>
                  Browse Templates
                </Button>
                <Button onClick={() => setShowCreate(true)}>
                  Create Custom Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeGoals.map((goal) => {
          const isRecurring = goal.frequency !== "ONCE";
          const progress = isRecurring
            ? periodProgress(goal.entries, goal.frequency as "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY")
            : goal.currentValue;
          const label = periodLabel(goal.frequency as "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONCE");
          const streak = isRecurring
            ? goalStreak(goal.entries, goal.frequency as "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY", goal.targetValue)
            : 0;
          const streakUnit = goal.frequency === "DAILY" ? "day" : goal.frequency === "WEEKLY" ? "week" : goal.frequency === "MONTHLY" ? "month" : "period";

          return (
            <Card key={goal.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium">{goal.title}</h3>
                      <Badge variant="outline">{goal.type}</Badge>
                      <Badge variant="outline">{goal.frequency}</Badge>
                      {streak > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 font-medium">
                          <Flame className="h-3 w-3" />
                          {streak} {streakUnit} streak
                        </span>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-[var(--muted-foreground)] mb-2">
                        {goal.description}
                      </p>
                    )}
                    <Progress
                      value={getProgressPercentage(progress, goal.targetValue)}
                      showLabel
                      className="mb-2"
                    />
                    <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                      <span>
                        {progress} / {goal.targetValue} {label}
                      </span>
                      {isRecurring && (
                        <span>{goal.currentValue} all time</span>
                      )}
                      {goal.deadline && (
                        <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logGoalEntry(goal.id, 1)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Log
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateGoal(goal.id, { status: "COMPLETED" })
                      }
                    >
                      Complete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
            Completed ({completedGoals.length})
          </h2>
          {completedGoals.map((goal) => (
            <Card key={goal.id} className="opacity-60">
              <CardContent className="py-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
                  <span className="line-through">{goal.title}</span>
                  <Badge variant="success">{goal.type}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
