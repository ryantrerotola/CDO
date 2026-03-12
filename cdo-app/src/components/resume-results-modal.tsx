"use client";

import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ResumeAnalysis } from "@/types";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface ResumeResultsModalProps {
  open: boolean;
  onClose: () => void;
  analysis: ResumeAnalysis;
}

export function ResumeResultsModal({ open, onClose, analysis }: ResumeResultsModalProps) {
  const needsWork = analysis.gaps.filter((g) => g.importance === "important");
  const critical = analysis.gaps.filter((g) => g.importance === "critical");

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <h2 className="text-xl font-bold pr-8">Resume Analysis Results</h2>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">CDO Readiness</span>
              <span className="text-2xl font-bold text-[var(--primary)]">
                {analysis.overallReadiness}%
              </span>
            </div>
            <Progress value={analysis.overallReadiness} />
          </div>
        </div>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-6">
          {/* What's Good */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-green-700 mb-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              What&apos;s Good / On Track
            </h3>
            <p className="text-sm leading-relaxed text-[var(--foreground)]">
              {analysis.strengthsSummary || "Analysis in progress..."}
            </p>
          </section>

          {/* What Needs Work */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-orange-700 mb-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              What Needs Work
            </h3>
            <p className="text-sm leading-relaxed text-[var(--foreground)] mb-3">
              {analysis.needsWorkSummary || "Nothing flagged here — great work!"}
            </p>
            {needsWork.length > 0 && (
              <ul className="space-y-2">
                {needsWork.map((gap) => (
                  <li key={gap.area} className="flex gap-2 text-sm">
                    <span className="text-orange-500 mt-0.5">&#8226;</span>
                    <div>
                      <span className="font-medium">{gap.area}:</span>{" "}
                      <span className="text-[var(--muted-foreground)]">{gap.recommendation}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* What's Missing */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-red-700 mb-2">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              What&apos;s Missing
            </h3>
            <p className="text-sm leading-relaxed text-[var(--foreground)] mb-3">
              {analysis.missingSummary || "No critical gaps found — you're well-positioned!"}
            </p>
            {critical.length > 0 && (
              <ul className="space-y-2">
                {critical.map((gap) => (
                  <li key={gap.area} className="flex gap-2 text-sm">
                    <span className="text-red-500 mt-0.5">&#8226;</span>
                    <div>
                      <span className="font-medium">{gap.area}:</span>{" "}
                      <span className="text-[var(--muted-foreground)]">{gap.recommendation}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="pt-2">
            <Button onClick={onClose} className="w-full">
              Got it — View Full Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
