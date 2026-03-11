"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LearningPick() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--primary)]" />
          Today&apos;s Learning Pick
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-3 w-3 fill-[var(--warning)] text-[var(--warning)]"
              />
            ))}
          </div>
          <h4 className="font-semibold text-sm">
            Chief Data Officer&apos;s Playbook
          </h4>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            by Caroline Carruthers & Peter Jackson
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-2 leading-relaxed">
            The definitive guide to the CDO role. Based on your skill gaps in
            data governance and stakeholder management, this book addresses
            exactly what you need.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
              Matches your gaps
            </span>
          </div>
          <Button variant="outline" size="sm" className="mt-3 w-full">
            Add to Reading List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
