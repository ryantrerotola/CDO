"use client";

const clusterGradients: Record<string, string> = {
  "Strategic Leadership": "from-purple-500 to-purple-700",
  "Technical Depth": "from-blue-500 to-blue-700",
  "Organizational Design": "from-green-500 to-green-700",
  "Data Products": "from-cyan-500 to-cyan-700",
  "Governance & Risk": "from-orange-500 to-orange-700",
  "Financial Acumen": "from-red-500 to-red-700",
  "Communication & Influence": "from-pink-500 to-pink-700",
};

interface ClusterNodeData {
  label: string;
  description: string;
  skillCount: number;
  proficientCount: number;
}

export function ClusterNode({ data }: { data: ClusterNodeData }) {
  const gradient = clusterGradients[data.label] || "from-gray-500 to-gray-700";

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl px-4 py-3 min-w-[160px] text-center text-white shadow-lg`}>
      <p className="text-sm font-bold leading-tight">{data.label}</p>
      <p className="text-[10px] opacity-80 mt-0.5">
        {data.proficientCount}/{data.skillCount} skills
      </p>
    </div>
  );
}
