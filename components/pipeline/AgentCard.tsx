"use client";
import { AgentMeta } from "@/lib/agents.config";
import { AgentStatus } from "@/types";

interface AgentCardProps {
  agent: AgentMeta;
  index: number;
  status: AgentStatus;
  elapsed?: number;
}

const statusConfig: Record<AgentStatus, { label: string; dotColor: string; pulse: boolean }> = {
  idle: { label: "Idle", dotColor: "#333", pulse: false },
  running: { label: "Running...", dotColor: "#E24B4A", pulse: true },
  done: { label: "Done", dotColor: "#1D9E75", pulse: false },
  error: { label: "Error", dotColor: "#E24B4A", pulse: false },
  skipped: { label: "Skipped", dotColor: "#444", pulse: false },
};

export default function AgentCard({ agent, index, status, elapsed }: AgentCardProps) {
  const cfg = statusConfig[status];

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        status === "running"
          ? "border-[#E24B4A] bg-[#1a0a0a]"
          : status === "done"
          ? "border-[#1D9E7544] bg-[#0a1a14]"
          : status === "error"
          ? "border-[#E24B4A44] bg-[#1a0808]"
          : "border-[#2a2a2a] bg-[#111]"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
          style={{
            background: status === "running" ? "#2A0F0F" : status === "done" ? "#0A1F18" : "#1a1a1a",
            color: status === "running" ? "#E24B4A" : status === "done" ? "#1D9E75" : "#444",
          }}
        >
          {status === "done" ? "✓" : index + 1}
        </div>

        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: agent.bgColor }}
        >
          {agent.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#f1f1f1] leading-tight">{agent.label}</p>
          <p className="text-[11px] text-[#555] mt-0.5 truncate">{agent.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {status === "running" && elapsed !== undefined && (
            <span className="text-[11px] text-[#555]">{elapsed}s</span>
          )}
          <div
            className={`w-2 h-2 rounded-full ${cfg.pulse ? "animate-pulse" : ""}`}
            style={{ background: cfg.dotColor }}
          />
          <span className="text-[11px] text-[#555]">{cfg.label}</span>
        </div>
      </div>
    </div>
  );
}
