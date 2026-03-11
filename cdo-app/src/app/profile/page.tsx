"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { cdoSkillDomains } from "@/data/seed-content";
import {
  User,
  Upload,
  Building2,
  Plus,
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Trash2,
} from "lucide-react";

export default function ProfilePage() {
  const { profile, setProfile } = useAppStore();
  const [newCompany, setNewCompany] = useState({ name: "", industry: "" });
  const [showAddCompany, setShowAddCompany] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);

    // Simulate resume analysis (in production, this calls the Claude API)
    setAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setProfile({
      resumeUploaded: true,
      resumeAnalysis: {
        overallReadiness: 62,
        gaps: [
          {
            area: "Data Governance Experience",
            importance: "critical",
            recommendation:
              "Lead or participate in a data governance initiative. Consider pursuing CDMP certification.",
          },
          {
            area: "Executive Stakeholder Management",
            importance: "critical",
            recommendation:
              "Seek opportunities to present data strategy to C-suite. Join cross-functional leadership committees.",
          },
          {
            area: "P&L / Business Strategy",
            importance: "important",
            recommendation:
              "Take on responsibilities with direct revenue/cost impact. Consider an executive MBA or finance for non-finance courses.",
          },
          {
            area: "Change Management",
            importance: "important",
            recommendation:
              "Lead a data culture transformation initiative. Get certified in organizational change management.",
          },
          {
            area: "Vendor & Partner Management",
            importance: "nice-to-have",
            recommendation:
              "Take ownership of vendor evaluation and selection for data tools/platforms.",
          },
        ],
      },
      skills: {
        technical: 8,
        dataGovernance: 4,
        aiMl: 7,
        businessAcumen: 5,
        leadership: 5,
        stakeholderManagement: 4,
      },
    });
    setAnalyzing(false);
  };

  const addCompany = () => {
    if (!newCompany.name.trim()) return;
    setProfile({
      targetCompanies: [
        ...profile.targetCompanies,
        {
          id: Date.now().toString(),
          name: newCompany.name,
          industry: newCompany.industry,
          techStack: [],
        },
      ],
    });
    setNewCompany({ name: "", industry: "" });
    setShowAddCompany(false);
  };

  const removeCompany = (id: string) => {
    setProfile({
      targetCompanies: profile.targetCompanies.filter((c) => c.id !== id),
    });
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
                  onChange={(e) => setProfile({ name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={profile.email}
                  onChange={(e) => setProfile({ email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Current Role
                </label>
                <Input
                  placeholder="e.g., Director of Analytics"
                  value={profile.currentRole}
                  onChange={(e) => setProfile({ currentRole: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Industry
                </label>
                <Select
                  value={profile.industry}
                  onChange={(e) => setProfile({ industry: e.target.value })}
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
                  onChange={(e) =>
                    setProfile({ targetTimeline: e.target.value })
                  }
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
              ) : resumeFile ? (
                <div>
                  <CheckCircle2 className="h-8 w-8 text-[var(--success)] mx-auto mb-2" />
                  <p className="font-medium">{resumeFile.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)] mb-3">
                    Resume uploaded and analyzed
                  </p>
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
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}
            </div>

            {/* Gap Analysis Results */}
            {profile.resumeAnalysis && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">CDO Readiness Score</h3>
                  <span className="text-2xl font-bold text-[var(--primary)]">
                    {profile.resumeAnalysis.overallReadiness}%
                  </span>
                </div>
                <Progress value={profile.resumeAnalysis.overallReadiness} />

                <h3 className="font-semibold flex items-center gap-2 mt-6">
                  <Lightbulb className="h-4 w-4 text-[var(--warning)]" />
                  Identified Gaps & Recommendations
                </h3>
                <div className="space-y-3">
                  {profile.resumeAnalysis.gaps.map((gap) => (
                    <div
                      key={gap.area}
                      className="p-4 rounded-lg border bg-[var(--accent)]"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            gap.importance === "critical"
                              ? "text-red-500"
                              : gap.importance === "important"
                                ? "text-orange-500"
                                : "text-blue-500"
                          }`}
                        />
                        <span className="font-medium text-sm">{gap.area}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${importanceColors[gap.importance as keyof typeof importanceColors]}`}
                        >
                          {gap.importance}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] ml-6">
                        {gap.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
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
                    onChange={(e) =>
                      setProfile({
                        skills: {
                          ...profile.skills,
                          [domain.key]: parseInt(e.target.value),
                        },
                      })
                    }
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
    </div>
  );
}
