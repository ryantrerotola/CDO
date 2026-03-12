"use client";

import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { ResumeAnalysis } from "@/types";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Award,
} from "lucide-react";

interface ResumeResultsModalProps {
  open: boolean;
  onClose: () => void;
  analysis: ResumeAnalysis;
}

export function ResumeResultsModal({ open, onClose, analysis }: ResumeResultsModalProps) {
  const onTrack = analysis.gaps.filter((g) => g.importance === "nice-to-have");
  const needsWork = analysis.gaps.filter((g) => g.importance === "important");
  const critical = analysis.gaps.filter((g) => g.importance === "critical");

  const highRelevanceExp = analysis.experience.filter((e) => e.relevance === "high");
  const strongSkills = Object.entries(analysis.suggestedSkillAssessment)
    .filter(([, v]) => v >= 7)
    .map(([k]) => k);

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
          {/* What's Good / On Track */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
              <CheckCircle2 className="h-5 w-5" />
              What&apos;s Good / On Track
            </h3>
            <div className="space-y-2">
              {highRelevanceExp.length > 0 && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Relevant Experience</span>
                  </div>
                  <ul className="text-sm text-[var(--muted-foreground)] ml-6 space-y-1">
                    {highRelevanceExp.map((exp) => (
                      <li key={`${exp.title}-${exp.company}`}>
                        {exp.title} at {exp.company} ({exp.duration})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {strongSkills.length > 0 && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Strong Skills (7+/10)</span>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-6">
                    {strongSkills.map((skill) => (
                      <Badge key={skill} variant="success">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {analysis.certifications.length > 0 && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Certifications</span>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-6">
                    {analysis.certifications.map((cert) => (
                      <Badge key={cert} variant="outline">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {analysis.education.length > 0 && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Education</span>
                  </div>
                  <ul className="text-sm text-[var(--muted-foreground)] ml-6 space-y-1">
                    {analysis.education.map((edu) => (
                      <li key={`${edu.degree}-${edu.institution}`}>
                        {edu.degree} - {edu.institution} ({edu.year})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {onTrack.length > 0 &&
                onTrack.map((gap) => (
                  <div key={gap.area} className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <span className="text-sm font-medium">{gap.area}</span>
                    <p className="text-sm text-[var(--muted-foreground)]">{gap.recommendation}</p>
                  </div>
                ))}
              {highRelevanceExp.length === 0 && strongSkills.length === 0 &&
                analysis.certifications.length === 0 && analysis.education.length === 0 &&
                onTrack.length === 0 && (
                  <p className="text-sm text-[var(--muted-foreground)] italic">
                    No strong CDO-aligned strengths detected yet. Keep building!
                  </p>
                )}
            </div>
          </section>

          {/* What Needs Work */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-orange-700 mb-3">
              <AlertTriangle className="h-5 w-5" />
              What Needs Work
            </h3>
            <div className="space-y-2">
              {needsWork.length > 0 ? (
                needsWork.map((gap) => (
                  <div key={gap.area} className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{gap.area}</span>
                      <Badge variant="warning">important</Badge>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">{gap.recommendation}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] italic">
                  Nothing flagged here — great work!
                </p>
              )}
            </div>
          </section>

          {/* What's Missing */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
              <XCircle className="h-5 w-5" />
              What&apos;s Missing
            </h3>
            <div className="space-y-2">
              {critical.length > 0 ? (
                critical.map((gap) => (
                  <div key={gap.area} className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{gap.area}</span>
                      <Badge variant="destructive">critical</Badge>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">{gap.recommendation}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] italic">
                  No critical gaps found — you&apos;re well-positioned!
                </p>
              )}
            </div>
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
