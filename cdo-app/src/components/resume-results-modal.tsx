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
        <div className="space-y-5">
          {/* What's Good */}
          <section className="p-4 rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/40">
            <h3 className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400 mb-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              What&apos;s Good / On Track
            </h3>
            <p className="text-sm leading-relaxed text-green-900 dark:text-green-100">
              {analysis.strengthsSummary || "Analysis in progress..."}
            </p>
          </section>

          {/* What Needs Work */}
          <section className="p-4 rounded-lg border border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40">
            <h3 className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400 mb-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              What Needs Work
            </h3>
            <p className="text-sm leading-relaxed text-orange-900 dark:text-orange-100 mb-3">
              {analysis.needsWorkSummary || "Nothing flagged here — great work!"}
            </p>
            {needsWork.length > 0 && (
              <ul className="space-y-2.5 mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                {needsWork.map((gap) => (
                  <li key={gap.area} className="text-sm text-orange-900 dark:text-orange-100">
                    <span className="font-semibold">{gap.area}</span>
                    <p className="mt-0.5 text-orange-800 dark:text-orange-200/80">{gap.recommendation}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* What's Missing */}
          <section className="p-4 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40">
            <h3 className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400 mb-3">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              What&apos;s Missing
            </h3>
            <p className="text-sm leading-relaxed text-red-900 dark:text-red-100 mb-3">
              {analysis.missingSummary || "No critical gaps found — you're well-positioned!"}
            </p>
            {critical.length > 0 && (
              <ul className="space-y-2.5 mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                {critical.map((gap) => (
                  <li key={gap.area} className="text-sm text-red-900 dark:text-red-100">
                    <span className="font-semibold">{gap.area}</span>
                    <p className="mt-0.5 text-red-800 dark:text-red-200/80">{gap.recommendation}</p>
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
