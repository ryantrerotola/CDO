"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIChat } from "@/components/ai-chat";
import { SkillNode } from "@/components/skill-graph/skill-node";
import { ClusterNode } from "@/components/skill-graph/cluster-node";
import {
  RefreshCw,
  Download,
  Sparkles,
  X,
  ChevronUp,
  ChevronDown,
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

const nodeTypes = {
  skillNode: SkillNode,
  clusterNode: ClusterNode,
};

const profLevels = ["NOT_STARTED", "IN_PROGRESS", "PROFICIENT", "EXPERT"];
const profLabels: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  PROFICIENT: "Proficient",
  EXPERT: "Expert",
};

export default function SkillGraphPage() {
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const reactFlowRef = useRef<HTMLDivElement>(null);

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
        buildGraph(data);
      }
    } catch (err) {
      console.error("Failed to fetch skill graph:", err);
    }
    setLoading(false);
  };

  const buildGraph = useCallback((data: ClusterData[]) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Determine which clusters to show (progressive unlock)
    const clustersToShow = showAll ? data : getUnlockedClusters(data);

    // Layout: clusters in a circle, skills radiate outward
    const centerX = 500;
    const centerY = 400;
    const clusterRadius = 280;

    clustersToShow.forEach((cluster, ci) => {
      const angle = (ci / clustersToShow.length) * 2 * Math.PI - Math.PI / 2;
      const cx = centerX + Math.cos(angle) * clusterRadius;
      const cy = centerY + Math.sin(angle) * clusterRadius;

      const proficientCount = cluster.skills.filter(
        (s) => s.proficiency === "PROFICIENT" || s.proficiency === "EXPERT"
      ).length;

      // Cluster node
      newNodes.push({
        id: `cluster-${cluster.id}`,
        type: "clusterNode",
        position: { x: cx - 80, y: cy - 20 },
        data: {
          label: cluster.name,
          description: cluster.description,
          skillCount: cluster.skills.length,
          proficientCount,
        },
        draggable: true,
      });

      // Skill nodes radiating from cluster
      const skillRadius = 130;
      cluster.skills.forEach((skill, si) => {
        const sAngle = angle + ((si - 2) / cluster.skills.length) * 1.2;
        const sx = cx + Math.cos(sAngle) * skillRadius;
        const sy = cy + Math.sin(sAngle) * skillRadius;

        const isGap =
          (skill.proficiency === "NOT_STARTED" || skill.proficiency === "IN_PROGRESS") &&
          skill.marketFrequency > 40;

        newNodes.push({
          id: skill.id,
          type: "skillNode",
          position: { x: sx - 60, y: sy - 15 },
          data: {
            label: skill.name,
            proficiency: skill.proficiency,
            marketFrequency: skill.marketFrequency,
            isGap,
            onClick: () => setSelectedSkill(skill),
          },
          draggable: true,
        });

        // Edge from cluster to skill
        newEdges.push({
          id: `e-${cluster.id}-${skill.id}`,
          source: `cluster-${cluster.id}`,
          target: skill.id,
          style: { stroke: "var(--border)", strokeWidth: 1 },
          animated: false,
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [showAll, setNodes, setEdges]);

  useEffect(() => {
    if (clusters.length > 0) buildGraph(clusters);
  }, [showAll, clusters, buildGraph]);

  const getUnlockedClusters = (data: ClusterData[]): ClusterData[] => {
    // Score each cluster by user engagement
    const scored = data.map((c) => {
      const engaged = c.skills.filter((s) => s.proficiency !== "NOT_STARTED").length;
      return { cluster: c, score: engaged };
    });
    scored.sort((a, b) => b.score - a.score);

    // Always show at least 3, unlock more as user progresses
    const minShow = 3;
    const unlocked = scored.filter((s) => s.score > 0).length;
    const toShow = Math.max(minShow, unlocked + 1);
    return scored.slice(0, Math.min(toShow, data.length)).map((s) => s.cluster);
  };

  const updateProficiency = async (skillId: string, level: string) => {
    try {
      await fetch("/api/skill-graph", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId, level }),
      });
      // Update local state
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

  const exportPng = async () => {
    if (!reactFlowRef.current) return;
    try {
      const dataUrl = await toPng(reactFlowRef.current, {
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = "skill-graph.png";
      link.href = dataUrl;
      link.click();
    } catch {
      console.error("Export failed");
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Skill Graph</h1>
          <p className="text-[var(--muted-foreground)]">
            Your interactive CDO competency map
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
            {showAll ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {showAll ? "Progressive View" : "Show All Clusters"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportPng}>
            <Download className="h-4 w-4 mr-1" />
            Export PNG
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 text-[var(--muted-foreground)] animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading skill graph...</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Graph */}
          <div
            ref={reactFlowRef}
            className="flex-1 border rounded-xl overflow-hidden bg-[var(--background)]"
            style={{ height: "70vh" }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.3}
              maxZoom={2}
            >
              <Background gap={20} size={1} />
              <Controls />
              <MiniMap
                nodeStrokeWidth={3}
                zoomable
                pannable
                className="!bg-[var(--card)]"
              />
            </ReactFlow>
          </div>

          {/* Detail Panel */}
          {selectedSkill && (
            <Card className="w-80 flex-shrink-0 self-start">
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
                        className={`text-xs px-2 py-1.5 rounded-md border transition-colors ${
                          selectedSkill.proficiency === level
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                            : "border-[var(--border)] hover:bg-[var(--accent)]"
                        }`}
                      >
                        {profLabels[level]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Behavioral anchors */}
                {selectedSkill.anchors && (
                  <div>
                    <label className="text-xs font-medium block mb-2">Level Descriptions</label>
                    <div className="space-y-2">
                      {profLevels.map((level) => {
                        const anchors = selectedSkill.anchors as Record<string, string>;
                        return (
                          <div
                            key={level}
                            className={`text-xs p-2 rounded border ${
                              selectedSkill.proficiency === level
                                ? "border-[var(--primary)] bg-[var(--accent)]"
                                : "border-transparent"
                            }`}
                          >
                            <span className="font-medium">{profLabels[level]}:</span>{" "}
                            <span className="text-[var(--muted-foreground)]">
                              {anchors[level]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* What should I work on next? */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowChat(!showChat)}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {showChat ? "Hide Chat" : "What should I work on?"}
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
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 flex-wrap text-xs text-[var(--muted-foreground)]">
        <span className="font-medium">Legend:</span>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-400" /> Not Started</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500" /> In Progress</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> Proficient</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500" /> Expert</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> Gap Flag</div>
      </div>
    </div>
  );
}
