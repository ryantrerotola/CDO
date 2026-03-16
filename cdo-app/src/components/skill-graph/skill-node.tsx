"use client";

import { Handle, Position } from "@xyflow/react";

const levelColors: Record<string, string> = {
  NOT_STARTED: "#9ca3af",  // gray
  IN_PROGRESS: "#3b82f6",  // blue
  PROFICIENT: "#22c55e",   // green
  EXPERT: "#f59e0b",       // amber
};

const levelBg: Record<string, string> = {
  NOT_STARTED: "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700",
  IN_PROGRESS: "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700",
  PROFICIENT: "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700",
  EXPERT: "bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700",
};

interface SkillNodeData {
  label: string;
  proficiency: string;
  marketFrequency: number;
  isGap: boolean;
  onClick?: () => void;
}

export function SkillNode({ data }: { data: SkillNodeData }) {
  const prof = data.proficiency || "NOT_STARTED";
  const freq = data.marketFrequency || 0;

  // Ring size scales with market frequency
  const ringSize = 4 + (freq / 100) * 8; // 4px to 12px

  return (
    <div
      onClick={data.onClick}
      className={`relative cursor-pointer rounded-lg border-2 px-3 py-2 min-w-[120px] text-center transition-all hover:shadow-md ${levelBg[prof]}`}
      style={{ borderColor: levelColors[prof] }}
    >
      {/* Market frequency ring */}
      {freq > 0 && (
        <div
          className="absolute -top-1 -right-1 rounded-full"
          style={{
            width: ringSize * 2,
            height: ringSize * 2,
            backgroundColor: data.isGap ? "#ef4444" : levelColors[prof],
            opacity: 0.6,
          }}
        />
      )}

      {/* Gap flag */}
      {data.isGap && (
        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">!</span>
        </div>
      )}

      <p className="text-xs font-medium leading-tight">{data.label}</p>
      {freq > 0 && (
        <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{freq}% demand</p>
      )}

      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}
