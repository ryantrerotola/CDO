"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIChat } from "@/components/ai-chat";
import {
  RefreshCw,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  Target,
  CheckCircle2,
} from "lucide-react";

interface SkillData {
  id: string;
  name: string;
  description: string;
  anchors: Record<string, string> | null;
  proficiency: string;
  marketFrequency: number;
  edges: { target: string; type: string }[];
}

interface ClusterData {
  id: string;
  name: string;
  description: string;
  skills: SkillData[];
}

const profLevels = ["NOT_STARTED", "IN_PROGRESS", "PROFICIENT", "EXPERT"];
const profLabels: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  PROFICIENT: "Proficient",
  EXPERT: "Expert",
};
const profColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400",
  IN_PROGRESS: "bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300",
  PROFICIENT: "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300",
  EXPERT: "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300",
};
const profDotColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-400",
  IN_PROGRESS: "bg-blue-500",
  PROFICIENT: "bg-green-500",
  EXPERT: "bg-amber-500",
};

const clusterColors: Record<string, string> = {
  "Strategic Leadership": "from-purple-600 to-purple-800",
  "Technical Depth": "from-blue-600 to-blue-800",
  "Organizational Design": "from-green-600 to-green-800",
  "Data Products": "from-cyan-600 to-cyan-800",
  "Governance & Risk": "from-orange-600 to-orange-800",
  "Financial Acumen": "from-red-600 to-red-800",
  "Communication & Influence": "from-pink-600 to-pink-800",
};

export default function SkillGraphPage() {
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/skill-graph");
      if (res.ok) {
        const data: ClusterData[] = await res.json();
        setClusters(data);
        // Expand all clusters initially
        setExpandedClusters(new Set(data.map((c) => c.id)));
      }
    } catch (err) {
      console.error("Failed to fetch skill graph:", err);
    }
    setLoading(false);
  };

  const updateProficiency = async (skillId: string, level: string) => {
    try {
      await fetch("/api/skill-graph", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId, level }),
      });
      setClusters((prev) =>
        prev.map((c) => ({
          ...c,
          skills: c.skills.map((s) =>
            s.id === skillId ? { ...s, proficiency: level } : s
          ),
        }))
      );
      if (selectedSkill?.id === skillId) {
        setSelectedSkill({ ...selectedSkill, proficiency: level });
      }
    } catch (err) {
      console.error("Failed to update proficiency:", err);
    }
  };

  const toggleCluster = (id: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getClusterStats = (cluster: ClusterData) => {
    const total = cluster.skills.length;
    const proficient = cluster.skills.filter(
      (s) => s.proficiency === "PROFICIENT" || s.proficiency === "EXPERT"
    ).length;
    const inProgress = cluster.skills.filter((s) => s.proficiency === "IN_PROGRESS").length;
    const notStarted = cluster.skills.filter((s) => s.proficiency === "NOT_STARTED").length;
    const pct = total > 0 ? Math.round((proficient / total) * 100) : 0;
    return { total, proficient, inProgress, notStarted, pct };
  };

  const overallStats = () => {
    const allSkills = clusters.flatMap((c) => c.skills);
    const total = allSkills.length;
    const proficient = allSkills.filter(
      (s) => s.proficiency === "PROFICIENT" || s.proficiency === "EXPERT"
    ).length;
    const inProgress = allSkills.filter((s) => s.proficiency === "IN_PROGRESS").length;
    return { total, proficient, inProgress, pct: total > 0 ? Math.round((proficient / total) * 100) : 0 };
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-20">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 text-[var(--muted-foreground)] animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading skills...</p>
        </div>
      </div>
    );
  }

  const stats = overallStats();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-[var(--primary)]" />
          Skill Assessment
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Rate your proficiency across CDO competencies. Click any skill to set your level.
        </p>
      </div>

      {/* Overall progress */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--primary)]">{stats.pct}%</p>
              <p className="text-xs text-[var(--muted-foreground)]">Proficient+</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-1">
                <span>{stats.proficient} of {stats.total} skills at Proficient or Expert</span>
                <span>{stats.inProgress} in progress</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--secondary)] overflow-hidden flex">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(stats.proficient / Math.max(stats.total, 1)) * 100}%` }}
                />
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(stats.inProgress / Math.max(stats.total, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {/* Clusters and Skills */}
        <div className="flex-1 space-y-4">
          {clusters.map((cluster) => {
            const cstats = getClusterStats(cluster);
            const isExpanded = expandedClusters.has(cluster.id);
            const gradient = clusterColors[cluster.name] || "from-gray-600 to-gray-800";

            return (
              <div key={cluster.id} className="rounded-xl border overflow-hidden">
                {/* Cluster header */}
                <button
                  onClick={() => toggleCluster(cluster.id)}
                  className={`w-full flex items-center justify-between p-4 bg-gradient-to-r ${gradient} text-white`}
                >
                  <div className="text-left">
                    <h2 className="font-semibold">{cluster.name}</h2>
                    <p className="text-xs opacity-80">{cluster.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold">{cstats.proficient}/{cstats.total}</p>
                      <p className="text-[10px] opacity-70">proficient</p>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-16 h-2 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full bg-white/80 rounded-full transition-all"
                        style={{ width: `${cstats.pct}%` }}
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 opacity-70" />
                    ) : (
                      <ChevronDown className="h-5 w-5 opacity-70" />
                    )}
                  </div>
                </button>

                {/* Skills grid */}
                {isExpanded && (
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[var(--card)]">
                    {cluster.skills.map((skill) => {
                      const isGap =
                        (skill.proficiency === "NOT_STARTED" || skill.proficiency === "IN_PROGRESS") &&
                        skill.marketFrequency > 40;
                      const isSelected = selectedSkill?.id === skill.id;

                      return (
                        <button
                          key={skill.id}
                          onClick={() => {
                            setSelectedSkill(skill);
                            setShowChat(false);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
                            isSelected
                              ? "border-[var(--primary)] bg-[var(--accent)] shadow-sm"
                              : "border-[var(--border)] hover:border-[var(--primary)]/50"
                          }`}
                        >
                          {/* Proficiency dot */}
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${profDotColors[skill.proficiency]}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{skill.name}</p>
                              {isGap && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-medium flex-shrink-0">
                                  GAP
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--muted-foreground)]">
                              {profLabels[skill.proficiency]}
                              {skill.marketFrequency > 0 && ` · ${skill.marketFrequency}% demand`}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedSkill && (
          <Card className="w-80 flex-shrink-0 self-start sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{selectedSkill.name}</CardTitle>
                <button onClick={() => { setSelectedSkill(null); setShowChat(false); }}>
                  <X className="h-4 w-4 text-[var(--muted-foreground)]" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {selectedSkill.description}
              </p>

              {selectedSkill.marketFrequency > 0 && (
                <div className="text-xs">
                  <span className="text-[var(--muted-foreground)]">Market demand: </span>
                  <span className="font-medium">{selectedSkill.marketFrequency}%</span>
                </div>
              )}

              {/* Proficiency selector */}
              <div>
                <label className="text-xs font-medium block mb-2">Your Level</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {profLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => updateProficiency(selectedSkill.id, level)}
                      className={`text-xs px-2 py-2 rounded-lg border-2 transition-all font-medium ${
                        selectedSkill.proficiency === level
                          ? profColors[level]
                          : "border-[var(--border)] hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {selectedSkill.proficiency === level && (
                        <CheckCircle2 className="h-3 w-3 inline mr-1" />
                      )}
                      {profLabels[level]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Behavioral anchors */}
              {selectedSkill.anchors && (
                <div>
                  <label className="text-xs font-medium block mb-2">What each level means</label>
                  <div className="space-y-1.5">
                    {profLevels.map((level) => {
                      const anchors = selectedSkill.anchors as Record<string, string>;
                      if (!anchors[level]) return null;
                      return (
                        <div
                          key={level}
                          className={`text-xs p-2 rounded-lg ${
                            selectedSkill.proficiency === level
                              ? "bg-[var(--accent)] border border-[var(--primary)]"
                              : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          <span className="font-medium">{profLabels[level]}:</span>{" "}
                          {anchors[level]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Coach */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowChat(!showChat)}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {showChat ? "Hide Coach" : "How do I improve?"}
              </Button>

              {showChat && (
                <AIChat
                  context={{
                    type: "skill",
                    skillName: selectedSkill.name,
                    clusterName: clusters.find((c) =>
                      c.skills.some((s) => s.id === selectedSkill.id)
                    )?.name,
                    marketFrequency: selectedSkill.marketFrequency,
                    userProficiency: profLevels.indexOf(selectedSkill.proficiency),
                  }}
                  placeholder={`Ask about developing "${selectedSkill.name}"...`}
                  title="Skill Coach"
                  onClose={() => setShowChat(false)}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 flex-wrap text-xs text-[var(--muted-foreground)]">
        <span className="font-medium">Legend:</span>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-400" /> Not Started</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /> In Progress</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /> Proficient</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500" /> Expert</div>
        <div className="flex items-center gap-1.5"><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-medium">GAP</span> High demand, low proficiency</div>
      </div>
    </div>
  );
}
