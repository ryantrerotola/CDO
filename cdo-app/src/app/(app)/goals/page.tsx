"use client";

import { useState } from "react";
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
  Circle,
  Trash2,
  X,
} from "lucide-react";
import { goalTemplates } from "@/data/seed-content";
import { useAppStore } from "@/lib/store";
import { getProgressPercentage } from "@/lib/utils";

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, removeGoal, logGoalEntry } =
    useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
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

        {activeGoals.map((goal) => (
          <Card key={goal.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{goal.title}</h3>
                    <Badge variant="outline">{goal.type}</Badge>
                    <Badge variant="outline">{goal.frequency}</Badge>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-[var(--muted-foreground)] mb-2">
                      {goal.description}
                    </p>
                  )}
                  <Progress
                    value={getProgressPercentage(
                      goal.currentValue,
                      goal.targetValue
                    )}
                    showLabel
                    className="mb-2"
                  />
                  <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                    <span>
                      {goal.currentValue} / {goal.targetValue}
                    </span>
                    {goal.streak > 0 && (
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {goal.streak} day streak
                      </span>
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
        ))}
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
