"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { cdoSkillDomains } from "@/data/seed-content";
import { ResumeResultsModal } from "@/components/resume-results-modal";
import type { ResumeAnalysis } from "@/types";
import {
  User,
  Upload,
  Building2,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Trash2,
  XCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { profile, setProfile } = useAppStore();
  const [newCompany, setNewCompany] = useState({ name: "", industry: "" });
  const [showAddCompany, setShowAddCompany] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showResultsModal, setShowResultsModal] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          const resume = data.resumes?.[0];
          const hasResume = data.resumes?.length > 0;
          setProfile({
            name: data.name || "",
            email: data.email || "",
            currentRole: data.currentRole || "",
            industry: data.industry || "",
            targetTimeline: data.targetTimeline || "3 years",
            skills: data.skillAssessment || profile.skills,
            resumeUploaded: hasResume,
            resumeAnalysis: hasResume && resume?.recommendations
              ? {
                  skills: resume.skillsFound || [],
                  experience: resume.recommendations.experience || [],
                  education: resume.recommendations.education || [],
                  certifications: resume.recommendations.certifications || [],
                  gaps: resume.gapAnalysis || [],
                  overallReadiness: resume.recommendations.overallReadiness || 0,
                  suggestedSkillAssessment: resume.recommendations.suggestedSkillAssessment || data.skillAssessment || profile.skills,
                  strengthsSummary: resume.recommendations.strengthsSummary || "",
                  needsWorkSummary: resume.recommendations.needsWorkSummary || "",
                  missingSummary: resume.recommendations.missingSummary || "",
                }
              : null,
            targetCompanies: (data.targetCompanies || []).map((c: { id: string; name: string; industry: string; techStack: string[] }) => ({
              id: c.id,
              name: c.name,
              industry: c.industry || "",
              techStack: c.techStack || [],
            })),
          });
        }
      })
      .catch(console.error);
  }, [session?.user?.id]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setUploadError("");
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        setAnalyzing(false);
        return;
      }

      const fullAnalysis: ResumeAnalysis = data.analysis;
      setProfile({
        resumeUploaded: true,
        resumeAnalysis: fullAnalysis,
        skills: fullAnalysis.suggestedSkillAssessment || profile.skills,
      });
      setShowResultsModal(true);
    } catch {
      setUploadError("Failed to upload resume. Please try again.");
    }
    setAnalyzing(false);
  };

  const saveProfile = async (updates: Record<string, unknown>) => {
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfile({ [field]: value });
    saveProfile({ [field]: value });
  };

  const handleSkillChange = (key: string, value: number) => {
    const newSkills = { ...profile.skills, [key]: value };
    setProfile({ skills: newSkills });
    saveProfile({ skillAssessment: newSkills });
  };

  const addCompany = async () => {
    if (!newCompany.name.trim()) return;
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCompany.name, industry: newCompany.industry }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({
          targetCompanies: [
            ...profile.targetCompanies,
            {
              id: data.company.id,
              name: data.company.name,
              industry: data.company.industry || "",
              techStack: data.company.techStack || [],
            },
          ],
        });
      }
    } catch (error) {
      console.error("Failed to add company:", error);
    }
    setNewCompany({ name: "", industry: "" });
    setShowAddCompany(false);
  };

  const removeCompany = async (id: string) => {
    try {
      await fetch(`/api/companies?id=${id}`, { method: "DELETE" });
      setProfile({
        targetCompanies: profile.targetCompanies.filter((c) => c.id !== id),
      });
    } catch (error) {
      console.error("Failed to remove company:", error);
    }
  };

  const importanceColors = {
    critical: "bg-red-100 text-red-800",
    important: "bg-orange-100 text-orange-800",
    "nice-to-have": "bg-blue-100 text-blue-800",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-[var(--muted-foreground)]">
          Configure your career goals, upload your resume, and set target
          companies
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input
                  placeholder="Your name"
                  value={profile.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  value={session?.user?.email || profile.email}
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Current Role
                </label>
                <Input
                  placeholder="e.g., Director of Analytics"
                  value={profile.currentRole}
                  onChange={(e) => handleProfileChange("currentRole", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Industry
                </label>
                <Select
                  value={profile.industry}
                  onChange={(e) => handleProfileChange("industry", e.target.value)}
                >
                  <option value="">Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Government">Government</option>
                  <option value="Energy">Energy</option>
                  <option value="Telecommunications">Telecommunications</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Target Timeline
                </label>
                <Select
                  value={profile.targetTimeline}
                  onChange={(e) => handleProfileChange("targetTimeline", e.target.value)}
                >
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="3 years">3 years</option>
                  <option value="5 years">5 years</option>
                  <option value="7+ years">7+ years</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleResumeUpload}
              />
              {analyzing ? (
                <div>
                  <div className="animate-spin h-8 w-8 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="font-medium">Analyzing your resume with AI...</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Identifying skills, experience gaps, and personalized
                    recommendations
                  </p>
                </div>
              ) : resumeFile || profile.resumeUploaded ? (
                <div>
                  <CheckCircle2 className="h-8 w-8 text-[var(--success)] mx-auto mb-2" />
                  <p className="font-medium">{resumeFile?.name || "Resume uploaded"}</p>
                  <p className="text-sm text-[var(--muted-foreground)] mb-3">
                    Resume uploaded and analyzed
                  </p>
                  {uploadError && (
                    <p className="text-sm text-red-500 mb-3">{uploadError}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload New Resume
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  <p className="font-medium">Upload your resume</p>
                  <p className="text-sm text-[var(--muted-foreground)] mb-3">
                    PDF, DOCX, or TXT. AI will analyze your background and
                    identify skill gaps for the CDO role.
                  </p>
                  {uploadError && (
                    <p className="text-sm text-red-500 mb-3">{uploadError}</p>
                  )}
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}
            </div>

            {profile.resumeAnalysis && (
              <div className="mt-6 space-y-5">
                {/* Readiness Score */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">CDO Readiness Score</h3>
                  <span className="text-2xl font-bold text-[var(--primary)]">
                    {profile.resumeAnalysis.overallReadiness}%
                  </span>
                </div>
                <Progress value={profile.resumeAnalysis.overallReadiness} />

                {/* On Track */}
                <section className="p-4 rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/40">
                  <h3 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-400 mb-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    What&apos;s Good / On Track
                  </h3>
                  <p className="text-sm leading-relaxed text-green-900 dark:text-green-100">
                    {profile.resumeAnalysis.strengthsSummary || "Upload a new resume to get an updated assessment."}
                  </p>
                </section>

                {/* Needs Work */}
                <section className="p-4 rounded-lg border border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40">
                  <h3 className="font-semibold flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    What Needs Work
                  </h3>
                  <p className="text-sm leading-relaxed text-orange-900 dark:text-orange-100 mb-3">
                    {profile.resumeAnalysis.needsWorkSummary || "Nothing flagged here — great work!"}
                  </p>
                  {profile.resumeAnalysis.gaps.filter((g) => g.importance === "important").length > 0 && (
                    <ul className="space-y-2.5 mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                      {profile.resumeAnalysis.gaps
                        .filter((g) => g.importance === "important")
                        .map((gap) => (
                          <li key={gap.area} className="text-sm text-orange-900 dark:text-orange-100">
                            <span className="font-semibold">{gap.area}</span>
                            <p className="mt-0.5 text-orange-800 dark:text-orange-200/80">{gap.recommendation}</p>
                          </li>
                        ))}
                    </ul>
                  )}
                </section>

                {/* Missing */}
                <section className="p-4 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40">
                  <h3 className="font-semibold flex items-center gap-2 text-red-700 dark:text-red-400 mb-3">
                    <XCircle className="h-5 w-5 flex-shrink-0" />
                    What&apos;s Missing
                  </h3>
                  <p className="text-sm leading-relaxed text-red-900 dark:text-red-100 mb-3">
                    {profile.resumeAnalysis.missingSummary || "No critical gaps found — you're well-positioned!"}
                  </p>
                  {profile.resumeAnalysis.gaps.filter((g) => g.importance === "critical").length > 0 && (
                    <ul className="space-y-2.5 mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                      {profile.resumeAnalysis.gaps
                        .filter((g) => g.importance === "critical")
                        .map((gap) => (
                          <li key={gap.area} className="text-sm text-red-900 dark:text-red-100">
                            <span className="font-semibold">{gap.area}</span>
                            <p className="mt-0.5 text-red-800 dark:text-red-200/80">{gap.recommendation}</p>
                          </li>
                        ))}
                    </ul>
                  )}
                </section>

                {/* Nice to have */}
                {profile.resumeAnalysis.gaps.filter((g) => g.importance === "nice-to-have").length > 0 && (
                  <section className="p-4 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40">
                    <h3 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-3">
                      <Lightbulb className="h-5 w-5 flex-shrink-0" />
                      Nice to Have
                    </h3>
                    <ul className="space-y-2.5">
                      {profile.resumeAnalysis.gaps
                        .filter((g) => g.importance === "nice-to-have")
                        .map((gap) => (
                          <li key={gap.area} className="text-sm text-blue-900 dark:text-blue-100">
                            <span className="font-semibold">{gap.area}</span>
                            <p className="mt-0.5 text-blue-800 dark:text-blue-200/80">{gap.recommendation}</p>
                          </li>
                        ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skill Self-Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>CDO Skill Assessment</CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">
              Rate your current proficiency (1-10) in each CDO competency domain.
              {profile.resumeUploaded &&
                " AI has pre-filled these based on your resume."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {cdoSkillDomains.map((domain) => {
              const value =
                profile.skills[domain.key as keyof typeof profile.skills];
              return (
                <div key={domain.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">{domain.label}</label>
                    <span className="text-sm font-bold text-[var(--primary)]">
                      {value}/10
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">
                    {domain.description}
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={value}
                    onChange={(e) => handleSkillChange(domain.key, parseInt(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Target Companies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Target Companies
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddCompany(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Company
              </Button>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Companies you aspire to work for. Content and learning
              recommendations will be tailored to these companies.
            </p>
          </CardHeader>
          <CardContent>
            {showAddCompany && (
              <div className="mb-4 p-4 rounded-lg border bg-[var(--accent)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input
                    placeholder="Company name"
                    value={newCompany.name}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, name: e.target.value })
                    }
                  />
                  <Select
                    value={newCompany.industry}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, industry: e.target.value })
                    }
                  >
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addCompany}>
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddCompany(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {profile.targetCompanies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                <p className="text-sm text-[var(--muted-foreground)]">
                  No target companies yet. Add companies to get tailored content
                  and learning recommendations.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.targetCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <h4 className="font-medium">{company.name}</h4>
                      {company.industry && (
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {company.industry}
                        </p>
                      )}
                      {company.techStack.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {company.techStack.map((tech) => (
                            <Badge key={tech} variant="outline">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeCompany(company.id)}
                      className="p-2 rounded-md hover:bg-[var(--accent)]"
                    >
                      <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {profile.resumeAnalysis && (
        <ResumeResultsModal
          open={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          analysis={profile.resumeAnalysis}
        />
      )}
    </div>
  );
}
