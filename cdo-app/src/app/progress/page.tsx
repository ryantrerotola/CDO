"use client";

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
  ChevronRight,
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

const careerTimeline = [
  { role: "Data Analyst", status: "completed", year: "2018" },
  { role: "Senior Analyst", status: "completed", year: "2020" },
  { role: "Analytics Manager", status: "completed", year: "2022" },
  { role: "Director of Data", status: "current", year: "2024" },
  { role: "VP of Data", status: "upcoming", year: "2026" },
  { role: "Chief Data Officer", status: "target", year: "2028" },
];

// Simulated monthly activity data
const activityData = [
  { month: "Sep", articles: 45, goals: 12, streak: 22 },
  { month: "Oct", articles: 52, goals: 15, streak: 28 },
  { month: "Nov", articles: 38, goals: 10, streak: 15 },
  { month: "Dec", articles: 41, goals: 14, streak: 20 },
  { month: "Jan", articles: 58, goals: 18, streak: 30 },
  { month: "Feb", articles: 63, goals: 20, streak: 28 },
  { month: "Mar", articles: 24, goals: 8, streak: 11 },
];

// Simulated activity heatmap data (last 12 weeks)
function generateHeatmapData() {
  const data: { week: number; day: number; value: number }[] = [];
  for (let week = 0; week < 12; week++) {
    for (let day = 0; day < 7; day++) {
      data.push({
        week,
        day,
        value: Math.floor(Math.random() * 5),
      });
    }
  }
  return data;
}

const heatmapData = generateHeatmapData();
const heatmapColors = [
  "bg-gray-100 dark:bg-gray-800",
  "bg-green-100 dark:bg-green-900",
  "bg-green-300 dark:bg-green-700",
  "bg-green-500 dark:bg-green-500",
  "bg-green-700 dark:bg-green-300",
];

export default function ProgressPage() {
  const { profile, goals } = useAppStore();

  const radarData = cdoSkillDomains.map((domain) => ({
    domain: domain.label.replace(" & ", "\n& "),
    value: profile.skills[domain.key as keyof typeof profile.skills],
    fullMark: 10,
  }));

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Career Progress</h1>
        <p className="text-[var(--muted-foreground)]">
          Track your journey toward becoming a Chief Data Officer
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
              Career Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {careerTimeline.map((milestone, i) => (
                <div key={milestone.role} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        milestone.status === "completed"
                          ? "bg-[var(--success)] border-[var(--success)]"
                          : milestone.status === "current"
                            ? "bg-[var(--primary)] border-[var(--primary)] ring-4 ring-[var(--primary)]/20"
                            : milestone.status === "target"
                              ? "bg-[var(--warning)] border-[var(--warning)]"
                              : "bg-[var(--background)] border-[var(--muted-foreground)]"
                      }`}
                    />
                    <div className="mt-2 text-center">
                      <p
                        className={`text-sm font-medium ${
                          milestone.status === "current"
                            ? "text-[var(--primary)]"
                            : milestone.status === "target"
                              ? "text-[var(--warning)]"
                              : ""
                        }`}
                      >
                        {milestone.role}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {milestone.year}
                      </p>
                      {milestone.status === "current" && (
                        <Badge className="mt-1">Current</Badge>
                      )}
                      {milestone.status === "target" && (
                        <Badge variant="warning" className="mt-1">
                          Target
                        </Badge>
                      )}
                    </div>
                  </div>
                  {i < careerTimeline.length - 1 && (
                    <div
                      className={`h-0.5 w-12 mx-2 ${
                        milestone.status === "completed"
                          ? "bg-[var(--success)]"
                          : "bg-[var(--border)]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[var(--primary)]" />
              CDO Competency Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fontSize: 10 }}
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
            <div className="mt-4 p-3 rounded-lg bg-[var(--accent)]">
              <p className="text-xs text-[var(--muted-foreground)]">
                CDO Readiness Score
              </p>
              <p className="text-2xl font-bold text-[var(--primary)]">
                {profile.resumeAnalysis?.overallReadiness || 62}%
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="articles"
                  fill="var(--primary)"
                  name="Articles Read"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="goals"
                  fill="var(--success)"
                  name="Goals Completed"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
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
            <div className="flex gap-1">
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
                  <p className="text-3xl font-bold">11</p>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Day Streak
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--accent)] text-center">
                <p className="text-3xl font-bold">321</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Articles Read
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
