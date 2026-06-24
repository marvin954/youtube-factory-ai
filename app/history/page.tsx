"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import ScoreRing from "@/components/ui/ScoreRing";

const statusColor: Record<string, "green" | "red" | "amber" | "gray"> = {
  complete: "green",
  error: "red",
  running: "amber",
  partial: "amber",
  idle: "gray",
};

export default function HistoryPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/runs")
      .then((r) => r.json())
      .then((d) => { setRuns(d.runs || []); setLoading(false); });
  }, []);

  const total = runs.length;
  const completed = runs.filter((r) => r.status === "complete").length;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#f1f1f1] mb-1">Run History</h1>
        <p className="text-[13px] text-[#555]">All production runs across the factory</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total runs", value: total },
          { label: "Completed", value: completed, color: "#1D9E75" },
          { label: "Success rate", value: total ? Math.round((completed / total) * 100) + "%" : "—", color: "#EF9F27" },
        ].map((k) => (
          <div key={k.label} className="bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3">
            <p className="text-[11px] text-[#555] uppercase tracking-wider mb-2">{k.label}</p>
            <p className="text-2xl font-medium" style={{ color: k.color || "#f1f1f1" }}>{k.value}</p>
          </div>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-[#555] text-[13px]">Loading history...</div>}

      {!loading && runs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#333] text-[14px] mb-4">No production runs yet</p>
          <Link href="/dashboard" className="text-[#E24B4A] text-[13px] hover:underline">Start your first production →</Link>
        </div>
      )}

      <div className="space-y-3">
        {runs.map((run) => (
          <Link key={run.id} href={`/library?run=${run.id}`}>
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-all group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-[14px] font-medium text-[#f1f1f1]">{run.niche}</h3>
                    <Badge color={statusColor[run.status] || "gray"}>{run.status}</Badge>
                  </div>
                  <p className="text-[12px] text-[#444] font-mono">{run.id.slice(0, 16)}...</p>
                  <p className="text-[11px] text-[#444] mt-1.5">
                    {new Date(run.created_at).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[11px] text-[#444] mb-1">Progress</p>
                    <div className="w-24 h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${run.progress}%`,
                          background: run.status === "complete" ? "#1D9E75" : run.status === "error" ? "#E24B4A" : "#EF9F27",
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-[#444] mt-0.5 text-right">{run.progress}%</p>
                  </div>
                  <span className="text-[#333] group-hover:text-[#666] transition-colors text-sm">→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
