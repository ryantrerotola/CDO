"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { cdoSkillDomains } from "@/data/seed-content";
import {
  TrendingUp,
  Target,
  BookOpen,
  Flame,
  Award,
  Calendar,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useMemo } from "react";

// Short labels for mobile, full labels for desktop
const shortLabels: Record<string, string> = {
  "Technical Skills": "Technical",
  "Data Governance & Strategy": "Governance",
  "AI/ML & Analytics": "AI/ML",
  "Business Acumen": "Business",
  "Leadership & Communication": "Leadership",
  "Stakeholder Management": "Stakeholders",
};

function computeStreak(goals: { entries: { date: string; value: number }[] }[]): number {
  const allDates = new Set<string>();
  for (const goal of goals) {
    for (const entry of goal.entries) {
      allDates.add(new Date(entry.date).toISOString().split("T")[0]);
    }
  }
  if (allDates.size === 0) return 0;

  const sorted = Array.from(allDates).sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function computeMonthlyActivity(goals: { entries: { date: string; value: number }[] }[]) {
  const months: Record<string, { goals: number }> = {};

  for (const goal of goals) {
    for (const entry of goal.entries) {
      const d = new Date(entry.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) months[key] = { goals: 0 };
      months[key].goals += entry.value;
    }
  }

  const sorted = Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  return sorted.map(([key, data]) => {
    const [year, month] = key.split("-");
    const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "short" });
    return { month: label, goals: data.goals };
  });
}

function computeHeatmapData(goals: { entries: { date: string; value: number }[] }[]) {
  const data: { week: number; day: number; value: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateCounts: Record<string, number> = {};
  for (const goal of goals) {
    for (const entry of goal.entries) {
      const dateKey = new Date(entry.date).toISOString().split("T")[0];
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + entry.value;
    }
  }

  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const gridStart = new Date(startOfWeek);
  gridStart.setDate(gridStart.getDate() - 11 * 7);

  for (let week = 0; week < 12; week++) {
    for (let day = 0; day < 7; day++) {
      const cellDate = new Date(gridStart);
      cellDate.setDate(cellDate.getDate() + week * 7 + day);
      const dateKey = cellDate.toISOString().split("T")[0];
      const count = dateCounts[dateKey] || 0;
      data.push({ week, day, value: Math.min(count, 4) });
    }
  }

  return data;
}

const heatmapColors = [
  "bg-gray-100 dark:bg-gray-800",
  "bg-green-100 dark:bg-green-900",
  "bg-green-300 dark:bg-green-700",
  "bg-green-500 dark:bg-green-500",
  "bg-green-700 dark:bg-green-300",
];

// Custom radar axis tick that wraps text and uses short labels on mobile
function CustomRadarTick(props: {
  x: number;
  y: number;
  payload: { value: string };
  cx: number;
  cy: number;
}) {
  const { x, y, payload, cx, cy } = props;
  const label = payload.value;
  const short = shortLabels[label] || label;

  // Position text outside the radar
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offsetX = dist > 0 ? (dx / dist) * 12 : 0;
  const offsetY = dist > 0 ? (dy / dist) * 12 : 0;

  const anchor =
    Math.abs(dx) < 10 ? "middle" : dx > 0 ? "start" : "end";

  return (
    <g>
      {/* Short label always visible */}
      <text
        x={x + offsetX}
        y={y + offsetY}
        textAnchor={anchor}
        dominantBaseline="central"
        className="fill-[var(--foreground)]"
        style={{ fontSize: "11px", fontWeight: 500 }}
      >
        {short}
      </text>
    </g>
  );
}

export default function ProgressPage() {
  const { profile, goals } = useAppStore();

  const radarData = cdoSkillDomains.map((domain) => ({
    domain: domain.label,
    value: profile.skills[domain.key as keyof typeof profile.skills],
    fullMark: 10,
  }));

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");

  const streak = useMemo(() => computeStreak(goals), [goals]);
  const monthlyActivity = useMemo(() => computeMonthlyActivity(goals), [goals]);
  const heatmapData = useMemo(() => computeHeatmapData(goals), [goals]);

  const totalEntries = useMemo(
    () => goals.reduce((sum, g) => sum + g.entries.length, 0),
    [goals]
  );

  const readinessScore = profile.resumeAnalysis?.overallReadiness ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Career Progress</h1>
        <p className="text-[var(--muted-foreground)]">
          Track your journey toward becoming a Chief Data Officer
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[var(--primary)]" />
              CDO Competency Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={CustomRadarTick as any}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 10]}
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Skill legend for mobile */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
              {cdoSkillDomains.map((domain) => (
                <div key={domain.key} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                  <span className="text-xs text-[var(--muted-foreground)] leading-tight">
                    {domain.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-[var(--accent)]">
              <p className="text-xs text-[var(--muted-foreground)]">
                CDO Readiness Score
              </p>
              <p className="text-2xl font-bold text-[var(--primary)]">
                {readinessScore}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[var(--primary)]" />
              Monthly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyActivity}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="goals"
                    fill="var(--primary)"
                    name="Goal Progress"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-[var(--muted-foreground)]">
                <p>Log goal progress to see monthly activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--primary)]" />
              Learning Activity (Last 12 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {Array.from({ length: 12 }).map((_, week) => (
                <div key={week} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, day) => {
                    const cell = heatmapData.find(
                      (d) => d.week === week && d.day === day
                    );
                    return (
                      <div
                        key={`${week}-${day}`}
                        className={`w-4 h-4 rounded-sm ${heatmapColors[cell?.value || 0]}`}
                        title={`${cell?.value || 0} activities`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-[var(--muted-foreground)]">
              <span>Less</span>
              {heatmapColors.map((color, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${color}`}
                />
              ))}
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Goal Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[var(--primary)]" />
              Goal Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-[var(--accent)] text-center">
                <p className="text-3xl font-bold text-[var(--primary)]">
                  {activeGoals.length}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Active Goals
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--accent)] text-center">
                <p className="text-3xl font-bold text-[var(--success)]">
                  {completedGoals.length}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Completed
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--accent)] text-center">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <p className="text-3xl font-bold">{streak}</p>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Day Streak
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--accent)] text-center">
                <p className="text-3xl font-bold">{totalEntries}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Activities Logged
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
