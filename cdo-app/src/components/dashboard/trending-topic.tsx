"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function TrendingTopic() {
  return (
    <Card className="border-l-4 border-l-[var(--warning)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[var(--warning)]" />
          Trending in Data Leadership
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-2">
          Data Products: The New Operating Model for Data Teams
        </h4>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          Leading organizations are shifting from project-based data delivery to
          a product-oriented model. CDOs who adopt this approach report 40%
          faster time-to-insight and significantly higher stakeholder
          satisfaction. Key pillars include treating datasets as products with
          SLAs, assigning product managers to data domains, and measuring
          adoption metrics.
        </p>
        <div className="flex gap-2 mt-3">
          <span className="text-xs px-2 py-1 rounded-full bg-[var(--secondary)]">
            McKinsey
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-[var(--secondary)]">
            HBR
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-[var(--secondary)]">
            Gartner
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
