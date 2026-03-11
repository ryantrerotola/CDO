"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Bell, Award } from "lucide-react";

const upcomingItems = [
  {
    title: "Gartner Data & Analytics Summit",
    date: "Mar 24-26, 2026",
    type: "event" as const,
    icon: Calendar,
  },
  {
    title: "CDMP Exam Registration Deadline",
    date: "Apr 1, 2026",
    type: "deadline" as const,
    icon: Award,
  },
  {
    title: "Monthly networking goal: 1 more connection needed",
    date: "Mar 31, 2026",
    type: "reminder" as const,
    icon: Bell,
  },
];

const typeColors = {
  event: "text-blue-600",
  deadline: "text-red-600",
  reminder: "text-orange-600",
};

export function Upcoming() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[var(--primary)]" />
          Upcoming
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--accent)] transition-colors"
            >
              <Icon
                className={`h-4 w-4 mt-0.5 flex-shrink-0 ${typeColors[item.type]}`}
              />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {item.date}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
