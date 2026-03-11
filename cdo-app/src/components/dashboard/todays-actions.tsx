"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, Flame, Target } from "lucide-react";

interface Action {
  id: string;
  title: string;
  type: string;
  completed: boolean;
  progress: number;
  target: number;
}

const initialActions: Action[] = [
  {
    id: "1",
    title: "Read 2 data leadership articles",
    type: "HABIT",
    completed: false,
    progress: 0,
    target: 2,
  },
  {
    id: "2",
    title: "Network with a data leader",
    type: "TARGET",
    completed: false,
    progress: 1,
    target: 2,
  },
  {
    id: "3",
    title: "Review CDMP study materials",
    type: "MILESTONE",
    completed: false,
    progress: 0,
    target: 1,
  },
  {
    id: "4",
    title: "Write LinkedIn post draft",
    type: "PROJECT",
    completed: false,
    progress: 0,
    target: 1,
  },
];

export function TodaysActions() {
  const [actions, setActions] = useState(initialActions);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const completedCount = actions.filter((a) => a.completed).length;

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
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => toggleAction(action.id)}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[var(--accent)] transition-colors text-left"
          >
            {action.completed ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--success)] flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-[var(--muted-foreground)] flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${action.completed ? "line-through text-[var(--muted-foreground)]" : ""}`}
              >
                {action.title}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {action.progress}/{action.target} completed this period
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
              {action.type}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
